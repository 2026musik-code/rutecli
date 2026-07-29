import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

interface MonitoringProps {
  monitoringData: {
    bandwidth: any[];
    latency: any[];
  }
}

export const MonitoringView: React.FC<MonitoringProps> = ({ monitoringData }) => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Live Monitoring</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bandwidth Chart */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-200 mb-6">Bandwidth Usage (KB/s)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monitoringData.bandwidth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDownload" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorUpload" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                  itemStyle={{ color: '#e5e7eb' }}
                />
                <Area type="monotone" dataKey="download" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorDownload)" name="Download" />
                <Area type="monotone" dataKey="upload" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorUpload)" name="Upload" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Latency Chart */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-200 mb-6">Active Connection Latency (ms)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monitoringData.latency} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 10', 'dataMax + 10']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                />
                <Line type="monotone" dataKey="latency" stroke="#10b981" strokeWidth={2} dot={false} name="Ping" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
