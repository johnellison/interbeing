import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Target, TreePine, Users, Brain, Sparkles, Bot, GraduationCap, BookOpen, Award, TrendingUp, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import interbeingWordmark from "@assets/interbeing-logo-wordmark-no-bg_1758194555072.png";
import interbeingLogo from "@assets/interbeing-app-logo-color-bg_1758122829010.png";
import johnEllisonPhoto from "@assets/john-ellison-health-hacked-flipchart-vertical-cut_1758194425524.webp";

interface FeaturedProject {
  id: string;
  name: string;
  title: string;
  description: string;
  emoji: string;
  impactType: string;
  imageUrl?: string;
  registryLink?: string;
  location?: string;
  projectName?: string;
}

export default function Landing() {
  const { data: featuredProjects, isLoading: projectsLoading, isError } = useQuery<FeaturedProject[]>({
    queryKey: ["/api/featured-projects"],
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
  
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  
  const handleImageError = (projectId: string) => {
    setImageErrors((prev: Set<string>) => new Set(Array.from(prev).concat(projectId)));
  };
  
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-20">
          <Link href="/" aria-label="Interbeing" className="flex items-center hover:opacity-80 transition-opacity">
            <img src={interbeingWordmark} alt="Interbeing" className="h-8" />
          </Link>
          <Button 
            onClick={handleLogin}
            className="gradient-button font-medium px-6 py-2.5 rounded-lg transition-all duration-200"
            data-testid="button-login"
          >
            Sign In
          </Button>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-24">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-8 tracking-tight leading-tight">
            An <span className="gradient-bg">AI-powered</span><br />
            habit tracker for<br />
            <span className="gradient-bg">planetary impact</span>.
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
            Every habit you complete triggers real environmental action through our partnership with <strong className="text-foreground">Greenspark</strong>. 
            Plant trees, rescue plastic, offset carbon, plant kelp, provide clean water, or protect bees. 
            Choose your impact and watch personal growth create authentic change for the planet.
          </p>
          <Button 
            onClick={handleLogin}
            className="gradient-button text-lg px-12 py-4 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            data-testid="button-get-started"
          >
            Get Started
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          <Card className="bg-card border-border hover:border-primary/20 hover:shadow-2xl transition-all duration-300 group">
            <CardHeader className="text-center pb-4">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-200">🌳</div>
              <CardTitle className="text-foreground text-xl font-semibold">Plant Trees</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-muted-foreground leading-relaxed">
                Support reforestation in Oregon through American Forests. Real trees planted 
                to restore wildfire-affected areas and wildlife habitats.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-primary/20 hover:shadow-2xl transition-all duration-300 group">
            <CardHeader className="text-center pb-4">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-200">🐋</div>
              <CardTitle className="text-foreground text-xl font-semibold">Rescue Plastic</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-muted-foreground leading-relaxed">
                Remove ocean-bound plastic through Plastic Bank. Transform waste into 
                empowering income while cleaning our marine ecosystems.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-primary/20 hover:shadow-2xl transition-all duration-300 group">
            <CardHeader className="text-center pb-4">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-200">☁️</div>
              <CardTitle className="text-foreground text-xl font-semibold">Offset Carbon</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-muted-foreground leading-relaxed">
                Fight climate change through Greenspark's verified carbon pool. 
                Support projects with maximum environmental and social benefit.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-primary/20 hover:shadow-2xl transition-all duration-300 group">
            <CardHeader className="text-center pb-4">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-200">🌿</div>
              <CardTitle className="text-foreground text-xl font-semibold">Plant Kelp</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-muted-foreground leading-relaxed">
                Restore marine ecosystems in British Columbia, Canada. Support 
                kelp forest restoration to enhance underwater biodiversity.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-primary/20 hover:shadow-2xl transition-all duration-300 group">
            <CardHeader className="text-center pb-4">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-200">💧</div>
              <CardTitle className="text-foreground text-xl font-semibold">Provide Clean Water</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-muted-foreground leading-relaxed">
                Protect water quality in Florida's Kissimmee Basin. Support 
                watershed protection through strategic forest restoration.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-primary/20 hover:shadow-2xl transition-all duration-300 group">
            <CardHeader className="text-center pb-4">
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-200">🐝</div>
              <CardTitle className="text-foreground text-xl font-semibold">Protect Bees</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-muted-foreground leading-relaxed">
                Create pollinator habitats through EarthLungs in Kenya. Foster 
                biodiversity and support essential ecosystem services.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* How It Works Section */}
        <div className="bg-secondary/30 rounded-3xl p-12 mb-24 border border-border">
          <h3 className="text-4xl font-bold text-foreground text-center mb-12">
            How It Works
          </h3>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <Target className="h-20 w-20 text-primary mx-auto mb-6" />
              <h4 className="text-2xl font-semibold text-foreground mb-4">1. Create Your Habit</h4>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Set up daily routines and choose your preferred environmental impact action and amount.
              </p>
            </div>
            <div className="text-center">
              <Leaf className="h-20 w-20 text-success mx-auto mb-6" />
              <h4 className="text-2xl font-semibold text-foreground mb-4">2. Complete & Track</h4>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Mark habits as complete and watch your streaks grow while tracking your progress.
              </p>
            </div>
            <div className="text-center">
              <Users className="h-20 w-20 text-primary mx-auto mb-6" />
              <h4 className="text-2xl font-semibold text-foreground mb-4">3. Create Real Impact</h4>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Every completion triggers authentic environmental action through our Greenspark partnership with verified global projects.
              </p>
            </div>
          </div>
        </div>

        {/* Science-Backed Approach Section */}
        <div className="bg-card rounded-3xl p-12 mb-24 border border-border">
          <div className="text-center mb-16">
            <div className="flex justify-center items-center space-x-4 mb-8">
              <Brain className="h-12 w-12 text-primary" />
              <GraduationCap className="h-12 w-12 text-success" />
              <BookOpen className="h-12 w-12 text-accent" />
            </div>
            <h3 className="text-4xl font-bold text-foreground mb-6">
              Science-Backed <span className="gradient-bg">Behavior Design</span>
            </h3>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Built on proven methodologies from <strong className="text-foreground">Dr. BJ Fogg's Behavior Design Lab</strong> at Stanford University. 
              Our approach leverages decades of behavioral science research to help you build lasting habits that create meaningful planetary impact.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6 bg-secondary/20 rounded-2xl border border-border">
              <TrendingUp className="h-16 w-16 text-success mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-foreground mb-3">Tiny Habits Method</h4>
              <p className="text-muted-foreground leading-relaxed">
                Start with micro-behaviors that naturally grow into transformative routines. 
                Small changes, massive environmental impact.
              </p>
            </div>
            
            <div className="text-center p-6 bg-secondary/20 rounded-2xl border border-border">
              <Sparkles className="h-16 w-16 text-primary mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-foreground mb-3">Motivation + Ability</h4>
              <p className="text-muted-foreground leading-relaxed">
                Scientifically-designed prompts that align with your capability and motivation 
                to ensure sustainable habit formation.
              </p>
            </div>
            
            <div className="text-center p-6 bg-secondary/20 rounded-2xl border border-border md:col-span-2 lg:col-span-1">
              <Award className="h-16 w-16 text-accent mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-foreground mb-3">Behavioral Science</h4>
              <p className="text-muted-foreground leading-relaxed">
                Proven frameworks from Stanford's leading behavior change research 
                applied to environmental action.
              </p>
            </div>
          </div>
        </div>

        {/* John Ellison Coach Section */}
        <div className="bg-secondary/30 rounded-3xl p-12 mb-24 border border-border">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="mb-6">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">Your AI Coach</h4>
                <h3 className="text-3xl font-bold text-foreground">Meet John Ellison</h3>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Certified Behavior Design Teacher</strong> on Dr. BJ Fogg's teaching team at Stanford
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-success rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Expert in translating behavioral science into practical, <strong className="text-foreground">actionable habit strategies</strong>
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Specializes in <strong className="text-foreground">environmental behavior change</strong> and sustainable impact creation
                  </p>
                </div>
              </div>
              
              <div className="bg-primary/10 p-6 rounded-xl border border-primary/20">
                <p className="text-lg italic text-foreground leading-relaxed">
                  "Every small action, when designed scientifically and sustained consistently, 
                  becomes a powerful force for planetary transformation."
                </p>
                <p className="text-sm text-muted-foreground mt-2 font-medium">— John Ellison, Behavior Design Coach</p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="relative">
                <div className="w-80 h-80 mx-auto mb-8 rounded-3xl border border-border overflow-hidden">
                  <img 
                    src={johnEllisonPhoto} 
                    alt="John Ellison, Behavior Design Coach" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Features Section */}
        <div className="bg-card rounded-3xl p-12 mb-24 border border-border">
          <div className="text-center mb-16">
            <div className="flex justify-center items-center space-x-4 mb-8">
              <Bot className="h-12 w-12 text-primary animate-pulse" />
              <Sparkles className="h-12 w-12 text-secondary" />
              <Zap className="h-12 w-12 text-accent" />
            </div>
            <h3 className="text-4xl font-bold text-foreground mb-6">
              Powered by <span className="gradient-bg">Advanced AI</span>
            </h3>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-8">
              Experience personalized coaching, adaptive recommendations, and intelligent habit optimization 
              powered by cutting-edge artificial intelligence.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="p-8 bg-secondary/20 rounded-2xl border border-border">
              <div className="flex items-center space-x-3 mb-4">
                <Bot className="h-8 w-8 text-primary" />
                <h4 className="text-2xl font-semibold text-foreground">Intelligent Coaching</h4>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                John Ellison AI provides personalized guidance based on your unique goals, 
                preferences, and behavioral patterns.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2 text-muted-foreground">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Personalized habit recommendations</span>
                </li>
                <li className="flex items-center space-x-2 text-muted-foreground">
                  <div className="w-1.5 h-1.5 bg-success rounded-full"></div>
                  <span>Adaptive difficulty adjustment</span>
                </li>
                <li className="flex items-center space-x-2 text-muted-foreground">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                  <span>Science-backed motivation techniques</span>
                </li>
              </ul>
            </div>
            
            <div className="p-8 bg-secondary/20 rounded-2xl border border-border">
              <div className="flex items-center space-x-3 mb-4">
                <TrendingUp className="h-8 w-8 text-success" />
                <h4 className="text-2xl font-semibold text-foreground">Smart Analytics</h4>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                Advanced pattern recognition identifies what works best for you and 
                optimizes your habit-building journey.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2 text-muted-foreground">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span>Behavioral pattern analysis</span>
                </li>
                <li className="flex items-center space-x-2 text-muted-foreground">
                  <div className="w-1.5 h-1.5 bg-success rounded-full"></div>
                  <span>Predictive success modeling</span>
                </li>
                <li className="flex items-center space-x-2 text-muted-foreground">
                  <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                  <span>Impact optimization suggestions</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="text-center bg-primary/5 p-8 rounded-2xl border border-primary/20">
            <h4 className="text-2xl font-semibold text-foreground mb-4">
              🚀 Coming Soon: Next-Generation AI Features
            </h4>
            <div className="grid md:grid-cols-3 gap-6 text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span>Real-time habit coaching</span>
              </div>
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-success" />
                <span>Emotional intelligence insights</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-accent" />
                <span>Automated habit optimization</span>
              </div>
            </div>
          </div>
        </div>

        {/* Greenspark Partnership Section */}
        <div className="bg-card rounded-3xl p-12 mb-24 border border-border">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold text-foreground mb-6">
              Powered by <span className="text-primary">Greenspark</span>
            </h3>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              We partner with Greenspark to ensure every environmental action is authentic, verified, and trackable. 
              Our impact is driven by real projects with transparent reporting and measurable results.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {projectsLoading ? (
              // Loading skeleton for project cards
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="text-center p-8 bg-secondary/20 rounded-2xl border border-border animate-pulse">
                  <div className="w-20 h-20 bg-muted rounded-lg mx-auto mb-4"></div>
                  <div className="h-5 bg-muted rounded w-3/4 mx-auto mb-3"></div>
                  <div className="h-4 bg-muted rounded w-full mb-2"></div>
                  <div className="h-4 bg-muted rounded w-2/3 mx-auto"></div>
                </div>
              ))
            ) : isError ? (
              // Error fallback with static content
              [
                { id: 'american-forests', name: 'American Forests', emoji: '🌲', description: 'Restoring Oregon\'s wildfire-affected areas with native Pacific Northwest trees' },
                { id: 'plastic-bank', name: 'Plastic Bank', emoji: '🌊', description: 'Transforming ocean-bound plastic waste into empowering income globally' },
                { id: 'earthlungs-kenya', name: 'EarthLungs Kenya', emoji: '🐝', description: 'Creating pollinator habitats and fostering biodiversity through bee conservation' }
              ].map((project) => (
                <div key={project.id} className="text-center p-6 bg-secondary/20 rounded-2xl border border-border opacity-75">
                  <div className="w-full h-32 flex items-center justify-center text-5xl bg-secondary/30 rounded-xl mb-4">
                    {project.emoji}
                  </div>
                  <h4 className="font-semibold text-foreground mb-3 text-lg">{project.name}</h4>
                  <p className="text-muted-foreground leading-relaxed text-sm">{project.description}</p>
                </div>
              ))
            ) : (
              // Render actual project cards with images
              (featuredProjects || []).map((project) => {
                const hasImageError = imageErrors.has(project.id);
                const shouldShowImage = project.imageUrl && !hasImageError;
                
                return (
                  <div 
                    key={project.id} 
                    className="text-center p-6 bg-secondary/20 rounded-2xl border border-border hover:border-primary/20 transition-all duration-300 hover:shadow-lg group cursor-pointer" 
                    data-testid={`project-${project.id}`}
                    onClick={() => project.registryLink && window.open(project.registryLink, '_blank')}
                  >
                    <div className="mb-4 overflow-hidden rounded-xl">
                      {shouldShowImage ? (
                        <img 
                          src={project.imageUrl}
                          alt={`${project.name} project`}
                          className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={() => handleImageError(project.id)}
                          data-testid={`img-project-${project.id}`}
                        />
                      ) : (
                        <div className="w-full h-32 flex items-center justify-center text-5xl bg-secondary/30 rounded-xl group-hover:scale-105 transition-transform duration-300">
                          {project.emoji}
                        </div>
                      )}
                    </div>
                    <h4 className="font-semibold text-foreground mb-3 text-lg" data-testid={`text-project-name-${project.id}`}>
                      {project.name}
                    </h4>
                    <p className="text-muted-foreground leading-relaxed text-sm mb-3">
                      {project.description}
                    </p>
                    <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground/70">
                      {project.location && (
                        <span className="flex items-center gap-1">
                          📍 {project.location}
                        </span>
                      )}
                      {project.registryLink && (
                        <span className="flex items-center gap-1 text-primary/70 hover:text-primary transition-colors">
                          🔗 View Project
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center space-x-6 bg-primary/10 px-8 py-4 rounded-full border border-primary/20">
              <span className="text-sm font-medium text-foreground">✓ Verified Projects</span>
              <span className="text-sm font-medium text-foreground">✓ Transparent Tracking</span>
              <span className="text-sm font-medium text-foreground">✓ Measurable Impact</span>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-secondary/30 rounded-3xl p-16 border border-border">
          <div className="flex justify-center space-x-6 mb-8">
            <div className="text-5xl">🌳</div>
            <div className="text-5xl">🐋</div>
            <div className="text-5xl">☁️</div>
            <div className="text-5xl">🌿</div>
            <div className="text-5xl">💧</div>
            <div className="text-5xl">🐝</div>
          </div>
          <h3 className="text-4xl font-bold text-foreground mb-6">
            Ready to Transform Habits into Impact?
          </h3>
          <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
            Join the movement of people who are building better habits while creating 
            measurable environmental change. Choose your impact, track your progress, 
            and watch personal growth create real-world transformation.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button 
              onClick={handleLogin}
              className="gradient-button text-xl px-12 py-4 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              data-testid="button-join-now"
            >
              Start Creating Impact
            </Button>
            <p className="text-base text-muted-foreground">
              🌍 Real Greenspark projects • 📊 Verified tracking • 🔥 Habit streaks
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}