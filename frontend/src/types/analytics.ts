export interface MacroSpendSummary {
  electricitySpend: number;
  gasSpend: number;
  telecomSpend: number;
  transportSpend: number;
  grocerySpend: number;
  totalMonthlySpend: number;
  percentageDistribution: Record<string, number>;
}

export interface UserSummary {
  id: number;
  fullName: string;
  email: string;
}

export interface ElectricityRecordDetail {
  recordId: number;
  billingMonth: string;
  masterEbUnits: number;
  totalEbAmount: number;
  isShared: boolean;
  mySubmeterUnits: number;
  otherSubmeterUnits: number;
  calculatedMyShare: number;
  paidDate: string;
  utilityType: string;
}

export interface GasForecast {
  connectedDate: string;
  cylinderWeightKg: number;
  burnRateKgPerDay: number;
  predictedDepletionDate: string;
  daysRemaining: number;
  percentageRemaining: number;
  refillAlert: boolean;
}

export interface GasRecordDetail {
  recordId: number;
  recordDate: string;
  bookingCost: number;
  cylinderWeightKg: number;
  connectedDate: string;
  finishedDate?: string | null;
  burnRatePerDay?: number | null;
  isActive: boolean;
}

export interface TelecomRecordDetail {
  recordId: number;
  familyMemberName: string;
  serviceProvider: 'Jio' | 'Airtel' | 'BSNL' | 'Vi' | string;
  planAmount: number;
  rechargeDate: string;
  validityDays: number;
  expiryDate: string;
  utilityType: string;
}

export interface TransportRecordDetail {
  recordId: number;
  commuteType: 'FUEL' | 'PUBLIC_TICKET' | 'TICKET' | 'PASS' | string;
  personName: string;
  originPoint?: string;
  destinationPoint?: string;
  vehicleName?: string;
  passengerName?: string;
  routeDestination?: string;
  fuelType?: string;
  transitMode?: string;
  distanceKm?: number | null;
  litersFilled?: number | null;
  totalFareCost: number;
  mileageCalculated?: number | null;
  costPerKm?: number | null;
  entryDate: string;
}

export interface GroceryRecordDetail {
  recordId: number;
  storeName: string;
  category: 'ESSENTIAL_STAPLE' | 'DAIRY_PRODUCE' | 'SNACKS_DISCRETIONARY' | 'HOUSEHOLD_CLEANING' | string;
  purchaseDate: string;
  totalAmount: number;
  receiptNotes?: string;
}

export interface OverviewData {
  macro: MacroSpendSummary;
  user: UserSummary;
  electricity: {
    latest?: ElectricityRecordDetail;
    history: ElectricityRecordDetail[];
  };
  gas: {
    active?: GasRecordDetail;
    forecast?: GasForecast;
    history: GasRecordDetail[];
  };
  telecom: {
    records: TelecomRecordDetail[];
    expiringSoonCount: number;
    expiredCount: number;
  };
  transport: {
    records: TransportRecordDetail[];
    totalMonthlySpend: number;
  };
  grocery: {
    records: GroceryRecordDetail[];
    totalMonthlySpend: number;
  };
}

export interface SubMeterSimResult {
  masterUnits: number;
  totalSubUnits: number;
  myUnits: number;
  otherUnits: number;
  totalEbBill: number;
  calculatedMyShare: number;
  effectiveRatePerUnit: number;
  isShared: boolean;
}

export type PageId = 'dashboard' | 'electricity' | 'gas' | 'telecom' | 'mobility' | 'pantry';

export interface AddElectricityInput {
  billingMonth: string;
  totalEbAmount?: number;
  myUnits: number;
  otherUnits?: number;
  paidDate?: string;
}

export interface ConnectGasInput {
  weightKg?: number;
  bookingCost: number;
  connectedDate?: string;
}

export interface AddTelecomInput {
  memberName: string;
  provider: string;
  amount: number;
  rechargeDate?: string;
  validityDays: number;
}

export interface AddTravelInput {
  type: 'FUEL' | 'PUBLIC_TICKET';
  personName: string;
  origin?: string;
  destination?: string;
  distanceKm?: number;
  liters?: number;
  totalFare: number;
  date?: string;
}

export interface AddGroceryInput {
  storeName?: string;
  category: 'ESSENTIAL_STAPLE' | 'DAIRY_PRODUCE' | 'SNACKS_DISCRETIONARY' | 'HOUSEHOLD_CLEANING' | string;
  amount: number;
  date?: string;
  notes?: string;
}
