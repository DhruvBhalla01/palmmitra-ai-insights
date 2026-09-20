import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LazyMotion } from "@/lib/motion";
const loadMotionFeatures = () =>
  import("@/lib/motion-features").then((mod) => mod.default);
import Index from "./pages/Index";
import ScrollToTop from "./components/ScrollToTop";
import { AnalyticsProvider } from "@/lib/analytics";
import { Sparkles } from "lucide-react";
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";

// Lazy-load non-critical routes to shrink the initial bundle.
const UploadPalm = lazy(() => import("./pages/UploadPalm"));
const Report = lazy(() => import("./pages/Report"));
const PalmMatch = lazy(() => import("./pages/PalmMatch"));
const PalmMatchReport = lazy(() => import("./pages/PalmMatchReport"));
const About = lazy(() => import("./pages/About"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const Contact = lazy(() => import("./pages/Contact"));
const Help = lazy(() => import("./pages/Help"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <main className="min-h-screen bg-background flex items-center justify-center px-6" aria-live="polite" aria-busy="true">
    <div className="w-full max-w-sm text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent shadow-gold">
        <Sparkles className="h-6 w-6 animate-pulse" aria-hidden="true" />
      </div>
      <div className="h-3 w-32 mx-auto rounded-full bg-muted animate-pulse" />
      <p className="mt-4 text-sm text-muted-foreground">Preparing your PalmMitra experience…</p>
      <div className="mt-6 space-y-3">
        <div className="h-12 rounded-2xl bg-muted/60 animate-pulse" />
        <div className="h-24 rounded-2xl bg-muted/40 animate-pulse" />
      </div>
    </div>
  </main>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LazyMotion features={loadMotionFeatures} strict>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ScrollToTop />
          <AnalyticsProvider>
          <RouteErrorBoundary>
            <Suspense fallback={<RouteFallback />}>
              <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/upload" element={<UploadPalm />} />
              <Route path="/report" element={<Report />} />
              <Route path="/report/:id" element={<Report />} />
              <Route path="/palmmatch" element={<PalmMatch />} />
              <Route path="/palmmatch-report/:id" element={<PalmMatchReport />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/help" element={<Help />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </RouteErrorBoundary>
          </AnalyticsProvider>
        </BrowserRouter>
      </TooltipProvider>
    </LazyMotion>
  </QueryClientProvider>
);

export default App;
