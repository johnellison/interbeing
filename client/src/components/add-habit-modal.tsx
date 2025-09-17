import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { X, Leaf, BookOpen, Dumbbell, Heart, PaintbrushVertical, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const iconOptions = [
  { value: "leaf", icon: Leaf, label: "Leaf" },
  { value: "book-open", icon: BookOpen, label: "Book" },
  { value: "dumbbell", icon: Dumbbell, label: "Dumbbell" },
  { value: "heart", icon: Heart, label: "Heart" },
  { value: "paint-brush", icon: PaintbrushVertical, label: "Paint Brush" },
  { value: "users", icon: Users, label: "Users" },
];

const categoryOptions = [
  { value: "wellness", label: "🧘 Wellness" },
  { value: "fitness", label: "💪 Fitness" },
  { value: "learning", label: "📚 Learning" },
  { value: "productivity", label: "⚡ Productivity" },
  { value: "creativity", label: "🎨 Creativity" },
  { value: "social", label: "👥 Social" },
];

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHabitAdded: () => void;
}

export default function AddHabitModal({ isOpen, onClose, onHabitAdded }: AddHabitModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "wellness",
    icon: "leaf",
    impactAction: "plant_tree" as 'plant_tree' | 'rescue_plastic' | 'offset_carbon' | 'plant_kelp' | 'provide_water' | 'sponsor_bees',
    impactAmount: 1,
  });
  const [selectedIcon, setSelectedIcon] = useState("leaf");

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/habits", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Habit Created!",
        description: "Your new habit has been added successfully.",
      });
      setFormData({ name: "", description: "", category: "wellness", icon: "leaf", impactAction: "plant_tree", impactAmount: 1 });
      setSelectedIcon("leaf");
      onHabitAdded();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create habit. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a habit name.",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate({ ...formData, icon: selectedIcon });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { 
        ...prev, 
        [field]: field === 'impactAmount' ? parseInt(value) || 1 : value 
      };
      
      // When impact action changes to bees, suggest 20 as default amount
      if (field === 'impactAction' && value === 'sponsor_bees' && prev.impactAmount === 1) {
        newData.impactAmount = 20;
      }
      
      return newData;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" data-testid="modal-add-habit">
      <div className="bg-card border border-border rounded-3xl p-8 mx-4 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-foreground">Add New Habit</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1"
            data-testid="button-close-modal"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Habit Name
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g., Morning Meditation"
              className="rounded-xl"
              data-testid="input-habit-name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Brief description of your habit..."
              rows={3}
              className="rounded-xl"
              data-testid="input-habit-description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Category
            </label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
              <SelectTrigger className="rounded-organic" data-testid="select-habit-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Icon
            </label>
            <div className="grid grid-cols-6 gap-2">
              {iconOptions.map(({ value, icon: Icon, label }) => (
                <Button
                  key={value}
                  type="button"
                  variant={selectedIcon === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedIcon(value)}
                  className="p-2 rounded-xl"
                  data-testid={`button-icon-${value}`}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Environmental Impact Action
            </label>
            <Select value={formData.impactAction} onValueChange={(value: any) => handleInputChange("impactAction", value)}>
              <SelectTrigger className="rounded-organic" data-testid="select-impact-action">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="plant_tree">🌳 Plant Trees</SelectItem>
                <SelectItem value="rescue_plastic">🐋 Rescue Plastic</SelectItem>
                <SelectItem value="offset_carbon">☁️ Offset Carbon</SelectItem>
                <SelectItem value="plant_kelp">🌿 Plant Kelp</SelectItem>
                <SelectItem value="provide_water">💧 Provide Clean Water</SelectItem>
                <SelectItem value="sponsor_bees">🐝 Protect Bees</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Impact Amount Per Completion
            </label>
            <Input
              type="number"
              min="1"
              value={formData.impactAmount}
              onChange={(e) => handleInputChange("impactAmount", e.target.value)}
              placeholder="1"
              className="rounded-xl"
              data-testid="input-impact-amount"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.impactAction === 'plant_tree' && 'Number of trees to plant'}
              {formData.impactAction === 'rescue_plastic' && 'Number of plastic bottles to rescue'}
              {formData.impactAction === 'offset_carbon' && 'Kilograms of CO₂ to offset'}
              {formData.impactAction === 'plant_kelp' && 'Number of kelp plants to grow'}
              {formData.impactAction === 'provide_water' && 'Liters of clean water to provide'}
              {formData.impactAction === 'sponsor_bees' && 'Number of bees to protect (work in increments of 20 - £0.36 per 20 bees through EarthLungs Kenya)'}
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-xl"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 bg-primary text-primary-foreground rounded-3xl hover:bg-primary/90"
              data-testid="button-create-habit"
            >
              {createMutation.isPending ? "Creating..." : "Create Habit"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
