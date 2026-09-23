"use client";
import AdminDashboard from "../page";

export default function Admin${sub.charAt(0).toUpperCase() + sub.slice(1)}Page() {
  return <AdminDashboard initialTab="${sub}" />;
}
