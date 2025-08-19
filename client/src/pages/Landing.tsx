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
            Every habit you complete triggers real environmental action through our partnership with <strong>Greenspark</strong>. 
            Plant trees, rescue plastic, offset carbon, plant kelp, provide clean water, or protect bees. 
            Choose your impact and watch personal growth create authentic change for the planet.
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card className="bg-card/50 border-forest-accent/20 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="text-4xl mb-2">🌳</div>
              <CardTitle className="text-forest-text">Plant Trees</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Support reforestation in Oregon through American Forests. Real trees planted 
                to restore wildfire-affected areas and wildlife habitats.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-forest-accent/20 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="text-4xl mb-2">🐋</div>
              <CardTitle className="text-forest-text">Rescue Plastic</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Remove ocean-bound plastic through Plastic Bank. Transform waste into 
                empowering income while cleaning our marine ecosystems.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-forest-accent/20 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="text-4xl mb-2">☁️</div>
              <CardTitle className="text-forest-text">Offset Carbon</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Fight climate change through Greenspark's verified carbon pool. 
                Support projects with maximum environmental and social benefit.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-forest-accent/20 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="text-4xl mb-2">🌿</div>
              <CardTitle className="text-forest-text">Plant Kelp</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Restore marine ecosystems in British Columbia, Canada. Support 
                kelp forest restoration to enhance underwater biodiversity.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-forest-accent/20 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="text-4xl mb-2">💧</div>
              <CardTitle className="text-forest-text">Provide Clean Water</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Protect water quality in Florida's Kissimmee Basin. Support 
                watershed protection through strategic forest restoration.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-forest-accent/20 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="text-4xl mb-2">🐝</div>
              <CardTitle className="text-forest-text">Protect Bees</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Create pollinator habitats through EarthLungs in Kenya. Foster 
                biodiversity and support essential ecosystem services.
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
                Every completion triggers authentic environmental action through our Greenspark partnership with verified global projects.
              </p>
            </div>
          </div>
        </div>

        {/* Greenspark Partnership Section */}
        <div className="bg-white/80 rounded-2xl p-8 mb-16 border border-forest-accent/20">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-forest-text mb-4">
              Powered by <span className="text-forest-primary">Greenspark</span>
            </h3>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              We partner with Greenspark to ensure every environmental action is authentic, verified, and trackable. 
              Our impact is driven by real projects with transparent reporting and measurable results.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 bg-green-50/80 rounded-xl">
              <div className="text-3xl mb-3">🌲</div>
              <h4 className="font-semibold text-forest-text mb-2">American Forests</h4>
              <p className="text-sm text-muted-foreground">
                Restoring Oregon's wildfire-affected areas with native Pacific Northwest trees
              </p>
            </div>
            <div className="text-center p-6 bg-blue-50/80 rounded-xl">
              <div className="text-3xl mb-3">🌊</div>
              <h4 className="font-semibold text-forest-text mb-2">Plastic Bank</h4>
              <p className="text-sm text-muted-foreground">
                Transforming ocean-bound plastic waste into empowering income globally
              </p>
            </div>
            <div className="text-center p-6 bg-yellow-50/80 rounded-xl">
              <div className="text-3xl mb-3">🐝</div>
              <h4 className="font-semibold text-forest-text mb-2">EarthLungs Kenya</h4>
              <p className="text-sm text-muted-foreground">
                Creating pollinator habitats and fostering biodiversity through bee conservation
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center space-x-4 bg-forest-primary/5 px-6 py-3 rounded-full">
              <span className="text-sm font-medium text-forest-text">✓ Verified Projects</span>
              <span className="text-sm font-medium text-forest-text">✓ Transparent Tracking</span>
              <span className="text-sm font-medium text-forest-text">✓ Measurable Impact</span>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-br from-forest-primary/10 to-forest-success/10 rounded-2xl p-8">
          <div className="flex justify-center space-x-4 mb-4">
            <div className="text-4xl">🌳</div>
            <div className="text-4xl">🐋</div>
            <div className="text-4xl">☁️</div>
            <div className="text-4xl">🌿</div>
            <div className="text-4xl">💧</div>
            <div className="text-4xl">🐝</div>
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
              🌍 Real Greenspark projects • 📊 Verified tracking • 🔥 Habit streaks
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}