import type {
  OverviewData,
  SubMeterSimResult,
  TraditionalTariffBreakdown,
  TariffSlabItem,
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

const AUTH_USER_KEY = 'smartledger_auth_user';

export function getStoredUser(): { id: number; fullName: string; email: string } | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to read auth user from storage', e);
  }
  return null;
}

export function setStoredUser(user: { id: number; fullName: string; email: string } | null): void {
  try {
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  } catch (e) {
    console.warn('Failed to write auth user to storage', e);
  }
}

export async function parseErrorResponse(res: Response, fallback: string): Promise<string> {
  try {
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      if (!data) return fallback;
      if (typeof data === 'string' && data.trim()) return data.trim();
      if (typeof data === 'object') {
        // Specific descriptive error string (ignoring generic status text)
        if (typeof data.error === 'string' && data.error.trim() && data.error !== 'Bad Request' && data.error !== 'Internal Server Error') {
          return data.error.trim();
        }
        // Spring Boot / standard API message
        if (typeof data.message === 'string' && data.message.trim()) {
          return data.message.trim();
        }
        // Nested error object e.g. { error: { message: '...' } }
        if (data.error && typeof data.error === 'object') {
          if (typeof data.error.message === 'string' && data.error.message.trim()) {
            return data.error.message.trim();
          }
        }
        // Spring validation errors array e.g. { errors: [{ defaultMessage: '...' }] }
        if (Array.isArray(data.errors) && data.errors.length > 0) {
          const first = data.errors[0];
          if (typeof first === 'string' && first.trim()) return first.trim();
          if (first && typeof first.defaultMessage === 'string' && first.defaultMessage.trim()) {
            return first.defaultMessage.trim();
          }
          if (first && typeof first.message === 'string' && first.message.trim()) {
            return first.message.trim();
          }
        }
        if (typeof data.error === 'string' && data.error.trim()) {
          return data.error.trim();
        }
      }
    } else {
      const text = await res.text();
      if (text && text.length < 200 && !text.includes('<html') && !text.includes('<!DOCTYPE')) {
        return text.trim();
      }
    }
  } catch {
    // fallback
  }
  return fallback;
}

export async function loginUser(email: string, password: string): Promise<{ id: number; fullName: string; email: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      const data = await res.json();
      setStoredUser(data.user);
      return data.user;
    } else {
      const errorMsg = await parseErrorResponse(res, 'Invalid email or password');
      throw new Error(errorMsg);
    }
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : 'Login failed';
    if (errorMsg && !errorMsg.includes('Failed to fetch') && !errorMsg.includes('NetworkError')) {
      throw new Error(errorMsg);
    }
    // Offline demo fallback login
    if (email && password) {
      const offlineUser = {
        id: 1,
        fullName: email.split('@')[0].toUpperCase(),
        email: email.toLowerCase(),
      };
      setStoredUser(offlineUser);
      return offlineUser;
    }
    throw new Error('Login failed. Please verify credentials.');
  }
}

export async function registerUser(fullName: string, email: string, password: string): Promise<{ id: number; fullName: string; email: string }> {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ fullName, email, password }),
    });
    if (res.ok) {
      const data = await res.json();
      setStoredUser(data.user);
      return data.user;
    } else {
      const errorMsg = await parseErrorResponse(res, 'Registration failed');
      throw new Error(errorMsg);
    }
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : 'Registration failed';
    if (errorMsg && !errorMsg.includes('Failed to fetch') && !errorMsg.includes('NetworkError')) {
      throw new Error(errorMsg);
    }
    // Offline demo fallback register
    const offlineUser = {
      id: Date.now(),
      fullName,
      email: email.toLowerCase(),
    };
    setStoredUser(offlineUser);
    return offlineUser;
  }
}

export async function resetPasswordUser(email: string, newPassword: string): Promise<string> {
  try {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email, newPassword }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.message || 'Password reset successfully.';
    } else {
      const errorMsg = await parseErrorResponse(res, 'Password reset failed');
      throw new Error(errorMsg);
    }
  } catch (e: unknown) {
    const errorMsg = e instanceof Error ? e.message : 'Password reset failed';
    if (errorMsg && !errorMsg.includes('Failed to fetch') && !errorMsg.includes('NetworkError')) {
      throw new Error(errorMsg);
    }
    return 'Password reset successfully (Offline mirror). You can now log in.';
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch (e) {
    console.warn('Backend logout failed or offline', e);
  } finally {
    setStoredUser(null);
  }
}

export async function fetchCurrentUser(): Promise<{ id: number; fullName: string; email: string } | null> {
  try {
    const res = await fetch('/api/auth/me', { headers: { Accept: 'application/json' } });
    if (res.ok) {
      const user = await res.json();
      setStoredUser(user);
      return user;
    }
  } catch (e) {
    console.warn('Failed to verify backend session, falling back to local stored user', e);
  }
  return getStoredUser();
}

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
  if (units <= 0) return 50.0;
  let bill = 50.0; // Fixed meter charge

  if (units <= 500) {
    // Category A: up to 500 units
    let rem = units;
    const free = Math.min(rem, 100);
    rem -= free;

    // 101 - 200: ₹2.35
    if (rem > 0) {
      const t1 = Math.min(rem, 100);
      bill += t1 * 2.35;
      rem -= t1;
    }
    // 201 - 400: ₹4.70
    if (rem > 0) {
      const t2 = Math.min(rem, 200);
      bill += t2 * 4.70;
      rem -= t2;
    }
    // 401 - 500: ₹6.30
    if (rem > 0) {
      bill += rem * 6.30;
    }
  } else {
    // Category B: above 500 units
    let rem = units;
    const free = Math.min(rem, 100);
    rem -= free;

    // 101 - 400: ₹4.70 (300 units)
    if (rem > 0) {
      const t1 = Math.min(rem, 300);
      bill += t1 * 4.70;
      rem -= t1;
    }
    // 401 - 500: ₹6.30 (100 units)
    if (rem > 0) {
      const t2 = Math.min(rem, 100);
      bill += t2 * 6.30;
      rem -= t2;
    }
    // 501 - 600: ₹8.40 (100 units)
    if (rem > 0) {
      const t3 = Math.min(rem, 100);
      bill += t3 * 8.40;
      rem -= t3;
    }
    // 601 - 800: ₹9.45 (200 units)
    if (rem > 0) {
      const t4 = Math.min(rem, 200);
      bill += t4 * 9.45;
      rem -= t4;
    }
    // 801 - 1000: ₹10.50 (200 units)
    if (rem > 0) {
      const t5 = Math.min(rem, 200);
      bill += t5 * 10.50;
      rem -= t5;
    }
    // Above 1000: ₹11.55
    if (rem > 0) {
      bill += rem * 11.55;
    }
  }

  return Math.round(bill * 100) / 100;
}

export function calculateTraditionalTnebBreakdown(units: number): TraditionalTariffBreakdown {
  const fixedCharge = 50.0;
  const isCategoryA = units <= 500;
  const category: 'A' | 'B' = isCategoryA ? 'A' : 'B';
  const categoryLabel = isCategoryA
    ? 'Category A (Consumption up to 500 kWh)'
    : 'Category B (Consumption above 500 kWh)';

  if (units <= 0) {
    return {
      units: 0,
      category,
      categoryLabel,
      fixedCharge,
      freeUnits: 0,
      tier1Units: 0,
      tier1Rate: 2.35,
      tier1Cost: 0,
      tier2Units: 0,
      tier2Rate: 4.70,
      tier2Cost: 0,
      tier3Units: 0,
      tier3Rate: 6.30,
      tier3Cost: 0,
      totalBill: fixedCharge,
      effectiveRate: 0,
      subsidySavings: 0,
      activeSlabs: [
        {
          id: 'free',
          label: '0 - 100 kWh (Free Subsidy Tier)',
          rangeLabel: '0–100U',
          units: 0,
          rate: 0,
          cost: 0,
          color: 'bg-emerald-500',
        },
      ],
    };
  }

  const freeUnits = Math.min(units, 100);
  let rem = units - freeUnits;
  const activeSlabs: TariffSlabItem[] = [
    {
      id: 'free',
      label: '0 - 100 kWh (Free Subsidy Tier)',
      rangeLabel: '0–100U',
      units: freeUnits,
      rate: 0,
      cost: 0,
      color: 'bg-emerald-500',
    },
  ];

  let energyCost = 0;
  let tier1Units = 0;
  let tier1Rate = 2.35;
  let tier1Cost = 0;
  let tier2Units = 0;
  let tier2Rate = 4.70;
  let tier2Cost = 0;
  let tier3Units = 0;
  let tier3Rate = 6.30;
  let tier3Cost = 0;

  if (isCategoryA) {
    // 101 - 200: ₹2.35
    if (rem > 0) {
      tier1Units = Math.min(rem, 100);
      tier1Rate = 2.35;
      tier1Cost = tier1Units * 2.35;
      energyCost += tier1Cost;
      rem -= tier1Units;
      activeSlabs.push({
        id: 'tier1',
        label: '101 - 200 kWh (Tier 1 @ ₹2.35)',
        rangeLabel: '101–200U',
        units: tier1Units,
        rate: 2.35,
        cost: tier1Cost,
        color: 'bg-cyan-400',
      });
    }

    // 201 - 400: ₹4.70
    if (rem > 0) {
      tier2Units = Math.min(rem, 200);
      tier2Rate = 4.70;
      tier2Cost = tier2Units * 4.70;
      energyCost += tier2Cost;
      rem -= tier2Units;
      activeSlabs.push({
        id: 'tier2',
        label: '201 - 400 kWh (Tier 2 @ ₹4.70)',
        rangeLabel: '201–400U',
        units: tier2Units,
        rate: 4.70,
        cost: tier2Cost,
        color: 'bg-amber-400',
      });
    }

    // 401 - 500: ₹6.30
    if (rem > 0) {
      tier3Units = Math.min(rem, 100);
      tier3Rate = 6.30;
      tier3Cost = tier3Units * 6.30;
      energyCost += tier3Cost;
      rem -= tier3Units;
      activeSlabs.push({
        id: 'tier3',
        label: '401 - 500 kWh (Tier 3 @ ₹6.30)',
        rangeLabel: '401–500U',
        units: tier3Units,
        rate: 6.30,
        cost: tier3Cost,
        color: 'bg-rose-500',
      });
    }
  } else {
    // Category B (> 500 units)
    // 101 - 400: ₹4.70 (300 units)
    if (rem > 0) {
      tier1Units = Math.min(rem, 300);
      tier1Rate = 4.70;
      tier1Cost = tier1Units * 4.70;
      energyCost += tier1Cost;
      rem -= tier1Units;
      activeSlabs.push({
        id: 'catB_tier1',
        label: '101 - 400 kWh (Slab @ ₹4.70)',
        rangeLabel: '101–400U',
        units: tier1Units,
        rate: 4.70,
        cost: tier1Cost,
        color: 'bg-cyan-400',
      });
    }

    // 401 - 500: ₹6.30 (100 units)
    if (rem > 0) {
      tier2Units = Math.min(rem, 100);
      tier2Rate = 6.30;
      tier2Cost = tier2Units * 6.30;
      energyCost += tier2Cost;
      rem -= tier2Units;
      activeSlabs.push({
        id: 'catB_tier2',
        label: '401 - 500 kWh (Slab @ ₹6.30)',
        rangeLabel: '401–500U',
        units: tier2Units,
        rate: 6.30,
        cost: tier2Cost,
        color: 'bg-amber-400',
      });
    }

    // 501 - 600: ₹8.40 (100 units)
    if (rem > 0) {
      tier3Units = Math.min(rem, 100);
      tier3Rate = 8.40;
      tier3Cost = tier3Units * 8.40;
      energyCost += tier3Cost;
      rem -= tier3Units;
      activeSlabs.push({
        id: 'catB_tier3',
        label: '501 - 600 kWh (Slab @ ₹8.40)',
        rangeLabel: '501–600U',
        units: tier3Units,
        rate: 8.40,
        cost: tier3Cost,
        color: 'bg-orange-500',
      });
    }

    // 601 - 800: ₹9.45 (200 units)
    if (rem > 0) {
      const u = Math.min(rem, 200);
      const c = u * 9.45;
      energyCost += c;
      rem -= u;
      activeSlabs.push({
        id: 'catB_tier4',
        label: '601 - 800 kWh (Slab @ ₹9.45)',
        rangeLabel: '601–800U',
        units: u,
        rate: 9.45,
        cost: c,
        color: 'bg-rose-500',
      });
    }

    // 801 - 1000: ₹10.50 (200 units)
    if (rem > 0) {
      const u = Math.min(rem, 200);
      const c = u * 10.50;
      energyCost += c;
      rem -= u;
      activeSlabs.push({
        id: 'catB_tier5',
        label: '801 - 1000 kWh (Slab @ ₹10.50)',
        rangeLabel: '801–1000U',
        units: u,
        rate: 10.50,
        cost: c,
        color: 'bg-purple-500',
      });
    }

    // Above 1000: ₹11.55
    if (rem > 0) {
      const u = rem;
      const c = u * 11.55;
      energyCost += c;
      activeSlabs.push({
        id: 'catB_tier6',
        label: 'Above 1000 kWh (Slab @ ₹11.55)',
        rangeLabel: '>1000U',
        units: u,
        rate: 11.55,
        cost: c,
        color: 'bg-red-600',
      });
    }
  }

  const totalBill = Math.round((fixedCharge + energyCost) * 100) / 100;
  const effectiveRate = units > 0 ? totalBill / units : 0;
  // Subsidy saved: In Category A, 100 free units at tier1 rate (2.35); in Cat B, at 4.70
  const subsidySavings = isCategoryA ? freeUnits * 2.35 : freeUnits * 4.70;

  return {
    units,
    category,
    categoryLabel,
    fixedCharge,
    freeUnits,
    tier1Units,
    tier1Rate,
    tier1Cost,
    tier2Units,
    tier2Rate,
    tier2Cost,
    tier3Units,
    tier3Rate,
    tier3Cost,
    totalBill,
    effectiveRate,
    subsidySavings,
    activeSlabs,
  };
}

const PANTRY_CEILING_KEY = 'smartledger_pantry_ceiling';

export function getPantryCeiling(): number {
  try {
    const val = localStorage.getItem(PANTRY_CEILING_KEY);
    if (val) {
      const parsed = parseFloat(val);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to read pantry ceiling from storage', e);
  }
  return 5000;
}

export function setPantryCeiling(ceiling: number): void {
  try {
    localStorage.setItem(PANTRY_CEILING_KEY, String(Math.max(100, ceiling)));
  } catch (e) {
    console.warn('Failed to write pantry ceiling to storage', e);
  }
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
