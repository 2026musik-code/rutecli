import { ReactNode } from "react";

export interface Account {
  id: string;
  name: string;
  type: "vmess" | "vless" | "trojan" | "shadowsocks" | "json";
  address: string;
  port: number;
  status: "active" | "inactive" | "error";
  latency?: number;
  group: string;
  host?: string;
  sni?: string;
}

export interface SystemStats {
  cpuUsage: number;
  memUsage: number;
  activeInstance: string | null;
  uptime: string;
  ping: number;
  upload: number; // bytes/s
  download: number; // bytes/s
  verification?: {
    status: "unverified" | "verifying" | "success" | "failed";
    directIp: string;
    proxyIp: string;
    message: string;
  };
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error";
  message: string;
  source: string;
}
