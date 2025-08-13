import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { 
  Leaf, 
  BookOpen, 
  Dumbbell, 
  Heart, 
  Droplets, 
  PaintbrushVertical, 
  Users,
  Check 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const iconMap = {
  leaf: Leaf,
  "book-open": BookOpen,
  dumbbell: Dumbbell,
  heart: Heart,
  tint: Droplets,
  "paint-brush": PaintbrushVertical,
  users: Users,
} as const;

const categoryColors = {
  wellness: "bg-green-100 text-green-800",
  fitness: "bg-blue-100 text-blue-800", 
  learning: "bg-purple-100 text-purple-800",
  productivity: "bg-orange-100 text-orange-800",
  creativity: "bg-pink-100 text-pink-800",
  social: "bg-yellow-100 text-yellow-800",
} as const;

interface HabitCardProps {
  habit: {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    streak: number;
    treesEarned: number;
    completedToday: boolean;
  };
  onComplete: (habitName: string, streak: number, newTreeCount: number) => void;
  onRefresh: () => void;
}

export default function HabitCard({ habit, onComplete, onRefresh }: HabitCardProps) {
  const { toast } = useToast();
  const [isOptimisticComplete, setIsOptimisticComplete] = useState(habit.completedToday);

  const IconComponent = iconMap[habit.icon as keyof typeof iconMap] || Leaf;
  const categoryClass = categoryColors[habit.category as keyof typeof categoryColors] || categoryColors.wellness;

  const toggleMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/habits/${habit.id}/toggle`);
      return response.json();
    },
    onMutate: () => {
      // Optimistic update
      setIsOptimisticComplete(!isOptimisticComplete);
    },
    onSuccess: (data) => {
      if (data.completed && data.treePlanted) {
        onComplete(habit.name, data.streak, data.streak);
        toast({
          title: "🌳 Tree Planted!",
          description: `Completed "${habit.name}" and planted a tree!`,
        });
      } else if (data.completed) {
        toast({
          title: "✅ Habit Completed!",
          description: `Great job completing "${habit.name}"!`,
        });
      } else {
        toast({
          title: "Habit Uncompleted",
          description: `Removed completion for "${habit.name}"`,
        });
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

  return (
    <div className="forest-card p-6 hover:shadow-xl transition-all duration-300" data-testid={`card-habit-${habit.id}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
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
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-organic ${categoryClass.replace('text-', 'text-').replace('bg-', 'bg-')}/20`}>
                <IconComponent className={`h-5 w-5 ${categoryClass.split(' ')[1]}`} />
              </div>
              <div>
                <h3 className="font-semibold text-forest-text" data-testid={`text-habit-name-${habit.id}`}>
                  {habit.name}
                </h3>
                <p className="text-sm text-forest-text/70" data-testid={`text-habit-description-${habit.id}`}>
                  {habit.description}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-forest-accent" data-testid={`text-habit-streak-${habit.id}`}>
                🔥 {habit.streak} day streak
              </p>
              <p className="text-xs text-forest-text/70" data-testid={`text-habit-trees-${habit.id}`}>
                {isOptimisticComplete ? "🌳 Tree planted!" : "🌱 Ready to plant!"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
