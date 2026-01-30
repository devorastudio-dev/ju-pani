import { LinkButton } from "@/components/ui/link-button";

type AdminNavProps = {
  current?: "dashboard" | "produtos" | "pedidos";
};

const navItems: { href: string; label: string; id: AdminNavProps["current"] }[] = [
  { href: "/admin/dashboard", label: "Dashboard", id: "dashboard" },
  { href: "/admin/produtos", label: "Produtos", id: "produtos" },
];

export const AdminNav = ({ current }: AdminNavProps) => (
  <div className="flex flex-wrap gap-2">
    {navItems.map((item) => (
      <LinkButton
        key={item.href}
        href={item.href}
        variant={current === item.id ? "primary" : "secondary"}
      >
        {item.label}
      </LinkButton>
    ))}
  </div>
);
