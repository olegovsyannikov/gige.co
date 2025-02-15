"use client";

import { Navbar } from "@/components/layout/navbar";

const adminNavItems = [
  {
    label: "Dashboard",
    href: "/admin",
  },
  {
    label: "Jobs",
    href: "/admin/jobs",
  },
  {
    label: "Agents",
    href: "/admin/agents",
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar items={adminNavItems} title="Admin Panel" />
      <main className="flex-1">
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
