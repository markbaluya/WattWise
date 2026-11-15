import { InfoScreen } from '@/components/info-screen';

export default function AboutScreen() {
  return (
    <InfoScreen
      eyebrow="ABOUT"
      title="About WattWise"
      icon="flash"
      intro="WattWise helps you understand where your electricity bill comes from and how your everyday appliances add up."
      blocks={[
        {
          heading: 'What WattWise does',
          body:
            'Add the appliances in your home with their wattage, quantity and daily usage hours. WattWise converts them into kilowatt-hours (kWh) and estimates the cost using the electricity rate and calculation period you set in Profile & Settings. You can save each estimate to Bill History and ask the WattWise AI assistant for advice.',
        },
        {
          heading: 'How the estimate is calculated',
          body:
            'kWh = (watts × quantity × hours per day × days) ÷ 1000. Estimated cost = kWh × your electricity rate. The result is an estimate based on the values you enter — it is not an official reading from your distribution utility.',
        },
        {
          heading: 'Historical reference data',
          body:
            'The Dashboard also shows a benchmark from the REFIT dataset (UK household appliance readings, CC BY 4.0). It is labelled "Historical Reference" and is never added to your own estimate or bill history.',
        },
        {
          heading: 'Your account',
          body:
            'WattWise uses a single administrator account. Your profile, appliances, settings and saved bills are stored only on this device. For privacy and security, the session ends whenever the app is freshly launched, so you will be asked to log in again.',
        },
      ]}
      footer="WattWise 1.0.0 — Track Smart. Save Smart."
    />
  );
}
