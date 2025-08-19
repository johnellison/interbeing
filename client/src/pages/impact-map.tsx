import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import ImpactMapComponent from "@/components/impact-map";

export default function ImpactMapPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-forest-bg font-nunito text-forest-text">
      {/* Navigation Header */}
      <nav className="bg-forest-primary text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/")}
                className="text-white hover:bg-forest-secondary/20 transition-colors"
                data-testid="button-back-home"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            
            <h1 className="text-xl font-bold font-inter" data-testid="page-title">
              Global Impact Map
            </h1>
            
            <div className="w-32"></div> {/* Spacer for centering */}
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ImpactMapComponent />
      </main>
    </div>
  );
}