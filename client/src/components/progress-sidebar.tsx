import { BarChart3, MapPin, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProgressSidebarProps {
  weeklyProgress: Array<{
    day: string;
    completed: number;
    total: number;
    isToday: boolean;
  }>;
  monthlyTrees: number;
  co2Offset: number;
}

export default function ProgressSidebar({ weeklyProgress, monthlyTrees, co2Offset }: ProgressSidebarProps) {
  const weeklyCompletion = weeklyProgress.length > 0 
    ? Math.round((weeklyProgress.reduce((acc, day) => acc + day.completed, 0) / 
       weeklyProgress.reduce((acc, day) => acc + day.total, 0)) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Weekly Progress Chart */}
      <div className="forest-card p-6" data-testid="card-weekly-progress">
        <h3 className="text-lg font-semibold text-forest-text mb-4">This Week's Progress</h3>
        
        <div className="space-y-3">
          {weeklyProgress.map((day, index) => (
            <div
              key={`${day.day}-${index}`}
              className={`flex items-center justify-between ${
                day.isToday ? 'bg-forest-success/10 p-2 rounded-organic' : ''
              }`}
              data-testid={`progress-day-${day.day.toLowerCase()}`}
            >
              <span className="text-sm font-medium text-forest-text">
                {day.day}
              </span>
              <div className="flex space-x-1">
                {Array.from({ length: day.total }, (_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-sm ${
                      i < day.completed 
                        ? 'bg-forest-success' 
                        : 'bg-forest-text/20'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-forest-text/70">
                {day.completed}/{day.total}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-forest-secondary/20">
          <p className="text-sm text-forest-text/70">
            Weekly completion: <span className="font-semibold text-forest-accent" data-testid="text-weekly-completion">{weeklyCompletion}%</span>
          </p>
        </div>
      </div>

      {/* Environmental Impact Summary */}
      <div className="forest-card p-6" data-testid="card-environmental-impact">
        <h3 className="text-lg font-semibold text-forest-text mb-4">Impact Actions</h3>
        
        {/* Environmental Impact Image */}
        <div className="rounded-organic w-full h-32 bg-gradient-to-b from-blue-100 to-green-100 mb-4 flex items-center justify-center overflow-hidden" data-testid="img-environmental-impact">
          <svg viewBox="0 0 400 200" className="w-full h-full object-cover">
            <defs>
              <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{stopColor:'#87CEEB', stopOpacity:1}} />
                <stop offset="100%" style={{stopColor:'#E0F6FF', stopOpacity:1}} />
              </linearGradient>
              <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{stopColor:'#4682B4', stopOpacity:1}} />
                <stop offset="100%" style={{stopColor:'#1E90FF', stopOpacity:1}} />
              </linearGradient>
              <linearGradient id="grassGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{stopColor:'#90EE90', stopOpacity:1}} />
                <stop offset="100%" style={{stopColor:'#228B22', stopOpacity:1}} />
              </linearGradient>
            </defs>
            
            {/* Sky background */}
            <rect width="400" height="120" fill="url(#skyGradient)" />
            
            {/* Ocean/water */}
            <rect y="120" width="400" height="50" fill="url(#oceanGradient)" />
            
            {/* Ground */}
            <rect y="170" width="400" height="30" fill="url(#grassGradient)" />
            
            {/* Mountains in background */}
            <polygon points="0,120 80,80 160,120" fill="#8B7355" opacity="0.6"/>
            <polygon points="120,120 200,70 280,120" fill="#A0522D" opacity="0.5"/>
            <polygon points="240,120 320,85 400,120" fill="#8B7355" opacity="0.4"/>
            
            {/* Trees (representing tree planting) */}
            <g transform="translate(60,140)">
              <rect x="-2" y="15" width="4" height="15" fill="#8B4513"/>
              <circle cx="0" cy="12" r="12" fill="#228B22"/>
              <circle cx="-6" cy="8" r="8" fill="#32CD32"/>
              <circle cx="6" cy="8" r="8" fill="#32CD32"/>
            </g>
            
            <g transform="translate(120,135)">
              <rect x="-3" y="20" width="6" height="20" fill="#8B4513"/>
              <circle cx="0" cy="15" r="15" fill="#228B22"/>
              <circle cx="-8" cy="10" r="10" fill="#32CD32"/>
              <circle cx="8" cy="10" r="10" fill="#32CD32"/>
            </g>
            
            {/* Ocean cleanup elements */}
            <g transform="translate(200,135)">
              {/* Cleanup boat */}
              <ellipse cx="0" cy="0" rx="25" ry="8" fill="#4169E1"/>
              <rect x="-20" y="-8" width="40" height="4" fill="#FFD700"/>
              {/* Mast */}
              <line x1="0" y1="-8" x2="0" y2="-25" stroke="#8B4513" strokeWidth="2"/>
              {/* Flag */}
              <polygon points="0,-25 15,-20 0,-15" fill="#FF6347"/>
            </g>
            
            {/* Waste being cleaned */}
            <circle cx="250" cy="145" r="3" fill="#FF4500" opacity="0.7"/>
            <circle cx="180" cy="148" r="2" fill="#FF6347" opacity="0.7"/>
            <rect x="220" y="147" width="4" height="2" fill="#8B4513" opacity="0.7"/>
            
            {/* Carbon capture facility */}
            <g transform="translate(320,150)">
              <rect x="-15" y="0" width="30" height="25" fill="#708090"/>
              <rect x="-12" y="3" width="8" height="8" fill="#4169E1" opacity="0.6"/>
              <rect x="4" y="3" width="8" height="8" fill="#4169E1" opacity="0.6"/>
              {/* Smokestack with clean air */}
              <rect x="-2" y="-10" width="4" height="10" fill="#696969"/>
              <circle cx="0" cy="-15" r="3" fill="#E6E6FA" opacity="0.8"/>
              <circle cx="-3" cy="-18" r="2" fill="#E6E6FA" opacity="0.6"/>
              <circle cx="3" cy="-18" r="2" fill="#E6E6FA" opacity="0.6"/>
            </g>
            
            {/* Donation/helping hands symbol */}
            <g transform="translate(280,110)">
              {/* Hands giving/helping */}
              <ellipse cx="0" cy="0" rx="8" ry="12" fill="#F4A460" transform="rotate(-20)"/>
              <ellipse cx="12" cy="5" rx="8" ry="12" fill="#F4A460" transform="rotate(20)"/>
              {/* Heart symbol for donation */}
              <path d="M6,8 C6,6 8,4 10,4 C12,4 14,6 14,8 C14,12 10,16 10,16 S6,12 6,8 Z" fill="#FF69B4"/>
            </g>
            
            {/* Clouds */}
            <g fill="white" opacity="0.8">
              <circle cx="50" cy="40" r="12"/>
              <circle cx="65" cy="35" r="15"/>
              <circle cx="80" cy="40" r="12"/>
              
              <circle cx="300" cy="30" r="10"/>
              <circle cx="315" cy="25" r="12"/>
              <circle cx="330" cy="30" r="10"/>
            </g>
            
            {/* Sun */}
            <circle cx="350" cy="50" r="20" fill="#FFD700" opacity="0.9"/>
            <g stroke="#FFD700" strokeWidth="2" opacity="0.7">
              <line x1="350" y1="15" x2="350" y2="25"/>
              <line x1="350" y1="75" x2="350" y2="85"/>
              <line x1="315" y1="50" x2="325" y2="50"/>
              <line x1="375" y1="50" x2="385" y2="50"/>
              <line x1="327" y1="27" x2="334" y2="34"/>
              <line x1="366" y1="66" x2="373" y2="73"/>
              <line x1="327" y1="73" x2="334" y2="66"/>
              <line x1="366" y1="34" x2="373" y2="27"/>
            </g>
          </svg>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-forest-success">🌳</span>
              <span className="text-sm text-forest-text">Trees planted</span>
            </div>
            <span className="font-semibold text-forest-success" data-testid="text-sidebar-trees">
              Global
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-blue-500">🌊</span>
              <span className="text-sm text-forest-text">Ocean cleanup</span>
            </div>
            <span className="font-semibold text-blue-500" data-testid="text-sidebar-ocean">
              Active
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">💨</span>
              <span className="text-sm text-forest-text">Carbon capture</span>
            </div>
            <span className="font-semibold text-gray-500" data-testid="text-sidebar-carbon">
              Direct Air
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-green-600">💰</span>
              <span className="text-sm text-forest-text">Donations</span>
            </div>
            <span className="font-semibold text-green-600" data-testid="text-sidebar-donations">
              Verified NGOs
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-forest-secondary/20">
          <p className="text-xs text-forest-text/70">
            🌍 Your habits create real environmental impact through 1ClickImpact's verified partners and transparent tracking.
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="forest-card p-6" data-testid="card-quick-actions">
        <h3 className="text-lg font-semibold text-forest-text mb-4">Quick Actions</h3>
        
        <div className="space-y-3">
          <Button
            variant="ghost"
            className="w-full justify-start p-3 hover:bg-forest-bg rounded-organic transition-colors"
            data-testid="button-view-habits"
          >
            <BarChart3 className="h-4 w-4 mr-3 text-forest-primary" />
            <span className="text-sm text-forest-text">View All Habits</span>
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start p-3 hover:bg-forest-bg rounded-organic transition-colors"
            data-testid="button-progress-report"
          >
            <TrendingUp className="h-4 w-4 mr-3 text-forest-accent" />
            <span className="text-sm text-forest-text">Progress Report</span>
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start p-3 hover:bg-forest-bg rounded-organic transition-colors"
            data-testid="button-impact-map"
          >
            <MapPin className="h-4 w-4 mr-3 text-forest-success" />
            <span className="text-sm text-forest-text">Impact Map</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
