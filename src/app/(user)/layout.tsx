"use client";

import { Navbar } from "@/components/layout/navbar";

const userNavItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    label: "Jobs",
    href: "/jobs",
  },
  {
    label: "Agents",
    href: "/agents",
  },
];

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar items={userNavItems} title="AI Jobs Platform" />
      <main className="flex-1">{children}</main>
    </div>
  );
}
