import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Home, Search, Radio, Users, ShoppingBag } from "lucide-react";
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
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 dark:bg-[hsl(222,28%,6%)/0.95] glass-effect border-t border-border z-50">
      <div className="flex items-center justify-around max-w-lg mx-auto h-16 px-2">
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
                <div className="w-13 h-13 w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg neon-glow">
                  <Icon className="w-5 h-5 text-white dark:text-background" />
                </div>
                <span className="text-[10px] text-muted-foreground font-medium mt-0.5">{item.label}</span>
              </button>
            );
          }

          return (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className="flex flex-col items-center gap-0.5 py-2 min-w-[52px] relative"
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              />
              {isActive && (
                <span className="absolute top-1.5 inset-x-0 flex justify-center">
                  <span className="w-1 h-1 rounded-full bg-primary" />
                </span>
              )}
              <span
                className={`text-[10px] transition-colors font-medium ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}

        <button
          onClick={() => setLocation(`/profile/${user?.id || ""}`)}
          className="flex flex-col items-center gap-0.5 py-2 min-w-[52px]"
          data-testid="nav-profile"
        >
          <Avatar className={`w-6 h-6 rounded-lg transition-all ${
            location.startsWith("/profile")
              ? "ring-2 ring-primary ring-offset-1 ring-offset-background"
              : ""
          }`}>
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="text-[8px] rounded-lg font-bold">{user?.displayName?.[0] || "?"}</AvatarFallback>
          </Avatar>
          <span
            className={`text-[10px] transition-colors font-medium ${
              location.startsWith("/profile") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Me
          </span>
        </button>
      </div>
    </nav>
  );
}
