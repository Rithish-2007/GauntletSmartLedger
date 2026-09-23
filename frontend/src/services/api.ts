import type {
  OverviewData,
  SubMeterSimResult,
  AddElectricityInput,
  AddTelecomInput,
  AddTravelInput,
  AddGroceryInput,
} from '../types/analytics';

const STORAGE_KEY = 'smartledger_user_overview_data';

export const EMPTY_DATA: OverviewData = {
  macro: {
    electricitySpend: 0,
    gasSpend: 0,
    telecomSpend: 0,
    transportSpend: 0,
    grocerySpend: 0,
    totalMonthlySpend: 0,
    percentageDistribution: {
      Grocery: 0,
      Telecom: 0,
      Electricity: 0,
      Gas: 0,
      Transport: 0,
    },
  },
  user: {
    id: 1,
    fullName: 'Household Admin',
    email: 'user@smartledger.local',
  },
  electricity: {
    history: [],
  },
  gas: {
    history: [],
  },
  telecom: {
    records: [],
    expiringSoonCount: 0,
    expiredCount: 0,
  },
  transport: {
    records: [],
    totalMonthlySpend: 0,
  },
  grocery: {
    records: [],
    totalMonthlySpend: 0,
  },
};

// ---------------------------------------------------------------------------
// Local Mirror Persistence & Dynamic Calculation Engine (Offline Resilience)
// ---------------------------------------------------------------------------

function loadLocalData(): OverviewData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Unable to read from localStorage', e);
  }
  return JSON.parse(JSON.stringify(EMPTY_DATA));
}

function saveLocalData(data: OverviewData): OverviewData {
  const recalculated = recalculateOverview(data);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recalculated));
  } catch (e) {
    console.warn('Unable to write to localStorage', e);
  }
  return recalculated;
}

export function recalculateOverview(data: OverviewData): OverviewData {
  const next = JSON.parse(JSON.stringify(data)) as OverviewData;

  // 1. Electricity
  let elecSpend = 0;
  if (next.electricity.history.length > 0) {
    next.electricity.latest = next.electricity.history[0];
    elecSpend = next.electricity.history[0].calculatedMyShare || 0;
  } else {
    next.electricity.latest = undefined;
  }

  // 2. Gas
  let gasSpend = 0;
  const activeGas = next.gas.history.find((g) => g.isActive);
  next.gas.active = activeGas;
  if (activeGas) {
    gasSpend = activeGas.bookingCost || 0;
    const connected = new Date(activeGas.connectedDate);
    const today = new Date();
    const daysElapsed = Math.max(0, Math.floor((today.getTime() - connected.getTime()) / (1000 * 60 * 60 * 24)));

    // Compute average burn rate from past completed cylinders
    const pastCylinders = next.gas.history.filter((g) => !g.isActive && g.burnRatePerDay && g.burnRatePerDay > 0);
    const avgBurnRate = pastCylinders.length > 0
      ? pastCylinders.reduce((acc, c) => acc + (c.burnRatePerDay || 0.45), 0) / pastCylinders.length
      : 0.45;

    const totalDays = Math.max(1, Math.round(activeGas.cylinderWeightKg / avgBurnRate));
    const daysRemaining = Math.max(0, totalDays - daysElapsed);
    const pctRemaining = Math.max(0, Math.min(100, (daysRemaining / totalDays) * 100));

    const predDate = new Date(connected);
    predDate.setDate(predDate.getDate() + totalDays);

    next.gas.forecast = {
      connectedDate: activeGas.connectedDate,
      cylinderWeightKg: activeGas.cylinderWeightKg,
      burnRateKgPerDay: avgBurnRate,
      predictedDepletionDate: predDate.toISOString().split('T')[0],
      daysRemaining,
      percentageRemaining: Math.round(pctRemaining * 10) / 10,
      refillAlert: daysRemaining <= 5,
    };
  } else {
    next.gas.forecast = undefined;
  }

  // 3. Telecom
  let telecomSpend = 0;
  let expiringSoon = 0;
  let expired = 0;
  const todayStr = new Date().toISOString().split('T')[0];
  const today = new Date(todayStr);

  next.telecom.records.forEach((r) => {
    telecomSpend += r.planAmount || 0;
    const expiry = new Date(r.expiryDate);
    const days = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0) {
      expired++;
    } else if (days <= 3) {
      expiringSoon++;
    }
  });
  next.telecom.expiringSoonCount = expiringSoon;
  next.telecom.expiredCount = expired;

  // 4. Transport
  let transportSpend = 0;
  next.transport.records.forEach((t) => {
    transportSpend += t.totalFareCost || 0;
  });
  next.transport.totalMonthlySpend = transportSpend;

  // 5. Grocery
  let grocerySpend = 0;
  next.grocery.records.forEach((g) => {
    grocerySpend += g.totalAmount || 0;
  });
  next.grocery.totalMonthlySpend = grocerySpend;

  // 6. Macro Summary
  const total = elecSpend + gasSpend + telecomSpend + transportSpend + grocerySpend;
  const pctDist: Record<string, number> = {
    Electricity: total > 0 ? Math.round((elecSpend / total) * 1000) / 10 : 0,
    Gas: total > 0 ? Math.round((gasSpend / total) * 1000) / 10 : 0,
    Telecom: total > 0 ? Math.round((telecomSpend / total) * 1000) / 10 : 0,
    Transport: total > 0 ? Math.round((transportSpend / total) * 1000) / 10 : 0,
    Grocery: total > 0 ? Math.round((grocerySpend / total) * 1000) / 10 : 0,
  };

  next.macro = {
    electricitySpend: elecSpend,
    gasSpend,
    telecomSpend,
    transportSpend,
    grocerySpend,
    totalMonthlySpend: total,
    percentageDistribution: pctDist,
  };

  return next;
}

// ---------------------------------------------------------------------------
// Network Request Helpers with Offline Fallback
// ---------------------------------------------------------------------------

async function postOrFallback(
  url: string,
  offlineMutation: (current: OverviewData) => OverviewData
): Promise<OverviewData> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      saveLocalData(data);
      return data;
    }
  } catch (err) {
    console.warn(`Backend network error on ${url}, executing local offline calculation mirror`, err);
  }
  const local = loadLocalData();
  const updated = offlineMutation(local);
  return saveLocalData(updated);
}

async function deleteOrFallback(
  url: string,
  offlineMutation: (current: OverviewData) => OverviewData
): Promise<OverviewData> {
  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      saveLocalData(data);
      return data;
    }
  } catch (err) {
    console.warn(`Backend network error on DELETE ${url}, executing local offline calculation mirror`, err);
  }
  const local = loadLocalData();
  const updated = offlineMutation(local);
  return saveLocalData(updated);
}

// ---------------------------------------------------------------------------
// Public API Methods
// ---------------------------------------------------------------------------

export async function fetchOverview(): Promise<{ data: OverviewData; isMock: boolean }> {
  try {
    const res = await fetch('/api/analytics/overview?demo=true', {
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      saveLocalData(data);
      return { data, isMock: false };
    }
  } catch (err) {
    console.warn('Backend currently offline, using persistent local storage ledger', err);
  }
  const local = loadLocalData();
  return { data: local, isMock: false };
}

// ==================== Electricity Mutations ====================

export async function addElectricityRecord(input: AddElectricityInput): Promise<OverviewData> {
  const query = new URLSearchParams({
    billingMonth: input.billingMonth,
    myUnits: input.myUnits.toString(),
    otherUnits: (input.otherUnits || 0).toString(),
    ...(input.totalEbAmount !== undefined ? { totalEbAmount: input.totalEbAmount.toString() } : {}),
    ...(input.paidDate ? { paidDate: input.paidDate } : {}),
  });

  return postOrFallback(`/api/analytics/electricity/add?${query.toString()}`, (current) => {
    const myUnits = input.myUnits;
    const otherUnits = input.otherUnits || 0;
    const totalUnits = myUnits + otherUnits;
    const isShared = otherUnits > 0;
    const billAmount = input.totalEbAmount !== undefined && input.totalEbAmount > 0
      ? input.totalEbAmount
      : calculateTnebBill(totalUnits);

    const calculatedMyShare = isShared && totalUnits > 0
      ? billAmount * (myUnits / totalUnits)
      : billAmount;

    const newRecord = {
      recordId: Date.now(),
      billingMonth: input.billingMonth,
      masterEbUnits: totalUnits,
      totalEbAmount: billAmount,
      isShared,
      mySubmeterUnits: myUnits,
      otherSubmeterUnits: otherUnits,
      calculatedMyShare,
      paidDate: input.paidDate || new Date().toISOString().split('T')[0],
      utilityType: 'ELECTRICITY',
    };

    current.electricity.history = [newRecord, ...current.electricity.history];
    return current;
  });
}

export async function deleteElectricityRecord(recordId: number): Promise<OverviewData> {
  return deleteOrFallback(`/api/analytics/electricity/${recordId}`, (current) => {
    current.electricity.history = current.electricity.history.filter((r) => r.recordId !== recordId);
    return current;
  });
}

// ==================== Gas Mutations ====================

export async function connectLpgCylinder(
  weightKg = 14.2,
  bookingCost = 850.0,
  connectedDate?: string
): Promise<OverviewData> {
  const query = new URLSearchParams({
    weightKg: weightKg.toString(),
    bookingCost: bookingCost.toString(),
    ...(connectedDate ? { connectedDate } : {}),
  });

  return postOrFallback(`/api/analytics/gas/connect?${query.toString()}`, (current) => {
    const cDate = connectedDate || new Date().toISOString().split('T')[0];
    // Close existing active cylinder
    current.gas.history.forEach((g) => {
      if (g.isActive) {
        g.isActive = false;
        g.finishedDate = cDate;
        const days = Math.max(1, Math.floor((new Date(cDate).getTime() - new Date(g.connectedDate).getTime()) / (1000 * 60 * 60 * 24)));
        g.burnRatePerDay = g.cylinderWeightKg / days;
      }
    });

    const newCylinder = {
      recordId: Date.now(),
      recordDate: cDate,
      bookingCost,
      cylinderWeightKg: weightKg,
      connectedDate: cDate,
      finishedDate: null,
      burnRatePerDay: null,
      isActive: true,
    };
    current.gas.history = [newCylinder, ...current.gas.history];
    return current;
  });
}

export async function finishLpgCylinder(finishedDate?: string): Promise<OverviewData> {
  const fDate = finishedDate || new Date().toISOString().split('T')[0];
  const query = new URLSearchParams({ finishedDate: fDate });

  return postOrFallback(`/api/analytics/gas/finish?${query.toString()}`, (current) => {
    current.gas.history.forEach((g) => {
      if (g.isActive) {
        g.isActive = false;
        g.finishedDate = fDate;
        const days = Math.max(1, Math.floor((new Date(fDate).getTime() - new Date(g.connectedDate).getTime()) / (1000 * 60 * 60 * 24)));
        g.burnRatePerDay = g.cylinderWeightKg / days;
      }
    });
    return current;
  });
}

export async function deleteGasRecord(recordId: number): Promise<OverviewData> {
  return deleteOrFallback(`/api/analytics/gas/${recordId}`, (current) => {
    current.gas.history = current.gas.history.filter((r) => r.recordId !== recordId);
    return current;
  });
}

export async function resetLpgData(): Promise<OverviewData> {
  return postOrFallback('/api/analytics/gas/reset', (current) => {
    current.gas.history = [];
    current.gas.active = undefined;
    current.gas.forecast = undefined;
    return current;
  });
}

// ==================== Telecom Mutations ====================

export async function addTelecomRecord(input: AddTelecomInput): Promise<OverviewData> {
  const rDate = input.rechargeDate || new Date().toISOString().split('T')[0];
  const query = new URLSearchParams({
    memberName: input.memberName,
    provider: input.provider,
    amount: input.amount.toString(),
    validityDays: input.validityDays.toString(),
    rechargeDate: rDate,
  });

  return postOrFallback(`/api/analytics/telecom/add?${query.toString()}`, (current) => {
    const exp = new Date(rDate);
    exp.setDate(exp.getDate() + input.validityDays);

    const newRecord = {
      recordId: Date.now(),
      familyMemberName: input.memberName,
      serviceProvider: input.provider,
      planAmount: input.amount,
      rechargeDate: rDate,
      validityDays: input.validityDays,
      expiryDate: exp.toISOString().split('T')[0],
      utilityType: 'TELECOM',
    };
    current.telecom.records = [newRecord, ...current.telecom.records];
    return current;
  });
}

export async function deleteTelecomRecord(recordId: number): Promise<OverviewData> {
  return deleteOrFallback(`/api/analytics/telecom/${recordId}`, (current) => {
    current.telecom.records = current.telecom.records.filter((r) => r.recordId !== recordId);
    return current;
  });
}

// ==================== Transport Mutations ====================

export async function addTransportRecord(input: AddTravelInput): Promise<OverviewData> {
  const query = new URLSearchParams({
    type: input.type,
    personName: input.personName,
    totalFare: input.totalFare.toString(),
    ...(input.origin ? { origin: input.origin } : {}),
    ...(input.destination ? { destination: input.destination } : {}),
    ...(input.distanceKm !== undefined ? { distanceKm: input.distanceKm.toString() } : {}),
    ...(input.liters !== undefined ? { liters: input.liters.toString() } : {}),
    ...(input.date ? { date: input.date } : {}),
  });

  return postOrFallback(`/api/analytics/transport/add?${query.toString()}`, (current) => {
    const dist = input.distanceKm || null;
    const lit = input.liters || null;
    const mileage = input.type === 'FUEL' && dist && lit && lit > 0 ? dist / lit : null;
    const costPerKm = dist && dist > 0 ? input.totalFare / dist : null;

    const newRecord = {
      recordId: Date.now(),
      commuteType: input.type,
      personName: input.personName,
      originPoint: input.origin || '',
      destinationPoint: input.destination || '',
      distanceKm: dist,
      litersFilled: lit,
      totalFareCost: input.totalFare,
      mileageCalculated: mileage,
      costPerKm,
      entryDate: input.date || new Date().toISOString().split('T')[0],
    };
    current.transport.records = [newRecord, ...current.transport.records];
    return current;
  });
}

export async function deleteTransportRecord(recordId: number): Promise<OverviewData> {
  return deleteOrFallback(`/api/analytics/transport/${recordId}`, (current) => {
    current.transport.records = current.transport.records.filter((r) => r.recordId !== recordId);
    return current;
  });
}

// ==================== Grocery Mutations ====================

export async function addGroceryRecord(input: AddGroceryInput): Promise<OverviewData> {
  const query = new URLSearchParams({
    category: input.category,
    amount: input.amount.toString(),
    ...(input.storeName ? { storeName: input.storeName } : {}),
    ...(input.date ? { date: input.date } : {}),
    ...(input.notes ? { notes: input.notes } : {}),
  });

  return postOrFallback(`/api/analytics/grocery/add?${query.toString()}`, (current) => {
    const newRecord = {
      recordId: Date.now(),
      storeName: input.storeName || 'Store Receipt',
      category: input.category,
      purchaseDate: input.date || new Date().toISOString().split('T')[0],
      totalAmount: input.amount,
      receiptNotes: input.notes,
    };
    current.grocery.records = [newRecord, ...current.grocery.records];
    return current;
  });
}

export async function deleteGroceryRecord(recordId: number): Promise<OverviewData> {
  return deleteOrFallback(`/api/analytics/grocery/${recordId}`, (current) => {
    current.grocery.records = current.grocery.records.filter((r) => r.recordId !== recordId);
    return current;
  });
}

// ==================== Utility Database Controls ====================

export async function deleteAllMockData(): Promise<OverviewData> {
  try {
    const res = await fetch('/api/analytics/clear', {
      method: 'POST',
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      saveLocalData(data);
      return data;
    }
  } catch (err) {
    console.warn('Backend clear error, wiping local ledger', err);
  }
  return saveLocalData(JSON.parse(JSON.stringify(EMPTY_DATA)));
}

export async function resetDatabase(): Promise<OverviewData> {
  return await deleteAllMockData();
}

export async function seedDemoData(): Promise<OverviewData> {
  try {
    const res = await fetch('/api/analytics/seed-demo', {
      method: 'POST',
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      saveLocalData(data);
      return data;
    }
  } catch (err) {
    console.warn('Backend seed-demo error, initializing baseline sample locally', err);
  }
  return saveLocalData(JSON.parse(JSON.stringify(EMPTY_DATA)));
}

export function calculateTnebBill(units: number): number {
  if (units <= 100) return 0;
  if (units <= 200) return (units - 100) * 2.25;
  if (units <= 400) return 100 * 2.25 + (units - 200) * 4.50;
  if (units <= 500) return 100 * 2.25 + 200 * 4.50 + (units - 400) * 6.00;
  if (units <= 600) return 300 * 4.50 + 100 * 6.00 + (units - 500) * 8.00;
  if (units <= 800) return 300 * 4.50 + 100 * 6.00 + 100 * 8.00 + (units - 600) * 9.00;
  if (units <= 1000) return 300 * 4.50 + 100 * 6.00 + 100 * 8.00 + 200 * 9.00 + (units - 800) * 10.00;
  return 300 * 4.50 + 100 * 6.00 + 100 * 8.00 + 200 * 9.00 + 200 * 10.00 + (units - 1000) * 11.00;
}

export async function simulateElectricity(
  masterUnits: number,
  myUnits: number,
  otherUnits: number
): Promise<SubMeterSimResult> {
  try {
    const res = await fetch(
      `/api/analytics/simulate-electricity?masterUnits=${masterUnits}&myUnits=${myUnits}&otherUnits=${otherUnits}`
    );
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend simulator API error, calculating offline fallback', err);
  }

  const totalEbBill = calculateTnebBill(masterUnits);
  const totalSubUnits = myUnits + otherUnits;
  const isShared = otherUnits > 0;
  const userRatio = totalSubUnits > 0 ? myUnits / totalSubUnits : 0;
  const calculatedMyShare = totalEbBill * userRatio;
  const effectiveRatePerUnit = myUnits > 0 ? calculatedMyShare / myUnits : 0;

  return {
    masterUnits,
    totalSubUnits,
    myUnits,
    otherUnits,
    totalEbBill,
    calculatedMyShare,
    effectiveRatePerUnit,
    isShared,
  };
}
