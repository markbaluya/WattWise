import { InfoScreen } from '@/components/info-screen';

export default function HelpSupportScreen() {
  return (
    <InfoScreen
      eyebrow="SUPPORT"
      title="Help & Support"
      icon="help-buoy"
      intro="Quick answers to the questions we hear most often. Most issues can be solved right from Profile & Settings."
      blocks={[
        {
          heading: 'Why is my Dashboard empty?',
          body:
            'The Dashboard estimate is built only from appliances you add. Tap "Add Appliance" on the Dashboard or open Manage in the Appliance Breakdown section to add your first appliance. Nothing is pre-filled, so the numbers always reflect your own home.',
        },
        {
          heading: 'How is my bill computed?',
          body:
            'Each appliance contributes (watts × quantity × hours per day × days) ÷ 1000 kWh. The total kWh is multiplied by the electricity rate saved in Profile & Settings → Electricity Rate. Change the rate or the calculation period there and every screen updates automatically.',
        },
        {
          heading: 'Where do my saved bills go?',
          body:
            'Open Bill Breakdown from the Dashboard, review the estimate, then save it. Saved estimates appear in the History tab, where you can open a record to review the appliance breakdown or delete it.',
        },
        {
          heading: 'How do I change my name or profile details?',
          body:
            'Go to Profile & Settings → Edit Profile. Enter your full name (it cannot be empty), then tap Save Changes. The new name is stored on this device and appears on the Profile screen and the Dashboard greeting.',
        },
        {
          heading: 'Dark mode or light mode is not saving',
          body:
            'Choose Dark Mode, Light Mode or System Default in the Appearance section of Profile & Settings. Your choice is stored on the device and applied across the app immediately.',
        },
        {
          heading: 'The AI assistant is not replying',
          body:
            'The assistant needs the WattWise backend to be running. If it is unavailable, the chat screen falls back to a built-in response. Check your connection and try again. WattWise AI answers are guidance only — verify important decisions with a licensed electrician or your utility provider.',
        },
        {
          heading: 'Contact us',
          body:
            'Still stuck? Email support@wattwise.ph with your app version (App Information), a short description of the issue, and the steps that led to it. We usually reply within two business days.',
        },
      ]}
      footer="WattWise support is available for this demo build by email only."
    />
  );
}
