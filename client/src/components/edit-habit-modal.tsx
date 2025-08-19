import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Leaf, 
  BookOpen, 
  Dumbbell, 
  Heart, 
  Droplets, 
  PaintbrushVertical, 
  Users 
} from "lucide-react";

const iconOptions = [
  { value: "leaf", icon: Leaf, label: "Leaf" },
  { value: "book-open", icon: BookOpen, label: "Book" },
  { value: "dumbbell", icon: Dumbbell, label: "Dumbbell" },
  { value: "heart", icon: Heart, label: "Heart" },
  { value: "tint", icon: Droplets, label: "Water Drop" },
  { value: "paint-brush", icon: PaintbrushVertical, label: "Paint Brush" },
  { value: "users", icon: Users, label: "Users" },
];

const categoryOptions = [
  { value: "wellness", label: "Wellness", color: "#22c55e" },
  { value: "fitness", label: "Fitness", color: "#3b82f6" },
  { value: "learning", label: "Learning", color: "#a855f7" },
  { value: "productivity", label: "Productivity", color: "#f97316" },
  { value: "creativity", label: "Creativity", color: "#ec4899" },
  { value: "social", label: "Social", color: "#eab308" },
];

const impactActionOptions = [
  { 
    value: "plant_tree", 
    label: "Plant Trees", 
    emoji: "🌳",
    description: "Support reforestation projects worldwide",
    suggestedAmount: 1
  },
  { 
    value: "rescue_plastic", 
    label: "Rescue Plastic", 
    emoji: "🐋",
    description: "Remove plastic bottles from oceans and waterways",
    suggestedAmount: 1
  },
  { 
    value: "offset_carbon", 
    label: "Offset Carbon", 
    emoji: "☁️",
    description: "Support verified carbon reduction projects",
    suggestedAmount: 1
  },
  { 
    value: "plant_kelp", 
    label: "Plant Kelp", 
    emoji: "🌿",
    description: "Restore marine ecosystems through kelp forests",
    suggestedAmount: 1
  },
  { 
    value: "provide_water", 
    label: "Provide Clean Water", 
    emoji: "💧",
    description: "Support clean water access projects",
    suggestedAmount: 1
  },
  { 
    value: "sponsor_bees", 
    label: "Protect Bees", 
    emoji: "🐝",
    description: "Support bee conservation and pollinator habitats",
    suggestedAmount: 20
  },
];

const habitSchema = z.object({
  name: z.string().min(1, "Habit name is required").max(100, "Name too long"),
  description: z.string().max(200, "Description too long").optional(),
  category: z.enum(["wellness", "fitness", "learning", "productivity", "creativity", "social"]),
  icon: z.string().min(1, "Please select an icon"),
  impactAction: z.enum(["plant_tree", "rescue_plastic", "offset_carbon", "plant_kelp", "provide_water", "sponsor_bees"]),
  impactAmount: z.number().min(1, "Impact amount must be at least 1").max(100, "Impact amount too large"),
});

type HabitFormData = z.infer<typeof habitSchema>;

interface EditHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: {
    id: string;
    name: string;
    description: string;
    category: string;
    icon: string;
    impactAction: string;
    impactAmount: number;
  } | null;
  onHabitUpdated: () => void;
}

export default function EditHabitModal({ isOpen, onClose, habit, onHabitUpdated }: EditHabitModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<HabitFormData>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "wellness",
      icon: "leaf",
      impactAction: "plant_tree",
      impactAmount: 1,
    },
  });

  // Reset form when habit changes
  useEffect(() => {
    if (habit) {
      form.reset({
        name: habit.name,
        description: habit.description,
        category: habit.category as any,
        icon: habit.icon,
        impactAction: habit.impactAction as any,
        impactAmount: habit.impactAmount,
      });
    }
  }, [habit, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: HabitFormData) => {
      if (!habit) throw new Error("No habit to update");
      
      const response = await apiRequest("PUT", `/api/habits/${habit.id}`, data);
      
      if (!response.ok) {
        throw new Error("Failed to update habit");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Habit Updated",
        description: "Your habit has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      onHabitUpdated();
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update habit. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: HabitFormData) => {
    updateMutation.mutate(data);
  };

  const handleImpactActionChange = (value: string) => {
    const selectedAction = impactActionOptions.find(action => action.value === value);
    if (selectedAction) {
      form.setValue("impactAmount", selectedAction.suggestedAmount);
    }
  };

  if (!habit) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Habit</DialogTitle>
          <DialogDescription>
            Update your habit details, impact settings, and visual appearance.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Habit Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Morning meditation" 
                        {...field} 
                        data-testid="input-habit-name"
                        className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-forest-primary focus:ring-forest-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your habit and why it's important to you"
                        {...field}
                        data-testid="input-habit-description"
                        className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-forest-primary focus:ring-forest-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Visual Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Visual Settings</h3>
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category & Color</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger data-testid="select-habit-category" className="bg-white border-gray-300 text-gray-900 focus:border-forest-primary focus:ring-forest-primary">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryOptions.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              <div className="flex items-center space-x-2">
                                <div 
                                  className="w-4 h-4 rounded-full" 
                                  style={{ backgroundColor: category.color }}
                                />
                                <span>{category.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      Choose a category that determines the habit's color in charts
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger data-testid="select-habit-icon" className="bg-white border-gray-300 text-gray-900 focus:border-forest-primary focus:ring-forest-primary">
                          <SelectValue placeholder="Select an icon" />
                        </SelectTrigger>
                        <SelectContent>
                          {iconOptions.map((icon) => {
                            const IconComponent = icon.icon;
                            return (
                              <SelectItem key={icon.value} value={icon.value}>
                                <div className="flex items-center space-x-2">
                                  <IconComponent className="h-4 w-4" />
                                  <span>{icon.label}</span>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Impact Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Environmental Impact</h3>
              
              <FormField
                control={form.control}
                name="impactAction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Impact Action</FormLabel>
                    <FormControl>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleImpactActionChange(value);
                        }} 
                        defaultValue={field.value}
                      >
                        <SelectTrigger data-testid="select-impact-action" className="bg-white border-gray-300 text-gray-900 focus:border-forest-primary focus:ring-forest-primary">
                          <SelectValue placeholder="Select an environmental impact" />
                        </SelectTrigger>
                        <SelectContent>
                          {impactActionOptions.map((action) => (
                            <SelectItem key={action.value} value={action.value}>
                              <div className="flex items-center space-x-2">
                                <span>{action.emoji}</span>
                                <span>{action.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      {form.watch("impactAction") && 
                        impactActionOptions.find(a => a.value === form.watch("impactAction"))?.description
                      }
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="impactAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Impact Amount per Completion</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        max="100"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        data-testid="input-impact-amount"
                        className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-forest-primary focus:ring-forest-primary"
                      />
                    </FormControl>
                    <FormDescription>
                      How much environmental impact this habit creates each time you complete it
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                data-testid="button-cancel-edit"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateMutation.isPending}
                data-testid="button-save-habit"
              >
                {updateMutation.isPending ? "Updating..." : "Update Habit"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}