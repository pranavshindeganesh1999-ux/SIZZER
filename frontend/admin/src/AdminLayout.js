import { Link, Outlet } from "react-router-dom";

function AdminLayout({ user, onLogout }) {
  return (
    <div className="admin-container">
      
      <aside className="sidebar">
        <h2>Admin Panel</h2>

        <Link to="/dashboard">Dashboard</Link>
        <Link to="/dashboard/users">Users</Link>
        <Link to="/dashboard/salons">Salons</Link>
        <Link to="/dashboard/appointments">Appointments</Link>

        <button onClick={onLogout} className="logout-btn">
          Logout
        </button>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>

    </div>
  );
}

export default AdminLayout;
