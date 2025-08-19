import { useLocation } from "wouter";
import { Sprout, Home as HomeIcon, BarChart, Globe, Clock, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface NavigationProps {
  currentPage?: string;
}

export default function Navigation({ currentPage }: NavigationProps) {
  const [location, setLocation] = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const navigationItems = [
    { path: "/", label: "Dashboard", icon: HomeIcon, testId: "nav-dashboard" },
    { path: "/analytics", label: "Analytics", icon: BarChart, testId: "nav-analytics" },
    { path: "/impact-map", label: "Impact Map", icon: Globe, testId: "nav-impact-map" },
    { path: "/impact-timeline", label: "Timeline", icon: Clock, testId: "nav-timeline" },
  ];

  const isActive = (path: string) => {
    if (currentPage) return path === currentPage;
    return location === path || (path === "/" && location === "/");
  };

  return (
    <nav className="bg-forest-primary text-white shadow-lg sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <Sprout className="h-8 w-8 text-forest-secondary" />
            </div>
            <h1 className="text-xl font-bold font-inter" data-testid="app-title">
              Interbeing
            </h1>
          </div>
          
          <div className="hidden md:flex items-center space-x-1">
            {/* Main Navigation Links */}
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.path);
              
              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation(item.path)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-organic transition-colors ${
                    active 
                      ? 'bg-forest-secondary/30 text-white' 
                      : 'text-white hover:bg-forest-secondary/20'
                  }`}
                  data-testid={item.testId}
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Button>
              );
            })}
            
            <div className="h-6 w-px bg-forest-secondary/30 mx-2" />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 rounded-organic hover:bg-forest-secondary/20 transition-colors text-white"
              data-testid="button-logout"
            >
              <span className="text-sm font-medium">Logout</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="p-2 rounded-organic hover:bg-forest-secondary/20 transition-colors"
              data-testid="button-user-settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden p-2 rounded-organic hover:bg-forest-secondary/20 transition-colors"
            data-testid="button-mobile-menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}