
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Play, BarChart, Utensils, User } from "lucide-react";

const linkClass = ({ isActive }:{isActive:boolean}) =>
  `flex items-center gap-2 py-2 px-3 rounded
   ${isActive ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-blue-600"}`;

const Sidebar = () => (
  <aside className="w-60 bg-white border-r h-screen hidden md:flex flex-col py-6 fixed">
    <div className="px-4 mb-6">
      <h1 className="text-xl font-bold">FitFlow AI</h1>
    </div>
    <nav className="flex flex-col gap-1 px-2">
      <NavLink to="/dashboard" className={linkClass}><LayoutDashboard className="h-5 w-5"/>Dashboard</NavLink>
      <NavLink to="/start-workout" className={linkClass}><Play className="h-5 w-5"/>Start</NavLink>
      <NavLink to="/tracker" className={linkClass}><BarChart className="h-5 w-5"/>Tracker</NavLink>
      <NavLink to="/nutrition" className={linkClass}><Utensils className="h-5 w-5"/>Nutrition</NavLink>
      <NavLink to="/profile" className={linkClass}><User className="h-5 w-5"/>Profile</NavLink>
    </nav>
  </aside>
);

export default Sidebar;
