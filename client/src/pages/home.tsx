import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import ImpactDashboard from "@/components/impact-dashboard";
import HabitCard from "@/components/habit-card";
import AddHabitModal from "@/components/add-habit-modal";
import EditHabitModal from "@/components/edit-habit-modal";
import ImpactCelebration from "@/components/impact-celebration";
import ProgressSidebar from "@/components/progress-sidebar";
import Navigation from "@/components/navigation";

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
    completions: Array<{
      habitId: string;
      habitName: string;
      category: string;
    }>;
  }>;
  monthlyTrees: number;
  co2Offset: number;
}

export default function Home() {
  const [isAddHabitModalOpen, setIsAddHabitModalOpen] = useState(false);
  const [isEditHabitModalOpen, setIsEditHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<any>(null);
  const [showImpactCelebration, setShowImpactCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{
    habitId: string;
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
    celebrationMessage?: {
      title: string;
      message: string;
      motivationalNote: string;
      progressInsight?: string;
    };
  } | null>(null);

  const { data: dashboardData, isLoading, refetch } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
  });

  const handleHabitComplete = (habitId: string, habitName: string, streak: number, impactAction: 'plant_tree' | 'rescue_plastic' | 'offset_carbon' | 'plant_kelp' | 'provide_water' | 'sponsor_bees', impactAmount: number, projectInfo?: any, celebrationMessage?: any) => {
    setCelebrationData({ habitId, habitName, streak, impactAction, impactAmount, projectInfo, celebrationMessage });
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

  const handleEditHabit = (habit: any) => {
    setEditingHabit(habit);
    setIsEditHabitModalOpen(true);
  };

  const handleHabitUpdated = () => {
    setIsEditHabitModalOpen(false);
    setEditingHabit(null);
    refetch(); // Refresh dashboard data
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Sprout className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-foreground">Loading your habits...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground">Failed to load dashboard data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation currentPage="/" onAddHabitClick={() => setIsAddHabitModalOpen(true)} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
        {/* Mobile-First: Today's Habits Section */}
        <div className="block lg:hidden mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Today's Habits</h2>
          </div>

          {/* Habit Cards */}
          <div className="space-y-4">
            {dashboardData.habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onComplete={handleHabitComplete}
                onRefresh={refetch}
                onEdit={handleEditHabit}
              />
            ))}
            
            {dashboardData.habits.length === 0 && (
              <div className="text-center py-12" data-testid="empty-habits-state">
                <Sprout className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No habits yet!
                </h3>
                <p className="text-muted-foreground mb-4">
                  Start your environmental journey by adding your first habit.
                </p>
                <Button
                  onClick={() => setIsAddHabitModalOpen(true)}
                  className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 font-medium"
                  data-testid="button-add-first-habit"
                >
                  Add Your First Habit
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Environmental Impact Dashboard */}
        <ImpactDashboard 
          totalImpact={dashboardData.user.totalImpact}
          currentStreak={dashboardData.user.currentStreak}
          longestStreak={dashboardData.user.longestStreak}
          todayCompletions={dashboardData.todayCompletions}
          totalHabits={dashboardData.totalHabits}
          habits={dashboardData.habits}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Desktop: Daily Habits Section */}
          <div className="lg:col-span-2 hidden lg:block">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-foreground tracking-tight">Today's Habits</h2>
              <Button
                onClick={() => setIsAddHabitModalOpen(true)}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium"
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
                  onEdit={handleEditHabit}
                />
              ))}
              
              {dashboardData.habits.length === 0 && (
                <div className="text-center py-12" data-testid="empty-habits-state">
                  <Sprout className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No habits yet!
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Start your environmental journey by adding your first habit.
                  </p>
                  <Button
                    onClick={() => setIsAddHabitModalOpen(true)}
                    className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 font-medium"
                    data-testid="button-add-first-habit"
                  >
                    Add Your First Habit
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Progress Sidebar - Hidden on Mobile */}
          <div className="hidden lg:block">
            <ProgressSidebar
              weeklyProgress={dashboardData.weeklyProgress}
              monthlyTrees={dashboardData.monthlyTrees}
              co2Offset={dashboardData.co2Offset}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      <AddHabitModal
        isOpen={isAddHabitModalOpen}
        onClose={() => setIsAddHabitModalOpen(false)}
        onHabitAdded={handleHabitAdded}
      />

      <EditHabitModal
        isOpen={isEditHabitModalOpen}
        onClose={() => setIsEditHabitModalOpen(false)}
        habit={editingHabit}
        onHabitUpdated={handleHabitUpdated}
      />

      <ImpactCelebration
        isOpen={showImpactCelebration}
        onClose={handleCloseCelebration}
        data={celebrationData}
      />
    </div>
  );
}