import { Transaction, CouplePreferences } from "../types";
import { formatFriendlyDate } from "../utils";
import { Trash2, ShieldCheck, Users, Search, CreditCard, Layers, Utensils, Car, ShoppingBag, Tv } from "lucide-react";
import { useState } from "react";

interface TransactionListProps {
  transactions: Transaction[];
  preferences: CouplePreferences;
  onDeleteTransaction: (id: string) => void;
  limit?: number;
  hideFilters?: boolean;
}

const CATEGORY_ICONS: Record<string, any> = {
  "餐饮": { icon: Utensils, label: "餐饮", bg: "bg-[#FF6B6B]/15 text-[#FF6B6B] border-[#FF6B6B]/30" },
  "交通": { icon: Car, label: "交通", bg: "bg-sky-100 text-sky-600 border-sky-200" },
  "购物": { icon: ShoppingBag, label: "购物", bg: "bg-amber-150 text-amber-700 border-amber-200" },
  "娱乐": { icon: Tv, label: "娱乐", bg: "bg-purple-100 text-purple-600 border-purple-200" },
  "杂项": { icon: Layers, label: "杂项", bg: "bg-emerald-100 text-emerald-600 border-emerald-200" },
};

export default function TransactionList({
  transactions,
  preferences,
  onDeleteTransaction,
  limit,
  hideFilters
}: TransactionListProps) {
  const [filter, setFilter] = useState<"all" | "me" | "partner" | "shared">("all");
  const [searchTerm, setSearchTerm] = useState("");

  let filteredTransactions = transactions
    .filter((tx) => {
      if (filter === "me") return tx.payer === "me";
      if (filter === "partner") return tx.payer === "partner";
      if (filter === "shared") return tx.is_shared;
      return true;
    })
    .filter((tx) => {
      const descMatch = tx.description.toLowerCase().includes(searchTerm.toLowerCase());
      const catMatch = tx.category ? tx.category.toLowerCase().includes(searchTerm.toLowerCase()) : false;
      return descMatch || catMatch;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (limit) {
    filteredTransactions = filteredTransactions.slice(0, limit);
  }

  return (
    <div className="space-y-6 bg-[#F1F3F5] rounded-[32px] p-4 sm:p-6 md:p-8 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      
      {/* Header and filters line */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pb-4 border-b-2 border-black/10">
        <h4 className="text-xl font-black text-[#1A1A1A] flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#FF6B6B]" />
          {hideFilters ? "最近账单 (Recent)" : `账单明细历史 (${filteredTransactions.length})`}
        </h4>

        {/* Filters toggle - Styled with physical pressed look */}
        {!hideFilters && (
        <div className="flex flex-wrap gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={() => setFilter("all")}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-black cursor-pointer border-2 transition-all ${
              filter === "all"
                ? "bg-zinc-950 text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-y-[1px]"
                : "bg-white hover:bg-zinc-50 text-zinc-600 border-zinc-300 hover:border-black"
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilter("me")}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-black cursor-pointer border-2 transition-all ${
              filter === "me"
                ? "bg-zinc-950 text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-y-[1px]"
                : "bg-white hover:bg-zinc-50 text-zinc-600 border-zinc-300 hover:border-black"
            }`}
          >
            我付的
          </button>
          <button
            onClick={() => setFilter("partner")}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-black cursor-pointer border-2 transition-all ${
              filter === "partner"
                ? "bg-zinc-950 text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-y-[1px]"
                : "bg-white hover:bg-zinc-50 text-zinc-600 border-zinc-300 hover:border-black"
            }`}
          >
            {preferences.partnerName}付的
          </button>
          <button
            onClick={() => setFilter("shared")}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-black cursor-pointer border-2 transition-all ${
              filter === "shared"
                ? "bg-zinc-950 text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-y-[1px]"
                : "bg-white hover:bg-zinc-50 text-zinc-600 border-zinc-300 hover:border-black"
            }`}
          >
            平摊账
          </button>
        </div>
        )}
      </div>

      {/* Search Bar - styled to match custom inputs */}
      {!hideFilters && (
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-505">
          <Search className="w-4 h-4 text-zinc-500" />
        </span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="搜索消费内容描述或类别 (餐饮, 交通, 购物, 杂项)..."
          className="w-full bg-white border-3 border-black rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-[#1A1A1A] placeholder-zinc-400 focus:outline-none focus:ring-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        />
      </div>
      )}

      {/* Grid of Transaction Bento List Items */}
      {filteredTransactions.length === 0 ? (
        <div className="text-center py-16 bg-white border-3 border-dashed border-zinc-350 rounded-3xl">
          <p className="text-sm font-black text-zinc-400">
            {searchTerm ? "没有找到符合搜索内容的明细记录" : "当前账单列表空空如也，快在右方记一笔情侣开销吧！"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTransactions.map((tx) => {
            const isSettlement = tx.isSettlement;
            const isMe = tx.payer === "me";
            const PayerLabel = isMe ? "Me" : "P";
            const PayerFullName = isMe ? preferences.meName : preferences.partnerName;

            // Resolve Category config
            const categoryData = tx.category ? CATEGORY_ICONS[tx.category] : null;
            const CategoryIcon = categoryData ? categoryData.icon : null;
            
            return (
              <div
                key={tx.id}
                className={`p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-3 transition-all ${
                  isSettlement
                    ? "bg-emerald-50 border-black shadow-[4px_4px_0px_0px_rgba(16,185,129,0.3)]"
                    : "bg-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
                }`}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Brutalist Avatar elements */}
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-xs shrink-0 border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${
                      isSettlement
                        ? "bg-emerald-500 text-white"
                        : isMe
                        ? "bg-amber-300 text-[#1A1A1A]"
                        : "bg-[#4D96FF] text-white"
                    }`}
                    title={PayerFullName}
                  >
                    {isSettlement ? "🤝" : PayerLabel}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-sm text-[#1A1A1A]">{tx.description}</span>
                      
                      {/* Render category tag if available */}
                      {categoryData && CategoryIcon && (
                        <span className={`text-[10px] uppercase tracking-wide font-black px-2 py-0.5 rounded-md border-2 border-black flex items-center gap-1 ${categoryData.bg}`}>
                          <CategoryIcon className="w-3 h-3" />
                          <span>{categoryData.label}</span>
                        </span>
                      )}

                      {isSettlement ? (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                          <ShieldCheck className="w-3 h-3 inline mr-0.5" /> 已结算
                        </span>
                      ) : tx.is_shared ? (
                        <span className="text-[10px] bg-green-150 text-green-800 font-extrabold px-2 py-0.5 rounded-full border border-green-200">
                          <Users className="w-3 h-3 inline mr-0.5" /> 两人平摊 50/50
                        </span>
                      ) : (
                        <span className="text-[10px] bg-amber-100 text-amber-850 font-extrabold px-2 py-0.5 rounded-full border border-amber-200">
                          <CreditCard className="w-3 h-3 inline mr-0.5" /> 全额代付
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium mt-1">
                      <span className="capitalize">{formatFriendlyDate(tx.date)}</span>
                      <span>•</span>
                      <span>由 【{PayerFullName}】 支付</span>
                    </div>
                  </div>
                </div>

                {/* Amount tags & deletes */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t-2 border-dashed border-black/10 pt-3 sm:pt-0 sm:border-t-0 mt-1 sm:mt-0">
                  <div className="text-left sm:text-right">
                    <div className="font-mono font-black text-sm sm:text-base text-[#1A1A1A]">
                      {tx.currency} {tx.amount.toFixed(2)}
                    </div>
                    {!isSettlement && (
                      <div className="text-[10px] text-zinc-400 font-bold">
                        {tx.is_shared
                          ? `每个人承担 ${tx.currency} ${(tx.amount / 2).toFixed(2)}`
                          : `全部由对方承担 ${tx.currency} ${tx.amount.toFixed(2)}`}
                      </div>
                    )}
                  </div>

                  {/* Delete button matching aesthetics */}
                  <button
                    onClick={() => onDeleteTransaction(tx.id)}
                    className="p-2 text-zinc-400 hover:text-red-500 hover:bg-zinc-150 rounded-xl transition-all cursor-pointer border border-transparent hover:border-black hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] bg-white active:translate-y-[1px] shrink-0"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
