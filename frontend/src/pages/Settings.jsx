import { useEffect, useState } from "react"
import Loading from "../components/Loading";
import { Lock, Settings2 } from "lucide-react";
import ProfileForm from "../components/ProfileForm";
import ChangePassword from "../components/ChangePassword";
import PageHero from "../components/layout/PageHero";
import api from "../api/axios";
import toast from "react-hot-toast";

const Settings = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/profile");

      setProfile(data);
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
        "Failed to load profile"
      );
    } finally {
      setLoading(false);
      setInitialLoading(false);

    }
  };

  useEffect(() => {
    fetchProfile();
  }, []); 

  if(initialLoading) return <Loading/>

  return (
    <div className="animate-fade-in">

      <PageHero
        icon={Settings2}
        title="Settings"
        subtitle="Manage your account and preferences"
      />

      {profile && <ProfileForm initialData={profile} onSuccess={fetchProfile}/>}

      {/* Change password trigger */}
      <div className="card max-w-md p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-100 rounded-lg">
            <Lock className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <p className="font-medium text-slate-900">Password</p>
            <p className="text-sm text-slate-500">Update your account password</p>
          </div>
        </div>
        <button className="btn-secondary text-sm"
        onClick={() => setShowPasswordModal(true)}>
          Change 
        </button>
      </div>
      <ChangePassword open={showPasswordModal} onClose={() => setShowPasswordModal(false)}/>
    </div>
  )
}

export default Settings