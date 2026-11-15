import applianceReadings from '../../datasets/processed/applianceReadings.json';
import dailyConsumption from '../../datasets/processed/dailyConsumption.json';
import monthlyConsumption from '../../datasets/processed/monthlyConsumption.json';
import datasetInfo from '../../datasets/processed/datasetInfo.json';

export type ApplianceReading = {
  id: number;
  name: string;
  avgWatts: number;
};

export type HourlyReading = {
  hour: number;
  label: string;
  aggregateAvgWatts: number;
  appliances: ApplianceReading[];
};

export type DailyConsumption = {
  date: string;
  aggregateKwh: number;
  appliances: { id: number; name: string; kwh: number; avgWatts: number }[];
};

export type MonthlyConsumption = {
  month: string;
  aggregateKwh: number;
  appliances: { id: number; name: string; kwh: number }[];
};

export type DatasetInfo = {
  name: string;
  creators: string[];
  institution: string;
  source: string;
  doi: string;
  license: string;
  description: string;
  household: number;
  appliances: { id: number; name: string }[];
  samplePeriod: string;
  totalReadings: number;
  samplingInterval: string;
  unit: string;
  note: string;
};

export function getApplianceReadings(): HourlyReading[] {
  return (applianceReadings as any).hourly || [];
}

export function getDailyConsumption(): DailyConsumption[] {
  return (dailyConsumption as any) || [];
}

export function getMonthlyConsumption(): MonthlyConsumption[] {
  return (monthlyConsumption as any) || [];
}

export function getApplianceConsumption(applianceId: number): { date: string; kwh: number; avgWatts: number }[] {
  return getDailyConsumption().map((d) => {
    const a = d.appliances.find((x) => x.id === applianceId);
    return { date: d.date, kwh: a?.kwh || 0, avgWatts: a?.avgWatts || 0 };
  });
}

export function getAvailableAppliances(): { id: number; name: string }[] {
  return (datasetInfo as any).appliances || [];
}

export function getDatasetInformation(): DatasetInfo {
  return datasetInfo as DatasetInfo;
}

export function getSampleDate(): string {
  return (applianceReadings as any).sampleDate || '';
}