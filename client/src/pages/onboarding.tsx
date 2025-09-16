import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import OnboardingChat from "@/components/onboarding-chat";
import { Sparkles, TreePine, CheckCircle } from "lucide-react";
import type { OnboardingProfile, CelebrationPrefs } from "@shared/schema";

export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const [showChat, setShowChat] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const completeOnboardingMutation = useMutation({
    mutationFn: async ({ profile, prefs }: { profile: OnboardingProfile, prefs: CelebrationPrefs }) => {
      const response = await apiRequest("POST", "/api/onboarding/complete", {
        onboardingProfile: profile,
        celebrationPrefs: prefs
      });
      return response.json();
    },
    onSuccess: (data) => {
      setIsCompleting(false);
      // Navigate to home dashboard where they can see their new habits
      setLocation("/");
    },
    onError: (error) => {
      console.error('Onboarding completion error:', error);
      setIsCompleting(false);
    }
  });

  const handleComplete = (profile: OnboardingProfile, prefs: CelebrationPrefs) => {
    setIsCompleting(true);
    completeOnboardingMutation.mutate({ profile, prefs });
  };

  if (showChat) {
    return <OnboardingChat onComplete={handleComplete} />;
  }

  if (isCompleting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-primary animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-4">Creating Your Habits</h2>
            <p className="text-muted-foreground mb-4">
              I'm setting up your personalized habits based on our conversation...
            </p>
            <div className="animate-pulse">
              <div className="h-2 bg-primary rounded-full"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-primary/10">
              <TreePine className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-foreground mb-4">
            Welcome to Interbeing
          </CardTitle>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Let's create meaningful habits that align with your aspirations and create real environmental impact.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* What You'll Get */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-primary" />
              What You'll Get
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-muted-foreground text-sm">
                  <strong className="text-foreground">Personalized habit recommendations</strong> based on your specific aspirations and abilities
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-muted-foreground text-sm">
                  <strong className="text-foreground">Up to 3 ready-to-track habits</strong> that you can start immediately after our conversation
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-muted-foreground text-sm">
                  <strong className="text-foreground">Real environmental impact</strong> with each habit completion through our Greenspark partnership
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-muted-foreground text-sm">
                  <strong className="text-foreground">Personalized celebrations</strong> tailored to your personality and achievements
                </p>
              </div>
            </div>
          </div>

          {/* Process Overview */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">How It Works</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Clarify your aspiration</strong> - What change do you want to make and why?
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Explore potential behaviors</strong> - I'll suggest actions that align with your goals
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Choose your top 3</strong> - Select behaviors you want to do, can do, and are effective
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground mb-4">
              This conversation typically takes 5-7 minutes and will fast-track your habit tracking journey.
            </p>
            <Button
              onClick={() => setShowChat(true)}
              size="lg"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
              data-testid="button-start-onboarding"
            >
              Start Conversation with John
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}