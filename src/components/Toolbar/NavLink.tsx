
import React from "react";
import { NavLink as RRNavLink } from "react-router-dom";
import clsx from "clsx";

type Props = {
  to: string;
  icon: React.ReactNode;
  label: string;
};

const NavLink = ({ to, icon, label }: Props) => (
  <RRNavLink
    to={to}
    className={({ isActive }) =>
      clsx(
        "flex flex-col items-center gap-1 px-2 py-1 text-xs",
        isActive ? "text-blue-600" : "text-gray-600 hover:text-blue-500"
      )
    }
  >
    {icon}
    <span>{label}</span>
  </RRNavLink>
);

export default NavLink;
