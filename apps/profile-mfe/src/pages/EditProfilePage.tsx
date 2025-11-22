import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@myapp/frontend/hooks';
import {
  Card,
  FormField,
  Button,
  ErrorBoundary,
} from '@myapp/frontend/ui-components';
import { profileAPI } from '../api/profile.api';
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

  const { user, setProfile } = useProfileStore();
  const navigate = useNavigate();
  const toast = useToast();

  const [name, setName] = useState(user?.name || '');
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
      if (name !== user?.name) {
        updateData.name = name.trim();
      }

      if (avatar !== user?.avatar) {
        updateData.avatar = avatar || null;
      }

      if (Object.keys(updateData).length === 0) {
        toast.info('No changes to save');
        navigate('/profile');
        return;
      }

      const response = await profileAPI.updateProfile(updateData);

      // Update profile in store
      setProfile(response.user);

      // Emit event for cross-MFE coordination
      const eventBus = getEventBus();
      eventBus.emit(EVENT_NAMES.USER_PROFILE_UPDATED, {
        userId: user?.id,
        updates: updateData,
      });

      toast.success('Profile updated successfully');
      navigate('/profile');
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
        <p className="mt-2 text-gray-600">Update your profile information</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Picture
            </label>
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
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
                <p className="mt-1 text-xs text-gray-500">PNG, JPG up to 5MB</p>
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

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} loading={isLoading}>
              Save Changes
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
