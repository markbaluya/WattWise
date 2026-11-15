import { InfoScreen } from '@/components/info-screen';

export default function ForgotPasswordScreen() {
  return (
    <InfoScreen
      eyebrow="ACCOUNT"
      title="Password Help"
      icon="lock-closed"
      intro="WattWise does not send reset links by email. Use the steps below to regain access to the administrator account."
      blocks={[
        {
          heading: 'If you are still signed in',
          body:
            'Open Profile & Settings → Change Password. Confirm your current password, choose a new password of at least eight characters, and save. The new password takes effect the next time you log in.',
        },
        {
          heading: 'If you are signed out',
          body:
            'Ask the WattWise administrator for the current password. For security, passwords are stored only as a secure hash on the WattWise server, so they cannot be read or recovered from the app.',
        },
        {
          heading: 'Resetting the device',
          body:
            'Clearing the app\'s storage or reinstalling WattWise does not change the administrator password (it is stored securely on the server). It only removes local data such as appliances, settings and saved bills. Only do this if you accept that data loss.',
        },
        {
          heading: 'Contact',
          body: 'Still locked out? Email support@wattwise.ph for help restoring access.',
        },
      ]}
      footer="For your security, never store your password in a note inside the app."
    />
  );
}
