import type { AppState, BikePart, Settings, Transaction } from "@/types/finance";

export function calculateKmFromOdo(previousOdo: number, currentOdo: number) {
  return Math.max(currentOdo - previousOdo, 0);
}

export function calculateFuelCostPerKm(fuelPricePerLiter: number, mileage: number) {
  return mileage > 0 ? fuelPricePerLiter / mileage : 0;
}

export function calculateEngineOilCostPerKm(engineOilPrice: number, oilIntervalKm: number) {
  return oilIntervalKm > 0 ? engineOilPrice / oilIntervalKm : 0;
}

export function calculatePureMaintenanceCostPerKm(trueCostPerKm: number, fuelCostPerKm: number, oilCostPerKm: number) {
  return Math.max(trueCostPerKm - fuelCostPerKm - oilCostPerKm, 0);
}

export function calculateBikeCashCost(transactions: Transaction[]) {
  return transactions
    .filter((tx) => tx.type === "bike_km" || tx.type === "bike_entry")
    .reduce((sum, tx) => sum + tx.amount, 0);
}

export function calculateBikeTrueCost(kmRun: number, trueCostPerKm: number, parking: number) {
  return kmRun * trueCostPerKm + parking;
}

export function calculateNextOilChangeOdo(lastOilChangeOdo: number, intervalKm: number) {
  return lastOilChangeOdo + intervalKm;
}

export function calculateKmRemaining(currentOdo: number, nextOilChangeOdo: number) {
  return nextOilChangeOdo - currentOdo;
}

export function calculateFuelFundTarget(expectedKm: number, fuelCostPerKm: number) {
  return Math.ceil((expectedKm * fuelCostPerKm) / 100) * 100;
}

export function calculateEngineOilFundTarget(engineOilPrice: number, oilChangeIntervalKm: number, expectedMonthlyKm: number) {
  return Math.ceil(((engineOilPrice / Math.max(oilChangeIntervalKm, 1)) * expectedMonthlyKm) / 100) * 100;
}

export function calculateMaintenanceFundTarget(expectedKm: number, maintenanceCostPerKm: number) {
  return Math.ceil((expectedKm * maintenanceCostPerKm) / 100) * 100;
}

export function calculateWaterFilterMonthlyReserve(price: number, intervalMonths: number) {
  return intervalMonths > 0 ? price / intervalMonths : 0;
}

export function calculateNextWaterFilterDate(lastChangedDate: string, intervalMonths: number) {
  const date = new Date(`${lastChangedDate}T00:00:00`);
  date.setMonth(date.getMonth() + intervalMonths);
  return date.toISOString().slice(0, 10);
}

export function getBikeKmCost(settings: Settings): number {
  if (settings.bikeMode === "true_cost") return settings.bikeSettings.bikeTrueCostPerKm;
  return settings.bikeSettings.bikeCashCostPerKm;
}

export function getLastBikeOdo(transactions: Transaction[]) {
  const odoEntries = transactions
    .filter((tx) => (tx.type === "bike_entry" || tx.type === "bike_km") && typeof tx.currentOdo === "number")
    .sort((a, b) => `${b.date}${b.createdAt}`.localeCompare(`${a.date}${a.createdAt}`));
  return odoEntries[0]?.currentOdo ?? 0;
}

export function getLastOilChangeOdo(state: AppState) {
  const transactionOdo = state.transactions
    .filter((tx) => tx.type === "bike_entry" && tx.bikeSubtype === "Engine Oil Change" && typeof tx.currentOdo === "number")
    .sort((a, b) => `${b.date}${b.createdAt}`.localeCompare(`${a.date}${a.createdAt}`))[0]?.currentOdo;
  return transactionOdo ?? state.settings.bikeSettings.lastOilChangeOdo ?? 0;
}

export function getNextOilChangeOdo(state: AppState) {
  const latestOilEntry = state.transactions
    .filter((tx) => tx.type === "bike_entry" && tx.bikeSubtype === "Engine Oil Change")
    .sort((a, b) => `${b.date}${b.createdAt}`.localeCompare(`${a.date}${a.createdAt}`))[0];
  return latestOilEntry?.nextOilChangeOdo ?? state.settings.bikeSettings.nextOilChangeOdo ?? 0;
}

export function getBikeReport(state: AppState, cycleTransactions: Transaction[]) {
  const settings = state.settings.bikeSettings;
  const currentOdo = getLastBikeOdo(state.transactions);
  const lastOilChangeOdo = getLastOilChangeOdo(state);
  const nextOilChangeOdo = getNextOilChangeOdo(state) || calculateNextOilChangeOdo(lastOilChangeOdo, settings.oilChangeIntervalKm);
  const kmRemainingBeforeOilChange = nextOilChangeOdo ? calculateKmRemaining(currentOdo, nextOilChangeOdo) : 0;
  const kmRun = cycleTransactions
    .filter((tx) => tx.type === "bike_entry" || tx.type === "bike_km")
    .reduce((sum, tx) => sum + (tx.kmRun ?? tx.km ?? 0), 0);
  const fuelCost = cycleTransactions
    .filter((tx) => tx.type === "bike_entry" && tx.bikeSubtype === "Fuel Fill-Up")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const engineOilCost = cycleTransactions
    .filter((tx) => tx.type === "bike_entry" && tx.bikeSubtype === "Engine Oil Change")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const maintenancePartsCost = cycleTransactions
    .filter((tx) => tx.type === "bike_entry" && tx.bikeSubtype === "Maintenance / Parts")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const parkingCost = cycleTransactions
    .filter((tx) => tx.type === "bike_entry" && tx.bikeSubtype === "Parking")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const legacyBikeCost = cycleTransactions
    .filter((tx) => tx.type === "bike_km")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalCashCost = fuelCost + engineOilCost + maintenancePartsCost + parkingCost + legacyBikeCost;
  const fuelCostPerKm = calculateFuelCostPerKm(settings.fuelPricePerLiter, settings.expectedMileageKmPerLiter);
  const engineOilCostPerKm = calculateEngineOilCostPerKm(settings.engineOilPrice + (settings.oilFilterPrice ?? 0), settings.oilChangeIntervalKm);
  const maintenanceReservePerKm = calculatePureMaintenanceCostPerKm(settings.bikeTrueCostPerKm, fuelCostPerKm, engineOilCostPerKm);
  const maintenanceReserveNeeded = kmRun * maintenanceReservePerKm;
  const estimatedTrueCost = calculateBikeTrueCost(kmRun, settings.bikeTrueCostPerKm, parkingCost);
  const fuelFundTarget = calculateFuelFundTarget(settings.expectedMonthlyKm, fuelCostPerKm);
  const engineOilFundTarget = calculateEngineOilFundTarget(settings.engineOilPrice, settings.oilChangeIntervalKm, settings.expectedMonthlyKm);
  const maintenanceFundTarget = Math.max(settings.monthlyBikeMaintenanceMinimum, calculateMaintenanceFundTarget(settings.expectedMonthlyKm, maintenanceReservePerKm));
  const engineOilFundBalance = state.fundBalances.engine_oil;
  const maintenanceFundBalance = state.fundBalances.bike_maintenance;
  const oilFundShortfall = Math.max((settings.engineOilPrice + (settings.oilFilterPrice ?? 0)) - engineOilFundBalance, 0);
  const maintenanceFundShortfall = Math.max(maintenanceFundTarget - maintenanceFundBalance, 0);
  const health =
    kmRemainingBeforeOilChange <= 300 && oilFundShortfall > 0
      ? "Danger"
      : maintenanceFundShortfall > 0
        ? "Careful"
        : "Safe";

  return {
    currentOdo,
    kmRun,
    fuelCost,
    engineOilCost,
    maintenancePartsCost,
    parkingCost,
    totalCashCost,
    cashCostPerKm: kmRun > 0 ? totalCashCost / kmRun : 0,
    fuelCostPerKm,
    engineOilCostPerKm,
    maintenanceReservePerKm,
    maintenanceReserveNeeded,
    estimatedTrueCost,
    trueCostPerKm: settings.bikeTrueCostPerKm,
    lastOilChangeOdo,
    nextOilChangeOdo,
    kmRemainingBeforeOilChange,
    fuelFundTarget,
    engineOilFundTarget,
    maintenanceFundTarget,
    engineOilFundBalance,
    maintenanceFundBalance,
    oilFundShortfall,
    maintenanceFundShortfall,
    health,
  };
}

export function getPartForecast(part: BikePart, currentOdo: number) {
  const nextReplacementOdo =
    typeof part.lastReplacedOdo === "number" && typeof part.replacementIntervalKm === "number"
      ? part.lastReplacedOdo + part.replacementIntervalKm
      : undefined;
  const kmRemaining =
    typeof nextReplacementOdo === "number"
      ? nextReplacementOdo - currentOdo
      : undefined;
  return { nextReplacementOdo, kmRemaining };
}
