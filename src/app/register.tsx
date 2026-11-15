import { InfoScreen } from '@/components/info-screen';

export default function AccountHelpScreen() {
  return (
    <InfoScreen
      eyebrow="ACCOUNT"
      title="Account Help"
      icon="person-circle"
      intro="WattWise uses a single administrator account so that one person manages the household's energy data on this device."
      blocks={[
        {
          heading: 'Creating an account',
          body:
            'Self-service registration is not available in this build. The administrator account is provisioned with the app. If you need access on another device, contact your WattWise administrator.',
        },
        {
          heading: 'Signing in',
          body:
            'Open the app and enter the administrator username and password on the Login screen. A new login is required every time the app is freshly launched; navigating between Dashboard, History and Profile during the same session keeps you signed in.',
        },
        {
          heading: 'Changing your password',
          body:
            'After signing in, go to Profile & Settings → Change Password. Enter the current password, then choose a new one with at least eight characters. The new password is stored as a secure hash on the WattWise server and is required at the next login.',
        },
        {
          heading: 'Forgot your password?',
          body:
            'Password recovery is handled by the administrator who set up the device. Contact support@wattwise.ph or your WattWise administrator to have access restored.',
        },
        {
          heading: 'Editing your profile',
          body:
            'Your display name, email and phone number are managed from Profile & Settings → Edit Profile. Changes are saved locally and stay after you close and reopen the app.',
        },
      ]}
      footer="Never share your administrator password with anyone."
    />
  );
}
