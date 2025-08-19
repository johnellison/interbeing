import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Globe, MapPin, TreePine, Droplets, Leaf, Bug, Waves, Cloud } from "lucide-react";

interface ImpactLocation {
  id: string;
  country: string;
  region: string;
  coordinates: [number, number]; // [longitude, latitude]
  impactType: 'plant_tree' | 'rescue_plastic' | 'offset_carbon' | 'plant_kelp' | 'provide_water' | 'sponsor_bees';
  totalAmount: number;
  projectName: string;
  projectDescription: string;
  completionCount: number;
}

const impactIcons = {
  plant_tree: TreePine,
  rescue_plastic: Waves,
  offset_carbon: Cloud,
  plant_kelp: Leaf,
  provide_water: Droplets,
  sponsor_bees: Bug,
};

const impactColors = {
  plant_tree: "text-green-600 bg-green-50",
  rescue_plastic: "text-blue-600 bg-blue-50",
  offset_carbon: "text-gray-600 bg-gray-50",
  plant_kelp: "text-green-500 bg-green-50",
  provide_water: "text-blue-500 bg-blue-50",
  sponsor_bees: "text-yellow-600 bg-yellow-50",
};

const impactEmojis = {
  plant_tree: "🌳",
  rescue_plastic: "🐋",
  offset_carbon: "☁️",
  plant_kelp: "🌿",
  provide_water: "💧",
  sponsor_bees: "🐝",
};

// World map SVG path data for major continents
const worldMapPaths = {
  // North America
  northAmerica: "M158,45 Q175,35 195,40 L240,35 L270,45 L290,60 L285,80 L275,95 L250,105 L220,100 L190,95 L165,85 L155,65 Z",
  // South America  
  southAmerica: "M200,140 Q215,135 230,145 L235,165 L240,185 L235,205 L225,220 L210,225 L195,220 L185,205 L180,185 L185,165 L195,150 Z",
  // Europe
  europe: "M320,45 Q340,40 360,45 L380,50 L385,65 L375,75 L355,80 L335,75 L325,65 L322,55 Z",
  // Africa
  africa: "M315,85 Q335,80 355,85 L365,105 L370,125 L365,145 L355,165 L340,175 L325,170 L315,155 L310,135 L312,115 L315,95 Z",
  // Asia
  asia: "M390,40 Q420,35 450,40 L480,45 L510,50 L530,65 L535,85 L525,100 L500,105 L475,100 L450,95 L425,90 L400,85 L385,70 L385,55 Z",
  // Australia
  australia: "M480,160 Q500,155 520,160 L535,170 L530,180 L515,185 L495,180 L485,175 L480,165 Z",
  // Antarctica
  antarctica: "M150,220 Q200,215 250,220 L300,225 L350,230 L400,235 L450,240 L500,235 L550,230 L570,235 L565,245 L520,250 L450,255 L380,250 L310,245 L240,240 L170,235 L150,230 Z"
};

export default function ImpactMap() {
  const [selectedLocation, setSelectedLocation] = useState<ImpactLocation | null>(null);

  const { data: impactLocations, isLoading } = useQuery<ImpactLocation[]>({
    queryKey: ["/api/impact-locations"],
  });

  // Mock data for demonstration (in real implementation, this would come from Greenspark API)
  const mockLocations: ImpactLocation[] = [
    {
      id: "kenya-trees",
      country: "Kenya",
      region: "Central Kenya",
      coordinates: [37.0902, -0.0236],
      impactType: "plant_tree",
      totalAmount: 45,
      projectName: "Kenya Forest Restoration",
      projectDescription: "Restoring indigenous forests in the Mount Kenya region to combat deforestation and support local communities.",
      completionCount: 12
    },
    {
      id: "kenya-bees",
      country: "Kenya",
      region: "Western Kenya",
      coordinates: [34.7519, 0.0236],
      impactType: "sponsor_bees",
      totalAmount: 60,
      projectName: "EarthLungs Pollinator Project",
      projectDescription: "Creating pollinator habitats and fostering biodiversity. Supporting bee conservation in Kenya to restore balance of nature.",
      completionCount: 3
    },
    {
      id: "bali-kelp",
      country: "Indonesia",
      region: "Bali",
      coordinates: [115.0920, -8.4095],
      impactType: "plant_kelp",
      totalAmount: 25,
      projectName: "Bali Marine Restoration",
      projectDescription: "Restoring kelp forests around Bali to support marine biodiversity and protect coral reef ecosystems.",
      completionCount: 8
    },
    {
      id: "mexico-plastic",
      country: "Mexico",
      region: "Yucatan Peninsula",
      coordinates: [-87.7289, 20.6296],
      impactType: "rescue_plastic",
      totalAmount: 180,
      projectName: "Caribbean Ocean Cleanup",
      projectDescription: "Removing plastic waste from Caribbean waters to protect marine life and preserve ocean ecosystems.",
      completionCount: 15
    },
    {
      id: "brazil-carbon",
      country: "Brazil",
      region: "Amazon Basin",
      coordinates: [-60.0261, -3.4653],
      impactType: "offset_carbon",
      totalAmount: 320,
      projectName: "Amazon Carbon Sequestration",
      projectDescription: "Protecting existing rainforest and supporting reforestation efforts to capture atmospheric carbon.",
      completionCount: 22
    },
    {
      id: "ethiopia-water",
      country: "Ethiopia",
      region: "Tigray Region",
      coordinates: [39.4759, 14.2681],
      impactType: "provide_water",
      totalAmount: 2500,
      projectName: "Clean Water Access Initiative",
      projectDescription: "Building wells and water purification systems to provide clean drinking water to rural communities.",
      completionCount: 18
    }
  ];

  const displayLocations = impactLocations || mockLocations;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Globe className="h-12 w-12 text-forest-primary animate-pulse mx-auto mb-4" />
          <p className="text-forest-text">Loading impact locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="impact-map">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Globe className="h-8 w-8 text-forest-primary" />
          <h2 className="text-2xl font-bold text-forest-text">Global Impact Map</h2>
        </div>
        <p className="text-forest-text/70">
          Your environmental impact is creating real change across {displayLocations.length} locations worldwide
        </p>
      </div>

      {/* Interactive World Map */}
      <div className="forest-card p-6" data-testid="world-map-container">
        <div className="relative bg-gradient-to-br from-blue-100 via-blue-50 to-green-50 rounded-organic p-4" style={{ minHeight: '500px' }}>
          {/* Ocean background with subtle pattern */}
          <div className="absolute inset-0 rounded-organic overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 opacity-30">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id="waves" x="0" y="0" width="20" height="10" patternUnits="userSpaceOnUse">
                    <path d="M0,5 Q5,0 10,5 T20,5" stroke="#3b82f6" strokeWidth="0.5" fill="none" opacity="0.3"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#waves)"/>
              </svg>
            </div>
          </div>

          {/* World Map SVG */}
          <svg 
            className="w-full h-full absolute inset-0" 
            viewBox="0 0 700 350" 
            preserveAspectRatio="xMidYMid meet"
            style={{ zIndex: 1 }}
          >
            {/* World continents */}
            <g fill="#16a34a" fillOpacity="0.7" stroke="#15803d" strokeWidth="1">
              {Object.entries(worldMapPaths).map(([continent, path]) => (
                <path
                  key={continent}
                  d={path}
                  className="hover:fill-green-600 transition-colors duration-300"
                  style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.1))' }}
                />
              ))}
            </g>

            {/* Grid lines for reference */}
            <g stroke="#64748b" strokeWidth="0.5" opacity="0.3">
              {/* Longitude lines */}
              {Array.from({ length: 8 }, (_, i) => (
                <line key={`long-${i}`} x1={i * 100} y1="0" x2={i * 100} y2="350" />
              ))}
              {/* Latitude lines */}
              {Array.from({ length: 6 }, (_, i) => (
                <line key={`lat-${i}`} x1="0" y1={i * 70} x2="700" y2={i * 70} />
              ))}
            </g>

            {/* Impact location markers */}
            {displayLocations.map((location) => {
              const IconComponent = impactIcons[location.impactType];
              const colorClass = impactColors[location.impactType];
              
              // Convert real coordinates to SVG coordinates
              const x = ((location.coordinates[0] + 180) / 360) * 700;
              const y = ((90 - location.coordinates[1]) / 180) * 350;

              return (
                <g key={location.id} style={{ cursor: 'pointer' }}>
                  {/* Pulsing circle animation */}
                  <circle
                    cx={x}
                    cy={y}
                    r="15"
                    fill="rgba(59, 130, 246, 0.3)"
                    className="animate-ping"
                  />
                  
                  {/* Main marker circle */}
                  <circle
                    cx={x}
                    cy={y}
                    r="20"
                    fill={colorClass.includes('green') ? '#10b981' : 
                           colorClass.includes('blue') ? '#3b82f6' :
                           colorClass.includes('gray') ? '#6b7280' :
                           colorClass.includes('yellow') ? '#eab308' : '#10b981'}
                    stroke="white"
                    strokeWidth="3"
                    className="hover:scale-110 transition-transform duration-200"
                    onClick={() => setSelectedLocation(location)}
                    style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
                  />

                  {/* Emoji in center */}
                  <text
                    x={x}
                    y={y + 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="16"
                    className="pointer-events-none"
                  >
                    {impactEmojis[location.impactType]}
                  </text>

                  {/* Completion count badge */}
                  <circle
                    cx={x + 12}
                    cy={y - 12}
                    r="8"
                    fill="#ef4444"
                    stroke="white"
                    strokeWidth="2"
                  />
                  <text
                    x={x + 12}
                    y={y - 8}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="10"
                    fill="white"
                    fontWeight="bold"
                    className="pointer-events-none"
                  >
                    {location.completionCount}
                  </text>

                  {/* Invisible click area for better UX */}
                  <circle
                    cx={x}
                    cy={y}
                    r="30"
                    fill="transparent"
                    className="cursor-pointer"
                    onClick={() => setSelectedLocation(location)}
                  />
                </g>
              );
            })}

            {/* Connection lines between locations */}
            <g stroke="#10b981" strokeWidth="2" strokeDasharray="5,5" opacity="0.4">
              {displayLocations.map((location, index) => {
                if (index === 0) return null;
                const prevLocation = displayLocations[index - 1];
                
                const x1 = ((prevLocation.coordinates[0] + 180) / 360) * 700;
                const y1 = ((90 - prevLocation.coordinates[1]) / 180) * 350;
                const x2 = ((location.coordinates[0] + 180) / 360) * 700;
                const y2 = ((90 - location.coordinates[1]) / 180) * 350;

                return (
                  <line
                    key={`line-${location.id}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    className="animate-pulse"
                  />
                );
              })}
            </g>
          </svg>

          {/* Interactive hover tooltips */}
          {displayLocations.map((location) => {
            const x = ((location.coordinates[0] + 180) / 360) * 100;
            const y = ((90 - location.coordinates[1]) / 180) * 100;
            
            return (
              <div
                key={`tooltip-${location.id}`}
                className="absolute pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-300 bg-white p-2 rounded-lg shadow-lg text-xs border z-10"
                style={{ 
                  left: `${x}%`, 
                  top: `${y - 8}%`,
                  transform: 'translateX(-50%) translateY(-100%)'
                }}
              >
                <div className="text-center">
                  <div className="font-semibold">{location.projectName}</div>
                  <div className="text-gray-600">{location.country}</div>
                  <div className="text-green-600">{location.totalAmount.toLocaleString()} units</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Location Details */}
      {selectedLocation && (
        <div className="forest-card p-6" data-testid="location-details">
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-organic ${impactColors[selectedLocation.impactType]}`}>
              <span className="text-3xl">{impactEmojis[selectedLocation.impactType]}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="h-5 w-5 text-forest-primary" />
                <h3 className="text-xl font-bold text-forest-text">
                  {selectedLocation.projectName}
                </h3>
              </div>
              <p className="text-sm text-forest-text/70 mb-3">
                {selectedLocation.region}, {selectedLocation.country}
              </p>
              <p className="text-forest-text mb-4">
                {selectedLocation.projectDescription}
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-forest-bg/50 p-3 rounded-organic">
                  <p className="font-semibold text-forest-text">Total Impact</p>
                  <p className="text-forest-primary font-bold">
                    {selectedLocation.totalAmount.toLocaleString()} units
                  </p>
                </div>
                <div className="bg-forest-bg/50 p-3 rounded-organic">
                  <p className="font-semibold text-forest-text">Your Contributions</p>
                  <p className="text-forest-primary font-bold">
                    {selectedLocation.completionCount} completions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Impact Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4" data-testid="impact-summary-grid">
        {displayLocations.map((location) => {
          const IconComponent = impactIcons[location.impactType];
          const colorClass = impactColors[location.impactType];
          
          return (
            <button
              key={location.id}
              onClick={() => setSelectedLocation(location)}
              className={`p-4 rounded-organic ${colorClass} border hover:shadow-lg transition-all duration-200 text-left`}
              data-testid={`impact-summary-${location.id}`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <IconComponent className="h-5 w-5" />
                <span className="font-semibold text-sm">{location.country}</span>
              </div>
              <p className="text-xs opacity-75 mb-1">{location.projectName}</p>
              <p className="font-bold">
                {location.totalAmount.toLocaleString()} {impactEmojis[location.impactType]}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}