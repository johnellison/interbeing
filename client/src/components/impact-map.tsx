import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, MapPin, TreePine, Waves, CloudSnow, Leaf, Droplets, Bug, ExternalLink, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface ImpactLocation {
  id: string;
  country: string;
  region: string;
  coordinates: [number, number]; // [longitude, latitude]
  impactType: 'plant_tree' | 'rescue_plastic' | 'offset_carbon' | 'plant_kelp' | 'provide_water' | 'sponsor_bees';
  totalAmount: number;
  unit: string;
  projectName: string;
  projectDescription: string;
  completionCount: number;
  registryLink: string;
  imageUrl: string;
  projectId: string;
}

// Impact action icons and colors
const impactIcons = {
  plant_tree: TreePine,
  rescue_plastic: Waves,
  offset_carbon: CloudSnow,
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

// Create custom marker icons for different impact types
const createCustomIcon = (type: keyof typeof impactEmojis) => {
  const emoji = impactEmojis[type];
  return L.divIcon({
    html: `<div style="
      background: white;
      border: 3px solid #10b981;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    ">${emoji}</div>`,
    className: 'custom-div-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

export default function ImpactMap() {
  const [selectedLocation, setSelectedLocation] = useState<ImpactLocation | null>(null);
  const [filterType, setFilterType] = useState<string>("all");

  const { data: impactLocations, isLoading } = useQuery<ImpactLocation[]>({
    queryKey: ["/api/impact-locations"],
  });

  // Use fetched data or fallback to empty array
  const allLocations = impactLocations || [];
  
  // Filter locations based on selected type
  const locations = filterType === "all" 
    ? allLocations 
    : allLocations.filter(location => location.impactType === filterType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Globe className="h-8 w-8 text-green-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Global Impact Map</h1>
            <p className="text-gray-600">
              Your environmental impact is creating real change across {allLocations.length} locations worldwide
            </p>
          </div>
        </div>
        
        {/* Filter Controls */}
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-gray-500" />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48" data-testid="select-impact-filter">
              <SelectValue placeholder="Filter by impact type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Impact Types</SelectItem>
              <SelectItem value="plant_tree">🌳 Plant Trees</SelectItem>
              <SelectItem value="rescue_plastic">🐋 Rescue Plastic</SelectItem>
              <SelectItem value="offset_carbon">☁️ Offset Carbon</SelectItem>
              <SelectItem value="plant_kelp">🌿 Plant Kelp</SelectItem>
              <SelectItem value="provide_water">💧 Provide Water</SelectItem>
              <SelectItem value="sponsor_bees">🐝 Sponsor Bees</SelectItem>
            </SelectContent>
          </Select>
          
          {filterType !== "all" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilterType("all")}
              className="text-gray-500 hover:text-gray-700"
              data-testid="button-clear-filter"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Map Container */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="h-[600px] w-full">
            {!isLoading && (
              <MapContainer
                center={[20, 0]} // Center on equator
                zoom={2}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {locations.map((location) => (
                  <Marker
                    key={location.id}
                    position={[location.coordinates[1], location.coordinates[0]]}
                    icon={createCustomIcon(location.impactType)}
                  >
                    <Popup className="custom-popup">
                      <div className="p-3 space-y-3 min-w-[300px]">
                        {/* Project Image */}
                        {location.imageUrl && (
                          <div className="w-full h-32 rounded-lg overflow-hidden">
                            <img 
                              src={location.imageUrl} 
                              alt={location.projectName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {impactEmojis[location.impactType]}
                          </span>
                          <h3 className="font-semibold text-gray-900 flex-1">
                            {location.projectName}
                          </h3>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-3 w-3" />
                            <span>{location.region}, {location.country}</span>
                          </div>
                          
                          <p className="text-sm text-gray-700">
                            {location.projectDescription}
                          </p>
                          
                          <div className="flex items-center justify-between pt-2">
                            <Badge 
                              variant="secondary" 
                              className={cn("text-xs", impactColors[location.impactType])}
                            >
                              {location.totalAmount} {location.unit}
                            </Badge>
                            
                            <span className="text-xs text-gray-500">
                              {location.completionCount} completions
                            </span>
                          </div>
                          
                          {/* Registry Link */}
                          <div className="pt-2 border-t border-gray-100">
                            <a
                              href={location.registryLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-sm text-green-600 hover:text-green-700 transition-colors"
                              data-testid={`link-registry-${location.projectId}`}
                            >
                              <ExternalLink className="h-3 w-3" />
                              View Project Registry
                            </a>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
            
            {isLoading && (
              <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center space-y-3">
                  <Globe className="h-12 w-12 text-green-600 mx-auto animate-spin" />
                  <p className="text-gray-600">Loading global impact locations...</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Impact Summary with Enhanced Project Cards */}
      {!isLoading && allLocations.length > 0 && (
        <>
          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(
              allLocations.reduce((acc, location) => {
                const type = location.impactType;
                if (!acc[type]) {
                  acc[type] = { count: 0, total: 0, unit: location.unit };
                }
                acc[type].count += 1;
                acc[type].total += location.totalAmount;
                return acc;
              }, {} as Record<string, { count: number; total: number; unit: string }>)
            ).map(([type, data]) => {
              const IconComponent = impactIcons[type as keyof typeof impactIcons];
              return (
                <Card 
                  key={type} 
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md border-2",
                    filterType === type ? "border-green-500 bg-green-50" : "border-transparent hover:border-green-200"
                  )}
                  onClick={() => setFilterType(filterType === type ? "all" : type)}
                  data-testid={`card-impact-${type}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg", impactColors[type as keyof typeof impactColors])}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {type.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-gray-600">
                          {data.total} {data.unit} • {data.count} projects
                        </p>
                      </div>
                      {filterType === type && (
                        <Badge variant="secondary" className="text-xs">
                          Filtered
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {/* Projects Gallery */}
          {locations.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {filterType === "all" ? "All Projects" : `${filterType.replace('_', ' ')} Projects`}
                </h2>
                <span className="text-sm text-gray-500">
                  {locations.length} project{locations.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {locations.map((location) => (
                  <Card key={location.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {location.imageUrl && (
                      <div className="aspect-video w-full overflow-hidden">
                        <img 
                          src={location.imageUrl} 
                          alt={location.projectName}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">
                          {impactEmojis[location.impactType]}
                        </span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                            {location.projectName}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <MapPin className="h-3 w-3" />
                            <span>{location.region}, {location.country}</span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {location.projectDescription}
                      </p>
                      
                      <div className="flex items-center justify-between pt-2">
                        <Badge 
                          variant="secondary" 
                          className={cn("text-sm", impactColors[location.impactType])}
                        >
                          {location.totalAmount} {location.unit}
                        </Badge>
                        
                        <span className="text-sm text-gray-500">
                          {location.completionCount} completions
                        </span>
                      </div>
                      
                      <div className="pt-3 border-t border-gray-100">
                        <a
                          href={location.registryLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
                          data-testid={`link-registry-${location.projectId}`}
                        >
                          <ExternalLink className="h-4 w-4" />
                          View Project Registry
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}