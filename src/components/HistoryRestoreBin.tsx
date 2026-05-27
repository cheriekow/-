import { Transaction, CouplePreferences } from "../types";
import { formatFriendlyDate } from "../utils";
import { Undo2, History, Trash2, ShieldAlert, CheckCircle2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface HistoryRestoreBinProps {
  deletedTransactions: Transaction[];
  preferences: CouplePreferences;
  onRestore: (id: string) => void;
  onClear: () => void;
}

export default function HistoryRestoreBin({
  deletedTransactions,
  preferences,
  onRestore,
  onClear,
}: HistoryRestoreBinProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (deletedTransactions.length === 0) {
    return (
      <div className="bg-zinc-50 border-3 border-dashed border-zinc-200 rounded-3xl p-5 text-center">
        <div className="flex items-center justify-center gap-1.5 text-zinc-400 text-xs font-bold font-mono">
          <History className="w-4 h-4 text-zinc-350" />
          <span>恢复归档区为空 / History log is empty</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-4 border-black rounded-[32px] overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[7px_7px_0px_0px_rgba(0,0,0,1)] transition-all">
      {/* Header bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 sm:p-6 bg-zinc-50 hover:bg-zinc-100/80 transition-colors border-b-4 border-black cursor-pointer text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] shrink-0">
            <History className="w-5 h-5 text-zinc-900" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-black text-[#1A1A1A]">
              记账撤销恢复与历史库 ({deletedTransactions.length})
            </h4>
            <p className="text-[10px] sm:text-[11px] text-zinc-500 font-bold mt-0.5">
              误删、误结账的款项？在此可一键秒回滚复原
            </p>
          </div>
        </div>
        <span className="text-[10px] sm:text-xs font-mono font-black border-2 border-black px-2 py-0.5 sm:px-2.5 sm:py-1 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] whitespace-nowrap">
          {isOpen ? "收起折叠" : "点击展开"}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="p-4 sm:p-6 space-y-4 bg-[#FCFBF9]"
          >
            {/* Quick Warning tip */}
            <div className="p-3 bg-amber-50 border-2 border-amber-300 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <div>
                如果之前按错了“结账”，在此找到【一键结清往期账目】或被删除的原笔明细，点击右侧绿色的
                <span className="text-emerald-700 underline mx-1">撤销恢复</span>
                ，即可将账本数据瞬间完好无损地回滚到原初状态。
              </div>
            </div>

            {/* List of deleted items */}
            <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1 divide-y divide-zinc-200">
              {deletedTransactions.map((tx) => {
                const isMe = tx.payer === "me";
                const payerName = isMe ? preferences.meName : preferences.partnerName;
                const isSettlement = tx.isSettlement;

                return (
                  <div
                    key={tx.id}
                    className="pt-2.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold text-zinc-700"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-black border-2 border-black text-[10px] shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] shrink-0 ${
                          isSettlement
                            ? "bg-emerald-500 text-white"
                            : isMe
                            ? "bg-amber-300 text-black"
                            : "bg-[#4D96FF] text-white"
                        }`}
                      >
                        {isSettlement ? "🤝" : isMe ? "我" : "Ta"}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-zinc-900 font-extrabold line-through decoration-zinc-400">
                            {tx.description}
                          </span>
                          {isSettlement && (
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.2 rounded shrink-0">
                              结算单
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-400 font-medium">
                          {formatFriendlyDate(tx.date)} • {payerName} 已付 • {tx.category || "杂项"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t border-dashed border-zinc-100 pt-2 sm:pt-0 sm:border-0">
                      <span className="font-mono text-zinc-800 line-through">
                        {tx.currency} {tx.amount.toFixed(2)}
                      </span>
                      <button
                        onClick={() => onRestore(tx.id)}
                        className="px-2.5 py-1.5 bg-emerald-500 text-white font-black text-[11px] rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <Undo2 className="w-3 h-3" />
                        <span>撤销并还原</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Clear history button */}
            <div className="flex justify-end pt-3 border-t-2 border-dashed border-zinc-200">
              <button
                onClick={onClear}
                className="text-xs font-bold text-zinc-400 hover:text-red-500 cursor-pointer flex items-center gap-1 bg-white hover:bg-red-50 border border-zinc-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>彻底清空这批记录 / Clear Hist</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
