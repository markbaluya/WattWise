import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calcEnergyTotals, EnergyTotals } from '@/utils/energy';

export type Appliance = {
  id: string;
  name: string;
  watts: number;
  quantity: number;
  hours: number;
  days: number;
  emoji: string;
};

export type Settings = {
  theme: 'dark' | 'light' | 'system';
  electricityRate: number;
  monthlyBudget: number;
  calcPeriod: number;
  billNotifications: boolean;
  energyReminders: boolean;
};

export type Calculation = {
  appliance: Appliance;
  consumption: number;
  cost: number;
};

export type BillRecord = {
  id: string;
  date: string;
  period: number;
  appliances: Appliance[];
  rate: number;
  calculations: Calculation[];
  totalConsumption: number;
  totalCost: number;
};

type AppContextType = {
  appliances: Appliance[];
  addAppliance: (a: Appliance) => void;
  updateAppliance: (id: string, patch: Partial<Appliance>) => void;
  removeAppliance: (id: string) => void;
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
  calculations: Calculation[];
  calculateAll: () => void;
  lastCalc: { consumption: number; cost: number } | null;
  /** Live totals derived from the current appliance list + saved electricity rate. */
  totals: EnergyTotals<Appliance>;
  billHistory: BillRecord[];
  saveBill: () => void;
  deleteBill: (id: string) => void;
};

const defaultSettings: Settings = {
  theme: 'system',
  electricityRate: 12,
  monthlyBudget: 2000,
  calcPeriod: 30,
  billNotifications: true,
  energyReminders: true,
};

// The previous build shipped with three hardcoded sample appliances. They are
// removed on load so the estimate only ever reflects appliances the user chose.
const LEGACY_SEED_SIGNATURES = [
  { id: '1', name: 'Air Conditioner', watts: 150, quantity: 1, hours: 8, days: 30 },
  { id: '2', name: 'Refrigerator', watts: 200, quantity: 1, hours: 24, days: 30 },
  { id: '3', name: 'Television', watts: 120, quantity: 1, hours: 5, days: 30 },
];

const isLegacySeed = (a: Appliance) =>
  LEGACY_SEED_SIGNATURES.some(
    (seed) =>
      a.id === seed.id &&
      a.name === seed.name &&
      a.watts === seed.watts &&
      a.quantity === seed.quantity &&
      a.hours === seed.hours &&
      a.days === seed.days
  );

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Starts empty: the dashboard estimate is built only from appliances the user adds.
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [lastCalc, setLastCalc] = useState<{ consumption: number; cost: number } | null>(null);
  const [billHistory, setBillHistory] = useState<BillRecord[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('app_state');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed.appliances)) setAppliances(parsed.appliances.filter((a: Appliance) => !isLegacySeed(a)));
          if (parsed.settings) setSettings({ ...defaultSettings, ...parsed.settings });
          if (Array.isArray(parsed.calculations)) setCalculations(parsed.calculations);
          if (Array.isArray(parsed.billHistory)) setBillHistory(parsed.billHistory);
        }
      } catch {
        // Corrupt storage: fall back to a clean state.
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem('app_state', JSON.stringify({ appliances, settings, calculations, billHistory })).catch(() => {});
  }, [appliances, settings, calculations, billHistory, hydrated]);

  const addAppliance = (a: Appliance) => setAppliances((prev) => [...prev, a]);
  const updateAppliance = (id: string, patch: Partial<Appliance>) =>
    setAppliances((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  const removeAppliance = (id: string) => setAppliances((prev) => prev.filter((a) => a.id !== id));

  const updateSettings = (patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
    // The calculation period is app-wide: keep every appliance's days in sync so
    // the dashboard period, the bill breakdown and the history always agree.
    if (patch.calcPeriod && patch.calcPeriod > 0) {
      const days = patch.calcPeriod;
      setAppliances((prev) => prev.map((a) => ({ ...a, days })));
    }
  };

  const totals = useMemo(
    () => calcEnergyTotals(appliances, settings.electricityRate),
    [appliances, settings.electricityRate]
  );

  const calculateAll = () => {
    const result = calcEnergyTotals(appliances, settings.electricityRate);
    setCalculations(
      result.items.map((item) => ({
        appliance: {
          id: item.id,
          name: item.name,
          watts: item.watts,
          quantity: item.quantity,
          hours: item.hours,
          days: item.days,
          emoji: item.emoji,
        },
        consumption: item.monthlyKwh,
        cost: item.monthlyCost,
      }))
    );
    setLastCalc({ consumption: result.totalKwh, cost: result.totalCost });
  };

  const saveBill = () => {
    if (appliances.length === 0) return;
    const result = calcEnergyTotals(appliances, settings.electricityRate);
    const calcs: Calculation[] = result.items.map((item) => ({
      appliance: {
        id: item.id,
        name: item.name,
        watts: item.watts,
        quantity: item.quantity,
        hours: item.hours,
        days: item.days,
        emoji: item.emoji,
      },
      consumption: item.monthlyKwh,
      cost: item.monthlyCost,
    }));
    const record: BillRecord = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 8),
      date: new Date().toISOString(),
      period: settings.calcPeriod,
      appliances: appliances.map((a) => ({ ...a })),
      rate: settings.electricityRate,
      calculations: calcs,
      totalConsumption: result.totalKwh,
      totalCost: result.totalCost,
    };
    setCalculations(calcs);
    setLastCalc({ consumption: result.totalKwh, cost: result.totalCost });
    setBillHistory((prev) => [record, ...prev]);
  };

  const deleteBill = (id: string) => {
    setBillHistory((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        appliances,
        addAppliance,
        updateAppliance,
        removeAppliance,
        settings,
        updateSettings,
        calculations,
        calculateAll,
        lastCalc,
        totals,
        billHistory,
        saveBill,
        deleteBill,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
