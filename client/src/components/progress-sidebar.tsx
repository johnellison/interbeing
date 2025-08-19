import { BarChart3, MapPin, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

interface ProgressSidebarProps {
  weeklyProgress: Array<{
    day: string;
    completed: number;
    total: number;
    isToday: boolean;
  }>;
  monthlyTrees: number;
  co2Offset: number;
}

interface RecentImpactEntry {
  id: string;
  habitName: string;
  impactAction: 'plant_tree' | 'rescue_plastic' | 'offset_carbon';
  impactAmount: number;
  completedAt: string;
}

const impactConfig = {
  plant_tree: { emoji: "🌳", color: "text-green-600", unit: "tree" },
  rescue_plastic: { emoji: "🐋", color: "text-blue-600", unit: "bottle" },
  offset_carbon: { emoji: "☁️", color: "text-gray-600", unit: "kg CO₂" }
};

function RecentImpactTimeline() {
  const { data: recentImpact } = useQuery<RecentImpactEntry[]>({
    queryKey: ["/api/recent-impact"],
  });

  const formatImpactValue = (action: string, amount: number) => {
    return amount.toString();
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (!recentImpact || recentImpact.length === 0) {
    return (
      <div className="text-center py-8" data-testid="empty-recent-impact">
        <div className="text-4xl mb-2">🌱</div>
        <p className="text-sm text-forest-text/70">Complete habits to see your impact timeline!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="recent-impact-timeline">
      {recentImpact.slice(0, 5).map((entry) => {
        const config = impactConfig[entry.impactAction] || { emoji: '🌱', color: 'text-green-600', unit: 'impact' };
        
        return (
          <div
            key={entry.id}
            className="flex items-center space-x-3 p-3 bg-forest-bg/50 rounded-organic"
            data-testid={`recent-impact-${entry.id}`}
          >
            <div className="text-lg">{config.emoji}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-forest-text truncate">
                {entry.habitName}
              </p>
              <p className={`text-xs ${config.color}`}>
                {formatImpactValue(entry.impactAction, entry.impactAmount)} {config.unit}
              </p>
            </div>
            <div className="text-xs text-forest-text/60">
              {getTimeAgo(entry.completedAt)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ProgressSidebar({ weeklyProgress, monthlyTrees, co2Offset }: ProgressSidebarProps) {
  const weeklyCompletion = weeklyProgress.length > 0 
    ? Math.round((weeklyProgress.reduce((acc, day) => acc + day.completed, 0) / 
       weeklyProgress.reduce((acc, day) => acc + day.total, 0)) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Weekly Progress Chart */}
      <div className="forest-card p-6" data-testid="card-weekly-progress">
        <h3 className="text-lg font-semibold text-forest-text mb-4">This Week's Progress</h3>
        
        <div className="space-y-3">
          {weeklyProgress.map((day, index) => (
            <div
              key={`${day.day}-${index}`}
              className={`flex items-center justify-between ${
                day.isToday ? 'bg-forest-success/10 p-2 rounded-organic' : ''
              }`}
              data-testid={`progress-day-${day.day.toLowerCase()}`}
            >
              <span className="text-sm font-medium text-forest-text">
                {day.day}
              </span>
              <div className="flex space-x-1">
                {Array.from({ length: day.total }, (_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-sm ${
                      i < day.completed 
                        ? 'bg-forest-success' 
                        : 'bg-forest-text/20'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-forest-text/70">
                {day.completed}/{day.total}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-forest-secondary/20">
          <p className="text-sm text-forest-text/70">
            Weekly completion: <span className="font-semibold text-forest-accent" data-testid="text-weekly-completion">{weeklyCompletion}%</span>
          </p>
        </div>
      </div>

      {/* Recent Impact Timeline */}
      <div className="forest-card p-6" data-testid="card-recent-impact">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-forest-text">Recent Impact</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { window.location.href = "/impact-timeline"; }}
            className="text-xs text-forest-primary hover:text-forest-primary/80"
            data-testid="button-view-timeline"
          >
            View more →
          </Button>
        </div>
        
        <RecentImpactTimeline />

        <div className="mt-4 pt-4 border-t border-forest-secondary/20">
          <p className="text-xs text-forest-text/70">
            🌍 Your habits create real environmental impact through 1ClickImpact's verified partners and transparent tracking.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="forest-card p-6" data-testid="card-quick-actions">
        <h3 className="text-lg font-semibold text-forest-text mb-4">Quick Actions</h3>
        
        <div className="space-y-3">
          <Button
            variant="ghost"
            className="w-full justify-start p-3 hover:bg-forest-bg rounded-organic transition-colors"
            onClick={() => { window.location.href = "/analytics"; }}
            data-testid="button-view-habits"
          >
            <BarChart3 className="h-4 w-4 mr-3 text-forest-primary" />
            <span className="text-sm text-forest-text">View All Habits</span>
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start p-3 hover:bg-forest-bg rounded-organic transition-colors"
            onClick={() => { window.location.href = "/analytics"; }}
            data-testid="button-progress-report"
          >
            <TrendingUp className="h-4 w-4 mr-3 text-forest-accent" />
            <span className="text-sm text-forest-text">Progress Report</span>
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start p-3 hover:bg-forest-bg rounded-organic transition-colors"
            onClick={() => { window.location.href = "/analytics"; }}
            data-testid="button-impact-map"
          >
            <MapPin className="h-4 w-4 mr-3 text-forest-success" />
            <span className="text-sm text-forest-text">Impact Map</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
