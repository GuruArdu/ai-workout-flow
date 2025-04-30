
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProfileForm from "@/components/profile/ProfileForm";
import { useProfile } from "@/hooks/useProfile";
import { UserProfile } from "@/types/profile";
import { useDevUser } from "@/hooks/useDevUser";

const Profile = () => {
  const { userId } = useProfile();
  const devUser = useDevUser();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);

  // Redirect if no user (real or dev)
  useEffect(() => {
    if (!userId) {
      navigate("/auth");
    } else {
      setLoading(false);
    }
  }, [userId, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  // Show form only if we have a userId (real or dev)
  if (!userId) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <ProfileForm isDev={!!devUser} />
    </div>
  );
};

export default Profile;
