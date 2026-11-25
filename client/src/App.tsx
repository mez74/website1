import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import About from "./pages/About";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import StaffLogin from "./pages/StaffLogin";

import ComingSoon from "./pages/ComingSoon";

/**
 * Router with automatic scroll-to-top on route change.
 * 
 * Scroll-to-top behavior:
 * - Automatically scrolls to the top of the page whenever the route changes
 * - Ensures users see the top of the new page when navigating between pages
 * - Works with all wouter Link components throughout the site
 * - EXCEPTION: During Smart Back Button restoration, scroll-to-top is skipped
 *   and restoration logic handles scroll positioning instead
 * 
 * For future development:
 * - All wouter Link components automatically trigger this effect on route change
 * - No additional code is needed for new pages or buttons using Link
 * - External navigations (e.g., window.location.href) bypass this effect
 * - To scroll to top for imperative navigation, call window.scrollTo(0, 0) before the navigation
 * - Smart Back Button sets sessionStorage.isRestoringState flag to prevent scroll-to-top
 */
function Router() {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Scroll to top immediately on route change
    // UNLESS we are restoring navigation state (in which case restoration logic handles scroll)
    const isRestoring = sessionStorage.getItem('isRestoringState') === 'true';
    
    if (!isRestoring) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      });
    }
  }, [location]);

  // Also scroll to top on initial mount (unless restoring)
  useEffect(() => {
    const isRestoring = sessionStorage.getItem('isRestoringState') === 'true';
    if (!isRestoring) {
      window.scrollTo(0, 0);
    }
  }, []);

  // Handle OAuth return path - redirect to stored path after login
  useEffect(() => {
    try {
      const returnPath = localStorage.getItem("oauth_return_path");
      if (returnPath && location === "/") {
        localStorage.removeItem("oauth_return_path");
        setLocation(returnPath);
      }
    } catch (e) {
      // localStorage might not be available
    }
  }, [location, setLocation]);

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/coming-soon" component={ComingSoon} />
      <Route path="/about" component={About} />
      <Route path="/properties" component={Properties} />
      <Route path="/properties/:id" component={PropertyDetail} />
      <Route path="/contact" component={Contact} />

      <Route path="/admin" component={Admin} />
      <Route path="/staff-login" component={StaffLogin} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster
            theme="dark"
            toastOptions={{
              style: {
                background: "oklch(12% 0 0)",
                border: "1px solid oklch(22% 0.02 85)",
                color: "oklch(85% 0 0)",
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: "0.8rem",
              },
            }}
          />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
