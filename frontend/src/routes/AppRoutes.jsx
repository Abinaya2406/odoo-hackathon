import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppLayout } from '../layouts/AppLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { LoadingState } from '../components/LoadingState';

// Lazy-loaded Auth Pages
const LoginPage = lazy(() => import('../pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })));
const VerifyOTPPage = lazy(() => import('../pages/auth/VerifyOTPPage').then((m) => ({ default: m.VerifyOTPPage })));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })));

// Lazy-loaded App Pages
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const ProductListPage = lazy(() => import('../pages/products/ProductListPage').then((m) => ({ default: m.ProductListPage })));
const ProductFormPage = lazy(() => import('../pages/products/ProductFormPage').then((m) => ({ default: m.ProductFormPage })));
const ProductDetailPage = lazy(() => import('../pages/products/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })));

const ReceiptsListPage = lazy(() => import('../pages/operations/ReceiptsListPage').then((m) => ({ default: m.ReceiptsListPage })));
const ReceiptFormPage = lazy(() => import('../pages/operations/ReceiptFormPage').then((m) => ({ default: m.ReceiptFormPage })));
const DeliveriesListPage = lazy(() => import('../pages/operations/DeliveriesListPage').then((m) => ({ default: m.DeliveriesListPage })));
const DeliveryFormPage = lazy(() => import('../pages/operations/DeliveryFormPage').then((m) => ({ default: m.DeliveryFormPage })));
const TransfersListPage = lazy(() => import('../pages/operations/TransfersListPage').then((m) => ({ default: m.TransfersListPage })));
const TransferFormPage = lazy(() => import('../pages/operations/TransferFormPage').then((m) => ({ default: m.TransferFormPage })));
const AdjustmentsListPage = lazy(() => import('../pages/operations/AdjustmentsListPage').then((m) => ({ default: m.AdjustmentsListPage })));
const AdjustmentFormPage = lazy(() => import('../pages/operations/AdjustmentFormPage').then((m) => ({ default: m.AdjustmentFormPage })));
const MoveHistoryPage = lazy(() => import('../pages/operations/MoveHistoryPage').then((m) => ({ default: m.MoveHistoryPage })));

const InventoryOverviewPage = lazy(() => import('../pages/inventory/InventoryOverviewPage').then((m) => ({ default: m.InventoryOverviewPage })));
const StockLedgerPage = lazy(() => import('../pages/inventory/StockLedgerPage').then((m) => ({ default: m.StockLedgerPage })));

const DemandForecastPage = lazy(() => import('../pages/ai/DemandForecastPage').then((m) => ({ default: m.DemandForecastPage })));
const SmartReorderPage = lazy(() => import('../pages/ai/SmartReorderPage').then((m) => ({ default: m.SmartReorderPage })));
const AnomalyDetectionPage = lazy(() => import('../pages/ai/AnomalyDetectionPage').then((m) => ({ default: m.AnomalyDetectionPage })));
const AIRecommendationsPage = lazy(() => import('../pages/ai/AIRecommendationsPage').then((m) => ({ default: m.AIRecommendationsPage })));

const QRScannerPage = lazy(() => import('../pages/scanner/QRScannerPage').then((m) => ({ default: m.QRScannerPage })));

const WarehouseListPage = lazy(() => import('../pages/warehouse/WarehouseListPage').then((m) => ({ default: m.WarehouseListPage })));
const WarehouseFormPage = lazy(() => import('../pages/warehouse/WarehouseFormPage').then((m) => ({ default: m.WarehouseFormPage })));
const WarehouseDetailPage = lazy(() => import('../pages/warehouse/WarehouseDetailPage').then((m) => ({ default: m.WarehouseDetailPage })));

const ReportsPage = lazy(() => import('../pages/reports/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const NotificationsPage = lazy(() => import('../pages/notifications/NotificationsPage').then((m) => ({ default: m.NotificationsPage })));
const SettingsPage = lazy(() => import('../pages/settings/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const ProfilePage = lazy(() => import('../pages/settings/ProfilePage').then((m) => ({ default: m.ProfilePage })));

// Helper to wrap lazy routes with ErrorBoundary + Suspense
const withRouteWrapper = (Component) => (
  <ErrorBoundary>
    <Suspense fallback={<LoadingState message="Loading module..." />}>
      <Component />
    </Suspense>
  </ErrorBoundary>
);

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={withRouteWrapper(LoginPage)} />
        <Route path="/register" element={withRouteWrapper(RegisterPage)} />
        <Route path="/forgot-password" element={withRouteWrapper(ForgotPasswordPage)} />
        <Route path="/verify-otp" element={withRouteWrapper(VerifyOTPPage)} />
        <Route path="/reset-password" element={withRouteWrapper(ResetPasswordPage)} />
      </Route>

      {/* Main App Routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={withRouteWrapper(DashboardPage)} />

        {/* Products */}
        <Route path="/products" element={withRouteWrapper(ProductListPage)} />
        <Route path="/products/add" element={withRouteWrapper(ProductFormPage)} />
        <Route path="/products/:id" element={withRouteWrapper(ProductDetailPage)} />
        <Route path="/products/:id/edit" element={withRouteWrapper(ProductFormPage)} />

        {/* Operations */}
        <Route path="/operations/receipts" element={withRouteWrapper(ReceiptsListPage)} />
        <Route path="/operations/receipts/create" element={withRouteWrapper(ReceiptFormPage)} />
        <Route path="/operations/deliveries" element={withRouteWrapper(DeliveriesListPage)} />
        <Route path="/operations/deliveries/create" element={withRouteWrapper(DeliveryFormPage)} />
        <Route path="/operations/transfers" element={withRouteWrapper(TransfersListPage)} />
        <Route path="/operations/transfers/create" element={withRouteWrapper(TransferFormPage)} />
        <Route path="/operations/adjustments" element={withRouteWrapper(AdjustmentsListPage)} />
        <Route path="/operations/adjustments/create" element={withRouteWrapper(AdjustmentFormPage)} />
        <Route path="/operations/move-history" element={withRouteWrapper(MoveHistoryPage)} />

        {/* Inventory */}
        <Route path="/inventory" element={withRouteWrapper(InventoryOverviewPage)} />
        <Route path="/inventory/ledger" element={withRouteWrapper(StockLedgerPage)} />

        {/* AI & Smart */}
        <Route path="/ai/forecast" element={withRouteWrapper(DemandForecastPage)} />
        <Route path="/ai/reorder" element={withRouteWrapper(SmartReorderPage)} />
        <Route path="/ai/anomalies" element={withRouteWrapper(AnomalyDetectionPage)} />
        <Route path="/ai/recommendations" element={withRouteWrapper(AIRecommendationsPage)} />

        {/* QR Scanner */}
        <Route path="/scanner" element={withRouteWrapper(QRScannerPage)} />

        {/* Warehouse */}
        <Route path="/warehouse" element={withRouteWrapper(WarehouseListPage)} />
        <Route path="/warehouse/add" element={withRouteWrapper(WarehouseFormPage)} />
        <Route path="/warehouse/:id" element={withRouteWrapper(WarehouseDetailPage)} />

        {/* Reports, Notifications, Settings, Profile */}
        <Route path="/reports" element={withRouteWrapper(ReportsPage)} />
        <Route path="/notifications" element={withRouteWrapper(NotificationsPage)} />
        <Route path="/settings" element={withRouteWrapper(SettingsPage)} />
        <Route path="/profile" element={withRouteWrapper(ProfilePage)} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
