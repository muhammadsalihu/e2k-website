import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  const [, setLocation] = useLocation();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <img src="/e2k-logo.png" alt="E2k Tech Ventures" className="h-24 w-auto object-contain animate-bounce" />
        </div>
        <h1 className="text-7xl font-black text-gradient mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-3">Houston, we have a problem!</h2>
        <p className="text-muted-foreground mb-8">
          The page you're looking for has drifted off into the digital cosmos. Let's get you back on track.
        </p>
        <Button
          onClick={() => setLocation("/")}
          className="gradient-primary text-white dark:text-background font-semibold"
          data-testid="button-go-home"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>
    </div>
  );
}
