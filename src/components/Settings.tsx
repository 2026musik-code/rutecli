import React, { useState, useEffect } from "react";
import { Settings as SettingsIcon, Save, RefreshCw, ShieldAlert } from "lucide-react";

interface SettingsData {
  rotationIntervalMinutes: number;
  autoFailover: boolean;
  healthCheckIntervalSeconds: number;
}

export const SettingsView: React.FC = () => {
  const [settings, setSettings] = useState<SettingsData>({
    rotationIntervalMinutes: 5,
    autoFailover: true,
    healthCheckIntervalSeconds: 30
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data && data.rotationIntervalMinutes !== undefined) {
          setSettings(data);
        }
      })
      .catch(e => console.error("Failed to load settings:", e));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage("");
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      setMessage("Settings saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (e) {
      setMessage("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center space-x-3 border-b border-gray-800 pb-4">
        <SettingsIcon className="w-8 h-8 text-blue-400" />
        <h1 className="text-2xl font-bold text-white">System Settings</h1>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
        {/* Scheduler Settings */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-lg font-semibold text-gray-200">
            <RefreshCw className="w-5 h-5 text-purple-400" />
            <h2>Auto Rotation & Scheduler</h2>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Rotation Interval (Minutes)</label>
            <input 
              type="number" 
              min="1"
              value={settings.rotationIntervalMinutes}
              onChange={(e) => setSettings({...settings, rotationIntervalMinutes: parseInt(e.target.value) || 1})}
              className="w-full md:w-64 bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <p className="text-xs text-gray-500 mt-2">Automatically switch to the next active account every X minutes. Set to 0 to disable.</p>
          </div>
        </div>

        <hr className="border-gray-800" />

        {/* Health Check Settings */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-lg font-semibold text-gray-200">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <h2>Health Check & Failover</h2>
          </div>
          
          <div className="flex items-center space-x-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={settings.autoFailover}
                onChange={(e) => setSettings({...settings, autoFailover: e.target.checked})}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
            <span className="text-sm font-medium text-gray-300">Auto Failover (Switch if connection fails)</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Health Check Interval (Seconds)</label>
            <input 
              type="number" 
              min="5"
              value={settings.healthCheckIntervalSeconds}
              onChange={(e) => setSettings({...settings, healthCheckIntervalSeconds: parseInt(e.target.value) || 10})}
              className="w-full md:w-64 bg-gray-950 border border-gray-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        <div className="pt-4 flex items-center space-x-4">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving..." : "Save Settings"}</span>
          </button>
          {message && <span className="text-sm text-green-400">{message}</span>}
        </div>
      </div>
    </div>
  );
};
