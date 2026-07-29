import React from "react";
import { SystemStats } from "../types";
import { Activity, Cpu, HardDrive, Clock, ArrowUpRight, ArrowDownRight, Zap } from "lucide-react";

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
    </div>
  );
};
