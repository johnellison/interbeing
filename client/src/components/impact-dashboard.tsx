import { Network, Flame, CheckCircle } from "lucide-react";

interface ImpactDashboardProps {
  treesPlanted: number;
  currentStreak: number;
  longestStreak: number;
  todayCompletions: number;
  totalHabits: number;
}

export default function ImpactDashboard({ 
  treesPlanted, 
  currentStreak, 
  longestStreak,
  todayCompletions, 
  totalHabits 
}: ImpactDashboardProps) {
  const progressPercentage = totalHabits > 0 ? (todayCompletions / totalHabits) * 100 : 0;

  return (
    <section className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Trees Planted */}
        <div className="forest-card p-6" data-testid="card-trees-planted">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-forest-success/20 rounded-organic">
                <Network className="h-8 w-8 text-forest-success" />
              </div>
              <div>
                <h3 className="font-semibold text-forest-text">Trees Planted</h3>
                <p className="text-sm text-forest-text/70">Total Environmental Impact</p>
              </div>
            </div>
          </div>
          <p className="text-3xl font-bold text-forest-success" data-testid="text-total-trees">
            {treesPlanted}
          </p>
          <p className="text-sm text-forest-text/70 mt-2">
            +{Math.floor(treesPlanted * 0.05) || 1} this week
          </p>
        </div>

        {/* Habit Streak */}
        <div className="forest-card p-6" data-testid="card-current-streak">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-forest-accent/20 rounded-organic">
                <Flame className="h-8 w-8 text-forest-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-forest-text">Current Streak</h3>
                <p className="text-sm text-forest-text/70">Consecutive Days</p>
              </div>
            </div>
          </div>
          <p className="text-3xl font-bold text-forest-accent" data-testid="text-current-streak">
            {currentStreak}
          </p>
          <p className="text-sm text-forest-text/70 mt-2">
            Personal best: {longestStreak} days
          </p>
        </div>

        {/* Habits Completed Today */}
        <div className="forest-card p-6" data-testid="card-today-progress">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-forest-primary/20 rounded-organic">
                <CheckCircle className="h-8 w-8 text-forest-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-forest-text">Today's Progress</h3>
                <p className="text-sm text-forest-text/70">Completed Habits</p>
              </div>
            </div>
          </div>
          <p className="text-3xl font-bold text-forest-primary" data-testid="text-today-progress">
            {todayCompletions}/{totalHabits}
          </p>
          <div className="w-full bg-forest-secondary/30 rounded-full h-2 mt-3">
            <div 
              className="bg-forest-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progressPercentage}%` }}
              data-testid="progress-bar"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
