import { useState } from "react";
import { useLocation } from "wouter";
import { Sprout, Home as HomeIcon, BarChart, Globe, Clock, Settings, Plus, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

interface NavigationProps {
  currentPage?: string;
  onAddHabitClick?: () => void;
}

export default function Navigation({ currentPage, onAddHabitClick }: NavigationProps) {
  const [location, setLocation] = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const navigationItems = [
    { path: "/", label: "Today", icon: HomeIcon, testId: "nav-dashboard" },
    { path: "/analytics", label: "Stats", icon: BarChart, testId: "nav-analytics" },
    { path: "/impact-map", label: "Explore", icon: Globe, testId: "nav-impact-map" },
    { path: "/impact-timeline", label: "Timeline", icon: Clock, testId: "nav-timeline" },
  ];

  const isActive = (path: string) => {
    if (currentPage) return path === currentPage;
    return location === path || (path === "/" && location === "/");
  };

  return (
    <>
      {/* Top Navigation - Mobile Settings Bar */}
      <nav className="bg-card text-white shadow-sm sticky top-0 z-40 md:hidden">
        <div className="flex justify-between items-center px-4 py-3">
          <div className="flex items-center space-x-3">
            <Sprout className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-semibold" data-testid="app-title">
              Interbeing
            </h1>
          </div>
          
          {/* Settings Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                data-testid="button-settings-dropdown"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* Desktop Navigation - Traditional Top Nav */}
      <nav className="hidden md:block bg-card text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <Sprout className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-xl font-bold font-inter" data-testid="app-title">
                Interbeing
              </h1>
            </div>
            
            <div className="flex items-center space-x-1">
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
                        ? 'bg-primary/20 text-primary' 
                        : 'text-white hover:bg-primary/10'
                    }`}
                    data-testid={item.testId}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Button>
                );
              })}
              
              <div className="h-6 w-px bg-primary/30 mx-2" />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-organic hover:bg-primary/10 transition-colors text-white"
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
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation - Curved with Floating Add Button */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        {/* Floating Add Button */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -top-6 z-10">
          <Button
            onClick={onAddHabitClick}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full w-12 h-12 p-0 shadow-xl transition-all duration-200 hover:scale-105"
            data-testid="button-add-habit-mobile"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        {/* Curved Navigation Bar */}
        <nav className="relative">
          {/* Navigation Background with Curve */}
          <div 
            className="bg-card mx-3 mb-2 rounded-t-3xl shadow-2xl relative overflow-hidden"
            style={{
              height: '80px',
              background: 'hsl(var(--card))',
            }}
          >
            {/* Curved Notch for Button */}
            <div 
              className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-8 bg-background rounded-b-full"
              style={{
                clipPath: 'ellipse(32px 16px at 50% 0%)'
              }}
            ></div>
            
            {/* Navigation Content */}
            <div className="flex items-end justify-around px-4 py-4 h-full">
              {/* Left Navigation Items */}
              <div className="flex flex-1 justify-around items-center">
                {navigationItems.slice(0, 2).map((item) => {
                  const IconComponent = item.icon;
                  const active = isActive(item.path);
                  
                  return (
                    <Button
                      key={item.path}
                      variant="ghost"
                      size="sm"
                      onClick={() => setLocation(item.path)}
                      className={`flex flex-col items-center justify-center p-2 min-h-[48px] transition-colors ${
                        active 
                          ? 'text-primary' 
                          : 'text-muted-foreground hover:text-[#D9FF00]'
                      }`}
                      data-testid={item.testId}
                    >
                      <IconComponent className="h-5 w-5 mb-1" />
                      <span className="text-xs font-medium">{item.label}</span>
                    </Button>
                  );
                })}
              </div>

              {/* Center Space for Floating Button */}
              <div className="flex justify-center px-6">
                {/* Empty space for floating button */}
              </div>

              {/* Right Navigation Items */}
              <div className="flex flex-1 justify-around items-center">
                {navigationItems.slice(2, 4).map((item) => {
                  const IconComponent = item.icon;
                  const active = isActive(item.path);
                  
                  return (
                    <Button
                      key={item.path}
                      variant="ghost"
                      size="sm"
                      onClick={() => setLocation(item.path)}
                      className={`flex flex-col items-center justify-center p-2 min-h-[48px] transition-colors ${
                        active 
                          ? 'text-primary' 
                          : 'text-muted-foreground hover:text-[#D9FF00]'
                      }`}
                      data-testid={item.testId}
                    >
                      <IconComponent className="h-5 w-5 mb-1" />
                      <span className="text-xs font-medium">{item.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>
            
            {/* Home indicator safe area */}
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-card"></div>
          </div>
        </nav>
      </div>
    </>
  );
}