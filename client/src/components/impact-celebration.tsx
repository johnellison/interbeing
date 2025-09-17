import { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import johnEllison from "@assets/john-ellison-health-hacked-flipchart_1758018126559.webp";

interface ImpactCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    habitId: string;
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
    celebrationMessage?: {
      title: string;
      message: string;
      motivationalNote: string;
      progressInsight?: string;
    };
  } | null;
}

const impactConfig = {
  plant_tree: {
    emoji: "🌳",
    title: "Tree Planted!",
    description: "You've helped reforest our planet",
    unit: "tree",
    color: "text-success",
    bgColor: "bg-card",
    particleColor: "#22c55e"
  },
  rescue_plastic: {
    emoji: "🐋",
    title: "Plastic Rescued!",
    description: "You've helped remove plastic waste from our oceans",
    unit: "bottle rescued",
    color: "text-secondary",
    bgColor: "bg-card",
    particleColor: "#3b82f6"
  },
  offset_carbon: {
    emoji: "☁️",
    title: "Carbon Offset!",
    description: "You've helped offset CO₂ emissions",
    unit: "kg of CO₂ offset",
    color: "text-muted-foreground",
    bgColor: "bg-card",
    particleColor: "#6b7280"
  },
  plant_kelp: {
    emoji: "🌿",
    title: "Kelp Planted!",
    description: "You've helped restore marine ecosystems",
    unit: "kelp plant",
    color: "text-success",
    bgColor: "bg-card",
    particleColor: "#10b981"
  },
  provide_water: {
    emoji: "💧",
    title: "Clean Water Provided!",
    description: "You've supported clean water access worldwide",
    unit: "liter provided",
    color: "text-secondary",
    bgColor: "bg-card",
    particleColor: "#3b82f6"
  },
  sponsor_bees: {
    emoji: "🐝",
    title: "Bees Protected!",
    description: "You've supported pollinator habitats in Kenya through EarthLungs",
    unit: "bees protected",
    color: "text-accent",
    bgColor: "bg-card",
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
  const [typedText, setTypedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showTypingDots, setShowTypingDots] = useState(true);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { data: aiData, isLoading: isAiLoading, isError: isAiError } = useQuery<{ message: string }>({
    queryKey: [data?.habitId ? `/api/habits/${data.habitId}/celebration` : undefined],
    enabled: isOpen && !!data?.habitId,
    staleTime: 0,
  });

  const impactTypeConfig = data ? impactConfig[data.impactAction] : null;
  const fallbackMessage = data ? `Excellent work! Your "${data.habitName}" habit just helped ${impactTypeConfig?.title.toLowerCase().replace('!', '')} - that's ${data.impactAmount} ${impactTypeConfig?.unit} while building your ${data.streak}-day streak. Keep this positive momentum going!` : "Great job!";
  const aiMessage = aiData?.message ?? fallbackMessage;

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
      
      // Auto-close cleanup on unmount
      return () => {
        if (autoCloseTimeoutRef.current) {
          clearTimeout(autoCloseTimeoutRef.current);
        }
      };
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

  // Typewriter effect for AI message
  useEffect(() => {
    if (!isOpen || isAiLoading || !aiMessage) {
      setTypedText("");
      setIsTyping(false);
      return;
    }

    setShowTypingDots(false);
    setIsTyping(true);
    setTypedText("");
    
    let currentIndex = 0;
    const typeNextCharacter = () => {
      if (currentIndex < aiMessage.length) {
        setTypedText(aiMessage.slice(0, currentIndex + 1));
        currentIndex++;
        typingTimeoutRef.current = setTimeout(typeNextCharacter, 50); // 50ms per character
      } else {
        setIsTyping(false);
        // Start auto-close timer after typing finishes
        const readingTime = 5000; // 5 seconds to read the message
        autoCloseTimeoutRef.current = setTimeout(() => {
          handleClose();
        }, readingTime);
      }
    };

    // Start typing after a brief delay
    typingTimeoutRef.current = setTimeout(typeNextCharacter, 500);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [isOpen, isAiLoading, aiMessage]);

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


      {/* Main modal */}
      <div 
        className={`relative max-w-lg w-full mx-4 ${config.bgColor} rounded-3xl shadow-2xl border-2 border-border transform transition-all duration-500 ${
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
          className="absolute top-4 right-4 z-10 rounded-full bg-secondary/80 hover:bg-secondary/90 transition-colors text-foreground"
          data-testid="button-close-celebration"
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="p-8 text-center">
          {/* Large emoji with bounce animation */}
          <div className={`text-8xl mb-6 animate-bounce`} style={{ animationDuration: '1s' }}>
            {config.emoji}
          </div>

          {/* Simplified AI message */}
          <div className="mb-8">
            <h2 className={`text-3xl font-bold ${config.color} mb-4`} data-testid="text-celebration-title">
              Great Work! 🎉
            </h2>
            
            {/* Single personalized message from John Ellison */}
            <div className="bg-secondary/20 rounded-2xl p-6 border border-border">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <img 
                    src={johnEllison}
                    alt="John Ellison, Habit Coach" 
                    className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                    data-testid="img-coach-photo"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-primary mb-2">John Ellison, your habit coach:</p>
                  {isAiLoading || showTypingDots ? (
                    <div className="flex items-center space-x-1" data-testid="status-ai-loading">
                      <span className="text-base text-foreground">John is thinking</span>
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-base text-foreground leading-relaxed" data-testid="text-ai-celebration-message">
                      <span>{typedText}</span>
                      {isTyping && <span className="animate-pulse">|</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Simple impact summary */}
          <div className="flex items-center justify-center space-x-6 mb-8 text-center">
            <div>
              <p className={`text-xl font-bold ${config.color}`} data-testid="text-impact-amount">
                {impactValue} {config.unit}
              </p>
            </div>
            <div className="text-muted-foreground">•</div>
            <div>
              <p className="text-xl font-bold text-primary" data-testid="text-streak-count">
                {data.streak} day streak! 🔥
              </p>
            </div>
          </div>

          {/* Single action button */}
          <Button
            onClick={handleClose}
            className="w-full bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary/80 transition-all duration-200 font-medium py-3 rounded-xl"
            data-testid="button-continue"
          >
            Keep Going! 🚀
          </Button>
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