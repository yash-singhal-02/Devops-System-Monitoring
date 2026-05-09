async function getSystemData() {

    const response = await fetch("http://localhost:3000/system");

    const data = await response.json();

    document.getElementById("cpu").innerText =
        data.cpuUsage + " %";

    document.getElementById("totalMemory").innerText =
        data.totalMemory + " GB";

    document.getElementById("usedMemory").innerText =
        data.usedMemory + " GB";
}

getSystemData();

setInterval(getSystemData, 2000);