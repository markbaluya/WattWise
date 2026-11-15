const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '..', 'refit_house11_5mb.csv');
// Use the downloaded sample
const samplePath = 'C:/Users/maryq/AppData/Local/Temp/opencode/refit_house11_5mb.csv';

const applianceNames = {
  1: 'Fridge',
  2: 'Fridge-Freezer',
  3: 'Washing Machine',
  4: 'Dishwasher',
  5: 'Computer Site',
  6: 'Microwave',
  7: 'Kettle',
  8: 'Router',
  9: 'Hi-Fi'
};

const lines = fs.readFileSync(samplePath, 'utf8').trim().split('\n');
const header = lines[0].split(',');
// Time,Unix,Aggregate,Appliance1..9,Issues

// Parse all rows
const rows = [];
for (let i = 1; i < lines.length; i++) {
  const parts = lines[i].split(',');
  if (parts.length < 13) continue;
  const issues = parseInt(parts[12]);
  if (issues !== 0) continue; // skip rows with issues
  rows.push({
    time: parts[0],
    unix: parseInt(parts[1]),
    aggregate: parseFloat(parts[2]),
    appliances: {
      1: parseFloat(parts[3]),
      2: parseFloat(parts[4]),
      3: parseFloat(parts[5]),
      4: parseFloat(parts[6]),
      5: parseFloat(parts[7]),
      6: parseFloat(parts[8]),
      7: parseFloat(parts[9]),
      8: parseFloat(parts[10]),
      9: parseFloat(parts[11]),
    }
  });
}

console.log('Total valid rows:', rows.length);

// Daily consumption per appliance (kWh) = sum of (watts * 8s / 3600) for each reading
// Since data is at ~8s intervals, energy = power(W) * 8s / 3600 = Wh per reading
const dailyData = {};
rows.forEach(row => {
  const date = row.time.substring(0, 10);
  if (!dailyData[date]) {
    dailyData[date] = { date, aggregate: 0, appliances: {} };
    for (let i = 1; i <= 9; i++) dailyData[date].appliances[i] = 0;
  }
  // Each reading represents ~8 seconds of power
  const intervalWh = 8 / 3600; // hours
  dailyData[date].aggregate += row.aggregate * intervalWh;
  for (let i = 1; i <= 9; i++) {
    dailyData[date].appliances[i] += row.appliances[i] * intervalWh;
  }
});

// Convert to kWh
const dailyConsumption = Object.values(dailyData).map(d => ({
  date: d.date,
  aggregateKwh: parseFloat((d.aggregate / 1000).toFixed(3)),
  appliances: Object.entries(d.appliances).map(([id, wh]) => ({
    id: parseInt(id),
    name: applianceNames[id],
    kwh: parseFloat((wh / 1000).toFixed(3)),
    avgWatts: 0 // placeholder
  }))
}));

// Calculate average watts per appliance per day
dailyConsumption.forEach(day => {
  const dayRows = rows.filter(r => r.time.startsWith(day.date));
  day.appliances.forEach(a => {
    const vals = dayRows.map(r => r.appliances[a.id]);
    a.avgWatts = Math.round(vals.reduce((s, v) => s + v, 0) / vals.length);
  });
});

// Hourly sample for one day (first day) - average per hour
const firstDate = Object.keys(dailyData)[0];
const hourlyRows = rows.filter(r => r.time.startsWith(firstDate));
const hourlyData = {};
for (let h = 0; h < 24; h++) {
  hourlyData[h] = { hour: h, aggregate: 0, count: 0, appliances: {} };
  for (let i = 1; i <= 9; i++) hourlyData[h].appliances[i] = 0;
}
hourlyRows.forEach(row => {
  const hour = parseInt(row.time.substring(11, 13));
  hourlyData[hour].aggregate += row.aggregate;
  hourlyData[hour].count++;
  for (let i = 1; i <= 9; i++) hourlyData[hour].appliances[i] += row.appliances[i];
});
const hourlyConsumption = Object.values(hourlyData).map(h => ({
  hour: h.hour,
  label: `${String(h.hour).padStart(2, '0')}:00`,
  aggregateAvgWatts: h.count > 0 ? Math.round(h.aggregate / h.count) : 0,
  appliances: Object.entries(h.appliances).map(([id, sum]) => ({
    id: parseInt(id),
    name: applianceNames[id],
    avgWatts: h.count > 0 ? Math.round(sum / h.count) : 0
  }))
}));

// Monthly totals
const monthlyTotals = {};
dailyConsumption.forEach(day => {
  const month = day.date.substring(0, 7);
  if (!monthlyTotals[month]) monthlyTotals[month] = { month, aggregateKwh: 0, appliances: {} };
  monthlyTotals[month].aggregateKwh += day.aggregateKwh;
  day.appliances.forEach(a => {
    if (!monthlyTotals[month].appliances[a.id]) monthlyTotals[month].appliances[a.id] = { id: a.id, name: a.name, kwh: 0 };
    monthlyTotals[month].appliances[a.id].kwh += a.kwh;
  });
});
const monthlyConsumption = Object.values(monthlyTotals).map(m => ({
  month: m.month,
  aggregateKwh: parseFloat(m.aggregateKwh.toFixed(2)),
  appliances: Object.values(m.appliances).map(a => ({ ...a, kwh: parseFloat(a.kwh.toFixed(2)) }))
}));

// Dataset info
const datasetInfo = {
  name: "REFIT Electrical Load Measurements (Cleaned)",
  creators: ["David Murray", "Lina Stankovic"],
  institution: "University of Strathclyde",
  source: "Zenodo",
  doi: "10.5281/zenodo.5063428",
  license: "CC BY 4.0",
  description: "Cleaned electrical consumption data in Watts for 20 households at aggregate and appliance level, timestamped and sampled at 8 second intervals.",
  household: 11,
  appliances: Object.entries(applianceNames).map(([id, name]) => ({ id: parseInt(id), name })),
  samplePeriod: firstDate + ' to ' + dailyConsumption[dailyConsumption.length - 1].date,
  totalReadings: rows.length,
  samplingInterval: "~8 seconds",
  unit: "Watts",
  note: "Historical dataset demonstration. These are real measurements from a UK household (House 11), not from the user's home."
};

// Write files
const outDir = path.join(__dirname, 'processed');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(path.join(outDir, 'applianceReadings.json'), JSON.stringify({ sampleDate: firstDate, hourly: hourlyConsumption }, null, 2));
fs.writeFileSync(path.join(outDir, 'dailyConsumption.json'), JSON.stringify(dailyConsumption, null, 2));
fs.writeFileSync(path.join(outDir, 'monthlyConsumption.json'), JSON.stringify(monthlyConsumption, null, 2));
fs.writeFileSync(path.join(outDir, 'datasetInfo.json'), JSON.stringify(datasetInfo, null, 2));

console.log('Files written:');
console.log('  applianceReadings.json -', hourlyConsumption.length, 'hours');
console.log('  dailyConsumption.json -', dailyConsumption.length, 'days');
console.log('  monthlyConsumption.json -', monthlyConsumption.length, 'months');
console.log('  datasetInfo.json');
console.log('Sample period:', firstDate, 'to', dailyConsumption[dailyConsumption.length-1].date);
console.log('Total valid readings:', rows.length);