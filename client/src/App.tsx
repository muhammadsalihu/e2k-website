import React from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/use-auth";
import { BottomNav } from "@/components/bottom-nav";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import StreamPage from "@/pages/stream-page";
import GoLivePage from "@/pages/go-live-page";
import ShopPage from "@/pages/shop-page";
import ProfilePage from "@/pages/profile-page";
import FriendsPage from "@/pages/friends-page";
import ExplorePage from "@/pages/explore-page";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <RedirectToAuth />;
  }

  return <Component />;
}

function RedirectToAuth() {
  const [, setLocation] = useLocation();
  
  React.useEffect(() => {
    setLocation("/auth");
  }, [setLocation]);

  return null;
}

function AppLayout() {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();
  const hideNav = location === "/auth" || location.startsWith("/stream/");

  return (
    <>
      <div className={!hideNav && isAuthenticated ? "pb-16" : ""}>
        <Switch>
          <Route path="/auth" component={AuthPage} />
          <Route path="/">{() => <ProtectedRoute component={HomePage} />}</Route>
          <Route path="/stream/:id">{() => <ProtectedRoute component={StreamPage} />}</Route>
          <Route path="/go-live">{() => <ProtectedRoute component={GoLivePage} />}</Route>
          <Route path="/shop">{() => <ProtectedRoute component={ShopPage} />}</Route>
          <Route path="/profile/:id">{() => <ProtectedRoute component={ProfilePage} />}</Route>
          <Route path="/friends">{() => <ProtectedRoute component={FriendsPage} />}</Route>
          <Route path="/explore">{() => <ProtectedRoute component={ExplorePage} />}</Route>
          <Route component={NotFound} />
        </Switch>
      </div>
      {!hideNav && isAuthenticated && <BottomNav />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <AppLayout />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
