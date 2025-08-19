import { TreePine, Flame, CheckCircle, Leaf, BookOpen, Dumbbell, Heart, Droplets, PaintbrushVertical, Users } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const iconMap = {
  leaf: Leaf,
  "book-open": BookOpen,
  dumbbell: Dumbbell,
  heart: Heart,
  tint: Droplets,
  "paint-brush": PaintbrushVertical,
  users: Users,
} as const;

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
  habits: Array<{
    id: string;
    name: string;
    icon: string;
    completedToday: boolean;
    category: string;
  }>;
}

export default function ImpactDashboard({ 
  totalImpact, 
  currentStreak, 
  longestStreak,
  todayCompletions, 
  totalHabits,
  habits 
}: ImpactDashboardProps) {
  const progressPercentage = totalHabits > 0 ? (todayCompletions / totalHabits) * 100 : 0;
  
  // Prepare data for the donut chart with safety checks
  const safeHabits = habits || [];
  const completedHabits = safeHabits.filter(habit => habit.completedToday);
  const remainingHabits = totalHabits - todayCompletions;
  
  // Color palette for different habit categories
  const categoryColors = {
    wellness: "#22c55e", // green
    fitness: "#3b82f6", // blue
    learning: "#a855f7", // purple
    productivity: "#f97316", // orange
    creativity: "#ec4899", // pink
    social: "#eab308", // yellow
  } as const;
  
  const chartData = [
    ...completedHabits.map((habit, index) => ({
      name: habit.name,
      value: 1,
      color: categoryColors[habit.category as keyof typeof categoryColors] || "#22c55e",
      icon: habit.icon,
      completed: true,
      habit
    })),
    ...(remainingHabits > 0 ? [{
      name: "Remaining",
      value: remainingHabits,
      color: "#e5e7eb", // light gray
      icon: "circle",
      completed: false,
      habit: null
    }] : [])
  ];

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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-md">
              <span className="text-lg">🌳</span>
              <div>
                <p className="text-lg font-bold text-forest-success" data-testid="text-total-trees">
                  {totalImpact.treesPlanted}
                </p>
                <p className="text-xs text-forest-text/70">trees planted</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-md">
              <span className="text-lg">🐋</span>
              <div>
                <p className="text-lg font-bold text-blue-600" data-testid="text-total-plastic">
                  {totalImpact.plasticRescued}
                </p>
                <p className="text-xs text-forest-text/70">bottles rescued</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
              <span className="text-lg">☁️</span>
              <div>
                <p className="text-lg font-bold text-gray-600" data-testid="text-total-carbon">
                  {totalImpact.carbonOffset}kg
                </p>
                <p className="text-xs text-forest-text/70">CO₂ offset</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-2 bg-emerald-50 rounded-md">
              <span className="text-lg">🌿</span>
              <div>
                <p className="text-lg font-bold text-green-600" data-testid="text-total-kelp">
                  {totalImpact.kelpPlanted}
                </p>
                <p className="text-xs text-forest-text/70">kelp planted</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-2 bg-cyan-50 rounded-md">
              <span className="text-lg">💧</span>
              <div>
                <p className="text-lg font-bold text-blue-500" data-testid="text-total-water">
                  {totalImpact.waterProvided}L
                </p>
                <p className="text-xs text-forest-text/70">water provided</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-2 bg-yellow-50 rounded-md">
              <span className="text-lg">🐝</span>
              <div>
                <p className="text-lg font-bold text-yellow-600" data-testid="text-total-bees">
                  {totalImpact.beesSponsored}
                </p>
                <p className="text-xs text-forest-text/70">bees protected</p>
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

        {/* Habits Completed Today - Donut Chart */}
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
          
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-3xl font-bold text-forest-primary mb-2" data-testid="text-today-progress">
                {todayCompletions}/{totalHabits}
              </p>
              
              {/* Completed Habits List */}
              {completedHabits.length > 0 && (
                <div className="space-y-1">
                  {completedHabits.slice(0, 3).map((habit) => {
                    const IconComponent = iconMap[habit.icon as keyof typeof iconMap] || Leaf;
                    return (
                      <div key={habit.id} className="flex items-center space-x-2">
                        <div 
                          className="p-1.5 rounded-organic" 
                          style={{ backgroundColor: `${categoryColors[habit.category as keyof typeof categoryColors] || "#22c55e"}20` }}
                        >
                          <IconComponent 
                            className="h-3 w-3" 
                            style={{ color: categoryColors[habit.category as keyof typeof categoryColors] || "#22c55e" }}
                          />
                        </div>
                        <span className="text-xs text-forest-text/70 truncate">{habit.name}</span>
                      </div>
                    );
                  })}
                  {completedHabits.length > 3 && (
                    <p className="text-xs text-forest-text/50">+{completedHabits.length - 3} more</p>
                  )}
                </div>
              )}
            </div>
            
            {/* Donut Chart */}
            <div className="w-20 h-20 relative">
              {totalHabits > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={35}
                      paddingAngle={chartData.length > 1 ? 2 : 0}
                      dataKey="value"
                      startAngle={90}
                      endAngle={450}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-xs text-gray-400">No habits</span>
                </div>
              )}
              
              {/* Center completion percentage */}
              {totalHabits > 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-forest-text">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
