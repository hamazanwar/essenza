import React from "react";
import AdminNavbar from "../bars/AdminNavbar";
import AdminFooter from "../bars/AdminFooter";

function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <AdminNavbar />

      <h1 className="dash">ESSENZA ADMIN DASHBOARD</h1>

      <h1 className="maintainance">Under Maintainance</h1>

      <AdminFooter />
    </div>
  );
}

export default AdminDashboard;
