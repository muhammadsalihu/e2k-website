import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Home, Search, Radio, Users, User, ShoppingBag } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export function BottomNav() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();

  const items = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/explore", icon: Search, label: "Explore" },
    { path: "/go-live", icon: Radio, label: "Live", special: true },
    { path: "/friends", icon: Users, label: "Friends" },
    { path: "/shop", icon: ShoppingBag, label: "Shop" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 glass-effect border-t border-border z-50 safe-area-pb">
      <div className="flex items-center justify-around max-w-lg mx-auto h-16">
        {items.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;

          if (item.special) {
            return (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className="flex flex-col items-center gap-0.5 -mt-5"
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center shadow-lg">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] text-muted-foreground">{item.label}</span>
              </button>
            );
          }

          return (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className="flex flex-col items-center gap-0.5 py-2 min-w-[56px]"
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <span
                className={`text-[10px] transition-colors ${
                  isActive ? "text-primary font-medium" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}

        <button
          onClick={() => setLocation(`/profile/${user?.id || ""}`)}
          className="flex flex-col items-center gap-0.5 py-2 min-w-[56px]"
          data-testid="nav-profile"
        >
          <Avatar className={`w-5 h-5 ${location.startsWith("/profile") ? "ring-2 ring-primary" : ""}`}>
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="text-[8px]">{user?.displayName?.[0] || "?"}</AvatarFallback>
          </Avatar>
          <span
            className={`text-[10px] transition-colors ${
              location.startsWith("/profile") ? "text-primary font-medium" : "text-muted-foreground"
            }`}
          >
            Me
          </span>
        </button>
      </div>
    </nav>
  );
}
