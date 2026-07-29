import React from "react";
import { SystemStats } from "../types";
import { Activity, Cpu, HardDrive, Clock, ArrowUpRight, ArrowDownRight, Zap, ShieldCheck, ShieldAlert, RefreshCw } from "lucide-react";

interface DashboardProps {
  stats: SystemStats;
}

const StatCard = ({ title, value, icon, subtitle, colorClass }: { title: string, value: string, icon: React.ReactNode, subtitle?: string, colorClass: string }) => (
  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-sm flex flex-col justify-between">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10`}>
        {icon}
      </div>
    </div>
    {subtitle && <p className="text-xs text-gray-500 mt-4">{subtitle}</p>}
  </div>
);

export const DashboardView: React.FC<DashboardProps> = ({ stats }) => {
  const [isVerifying, setIsVerifying] = React.useState(false);

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      await fetch("/api/verify", { method: "POST" });
    } finally {
      setTimeout(() => setIsVerifying(false), 2000);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B/s';
    const k = 1024;
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">System Overview</h1>
        <div className="flex items-center space-x-2 bg-green-900/30 text-green-400 px-3 py-1.5 rounded-full border border-green-800/50">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm font-medium">System Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Active Instance" 
          value={stats.activeInstance || "None"} 
          icon={<Zap className="w-6 h-6 text-yellow-400" />} 
          colorClass="text-yellow-400 bg-yellow-400"
          subtitle="Currently routing traffic"
        />
        <StatCard 
          title="System Uptime" 
          value={stats.uptime} 
          icon={<Clock className="w-6 h-6 text-blue-400" />} 
          colorClass="text-blue-400 bg-blue-400"
          subtitle="Orchestrator runtime"
        />
        <StatCard 
          title="Average Ping" 
          value={`${stats.ping} ms`} 
          icon={<Activity className="w-6 h-6 text-green-400" />} 
          colorClass="text-green-400 bg-green-400"
          subtitle="To active destination"
        />
        <StatCard 
          title="CPU Usage" 
          value={`${stats.cpuUsage.toFixed(1)}%`} 
          icon={<Cpu className="w-6 h-6 text-purple-400" />} 
          colorClass="text-purple-400 bg-purple-400"
          subtitle="Termux environment"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-sm flex items-center space-x-6">
          <div className="p-4 rounded-full bg-blue-500/10 border border-blue-500/20">
            <ArrowDownRight className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium">Current Download</p>
            <h3 className="text-3xl font-bold text-white mt-1">{formatBytes(stats.download)}</h3>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-sm flex items-center space-x-6">
          <div className="p-4 rounded-full bg-purple-500/10 border border-purple-500/20">
            <ArrowUpRight className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium">Current Upload</p>
            <h3 className="text-3xl font-bold text-white mt-1">{formatBytes(stats.upload)}</h3>
          </div>
        </div>
      </div>

      {/* Traffic Verification */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Verifikasi Trafik (Xray)
          </h2>
          <button 
            onClick={handleVerify}
            disabled={isVerifying || stats.verification?.status === "verifying"}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isVerifying || stats.verification?.status === "verifying" ? "animate-spin" : ""}`} />
            Cek Sekarang
          </button>
        </div>

        {stats.verification ? (
          <div className={`p-4 rounded-lg border ${stats.verification.status === "success" ? "bg-green-900/20 border-green-800/50" : stats.verification.status === "failed" ? "bg-red-900/20 border-red-800/50" : "bg-gray-800 border-gray-700"}`}>
            <div className="flex items-start gap-3">
              {stats.verification.status === "success" ? (
                <ShieldCheck className="w-6 h-6 text-green-400 mt-1" />
              ) : stats.verification.status === "failed" ? (
                <ShieldAlert className="w-6 h-6 text-red-400 mt-1" />
              ) : (
                <Activity className="w-6 h-6 text-blue-400 mt-1 animate-pulse" />
              )}
              
              <div>
                <h3 className={`font-semibold ${stats.verification.status === "success" ? "text-green-400" : stats.verification.status === "failed" ? "text-red-400" : "text-gray-300"}`}>
                  Status: {stats.verification.status.toUpperCase()}
                </h3>
                <p className="text-sm text-gray-400 mt-1">{stats.verification.message}</p>
                
                <div className="flex flex-col sm:flex-row gap-4 mt-3">
                  <div className="bg-gray-950 p-2 rounded border border-gray-800 text-xs text-gray-300">
                    <span className="text-gray-500">IP Asli (Direct):</span> <br/> 
                    <span className="font-mono text-white">{stats.verification.directIp}</span>
                  </div>
                  <div className="bg-gray-950 p-2 rounded border border-gray-800 text-xs text-gray-300">
                    <span className="text-gray-500">IP Xray (Proxy):</span> <br/> 
                    <span className="font-mono text-white">{stats.verification.proxyIp}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-400">
            Belum ada verifikasi yang dijalankan.
          </div>
        )}
      </div>

      {/* Local Connection Guide */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-sm">
        <h2 className="text-lg font-bold text-white mb-4">Cara Menggunakan Koneksi (Termux)</h2>
        <p className="text-sm text-gray-400 mb-4">
          Secara default, Termux tidak akan otomatis melewati koneksi Xray yang sedang aktif. Anda harus mengatur variabel lingkungan <code className="bg-gray-800 px-1 py-0.5 rounded text-gray-300">http_proxy</code> agar proses Termux dialihkan ke Xray.
        </p>
        <div className="bg-gray-950 p-4 rounded-lg border border-gray-800 font-mono text-sm overflow-x-auto relative group">
          <div className="text-gray-300 whitespace-pre-wrap">
            <span className="text-purple-400">export</span> http_proxy="http://127.0.0.1:10809"<br />
            <span className="text-purple-400">export</span> https_proxy="http://127.0.0.1:10809"<br />
            <span className="text-purple-400">export</span> all_proxy="socks5://127.0.0.1:10808"
          </div>
          <button 
            onClick={() => navigator.clipboard.writeText('export http_proxy="http://127.0.0.1:10809"\nexport https_proxy="http://127.0.0.1:10809"\nexport all_proxy="socks5://127.0.0.1:10808"')}
            className="absolute top-3 right-3 bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-md text-xs transition-colors border border-gray-700 opacity-0 group-hover:opacity-100"
          >
            Copy
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Paste perintah di atas di terminal Termux Anda. Untuk Android secara keseluruhan, gunakan proxy 127.0.0.1:10809 di pengaturan WiFi, atau aplikasi seperti v2rayNG/NekoBox.
        </p>
      </div>
    </div>
  );
};
