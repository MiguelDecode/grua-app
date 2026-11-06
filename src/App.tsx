import { useAuth } from "./hooks/useAuth";
import LoginPage from "./pages/LoginPage";

function App() {
  const { session, profile, isLoading, signOut } = useAuth();

  if (isLoading) {
    return <p>Cargando...</p>;
  }

  if (!session) {
    return <LoginPage />;
  }

  if (!profile) {
    return (
      <div>
        <p>No se ha podido cargar tu perfil. Contacta con el administrador.</p>
        <button onClick={signOut}>Cerrar sesión</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Gestión de grúas</h1>
      <p>Sesión iniciada como {profile.full_name}</p>
      <p>Rol: {profile.role}</p>
      <button onClick={signOut}>Cerrar sesión</button>
    </div>
  );
}

export default App;
