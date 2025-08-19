import { MapPin, ExternalLink, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Project {
  id: string;
  name: string;
  description: string;
  location: string;
  imageUrl?: string;
  impactType: string;
  emoji: string;
  color: string;
}

// Real project data from Greenspark API
const supportedProjects: Project[] = [
  {
    id: "trees-oregon",
    name: "American Forests - Oregon",
    description: "Restoring areas affected by wildfires in Oregon by planting trees native to the Pacific Northwest. Supporting habitats for Deer, Elk, Cougar, Bear, Trout and Spotted Owl.",
    location: "USA - Oregon",
    imageUrl: "https://cdn.getgreenspark.com/project-images/240731_american_forests.jpg",
    impactType: "Tree Planting",
    emoji: "🌳",
    color: "#22c55e"
  },
  {
    id: "plastic-bank",
    name: "Plastic Bank",
    description: "Transforming plastic waste into empowering income. Creating social impact by providing collection opportunities for ocean-bound plastic waste.",
    location: "Global Initiative",
    imageUrl: "https://cdn.getgreenspark.com/project-images/plastic_bank.jpg",
    impactType: "Plastic Rescue",
    emoji: "🐋",
    color: "#3b82f6"
  },
  {
    id: "kelp-british-columbia", 
    name: "Coastal Kelp Restoration",
    description: "Supporting kelp restoration in British Columbia, Canada. Restoring marine ecosystems and underwater forests to support biodiversity.",
    location: "Canada - British Columbia",
    imageUrl: "https://cdn.getgreenspark.com/project-images/kelp_forest.jpg",
    impactType: "Kelp Planting",
    emoji: "🌿",
    color: "#10b981"
  },
  {
    id: "carbon-pool",
    name: "Greenspark Carbon Pool",
    description: "A collection of the best carbon offsetting and carbon capture projects in our portfolio. Ensuring maximum social and environmental benefit.",
    location: "Global Portfolio",
    imageUrl: "https://cdn.getgreenspark.com/project-images/carbon_offset.jpg",
    impactType: "Carbon Offset",
    emoji: "☁️",
    color: "#6b7280"
  },
  {
    id: "water-kissimmee",
    name: "American Forests - Florida",
    description: "Protecting water quality in the Kissimmee Basin through strategic forest restoration and watershed protection initiatives.",
    location: "USA - Florida",
    imageUrl: "https://cdn.getgreenspark.com/project-images/water_protection.jpg",
    impactType: "Clean Water",
    emoji: "💧",
    color: "#0ea5e9"
  },
  {
    id: "bee-earthlungs",
    name: "EarthLungs Bee Project",
    description: "Creating pollinator habitats and fostering biodiversity through bee conservation projects. Supporting essential ecosystem services.",
    location: "Kenya",
    imageUrl: "https://cdn.getgreenspark.com/project-images/bee_project.jpg",
    impactType: "Bee Protection",
    emoji: "🐝",
    color: "#eab308"
  }
];

export default function SupportedProjects() {
  return (
    <div className="forest-card p-6" data-testid="card-supported-projects">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-forest-primary/20 rounded-organic">
            <Globe className="h-8 w-8 text-forest-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-forest-text">Environmental Projects</h3>
            <p className="text-sm text-forest-text/70">Real impact through verified Greenspark partners</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { window.location.href = "/impact-map"; }}
          className="text-forest-primary hover:text-forest-primary/80"
          data-testid="button-view-impact-map"
        >
          View Global Map →
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {supportedProjects.map((project) => (
          <div
            key={project.id}
            className="border border-forest-secondary/20 rounded-organic p-4 hover:shadow-sm transition-shadow"
            data-testid={`project-card-${project.id}`}
          >
            <div className="flex items-start space-x-3 mb-3">
              <div 
                className="p-2 rounded-md flex-shrink-0"
                style={{ backgroundColor: `${project.color}20` }}
              >
                <span className="text-lg">{project.emoji}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-forest-text text-sm leading-tight">
                  {project.name}
                </h4>
                <div className="flex items-center text-xs text-forest-text/60 mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  {project.location}
                </div>
              </div>
            </div>
            
            <p className="text-xs text-forest-text/80 leading-relaxed mb-3 line-clamp-3">
              {project.description}
            </p>
            
            <div className="flex items-center justify-between">
              <span 
                className="text-xs font-medium px-2 py-1 rounded-full"
                style={{ 
                  backgroundColor: `${project.color}15`,
                  color: project.color
                }}
              >
                {project.impactType}
              </span>
              <ExternalLink className="h-3 w-3 text-forest-text/40" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-forest-secondary/20">
        <p className="text-xs text-forest-text/70 text-center">
          🌍 All projects are verified through <strong>Greenspark</strong> and provide transparent impact tracking with authentic environmental results.
        </p>
      </div>
    </div>
  );
}