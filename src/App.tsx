import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";
import LoginPage from "./pages/LoginPage";

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get the current session when the app starts
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    // Listen to login and logout events
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      },
    );

    // Stop listening when the component disappears
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  if (isLoading) {
    return <p>Cargando...</p>;
  }

  if (!session) {
    return <LoginPage />;
  }

  return (
    <div>
      <h1>Gestión de grúas</h1>
      <p>Sesión iniciada como {session.user.email}</p>
      <button onClick={handleLogout}>Cerrar sesión</button>
    </div>
  );
}

export default App;
