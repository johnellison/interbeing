import { useState, useRef } from "react";
import { format } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { 
  Leaf, 
  BookOpen, 
  Dumbbell, 
  Heart, 
  Droplets, 
  PaintbrushVertical, 
  Users,
  Check,
  Edit3 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { apiRequest } from "@/lib/queryClient";

const iconMap = {
  leaf: Leaf,
  "book-open": BookOpen,
  dumbbell: Dumbbell,
  tint: Droplets,
  "paint-brush": PaintbrushVertical,
  users: Users,
} as const;

// Updated to match the exact colors used in the donut chart
const categoryColors = {
  wellness: { bg: "#22c55e", text: "#15803d", bgLight: "#dcfce7" }, // green
  fitness: { bg: "#3b82f6", text: "#1d4ed8", bgLight: "#dbeafe" }, // blue
  learning: { bg: "#a855f7", text: "#7c3aed", bgLight: "#f3e8ff" }, // purple
  productivity: { bg: "#f97316", text: "#ea580c", bgLight: "#fed7aa" }, // orange
  creativity: { bg: "#ec4899", text: "#db2777", bgLight: "#fce7f3" }, // pink
  social: { bg: "#eab308", text: "#ca8a04", bgLight: "#fef3c7" }, // yellow
} as const;

const getImpactUnit = (action: string) => {
  switch (action) {
    case 'plant_tree': return 'trees';
    case 'rescue_plastic': return 'bottles';
    case 'offset_carbon': return 'kg CO₂';
    case 'plant_kelp': return 'kelp plants';
    case 'provide_water': return 'liters';
    case 'sponsor_bees': return 'bees supported';
    default: return 'units';
  }
};

const getImpactActionText = (action: string) => {
  switch (action) {
    case 'plant_tree': return 'planted';
    case 'rescue_plastic': return 'rescued';
    case 'offset_carbon': return 'offset';
    case 'plant_kelp': return 'planted';
    case 'provide_water': return 'provided';
    case 'sponsor_bees': return 'protected';
    default: return 'created';
  }
};

const getImpactEmoji = (action: string) => {
  switch (action) {
    case 'plant_tree': return '🌳';
    case 'rescue_plastic': return '🐋';
    case 'offset_carbon': return '☁️';
    case 'plant_kelp': return '🌿';
    case 'provide_water': return '💧';
    case 'sponsor_bees': return '🐝';
    default: return '🌍';
  }
};

interface HabitCardProps {
  habit: {
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
  };
  selectedDate: Date;
  onComplete: (habitId: string, habitName: string, streak: number, impactAction: 'plant_tree' | 'rescue_plastic' | 'offset_carbon' | 'plant_kelp' | 'provide_water' | 'sponsor_bees', impactAmount: number, projectInfo?: any, celebrationMessage?: any) => void;
  onRefresh: () => void;
  onEdit?: (habit: any) => void;
}

export default function HabitCard({ habit, selectedDate, onComplete, onRefresh, onEdit }: HabitCardProps) {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isOptimisticComplete, setIsOptimisticComplete] = useState(habit.completedToday);
  
  // Swipe gesture state
  const [translateX, setTranslateX] = useState(0);
  const [isSwipe, setIsSwipe] = useState(false);
  const swipeRef = useRef<{ startX: number; startY: number; pointerId: number | null }>({
    startX: 0,
    startY: 0,
    pointerId: null
  });

  const IconComponent = iconMap[habit.icon as keyof typeof iconMap] || Leaf;
  const categoryColor = categoryColors[habit.category as keyof typeof categoryColors] || categoryColors.wellness;

  const toggleMutation = useMutation({
    mutationFn: async () => {
      const dateParam = format(selectedDate, 'yyyy-MM-dd');
      const response = await apiRequest("POST", `/api/habits/${habit.id}/toggle?date=${dateParam}`);
      return response.json();
    },
    onMutate: () => {
      // Optimistic update
      setIsOptimisticComplete(!isOptimisticComplete);
    },
    onSuccess: (data) => {
      if (data.completed && data.impactCreated) {
        onComplete(habit.id, habit.name, data.streak, habit.impactAction, habit.impactAmount, data.projectInfo, data.celebrationMessage);
        // Celebration modal now handles all feedback - no need for toast notifications
      } else if (data.completed) {
        onComplete(habit.id, habit.name, data.streak, habit.impactAction, habit.impactAmount, undefined, data.celebrationMessage);
        // Celebration modal now handles all feedback - no need for toast notifications
      } else {
        // Only show uncompletion toast on desktop, keep mobile seamless
        if (!isMobile) {
          toast({
            title: "Habit Uncompleted",
            description: `Removed completion for "${habit.name}"`,
          });
        }
      }
      onRefresh();
    },
    onError: (error) => {
      // Revert optimistic update
      setIsOptimisticComplete(habit.completedToday);
      toast({
        title: "Error",
        description: "Failed to update habit completion",
        variant: "destructive",
      });
    },
  });

  const handleToggle = () => {
    toggleMutation.mutate();
  };

  // Swipe gesture handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    // Don't start swipe on interactive elements
    if ((e.target as HTMLElement).closest('button,[role="button"],a,input,textarea')) {
      return;
    }

    // Only activate on touch devices
    if (navigator.maxTouchPoints === 0) return;

    swipeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      pointerId: e.pointerId
    };
    
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (swipeRef.current.pointerId !== e.pointerId) return;
    if (toggleMutation.isPending) return;

    const dx = e.clientX - swipeRef.current.startX;
    const dy = e.clientY - swipeRef.current.startY;

    // Start swiping if horizontal movement exceeds threshold and is greater than vertical
    if (!isSwipe && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
      setIsSwipe(true);
      e.preventDefault();
    }

    if (isSwipe) {
      e.preventDefault();
      e.stopPropagation();
      
      // Clamp translation between -72px and +72px
      const clampedX = Math.max(-72, Math.min(72, dx));
      setTranslateX(clampedX);
    }
  };

  const handlePointerEnd = (e: React.PointerEvent) => {
    if (swipeRef.current.pointerId !== e.pointerId) return;

    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);

    if (isSwipe) {
      // Check if swipe threshold was met
      if (translateX >= 56) {
        // Swipe right - complete habit
        handleToggle();
      } else if (translateX <= -56 && onEdit) {
        // Swipe left - edit habit
        onEdit(habit);
      }

      // Reset state
      setIsSwipe(false);
      setTranslateX(0);
    }

    swipeRef.current.pointerId = null;
  };

  const handlePointerCancel = () => {
    setIsSwipe(false);
    setTranslateX(0);
    swipeRef.current.pointerId = null;
  };

  return (
    <div 
      className="relative overflow-hidden"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerCancel}
      data-testid={`card-habit-${habit.id}`}
    >
      {/* Background layers for swipe feedback */}
      <div 
        className="absolute inset-0 bg-green-500 flex items-center justify-start pl-6"
        style={{ 
          opacity: Math.max(0, translateX) / 72,
          pointerEvents: 'none'
        }}
        data-testid={`bg-complete-${habit.id}`}
      >
        <Check className="h-6 w-6 text-white" />
        <span className="ml-2 text-white font-medium">Complete</span>
      </div>
      
      <div 
        className="absolute inset-0 bg-gray-600 flex items-center justify-end pr-6"
        style={{ 
          opacity: Math.max(0, -translateX) / 72,
          pointerEvents: 'none'
        }}
        data-testid={`bg-edit-${habit.id}`}
      >
        <span className="mr-2 text-white font-medium">Edit</span>
        <Edit3 className="h-6 w-6 text-white" />
      </div>

      {/* Main card content */}
      <div 
        className="forest-card p-6 hover:shadow-xl transition-all duration-300 border-l-4 relative z-10" 
        style={{ 
          borderLeftColor: categoryColor.bg,
          transform: `translateX(${translateX}px)`,
          transition: isSwipe ? 'none' : 'transform 0.2s ease-out'
        }}
      >
      <div className="flex items-start justify-between w-full">
        {/* Left section: Checkbox + Icon + Content */}
        <div className="flex items-start space-x-4 flex-1 min-w-0">
          <div className="flex-shrink-0 mt-1">
            <Button
              onClick={handleToggle}
              disabled={toggleMutation.isPending}
              className={`habit-checkbox ${
                isOptimisticComplete ? 'completed' : 'incomplete'
              }`}
              data-testid={`button-toggle-${habit.id}`}
            >
              {isOptimisticComplete && <Check className="h-4 w-4" />}
            </Button>
          </div>
          
          <div 
            className="p-2 rounded-organic flex-shrink-0 mt-1"
            style={{ backgroundColor: `${categoryColor.bg}20` }}
          >
            <IconComponent 
              className="h-5 w-5" 
              style={{ color: categoryColor.text }}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-forest-text text-base leading-tight mb-1" data-testid={`text-habit-name-${habit.id}`}>
              {habit.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              {habit.streak} day streak
            </p>
            <p className="text-sm font-medium text-green-400 flex items-center" data-testid={`text-habit-impact-${habit.id}`}>
              {getImpactEmoji(habit.impactAction)} {getImpactActionText(habit.impactAction).charAt(0).toUpperCase() + getImpactActionText(habit.impactAction).slice(1)} {habit.impactAmount} {getImpactUnit(habit.impactAction)}
            </p>
          </div>
        </div>
        
        {/* Right section: Edit button */}
        <div className="flex-shrink-0">
          {onEdit && (
            <Button
              onClick={() => onEdit(habit)}
              variant="outline"
              size="sm"
              className="md:p-2 p-3 min-h-[44px] min-w-[44px]"
              data-testid={`button-edit-${habit.id}`}
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
