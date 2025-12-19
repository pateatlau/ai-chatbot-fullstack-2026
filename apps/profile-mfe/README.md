# Profile MFE

User profile management micro-frontend with settings persistence, profile editing, security settings, and comprehensive state management.

## Features

### 1. Profile Dashboard (`/profile`)

- **User Information Display**: Shows name, email, role, account status
- **Avatar Display**: User initials or uploaded image
- **Quick Actions**: Links to Settings and Security pages
- **Edit Profile Button**: Navigate to profile editing

### 2. Edit Profile (`/profile/edit`)

- **Profile Information**: Update name and avatar
- **Avatar Upload**:
  - File validation (image types only, max 5MB)
  - Live preview using FileReader
  - Dicebear fallback for generated avatars
- **Form Validation**: Required name field, disabled email
- **Optimistic Updates**: Only sends changed fields to API
- **Loading States**: Disabled buttons during async operations
- **Success Feedback**: Toast notification and auto-navigation

### 3. Security Settings (`/profile/security`)

- **Password Change**:
  - Current password verification
  - New password strength validation (8+ chars, uppercase, lowercase, number, special)
  - Confirmation password matching
  - Prevents reusing current password
- **2FA (Coming Soon)**: Placeholder for two-factor authentication
- **Active Sessions (Coming Soon)**: View and manage active sessions
- **Auto-redirect**: Redirects to login after successful password change

### 4. Settings (`/profile/settings`)

- **Notification Preferences**:
  - Email notifications toggle
  - Push notifications toggle
  - Weekly digest toggle
- **Appearance Settings**:
  - Theme selection (Light, Dark, System)
- **Persistence**: All settings saved to localStorage
- **Change Detection**: Shows save prompt for unsaved changes
- **Reset to Defaults**: Restore original settings

## Architecture

### State Management

**Auth Store** (`@myapp/frontend/stores`)

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
```

**Settings Store** (`@myapp/frontend/stores`)

```typescript
interface UserSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
}
```

- Uses Zustand with persist middleware
- Stored in localStorage under 'user-settings'
- Survives page refreshes and browser restarts

### API Integration

**Profile API Client** (`api/profile.api.ts`)

```typescript
class ProfileAPI {
  getCurrentUser(): Promise<User>;
  updateProfile(data): Promise<{ user: User }>;
  changePassword(data): Promise<void>;
  uploadAvatar(file): Promise<{ url: string }>;
}
```

**Features**:

- Axios client with Bearer token authentication
- Auto-redirects to /login on 401 errors
- Error handling with user-friendly messages
- File upload support for avatars

### Form Validation

**Profile Update**:

- Name: Required, trimmed
- Avatar: Image files only, max 5MB
- Email: Disabled (cannot be changed)

**Password Change**:

- Current password: Required
- New password:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- Confirm password: Must match new password
- New password must differ from current password

**Settings**:

- All fields optional (toggles and dropdowns)
- Immediate validation on interaction
- Changes tracked for save prompt

## User Experience

### Loading States

- Buttons disabled during API calls
- Loading text/spinners for async operations
- Prevents double submissions

### Success Feedback

- Toast notifications for all actions
- Auto-navigation after successful operations
- Clear success messages

### Error Handling

- API errors displayed via toast messages
- Form validation errors inline
- Network error handling
- 401 auto-redirect to login

### Navigation Flow

```
/profile
  ├── /profile/edit → Edit Profile
  ├── /profile/security → Change Password & Security
  └── /profile/settings → Notification & Appearance Settings
```

## Testing

### Integration Tests

```bash
node apps/profile-mfe/test-profile-mfe.js
```

**Test Coverage** (22 tests):

- ✓ Settings persistence
- ✓ Profile page rendering
- ✓ Form validation
- ✓ API integration
- ✓ Navigation structure
- ✓ UI components
- ✓ State management
- ✓ User experience

### Manual Testing

1. **Profile View**:
   - Navigate to `/profile`
   - Verify user info displays correctly
   - Check quick action links work

2. **Profile Edit**:
   - Click "Edit Profile"
   - Update name and save
   - Try uploading avatar (validate file size/type errors)
   - Test cancel navigation

3. **Password Change**:
   - Go to `/profile/security`
   - Try invalid passwords (weak, not matching, same as current)
   - Successfully change password
   - Verify redirect to login

4. **Settings**:
   - Navigate to `/profile/settings`
   - Toggle notification settings
   - Change theme
   - Verify save prompt appears
   - Save settings
   - Refresh page - settings should persist
   - Reset to defaults

## Dependencies

```json
{
  "@myapp/frontend/stores": "State management",
  "@myapp/frontend/hooks": "useToast hook",
  "@myapp/frontend/ui-components": "Card, Button, FormField",
  "react-router-dom": "Navigation",
  "axios": "HTTP client",
  "zustand": "State management",
  "zustand/middleware": "Persistence"
}
```

## Future Enhancements

1. **Avatar Management**:
   - [ ] Real avatar upload to cloud storage
   - [ ] Avatar cropping/editing
   - [ ] Multiple avatar selection

2. **Security**:
   - [ ] Two-factor authentication (2FA)
   - [ ] Active session management
   - [ ] Login history
   - [ ] Security alerts

3. **Settings**:
   - [ ] Language selection
   - [ ] Timezone settings
   - [ ] Privacy preferences
   - [ ] Data export

4. **Profile**:
   - [ ] Bio/description field
   - [ ] Social media links
   - [ ] Profile visibility settings
   - [ ] Custom profile URL

## Status

✅ **Complete** (95%)

- Profile viewing and editing
- Password change functionality
- Settings persistence
- Form validation
- API integration
- Loading and error states
- Toast notifications
- Comprehensive testing

🔲 **Pending** (5%)

- Real avatar upload (using placeholder)
- 2FA implementation
- Active session management

## Performance

- **Bundle Size**: Optimized with code splitting
- **Persistence**: localStorage for instant settings restore
- **Optimistic Updates**: Only sends changed fields
- **Image Optimization**: File size validation before upload
- **Loading States**: Prevents multiple submissions
