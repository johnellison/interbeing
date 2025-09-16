import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Send, Loader2, TreePine, Recycle, Waves, Flower2, Droplets, Bug } from "lucide-react";
import johnEllison from "@assets/john-ellison-health-hacked-flipchart_1758018126559.webp";
import type { OnboardingProfile, Behavior, CelebrationPrefs } from "@shared/schema";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ConversationState {
  phase: 'welcome' | 'clarify_aspiration' | 'recommend_behaviors';
  messageCount: number;
  data: Partial<OnboardingProfile & { recommendedBehaviors?: Behavior[] }>;
}

interface OnboardingChatProps {
  onComplete: (profile: OnboardingProfile, prefs: CelebrationPrefs) => void;
}

// Helper function to get icon for impact actions
const getImpactIcon = (action: string) => {
  switch (action) {
    case 'plant_tree': return TreePine;
    case 'rescue_plastic': return Recycle;
    case 'offset_carbon': return Waves;
    case 'plant_kelp': return Flower2;
    case 'provide_water': return Droplets;
    case 'sponsor_bees': return Bug;
    default: return TreePine;
  }
}

// Component to display behavior recommendations nicely
const BehaviorRecommendations = ({ behaviors }: { behaviors: Behavior[] }) => {
  return (
    <div className="space-y-4 mt-4">
      {behaviors.map((behavior, index) => {
        const IconComponent = getImpactIcon(behavior.impactAction);
        return (
          <div key={index} className="border border-border rounded-lg p-4 bg-muted/30">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                <IconComponent className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-sm mb-1">
                  {behavior.name}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {behavior.whyEffective}
                </p>
                <div className="mt-2 flex items-center text-xs text-primary">
                  <span>Environmental impact: {behavior.impactAmount} {behavior.impactAction.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default function OnboardingChat({ onComplete }: OnboardingChatProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm John Ellison, and I'm excited to help you create meaningful habits that align with your aspirations. What change would you like to make in your life?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [conversationState, setConversationState] = useState<ConversationState>({
    phase: 'welcome',
    messageCount: 0,
    data: {}
  });

  const handleOnboardingChoice = (choice: 'manual' | 'automatic') => {
    if (isCompleting) {
      console.log('[ONBOARDING] Already completing, ignoring click');
      return;
    }
    
    console.log('[ONBOARDING] User clicked choice button:', choice);
    console.log('[ONBOARDING] Conversation state data:', conversationState.data);
    
    setIsCompleting(true);
    
    // Complete onboarding with the collected data and user's choice
    const celebrationPrefs: CelebrationPrefs = {
      personalityTone: 'warm',
      style: 'standard',
      emojiLevel: 2,
      surpriseLevel: 2,
      themes: [],
      soundEnabled: true
    };

    const profile: OnboardingProfile = {
      aspiration: conversationState.data.aspiration || "Personal growth and positive change",
      motivations: conversationState.data.motivations || [],
      obstacles: conversationState.data.obstacles || [],
      context: conversationState.data.context || "User wants to start building positive habits",
      selectedBehaviors: choice === 'automatic' ? (conversationState.data.recommendedBehaviors || []) : [],
      recommendedBehaviors: conversationState.data.recommendedBehaviors || [],
      choice: choice
    };

    console.log('[ONBOARDING] Profile data being sent:', profile);
    console.log('[ONBOARDING] Celebration prefs being sent:', celebrationPrefs);
    console.log('[ONBOARDING] Calling onComplete callback...');
    
    onComplete(profile, celebrationPrefs);
  };
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/onboarding/message", {
        message,
        conversationState
      });
      return response.json();
    },
    onSuccess: (data) => {
      // Add AI response
      setMessages(prev => [...prev, {
        id: Date.now().toString() + '-ai',
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }]);

      // Update conversation state
      setConversationState(prev => ({
        phase: data.nextPhase,
        messageCount: prev.messageCount + 1,
        data: data.updatedData
      }));

      setSuggestions(data.suggestions || []);
    },
    onError: (error) => {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString() + '-error',
        role: 'assistant',
        content: "I'm having trouble right now. Could you try again?",
        timestamp: new Date()
      }]);
    }
  });

  const handleSend = () => {
    if (!input.trim() || sendMessageMutation.isPending) return;

    const userMessage = input.trim();
    setInput("");
    setSuggestions([]);

    // Add user message
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    // Send to AI
    sendMessageMutation.mutate(userMessage);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card p-4">
        <div className="max-w-4xl mx-auto flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
            <img
              src={johnEllison}
              alt="John Ellison"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">John Ellison</h1>
            <p className="text-sm text-muted-foreground">Behavior Change Coach</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className={`flex-1 overflow-y-auto p-4 ${
        conversationState.phase === 'recommend_behaviors' ? 'pb-32' : 'pb-24 md:pb-6'
      }`}>
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              data-testid={`message-${message.role}-${message.id}`}
            >
              <Card className={`max-w-[80%] ${
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-card'
              }`}>
                <CardContent className="p-4">
                  {message.role === 'assistant' && conversationState.phase === 'recommend_behaviors' && 
                   conversationState.data.recommendedBehaviors && conversationState.data.recommendedBehaviors.length > 0 && 
                   message === messages[messages.length - 1] ? (
                    // Show custom behavior recommendations for the last AI message in recommend_behaviors phase
                    <div>
                      <p className="text-sm leading-relaxed mb-4">
                        Perfect! Based on what you've shared, here are 3 habits I recommend for you:
                      </p>
                      <BehaviorRecommendations behaviors={conversationState.data.recommendedBehaviors} />
                      <p className="text-sm text-muted-foreground mt-4">
                        Would you like me to create these habits for you automatically, or would you prefer to add them manually yourself?
                      </p>
                    </div>
                  ) : (
                    // Show regular message content
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
          
          {sendMessageMutation.isPending && (
            <div className="flex justify-start">
              <Card className="bg-card">
                <CardContent className="p-4 flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p className="text-sm text-muted-foreground">John is thinking...</p>
                </CardContent>
              </Card>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Behavior Choice Buttons */}
      {conversationState.phase === 'recommend_behaviors' && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card p-4 pointer-events-auto">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Choose how you'd like to proceed:
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                type="button"
                onClick={() => handleOnboardingChoice('automatic')}
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-8"
                data-testid="button-create-automatic"
                disabled={isCompleting}
              >
                {isCompleting ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating Habits...</span>
                  </div>
                ) : (
                  "Create These Habits for Me"
                )}
              </Button>
              <Button
                type="button"
                onClick={() => handleOnboardingChoice('manual')}
                variant="outline"
                size="lg"
                className="font-medium px-8"
                data-testid="button-create-manual"
                disabled={isCompleting}
              >
                {isCompleting ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Completing...</span>
                  </div>
                ) : (
                  "I'll Add Habits Manually"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && conversationState.phase !== 'recommend_behaviors' && (
        <div className="border-t border-border bg-card p-4">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm text-muted-foreground mb-2">Quick responses:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-sm"
                  data-testid={`suggestion-${index}`}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      {conversationState.phase !== 'recommend_behaviors' && (
        <div className="fixed bottom-0 left-0 right-0 md:relative md:bottom-auto border-t border-border bg-card p-4">
          <div className="max-w-4xl mx-auto flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your response..."
              disabled={sendMessageMutation.isPending}
              className="flex-1"
              data-testid="input-message"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || sendMessageMutation.isPending}
              size="icon"
              data-testid="button-send"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}