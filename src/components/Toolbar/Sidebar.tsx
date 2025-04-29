
import { LayoutDashboard, Play, BarChart, Utensils, User } from "lucide-react";
import NavLink from "./NavLink";

const Sidebar = () => (
  <aside className="w-60 bg-white border-r h-screen hidden md:flex flex-col py-6 fixed">
    <div className="px-4 mb-6">
      <h1 className="text-xl font-bold">FitFlow AI</h1>
    </div>
    <nav className="flex flex-col gap-1 px-2">
      <NavLink to="/dashboard" icon={<LayoutDashboard className="h-5 w-5" />} label="Dashboard" />
      <NavLink to="/start-workout" icon={<Play className="h-5 w-5" />} label="Start" />
      <NavLink to="/tracker" icon={<BarChart className="h-5 w-5" />} label="Tracker" />
      <NavLink to="/nutrition" icon={<Utensils className="h-5 w-5" />} label="Nutrition" />
      <NavLink to="/profile" icon={<User className="h-5 w-5" />} label="Profile" />
    </nav>
  </aside>
);

export default Sidebar;
