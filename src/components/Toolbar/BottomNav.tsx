
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Play, BarChart, Utensils, User } from "lucide-react";

const linkClass = ({ isActive }:{isActive:boolean}) =>
  `flex flex-col items-center gap-1 text-xs
   ${isActive ? "text-blue-600" : "text-gray-600 hover:text-blue-600"}`;

const BottomNav = () => (
  <nav className="fixed bottom-0 w-full bg-white border-t flex md:hidden justify-between px-4 py-2 z-10">
    <NavLink to="/dashboard" className={linkClass}><LayoutDashboard className="h-5 w-5"/>Dashboard</NavLink>
    <NavLink to="/start-workout" className={linkClass}><Play className="h-5 w-5"/>Start</NavLink>
    <NavLink to="/tracker" className={linkClass}><BarChart className="h-5 w-5"/>Tracker</NavLink>
    <NavLink to="/nutrition" className={linkClass}><Utensils className="h-5 w-5"/>Nutrition</NavLink>
    <NavLink to="/profile" className={linkClass}><User className="h-5 w-5"/>Profile</NavLink>
  </nav>
);

export default BottomNav;
