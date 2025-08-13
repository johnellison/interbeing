import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Target, TreePine, Users, Waves, Wind, DollarSign } from "lucide-react";

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
            <span className="text-forest-primary">Create Real Impact.</span><br />
            Transform the World.
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Every habit you complete triggers real environmental action. Plant trees, clean oceans, 
            capture carbon, or donate to causes. Choose your impact and watch personal growth create 
            authentic change for the planet.
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
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="bg-card/50 border-forest-accent/20">
            <CardHeader className="text-center">
              <TreePine className="h-12 w-12 text-forest-success mx-auto mb-4" />
              <CardTitle className="text-forest-text">Plant Trees</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Reforest the planet with every habit completed. Real trees planted 
                in verified locations worldwide.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-forest-accent/20">
            <CardHeader className="text-center">
              <Waves className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <CardTitle className="text-forest-text">Clean Oceans</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Remove plastic waste from our oceans. Each completion helps 
                extract pounds of pollution from marine ecosystems.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-forest-accent/20">
            <CardHeader className="text-center">
              <Wind className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <CardTitle className="text-forest-text">Capture Carbon</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Fight climate change by removing CO₂ from the atmosphere. 
                Every habit builds towards a carbon-neutral future.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-forest-accent/20">
            <CardHeader className="text-center">
              <DollarSign className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-forest-text">Support Causes</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Make direct donations to environmental organizations. 
                Every habit completion funds real conservation efforts.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* How It Works Section */}
        <div className="bg-forest-primary/5 rounded-2xl p-8 mb-16">
          <h3 className="text-3xl font-bold text-forest-text text-center mb-8">
            How It Works
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Target className="h-16 w-16 text-forest-primary mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-forest-text mb-2">1. Create Your Habit</h4>
              <p className="text-muted-foreground">
                Set up daily routines and choose your preferred environmental impact action and amount.
              </p>
            </div>
            <div className="text-center">
              <Leaf className="h-16 w-16 text-forest-success mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-forest-text mb-2">2. Complete & Track</h4>
              <p className="text-muted-foreground">
                Mark habits as complete and watch your streaks grow while tracking your progress.
              </p>
            </div>
            <div className="text-center">
              <Users className="h-16 w-16 text-forest-primary mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-forest-text mb-2">3. Create Real Impact</h4>
              <p className="text-muted-foreground">
                Every completion triggers authentic environmental action through our verified partners.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-br from-forest-primary/10 to-forest-success/10 rounded-2xl p-8">
          <div className="flex justify-center space-x-4 mb-4">
            <TreePine className="h-12 w-12 text-forest-success" />
            <Waves className="h-12 w-12 text-blue-500" />
            <Wind className="h-12 w-12 text-gray-500" />
            <DollarSign className="h-12 w-12 text-green-600" />
          </div>
          <h3 className="text-3xl font-bold text-forest-text mb-4">
            Ready to Transform Habits into Impact?
          </h3>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join the movement of people who are building better habits while creating 
            measurable environmental change. Choose your impact, track your progress, 
            and watch personal growth create real-world transformation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={handleLogin}
              size="lg" 
              className="bg-forest-success hover:bg-forest-success/90 text-white px-8 py-4"
              data-testid="button-join-now"
            >
              Start Creating Impact
            </Button>
            <p className="text-sm text-muted-foreground">
              🌍 Real actions • 📊 Verified tracking • 🔥 Habit streaks
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}