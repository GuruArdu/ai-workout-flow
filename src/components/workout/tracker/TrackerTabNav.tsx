
import { Button } from "@/components/ui/button";
import { Calendar, LineChart, TrendingUp } from "lucide-react";

export type TrackerTab = "calendar" | "volume" | "records";

interface TrackerTabNavProps {
  activeTab: TrackerTab;
  setActiveTab: (tab: TrackerTab) => void;
}

const TrackerTabNav = ({ activeTab, setActiveTab }: TrackerTabNavProps) => {
  return (
    <div className="flex space-x-1 rounded-lg bg-muted p-1 mb-6">
      <Button
        variant={activeTab === "calendar" ? "default" : "ghost"}
        className="flex-1 flex items-center justify-center gap-2"
        onClick={() => setActiveTab("calendar")}
      >
        <Calendar className="h-4 w-4" />
        Calendar
      </Button>
      <Button
        variant={activeTab === "volume" ? "default" : "ghost"}
        className="flex-1 flex items-center justify-center gap-2"
        onClick={() => setActiveTab("volume")}
      >
        <LineChart className="h-4 w-4" />
        Volume
      </Button>
      <Button
        variant={activeTab === "records" ? "default" : "ghost"}
        className="flex-1 flex items-center justify-center gap-2"
        onClick={() => setActiveTab("records")}
      >
        <TrendingUp className="h-4 w-4" />
        1RM Estimates
      </Button>
    </div>
  );
};

export default TrackerTabNav;
