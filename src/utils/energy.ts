/**
 * Shared electricity estimate math.
 *
 * Monthly kWh   = (Watts × Quantity × Hours per day × Days) / 1000
 * Monthly Cost  = Monthly kWh × Electricity Rate (₱/kWh)
 *
 * Every screen (Dashboard, Bill Breakdown, Bill History, Budget) must use these
 * helpers so the numbers can never drift apart.
 */

export type EnergyInputs = {
  watts: number;
  quantity: number;
  hours: number;
  days: number;
};

export type ApplianceEnergy = {
  monthlyKwh: number;
  monthlyCost: number;
};

export type ApplianceWithEnergy<T extends EnergyInputs> = T & ApplianceEnergy;

export type EnergyTotals<T extends EnergyInputs> = {
  items: ApplianceWithEnergy<T>[];
  applianceCount: number;
  totalUnits: number;
  totalWatts: number;
  totalKwh: number;
  totalCost: number;
};

const positive = (value: number) => (Number.isFinite(value) && value > 0 ? value : 0);

export function calcApplianceEnergy(appliance: EnergyInputs, rate: number): ApplianceEnergy {
  const monthlyKwh =
    (positive(appliance.watts) *
      positive(appliance.quantity) *
      positive(appliance.hours) *
      positive(appliance.days)) /
    1000;
  const safeRate = Number.isFinite(rate) && rate > 0 ? rate : 0;
  return { monthlyKwh, monthlyCost: monthlyKwh * safeRate };
}

export function calcEnergyTotals<T extends EnergyInputs>(
  appliances: T[],
  rate: number
): EnergyTotals<T> {
  const items = appliances.map((appliance) => ({
    ...appliance,
    ...calcApplianceEnergy(appliance, rate),
  }));

  return {
    items,
    applianceCount: appliances.length,
    totalUnits: appliances.reduce((sum, a) => sum + positive(a.quantity), 0),
    totalWatts: appliances.reduce((sum, a) => sum + positive(a.watts) * positive(a.quantity), 0),
    totalKwh: items.reduce((sum, a) => sum + a.monthlyKwh, 0),
    totalCost: items.reduce((sum, a) => sum + a.monthlyCost, 0),
  };
}

/** Format a number with thousands separators, e.g. 1234.5 -> "1,234.50". */
export function formatNumber(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return '0';
  const fixed = Math.abs(value).toFixed(decimals);
  const [whole, fraction] = fixed.split('.');
  const withSeparators = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const sign = value < 0 ? '-' : '';
  return fraction ? `${sign}${withSeparators}.${fraction}` : `${sign}${withSeparators}`;
}

/** Format a peso amount, e.g. 558 -> "₱558.00". */
export function formatPeso(value: number, decimals = 2): string {
  return `₱${formatNumber(value, decimals)}`;
}
