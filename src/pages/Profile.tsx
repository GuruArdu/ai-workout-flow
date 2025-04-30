
import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDevUser } from "@/hooks/useDevUser";
import { useNavigate } from "react-router-dom";
import ProfileForm from "@/components/profile/ProfileForm";
import { useProfileData } from "@/hooks/useProfileData";

const Profile = () => {
  const { user } = useAuth();
  const devUser = useDevUser();
  const navigate = useNavigate();
  
  // Get either authenticated user or dev user ID
  const userId = user?.id || (devUser?.id || null);
  
  const { profile, loading } = useProfileData(userId, !!devUser);

  // Redirect if no user (real or dev)
  useEffect(() => {
    if (!loading && !userId) {
      navigate("/auth");
    }
  }, [loading, userId, navigate]);

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
      <ProfileForm 
        userId={userId} 
        initialData={profile || undefined}
        isDev={!!devUser}
      />
    </div>
  );
};

export default Profile;
