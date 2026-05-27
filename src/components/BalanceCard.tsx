import { Transaction, CouplePreferences } from "../types";
import { calculateNetBalance } from "../utils";
import { motion } from "motion/react";
import { CheckCircle2, Landmark, HelpCircle } from "lucide-react";

interface BalanceCardProps {
  transactions: Transaction[];
  preferences: CouplePreferences;
  onSettleUp: () => void;
}

export default function BalanceCard({ transactions, preferences, onSettleUp }: BalanceCardProps) {
  const netBalance = calculateNetBalance(transactions);
  const currency = preferences.currencySymbol;

  // Compute stats
  const totalMePaid = transactions
    .filter((t) => t.payer === "me")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPartnerPaid = transactions
    .filter((t) => t.payer === "partner")
    .reduce((sum, t) => sum + t.amount, 0);

  const sharedTransactions = transactions.filter((t) => t.is_shared);
  const totalSharedSpent = sharedTransactions.reduce((sum, t) => sum + t.amount, 0);

  // Determine direction
  const absBalance = Math.abs(netBalance);
  const isAllSettled = absBalance < 0.01;
  const partnerOwesMe = netBalance > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Peach Brutalist Main Balance Bento */}
      <div className="md:col-span-2 bg-[#FF6B6B] text-white border-4 border-black rounded-3xl p-5 sm:p-8 flex flex-col justify-between min-h-[225px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
        <div>
          <span className="text-[10px] uppercase tracking-widest font-mono font-black bg-white/25 text-white px-3 py-1 rounded-full border border-white/20">
            Duo Balance STATUS / 实时平摊分账
          </span>
          <h3 className="text-4xl md:text-5xl font-black font-mono tracking-tight mt-6 leading-none text-white">
            {isAllSettled ? (
              <span className="flex items-center gap-2">
                0.00 <span className="text-lg font-sans font-medium">✨ 账目已两清！</span>
              </span>
            ) : (
              <span className="flex items-baseline gap-1">
                {currency} {absBalance.toFixed(2)}
              </span>
            )}
          </h3>
          <p className="text-sm font-bold opacity-95 mt-3 text-white">
            {isAllSettled
              ? "情侣开销百分百对齐，完美伴侣合伙人！"
              : partnerOwesMe
              ? `【${preferences.partnerName}】欠【${preferences.meName}】共 ${currency} ${absBalance.toFixed(2)}`
              : `【${preferences.meName}】欠【${preferences.partnerName}】共 ${currency} ${absBalance.toFixed(2)}`}
          </p>
        </div>

        {/* Visual Split slider */}
        <div className="mt-6 bg-black/15 p-3.5 sm:p-4 rounded-2xl border-2 border-black">
          <div className="flex justify-between text-[10px] sm:text-xs font-mono font-black text-white mb-2 gap-1.5">
            <span className="truncate">{preferences.meName} 已付: {currency}{totalMePaid.toFixed(2)}</span>
            <span className="truncate">{preferences.partnerName} 已付: {currency}{totalPartnerPaid.toFixed(2)}</span>
          </div>
          <div className="h-4 bg-black/35 rounded-full overflow-hidden flex p-[1.5px] border-2 border-black">
            {totalMePaid === 0 && totalPartnerPaid === 0 ? (
              <div className="w-full bg-black/10 rounded-full" />
            ) : (
              <>
                <div
                  className="h-full bg-amber-300 rounded-l-full transition-all duration-500"
                  style={{ width: `${(totalMePaid / (totalMePaid + totalPartnerPaid || 1)) * 100}%` }}
                />
                <div className="w-[2px] bg-black" />
                <div
                  className="h-full bg-[#4D96FF] rounded-r-full transition-all duration-500"
                  style={{ width: `${(totalPartnerPaid / (totalMePaid + totalPartnerPaid || 1)) * 100}%` }}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Settle Up action box & Micro Statistics Grid */}
      <div className="bg-white text-[#1A1A1A] border-4 border-black rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
        <div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-mono font-black tracking-wider text-[#FF6B6B] bg-red-50 px-3 py-1 rounded-full border-2 border-black">
              结账结算台
            </span>
            <Landmark className="w-5 h-5 text-[#1A1A1A]" />
          </div>

          <div className="mt-5">
            <span className="text-xs text-zinc-500 font-extrabold block">共同开销总支出</span>
            <div className="text-3xl font-mono font-black text-[#1A1A1A] mt-1">
              {currency} {totalSharedSpent.toFixed(2)}
            </div>
            <p className="text-[11px] text-zinc-500 mt-2 font-bold leading-relaxed">
              按人头两人平分（50/50），每人平均应承担 {currency} {(totalSharedSpent / 2).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="mt-6">
          {!isAllSettled ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onSettleUp}
              className="w-full py-3.5 px-4 bg-[#FF6B6B] hover:bg-[#ff5252] text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all border-2 border-black active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Request Settle Up / 结清</span>
            </motion.button>
          ) : (
            <div className="w-full py-4 px-4 border-2 border-dashed border-zinc-300 text-zinc-500 text-xs font-extrabold rounded-2xl flex items-center justify-center gap-2 bg-zinc-50 font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>账单已全部结清 ✨</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
