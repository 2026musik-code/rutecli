import React, { useState, useEffect } from "react";
import { DashboardView } from "./components/Dashboard";
import { AccountsView } from "./components/Accounts";
import { MonitoringView } from "./components/Monitoring";
import { LogsView } from "./components/Logs";
import { Activity, Server, Settings, Terminal, Radio, Menu, X } from "lucide-react";

type Tab = "dashboard" | "accounts" | "monitoring" | "logs" | "settings";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [appState, setAppState] = useState({
    stats: { cpuUsage: 0, memUsage: 0, activeInstance: null, uptime: "0s", ping: 0, upload: 0, download: 0 },
    accounts: [],
    logs: [],
    monitoring: { bandwidth: [], latency: [] }
  });

  useEffect(() => {
    const fetchState = async () => {
      try {
        const res = await fetch("/api/state");
        const data = await res.json();
        setAppState(data);
      } catch (e) {
        console.error("Failed to fetch state", e);
      }
    };
    fetchState();
    const interval = setInterval(fetchState, 2000);
    return () => clearInterval(interval);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView stats={appState.stats} />;
      case "accounts":
        return <AccountsView accounts={appState.accounts} />;
      case "monitoring":
        return <MonitoringView monitoringData={appState.monitoring} />;
      case "logs":
        return <LogsView logs={appState.logs} />;
      case "settings":
        return (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <Settings className="w-12 h-12 mb-4 opacity-50" />
            <p>Settings configuration panel coming soon.</p>
          </div>
        );
      default:
        return <DashboardView stats={appState.stats} />;
    }
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false); // Close mobile menu on tab change
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 flex flex-col transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center space-x-3 text-blue-400">
            <Radio className="w-6 h-6 animate-pulse" />
            <span className="font-bold text-lg tracking-wide text-white">Xray Orchestrator</span>
          </div>
          <button 
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <button 
            onClick={() => handleTabChange("dashboard")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "dashboard" ? "bg-blue-600/10 text-blue-400" : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
            }`}
          >
            <Activity className="w-5 h-5" />
            <span>Dashboard</span>
          </button>
          
          <button 
            onClick={() => handleTabChange("accounts")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "accounts" ? "bg-blue-600/10 text-blue-400" : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
            }`}
          >
            <Server className="w-5 h-5" />
            <span>Instances & Accounts</span>
          </button>
          
          <button 
            onClick={() => handleTabChange("monitoring")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "monitoring" ? "bg-blue-600/10 text-blue-400" : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
            }`}
          >
            <Activity className="w-5 h-5" />
            <span>Monitoring</span>
          </button>
          
          <button 
            onClick={() => handleTabChange("logs")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "logs" ? "bg-blue-600/10 text-blue-400" : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
            }`}
          >
            <Terminal className="w-5 h-5" />
            <span>System Logs</span>
          </button>
        </nav>

        <div className="p-4 border-t border-gray-800 flex-shrink-0">
          <button 
            onClick={() => handleTabChange("settings")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "settings" ? "bg-blue-600/10 text-blue-400" : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden w-full">
        {/* Mobile Header */}
        <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center px-4 md:hidden flex-shrink-0">
          <button 
            className="flex items-center space-x-3 text-blue-400 p-2 -ml-2 rounded-lg hover:bg-gray-800 transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
            <Radio className="w-6 h-6 ml-1" />
            <span className="font-bold text-lg text-white">Xray Orchestrator</span>
          </button>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 w-full">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
