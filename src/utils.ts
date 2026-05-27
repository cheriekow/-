import { Transaction } from "./types";

/**
 * Calculates how much money each person is owed.
 * 
 * For each transaction:
 * - Ifpayer is 'me' (I paid):
 *   - If is_shared is true: Partner owes me (amount * 0.5)
 *   - If is_shared is false: Partner owes me (amount) [Fully padded for them]
 * - If payer is 'partner' (They paid):
 *   - If is_shared is true: I owe Partner (amount * 0.5)
 *   - If is_shared is false: I owe Partner (amount)[Fully padded for me]
 * 
 * Returns the net balance:
 * - Positive: Partner owes 'me' this amount
 * - Negative: 'me' owes Partner this absolute amount
 */
export function calculateNetBalance(transactions: Transaction[]): number {
  let net = 0;
  transactions.forEach((tx) => {
    if (tx.isSettlement) {
      // Settlements adjust the net directly or reset to 0. 
      // If we model a settlement transaction: payer === 'me' means I paid partner to settle my debt,
      // which offsets a previous negative balance or creates a credit.
      // E.g., if I owed partner 50, and I pay partner 50 to settle, then payer='me', amount=50, is_shared=false,
      // then partner owes me 50, which cancels out the -50 owed to partner!
      // So settlement can just be processed as normal where is_shared is false!
    }
    
    if (tx.payer === "me") {
      if (tx.is_shared) {
        net += tx.amount * 0.5;
      } else {
        net += tx.amount;
      }
    } else {
      // partner paid
      if (tx.is_shared) {
        net -= tx.amount * 0.5;
      } else {
        net -= tx.amount;
      }
    }
  });
  return net;
}

/**
 * Formats date indicator into friendly Chinese label
 */
export function formatFriendlyDate(dateStr: string): string {
  if (dateStr.toLowerCase() === "today") return "今天";
  if (dateStr.toLowerCase() === "yesterday") return "昨天";
  
  // Format standard date
  return dateStr;
}

/**
 * Standard templates for testing
 */
export const SAMPLE_INPUT_PRESETS = [
  "今天他先给了 RM150 吃日料",
  "我帮他垫付了 30 块买杯子",
  "昨晚打车花了 25RM 平摊，是我付的",
  "男朋友交了本月水电费 RM180 两人共同承担",
  "我买了电影票 45 块，直接平平摊",
  "他刚才买星巴克花了 36 块，是他垫付我的那杯"
];

/**
 * Default transactions to populate the ledger initially
 */
export const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-init-1",
    payer: "partner",
    amount: 150,
    currency: "RM",
    description: "吃日料",
    date: "today",
    is_shared: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
  },
  {
    id: "tx-init-2",
    payer: "me",
    amount: 30,
    currency: "RM",
    description: "买杯子",
    date: "today",
    is_shared: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() // 5 hours ago
  },
  {
    id: "tx-init-3",
    payer: "me",
    amount: 25,
    currency: "RM",
    description: "周末打车",
    date: "yesterday",
    is_shared: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
  },
  {
    id: "tx-init-4",
    payer: "partner",
    amount: 120,
    currency: "RM",
    description: "超市买菜共同购买",
    date: "2026-05-24",
    is_shared: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
  }
];
