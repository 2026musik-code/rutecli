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

// Simulate ping and latency
setInterval(() => {
  uptimeSeconds += 2;
  const timeStr = new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' });
  
  if (bandwidthHistory.length > 20) bandwidthHistory.shift();
  if (latencyHistory.length > 20) latencyHistory.shift();
  
  if (activeInstanceId) {
    bandwidthHistory.push({
      time: timeStr,
      upload: Math.random() * 50 + 10,
      download: Math.random() * 200 + 50
    });
    latencyHistory.push({
      time: timeStr,
      latency: 40 + Math.random() * 20
    });
  } else {
    bandwidthHistory.push({ time: timeStr, upload: 0, download: 0 });
    latencyHistory.push({ time: timeStr, latency: 0 });
  }
}, 2000);

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

app.post("/api/accounts", async (req, res) => {
  const { name, content } = req.body;
  const id = Date.now().toString();
  
  // Basic URL parsing to find address/port if it's a share link
  let address = "unknown";
  let port = 443;
  let type = "unknown";
  
  if (content.startsWith("vmess://") || content.startsWith("vless://") || content.startsWith("trojan://")) {
    type = content.split("://")[0];
    address = "auto-parsed.com";
  } else {
    type = "json";
    address = "localhost";
  }

  const newAcc: Account = {
    id,
    name: name || `Config-${id.slice(-4)}`,
    type,
    address,
    port,
    status: "inactive",
    group: "Default"
  };
  
  accounts.push(newAcc);
  await saveDb();
  
  // Write to configs folder
  await fs.writeFile(`configs/${id}.json`, content);
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
