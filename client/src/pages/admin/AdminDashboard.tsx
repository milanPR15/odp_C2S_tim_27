import { PageHeader, NodeBadge, Spinner, ErrorBox, StatCard } from "../../components/ui/UI";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { healthApi } from "../../api_services/health/HealthAPIService";
import type { BackendTargetHealth, HealthNode } from "../../api_services/health/IHealthAPIService";

export default function AdminDashboard() {
  const [dbNodes, setDbNodes] = useState<HealthNode[]>([] as HealthNode[]);
  const [backendNodes, setBackendNodes] = useState<BackendTargetHealth[]>([] as BackendTargetHealth[]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const fetchHealth = async () => {
    setLoading(true);
    setError("");
    try {
      const [dbRes, backendRes] = await Promise.all([
        healthApi.getDbHealth(),
        healthApi.getBackendHealth(),
      ]);

      if (!dbRes.success) {
        setError(dbRes.message || "Failed to load DB health");
        setDbNodes([] as HealthNode[]);
      } else {
        setDbNodes(dbRes.data ?? [] as HealthNode[]);
      }

      if (!backendRes.success) {
        setError((current) => current || backendRes.message || "Failed to load backend health");
        setBackendNodes([] as BackendTargetHealth[]);
      } else {
        setBackendNodes(backendRes.data?.targets ?? [] as BackendTargetHealth[]);
      }
    } catch {
      setError("Failed to load dashboard health");
      setDbNodes([] as HealthNode[]);
      setBackendNodes([] as BackendTargetHealth[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const id = setInterval(fetchHealth, 10000);
    return () => clearInterval(id);
  }, []);

  const healthyBackendNodes = backendNodes.filter((node) => node.healthy).length;
  const backendModeLabel = backendNodes.length > 1 ? `${backendNodes.length} targets` : "single backend";

  return (
    <div>
      <PageHeader eyebrow="Admin" title="Dashboard" />

      <p className="text-white/30 text-sm mb-6">Cluster DB node health and backend target availability, auto-refreshing every 10s.</p>

      <div className="mb-6">
        {loading && (
          <div className="p-6 bg-white/3 border border-white/6 rounded-2xl flex items-center gap-3">
            <Spinner />
            <div className="text-white/60">Loading dashboard health...</div>
          </div>
        )}
        {error && <ErrorBox message={error} />}

        {!loading && dbNodes && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dbNodes.map((n) => (
              <div key={n.name} className="bg-white/3 border border-white/6 rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-white/30 uppercase tracking-widest font-mono">{n.name}</p>
                    <h3 className="text-lg font-semibold text-white mt-1">{n.host}:{n.port}</h3>
                    <p className="text-sm text-white/40 mt-2">Last check: {n.lastCheck ? new Date(n.lastCheck).toLocaleString() : "-"}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {(() => {
                      const badgeStatus = n.status === "unreachable" ? "offline" : n.status;
                      return <NodeBadge status={badgeStatus} />;
                    })()}
                    <div className="text-xs text-white/40">{n.name.toLocaleUpperCase() == "MASTER" ? "Writes" : "Reads"}</div>
                    <div className="text-sm text-white font-medium">{n.successfulWrites} / {n.failedWrites}</div>
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  <StatCard label="Successful" value={String(n.successfulWrites)} />
                  <StatCard label="Failed" value={String(n.failedWrites)} color="text-red-400" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && backendNodes && (
          <div className="mt-8">
            <div className="flex items-end justify-between gap-3 mb-4">
              <div>
                <p className="text-xs text-white/30 uppercase tracking-widest font-mono">Backend nodes</p>
                <h2 className="text-lg font-semibold text-white mt-1">{backendModeLabel}</h2>
                <p className="text-sm text-white/40 mt-1">Healthy targets: {healthyBackendNodes} / {backendNodes.length || 1}</p>
              </div>
              <div className="text-xs text-white/30 font-mono">Source: load balancer status</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {backendNodes.map((node) => (
                <div key={node.id} className="bg-white/3 border border-white/6 rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-white/30 uppercase tracking-widest font-mono">{node.id}</p>
                      <h3 className="text-lg font-semibold text-white mt-1">{node.url}</h3>
                      <p className="text-sm text-white/40 mt-2">Last probe: {node.lastProbeAt ? new Date(node.lastProbeAt).toLocaleString() : "-"}</p>
                    </div>
                    <NodeBadge status={node.healthy ? "healthy" : "offline"} />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <StatCard label="Connections" value={String(node.activeConnections)} />
                    <StatCard label="Weight" value={String(node.weight)} />
                  </div>
                  {node.lastProbeError && (
                    <p className="mt-4 text-xs text-red-300/80 border border-red-500/15 bg-red-500/5 rounded-xl px-3 py-2">
                      {node.lastProbeError}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link 
          to="/admin/users" 
          className="group block p-6 border border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-md"
        >
          <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-cyan-300 transition-colors">Manage Users</h2>
          <p className="text-white/60 text-sm">View, edit, or remove users from the system.</p>
        </Link>
        <Link 
          to="/admin/audit-logs" 
          className="group block p-6 border border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-md"
        >
          <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-cyan-300 transition-colors">Audit Logs</h2>
          <p className="text-white/60 text-sm">View system audit logs and activities.</p>
        </Link>
      </div>
    </div>
  );
}
