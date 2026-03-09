import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Radio, ArrowLeft, Video, Sparkles } from "lucide-react";

const goLiveSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  category: z.string().min(1, "Please select a category"),
});

type GoLiveValues = z.infer<typeof goLiveSchema>;

export default function GoLivePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<GoLiveValues>({
    resolver: zodResolver(goLiveSchema),
    defaultValues: { title: "", description: "", category: "Entertainment" },
  });

  const goLiveMutation = useMutation({
    mutationFn: async (data: GoLiveValues) => {
      const res = await apiRequest("POST", "/api/streams", data);
      return res.json();
    },
    onSuccess: (stream) => {
      queryClient.invalidateQueries({ queryKey: ["/api/streams"] });
      setLocation(`/stream/${stream.id}`);
    },
    onError: (error: any) => {
      toast({ title: "Failed to go live", description: error.message, variant: "destructive" });
    },
  });

  const categories = ["Entertainment", "Music", "Gaming", "Talk Show", "Dance", "Cooking", "Education", "Sports", "Travel", "Art"];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")} data-testid="button-back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Go Live</h1>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-semibold">Start Your Stream</h2>
                <p className="text-sm text-muted-foreground">Set up your live stream details</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((data) => goLiveMutation.mutate(data))} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stream Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Give your stream a catchy title" {...field} data-testid="input-stream-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Tell viewers what your stream is about" {...field} data-testid="input-stream-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full gradient-primary"
                  disabled={goLiveMutation.isPending}
                  data-testid="button-start-stream"
                >
                  <Radio className="w-4 h-4 mr-2" />
                  {goLiveMutation.isPending ? "Starting..." : "Go Live Now"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
