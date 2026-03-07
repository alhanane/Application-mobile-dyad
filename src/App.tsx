import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, getStoredAuth, useAuth } from "@/auth/AuthContext";
import Index from "./pages/Index";
import Grades from "./pages/Grades";
import Schedule from "./pages/Schedule";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import Attendance from "./pages/Attendance";
import News from "./pages/News";
import Transport from "./pages/Transport";
import InfoNotes from "./pages/InfoNotes";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import AdminSimulation from "./pages/AdminSimulation";
import SimulationHub from "./pages/SimulationHub";
import NotFound from "./pages/NotFound";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  // Pendant l'init (appel /auth/me.php), on évite de rediriger.
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-sm font-semibold text-slate-500">Chargement...</div>
      </div>
    );
  }

  // Permet d'éviter une redirection intempestive après login (setState async).
  const effectiveAuth = isAuthenticated || getStoredAuth();

  if (!effectiveAuth) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/sim" element={<SimulationHub />} />

          <Route
            path="/"
            element={
              <PrivateRoute>
                <Index />
              </PrivateRoute>
            }
          />
          <Route
            path="/grades"
            element={
              <PrivateRoute>
                <Grades />
              </PrivateRoute>
            }
          />
          <Route
            path="/schedule"
            element={
              <PrivateRoute>
                <Schedule />
              </PrivateRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <PrivateRoute>
                <Messages />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <PrivateRoute>
                <Attendance />
              </PrivateRoute>
            }
          />
          <Route
            path="/news"
            element={
              <PrivateRoute>
                <News />
              </PrivateRoute>
            }
          />
          <Route
            path="/transport"
            element={
              <PrivateRoute>
                <Transport />
              </PrivateRoute>
            }
          />
          <Route
            path="/info"
            element={
              <PrivateRoute>
                <InfoNotes />
              </PrivateRoute>
            }
          />
          <Route
            path="/contact"
            element={
              <PrivateRoute>
                <Contact />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin-sim"
            element={
              <PrivateRoute>
                <AdminSimulation />
              </PrivateRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </TooltipProvider>
);

export default App;