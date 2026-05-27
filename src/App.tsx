import { useState, useEffect } from "react";
import { Transaction, CouplePreferences } from "./types";
import { DEFAULT_TRANSACTIONS, calculateNetBalance } from "./utils";
import BalanceCard from "./components/BalanceCard";
import TransactionList from "./components/TransactionList";
import ManualInput from "./components/ManualInput";
import PreferencesPanel from "./components/PreferencesPanel";
import HistoryRestoreBin from "./components/HistoryRestoreBin";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Activity, PiggyBank, Smile, X, ShieldAlert, CheckCircle2, History } from "lucide-react";

export default function App() {
  // Load initial preferences
  const [preferences, setPreferences] = useState<CouplePreferences>(() => {
    const saved = localStorage.getItem("couple_ledger_prefs");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return {
      meName: "Mike",
      partnerName: "Sofi",
      currencySymbol: "RM",
      monthlyBudget: 2000,
    };
  });

  // Load initial transactions
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("couple_ledger_txs");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return DEFAULT_TRANSACTIONS;
  });

  // Load deleted transactions for history restore bin
  const [deletedTransactions, setDeletedTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("couple_ledger_deleted_txs");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return [];
  });

  // Control custom Settle Up confirmation modal
  const [showSettleConfirm, setShowSettleConfirm] = useState(false);

  // Persist preferences
  useEffect(() => {
    localStorage.setItem("couple_ledger_prefs", JSON.stringify(preferences));
  }, [preferences]);

  // Persist transactions
  useEffect(() => {
    localStorage.setItem("couple_ledger_txs", JSON.stringify(transactions));
  }, [transactions]);

  // Persist deleted transactions
  useEffect(() => {
    localStorage.setItem("couple_ledger_deleted_txs", JSON.stringify(deletedTransactions));
  }, [deletedTransactions]);

  // Add customized transaction
  const handleAddTransaction = (newTx: Omit<Transaction, "id" | "createdAt">) => {
    const freshTx: Transaction = {
      ...newTx,
      id: "tx-" + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [freshTx, ...prev]);
  };

  // Delete transaction & backup to restore bin
  const handleDeleteTransaction = (id: string) => {
    const target = transactions.find((tx) => tx.id === id);
    if (target) {
      setDeletedTransactions((prev) => [target, ...prev].slice(0, 20));
    }
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };

  // Restore transaction from bin back to list
  const handleRestoreTransaction = (id: string) => {
    const target = deletedTransactions.find((tx) => tx.id === id);
    if (target) {
      setTransactions((prev) => [target, ...prev]);
      setDeletedTransactions((prev) => prev.filter((tx) => tx.id !== id));
    }
  };

  // Clear recycle bin
  const handleClearDeleted = () => {
    setDeletedTransactions([]);
  };

  // Clear all/Reset Ledger
  const handleResetLedger = () => {
    if (window.confirm("确定要清空全部记账账目和明细吗？此操作无法撤销。")) {
      setTransactions([]);
    }
  };

  // Settle up debts
  const handleSettleUp = () => {
    const net = calculateNetBalance(transactions);
    if (Math.abs(net) < 0.01) return;

    const settleAmt = Math.abs(net);
    const payer = net > 0 ? "partner" : "me";

    // Add settlement record with Category '杂项'
    handleAddTransaction({
      payer,
      amount: settleAmt,
      currency: preferences.currencySymbol,
      description: "一键结清往期账目 🤝",
      date: "today",
      is_shared: false,
      isSettlement: true,
      category: "杂项"
    });
    
    // Close confirmation modal
    setShowSettleConfirm(false);
  };

  // Budget calculations
  const totalSharedSpent = transactions
    .filter((tx) => tx.is_shared)
    .reduce((sum, tx) => sum + tx.amount, 0);
  const budgetPercentage = Math.min((totalSharedSpent / preferences.monthlyBudget) * 100, 100);

  return (
    <div className="min-h-screen bg-[#FDFCFB] font-sans antialiased selection:bg-zinc-900 selection:text-white pb-24 relative [overflow-x:clip]">
      
      {/* Subtle organic light grids */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-[linear-gradient(to_bottom,rgba(240,240,240,0.5)_1px,transparent_1px),linear-gradient(to_right,rgba(240,240,240,0.5)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Main Grid Screen Container */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-8 relative z-10 space-y-8">
        
        {/* Header Hero Area */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between border-b-4 border-black pb-6 gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/pwa-192x192.png"
              alt="喵汪小金库 logo"
              className="w-10 h-10 rounded-xl border-3 border-black shadow-[2px_2px_0px_0px_#1A1A1A] shrink-0 object-cover"
            />
            <div>
              <h1 className="text-2xl font-black tracking-tight text-[#1A1A1A] flex items-center gap-1.5 leading-none">
                喵汪小金库
                <span className="text-xs font-bold text-zinc-500 font-sans ml-1 hidden sm:inline">专为情侣设计的温暖小账本</span>
              </h1>
              <p className="text-xs text-zinc-500 font-bold mt-1.5">50/50 智能平摊计算 • 浪漫二人手付记账册</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 w-full md:w-auto">
            <button
              onClick={handleResetLedger}
              className="px-4 py-2.5 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-black rounded-xl border-3 border-black cursor-pointer transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            >
              重置账本 / Reset
            </button>
            <div className="flex items-center gap-2 bg-white border-3 border-black rounded-full px-4 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0">
              <div className="flex -space-x-2">
                <div className="w-7 h-7 rounded-full border-2 border-black bg-amber-300 flex items-center justify-center text-[10px] font-black">
                  {preferences.meName.substring(0, 2)}
                </div>
                <div className="w-7 h-7 rounded-full border-2 border-black bg-[#4D96FF] flex items-center justify-center text-[10px] font-black text-white">
                  {preferences.partnerName.substring(0, 2)}
                </div>
              </div>
              <span className="text-xs font-black text-zinc-700">Sweet Duo</span>
            </div>
          </div>
        </header>

        {/* Budget visual panel (Component A) */}
        <div className="bg-white border-4 border-black rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[7px_7px_0px_0px_rgba(0,0,0,1)] transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6B6B]/10 flex items-center justify-center text-[#FF6B6B] border-3 border-black shadow-sm shrink-0">
              <PiggyBank className="w-6 h-6 text-black" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 block font-mono font-black uppercase tracking-wider">
                MONTHLY BUDGET PROGRESS
              </span>
              <h4 className="text-base font-black text-[#1A1A1A] mt-0.5">
                共同开销预算进度: <span className="font-mono text-[#FF6B6B]">{preferences.currencySymbol} {totalSharedSpent.toFixed(2)}</span> / {preferences.currencySymbol} {preferences.monthlyBudget}
              </h4>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex-grow max-w-md">
            <div className="flex justify-between text-xs font-mono font-black text-zinc-500 mb-1.5">
              <span>已用预算 {budgetPercentage.toFixed(0)}%</span>
              <span>剩余预算 {preferences.currencySymbol} {Math.max(preferences.monthlyBudget - totalSharedSpent, 0).toFixed(2)}</span>
            </div>
            <div className="h-4 bg-zinc-100 rounded-full overflow-hidden p-[2px] border-3 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
              <div
                className={`h-full rounded-full transition-all duration-500 border-r-2 border-black ${
                  budgetPercentage > 85 ? "bg-[#FF6B6B]" : "bg-lime-450 bg-[#4D96FF]"
                }`}
                style={{ width: `${budgetPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Big Balance displaying splitting grid (Component B + Component C) */}
        <BalanceCard
          transactions={transactions}
          preferences={preferences}
          onSettleUp={() => setShowSettleConfirm(true)}
        />

        {/* Structural grids - List & Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
          
          {/* Main columns: Transaction list */}
          <div className="lg:col-span-2 space-y-8 animate-fade-in">
            <TransactionList
              transactions={transactions}
              preferences={preferences}
              onDeleteTransaction={handleDeleteTransaction}
            />

            {/* Undo Recovery Log History Bin */}
            <HistoryRestoreBin
              deletedTransactions={deletedTransactions}
              preferences={preferences}
              onRestore={handleRestoreTransaction}
              onClear={handleClearDeleted}
            />
          </div>

          {/* Right sidebar section containing Manual input, Preferences, and Warm tip */}
          <div className="space-y-6">
            
            {/* Quick manual input form (Component D) */}
            <ManualInput
              preferences={preferences}
              onAddTransaction={handleAddTransaction}
            />

            {/* Profiles panel */}
            <PreferencesPanel
              preferences={preferences}
              onUpdatePreferences={setPreferences}
            />

            {/* Informational card */}
            <div className="bento-card-gray p-6 space-y-3 border border-zinc-200 bg-zinc-50">
              <span className="text-xs font-mono font-black text-zinc-650 flex items-center gap-1">
                <Smile className="w-3.5 h-3.5 text-[#FF6B6B]" /> 均摊温馨贴士 (Smart Rule Summary)
              </span>
              <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                1. 默认平摊 (<span className="font-bold text-zinc-700">均摊50/50</span>) 的项目中，由其中一人付款。对方会产生 50% 的欠款。
              </p>
              <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                2. 代垫 (<span className="font-bold text-zinc-700">全额垫付</span>) 的项目中，其中一方付款并全额由对方独立承担。对方会产生 100% 的欠款。
              </p>
              <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                3. “结账/Settle Up” 会抵消所有人的消费欠款并保持均衡，并在清单中产生一条结清记录。
              </p>
            </div>

          </div>

        </div>

        {/* Footer info */}
        <footer className="pt-10 border-t border-zinc-200 flex flex-col sm:flex-row sm:items-center sm:justify-between text-zinc-400 gap-4">
          <p className="text-xs uppercase font-extrabold tracking-widest">© DuoLedger Smart Love-Finance Engine v1.02</p>
          <div className="flex gap-1.5">
            <div className="h-1.5 w-8 bg-zinc-900 rounded-full"></div>
            <div className="h-1.5 w-4 bg-zinc-350 rounded-full"></div>
            <div className="h-1.5 w-4 bg-[#FF6B6B] rounded-full"></div>
          </div>
        </footer>

      </div>

      {/* Settle Up Confirmation Modal Overlay */}
      <AnimatePresence>
        {showSettleConfirm && (() => {
          const net = calculateNetBalance(transactions);
          const absBalance = Math.abs(net);
          const partnerOwesMe = net > 0;
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowSettleConfirm(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-xs"
              />

              {/* Modal Box */}
              <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                className="relative bg-white border-4 border-black rounded-[32px] p-8 max-w-lg w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-10 space-y-6"
              >
                {/* Close Button */}
                <button
                  onClick={() => setShowSettleConfirm(false)}
                  className="absolute top-4 right-4 p-2 bg-zinc-100 hover:bg-zinc-200 rounded-full border-2 border-black transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 text-black" />
                </button>

                <div className="flex items-center gap-3 pb-3 border-b-2 border-black font-sans">
                  <div className="w-10 h-10 bg-amber-300 border-2 border-black rounded-xl flex items-center justify-center shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] shrink-0">
                    <ShieldAlert className="w-5 h-5 text-black" />
                  </div>
                  <h3 className="text-xl font-black text-[#1A1A1A]">
                    确认要一键结账清零吗？
                  </h3>
                </div>

                <div className="space-y-4 text-sm text-zinc-750 leading-relaxed font-sans">
                  <p className="font-bold text-zinc-600">
                    该操作会自动在账目列表最上方添加一条结算单记录，使双方当前的对账差额立刻回归 0.00。
                  </p>

                  {/* Settle Details */}
                  <div className="p-4 bg-[#FFFDEB] border-3 border-black rounded-2xl space-y-1.5 font-mono">
                    <div className="flex justify-between font-black text-[10px] text-zinc-500 uppercase">
                      <span>当前待结算账单 / Pending balance</span>
                    </div>
                    <div className="text-sm font-black text-[#1A1A1A] mt-1">
                      {absBalance < 0.01 ? (
                        <span className="text-emerald-600 font-sans">双方已全部两清，无需任何对冲结账！✨</span>
                      ) : partnerOwesMe ? (
                        <span>
                          【{preferences.partnerName}】需要给【{preferences.meName}】划转支付共{" "}
                          <span className="text-[#FF6B6B] underline decoration-2">{preferences.currencySymbol} {absBalance.toFixed(2)}</span>
                        </span>
                      ) : (
                        <span>
                          【{preferences.meName}】需要给【{preferences.partnerName}】划转支付共{" "}
                          <span className="text-[#4D96FF] underline decoration-2">{preferences.currencySymbol} {absBalance.toFixed(2)}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 border-2 border-dashed border-amber-400 rounded-2xl text-xs text-amber-950 space-y-2">
                    <h5 className="font-black flex items-center gap-1 text-amber-900">
                      💡 误触/手滑不用慌！对账如何 100% 恢复：
                    </h5>
                    <p className="leading-relaxed font-bold">
                      本账本支持完美回滚归位。若您发生误操作：
                    </p>
                    <ul className="list-disc pl-4 space-y-1 font-bold">
                      <li>您只需在左侧账单列表中，点击结算单右侧的 🗑️ 垃圾筒将其直接删除即可；</li>
                      <li>或者在本页左下方新增的<strong>记账撤销恢复与历史库</strong>中，点击其对应的“撤销并还原”；</li>
                      <li>所有的欠账差额和已付统计便会立刻完好如初。</li>
                    </ul>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <button
                    onClick={() => setShowSettleConfirm(false)}
                    className="py-3 px-4 bg-white hover:bg-zinc-100 text-zinc-800 font-black text-xs rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] transition-all cursor-pointer"
                  >
                    取消 / 手滑点错
                  </button>
                  <button
                    onClick={handleSettleUp}
                    disabled={absBalance < 0.01}
                    className={`py-3 px-4 text-white font-black text-xs rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] transition-all cursor-pointer ${
                      absBalance < 0.01
                        ? "bg-zinc-200 text-zinc-400 border-zinc-300 shadow-none cursor-not-allowed"
                        : "bg-emerald-500 hover:bg-emerald-600 border-black"
                    }`}
                  >
                    确认结清 / Go Settle
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

    </div>
  );
}
