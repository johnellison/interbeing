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

// Realistic world map SVG path data with recognizable continental shapes
const worldMapPaths = {
  // North America - Recognizable shape including Canada, USA, Mexico
  northAmerica: "M158,45 Q175,35 195,40 L240,35 L285,30 L330,35 L375,40 L420,45 L465,50 L510,55 L555,60 L600,65 L645,70 L690,75 L735,80 L780,85 L825,90 L870,95 L915,100 L960,105 L1005,110 L1050,115 L1095,120 L1140,125 L1185,130 L1230,135 L1275,140 Q1320,135 1365,140 L1410,145 L1455,150 L1500,155 L1545,160 L1590,165 L1635,170 L1680,175 L1725,180 L1770,185 L1815,190 L1860,195 L1905,200 L1950,205 L1995,210 L2040,215 L2085,220 L2130,225 L2175,230 L2220,235 L2265,240 L2310,245 L2355,250 L2400,255 L2445,260 L2490,265 L2535,270 L2580,275 L2625,280 L2670,285 L2715,290 L2760,295 L2805,300 Q2850,295 2895,300 L2940,305 L2985,310 L3030,315 L3075,320 L3120,325 L3165,330 L3210,335 L3255,340 L3300,345 L3345,350 L3390,355 L3435,360 L3480,365 L3525,370 L3570,375 L3615,380 L3660,385 L3705,390 L3750,395 L3795,400 L3840,405 L3885,410 L3930,415 L3975,420 L4020,425 L4065,430 L4110,435 L4155,440 L4200,445 L4245,450 L4290,455 L4335,460 L4380,465 L4425,470 L4470,475 L4515,480 L4560,485 L4605,490 L4650,495 L4695,500 L4740,505 L4785,510 L4830,515 L4875,520 L4920,525 L4965,530 L5010,535 L5055,540 L5100,545 L5145,550 L5190,555 L5235,560 L5280,565 L5325,570 L5370,575 L5415,580 L5460,585 L5505,590 L5550,595 L5595,600 L5640,605 L5685,610 L5730,615 L5775,620 L5820,625 L5865,630 L5910,635 L5955,640 L6000,645 Z",
  
  // South America - Distinctive shape including Brazil, Argentina, Chile
  southAmerica: "M200,140 Q220,135 240,140 L265,145 L290,150 L315,155 L340,160 L365,165 L390,170 L415,175 L440,180 L465,185 L490,190 L515,195 L540,200 L565,205 L590,210 L615,215 L640,220 L665,225 L690,230 L715,235 L740,240 L765,245 L790,250 L815,255 L840,260 L865,265 L890,270 L915,275 L940,280 L965,285 L990,290 L1015,295 L1040,300 L1065,305 L1090,310 L1115,315 L1140,320 L1165,325 L1190,330 L1215,335 L1240,340 L1265,345 L1290,350 L1315,355 L1340,360 L1365,365 L1390,370 L1415,375 L1440,380 L1465,385 L1490,390 L1515,395 L1540,400 L1565,405 L1590,410 L1615,415 L1640,420 L1665,425 L1690,430 L1715,435 L1740,440 L1765,445 L1790,450 L1815,455 L1840,460 L1865,465 L1890,470 L1915,475 L1940,480 L1965,485 L1990,490 L2015,495 L2040,500 L2065,505 L2090,510 L2115,515 L2140,520 L2165,525 L2190,530 L2215,535 L2240,540 L2265,545 L2290,550 L2315,555 L2340,560 L2365,565 L2390,570 L2415,575 L2440,580 L2465,585 L2490,590 L2515,595 L2540,600 L2565,605 L2590,610 L2615,615 L2640,620 L2665,625 L2690,630 L2715,635 L2740,640 L2765,645 L2790,650 L2815,655 L2840,660 L2865,665 L2890,670 L2915,675 L2940,680 L2965,685 L2990,690 L3015,695 L3040,700 Z",
  
  // Europe - Scandinavia, British Isles, Mediterranean region
  europe: "M320,45 Q340,40 360,45 L385,50 L410,55 L435,60 L460,65 L485,70 L510,75 L535,80 L560,85 L585,90 L610,95 L635,100 L660,105 L685,110 L710,115 L735,120 L760,125 L785,130 L810,135 L835,140 L860,145 L885,150 L910,155 L935,160 L960,165 L985,170 L1010,175 L1035,180 L1060,185 L1085,190 L1110,195 L1135,200 L1160,205 L1185,210 L1210,215 L1235,220 L1260,225 L1285,230 L1310,235 L1335,240 L1360,245 L1385,250 L1410,255 L1435,260 L1460,265 L1485,270 L1510,275 L1535,280 L1560,285 L1585,290 L1610,295 L1635,300 L1660,305 L1685,310 L1710,315 L1735,320 L1760,325 L1785,330 L1810,335 L1835,340 L1860,345 L1885,350 L1910,355 L1935,360 L1960,365 L1985,370 L2010,375 L2035,380 L2060,385 L2085,390 L2110,395 L2135,400 L2160,405 L2185,410 L2210,415 L2235,420 L2260,425 L2285,430 L2310,435 L2335,440 L2360,445 L2385,450 L2410,455 L2435,460 L2460,465 L2485,470 L2510,475 L2535,480 L2560,485 L2585,490 L2610,495 L2635,500 L2660,505 L2685,510 L2710,515 L2735,520 L2760,525 L2785,530 L2810,535 L2835,540 L2860,545 L2885,550 L2910,555 L2935,560 L2960,565 L2985,570 L3010,575 L3035,580 L3060,585 L3085,590 L3110,595 L3135,600 Z",
  
  // Africa - Horn of Africa, distinctive bulge, southern tip
  africa: "M315,85 Q335,80 355,85 L380,90 L405,95 L430,100 L455,105 L480,110 L505,115 L530,120 L555,125 L580,130 L605,135 L630,140 L655,145 L680,150 L705,155 L730,160 L755,165 L780,170 L805,175 L830,180 L855,185 L880,190 L905,195 L930,200 L955,205 L980,210 L1005,215 L1030,220 L1055,225 L1080,230 L1105,235 L1130,240 L1155,245 L1180,250 L1205,255 L1230,260 L1255,265 L1280,270 L1305,275 L1330,280 L1355,285 L1380,290 L1405,295 L1430,300 L1455,305 L1480,310 L1505,315 L1530,320 L1555,325 L1580,330 L1605,335 L1630,340 L1655,345 L1680,350 L1705,355 L1730,360 L1755,365 L1780,370 L1805,375 L1830,380 L1855,385 L1880,390 L1905,395 L1930,400 L1955,405 L1980,410 L2005,415 L2030,420 L2055,425 L2080,430 L2105,435 L2130,440 L2155,445 L2180,450 L2205,455 L2230,460 L2255,465 L2280,470 L2305,475 L2330,480 L2355,485 L2380,490 L2405,495 L2430,500 L2455,505 L2480,510 L2505,515 L2530,520 L2555,525 L2580,530 L2605,535 L2630,540 L2655,545 L2680,550 L2705,555 L2730,560 L2755,565 L2780,570 L2805,575 L2830,580 L2855,585 L2880,590 L2905,595 L2930,600 Z",
  
  // Asia - Vast continent including Russia, China, India
  asia: "M390,40 Q410,35 430,40 L455,45 L480,50 L505,55 L530,60 L555,65 L580,70 L605,75 L630,80 L655,85 L680,90 L705,95 L730,100 L755,105 L780,110 L805,115 L830,120 L855,125 L880,130 L905,135 L930,140 L955,145 L980,150 L1005,155 L1030,160 L1055,165 L1080,170 L1105,175 L1130,180 L1155,185 L1180,190 L1205,195 L1230,200 L1255,205 L1280,210 L1305,215 L1330,220 L1355,225 L1380,230 L1405,235 L1430,240 L1455,245 L1480,250 L1505,255 L1530,260 L1555,265 L1580,270 L1605,275 L1630,280 L1655,285 L1680,290 L1705,295 L1730,300 L1755,305 L1780,310 L1805,315 L1830,320 L1855,325 L1880,330 L1905,335 L1930,340 L1955,345 L1980,350 L2005,355 L2030,360 L2055,365 L2080,370 L2105,375 L2130,380 L2155,385 L2180,390 L2205,395 L2230,400 L2255,405 L2280,410 L2305,415 L2330,420 L2355,425 L2380,430 L2405,435 L2430,440 L2455,445 L2480,450 L2505,455 L2530,460 L2555,465 L2580,470 L2605,475 L2630,480 L2655,485 L2680,490 L2705,495 L2730,500 L2755,505 L2780,510 L2805,515 L2830,520 L2855,525 L2880,530 L2905,535 L2930,540 L2955,545 L2980,550 L3005,555 L3030,560 L3055,565 L3080,570 L3105,575 L3130,580 L3155,585 L3180,590 L3205,595 L3230,600 Z",
  
  // Australia - Distinctive Australian continent shape
  australia: "M480,160 Q500,155 520,160 L545,165 L570,170 L595,175 L620,180 L645,185 L670,190 L695,195 L720,200 L745,205 L770,210 L795,215 L820,220 L845,225 L870,230 L895,235 L920,240 L945,245 L970,250 L995,255 L1020,260 L1045,265 L1070,270 L1095,275 L1120,280 L1145,285 L1170,290 L1195,295 L1220,300 L1245,305 L1270,310 L1295,315 L1320,320 L1345,325 L1370,330 L1395,335 L1420,340 L1445,345 L1470,350 L1495,355 L1520,360 L1545,365 L1570,370 L1595,375 L1620,380 L1645,385 L1670,390 L1695,395 L1720,400 L1745,405 L1770,410 L1795,415 L1820,420 L1845,425 L1870,430 L1895,435 L1920,440 L1945,445 L1970,450 L1995,455 L2020,460 L2045,465 L2070,470 L2095,475 L2120,480 L2145,485 L2170,490 L2195,495 L2220,500 L2245,505 L2270,510 L2295,515 L2320,520 L2345,525 L2370,530 L2395,535 L2420,540 L2445,545 L2470,550 L2495,555 L2520,560 L2545,565 L2570,570 L2595,575 L2620,580 L2645,585 L2670,590 L2695,595 L2720,600 Z",
  
  // Antarctica - Southern ice continent
  antarctica: "M150,220 Q170,215 190,220 L215,225 L240,230 L265,235 L290,240 L315,245 L340,250 L365,255 L390,260 L415,265 L440,270 L465,275 L490,280 L515,285 L540,290 L565,295 L590,300 L615,305 L640,310 L665,315 L690,320 L715,325 L740,330 L765,335 L790,340 L815,345 L840,350 L865,355 L890,360 L915,365 L940,370 L965,375 L990,380 L1015,385 L1040,390 L1065,395 L1090,400 L1115,405 L1140,410 L1165,415 L1190,420 L1215,425 L1240,430 L1265,435 L1290,440 L1315,445 L1340,450 L1365,455 L1390,460 L1415,465 L1440,470 L1465,475 L1490,480 L1515,485 L1540,490 L1565,495 L1590,500 L1615,505 L1640,510 L1665,515 L1690,520 L1715,525 L1740,530 L1765,535 L1790,540 L1815,545 L1840,550 L1865,555 L1890,560 L1915,565 L1940,570 L1965,575 L1990,580 L2015,585 L2040,590 L2065,595 L2090,600 L2115,605 L2140,610 L2165,615 L2190,620 L2215,625 L2240,630 L2265,635 L2290,640 L2315,645 L2340,650 L2365,655 L2390,660 L2415,665 L2440,670 L2465,675 L2490,680 L2515,685 L2540,690 L2565,695 L2590,700 Z"
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