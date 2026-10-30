import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
// Try this path - your supabase file might be named supabaseClient
import { supabase } from "../lib/supabaseClient"; 

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setUser(data.session?.user ?? null);
      } catch (e) {
        console.error(e);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div style={{display:"flex",height:"100vh",alignItems:"center",justifyContent:"center",background:"#052e16",color:"white",fontWeight:"bold"}}>Loading LCNS...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
