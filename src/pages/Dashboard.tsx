
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell, LineChart, ArrowRight, Calendar, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Welcome to FitFlow AI</h1>
        <p className="text-gray-500">Your personalized workout companion</p>
      </header>
      
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Start Workout Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="bg-blue-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              Start a Workout
            </CardTitle>
            <CardDescription className="text-blue-100">
              Generate a custom workout plan
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>Create a personalized workout based on:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
              <li>Target muscle groups</li>
              <li>Available equipment</li>
              <li>Your fitness level</li>
              <li>Time available</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full flex justify-between items-center"
              onClick={() => navigate("/start-workout")}
            >
              Create Workout
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
        
        {/* Workout Tracker Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="bg-indigo-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Workout Tracker
            </CardTitle>
            <CardDescription className="text-indigo-100">
              View and analyze your progress
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p>Track your fitness journey with:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700">
              <li>Workout history</li>
              <li>Performance metrics</li>
              <li>Volume charts</li>
              <li>Personal records</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full flex justify-between items-center"
              onClick={() => navigate("/tracker")}
            >
              View Progress
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Progress Summary */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
        <div className="bg-white rounded-lg border shadow-sm p-4">
          <div className="text-center p-6">
            <p className="text-gray-500">Complete your first workout to start tracking your progress!</p>
            <Button 
              variant="ghost" 
              className="mt-2"
              onClick={() => navigate("/start-workout")}
            >
              Start Now
            </Button>
          </div>
        </div>
      </section>
      
      {/* Quick Actions */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-auto flex-col py-6 gap-2">
            <Calendar className="h-6 w-6" />
            <span>Schedule</span>
          </Button>
          <Button variant="outline" className="h-auto flex-col py-6 gap-2">
            <Dumbbell className="h-6 w-6" />
            <span>Exercises</span>
          </Button>
          <Button variant="outline" className="h-auto flex-col py-6 gap-2">
            <TrendingUp className="h-6 w-6" />
            <span>Goals</span>
          </Button>
          <Button variant="outline" className="h-auto flex-col py-6 gap-2">
            <LineChart className="h-6 w-6" />
            <span>Analytics</span>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
