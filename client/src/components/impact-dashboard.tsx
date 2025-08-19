import { TreePine, Flame, CheckCircle } from "lucide-react";

interface ImpactDashboardProps {
  totalImpact: {
    treesPlanted: number;
    plasticRescued: number;
    carbonOffset: number;
    kelpPlanted: number;
    waterProvided: number;
    beesSponsored: number;
  };
  currentStreak: number;
  longestStreak: number;
  todayCompletions: number;
  totalHabits: number;
}

export default function ImpactDashboard({ 
  totalImpact, 
  currentStreak, 
  longestStreak,
  todayCompletions, 
  totalHabits 
}: ImpactDashboardProps) {
  const progressPercentage = totalHabits > 0 ? (todayCompletions / totalHabits) * 100 : 0;

  return (
    <section className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Environmental Impact Summary */}
        <div className="forest-card p-6" data-testid="card-environmental-impact">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-forest-success/20 rounded-organic">
                <TreePine className="h-8 w-8 text-forest-success" />
              </div>
              <div>
                <h3 className="font-semibold text-forest-text">Environmental Impact</h3>
                <p className="text-sm text-forest-text/70">Greenspark Actions</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-lg">🌳</span>
              <div>
                <p className="text-lg font-bold text-forest-success" data-testid="text-total-trees">
                  {totalImpact.treesPlanted}
                </p>
                <p className="text-xs text-forest-text/70">trees planted</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg">🐋</span>
              <div>
                <p className="text-lg font-bold text-blue-600" data-testid="text-total-plastic">
                  {totalImpact.plasticRescued}
                </p>
                <p className="text-xs text-forest-text/70">bottles rescued</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg">☁️</span>
              <div>
                <p className="text-lg font-bold text-gray-600" data-testid="text-total-carbon">
                  {totalImpact.carbonOffset}kg
                </p>
                <p className="text-xs text-forest-text/70">CO₂ offset</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg">🌿</span>
              <div>
                <p className="text-lg font-bold text-green-600" data-testid="text-total-kelp">
                  {totalImpact.kelpPlanted}
                </p>
                <p className="text-xs text-forest-text/70">kelp planted</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg">💧</span>
              <div>
                <p className="text-lg font-bold text-blue-500" data-testid="text-total-water">
                  {totalImpact.waterProvided}L
                </p>
                <p className="text-xs text-forest-text/70">water provided</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg">🐝</span>
              <div>
                <p className="text-lg font-bold text-yellow-600" data-testid="text-total-bees">
                  {totalImpact.beesSponsored}
                </p>
                <p className="text-xs text-forest-text/70">bees sponsored</p>
              </div>
            </div>
          </div>
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
