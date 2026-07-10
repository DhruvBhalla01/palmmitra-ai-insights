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
  <div className="min-h-screen" aria-hidden="true" />
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LazyMotion features={loadMotionFeatures} strict>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ScrollToTop />
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
        </BrowserRouter>
      </TooltipProvider>
    </LazyMotion>
  </QueryClientProvider>
);

export default App;
