const express = require("express");
const si = require("systeminformation");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.static("public"));

app.get("/system", async (req, res) => {

    const cpu = await si.currentLoad();
    const memory = await si.mem();

    res.json({
        cpuUsage: cpu.currentLoad.toFixed(2),
        totalMemory: (memory.total / 1024 / 1024 / 1024).toFixed(2),
        usedMemory: (memory.used / 1024 / 1024 / 1024).toFixed(2)
    });

});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});