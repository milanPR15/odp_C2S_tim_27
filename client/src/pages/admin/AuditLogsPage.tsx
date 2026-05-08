import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auditLogApi } from "../../api_services/auditLog/AuditLogAPIService";
import type { AuditLogDto } from "../../models/auditLog/AuditLogTypes";
import { ErrorBox, PageHeader, Spinner, Table, TableHead } from "../../components/ui/UI";

function formatDateTime(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleString();
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadLogs() {
      setIsLoading(true);
      setError("");

      const res = await auditLogApi.getAll();
      if (!active) return;

      if (!res.success) {
        setError(res.message || "Failed to load audit logs.");
        setIsLoading(false);
        return;
      }

      setLogs(res.data ?? []);
      setIsLoading(false);
    }

    loadLogs();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="Admin"
        title="Audit Logs"
      />

      <div className="mb-6">
        <Link to="/admin" className="text-sm text-cyan-400 hover:text-cyan-300 transition hover:underline">
          &larr; Back to Dashboard
        </Link>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorBox message={error} />
        </div>
      )}

      {isLoading ? (
        <div className="rounded-2xl border border-white/8 bg-white/3 min-h-56 flex items-center justify-center">
          <Spinner size={32} />
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-linear-to-b from-white/10 to-white/5 p-6 shadow-lg shadow-black/20 backdrop-blur-md overflow-x-auto">
          <Table>
            <TableHead columns={["ID", "Action", "Entity", "Entity ID", "User ID", "IP Address", "Timestamp", "Meta"]} />
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-white/50">
                    No audit logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-white/70">{log.id}</td>
                    <td className="px-4 py-3 font-medium text-cyan-300">{log.action}</td>
                    <td className="px-4 py-3 text-white/80">{log.entity}</td>
                    <td className="px-4 py-3 text-white/80">{log.entity_id}</td>
                    <td className="px-4 py-3 text-white/60">{log.user_id || "-"}</td>
                    <td className="px-4 py-3 text-white/60">{log.ip_address || "-"}</td>
                    <td className="px-4 py-3 text-white/70 text-sm whitespace-nowrap">{formatDateTime(log.created_at)}</td>
                    <td className="px-4 py-3 text-white/50 text-xs max-w-50 truncate" title={log.meta || ""}>
                      {log.meta || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
}