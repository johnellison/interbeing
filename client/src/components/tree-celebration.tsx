import { Button } from "@/components/ui/button";

interface TreeCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    habitName: string;
    streak: number;
    newTreeCount: number;
  } | null;
}

export default function TreeCelebration({ isOpen, onClose, data }: TreeCelebrationProps) {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" data-testid="modal-tree-celebration">
      <div className="bg-white rounded-organic p-8 mx-4 max-w-md text-center celebration-animation">
        <div className="text-6xl mb-4 tree-bounce">🌱→🌳</div>
        <h3 className="text-2xl font-bold text-forest-text mb-2" data-testid="text-celebration-title">
          Tree Planted!
        </h3>
        <p className="text-forest-text/70 mb-4" data-testid="text-celebration-description">
          Congratulations! You've just planted a tree by completing "{data.habitName}". 
          Every small action creates a better world.
        </p>
        <div className="bg-forest-bg p-4 rounded-organic mb-4">
          <p className="text-sm"><strong>Environmental Impact:</strong></p>
          <div className="text-lg font-semibold text-forest-success flex items-center justify-center gap-2" data-testid="text-celebration-impact">
            <span>+1 Tree 🌳</span>
            <span>|</span>
            <span>Streak: {data.streak} days 🔥</span>
          </div>
        </div>
        <Button
          onClick={onClose}
          className="bg-forest-primary text-white px-6 py-2 rounded-organic hover:bg-forest-primary/90 transition-colors"
          data-testid="button-continue-celebration"
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
