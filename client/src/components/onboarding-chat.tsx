import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Send, Loader2 } from "lucide-react";
import johnEllison from "@assets/john-ellison-health-hacked-flipchart_1758018126559.webp";
import type { OnboardingProfile, Behavior, CelebrationPrefs } from "@shared/schema";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ConversationState {
  phase: 'welcome' | 'aspiration' | 'motivations' | 'obstacles' | 'behaviors' | 'selection' | 'complete';
  data: Partial<OnboardingProfile>;
  suggestedBehaviors?: Behavior[];
}

interface OnboardingChatProps {
  onComplete: (profile: OnboardingProfile, prefs: CelebrationPrefs) => void;
}

export default function OnboardingChat({ onComplete }: OnboardingChatProps) {
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
    data: {}
  });
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
        data: data.updatedData,
        suggestedBehaviors: data.suggestedBehaviors || prev.suggestedBehaviors
      }));

      setSuggestions(data.suggestions || []);

      // If we've reached the completion phase, trigger onboarding completion
      if (data.nextPhase === 'complete' && data.updatedData.selectedBehaviors) {
        setTimeout(() => {
          const celebrationPrefs: CelebrationPrefs = {
            personalityTone: 'warm',
            style: 'standard',
            emojiLevel: 2,
            surpriseLevel: 2,
            themes: [],
            soundEnabled: true
          };
          onComplete(data.updatedData as OnboardingProfile, celebrationPrefs);
        }, 1500);
      }
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
      <div className="flex-1 overflow-y-auto p-4 pb-24 md:pb-6">
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
                  <p className="text-sm leading-relaxed">{message.content}</p>
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

      {/* Suggestions */}
      {suggestions.length > 0 && (
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
    </div>
  );
}