"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Pencil, Save, X, User } from "lucide-react";
import { UserProfile } from "@/lib/domains/user-profile.domain";
import {
  getUserProfileByUserId,
  updateUserProfile,
  createUserProfile,
} from "@/lib/actions/user-profile.action";
import { useAuth } from "@/lib/auth-context";

export default function ProfilePage() {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    ic: "",
    bank_account: "",
    bank_name: "",
    email: "",
    phone: "",
  });

  // Load user profile on component mount
  useEffect(() => {
    if (user?.uid) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user?.uid) return;

    setIsLoading(true);
    setError(null);

    try {
      const { userProfile: profile, error: fetchError } =
        await getUserProfileByUserId(user.uid);

      if (fetchError) {
        setError(fetchError);
      } else if (profile) {
        setUserProfile(profile);
        setFormData({
          name: profile.name,
          ic: profile.ic,
          bank_account: profile.bank_account,
          bank_name: profile.bank_name,
          email: profile.email,
          phone: profile.phone,
        });
      }
    } catch (err) {
      setError("Failed to load profile");
      console.error("Error loading profile:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!user?.uid) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const profileData: UserProfile = {
        user_id: user.uid,
        name: formData.name,
        ic: formData.ic,
        bank_account: formData.bank_account,
        bank_name: formData.bank_name,
        email: formData.email,
        phone: formData.phone,
      };

      let result;

      if (userProfile?.id) {
        // Update existing profile
        result = await updateUserProfile(userProfile.id, profileData);
      } else {
        // Create new profile
        result = await createUserProfile(profileData);
      }

      if (result.success) {
        setSuccess("Profile saved successfully!");
        setIsEditing(false);
        // Reload the profile to get updated data
        await loadUserProfile();
      } else {
        setError(result.error || "Failed to save profile");
      }
    } catch (err) {
      setError("Failed to save profile");
      console.error("Error saving profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (userProfile) {
      setFormData({
        name: userProfile.name,
        ic: userProfile.ic,
        bank_account: userProfile.bank_account,
        bank_name: userProfile.bank_name,
        email: userProfile.email,
        phone: userProfile.phone,
      });
    }
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <User className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Profile</h1>
              <p className="text-muted-foreground">
                Manage your personal information
              </p>
            </div>
          </div>

          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Pencil className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="p-3 bg-muted rounded-md">
                    {userProfile?.name || "Not provided"}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter your email address"
                  />
                ) : (
                  <div className="p-3 bg-muted rounded-md">
                    {userProfile?.email || "Not provided"}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Enter your phone number"
                  />
                ) : (
                  <div className="p-3 bg-muted rounded-md">
                    {userProfile?.phone || "Not provided"}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ic">IC Number</Label>
                {isEditing ? (
                  <Input
                    id="ic"
                    value={formData.ic}
                    onChange={(e) => handleInputChange("ic", e.target.value)}
                    placeholder="Enter your IC number"
                  />
                ) : (
                  <div className="p-3 bg-muted rounded-md">
                    {userProfile?.ic || "Not provided"}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank_name">Bank Name</Label>
                {isEditing ? (
                  <Input
                    id="bank_name"
                    value={formData.bank_name}
                    onChange={(e) =>
                      handleInputChange("bank_name", e.target.value)
                    }
                    placeholder="Enter your bank name"
                  />
                ) : (
                  <div className="p-3 bg-muted rounded-md">
                    {userProfile?.bank_name || "Not provided"}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bank_account">Bank Account Number</Label>
              {isEditing ? (
                <Input
                  id="bank_account"
                  value={formData.bank_account}
                  onChange={(e) =>
                    handleInputChange("bank_account", e.target.value)
                  }
                  placeholder="Enter your bank account number"
                />
              ) : (
                <div className="p-3 bg-muted rounded-md">
                  {userProfile?.bank_account || "Not provided"}
                </div>
              )}
            </div>

            {isEditing && (
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  disabled={isSaving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {userProfile?.created_at && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Profile created on{" "}
            {new Date(userProfile.created_at).toLocaleDateString()}
            {userProfile.updated_at &&
              userProfile.updated_at !== userProfile.created_at && (
                <span className="block">
                  Last updated on{" "}
                  {new Date(userProfile.updated_at).toLocaleDateString()}
                </span>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
