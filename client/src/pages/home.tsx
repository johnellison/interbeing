import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sprout, Settings, Menu, Home as HomeIcon, BarChart, Globe, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import ImpactDashboard from "@/components/impact-dashboard";
import HabitCard from "@/components/habit-card";
import AddHabitModal from "@/components/add-habit-modal";
import ImpactCelebration from "@/components/impact-celebration";
import ProgressSidebar from "@/components/progress-sidebar";

interface DashboardData {
  user: {
    id: string;
    currentStreak: number;
    longestStreak: number;
    totalImpact: {
      treesPlanted: number;
      plasticRescued: number;
      carbonOffset: number;
      kelpPlanted: number;
      waterProvided: number;
      beesSponsored: number;
    };
  };
  habits: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    streak: number;
    impactAction: 'plant_tree' | 'rescue_plastic' | 'offset_carbon' | 'plant_kelp' | 'provide_water' | 'sponsor_bees';
    impactAmount: number;
    totalImpactEarned: number;
    completedToday: boolean;
  }>;
  todayCompletions: number;
  totalHabits: number;
  weeklyProgress: Array<{
    day: string;
    completed: number;
    total: number;
    isToday: boolean;
  }>;
  monthlyTrees: number;
  co2Offset: number;
}

export default function Home() {
  const [isAddHabitModalOpen, setIsAddHabitModalOpen] = useState(false);
  const [showImpactCelebration, setShowImpactCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{
    habitName: string;
    streak: number;
    impactAction: 'plant_tree' | 'rescue_plastic' | 'offset_carbon' | 'plant_kelp' | 'provide_water' | 'sponsor_bees';
    impactAmount: number;
    projectInfo?: {
      name: string;
      description: string;
      location: string;
      imageUrl?: string;
      registryLink?: string;
    };
  } | null>(null);

  const { data: dashboardData, isLoading, refetch } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
  });

  const handleHabitComplete = (habitName: string, streak: number, impactAction: 'plant_tree' | 'rescue_plastic' | 'offset_carbon' | 'plant_kelp' | 'provide_water' | 'sponsor_bees', impactAmount: number, projectInfo?: any) => {
    setCelebrationData({ habitName, streak, impactAction, impactAmount, projectInfo });
    setShowImpactCelebration(true);
    refetch(); // Refresh dashboard data
  };

  const handleCloseCelebration = () => {
    setShowImpactCelebration(false);
    setCelebrationData(null);
  };

  const handleHabitAdded = () => {
    setIsAddHabitModalOpen(false);
    refetch(); // Refresh dashboard data
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-forest-bg flex items-center justify-center">
        <div className="text-center">
          <Sprout className="h-12 w-12 text-forest-primary animate-pulse mx-auto mb-4" />
          <p className="text-forest-text">Loading your habits...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-forest-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-forest-text">Failed to load dashboard data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-forest-bg font-nunito text-forest-text">
      {/* Navigation Header */}
      <nav className="bg-forest-primary text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <Sprout className="h-8 w-8 text-forest-secondary" />
              </div>
              <h1 className="text-xl font-bold font-inter" data-testid="app-title">
                Interbeing
              </h1>
            </div>
            
            <div className="hidden md:flex items-center space-x-1">
              {/* Main Navigation Links */}
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 px-3 py-2 rounded-organic hover:bg-forest-secondary/20 transition-colors text-white"
                data-testid="nav-dashboard"
              >
                <HomeIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Dashboard</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = "/analytics"}
                className="flex items-center space-x-2 px-3 py-2 rounded-organic hover:bg-forest-secondary/20 transition-colors text-white"
                data-testid="nav-analytics"
              >
                <BarChart className="h-4 w-4" />
                <span className="text-sm font-medium">Analytics</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = "/impact-map"}
                className="flex items-center space-x-2 px-3 py-2 rounded-organic hover:bg-forest-secondary/20 transition-colors text-white"
                data-testid="nav-impact-map"
              >
                <Globe className="h-4 w-4" />
                <span className="text-sm font-medium">Impact Map</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = "/impact-timeline"}
                className="flex items-center space-x-2 px-3 py-2 rounded-organic hover:bg-forest-secondary/20 transition-colors text-white"
                data-testid="nav-timeline"
              >
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Timeline</span>
              </Button>
              
              {/* Divider */}
              <div className="h-6 w-px bg-forest-secondary/30 mx-2"></div>
              
              {/* User Actions */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = "/api/logout"}
                className="text-sm hover:bg-forest-secondary/20 transition-colors text-white px-3 py-2"
                data-testid="button-logout"
              >
                Sign Out
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="p-2 rounded-organic hover:bg-forest-secondary/20 transition-colors"
                data-testid="button-settings"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2 rounded-organic hover:bg-forest-secondary/20 transition-colors"
              data-testid="button-mobile-menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Environmental Impact Dashboard */}
        <ImpactDashboard 
          totalImpact={dashboardData.user.totalImpact}
          currentStreak={dashboardData.user.currentStreak}
          longestStreak={dashboardData.user.longestStreak}
          todayCompletions={dashboardData.todayCompletions}
          totalHabits={dashboardData.totalHabits}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Daily Habits Section */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-forest-text">Today's Habits</h2>
              <Button
                onClick={() => setIsAddHabitModalOpen(true)}
                className="bg-forest-primary text-white px-4 py-2 rounded-organic hover:bg-forest-primary/90 transition-colors"
                data-testid="button-add-habit"
              >
                <span className="text-lg mr-2">+</span>
                <span>Add Habit</span>
              </Button>
            </div>

            {/* Habit Cards */}
            <div className="space-y-4">
              {dashboardData.habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onComplete={handleHabitComplete}
                  onRefresh={refetch}
                />
              ))}
              
              {dashboardData.habits.length === 0 && (
                <div className="text-center py-12" data-testid="empty-habits-state">
                  <Sprout className="h-16 w-16 text-forest-secondary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-forest-text mb-2">
                    No habits yet!
                  </h3>
                  <p className="text-forest-text/70 mb-4">
                    Start your environmental journey by adding your first habit.
                  </p>
                  <Button
                    onClick={() => setIsAddHabitModalOpen(true)}
                    className="bg-forest-primary text-white px-6 py-2 rounded-organic hover:bg-forest-primary/90"
                    data-testid="button-add-first-habit"
                  >
                    Add Your First Habit
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Progress Sidebar */}
          <ProgressSidebar
            weeklyProgress={dashboardData.weeklyProgress}
            monthlyTrees={dashboardData.monthlyTrees}
            co2Offset={dashboardData.co2Offset}
          />
        </div>
      </main>

      {/* Modals */}
      <AddHabitModal
        isOpen={isAddHabitModalOpen}
        onClose={() => setIsAddHabitModalOpen(false)}
        onHabitAdded={handleHabitAdded}
      />

      <ImpactCelebration
        isOpen={showImpactCelebration}
        onClose={handleCloseCelebration}
        data={celebrationData}
      />
    </div>
  );
}
