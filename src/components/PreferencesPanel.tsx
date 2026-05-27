import { useState, useEffect, FormEvent } from "react";
import { CouplePreferences } from "../types";
import { Settings, Save, Sparkles, Heart, Cloud, RefreshCw, CheckCircle2, XCircle, LogOut } from "lucide-react";
import {
  isSupabaseConfigured,
  getSupabaseConfig,
  saveSupabaseConfig,
  clearSupabaseConfig,
  testSupabaseConnection
} from "../supabaseClient";

interface PreferencesPanelProps {
  preferences: CouplePreferences;
  onUpdatePreferences: (updated: CouplePreferences) => void;
  onSupabaseConfigChange: () => void;
}

export default function PreferencesPanel({ preferences, onUpdatePreferences, onSupabaseConfigChange }: PreferencesPanelProps) {
  const [meName, setMeName] = useState(preferences.meName);
  const [partnerName, setPartnerName] = useState(preferences.partnerName);
  const [currencySymbol, setCurrencySymbol] = useState(preferences.currencySymbol);
  const [monthlyBudget, setMonthlyBudget] = useState(preferences.monthlyBudget.toString());
  const [isSaved, setIsSaved] = useState(false);

  // Supabase states
  const [supabaseUrl, setSupabaseUrl] = useState(() => getSupabaseConfig()?.url || "");
  const [supabaseKey, setSupabaseKey] = useState(() => getSupabaseConfig()?.anonKey || "");
  const [syncStatus, setSyncStatus] = useState<"未配置" | "正在连接" | "已连接" | "连接失败">("未配置");
  const [testError, setTestError] = useState("");

  // Initialize and check status
  useEffect(() => {
    if (isSupabaseConfigured()) {
      setSyncStatus("正在连接");
      testSupabaseConnection().then(ok => {
        setSyncStatus(ok ? "已连接" : "连接失败");
      });
    } else {
      setSyncStatus("未配置");
    }
  }, []);

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

  const handleConnect = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      setTestError("请输入 Supabase URL 和 Anon Key");
      setSyncStatus("连接失败");
      return;
    }

    setSyncStatus("正在连接");
    setTestError("");

    const isConnected = await testSupabaseConnection(supabaseUrl, supabaseKey);
    if (isConnected) {
      saveSupabaseConfig(supabaseUrl, supabaseKey);
      setSyncStatus("已连接");
      onSupabaseConfigChange(); // Notify parent to start sync
    } else {
      setSyncStatus("连接失败");
      setTestError("连接失败，请检查 URL 和 Key 是否正确，且数据库表是否已创建。");
    }
  };

  const handleDisconnect = (e: React.MouseEvent) => {
    e.preventDefault();
    clearSupabaseConfig();
    setSupabaseUrl("");
    setSupabaseKey("");
    setSyncStatus("未配置");
    setTestError("");
    onSupabaseConfigChange(); // Notify parent to stop sync
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

      {/* 2. Supabase Cloud Sync Card */}
      <div className="bg-white border-4 border-black rounded-3xl p-5 sm:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all relative overflow-hidden mt-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-black">
          <h3 className="text-xl font-black text-[#1A1A1A] flex items-center gap-2">
            <Cloud className="w-5 h-5 text-[#4D96FF]" />
            Supabase 云端实时同步
          </h3>
          
          <span className={`text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-1 rounded border-2 border-black flex items-center gap-1 ${
            syncStatus === "已连接" ? "bg-emerald-100 text-emerald-800" :
            syncStatus === "正在连接" ? "bg-amber-100 text-amber-800 animate-pulse" :
            syncStatus === "连接失败" ? "bg-red-100 text-red-800" :
            "bg-zinc-150 text-zinc-700"
          }`}>
            {syncStatus === "已连接" && <CheckCircle2 className="w-3 h-3 text-emerald-800 shrink-0" />}
            {syncStatus === "正在连接" && <RefreshCw className="w-3 h-3 text-amber-850 shrink-0 animate-spin" />}
            {syncStatus === "连接失败" && <XCircle className="w-3 h-3 text-red-800 shrink-0" />}
            {syncStatus}
          </span>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-black text-zinc-400 block uppercase">Supabase URL</label>
            <input
              type="text"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://your-project.supabase.co"
              className="w-full bg-[#FDFCFB] border-2 border-black rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-[#1A1A1A] focus:outline-none focus:border-zinc-950 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-black text-zinc-400 block uppercase">Supabase Anon Key</label>
            <input
              type="password"
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full bg-[#FDFCFB] border-2 border-black rounded-xl px-3 py-2.5 text-xs font-mono font-bold text-[#1A1A1A] focus:outline-none focus:border-zinc-950 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            />
          </div>

          {testError && (
            <p className="text-xs text-red-600 font-extrabold flex items-start gap-1 bg-red-50 p-2.5 rounded-xl border border-red-200">
              <span>⚠️</span> {testError}
            </p>
          )}

          <p className="text-[10px] text-zinc-450 font-bold leading-normal">
            💡 情侣双方输入相同的 Supabase URL 和 Anon Key，即可实时在线同步同一个小账本。
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleDisconnect}
              disabled={syncStatus === "未配置"}
              className={`py-3 px-3 font-black text-xs rounded-xl border-2 border-black flex items-center justify-center gap-1 transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${
                syncStatus === "未配置"
                  ? "bg-zinc-100 text-zinc-400 border-zinc-200 shadow-none cursor-not-allowed"
                  : "bg-white hover:bg-zinc-50 text-zinc-800"
              }`}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>断开同步</span>
            </button>

            <button
              onClick={handleConnect}
              disabled={syncStatus === "正在连接"}
              className={`py-3 px-3 font-black text-xs rounded-xl border-2 border-black flex items-center justify-center gap-1 transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] bg-zinc-950 hover:bg-zinc-800 text-white ${
                syncStatus === "正在连接" ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {syncStatus === "正在连接" ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Cloud className="w-3.5 h-3.5 text-lime-400" />
              )}
              <span>测试连接并同步</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
