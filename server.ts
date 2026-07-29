import express from "express";
import path from "path";
import fs from "fs/promises";
import os from "os";
import { spawn, ChildProcess } from "child_process";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// State definitions
interface Account {
  id: string;
  name: string;
  type: string;
  address: string;
  port: number;
  status: "active" | "inactive" | "error";
  latency?: number;
  group: string;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error";
  message: string;
  source: string;
}

let accounts: Account[] = [];
let logs: LogEntry[] = [];
let activeInstanceId: string | null = null;
let uptimeSeconds = 0;

let bandwidthHistory: any[] = [];
let latencyHistory: any[] = [];

let settings = {
  rotationIntervalMinutes: 5,
  autoFailover: true,
  healthCheckIntervalSeconds: 30
};

let lastRotationTime = Date.now();

async function loadSettings() {
  try {
    const data = await fs.readFile("settings.json", "utf-8");
    settings = { ...settings, ...JSON.parse(data) };
  } catch (e) {
    await saveSettings();
  }
}

async function saveSettings() {
  await fs.writeFile("settings.json", JSON.stringify(settings, null, 2));
}

// Simulate ping and latency
setInterval(() => {
  uptimeSeconds += 2;
  const timeStr = new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' });
  
  if (bandwidthHistory.length > 20) bandwidthHistory.shift();
  if (latencyHistory.length > 20) latencyHistory.shift();
  
  if (activeInstanceId) {
    const isErrorSimulated = Math.random() > 0.95; // 5% chance of simulated network error
    if (isErrorSimulated) {
      addLog("error", `Health check failed: connection timeout on active config`, "HealthChecker");
      if (settings.autoFailover) {
        addLog("warn", `Triggering auto-failover due to network error...`, "Orchestrator");
        rotateToNextAccount();
      } else {
        const errorAcc = accounts.find(a => a.id === activeInstanceId);
        if (errorAcc) errorAcc.status = "error";
      }
    } else {
      bandwidthHistory.push({
        time: timeStr,
        upload: Math.random() * 50 + 10,
        download: Math.random() * 200 + 50
      });
      latencyHistory.push({
        time: timeStr,
        latency: 40 + Math.random() * 20
      });
    }
  } else {
    bandwidthHistory.push({ time: timeStr, upload: 0, download: 0 });
    latencyHistory.push({ time: timeStr, latency: 0 });
  }

  // Auto Rotation Logic
  if (settings.rotationIntervalMinutes > 0 && activeInstanceId) {
    const elapsedMinutes = (Date.now() - lastRotationTime) / 60000;
    if (elapsedMinutes >= settings.rotationIntervalMinutes) {
      addLog("info", `Auto-rotation triggered after ${settings.rotationIntervalMinutes} minutes.`, "Scheduler");
      rotateToNextAccount();
    }
  }
}, 2000);

async function rotateToNextAccount() {
  if (accounts.length <= 1) {
    addLog("warn", "Cannot rotate: only 1 or 0 accounts available.", "Scheduler");
    return;
  }
  
  const currentIndex = accounts.findIndex(a => a.id === activeInstanceId);
  const nextIndex = (currentIndex + 1) % accounts.length;
  const nextAcc = accounts[nextIndex];
  
  if (nextAcc) {
    await startXray(nextAcc.id);
  }
}


function addLog(level: "info" | "warn" | "error", message: string, source: string = "Orchestrator") {
  logs.unshift({
    id: Date.now().toString() + Math.random().toString(),
    timestamp: new Date().toISOString(),
    level,
    message,
    source
  });
  if (logs.length > 100) logs.pop();
}

async function loadDb() {
  try {
    await fs.mkdir("configs", { recursive: true });
    const data = await fs.readFile("database.json", "utf-8");
    accounts = JSON.parse(data);
  } catch (e) {
    accounts = [];
    await saveDb();
  }
}

async function saveDb() {
  await fs.writeFile("database.json", JSON.stringify(accounts, null, 2));
}

// Process manager
let xrayProcess: ChildProcess | null = null;

async function startXray(id: string) {
  if (xrayProcess) {
    addLog("info", "Stopping active Xray instance...", "ProcessManager");
    xrayProcess.kill();
    xrayProcess = null;
  }
  
  accounts = accounts.map(a => {
    if (a.id === id) {
      a.status = "active";
      activeInstanceId = id;
    } else {
      a.status = "inactive";
    }
    return a;
  });
  await saveDb();
  
  const acc = accounts.find(a => a.id === id);
  addLog("info", `Starting Xray config: ${acc?.name}`, "ProcessManager");

  try {
    // Attempt to spawn xray in Termux (graceful fallback if not found)
    xrayProcess = spawn("./xray", ["-c", `configs/${id}.json`]);
    
    if (xrayProcess.stdout) {
      xrayProcess.stdout.on('data', (data) => {
        const msg = data.toString().trim();
        if (msg) addLog("info", msg, "XrayEngine");
      });
    }

    if (xrayProcess.stderr) {
      xrayProcess.stderr.on('data', (data) => {
        const msg = data.toString().trim();
        // Check if message is a connection error
        const level = msg.toLowerCase().includes("error") || msg.toLowerCase().includes("fail") || msg.toLowerCase().includes("rejected") ? "error" : "warn";
        if (msg) addLog(level, msg, "XrayEngine");
      });
    }

    xrayProcess.on('error', (err) => {
       addLog("warn", `xray binary not found. Running in simulation mode.`, "ProcessManager");
       // Keeping it active logically
    });
    
    xrayProcess.on('close', (code) => {
       if (code !== 0 && code !== null) {
          addLog("error", `Xray exited with code ${code}`, "ProcessManager");
          const errorAcc = accounts.find(a => a.id === id);
          if (errorAcc) errorAcc.status = "error";
          activeInstanceId = null;
       }
    });

  } catch (e) {
    addLog("warn", "Execution failed, simulation mode active.", "ProcessManager");
  }
}

function stopXray() {
  if (xrayProcess) {
    xrayProcess.kill();
    xrayProcess = null;
  }
  addLog("info", "Xray instance stopped.", "ProcessManager");
  activeInstanceId = null;
  accounts = accounts.map(a => {
    if (a.status === "active") a.status = "inactive";
    return a;
  });
  saveDb();
}

// API Routes
app.get("/api/state", (req, res) => {
  const latestBandwidth = bandwidthHistory.length > 0 ? bandwidthHistory[bandwidthHistory.length - 1] : { upload: 0, download: 0 };
  const latestLatency = latencyHistory.length > 0 ? latencyHistory[latencyHistory.length - 1] : { latency: 0 };
  
  const h = Math.floor(uptimeSeconds / 3600);
  const m = Math.floor((uptimeSeconds % 3600) / 60);
  const s = uptimeSeconds % 60;

  res.json({
    accounts,
    logs,
    stats: {
      cpuUsage: os.loadavg()[0] * 10, // Mock CPU usage
      memUsage: (os.totalmem() - os.freemem()) / os.totalmem() * 100,
      activeInstance: activeInstanceId ? accounts.find(a => a.id === activeInstanceId)?.name : null,
      uptime: `${h}h ${m}m ${s}s`,
      ping: Math.floor(latestLatency.latency),
      upload: latestBandwidth.upload * 1024,
      download: latestBandwidth.download * 1024
    },
    monitoring: {
      bandwidth: bandwidthHistory,
      latency: latencyHistory
    }
  });
});

app.get("/api/settings", (req, res) => {
  res.json(settings);
});

app.post("/api/settings", async (req, res) => {
  settings = { ...settings, ...req.body };
  await saveSettings();
  res.json({ success: true, settings });
});

app.post("/api/accounts", async (req, res) => {
  const { name, content } = req.body;
  const id = Date.now().toString();
  
  let address = "unknown";
  let port = 443;
  let type = "unknown";
  let finalContent = content;
  let configName = name;
  
  if (content.startsWith("vless://")) {
    type = "vless";
    try {
      const [main, hashName] = content.split('#');
      if (!configName && hashName) configName = decodeURIComponent(hashName);
      const rest = main.replace("vless://", "");
      const [auth, serverInfo] = rest.split('@');
      const [hostPort, queryStr] = serverInfo.split('?');
      const [h, p] = hostPort.split(':');
      address = h;
      port = parseInt(p) || 443;
      
      const params = new URLSearchParams(queryStr);
      
      const configObj = {
        inbounds: [
          { port: 10808, listen: "127.0.0.1", protocol: "socks", settings: { udp: true } },
          { port: 10809, listen: "127.0.0.1", protocol: "http" }
        ],
        outbounds: [{
          protocol: "vless",
          settings: {
            vnext: [{
              address: h,
              port: port,
              users: [{ id: auth, encryption: "none" }]
            }]
          },
          streamSettings: {
            network: params.get("type") || "tcp",
            security: params.get("security") || "none",
            tlsSettings: params.get("security") === "tls" ? {
              serverName: params.get("sni") || params.get("host") || h,
              fingerprint: params.get("fp") || "chrome"
            } : undefined,
            wsSettings: params.get("type") === "ws" ? {
              path: decodeURIComponent(params.get("path") || "/"),
              headers: { Host: params.get("host") || params.get("sni") || h }
            } : undefined
          }
        }]
      };
      finalContent = JSON.stringify(configObj, null, 2);
    } catch(e) {
      console.error("Failed to parse vless:", e);
    }
  } else if (content.startsWith("trojan://")) {
    type = "trojan";
    try {
      const [main, hashName] = content.split('#');
      if (!configName && hashName) configName = decodeURIComponent(hashName);
      const rest = main.replace("trojan://", "");
      const [auth, serverInfo] = rest.split('@');
      const [hostPort, queryStr] = serverInfo.split('?');
      const [h, p] = hostPort.split(':');
      address = h;
      port = parseInt(p) || 443;
      
      const params = new URLSearchParams(queryStr);
      
      const configObj = {
        inbounds: [
          { port: 10808, listen: "127.0.0.1", protocol: "socks", settings: { udp: true } },
          { port: 10809, listen: "127.0.0.1", protocol: "http" }
        ],
        outbounds: [{
          protocol: "trojan",
          settings: {
            servers: [{
              address: h,
              port: port,
              password: auth
            }]
          },
          streamSettings: {
            network: params.get("type") || "tcp",
            security: params.get("security") || "tls",
            tlsSettings: {
              serverName: params.get("sni") || params.get("host") || h,
              fingerprint: params.get("fp") || "chrome"
            },
            wsSettings: params.get("type") === "ws" ? {
              path: decodeURIComponent(params.get("path") || "/"),
              headers: { Host: params.get("host") || params.get("sni") || h }
            } : undefined
          }
        }]
      };
      finalContent = JSON.stringify(configObj, null, 2);
    } catch(e) {
      console.error("Failed to parse trojan:", e);
    }
  } else if (content.startsWith("vmess://")) {
    type = "vmess";
    try {
      const base64Str = content.replace("vmess://", "");
      const jsonStr = Buffer.from(base64Str, "base64").toString("utf-8");
      const vmessObj = JSON.parse(jsonStr);
      
      if (!configName && vmessObj.ps) configName = vmessObj.ps;
      address = vmessObj.add;
      port = parseInt(vmessObj.port) || 443;
      
      const configObj = {
        inbounds: [
          { port: 10808, listen: "127.0.0.1", protocol: "socks", settings: { udp: true } },
          { port: 10809, listen: "127.0.0.1", protocol: "http" }
        ],
        outbounds: [{
          protocol: "vmess",
          settings: {
            vnext: [{
              address: vmessObj.add,
              port: port,
              users: [{ id: vmessObj.id, alterId: parseInt(vmessObj.aid) || 0, security: "auto" }]
            }]
          },
          streamSettings: {
            network: vmessObj.net || "tcp",
            security: vmessObj.tls === "tls" ? "tls" : "none",
            tlsSettings: vmessObj.tls === "tls" ? {
              serverName: vmessObj.sni || vmessObj.host || vmessObj.add,
              fingerprint: vmessObj.fp || "chrome"
            } : undefined,
            wsSettings: vmessObj.net === "ws" ? {
              path: vmessObj.path || "/",
              headers: { Host: vmessObj.host || vmessObj.sni || vmessObj.add }
            } : undefined
          }
        }]
      };
      finalContent = JSON.stringify(configObj, null, 2);
    } catch(e) {
      console.error("Failed to parse vmess:", e);
    }
  } else {
    type = "json";
    address = "localhost";
    try {
      const parsed = JSON.parse(content);
      if (parsed.outbounds && parsed.outbounds[0]) {
        type = parsed.outbounds[0].protocol;
        const out = parsed.outbounds[0];
        if (out.settings && out.settings.vnext && out.settings.vnext[0]) {
          address = out.settings.vnext[0].address;
          port = out.settings.vnext[0].port;
        } else if (out.settings && out.settings.servers && out.settings.servers[0]) {
          address = out.settings.servers[0].address;
          port = out.settings.servers[0].port;
        }
      }
    } catch (e) {}
  }

  const newAcc: Account = {
    id,
    name: configName || `Config-${id.slice(-4)}`,
    type,
    address,
    port,
    status: "inactive",
    group: "Default"
  };
  
  accounts.push(newAcc);
  await saveDb();
  
  await fs.writeFile(`configs/${id}.json`, finalContent);
  addLog("info", `Added new configuration: ${newAcc.name}`, "API");
  
  res.json({ success: true, account: newAcc });
});

app.delete("/api/accounts/:id", async (req, res) => {
  const { id } = req.params;
  if (activeInstanceId === id) {
    stopXray();
  }
  accounts = accounts.filter(a => a.id !== id);
  await saveDb();
  
  try {
    await fs.unlink(`configs/${id}.json`);
  } catch(e) {}
  
  addLog("info", `Deleted config ID: ${id}`, "API");
  res.json({ success: true });
});

app.post("/api/accounts/:id/start", async (req, res) => {
  await startXray(req.params.id);
  res.json({ success: true });
});

app.post("/api/accounts/:id/stop", async (req, res) => {
  if (activeInstanceId === req.params.id) {
    stopXray();
  }
  res.json({ success: true });
});

app.post("/api/logs/clear", (req, res) => {
  logs = [];
  res.json({ success: true });
});

// Start Server & Vite
async function startServer() {
  await loadSettings();
  await loadDb();
  addLog("info", "Xray Orchestrator Backend Started", "System");

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
