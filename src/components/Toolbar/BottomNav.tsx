
import { LayoutDashboard, Play, BarChart, Utensils, User } from "lucide-react";
import NavLink from "./NavLink";

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 w-full bg-white border-t flex md:hidden justify-between px-4 py-2">
      <NavLink to="/dashboard" icon={<LayoutDashboard className="h-5 w-5" />} label="Dashboard" />
      <NavLink to="/start-workout" icon={<Play className="h-5 w-5" />} label="Start" />
      <NavLink to="/tracker" icon={<BarChart className="h-5 w-5" />} label="Tracker" />
      <NavLink to="/nutrition" icon={<Utensils className="h-5 w-5" />} label="Profile" />
      <NavLink to="/profile" icon={<User className="h-5 w-5" />} label="Profile" />
    </nav>
  );
};

export default BottomNav;
