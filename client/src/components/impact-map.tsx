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

      {/* World Map Visualization */}
      <div className="forest-card p-6" data-testid="world-map-container">
        <div className="relative bg-gradient-to-br from-blue-50 to-green-50 rounded-organic p-8 min-h-96">
          {/* Simplified world map background */}
          <div className="absolute inset-0 opacity-10">
            <svg viewBox="0 0 1000 500" className="w-full h-full">
              {/* Simplified world continents outlines */}
              <path d="M100,200 Q200,150 300,200 L400,180 L500,200 L450,250 L350,280 L200,270 Z" fill="currentColor" opacity="0.3" />
              <path d="M150,300 Q250,280 350,300 L400,320 L350,360 L200,350 Z" fill="currentColor" opacity="0.3" />
              <path d="M500,150 Q600,120 700,150 L800,140 L850,180 L800,220 L700,200 L600,210 Z" fill="currentColor" opacity="0.3" />
              <path d="M750,250 Q850,230 900,250 L920,300 L880,340 L800,330 L750,310 Z" fill="currentColor" opacity="0.3" />
            </svg>
          </div>

          {/* Impact location markers */}
          {displayLocations.map((location) => {
            const IconComponent = impactIcons[location.impactType];
            const colorClass = impactColors[location.impactType];
            
            // Convert coordinates to map position (simplified projection)
            const x = ((location.coordinates[0] + 180) / 360) * 100;
            const y = ((90 - location.coordinates[1]) / 180) * 100;

            return (
              <button
                key={location.id}
                onClick={() => setSelectedLocation(location)}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 p-3 rounded-full ${colorClass} border-2 border-white shadow-lg hover:scale-110 transition-all duration-200 z-10`}
                style={{ left: `${x}%`, top: `${y}%` }}
                data-testid={`location-marker-${location.id}`}
              >
                <IconComponent className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-forest-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {location.completionCount}
                </span>
              </button>
            );
          })}

          {/* Connection lines between locations */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {displayLocations.map((location, index) => {
              if (index === 0) return null;
              const prevLocation = displayLocations[index - 1];
              
              const x1 = ((prevLocation.coordinates[0] + 180) / 360) * 100;
              const y1 = ((90 - prevLocation.coordinates[1]) / 180) * 100;
              const x2 = ((location.coordinates[0] + 180) / 360) * 100;
              const y2 = ((90 - location.coordinates[1]) / 180) * 100;

              return (
                <line
                  key={`line-${location.id}`}
                  x1={`${x1}%`}
                  y1={`${y1}%`}
                  x2={`${x2}%`}
                  y2={`${y2}%`}
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                  opacity="0.3"
                  className="text-forest-primary"
                />
              );
            })}
          </svg>
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