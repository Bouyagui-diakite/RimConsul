"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  DashboardIcon,
  CardIcon,
  CalendarIcon,
  ChevronsLeft,
} from "@/components/icons";

type Leaf = { label: string; href: string };
type Item = {
  label: string;
  icon: (p: { size?: number }) => React.ReactNode;
  href?: string;
  children?: Leaf[];
};

const NAV: Item[] = [
  { label: "Dashboard", icon: DashboardIcon, href: "/tableau-de-bord" },
  {
    label: "Demande de cartes",
    icon: CardIcon,
    children: [
      { label: "Nouvelle demande", href: "/demandes/nouvelle" },
      { label: "Demandes effectuées", href: "/demandes" },
    ],
  },
  {
    label: "Prise de rendez-vous",
    icon: CalendarIcon,
    children: [
      { label: "Nouveau rendez-vous", href: "/rendez-vous/nouveau" },
      { label: "Historique", href: "/rendez-vous" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col border-r border-border bg-surface transition-all duration-200",
        collapsed ? "w-[76px]" : "w-[230px]",
      )}
    >
      {/* logo + collapse */}
      <div className="flex h-16 items-center justify-between px-5">
        {!collapsed && (
          <span className="font-display text-2xl font-bold tracking-tight">
            <span className="text-heading">Afro</span>
            <span className="text-primary">Consul</span>
          </span>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="rounded-md p-1 text-muted hover:bg-background hover:text-foreground"
          aria-label="Réduire le menu"
        >
          <ChevronsLeft
            size={20}
            className={cn("transition-transform", collapsed && "rotate-180")}
          />
        </button>
      </div>

      <nav className="mt-2 flex flex-col gap-1 px-3">
        {NAV.map((item) =>
          item.children ? (
            <NavGroup
              key={item.label}
              item={item}
              collapsed={collapsed}
              isActive={isActive}
            />
          ) : (
            <NavLink
              key={item.label}
              href={item.href!}
              icon={item.icon}
              label={item.label}
              active={isActive(item.href!)}
              collapsed={collapsed}
            />
          ),
        )}
      </nav>
    </aside>
  );
}

function NavLink({
  href,
  icon: Icon,
  label,
  active,
  collapsed,
}: {
  href: string;
  icon: (p: { size?: number }) => React.ReactNode;
  label: string;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-foreground hover:bg-background",
      )}
    >
      <span className="shrink-0">
        <Icon size={20} />
      </span>
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}

function NavGroup({
  item,
  collapsed,
  isActive,
}: {
  item: Item;
  collapsed: boolean;
  isActive: (href: string) => boolean;
}) {
  const childActive = item.children!.some((c) => isActive(c.href));
  const [open, setOpen] = useState(childActive);
  const Icon = item.icon;

  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        title={collapsed ? item.label : undefined}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          childActive && !open
            ? "text-primary"
            : "text-foreground hover:bg-background",
        )}
      >
        <span className="shrink-0">
          <Icon size={20} />
        </span>
        {!collapsed && (
          <>
            <span className="flex-1 truncate text-left">{item.label}</span>
            <ChevronIndicator open={open} />
          </>
        )}
      </button>

      {!collapsed && open && (
        <div className="mt-1 flex flex-col gap-1 pl-4">
          {item.children!.map((child) => {
            const active = isActive(child.href);
            return (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-primary font-medium text-primary-foreground shadow-sm"
                    : "text-muted hover:bg-background hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 shrink-0 rounded-full",
                    active ? "bg-primary-foreground" : "bg-muted-light",
                  )}
                />
                <span className="truncate">{child.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ChevronIndicator({ open }: { open: boolean }) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0 transition-transform", open && "rotate-180")}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
