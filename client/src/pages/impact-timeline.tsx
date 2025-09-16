import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import Navigation from "@/components/navigation";

interface TimelineEntry {
  id: string;
  habitName: string;
  impactAction: 'plant_tree' | 'rescue_plastic' | 'offset_carbon' | 'plant_kelp' | 'provide_water' | 'sponsor_bees';
  impactAmount: number;
  completedAt: string;
  streak: number;
}

const impactConfig = {
  plant_tree: {
    emoji: "🌳",
    title: "Tree Planted",
    color: "text-primary",
    bgColor: "bg-secondary/30",
    unit: "tree"
  },
  rescue_plastic: {
    emoji: "🐋",
    title: "Plastic Rescued",
    color: "text-primary",
    bgColor: "bg-secondary/30",
    unit: "bottle rescued"
  },
  offset_carbon: {
    emoji: "☁️",
    title: "Carbon Offset",
    color: "text-primary",
    bgColor: "bg-secondary/30",
    unit: "kg CO₂ offset"
  },
  plant_kelp: {
    emoji: "🌿",
    title: "Kelp Planted",
    color: "text-primary",
    bgColor: "bg-secondary/30",
    unit: "kelp plant"
  },
  provide_water: {
    emoji: "💧",
    title: "Clean Water Provided",
    color: "text-primary",
    bgColor: "bg-secondary/30",
    unit: "liter provided"
  },
  sponsor_bees: {
    emoji: "🐝",
    title: "Bees Protected",
    color: "text-primary",
    bgColor: "bg-secondary/30",
    unit: "bees protected"
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
    return amount.toString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-foreground">Loading your impact timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation currentPage="/impact-timeline" onAddHabitClick={() => {}} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2 tracking-tight">Your Environmental Impact Journey</h2>
          <p className="text-lg text-muted-foreground">
            Every habit you complete creates real change in the world
          </p>
        </div>

        {/* Timeline */}
        <div className="space-y-6" data-testid="impact-timeline">
          {timelineData && timelineData.length > 0 ? (
            timelineData.map((entry, index) => {
              const config = impactConfig[entry.impactAction as keyof typeof impactConfig];
              
              // Safety check for undefined config
              if (!config) {
                console.warn(`Unknown impact action: ${entry.impactAction}`);
                return null;
              }
              
              return (
                <div
                  key={entry.id}
                  className="relative"
                  data-testid={`timeline-entry-${entry.id}`}
                >
                  {/* Timeline line */}
                  {index < timelineData.length - 1 && (
                    <div className="absolute left-6 top-16 w-0.5 h-16 bg-gradient-to-b from-border to-border/30" />
                  )}
                  
                  {/* Timeline entry */}
                  <div className="flex items-start space-x-4">
                    {/* Timeline dot */}
                    <div className="flex-shrink-0 w-12 h-12 bg-secondary/30 rounded-full flex items-center justify-center border-2 border-background shadow-lg">
                      <span className="text-2xl">{config.emoji}</span>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 bg-card border border-border rounded-xl p-6 shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground" data-testid={`text-habit-name-${entry.id}`}>
                            {entry.habitName}
                          </h3>
                          <p className="text-sm font-medium text-primary" data-testid={`text-impact-type-${entry.id}`}>
                            {config.title}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(entry.completedAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <div className="px-3 py-1 bg-secondary/30 rounded-lg border border-border">
                            <span className="text-sm font-semibold text-foreground" data-testid={`text-impact-amount-${entry.id}`}>
                              {formatImpactValue(entry.impactAction, entry.impactAmount)} {config.unit}
                            </span>
                          </div>
                          <div className="flex items-center text-primary">
                            <span className="text-lg mr-1">🔥</span>
                            <span className="text-sm font-medium" data-testid={`text-streak-${entry.id}`}>
                              {entry.streak} day streak
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          Via Greenspark
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16" data-testid="empty-timeline-state">
              <Sparkles className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Your Impact Journey Starts Here
              </h3>
              <p className="text-muted-foreground mb-6">
                Complete habits to start creating real environmental impact!
              </p>
              <Button
                onClick={() => setLocation("/")}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 font-medium"
                data-testid="button-start-journey"
              >
                Start Your Journey
              </Button>
            </div>
          )}
        </div>

        {/* Impact Summary */}
        {timelineData && timelineData.length > 0 && (
          <div className="mt-12 bg-card border border-border rounded-xl p-6 text-center shadow-sm" data-testid="impact-summary">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Total Environmental Impact Created
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(impactConfig).map(([action, config]) => {
                const totalImpact = timelineData
                  .filter(entry => entry.impactAction === action)
                  .reduce((sum, entry) => sum + entry.impactAmount, 0);
                
                if (totalImpact === 0) return null;
                
                return (
                  <div key={action} className="p-4 bg-secondary/30 rounded-lg border border-border">
                    <div className="text-2xl mb-2">{config.emoji}</div>
                    <div className="text-xl font-bold text-primary">
                      {formatImpactValue(action, totalImpact)}
                    </div>
                    <div className="text-xs text-muted-foreground">
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