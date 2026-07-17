import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Vehicles from "./pages/Vehicles";
import Map from "./pages/Map";
import Alerts from "./pages/Alerts";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CommandCenter from "./pages/CommandCenter";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import VoiceAI from "./pages/VoiceAI";
import FleetHealth from "./pages/FleetHealth";
import Drivers from "./pages/Drivers";
import Trips from "./pages/Trips";
import Telemetry from "./pages/Telemetry";
import Geofence from "./pages/Geofence";
import Maintenance from "./pages/Maintenance";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/vehicles" element={<ProtectedRoute><Vehicles /></ProtectedRoute>} />
        <Route path="/map" element={<ProtectedRoute><Map /></ProtectedRoute>} />
        <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
        <Route path="/command-center" element={<ProtectedRoute><CommandCenter /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
        <Route path="/voice-ai" element={<ProtectedRoute><VoiceAI /></ProtectedRoute>} />
        <Route path="/fleet-health" element={<ProtectedRoute><FleetHealth /></ProtectedRoute>} />
        <Route path="/drivers" element={<ProtectedRoute><Drivers /></ProtectedRoute>} />
        <Route path="/trips" element={<ProtectedRoute><Trips /></ProtectedRoute>} />
        <Route path="/telemetry" element={<ProtectedRoute><Telemetry /></ProtectedRoute>} />
        <Route path="/geofence" element={<ProtectedRoute><Geofence /></ProtectedRoute>} />
        <Route path="/maintenance" element={<ProtectedRoute><Maintenance /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;