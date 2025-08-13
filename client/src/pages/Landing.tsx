import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Target, TreePine, Users } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-bg via-background to-forest-secondary/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center space-x-2">
            <TreePine className="h-8 w-8 text-forest-primary" />
            <h1 className="text-2xl font-bold text-forest-primary">Interbeing</h1>
          </div>
          <Button 
            onClick={handleLogin}
            className="bg-forest-primary hover:bg-forest-primary/90"
            data-testid="button-login"
          >
            Sign In
          </Button>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-forest-text mb-6">
            Build Habits.<br />
            <span className="text-forest-primary">Plant Trees.</span><br />
            Change the World.
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Every habit you complete plants a real tree through Ecologi. Connect your personal growth 
            with environmental impact and create positive change for yourself and the planet.
          </p>
          <Button 
            onClick={handleLogin}
            size="lg" 
            className="bg-forest-primary hover:bg-forest-primary/90 text-white px-8 py-4 text-lg"
            data-testid="button-get-started"
          >
            Get Started
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-card/50 border-forest-accent/20">
            <CardHeader className="text-center">
              <Target className="h-12 w-12 text-forest-primary mx-auto mb-4" />
              <CardTitle className="text-forest-text">Track Daily Habits</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Build lasting routines with our simple habit tracking system. 
                Set goals, track progress, and maintain streaks that stick.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-forest-accent/20">
            <CardHeader className="text-center">
              <TreePine className="h-12 w-12 text-forest-success mx-auto mb-4" />
              <CardTitle className="text-forest-text">Plant Real Trees</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Each completed habit plants a real tree through our partnership with Ecologi. 
                Watch your personal forest grow as you build better habits.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-forest-accent/20">
            <CardHeader className="text-center">
              <Users className="h-12 w-12 text-forest-primary mx-auto mb-4" />
              <CardTitle className="text-forest-text">Environmental Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                See your real environmental impact with CO2 offset tracking, 
                tree certificates, and progress towards global sustainability goals.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-forest-primary/10 rounded-2xl p-8">
          <Leaf className="h-16 w-16 text-forest-success mx-auto mb-4" />
          <h3 className="text-3xl font-bold text-forest-text mb-4">
            Ready to Make a Difference?
          </h3>
          <p className="text-lg text-muted-foreground mb-6 max-w-xl mx-auto">
            Join thousands of users who are building better habits while creating 
            a more sustainable future, one tree at a time.
          </p>
          <Button 
            onClick={handleLogin}
            size="lg" 
            className="bg-forest-success hover:bg-forest-success/90 text-white px-8 py-4"
            data-testid="button-join-now"
          >
            Start Your Journey
          </Button>
        </div>
      </div>
    </div>
  );
}