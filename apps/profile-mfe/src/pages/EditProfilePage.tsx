import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@myapp/frontend/hooks';
import {
  Card,
  FormField,
  Button,
  ErrorBoundary,
  cn,
} from '@myapp/frontend/ui-components';
import { useProfile, useUpdateProfile } from '@myapp/frontend/apollo-client';
import {
  useProfileStore,
  useProfileStoreInitialization,
  useProfileAvatarUpload,
} from '../store/profile.store';
import { getEventBus, EVENT_NAMES } from '@myapp/shared/event-bus';

function EditProfilePageContent() {
  // Initialize profile store with event bus subscriptions
  useProfileStoreInitialization();

  // Use avatar upload helper
  const { uploadAvatar: uploadAvatarToStore } = useProfileAvatarUpload();

  // Fetch user profile via GraphQL
  const { data: profileData, loading: profileLoading } = useProfile();
  const profileUser = profileData?.me;

  // Mutation for updating profile
  const updateProfileMutation = useUpdateProfile();

  const { user, setProfile } = useProfileStore();
  const navigate = useNavigate();
  const toast = useToast();

  const [name, setName] = useState(profileUser?.firstName || user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      setIsUploadingAvatar(true);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload avatar using store helper (emits events)
      const url = await uploadAvatarToStore(file);
      setAvatar(url);

      toast.success('Avatar uploaded successfully');
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast.error(error.response?.data?.error || 'Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    try {
      setIsLoading(true);

      const updateData: any = {};

      // Only include changed fields
      if (name !== profileUser?.firstName && name !== user?.name) {
        updateData.firstName = name.trim();
      }

      if (avatar !== user?.avatar) {
        updateData.avatar = avatar || null;
      }

      if (Object.keys(updateData).length === 0) {
        toast.info('No changes to save');
        navigate('/profile');
        return;
      }

      // Use GraphQL mutation instead of REST API
      const result = await updateProfileMutation(updateData);

      if (result.data?.updateProfile) {
        const updatedProfile = result.data.updateProfile;

        // Update profile in store
        setProfile({
          id: updatedProfile.id,
          email: updatedProfile.email,
          name: updatedProfile.firstName,
          role: updatedProfile.role,
          avatar: avatar || null,
          isActive: true,
          createdAt: user?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        // Emit event for cross-MFE coordination
        const eventBus = getEventBus();
        eventBus.emit(EVENT_NAMES.USER_PROFILE_UPDATED, {
          userId: updatedProfile.id,
          updates: updateData,
        });

        toast.success('Profile updated successfully');
        navigate('/profile');
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      const errorMessage =
        error.graphQLErrors?.[0]?.message ||
        error.message ||
        'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  return (
    <div className={cn('max-w-3xl mx-auto', 'px-4 py-6 sm:px-6 lg:px-8')}>
      <div className="mb-8">
        <h1 className={cn('text-3xl font-bold', 'text-text-primary')}>
          Edit Profile
        </h1>
        <p className={cn('mt-2', 'text-text-secondary')}>
          Update your profile information
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div>
            <label
              className={cn(
                'block text-sm font-medium mb-2',
                'text-text-primary'
              )}
            >
              Profile Picture
            </label>
            <div
              className={cn(
                'flex flex-col sm:flex-row sm:items-center',
                'gap-4 sm:gap-6'
              )}
            >
              <div
                className={cn(
                  'w-20 h-20 rounded-full flex-shrink-0',
                  'flex items-center justify-center',
                  'text-white text-2xl font-bold overflow-hidden',
                  'bg-gradient-to-br from-purple-500 to-purple-700'
                )}
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                >
                  {isUploadingAvatar ? 'Uploading...' : 'Change Avatar'}
                </Button>
                <p className={cn('mt-1 text-xs', 'text-text-tertiary')}>
                  PNG, JPG up to 5MB
                </p>
              </div>
            </div>
          </div>

          <FormField
            label="Full name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <FormField
            label="Email address"
            type="email"
            value={user?.email || ''}
            disabled
            hint="Email cannot be changed"
          />

          <div className="flex flex-col sm:flex-row-reverse gap-3 sm:justify-start">
            <Button type="submit" disabled={isLoading} loading={isLoading}>
              Save Changes
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export function EditProfilePage() {
  return (
    <ErrorBoundary variant="full" context="page-profile-edit">
      <EditProfilePageContent />
    </ErrorBoundary>
  );
}
