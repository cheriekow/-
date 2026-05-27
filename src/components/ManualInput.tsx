import { useState, FormEvent } from "react";
import { Transaction, CouplePreferences } from "../types";
import { PlusCircle, Calendar, Coins, FileText, Utensils, Car, ShoppingBag, Tv, Layers, Sparkles } from "lucide-react";

interface ManualInputProps {
  preferences: CouplePreferences;
  onAddTransaction: (tx: Omit<Transaction, "id" | "createdAt">) => void;
}

const CATEGORIES = [
  { id: "餐饮", name: "餐饮", icon: Utensils, color: "bg-[#FF6B6B]/10 hover:bg-[#FF6B6B]/20 text-[#FF6B6B] border-[#FF6B6B]" },
  { id: "交通", name: "交通", icon: Car, color: "bg-sky-100 hover:bg-sky-250 text-sky-600 border-sky-400" },
  { id: "购物", name: "购物", icon: ShoppingBag, color: "bg-amber-100 hover:bg-amber-250 text-amber-600 border-amber-400" },
  { id: "娱乐", name: "娱乐", icon: Tv, color: "bg-purple-100 hover:bg-purple-250 text-purple-600 border-purple-400" },
  { id: "杂项", name: "杂项", icon: Layers, color: "bg-emerald-100 hover:bg-emerald-250 text-emerald-600 border-emerald-400" },
];

export default function ManualInput({ preferences, onAddTransaction }: ManualInputProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [payer, setPayer] = useState<"me" | "partner">("me");
  const [isShared, setIsShared] = useState(true);
  const [activeCategory, setActiveCategory] = useState("餐饮");
  const [date, setDate] = useState("today");
  const [customDate, setCustomDate] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!amount) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    // Use description if provided, otherwise default to selected category name
    const finalDescription = description.trim() || activeCategory;
    const finalDate = date === "custom" ? customDate || new Date().toISOString().split("T")[0] : date;

    onAddTransaction({
      payer,
      amount: parsedAmount,
      currency: preferences.currencySymbol,
      description: finalDescription,
      date: finalDate,
      is_shared: isShared,
      category: activeCategory,
    });

    // Reset Form fields elegantly
    setDescription("");
    setAmount("");
    setDate("today");
    setCustomDate("");
  };

  return (
    <div className="bg-white border-4 border-black rounded-3xl p-5 sm:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
      <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-black">
        <h3 className="text-xl font-black text-[#1A1A1A] flex items-center gap-2">
          <PlusCircle className="w-6 h-6 text-[#FF6B6B]" />
          手动记账 / Log Expense
        </h3>
        <span className="text-[10px] font-mono font-black uppercase tracking-wider bg-zinc-150 text-zinc-700 px-2.5 py-1 rounded border-2 border-black">
          Manual mode
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* BIG AMOUNT INPUT with RM/Currency Symbol */}
        <div className="space-y-2">
          <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block">
            支付金额 (Amount)
          </label>
          <div className="relative flex items-center bg-[#FDFCFB] border-3 border-black rounded-2xl overflow-hidden p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span className="pl-4 pr-2 text-2xl font-black font-mono text-[#FF6B6B] shrink-0 select-none">
              {preferences.currencySymbol}
            </span>
            <input
              type="number"
              step="0.01"
              required
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-transparent text-3xl font-black font-mono text-[#1A1A1A] py-3 px-2 placeholder-zinc-305 outline-none focus:outline-none"
            />
          </div>
        </div>

        {/* PAYER SWITCH: TWO PHYSICAL BRUTALIST BUTTONS */}
        <div className="space-y-2">
          <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block">
            付款人 (Who Paid?)
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setPayer("me")}
              className={`py-4 px-4 font-black text-sm rounded-xl border-3 border-black flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                payer === "me"
                  ? "bg-amber-300 text-[#1A1A1A] shadow-[inset_3px_3px_0px_0px_rgba(0,0,0,0.2),3px_3px_0px_0px_rgba(0,0,0,1)] translate-y-[1px]"
                  : "bg-white hover:bg-zinc-50 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px]"
              }`}
            >
              <span className="text-[10px] font-mono font-extrabold uppercase tracking-wide opacity-60">我付的 付款</span>
              <span className="text-sm font-black truncate">{preferences.meName}</span>
            </button>

            <button
              type="button"
              onClick={() => setPayer("partner")}
              className={`py-4 px-4 font-black text-sm rounded-xl border-3 border-black flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                payer === "partner"
                  ? "bg-[#4D96FF] text-white shadow-[inset_3px_3px_0px_0px_rgba(0,0,0,0.3),3px_3px_0px_0px_rgba(0,0,0,1)] translate-y-[1px]"
                  : "bg-white hover:bg-zinc-50 text-zinc-800 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px]"
              }`}
            >
              <span className="text-[10px] font-mono font-extrabold uppercase tracking-wide opacity-80">Ta付的 付款</span>
              <span className="text-sm font-black truncate">{preferences.partnerName}</span>
            </button>
          </div>
        </div>

        {/* CLICKABLE CATEGORIES GRID */}
        <div className="space-y-2">
          <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block">
            消费类别 (Category)
          </label>
          <div className="flex flex-wrap gap-2.5">
            {CATEGORIES.map((cat) => {
              const IconComp = cat.icon;
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setActiveCategory(cat.id);
                    if (!description.trim()) {
                      // set visual placeholder hint
                    }
                  }}
                  className={`px-3 py-2.5 rounded-xl border-2 border-black flex items-center gap-1.5 font-bold text-xs cursor-pointer transition-all ${
                    isSelected
                      ? "bg-zinc-950 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-y-[1.5px]"
                      : `${cat.color} bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px]`
                  }`}
                >
                  <IconComp className="w-4 h-4 shrink-0" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* DETAILS INPUT */}
        <div className="space-y-2">
          <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block">
            消费具体内容描述 (Description)
          </label>
          <div className="relative flex items-center bg-[#FDFCFB] border-3 border-black rounded-xl p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <span className="pl-3 pr-2 text-zinc-400 shrink-0 select-none">
              <FileText className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`自定义描述（或留空，默认为 "${activeCategory}"）`}
              className="w-full bg-transparent text-sm font-extrabold text-[#1A1A1A] py-2.5 outline-none focus:outline-none"
            />
          </div>
        </div>

        {/* RECESS DATE BOX */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-black text-zinc-400 block uppercase">
              消费日期 (Date)
            </label>
            <select
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#FDFCFB] border-3 border-black rounded-xl px-3 py-2.5 text-sm font-extrabold text-[#1A1A1A] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-0 cursor-pointer"
            >
              <option value="today">今天 (Today)</option>
              <option value="yesterday">昨天 (Yesterday)</option>
              <option value="custom">自定具体日期...</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-black text-[#1A1A1A] block uppercase">
              结算规则 (Settle Plan)
            </label>
            <div className="flex items-center justify-between h-[45px] bg-[#FDFCFB] border-3 border-black rounded-xl px-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-xs font-black text-zinc-700">共同均摊 (50/50 分账)</span>
              <input
                type="checkbox"
                checked={isShared}
                onChange={(e) => setIsShared(e.target.checked)}
                className="w-4 h-4 accent-zinc-900 border-2 border-black rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {date === "custom" && (
          <div className="space-y-1">
            <label className="text-[11px] font-mono font-bold text-gray-500 block">选择具体日期</label>
            <input
              type="date"
              required
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="w-full bg-white border-3 border-black rounded-xl px-3 py-2 text-sm text-[#1A1A1A] font-mono shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            />
          </div>
        )}

        {/* WIDE ACTION BUTTON */}
        <button
          type="submit"
          className="w-full py-4 bg-zinc-950 hover:bg-zinc-800 text-white font-black text-sm rounded-2xl shadow-[4px_4px_0px_0px_rgba(255,107,107,0.7)] hover:shadow-[5px_5px_0px_0px_rgba(255,107,107,0.8)] border-3 border-black flex items-center justify-center gap-2 cursor-pointer transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_rgba(255,107,107,0.5)]"
        >
          <Sparkles className="w-4 h-4 text-lime-400" />
          <span>记录这笔开销 / Log Expense</span>
        </button>
      </form>
    </div>
  );
}
