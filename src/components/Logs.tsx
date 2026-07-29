import React from "react";
import { LogEntry } from "../types";
import { Terminal, Download, Trash2, Search } from "lucide-react";

interface LogsProps {
  logs: LogEntry[];
}

export const LogsView: React.FC<LogsProps> = ({ logs }) => {
  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between flex-shrink-0">
        <h1 className="text-2xl font-bold text-white">System Logs</h1>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search logs..." 
              className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg pl-9 pr-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-64"
            />
          </div>
          <button className="bg-gray-800 hover:bg-gray-700 text-gray-300 p-2 rounded-lg border border-gray-700 transition-colors" title="Download Logs">
            <Download className="w-4 h-4" />
          </button>
          <button 
            onClick={async () => {
              await fetch("/api/logs/clear", { method: "POST" });
            }}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 p-2 rounded-lg border border-gray-700 transition-colors" title="Clear Logs">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-700 flex-1 overflow-hidden flex flex-col">
        <div className="p-3 border-b border-gray-800 flex items-center space-x-2 bg-gray-900 flex-shrink-0">
          <Terminal className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-mono text-gray-500">orchestrator.log</span>
        </div>
        <div className="p-4 overflow-y-auto font-mono text-sm space-y-2 flex-1">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start space-x-3 hover:bg-gray-800/50 p-1 rounded">
              <span className="text-gray-500 flex-shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
              <span className={`flex-shrink-0 w-12 ${
                log.level === 'info' ? 'text-blue-400' :
                log.level === 'warn' ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                [{log.level.toUpperCase()}]
              </span>
              <span className="text-gray-400 flex-shrink-0">[{log.source}]</span>
              <span className="text-gray-300 break-all">{log.message}</span>
            </div>
          ))}
          <div className="text-gray-600 italic">Waiting for new logs...</div>
        </div>
      </div>
    </div>
  );
};
