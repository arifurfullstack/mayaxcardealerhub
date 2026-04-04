import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Pending from "./pages/Pending";
import Rejected from "./pages/Rejected";
import Suspended from "./pages/Suspended";
import Dashboard from "./pages/Dashboard";
import Subscription from "./pages/Subscription";
import Wallet from "./pages/Wallet";
import Marketplace from "./pages/Marketplace";
import Orders from "./pages/Orders";
import Settings from "./pages/Settings";
import AutoPay from "./pages/AutoPay";
import AdminRoute from "./components/admin/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminDealers from "./pages/admin/AdminDealers";
import AdminProviders from "./pages/admin/AdminProviders";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminSettings from "./pages/admin/AdminSettings";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/pending" element={<Pending />} />
          <Route path="/rejected" element={<Rejected />} />
          <Route path="/suspended" element={<Suspended />} />
          
          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<Navigate to="/admin/overview" replace />} />
            <Route path="overview" element={<AdminOverview />} />
            <Route path="dealers" element={<AdminDealers />} />
            <Route path="providers" element={<AdminProviders />} />
            <Route path="leads" element={<AdminLeads />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="transactions" element={<AdminTransactions />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Dealer Routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/autopay" element={<AutoPay />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
