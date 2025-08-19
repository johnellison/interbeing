import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import ImpactMapComponent from "@/components/impact-map";
import Navigation from "@/components/navigation";

export default function ImpactMapPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-forest-bg font-nunito text-forest-text">
      <Navigation currentPage="/impact-map" />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ImpactMapComponent />
      </main>
    </div>
  );
}