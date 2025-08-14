import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from "recharts";
import { Calendar, TreePine, Waves, Factory, Heart, MapPin, TrendingUp, Target } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
// Using a simple world map component instead of react-leaflet due to version conflicts

interface HabitAnalytics {
  habits: Array<{
    id: string;
    name: string;
    category: string;
    streak: number;
    totalCompletions: number;
    impactAction: string;
    impactAmount: number;
    totalImpactEarned: number;
  }>;
  progressData: Array<{
    date: string;
    completions: number;
    treesPlanted: number;
    oceanCleaned: number;
    carbonCaptured: number;
    donated: number;
  }>;
  impactSummary: {
    totalTrees: number;
    totalOceanCleaned: number;
    totalCarbonCaptured: number;
    totalDonated: number;
  };
}

// Mock impact projects data
const impactProjects = [
  {
    id: 1,
    name: "Kakamega Forest Restoration",
    location: "Kenya",
    coordinates: [-0.2667, 34.75] as [number, number],
    type: "plant_tree",
    description: "Restoring indigenous forest in western Kenya with native species",
    impact: "15,000 trees planted",
    icon: "🌳",
    color: "#22c55e"
  },
  {
    id: 2,
    name: "Gulf of Mexico Cleanup",
    location: "Mexico",
    coordinates: [19.4326, -99.1332] as [number, number],
    type: "clean_ocean",
    description: "Marine debris removal and coastal restoration",
    impact: "2,500 lbs waste removed",
    icon: "🌊",
    color: "#3b82f6"
  },
  {
    id: 3,
    name: "Bali Biochar Initiative",
    location: "Bali, Indonesia",
    coordinates: [-8.4095, 115.1889] as [number, number],
    type: "capture_carbon",
    description: "Converting agricultural waste into carbon-capturing biochar",
    impact: "500 tons CO₂ captured",
    icon: "🏭",
    color: "#8b5cf6"
  },
  {
    id: 4,
    name: "charity: water",
    location: "Global",
    coordinates: [40.7128, -74.0060] as [number, number],
    type: "donate_money",
    description: "Providing clean water access to communities worldwide",
    impact: "$45,000 donated",
    icon: "💧",
    color: "#f59e0b"
  }
];

// Generate mock progress data for the last 30 days
const generateProgressData = () => {
  const data = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const completions = Math.floor(Math.random() * 8) + 1;
    data.push({
      date: date.toISOString().split('T')[0],
      completions,
      treesPlanted: Math.floor(Math.random() * 3) + 1,
      oceanCleaned: Math.floor(Math.random() * 2) + 1,
      carbonCaptured: Math.floor(Math.random() * 2) + 1,
      donated: Math.floor(Math.random() * 200) + 50,
    });
  }
  
  return data;
};

// Generate mock category distribution data
const generateCategoryData = (habits: any[] = []) => {
  if (!habits || habits.length === 0) {
    return [
      { name: 'Wellness', value: 3 },
      { name: 'Fitness', value: 2 },
      { name: 'Learning', value: 2 },
      { name: 'Mindfulness', value: 1 }
    ];
  }
  
  const categories = habits.reduce((acc, habit) => {
    acc[habit.category] = (acc[habit.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(categories).map(([name, value]) => ({ name, value }));
};

const COLORS = ['#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

export default function Analytics() {
  const { user } = useAuth();

  const { data: analytics, isLoading } = useQuery<HabitAnalytics>({
    queryKey: ["/api/analytics"],
    enabled: !!user,
  });

  const { data: habits } = useQuery({
    queryKey: ["/api/habits"],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-forest-secondary rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-forest-secondary rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Generate mock data if analytics not available
  const mockProgressData = generateProgressData();
  const categoryData = generateCategoryData(habits || []);
  
  const impactSummary = analytics?.impactSummary || {
    totalTrees: 127,
    totalOceanCleaned: 45,
    totalCarbonCaptured: 23,
    totalDonated: 12400
  };

  const impactTypeData = [
    { name: 'Trees Planted', value: impactSummary.totalTrees, color: '#22c55e', icon: '🌳' },
    { name: 'Ocean Cleaned (lbs)', value: impactSummary.totalOceanCleaned, color: '#3b82f6', icon: '🌊' },
    { name: 'Carbon Captured (lbs)', value: impactSummary.totalCarbonCaptured, color: '#8b5cf6', icon: '🏭' },
    { name: 'Donated (cents)', value: impactSummary.totalDonated, color: '#f59e0b', icon: '💧' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-forest-text mb-2" data-testid="heading-analytics">Analytics Dashboard</h1>
        <p className="text-forest-text/70">Track your habits and environmental impact over time</p>
      </div>

      {/* Impact Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {impactTypeData.map((item) => (
          <Card key={item.name} className="forest-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-forest-text/70">
                {item.name}
              </CardTitle>
              <span className="text-2xl">{item.icon}</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-forest-text" data-testid={`metric-${item.name.toLowerCase().replace(/\s+/g, '-')}`}>
                {item.value.toLocaleString()}
              </div>
              <p className="text-xs text-forest-text/50 mt-1">
                Total generated
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="habits" data-testid="tab-habits">All Habits</TabsTrigger>
          <TabsTrigger value="progress" data-testid="tab-progress">Progress Report</TabsTrigger>
          <TabsTrigger value="impact-map" data-testid="tab-impact-map">Impact Map</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="forest-card">
              <CardHeader>
                <CardTitle className="text-forest-text">Habit Categories</CardTitle>
                <CardDescription>Distribution of your habits by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="forest-card">
              <CardHeader>
                <CardTitle className="text-forest-text">Impact Distribution</CardTitle>
                <CardDescription>Your environmental impact by type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={impactTypeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* All Habits Tab */}
        <TabsContent value="habits" className="space-y-6">
          <Card className="forest-card">
            <CardHeader>
              <CardTitle className="text-forest-text">Your Habits Overview</CardTitle>
              <CardDescription>Complete breakdown of all your tracked habits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {(habits || []).map((habit: any) => (
                  <div key={habit.id} className="flex items-center justify-between p-4 border border-forest-secondary/20 rounded-lg" data-testid={`habit-card-${habit.id}`}>
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{habit.icon}</div>
                      <div>
                        <h3 className="font-semibold text-forest-text">{habit.name}</h3>
                        <p className="text-sm text-forest-text/70">{habit.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-lg font-bold text-forest-accent">{habit.streak}</div>
                        <div className="text-xs text-forest-text/70">Current Streak</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-forest-primary">{habit.totalImpactEarned}</div>
                        <div className="text-xs text-forest-text/70">Total Impact</div>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {habit.impactAction.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Report Tab */}
        <TabsContent value="progress" className="space-y-6">
          <div className="grid gap-6">
            <Card className="forest-card">
              <CardHeader>
                <CardTitle className="text-forest-text">Daily Habit Completions</CardTitle>
                <CardDescription>Your consistency over the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={mockProgressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      formatter={(value: any, name: string) => [value, name.replace(/([A-Z])/g, ' $1').trim()]}
                    />
                    <Area type="monotone" dataKey="completions" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="forest-card">
              <CardHeader>
                <CardTitle className="text-forest-text">Environmental Impact Over Time</CardTitle>
                <CardDescription>Track your positive environmental contributions</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={mockProgressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    />
                    <Line type="monotone" dataKey="treesPlanted" stroke="#22c55e" strokeWidth={2} name="Trees Planted" />
                    <Line type="monotone" dataKey="oceanCleaned" stroke="#3b82f6" strokeWidth={2} name="Ocean Cleaned (lbs)" />
                    <Line type="monotone" dataKey="carbonCaptured" stroke="#8b5cf6" strokeWidth={2} name="Carbon Captured (lbs)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Impact Map Tab */}
        <TabsContent value="impact-map" className="space-y-6">
          <Card className="forest-card">
            <CardHeader>
              <CardTitle className="text-forest-text">Global Impact Projects</CardTitle>
              <CardDescription>See where your habits are making a difference around the world</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 w-full rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-green-50 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg viewBox="0 0 1000 500" className="w-full h-full">
                    {/* Simple world map outline */}
                    <path 
                      d="M100 200 Q200 150 400 200 Q600 180 800 220 Q900 200 1000 240 L1000 400 Q800 350 600 380 Q400 360 200 350 Q100 340 50 380 Z" 
                      fill="#e0f2fe" 
                      stroke="#0284c7" 
                      strokeWidth="2"
                    />
                    
                    {/* Project markers */}
                    {impactProjects.map((project, index) => {
                      const x = 150 + (index * 200);
                      const y = 200 + (Math.sin(index) * 50);
                      return (
                        <g key={project.id}>
                          <circle 
                            cx={x} 
                            cy={y} 
                            r="8" 
                            fill={project.color}
                            className="cursor-pointer hover:r-10 transition-all"
                          />
                          <text 
                            x={x} 
                            y={y - 15} 
                            textAnchor="middle" 
                            className="text-xs font-medium fill-gray-700"
                          >
                            {project.icon}
                          </text>
                          <text 
                            x={x} 
                            y={y + 25} 
                            textAnchor="middle" 
                            className="text-xs fill-gray-600"
                          >
                            {project.location}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {impactProjects.map((project) => (
                  <div key={project.id} className="p-4 border border-forest-secondary/20 rounded-lg" data-testid={`project-card-${project.id}`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xl">{project.icon}</span>
                      <h3 className="font-semibold text-sm text-forest-text">{project.name}</h3>
                    </div>
                    <p className="text-xs text-forest-text/70 mb-1">{project.location}</p>
                    <p className="text-xs text-forest-text/60 mb-2">{project.description}</p>
                    <div className="text-xs font-semibold" style={{ color: project.color }}>
                      {project.impact}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}