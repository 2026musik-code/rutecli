import { SystemStats, Account, LogEntry } from "../types";

export const mockStats: SystemStats = {
  cpuUsage: 14.5,
  memUsage: 32.1,
  activeInstance: "config-sg-1",
  uptime: "4h 23m 12s",
  ping: 45,
  upload: 1024 * 45, // 45 KB/s
  download: 1024 * 1024 * 1.2, // 1.2 MB/s
};

export const mockAccounts: Account[] = [
  { id: "1", name: "config-sg-1", type: "vless", address: "sg1.example.com", port: 443, status: "active", latency: 45, group: "Singapore" },
  { id: "2", name: "config-sg-2", type: "vmess", address: "sg2.example.com", port: 443, status: "inactive", latency: 48, group: "Singapore" },
  { id: "3", name: "config-us-1", type: "trojan", address: "us1.example.com", port: 443, status: "error", latency: 250, group: "US" },
  { id: "4", name: "config-jp-1", type: "shadowsocks", address: "jp1.example.com", port: 8443, status: "inactive", latency: 90, group: "Japan" },
];

export const mockLogs: LogEntry[] = [
  { id: "1", timestamp: new Date(Date.now() - 5000).toISOString(), level: "info", message: "Starting Xray instance config-sg-1...", source: "ProcessManager" },
  { id: "2", timestamp: new Date(Date.now() - 4000).toISOString(), level: "info", message: "Xray instance config-sg-1 started on port 10001", source: "ProcessManager" },
  { id: "3", timestamp: new Date(Date.now() - 3000).toISOString(), level: "info", message: "Routing traffic to config-sg-1", source: "Orchestrator" },
  { id: "4", timestamp: new Date(Date.now() - 2000).toISOString(), level: "warn", message: "High latency detected on config-us-1 (250ms)", source: "HealthChecker" },
  { id: "5", timestamp: new Date(Date.now() - 1000).toISOString(), level: "error", message: "Failed to connect to config-us-1", source: "HealthChecker" },
];

export const mockBandwidthData = Array.from({ length: 20 }).map((_, i) => ({
  time: new Date(Date.now() - (20 - i) * 1000).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }),
  upload: Math.random() * 50 + 10,
  download: Math.random() * 200 + 50,
}));

export const mockLatencyData = Array.from({ length: 20 }).map((_, i) => ({
  time: new Date(Date.now() - (20 - i) * 1000).toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' }),
  latency: 40 + Math.random() * 20,
}));
