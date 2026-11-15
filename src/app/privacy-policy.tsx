import { InfoScreen } from '@/components/info-screen';

export default function PrivacyPolicyScreen() {
  return (
    <InfoScreen
      eyebrow="LEGAL"
      title="Privacy Policy"
      icon="shield-checkmark"
      intro="WattWise is designed to keep your household data on your own device. This page explains what is stored and what leaves the app."
      blocks={[
        {
          heading: 'What is stored on your device',
          body:
            'Your profile (name, email and phone number), appliance list, electricity rate, budget, calculation period, theme preference and saved bill history are stored locally using the app\'s secure local storage. They are not uploaded to a WattWise account or server.',
        },
        {
          heading: 'AI assistant messages',
          body:
            'When you send a message in the WattWise AI chat, the text of that message is sent to the configured WattWise backend and forwarded to Google Gemini so a reply can be generated. Avoid sharing names, addresses, account numbers or other sensitive information in chat.',
        },
        {
          heading: 'What we do not do',
          body:
            'WattWise does not sell your data, does not include third-party advertising, and does not collect analytics about how you use the app in this build.',
        },
        {
          heading: 'History and reference data',
          body:
            'The REFIT benchmark shown on the Dashboard is a public research dataset about a UK household. It contains no information about you and is never mixed with your appliance data.',
        },
        {
          heading: 'Deleting your data',
          body:
            'You can delete individual saved bills from the History tab. Clearing the app\'s storage or uninstalling WattWise removes the profile, appliances, settings and history from this device.',
        },
        {
          heading: 'Contact',
          body:
            'Questions about this policy can be sent to privacy@wattwise.ph. We will update this page if the app\'s data handling changes.',
        },
      ]}
      footer="Last updated: November 2026"
    />
  );
}
