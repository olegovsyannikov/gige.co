    "use client";

import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
}

interface NavbarProps {
  items: NavItem[];
  title: string;
}

export function Navbar({ items, title }: NavbarProps) {
  const pathname = usePathname();

  return (
    <div className="border-b">
      <div className="container flex h-16 items-center px-4">
        <div className="flex items-center space-x-6">
          <Link href="/" className="font-bold">
            {title}
          </Link>
          <nav className="flex items-center space-x-4">
            {items.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={pathname.startsWith(item.href) ? "default" : "ghost"}
                  className="text-sm font-medium"
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </div>
  );
}
