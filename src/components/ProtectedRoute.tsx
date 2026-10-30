import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: any) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div style={{display:"flex",height:"100vh",alignItems:"center",justifyContent:"center",background:"#052e16",color:"white",fontWeight:"bold"}}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
