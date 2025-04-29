
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const VerifyHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      // If verified, user is signed in automatically
      if (data.session) navigate("/dashboard", { replace: true });
      else navigate("/auth", { replace: true });
    });
  }, [navigate]);

  return null; // optional: loader spinner
};

export default VerifyHandler;
