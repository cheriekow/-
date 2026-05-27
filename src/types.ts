export interface Transaction {
  id: string;
  payer: "me" | "partner";
  amount: number;
  currency: string;
  description: string;
  date: string; // 'today', 'yesterday' or YYYY-MM-DD
  is_shared: boolean; // true = 50/50 split, false = full payment for the other person
  createdAt: string; // ISO timestamp
  isSettlement?: boolean; // True if this item represents a settlement clearing outstanding debts
  category?: string; // Optional expense category
}

export interface CouplePreferences {
  meName: string;
  partnerName: string;
  currencySymbol: string; // standard 'RM'
  monthlyBudget: number; // to show budget bar calculation
}
