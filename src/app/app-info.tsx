import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { InfoScreen } from '@/components/info-screen';

const VERSION = Constants.expoConfig?.version ?? '1.0.0';
const SDK = Constants.expoConfig?.sdkVersion
  ? `Expo SDK ${Constants.expoConfig.sdkVersion}`
  : 'Expo SDK 58';
const PLATFORM =
  Platform.OS === 'ios' ? 'iOS' : Platform.OS === 'android' ? 'Android' : 'Web';

export default function AppInfoScreen() {
  return (
    <InfoScreen
      eyebrow="APP INFORMATION"
      title="WattWise"
      icon="information-circle"
      intro="Details about this build of the app, the technology behind it, and where its data comes from."
      blocks={[
        { heading: 'App version', body: VERSION },
        { heading: 'Runtime', body: `${SDK} · React Native · running on ${PLATFORM}` },
        {
          heading: 'Key features',
          body:
            'Live bill estimation, appliance management, bill breakdown and saved history, monthly budget, electricity rate and calculation period settings, dark/light/system themes, and the WattWise Gemini AI assistant.',
        },
        {
          heading: 'Data sources',
          body:
            'Your own appliance inputs drive every estimate. The Dashboard benchmark uses the REFIT electrical load measurements dataset (UK household, CC BY 4.0), shown only as a historical reference. The AI assistant uses Google Gemini through the WattWise backend.',
        },
        {
          heading: 'Storage',
          body:
            'All personal data is stored locally on this device. No WattWise cloud account is created, and signing in is required again after every fresh launch.',
        },
        {
          heading: 'Developer',
          body: 'WattWise. Questions, bug reports and feature requests: support@wattwise.ph.',
        },
      ]}
      footer={`© 2026 WattWise · Build ${VERSION}`}
    />
  );
}
