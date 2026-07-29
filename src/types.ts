import { ReactNode } from "react";

export interface Account {
  id: string;
  name: string;
  type: "vmess" | "vless" | "trojan" | "shadowsocks";
  address: string;
  port: number;
  status: "active" | "inactive" | "error";
  latency?: number;
  group: string;
}

export interface SystemStats {
  cpuUsage: number;
  memUsage: number;
  activeInstance: string | null;
  uptime: string;
  ping: number;
  upload: number; // bytes/s
  download: number; // bytes/s
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error";
  message: string;
  source: string;
}
