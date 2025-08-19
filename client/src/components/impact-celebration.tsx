import { useEffect, useState } from "react";
import { X, Sparkles, MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface ImpactCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    habitName: string;
    streak: number;
    impactAction: 'plant_tree' | 'rescue_plastic' | 'offset_carbon' | 'plant_kelp' | 'provide_water' | 'sponsor_bees';
    impactAmount: number;
    projectInfo?: {
      name: string;
      description: string;
      location: string;
      imageUrl?: string;
      registryLink?: string;
    };
  } | null;
}

const impactConfig = {
  plant_tree: {
    emoji: "🌳",
    title: "Tree Planted!",
    description: "You've helped reforest our planet",
    unit: "tree",
    color: "text-green-600",
    bgColor: "bg-green-50",
    particleColor: "#22c55e"
  },
  rescue_plastic: {
    emoji: "🐋",
    title: "Plastic Rescued!",
    description: "You've helped remove plastic waste from our oceans",
    unit: "bottle rescued",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    particleColor: "#3b82f6"
  },
  offset_carbon: {
    emoji: "☁️",
    title: "Carbon Offset!",
    description: "You've helped offset CO₂ emissions",
    unit: "kg of CO₂ offset",
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    particleColor: "#6b7280"
  },
  plant_kelp: {
    emoji: "🌿",
    title: "Kelp Planted!",
    description: "You've helped restore marine ecosystems",
    unit: "kelp plant",
    color: "text-green-600",
    bgColor: "bg-green-50",
    particleColor: "#10b981"
  },
  provide_water: {
    emoji: "💧",
    title: "Clean Water Provided!",
    description: "You've supported clean water access worldwide",
    unit: "liter provided",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    particleColor: "#3b82f6"
  },
  sponsor_bees: {
    emoji: "🐝",
    title: "Bees Protected!",
    description: "You've supported pollinator habitats in Kenya through EarthLungs",
    unit: "bees protected",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    particleColor: "#eab308"
  }
};

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
}

// Emotion feedback options
const emotions = [
  { emoji: '😞', label: 'Sad', value: 1 },
  { emoji: '😐', label: 'Neutral', value: 2 },  
  { emoji: '🙂', label: 'Happy', value: 3 },
  { emoji: '😊', label: 'Joyful', value: 4 },
  { emoji: '🤩', label: 'Ecstatic', value: 5 }
];

export default function ImpactCelebration({ isOpen, onClose, data }: ImpactCelebrationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [animationPhase, setAnimationPhase] = useState<'enter' | 'celebrate' | 'exit'>('enter');
  const [selectedEmotion, setSelectedEmotion] = useState<number | null>(null);
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (isOpen && data) {
      setAnimationPhase('enter');
      
      // Create initial particles
      const initialParticles: Particle[] = [];
      for (let i = 0; i < 30; i++) {
        initialParticles.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: window.innerHeight + Math.random() * 100,
          vx: (Math.random() - 0.5) * 4,
          vy: -Math.random() * 8 - 2,
          life: 1,
          size: Math.random() * 6 + 2
        });
      }
      setParticles(initialParticles);

      // Animation sequence
      setTimeout(() => setAnimationPhase('celebrate'), 300);
      
      // Auto-close after 4 seconds
      const autoCloseTimer = setTimeout(() => {
        handleClose();
      }, 4000);

      return () => clearTimeout(autoCloseTimer);
    } else {
      setParticles([]);
    }
  }, [isOpen, data]);

  useEffect(() => {
    if (!isOpen || particles.length === 0) return;

    const animateParticles = () => {
      setParticles(prevParticles => 
        prevParticles
          .map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            vy: particle.vy + 0.1, // gravity
            life: particle.life - 0.02
          }))
          .filter(particle => particle.life > 0 && particle.y < window.innerHeight + 50)
      );
    };

    const interval = setInterval(animateParticles, 16);
    return () => clearInterval(interval);
  }, [isOpen, particles.length]);

  const handleClose = () => {
    setAnimationPhase('exit');
    setTimeout(() => {
      onClose();
      setAnimationPhase('enter');
      setSelectedEmotion(null); // Reset emotion selection
    }, 300);
  };

  const handleViewImpact = () => {
    setLocation('/analytics?tab=impact-map');
    handleClose();
  };

  const handleEmotionSelect = async (emotionValue: number) => {
    setSelectedEmotion(emotionValue);
    
    // Store emotion feedback (you could send this to your backend)
    try {
      // Optional: Store emotion feedback in backend
      // await fetch('/api/emotion-feedback', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     habitName: data?.habitName,
      //     impactAction: data?.impactAction,
      //     emotion: emotionValue,
      //     timestamp: new Date().toISOString()
      //   })
      // });
      
      console.log(`Emotion feedback recorded: ${emotionValue} for ${data?.habitName}`);
    } catch (error) {
      console.error('Failed to store emotion feedback:', error);
    }
  };

  if (!isOpen || !data) return null;

  const config = impactConfig[data.impactAction] || {
    emoji: "🌱",
    title: "Impact Created!",
    description: "You've made a positive environmental impact",
    unit: "impact",
    color: "text-green-600",
    bgColor: "bg-green-50",
    particleColor: "#22c55e"
  };
  const impactValue = `${data.impactAmount}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* Particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              backgroundColor: config.particleColor,
              opacity: particle.life,
              transform: `scale(${particle.life})`,
            }}
          />
        ))}
      </div>

      {/* Sparkle effects */}
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <Sparkles
            key={i}
            className={`absolute text-yellow-400 animate-pulse`}
            style={{
              left: `${20 + i * 10}%`,
              top: `${30 + (i % 3) * 20}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: '2s'
            }}
            size={16 + Math.random() * 8}
          />
        ))}
      </div>

      {/* Main modal */}
      <div 
        className={`relative max-w-lg w-full mx-4 ${config.bgColor} rounded-3xl shadow-2xl border-2 border-white/20 transform transition-all duration-500 ${
          animationPhase === 'enter' ? 'scale-50 opacity-0 rotate-12' :
          animationPhase === 'celebrate' ? 'scale-100 opacity-100 rotate-0' :
          'scale-75 opacity-0 -rotate-6'
        }`}
        data-testid="impact-celebration-modal"
      >
        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 rounded-full bg-white/80 hover:bg-white/90 transition-colors"
          data-testid="button-close-celebration"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="p-8 text-center">
          {/* Large emoji with bounce animation */}
          <div className={`text-8xl mb-6 animate-bounce`} style={{ animationDuration: '1s' }}>
            {config.emoji}
          </div>

          {/* Success message */}
          <div className="mb-6">
            <h2 className={`text-3xl font-bold ${config.color} mb-2`} data-testid="text-celebration-title">
              {config.title}
            </h2>
            <p className="text-lg text-gray-600" data-testid="text-celebration-description">
              {config.description}
            </p>
          </div>

          {/* Impact details */}
          <div className="bg-white/60 rounded-2xl p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-forest-primary" data-testid="text-habit-name">
                  {data.habitName}
                </p>
                <p className="text-sm text-gray-600">Habit Completed</p>
              </div>
              <div>
                <p className={`text-2xl font-bold ${config.color}`} data-testid="text-impact-amount">
                  {impactValue}
                </p>
                <p className="text-sm text-gray-600">{config.unit}</p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-lg">🔥</span>
                <span className="text-lg font-semibold text-forest-accent" data-testid="text-streak-count">
                  {data.streak} day streak!
                </span>
              </div>
            </div>
          </div>

          {/* Project Information */}
          {data?.projectInfo && (
            <div className="bg-white/80 rounded-2xl p-4 mb-6 text-left">
              <div className="flex items-start space-x-3">
                {data.projectInfo.imageUrl && (
                  <img 
                    src={data.projectInfo.imageUrl} 
                    alt={data.projectInfo.name}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2" data-testid="text-project-name">
                    {data.projectInfo.name}
                  </h3>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {data.projectInfo.description}
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span>{data.projectInfo.location}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* How do you feel? */}
          <div className="mb-6">
            <p className="text-sm text-gray-700 mb-3 font-medium">How do you feel?</p>
            <div className="flex justify-center space-x-3">
              {emotions.map((emotion) => (
                <button
                  key={emotion.value}
                  onClick={() => handleEmotionSelect(emotion.value)}
                  className={`text-2xl p-2 rounded-full transition-all duration-200 hover:scale-110 ${
                    selectedEmotion === emotion.value 
                      ? 'bg-white/90 shadow-lg ring-2 ring-forest-primary' 
                      : 'hover:bg-white/60'
                  }`}
                  title={emotion.label}
                  data-testid={`button-emotion-${emotion.value}`}
                >
                  {emotion.emoji}
                </button>
              ))}
            </div>
            {selectedEmotion && (
              <p className="text-xs text-green-600 mt-2 opacity-75">
                Thank you for sharing how this made you feel!
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleViewImpact}
              variant="outline"
              className="w-full bg-white/70 hover:bg-white/90 border-forest-primary/30"
              data-testid="button-view-impact"
            >
              <MapPin className="w-4 h-4 mr-2" />
              View Impact on Map
            </Button>
            
            <Button
              onClick={handleClose}
              className="w-full bg-forest-primary text-white hover:bg-forest-primary/90 transition-colors"
              data-testid="button-continue-journey"
            >
              Continue Your Journey
            </Button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-2 -left-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping" />
        <div className="absolute -top-1 -right-3 w-4 h-4 bg-green-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
        <div className="absolute -bottom-2 -left-3 w-5 h-5 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-1 -right-2 w-3 h-3 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '1.5s' }} />
      </div>
    </div>
  );
}