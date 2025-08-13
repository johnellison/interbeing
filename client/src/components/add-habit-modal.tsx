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
      setFormData({ name: "", description: "", category: "wellness", icon: "leaf" });
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
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" data-testid="modal-add-habit">
      <div className="bg-white rounded-organic p-8 mx-4 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-forest-text">Add New Habit</h3>
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
            <label className="block text-sm font-medium text-forest-text mb-2">
              Habit Name
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="e.g., Morning Meditation"
              className="rounded-organic"
              data-testid="input-habit-name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-forest-text mb-2">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Brief description of your habit..."
              rows={3}
              className="rounded-organic"
              data-testid="input-habit-description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-forest-text mb-2">
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
            <label className="block text-sm font-medium text-forest-text mb-2">
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
                  className="p-2 rounded-organic"
                  data-testid={`button-icon-${value}`}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-organic"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 bg-forest-primary text-white rounded-organic hover:bg-forest-primary/90"
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
