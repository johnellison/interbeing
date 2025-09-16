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
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm" data-testid="card-environmental-impact">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-success/20 rounded-lg">
                <TreePine className="h-8 w-8 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Environmental Impact</h3>
                <p className="text-sm text-muted-foreground">Greenspark Actions</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="flex items-center space-x-2 p-3 bg-secondary/30 rounded-lg border border-border min-w-0">
              <span className="text-lg flex-shrink-0">🌳</span>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-bold text-success" data-testid="text-total-trees">
                  {totalImpact.treesPlanted}
                </p>
                <p className="text-xs text-muted-foreground leading-tight">trees<br />planted</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-3 bg-secondary/30 rounded-lg border border-border min-w-0">
              <span className="text-lg flex-shrink-0">🐋</span>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-bold text-blue-500" data-testid="text-total-plastic">
                  {totalImpact.plasticRescued}
                </p>
                <p className="text-xs text-muted-foreground leading-tight">bottles<br />rescued</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-3 bg-secondary/30 rounded-lg border border-border min-w-0">
              <span className="text-lg flex-shrink-0">☁️</span>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-bold text-muted-foreground" data-testid="text-total-carbon">
                  {totalImpact.carbonOffset}kg
                </p>
                <p className="text-xs text-muted-foreground leading-tight">CO₂<br />offset</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-3 bg-secondary/30 rounded-lg border border-border min-w-0">
              <span className="text-lg flex-shrink-0">🌿</span>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-bold text-emerald-500" data-testid="text-total-kelp">
                  {totalImpact.kelpPlanted}
                </p>
                <p className="text-xs text-muted-foreground leading-tight">kelp<br />planted</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-3 bg-secondary/30 rounded-lg border border-border min-w-0">
              <span className="text-lg flex-shrink-0">💧</span>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-bold text-cyan-500" data-testid="text-total-water">
                  {totalImpact.waterProvided}L
                </p>
                <p className="text-xs text-muted-foreground leading-tight">water<br />provided</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-3 bg-secondary/30 rounded-lg border border-border min-w-0">
              <span className="text-lg flex-shrink-0">🐝</span>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-bold text-primary" data-testid="text-total-bees">
                  {totalImpact.beesSponsored}
                </p>
                <p className="text-xs text-muted-foreground leading-tight">bees<br />protected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Habit Streak */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm" data-testid="card-current-streak">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary/20 rounded-lg">
                <Flame className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Current Streak</h3>
                <p className="text-sm text-muted-foreground">Consecutive Days</p>
              </div>
            </div>
          </div>
          <p className="text-3xl font-bold text-primary" data-testid="text-current-streak">
            {currentStreak}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Personal best: {longestStreak} days
          </p>
        </div>

        {/* Habits Completed Today - Donut Chart */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm" data-testid="card-today-progress">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary/20 rounded-lg">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Today's Progress</h3>
                <p className="text-sm text-muted-foreground">Completed Habits</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-3xl font-bold text-primary mb-2" data-testid="text-today-progress">
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
                          className="p-1.5 rounded-lg" 
                          style={{ backgroundColor: `${categoryColors[habit.category as keyof typeof categoryColors] || "#22c55e"}20` }}
                        >
                          <IconComponent 
                            className="h-3 w-3" 
                            style={{ color: categoryColors[habit.category as keyof typeof categoryColors] || "#22c55e" }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground truncate">{habit.name}</span>
                      </div>
                    );
                  })}
                  {completedHabits.length > 3 && (
                    <p className="text-xs text-muted-foreground/70">+{completedHabits.length - 3} more</p>
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
                <div className="w-full h-full rounded-full bg-muted flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">No habits</span>
                </div>
              )}
              
              {/* Center completion percentage */}
              {totalHabits > 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-foreground">
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
