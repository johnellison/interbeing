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
    isPreloaded?: boolean;
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
  const [showEmotionFeedback, setShowEmotionFeedback] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { data: aiData, isLoading: isAiLoading, isError: isAiError } = useQuery<{ message: string }>({
    queryKey: ['/api/habits', data?.habitId, 'celebration'].filter(Boolean),
    enabled: isOpen && !!data?.habitId && !data?.isPreloaded, // Skip API call if we have pre-loaded data
    staleTime: 0,
  });

  const impactTypeConfig = data ? impactConfig[data.impactAction] : null;
  // Create proper fallback message with correct grammar
  const getImpactText = (action: string, amount: number) => {
    const actionMap = {
      plant_tree: `planted ${amount} tree${amount > 1 ? 's' : ''}`,
      rescue_plastic: `rescued ${amount} plastic bottle${amount > 1 ? 's' : ''}`,
      offset_carbon: `offset ${amount}kg of CO₂`,
      plant_kelp: `planted some kelp (${amount} plant${amount > 1 ? 's' : ''})`,
      provide_water: `provided ${amount} liter${amount > 1 ? 's' : ''} of clean water`,
      sponsor_bees: `protected ${amount} bee${amount > 1 ? 's' : ''}`
    };
    return actionMap[action as keyof typeof actionMap] || 'created positive impact';
  };
  
  const fallbackMessage = data ? `Excellent work! Your "${data.habitName}" habit just ${getImpactText(data.impactAction, data.impactAmount)} while building your ${data.streak}-day streak. You're building something amazing! ✨\n\nHow are you feeling now?` : "Great job!\n\nHow are you feeling now?";
  
  // Use pre-loaded message if available, otherwise use API data or fallback
  const preloadedMessage = data?.celebrationMessage?.message;
  const finalMessage = preloadedMessage || aiData?.message || fallbackMessage;
  const aiMessage = finalMessage + (finalMessage && !finalMessage.includes("How are you feeling now?") ? "\n\nHow are you feeling now?" : "");

  useEffect(() => {
    if (isOpen && data) {
      setAnimationPhase('enter');
      // Reset emotion feedback state
      setShowEmotionFeedback(false);
      setShowTypingDots(true);
      setSelectedEmotion(null);
      
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
        typingTimeoutRef.current = setTimeout(typeNextCharacter, 8); // 8ms per character - very snappy
      } else {
        setIsTyping(false);
        // Show emotion feedback after typing finishes
        setTimeout(() => {
          setShowEmotionFeedback(true);
        }, 500);
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
      // Reset all modal state
      setSelectedEmotion(null);
      setShowEmotionFeedback(false);
      setShowTypingDots(true);
    }, 300);
  };

  const handleViewImpact = () => {
    setLocation('/analytics?tab=impact-map');
    handleClose();
  };

  const handleEmotionSelect = async (emotionValue: number) => {
    setSelectedEmotion(emotionValue);
    
    // Store emotion feedback for the most recent completion of this habit
    try {
      if (data?.habitId) {
        await fetch(`/api/habits/${data.habitId}/emotion-feedback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emotionalFeedback: emotionValue })
        });
        console.log(`Emotion feedback ${emotionValue} saved for habit ${data.habitId}`);
      }
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

        <div className="p-8">
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
            <div className="bg-secondary/20 rounded-2xl p-6 border border-border text-left">
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
                      <span className="text-base text-foreground">John is writing...</span>
                      <div className="flex space-x-1">
                        <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-base text-foreground leading-relaxed text-left whitespace-pre-line" data-testid="text-ai-celebration-message">
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

          {/* Emotion feedback section */}
          {showEmotionFeedback && (
            <div className="mb-6" data-testid="section-emotion-feedback">
              <div className="text-center space-y-4">
                <div className="flex justify-center space-x-3">
                  {emotions.map((emotion) => (
                    <button
                      key={emotion.value}
                      onClick={() => handleEmotionSelect(emotion.value)}
                      className={`text-4xl p-3 rounded-full transition-all duration-200 ${
                        selectedEmotion === emotion.value
                          ? 'bg-primary/20 scale-110 ring-2 ring-primary'
                          : 'hover:bg-secondary/50 hover:scale-105'
                      }`}
                      data-testid={`button-emotion-${emotion.value}`}
                      title={emotion.label}
                    >
                      {emotion.emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Single action button - shows after emotion is selected or when emotion feedback is not shown */}
          {(!showEmotionFeedback || selectedEmotion) && (
            <Button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary/80 transition-all duration-200 font-medium py-3 rounded-xl"
              data-testid="button-continue"
            >
              {selectedEmotion ? "Thanks for sharing! 💚" : "Keep Going! 🚀"}
            </Button>
          )}
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