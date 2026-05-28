import { useState, useEffect, FormEvent, MouseEvent } from "react";
import { CouplePreferences } from "../types";
import { Settings, Save, Sparkles, Heart } from "lucide-react";

interface PreferencesPanelProps {
  preferences: CouplePreferences;
  currentUserRole: "user_a" | "user_b";
  onUserRoleChange: (role: "user_a" | "user_b") => void;
  userAName: string;
  userBName: string;
  onUpdatePreferences: (updated: CouplePreferences) => void;
}

export default function PreferencesPanel({
  preferences,
  currentUserRole,
  onUserRoleChange,
  userAName,
  userBName,
  onUpdatePreferences
}: PreferencesPanelProps) {
  const [meName, setMeName] = useState(preferences.meName);
  const [partnerName, setPartnerName] = useState(preferences.partnerName);
  const [currencySymbol, setCurrencySymbol] = useState(preferences.currencySymbol);
  const [monthlyBudget, setMonthlyBudget] = useState(preferences.monthlyBudget.toString());
  const [isSaved, setIsSaved] = useState(false);

  // Sync component states when prop preferences changes
  useEffect(() => {
    setMeName(preferences.meName);
    setPartnerName(preferences.partnerName);
    setCurrencySymbol(preferences.currencySymbol);
    setMonthlyBudget(preferences.monthlyBudget.toString());
  }, [preferences]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onUpdatePreferences({
      meName: meName.trim() || "我",
      partnerName: partnerName.trim() || "另一半",
      currencySymbol: currencySymbol.trim() || "RM",
      monthlyBudget: parseFloat(monthlyBudget) || 1000,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <>
      {/* 1. Account Settings Card */}
      <div className="bg-white border-4 border-black rounded-3xl p-5 sm:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all relative overflow-hidden">
        {/* Neo-brutalist floating heart background label */}
        <div className="absolute top-4 right-4 text-[#FF6B6B]/10">
          <Heart className="w-16 h-16 fill-[#FF6B6B]/5" />
        </div>

        <h3 className="text-xl font-black text-[#1A1A1A] flex items-center gap-2 mb-6 pb-4 border-b-2 border-black relative z-10">
          <Settings className="w-5 h-5 text-[#FF6B6B]" />
          情侣账本配置 / Profile Rules
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {/* Identity Selection */}
          <div className="space-y-2 pb-4 border-b border-zinc-100">
            <label className="text-[11px] font-mono font-black text-zinc-400 block uppercase">我的浏览器角色 / Active Identity</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onUserRoleChange("user_a")}
                className={`py-3 px-3 font-black text-xs rounded-xl border-2 border-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  currentUserRole === "user_a"
                    ? "bg-amber-300 text-[#1A1A1A] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-y-[1px]"
                    : "bg-white hover:bg-zinc-50 text-zinc-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px]"
                }`}
              >
                <div className="w-3.5 h-3.5 rounded-full bg-amber-300 border border-black flex items-center justify-center text-[8px] font-black">A</div>
                <span>我是：{userAName}</span>
              </button>
              <button
                type="button"
                onClick={() => onUserRoleChange("user_b")}
                className={`py-3 px-3 font-black text-xs rounded-xl border-2 border-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  currentUserRole === "user_b"
                    ? "bg-[#4D96FF] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-y-[1px]"
                    : "bg-white hover:bg-zinc-50 text-zinc-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px]"
                }`}
              >
                <div className="w-3.5 h-3.5 rounded-full bg-white border border-black flex items-center justify-center text-[8px] font-black text-black">B</div>
                <span>我是：{userBName}</span>
              </button>
            </div>
            <p className="text-[10px] text-zinc-400 font-bold leading-normal">
              💡 情侣二人在各自手机/浏览器上分别选择不同的角色，即可使账本数据“我”与“对方”正确对称。
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-black text-zinc-400 block uppercase">我的昵称</label>
              <input
                type="text"
                required
                value={meName}
                onChange={(e) => setMeName(e.target.value)}
                placeholder="我"
                className="w-full bg-[#FDFCFB] border-2 border-black rounded-xl px-3 py-2.5 text-sm font-bold text-[#1A1A1A] focus:outline-none focus:border-zinc-950 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-black text-zinc-400 block uppercase">Ta的昵称</label>
              <input
                type="text"
                required
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="另一半"
                className="w-full bg-[#FDFCFB] border-2 border-black rounded-xl px-3 py-2.5 text-sm font-bold text-[#1A1A1A] focus:outline-none focus:border-zinc-950 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-black text-zinc-400 block uppercase">使用货币符</label>
              <input
                type="text"
                required
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                placeholder="RM"
                className="w-full bg-[#FDFCFB] border-2 border-black rounded-xl px-3 py-2.5 text-sm font-bold text-[#1A1A1A] focus:outline-none focus:border-zinc-950 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-black text-zinc-400 block uppercase">共同月预算</label>
              <input
                type="number"
                required
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
                placeholder="2000"
                className="w-full bg-[#FDFCFB] border-2 border-black rounded-xl px-3 py-2.5 text-sm font-mono font-bold text-[#1A1A1A] focus:outline-none focus:border-zinc-950 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-3.5 rounded-xl text-xs font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer flex items-center justify-center gap-1.5 transition-all border-2 border-black active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.5)] ${
              isSaved
                ? "bg-emerald-500 text-white border-black"
                : "bg-zinc-950 hover:bg-zinc-800 text-white"
            }`}
          >
            {isSaved ? <Sparkles className="w-4 h-4 text-lime-300" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? "配置更新成功！" : "保存情侣昵称与预算"}</span>
          </button>
        </form>
      </div>


    </>
  );
}
