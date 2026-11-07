import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";
import { ROLE_HOME_PATH } from "./lib/roles";
import AdminHomePage from "./pages/AdminHomePage";
import DriverHomePage from "./pages/DriverHomePage";
import LoginPage from "./pages/LoginPage";
import RequesterHomePage from "./pages/RequesterHomePage";
import NewRequestPage from "./pages/NewRequestPage";
import AdminDealershipsPage from "./pages/AdminDealershipsPage";

// Shows the login page, or skips it if the user is already logged in
function LoginRoute() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return <p>Cargando...</p>;
  }

  if (session) {
    return <Navigate to="/" replace />;
  }

  return <LoginPage />;
}

// Sends the user to the home page of their role
function HomeRedirect() {
  const { profile } = useAuth();

  if (!profile) {
    return null;
  }

  return <Navigate to={ROLE_HOME_PATH[profile.role]} replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />

      {/* Everything below requires a logged user */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<HomeRedirect />} />

        <Route element={<AppLayout />}>
          <Route element={<ProtectedRoute allowedRoles={["requester"]} />}>
            <Route path="/requester" element={<RequesterHomePage />} />
            <Route path="/requester/new" element={<NewRequestPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["driver"]} />}>
            <Route path="/driver" element={<DriverHomePage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminHomePage />} />
            <Route
              path="/admin/dealerships"
              element={<AdminDealershipsPage />}
            />
          </Route>
        </Route>
      </Route>

      {/* Any unknown address goes back to the start */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
