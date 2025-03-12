const express = require("express");
const fs = require("fs");
const cors = require("cors");
const os = require("os");
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json({ limit: "50mb" })); // Handle large JSON payloads
app.use(cors()); // Allow cross-origin requests

const TIMETABLE_FILE = "timetable.json";
const PICTURES_FILE = "pictures.json";

// Ensure files exist
if (!fs.existsSync(TIMETABLE_FILE)) fs.writeFileSync(TIMETABLE_FILE, "{}");
if (!fs.existsSync(PICTURES_FILE)) fs.writeFileSync(PICTURES_FILE, "[]");

// --- TIMETABLE ENDPOINTS ---
// Save timetable
app.post("/timetable", (req, res) => {
    fs.writeFileSync(TIMETABLE_FILE, JSON.stringify(req.body, null, 2));
    res.json({ success: true, message: "Timetable updated" });
});

// Get timetable
app.get("/timetable", (req, res) => {
    const data = fs.readFileSync(TIMETABLE_FILE, "utf8");
    res.json(JSON.parse(data));
});

// --- PICTURES ENDPOINTS ---
// Save pictures (expects an array of base64 PNG strings)
app.post("/pictures", (req, res) => {
    if (!Array.isArray(req.body)) {
        return res.status(400).json({ success: false, message: "Expected an array" });
    }
    fs.writeFileSync(PICTURES_FILE, JSON.stringify(req.body, null, 2));
    res.json({ success: true, message: "Pictures updated" });
});

// Get pictures
app.get("/pictures", (req, res) => {
    const data = fs.readFileSync(PICTURES_FILE, "utf8");
    res.json(JSON.parse(data));
});

// Start server
app.listen(PORT, () => {
    const networkInterfaces = os.networkInterfaces();
    const localIP = Object.values(networkInterfaces)
        .flat()
        .find((iface) => iface.family === "IPv4" && !iface.internal).address;

    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Server accessible at http://${localIP}:${PORT}`);
});
