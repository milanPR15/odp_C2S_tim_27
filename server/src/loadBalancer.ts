import "dotenv/config";
import http, { IncomingHttpHeaders, IncomingMessage, RequestOptions, ServerResponse } from "http";

type StrategyName = "round-robin" | "weighted-round-robin" | "least-connections" | "ip-hash";

interface BackendTarget {
  id: string;
  rawUrl: string;
  host: string;
  port: number;
  weight: number;
  activeConnections: number;
  healthy: boolean;
  lastProbeAt: string;
  lastProbeError: string;
}

interface RequestMeta {
  method: string;
  path: string;
  headers: IncomingHttpHeaders;
}

const DEFAULT_TARGETS = [
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
];

const MAX_BODY_SIZE = 10 * 1024 * 1024;
const DEFAULT_HEALTH_PATH = "/api/v1/health/check";
const DEFAULT_HEALTH_INTERVAL_MS = 5000;
const DEFAULT_HEALTH_TIMEOUT_MS = 1500;

function parseNumber(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseTargets(): BackendTarget[] {
  const raw = process.env.LB_TARGETS?.trim();
  const items = raw ? raw.split(",").map((item) => item.trim()).filter(Boolean) : DEFAULT_TARGETS;

  if (items.length === 0) {
    throw new Error("LB_TARGETS must contain at least one target");
  }

  return items.map((target, index) => {
    const parsedUrl = new URL(target);
    const weightKey = `LB_WEIGHT_${index + 1}`;
    const configuredWeight = parseNumber(process.env[weightKey], 1);

    return {
      id: `api${index + 1}`,
      rawUrl: target,
      host: parsedUrl.hostname,
      port: parseNumber(parsedUrl.port, 80),
      weight: configuredWeight > 0 ? configuredWeight : 1,
      activeConnections: 0,
      healthy: true,
      lastProbeAt: "",
      lastProbeError: "",
    };
  });
}

function getStrategy(): StrategyName {
  const raw = process.env.LB_STRATEGY?.trim().toLowerCase();

  switch (raw) {
    case "round-robin":
    case "weighted-round-robin":
    case "least-connections":
    case "ip-hash":
      return raw;
    default:
      return "round-robin";
  }
}

function buildWeightedSchedule(targets: BackendTarget[]): BackendTarget[] {
  const schedule: BackendTarget[] = [];

  for (const target of targets) {
    for (let index = 0; index < target.weight; index += 1) {
      schedule.push(target);
    }
  }

  return schedule.length > 0 ? schedule : [...targets];
}

function getClientIp(request: IncomingMessage): string {
  const forwarded = request.headers["x-forwarded-for"];

  if (typeof forwarded === "string" && forwarded.trim().length > 0) {
    return forwarded.split(",")[0].trim();
  }

  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0];
  }

  return request.socket.remoteAddress ?? "127.0.0.1";
}

function hashString(input: string): number {
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash);
}

class StrategySelector {
  private readonly weightedSchedule: BackendTarget[];

  private roundRobinCursor = 0;

  private weightedCursor = 0;

  constructor(private readonly strategy: StrategyName, private readonly targets: BackendTarget[]) {
    this.weightedSchedule = buildWeightedSchedule(targets);
  }

  pick(request: IncomingMessage, activeTargets: BackendTarget[]): BackendTarget {
    switch (this.strategy) {
      case "round-robin":
        return this.pickRoundRobin(activeTargets);
      case "weighted-round-robin":
        return this.pickWeightedRoundRobin(activeTargets);
      case "least-connections":
        return this.pickLeastConnections(activeTargets);
      case "ip-hash":
        return this.pickIpHash(request, activeTargets);
      default:
        return this.pickRoundRobin(activeTargets);
    }
  }

  private pickRoundRobin(activeTargets: BackendTarget[]): BackendTarget {
    const target = activeTargets[this.roundRobinCursor % activeTargets.length];
    this.roundRobinCursor = (this.roundRobinCursor + 1) % activeTargets.length;
    return target;
  }

  private pickWeightedRoundRobin(activeTargets: BackendTarget[]): BackendTarget {
    const activeIds = new Set(activeTargets.map((target) => target.id));
    const activeWeightedSchedule = this.weightedSchedule.filter((target) => activeIds.has(target.id));
    const schedule = activeWeightedSchedule.length > 0 ? activeWeightedSchedule : activeTargets;
    const target = schedule[this.weightedCursor % schedule.length];
    this.weightedCursor = (this.weightedCursor + 1) % schedule.length;
    return target;
  }

  private pickLeastConnections(activeTargets: BackendTarget[]): BackendTarget {
    let selected = activeTargets[0];

    for (const target of activeTargets) {
      if (target.activeConnections < selected.activeConnections) {
        selected = target;
      }
    }

    return selected;
  }

  private pickIpHash(request: IncomingMessage, activeTargets: BackendTarget[]): BackendTarget {
    const clientIp = getClientIp(request);
    const index = hashString(clientIp) % activeTargets.length;
    return activeTargets[index];
  }
}

function getActiveTargets(targets: BackendTarget[]): BackendTarget[] {
  const healthyTargets = targets.filter((target) => target.healthy);
  return healthyTargets.length > 0 ? healthyTargets : [...targets];
}

function getHealthPath(): string {
  const value = process.env.LB_HEALTH_PATH?.trim();
  if (!value) {
    return DEFAULT_HEALTH_PATH;
  }

  return value.startsWith("/") ? value : `/${value}`;
}

function runProbe(target: BackendTarget, path: string, timeoutMs: number): Promise<void> {
  return new Promise<void>((resolve) => {
    const request = http.request(
      {
        hostname: target.host,
        port: target.port,
        method: "GET",
        path,
        timeout: timeoutMs,
      },
      (response) => {
        target.lastProbeAt = new Date().toISOString();
        target.healthy = (response.statusCode ?? 500) < 500;
        target.lastProbeError = target.healthy ? "" : `Probe status ${response.statusCode ?? 500}`;
        response.resume();
        resolve();
      },
    );

    request.on("timeout", () => {
      target.lastProbeAt = new Date().toISOString();
      target.healthy = false;
      target.lastProbeError = "Probe timeout";
      request.destroy();
      resolve();
    });

    request.on("error", (error) => {
      target.lastProbeAt = new Date().toISOString();
      target.healthy = false;
      target.lastProbeError = error.message;
      resolve();
    });

    request.end();
  });
}

function startHealthProbes(targets: BackendTarget[]): void {
  const path = getHealthPath();
  const intervalMs = parseNumber(process.env.LB_HEALTH_INTERVAL_MS, DEFAULT_HEALTH_INTERVAL_MS);
  const timeoutMs = parseNumber(process.env.LB_HEALTH_TIMEOUT_MS, DEFAULT_HEALTH_TIMEOUT_MS);

  const probeAll = async (): Promise<void> => {
    await Promise.all(targets.map((target) => runProbe(target, path, timeoutMs)));
  };

  void probeAll();
  const timer = setInterval(() => {
    void probeAll();
  }, Math.max(1000, intervalMs));

  timer.unref();
}

async function collectBody(request: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let totalSize = 0;

  return new Promise<Buffer>((resolve, reject) => {
    request.on("data", (chunk: Buffer | string) => {
      const normalizedChunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      totalSize += normalizedChunk.length;

      if (totalSize > MAX_BODY_SIZE) {
        reject(new Error("Payload too large"));
        request.destroy();
        return;
      }

      chunks.push(normalizedChunk);
    });

    request.on("end", () => resolve(Buffer.concat(chunks)));
    request.on("error", (error) => reject(error));
  });
}

function writeError(response: ServerResponse, status: number, message: string): void {
  if (!response.headersSent) {
    response.writeHead(status, {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "content-type, authorization",
    });
  }

  response.end(JSON.stringify({ error: message }));
}

function writeJson(response: ServerResponse, status: number, payload: unknown): void {
  response.writeHead(status, {
    "content-type": "application/json",
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "content-type, authorization",
  });
  response.end(JSON.stringify(payload));
}

function toRequestMeta(request: IncomingMessage): RequestMeta {
  return {
    method: request.method ?? "GET",
    path: request.url ?? "/",
    headers: request.headers,
  };
}

function createCandidateList(primary: BackendTarget, targets: BackendTarget[]): BackendTarget[] {
  return [primary, ...targets.filter((target) => target.id !== primary.id)];
}

function forwardOnce(target: BackendTarget, requestMeta: RequestMeta, body: Buffer, response: ServerResponse): Promise<void> {
  target.activeConnections += 1;

  const proxyHeaders: IncomingHttpHeaders = {
    ...requestMeta.headers,
    host: `${target.host}:${target.port}`,
    "content-length": String(body.length),
  };

  const options: RequestOptions = {
    hostname: target.host,
    port: target.port,
    method: requestMeta.method,
    path: requestMeta.path,
    headers: proxyHeaders,
  };

  return new Promise<void>((resolve, reject) => {
    let finalized = false;

    const cleanup = (): void => {
      if (!finalized) {
        finalized = true;
        target.activeConnections = Math.max(0, target.activeConnections - 1);
      }
    };

    const proxyRequest = http.request(options, (proxyResponse) => {
      response.writeHead(proxyResponse.statusCode ?? 502, proxyResponse.headers);
      proxyResponse.pipe(response, { end: true });

      proxyResponse.on("end", () => {
        cleanup();
        resolve();
      });

      proxyResponse.on("error", (error) => {
        cleanup();
        reject(error);
      });
    });

    proxyRequest.on("error", (error) => {
      cleanup();
      reject(error);
    });

    proxyRequest.write(body);
    proxyRequest.end();
  });
}

async function forwardWithFallback(
  candidates: BackendTarget[],
  requestMeta: RequestMeta,
  body: Buffer,
  response: ServerResponse,
): Promise<void> {
  let lastError: Error = new Error("No backend targets available");

  for (const candidate of candidates) {
    try {
      await forwardOnce(candidate, requestMeta, body, response);
      return;
    } catch (error) {
      if (error instanceof Error) {
        lastError = error;
      } else {
        lastError = new Error(String(error));
      }
    }
  }

  throw lastError ?? new Error("No backend available");
}

const targets = parseTargets();
const strategy = getStrategy();
const selector = new StrategySelector(strategy, targets);
const lbPort = parseNumber(process.env.LB_PORT, 4000);

startHealthProbes(targets);

const server = http.createServer(async (request, response) => {
  if (request.url === "/__lb/status") {
    writeJson(response, 200, {
      strategy,
      lbPort,
      targets: targets.map((target) => ({
        id: target.id,
        url: target.rawUrl,
        weight: target.weight,
        activeConnections: target.activeConnections,
        healthy: target.healthy,
        lastProbeAt: target.lastProbeAt,
        lastProbeError: target.lastProbeError,
      })),
    });
    return;
  }

  try {
    const body = await collectBody(request);
    const requestMeta = toRequestMeta(request);
    const activeTargets = getActiveTargets(targets);
    const primary = selector.pick(request, activeTargets);
    const candidates = createCandidateList(primary, activeTargets);

    await forwardWithFallback(candidates, requestMeta, body, response);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Load balancer request failed";

    if (message === "Payload too large") {
      writeError(response, 413, message);
      return;
    }

    writeError(response, 502, message);
  }
});

server.listen(lbPort, () => {
  console.log(`[LoadBalancer] Listening on http://localhost:${lbPort}`);
  console.log(`[LoadBalancer] Strategy: ${strategy}`);
  console.log(`[LoadBalancer] Targets: ${targets.map((target) => target.rawUrl).join(", ")}`);
});
