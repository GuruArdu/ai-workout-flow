
import React from "react";
import { NavLink as RouterNavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavLink = ({ to, icon, label }: NavLinkProps) => {
  return (
    <RouterNavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors",
          "hover:bg-gray-100",
          isActive ? "text-blue-600 bg-blue-50" : "text-gray-600"
        )
      }
    >
      {icon}
      <span>{label}</span>
    </RouterNavLink>
  );
};

export default NavLink;
