
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDevUser } from "@/hooks/useDevUser";
import { useNavigate } from "react-router-dom";
import ProfileForm from "@/components/profile/ProfileForm";
import { useProfile } from "@/hooks/useProfile";
import { UserProfile } from "@/types/profile";

const Profile = () => {
  const { user } = useAuth();
  const devUser = useDevUser();
  const navigate = useNavigate();
  const { userId, getProfile } = useProfile();
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Partial<UserProfile> | null>(null);

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (userId) {
        try {
          const data = await getProfile();
          setProfile(data);
        } catch (error) {
          console.error("Error loading profile:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [userId, getProfile]);

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
        initialData={profile || undefined}
        isDev={!!devUser}
      />
    </div>
  );
};

export default Profile;
