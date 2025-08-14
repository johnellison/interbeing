import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface TimelineEntry {
  id: string;
  habitName: string;
  impactAction: 'plant_tree' | 'clean_ocean' | 'capture_carbon' | 'donate_money';
  impactAmount: number;
  completedAt: string;
  streak: number;
}

const impactConfig = {
  plant_tree: {
    emoji: "🌳",
    title: "Tree Planted",
    color: "text-green-600",
    bgColor: "bg-green-50",
    unit: "tree"
  },
  clean_ocean: {
    emoji: "🌊",
    title: "Ocean Cleaned",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    unit: "lb waste removed"
  },
  capture_carbon: {
    emoji: "💨",
    title: "Carbon Captured",
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    unit: "lb CO₂ captured"
  },
  donate_money: {
    emoji: "💰",
    title: "Donation Made",
    color: "text-green-600",
    bgColor: "bg-green-50",
    unit: "donated"
  }
};

export default function ImpactTimeline() {
  const [, setLocation] = useLocation();

  const { data: timelineData, isLoading } = useQuery<TimelineEntry[]>({
    queryKey: ["/api/impact-timeline"],
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const formatImpactValue = (action: string, amount: number) => {
    if (action === 'donate_money') {
      return `$${(amount / 100).toFixed(2)}`;
    }
    return amount.toString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-forest-bg flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-12 w-12 text-forest-primary animate-pulse mx-auto mb-4" />
          <p className="text-forest-text">Loading your impact timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-forest-bg font-nunito text-forest-text">
      {/* Navigation Header */}
      <nav className="bg-forest-primary text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/")}
                className="text-white hover:bg-forest-secondary/20 transition-colors"
                data-testid="button-back-home"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            
            <h1 className="text-xl font-bold font-inter" data-testid="page-title">
              Impact Timeline
            </h1>
            
            <div className="w-32"></div> {/* Spacer for centering */}
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-forest-text mb-2">Your Environmental Impact Journey</h2>
          <p className="text-lg text-forest-text/70">
            Every habit you complete creates real change in the world
          </p>
        </div>

        {/* Timeline */}
        <div className="space-y-6" data-testid="impact-timeline">
          {timelineData && timelineData.length > 0 ? (
            timelineData.map((entry, index) => {
              const config = impactConfig[entry.impactAction];
              
              return (
                <div
                  key={entry.id}
                  className="relative"
                  data-testid={`timeline-entry-${entry.id}`}
                >
                  {/* Timeline line */}
                  {index < timelineData.length - 1 && (
                    <div className="absolute left-6 top-16 w-0.5 h-16 bg-gradient-to-b from-forest-secondary to-forest-secondary/30" />
                  )}
                  
                  {/* Timeline entry */}
                  <div className="flex items-start space-x-4">
                    {/* Timeline dot */}
                    <div className={`flex-shrink-0 w-12 h-12 ${config.bgColor} rounded-full flex items-center justify-center border-2 border-white shadow-lg`}>
                      <span className="text-2xl">{config.emoji}</span>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 forest-card p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-forest-text" data-testid={`text-habit-name-${entry.id}`}>
                            {entry.habitName}
                          </h3>
                          <p className={`text-sm font-medium ${config.color}`} data-testid={`text-impact-type-${entry.id}`}>
                            {config.title}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-forest-text/70 flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(entry.completedAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <div className={`px-3 py-1 ${config.bgColor} rounded-organic`}>
                            <span className={`text-sm font-semibold ${config.color}`} data-testid={`text-impact-amount-${entry.id}`}>
                              {formatImpactValue(entry.impactAction, entry.impactAmount)} {config.unit}
                            </span>
                          </div>
                          <div className="flex items-center text-forest-accent">
                            <span className="text-lg mr-1">🔥</span>
                            <span className="text-sm font-medium" data-testid={`text-streak-${entry.id}`}>
                              {entry.streak} day streak
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-xs text-forest-text/60">
                          Via 1ClickImpact
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16" data-testid="empty-timeline-state">
              <Sparkles className="h-16 w-16 text-forest-secondary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-forest-text mb-2">
                Your Impact Journey Starts Here
              </h3>
              <p className="text-forest-text/70 mb-6">
                Complete habits to start creating real environmental impact!
              </p>
              <Button
                onClick={() => setLocation("/")}
                className="bg-forest-primary text-white px-6 py-2 rounded-organic hover:bg-forest-primary/90"
                data-testid="button-start-journey"
              >
                Start Your Journey
              </Button>
            </div>
          )}
        </div>

        {/* Impact Summary */}
        {timelineData && timelineData.length > 0 && (
          <div className="mt-12 forest-card p-6 text-center" data-testid="impact-summary">
            <h3 className="text-lg font-semibold text-forest-text mb-4">
              Total Environmental Impact Created
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(impactConfig).map(([action, config]) => {
                const totalImpact = timelineData
                  .filter(entry => entry.impactAction === action)
                  .reduce((sum, entry) => sum + entry.impactAmount, 0);
                
                if (totalImpact === 0) return null;
                
                return (
                  <div key={action} className={`p-4 ${config.bgColor} rounded-organic`}>
                    <div className="text-2xl mb-2">{config.emoji}</div>
                    <div className={`text-xl font-bold ${config.color}`}>
                      {formatImpactValue(action, totalImpact)}
                    </div>
                    <div className="text-xs text-forest-text/70">
                      {config.unit}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}