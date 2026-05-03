import { PageHeader } from "../../components/ui/UI";
import { Link } from "react-router-dom";

// TODO: Replace with your domain-specific admin dashboard content
export default function AdminDashboard() {
  return (
    <div>
      <PageHeader eyebrow="Admin" title="Dashboard" />
      <p className="text-white/30 text-sm mb-6">Admin dashboard content goes here.</p>
      
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
