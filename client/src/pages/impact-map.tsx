import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import ImpactMapComponent from "@/components/impact-map";
import Navigation from "@/components/navigation";

export default function ImpactMapPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen font-nunito text-foreground">
      <Navigation currentPage="/impact-map" onAddHabitClick={() => {}} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">
        <ImpactMapComponent />
      </main>
    </div>
  );
}