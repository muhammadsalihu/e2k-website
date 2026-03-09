import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { CoinPackage, SubscriptionPlan } from "@shared/schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Coins, Crown, Check, Sparkles, Zap, Star, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function ShopPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: coinPackages } = useQuery<CoinPackage[]>({
    queryKey: ["/api/shop/coins"],
  });

  const { data: subscriptionPlans } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/shop/subscriptions"],
  });

  const buyPackageMutation = useMutation({
    mutationFn: async (packageId: string) => {
      const res = await apiRequest("POST", "/api/shop/buy-coins", { packageId });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Coins purchased!", description: `You received ${data.coins} coins` });
    },
    onError: (error: any) => {
      toast({ title: "Purchase failed", description: error.message, variant: "destructive" });
    },
  });

  const subscribeMutation = useMutation({
    mutationFn: async (planId: string) => {
      const res = await apiRequest("POST", "/api/shop/subscribe", { planId });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Subscribed!", description: `You are now a ${data.tier} member` });
    },
    onError: (error: any) => {
      toast({ title: "Subscription failed", description: error.message, variant: "destructive" });
    },
  });

  const tierColors: Record<string, string> = {
    basic: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    premium: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    vip: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  };

  const tierIcons: Record<string, any> = {
    basic: Zap,
    premium: Star,
    vip: Crown,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-2">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")} data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Shop</h1>
        </div>

        <div className="flex items-center gap-2 mb-6 ml-12">
          <Coins className="w-5 h-5 text-accent" />
          <span className="font-semibold" data-testid="text-balance">{user?.coins || 0} coins</span>
          <span className="text-muted-foreground text-sm">
            {user?.subscriptionTier !== "free" && (
              <Badge variant="secondary" className="ml-2">
                <Crown className="w-3 h-3 mr-1" />
                {user?.subscriptionTier?.toUpperCase()}
              </Badge>
            )}
          </span>
        </div>

        <Tabs defaultValue="coins" className="space-y-6">
          <TabsList className="w-full">
            <TabsTrigger value="coins" className="flex-1" data-testid="tab-coins">
              <Coins className="w-4 h-4 mr-2" />
              Buy Coins
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="flex-1" data-testid="tab-subscriptions">
              <Crown className="w-4 h-4 mr-2" />
              Subscriptions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="coins">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {coinPackages?.map((pkg) => (
                <Card
                  key={pkg.id}
                  className={`relative hover-elevate ${pkg.popular ? "border-accent" : ""}`}
                  data-testid={`card-coin-package-${pkg.id}`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="gradient-gold text-black font-semibold">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Best Value
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                      <Coins className="w-8 h-8 text-accent" />
                    </div>
                    <h3 className="text-lg font-bold mb-1">{pkg.name}</h3>
                    <p className="text-3xl font-bold text-gradient mb-1">{pkg.coins.toLocaleString()}</p>
                    {pkg.bonus > 0 && (
                      <p className="text-sm text-accent mb-3">+{pkg.bonus} bonus coins!</p>
                    )}
                    <p className="text-muted-foreground text-sm mb-4">{pkg.price}</p>
                    <Button
                      className="w-full gradient-primary"
                      onClick={() => buyPackageMutation.mutate(pkg.id)}
                      disabled={buyPackageMutation.isPending}
                      data-testid={`button-buy-coins-${pkg.id}`}
                    >
                      Purchase
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="subscriptions">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {subscriptionPlans?.map((plan) => {
                const TierIcon = tierIcons[plan.tier] || Star;
                const isCurrentPlan = user?.subscriptionTier === plan.tier;
                return (
                  <Card
                    key={plan.id}
                    className={`relative hover-elevate ${isCurrentPlan ? "border-primary" : ""}`}
                    data-testid={`card-subscription-${plan.id}`}
                  >
                    {isCurrentPlan && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge>Current Plan</Badge>
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="text-center mb-4">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${tierColors[plan.tier] || ""}`}>
                          <TierIcon className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-bold">{plan.name}</h3>
                        <p className="text-2xl font-bold text-gradient mt-1">{plan.price}</p>
                        <p className="text-xs text-muted-foreground">per month</p>
                      </div>

                      <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-2 text-sm">
                          <Coins className="w-4 h-4 text-accent flex-shrink-0" />
                          <span>{plan.monthlyCoins.toLocaleString()} coins/month</span>
                        </div>
                        {plan.features?.map((feature, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      <Button
                        className={`w-full ${isCurrentPlan ? "" : "gradient-primary"}`}
                        variant={isCurrentPlan ? "secondary" : "default"}
                        disabled={isCurrentPlan || subscribeMutation.isPending}
                        onClick={() => subscribeMutation.mutate(plan.id)}
                        data-testid={`button-subscribe-${plan.id}`}
                      >
                        {isCurrentPlan ? "Current Plan" : "Subscribe"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
