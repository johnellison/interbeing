import { BarChart3, MapPin, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

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

      {/* Environmental Impact Summary */}
      <div className="forest-card p-6" data-testid="card-environmental-impact">
        <h3 className="text-lg font-semibold text-forest-text mb-4">Impact Actions</h3>
        
        {/* Environmental Impact Image */}
        <img 
          src="https://images.unsplash.com/photo-1569163139394-de44cb6ff663?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200" 
          alt="Environmental conservation representing multiple impact actions" 
          className="rounded-organic w-full h-32 object-cover mb-4"
          data-testid="img-environmental-impact"
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-forest-success">🌳</span>
              <span className="text-sm text-forest-text">Trees planted</span>
            </div>
            <span className="font-semibold text-forest-success" data-testid="text-sidebar-trees">
              Global
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-blue-500">🌊</span>
              <span className="text-sm text-forest-text">Ocean cleanup</span>
            </div>
            <span className="font-semibold text-blue-500" data-testid="text-sidebar-ocean">
              Active
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">💨</span>
              <span className="text-sm text-forest-text">Carbon capture</span>
            </div>
            <span className="font-semibold text-gray-500" data-testid="text-sidebar-carbon">
              Direct Air
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-green-600">💰</span>
              <span className="text-sm text-forest-text">Donations</span>
            </div>
            <span className="font-semibold text-green-600" data-testid="text-sidebar-donations">
              Verified NGOs
            </span>
          </div>
        </div>

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
            data-testid="button-view-habits"
          >
            <BarChart3 className="h-4 w-4 mr-3 text-forest-primary" />
            <span className="text-sm text-forest-text">View All Habits</span>
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start p-3 hover:bg-forest-bg rounded-organic transition-colors"
            data-testid="button-progress-report"
          >
            <TrendingUp className="h-4 w-4 mr-3 text-forest-accent" />
            <span className="text-sm text-forest-text">Progress Report</span>
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start p-3 hover:bg-forest-bg rounded-organic transition-colors"
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
