import React, { useState } from "react";
import { Account } from "../types";
import { Server, Settings, Play, Square, Trash2, Plus, Edit2, X, UploadCloud, Link as LinkIcon } from "lucide-react";

interface AccountsProps {
  accounts: Account[];
}

export const AccountsView: React.FC<AccountsProps> = ({ accounts }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [importType, setImportType] = useState<"url" | "json">("url");
  const [configName, setConfigName] = useState("");
  const [configContent, setConfigContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStart = async (id: string) => {
    await fetch(`/api/accounts/${id}/start`, { method: "POST" });
  };

  const handleStop = async (id: string) => {
    await fetch(`/api/accounts/${id}/stop`, { method: "POST" });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this config?")) {
      await fetch(`/api/accounts/${id}`, { method: "DELETE" });
    }
  };

  const handleSave = async () => {
    if (!configContent.trim()) return;
    setIsSubmitting(true);
    try {
      await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: configName, content: configContent })
      });
      setIsModalOpen(false);
      setConfigName("");
      setConfigContent("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Instance Management</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Config</span>
        </button>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-900/50 border-b border-gray-700">
              <tr>
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Latency</th>
                <th className="px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {accounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-gray-700/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${acc.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                        <Server className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-white">{acc.name}</p>
                        <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                          <p><span className="text-gray-600">Addr:</span> {acc.address}:{acc.port}</p>
                          {(acc.host || acc.sni) && (
                            <p><span className="text-gray-600">Host/SNI:</span> {acc.host || '-'} / {acc.sni || '-'}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300 capitalize">
                      {acc.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center w-fit space-x-1.5
                      ${acc.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                        acc.status === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                        'bg-gray-700 text-gray-400 border-gray-600'}
                    `}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        acc.status === 'active' ? 'bg-green-500' : 
                        acc.status === 'error' ? 'bg-red-500' : 
                        'bg-gray-500'
                      }`}></span>
                      <span className="capitalize">{acc.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm ${
                      (acc.latency || 0) < 100 ? 'text-green-400' : 
                      (acc.latency || 0) < 200 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {acc.latency ? `${acc.latency} ms` : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {acc.status !== 'active' ? (
                        <button 
                          onClick={() => handleStart(acc.id)}
                          className="p-2 hover:bg-gray-600 bg-gray-700/50 rounded-lg text-gray-300 hover:text-green-400 transition-colors" 
                          title="Start Instance"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleStop(acc.id)}
                          className="p-2 hover:bg-gray-600 bg-gray-700/50 rounded-lg text-green-400 hover:text-yellow-400 transition-colors" 
                          title="Stop Instance"
                        >
                          <Square className="w-4 h-4" />
                        </button>
                      )}
                      <button className="p-2 hover:bg-gray-600 bg-gray-700/50 rounded-lg text-gray-300 hover:text-blue-400 transition-colors" title="Edit Config">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(acc.id)}
                        className="p-2 hover:bg-gray-600 bg-gray-700/50 rounded-lg text-gray-300 hover:text-red-400 transition-colors" 
                        title="Delete Config"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">Add Xray Config</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Import Type Selector */}
              <div className="flex bg-gray-800 p-1 rounded-lg">
                <button
                  onClick={() => setImportType("url")}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    importType === "url" ? "bg-gray-700 text-white shadow-sm" : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <LinkIcon className="w-4 h-4" />
                  <span>Subscription / URL</span>
                </button>
                <button
                  onClick={() => setImportType("json")}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    importType === "json" ? "bg-gray-700 text-white shadow-sm" : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Raw JSON</span>
                </button>
              </div>

              {/* Input Area */}
              {importType === "url" ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Config Name (Optional)</label>
                    <input 
                      type="text" 
                      value={configName}
                      onChange={(e) => setConfigName(e.target.value)}
                      placeholder="e.g. SG-Premium-1"
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">vmess://, vless://, or trojan:// URL</label>
                    <textarea 
                      rows={4}
                      value={configContent}
                      onChange={(e) => setConfigContent(e.target.value)}
                      placeholder="Paste your share link or subscription URL here..."
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none"
                    ></textarea>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Paste config.json</label>
                    <textarea 
                      rows={8}
                      value={configContent}
                      onChange={(e) => setConfigContent(e.target.value)}
                      placeholder="{\n  &quot;inbounds&quot;: [...],\n  &quot;outbounds&quot;: [...]\n}"
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none font-mono text-sm"
                    ></textarea>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-800 bg-gray-900/50 flex justify-end space-x-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={isSubmitting || !configContent.trim()}
                className="px-5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg transition-colors shadow-lg shadow-blue-500/20"
              >
                {isSubmitting ? "Saving..." : "Save & Import"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
