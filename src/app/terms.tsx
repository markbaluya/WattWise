import { InfoScreen } from '@/components/info-screen';

export default function TermsScreen() {
  return (
    <InfoScreen
      eyebrow="LEGAL"
      title="Terms & Conditions"
      icon="document-text"
      intro="Please read these terms before relying on WattWise estimates. By using the app you agree to them."
      blocks={[
        {
          heading: '1. Estimates, not official bills',
          body:
            'WattWise produces estimates from the appliance details, electricity rate and calculation period you enter. Actual bills depend on real usage, meter readings, taxes, subsidies and other charges from your distribution utility. Always use your official bill for payment decisions.',
        },
        {
          heading: '2. Your responsibilities',
          body:
            'Enter accurate wattage and usage values, keep your login credentials private, and use the app only for lawful, personal household energy planning. You are responsible for the data you add to the app.',
        },
        {
          heading: '3. AI-generated guidance',
          body:
            'The WattWise AI assistant can make mistakes. Its suggestions are general information, not professional electrical, safety, legal or financial advice. Consult a licensed electrician or your utility provider before acting on anything risky.',
        },
        {
          heading: '4. Availability',
          body:
            'The app and its AI features may be changed, interrupted or unavailable, including when the backend service or network connection is offline. WattWise is provided "as is" without warranties of accuracy or fitness for a particular purpose.',
        },
        {
          heading: '5. Data and privacy',
          body:
            'Your use of the app is also governed by the WattWise Privacy Policy. Profile details, appliances and bills stay on your device; chat messages are processed to generate a reply.',
        },
        {
          heading: '6. Changes to these terms',
          body:
            'These terms may be updated as the app evolves. Continued use after an update means you accept the revised terms. The date below shows the latest revision.',
        },
        {
          heading: '7. Contact',
          body: 'Questions about these terms: legal@wattwise.ph.',
        },
      ]}
      footer="Last updated: November 2026"
    />
  );
}
