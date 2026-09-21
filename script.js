/* =========================================================
   CLIMATESENSE
   IoT-Based Smart Indoor Climate Monitoring System
   DHT11 + ESP32 + ThingSpeak
   ========================================================= */


/* =========================================================
   THINGSPEAK CONFIGURATION
   ========================================================= */

// Replace this with your actual ThingSpeak Channel ID

const CHANNEL_ID = "3420267";

// If your ThingSpeak channel is PRIVATE,
// put your Read API Key here.
//
// If your channel is PUBLIC,
// leave this empty.

const READ_API_KEY = "FGZOQ4YFUVANVEFS";


/* =========================================================
   THINGSPEAK URL
   ========================================================= */

function getFeedURL() {

    let url =
        `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds.json?results=20`;

    if (READ_API_KEY.trim() !== "") {

        url +=
            `&api_key=${encodeURIComponent(READ_API_KEY.trim())}`;

    }

    return url;
}


/* =========================================================
   GLOBAL DATA
   ========================================================= */

let sensorData = [];

let temperatureChart = null;
let humidityChart = null;

let dashboardTemperatureChart = null;
let dashboardHumidityChart = null;


/* =========================================================
   PAGE NAVIGATION
   ========================================================= */

function showPage(pageId, clickedButton) {

    const pages =
        document.querySelectorAll(".page");

    pages.forEach(page => {

        page.classList.remove("active-page");

    });


    const selectedPage =
        document.getElementById(pageId);

    if (selectedPage) {

        selectedPage.classList.add("active-page");

    }


    const navItems =
        document.querySelectorAll(".nav-item");

    navItems.forEach(item => {

        item.classList.remove("active");

    });


    if (clickedButton) {

        clickedButton.classList.add("active");

    }


    updatePageTitle(pageId);

}


/* =========================================================
   PAGE TITLE
   ========================================================= */

function updatePageTitle(pageId) {

    const title =
        document.getElementById("page-title");

    const titles = {

        dashboard:
            "Climate Dashboard",

        temperature:
            "Temperature Monitoring",

        humidity:
            "Humidity Monitoring",

        history:
            "Historical Data",

        status:
            "System Status",

        about:
            "About the Project"

    };


    if (title) {

        title.textContent =
            titles[pageId] || "Climate Dashboard";

    }

}


/* =========================================================
   FORMAT TIME
   ========================================================= */

function formatTime(timestamp) {

    if (!timestamp) {

        return "--";

    }


    const date =
        new Date(timestamp);


    if (isNaN(date.getTime())) {

        return timestamp;

    }


    return date.toLocaleString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* =========================================================
   LOAD DATA FROM THINGSPEAK
   ========================================================= */

async function loadData() {

    const lastUpdate =
        document.getElementById("last-update");


    if (CHANNEL_ID === "YOUR_CHANNEL_ID") {

        showDemoData();

        if (lastUpdate) {

            lastUpdate.textContent =
                "Demo Mode";

        }

        return;

    }


    try {

        if (lastUpdate) {

            lastUpdate.textContent =
                "Loading...";

        }


        const response =
            await fetch(getFeedURL());


        if (!response.ok) {

            throw new Error(
                "ThingSpeak request failed"
            );

        }


        const data =
            await response.json();


        sensorData =
            data.feeds || [];


        if (sensorData.length === 0) {

            throw new Error(
                "No sensor data available"
            );

        }


        renderData();

        setConnectionStatus(true);


    } catch (error) {

        console.error(
            "ThingSpeak Error:",
            error
        );


        setConnectionStatus(false);


        if (lastUpdate) {

            lastUpdate.textContent =
                "Connection Error";

        }

    }

}


/* =========================================================
   DEMO DATA
   ========================================================= */

function showDemoData() {

    const now =
        Date.now();


    sensorData = [];


    for (let i = 19; i >= 0; i--) {

        const date =
            new Date(
                now - (i * 5 * 60 * 1000)
            );


        const temperature =
            25 +
            Math.sin(i / 3) * 2 +
            Math.random();


        const humidity =
            60 +
            Math.cos(i / 4) * 5 +
            Math.random() * 2;


        sensorData.push({

            created_at:
                date.toISOString(),

            field1:
                temperature.toFixed(1),

            field2:
                humidity.toFixed(1)

        });

    }


    renderData();

    setConnectionStatus(true);

}


/* =========================================================
   CONNECTION STATUS
   ========================================================= */

function setConnectionStatus(connected) {

    const status =
        document.querySelector(
            ".sidebar-bottom strong"
        );


    const statusSmall =
        document.querySelector(
            ".sidebar-bottom small"
        );


    const dot =
        document.querySelector(
            ".connection-dot"
        );


    if (connected) {

        if (status) {

            status.textContent =
                "System Online";

        }


        if (statusSmall) {

            statusSmall.textContent =
                "ThingSpeak Connected";

        }


        if (dot) {

            dot.style.background =
                "#5de19a";

        }

    } else {

        if (status) {

            status.textContent =
                "Connection Error";

        }


        if (statusSmall) {

            statusSmall.textContent =
                "ThingSpeak Offline";

        }


        if (dot) {

            dot.style.background =
                "#e15d5d";

        }

    }

}


/* =========================================================
   RENDER DATA
   ========================================================= */

function renderData() {

    if (!sensorData.length) {

        return;

    }


    const latest =
        sensorData[sensorData.length - 1];


    const temperature =
        parseFloat(latest.field1);


    const humidity =
        parseFloat(latest.field2);


    /* DASHBOARD */

    const temperatureValue =
        document.getElementById(
            "temperature-value"
        );


    const humidityValue =
        document.getElementById(
            "humidity-value"
        );


    if (temperatureValue) {

        temperatureValue.textContent =
            Number.isFinite(temperature)
                ? temperature.toFixed(1)
                : "--";

    }


    if (humidityValue) {

        humidityValue.textContent =
            Number.isFinite(humidity)
                ? humidity.toFixed(1)
                : "--";

    }


    /* TEMPERATURE PAGE */

    const temperaturePageValue =
        document.getElementById(
            "temperature-page-value"
        );


    if (temperaturePageValue) {

        temperaturePageValue.textContent =
            Number.isFinite(temperature)
                ? temperature.toFixed(1)
                : "--";

    }


    /* HUMIDITY PAGE */

    const humidityPageValue =
        document.getElementById(
            "humidity-page-value"
        );


    if (humidityPageValue) {

        humidityPageValue.textContent =
            Number.isFinite(humidity)
                ? humidity.toFixed(1)
                : "--";

    }


    /* LAST UPDATE */

    const formattedTime =
        formatTime(latest.created_at);


    const lastUpdate =
        document.getElementById(
            "last-update"
        );


    if (lastUpdate) {

        lastUpdate.textContent =
            formattedTime;

    }


    const temperatureTime =
        document.getElementById(
            "temperature-time"
        );


    const humidityTime =
        document.getElementById(
            "humidity-time"
        );


    if (temperatureTime) {

        temperatureTime.textContent =
            formattedTime;

    }


    if (humidityTime) {

        humidityTime.textContent =
            formattedTime;

    }


    /* HISTORY */

    renderHistory();


    /* CHARTS */

    drawCharts();

}


/* =========================================================
   HISTORY TABLE
   ========================================================= */

function renderHistory() {

    const table =
        document.getElementById(
            "history-table"
        );


    if (!table) {

        return;

    }


    if (!sensorData.length) {

        table.innerHTML = `
            <tr>
                <td colspan="3">
                    No data available
                </td>
            </tr>
        `;

        return;

    }


    const reversedData =
        [...sensorData].reverse();


    table.innerHTML =
        reversedData
            .map(item => {

                const temperature =
                    parseFloat(item.field1);


                const humidity =
                    parseFloat(item.field2);


                return `
                    <tr>

                        <td>
                            ${formatTime(item.created_at)}
                        </td>

                        <td>
                            ${
                                Number.isFinite(temperature)
                                    ? temperature.toFixed(1) + " °C"
                                    : "--"
                            }
                        </td>

                        <td>
                            ${
                                Number.isFinite(humidity)
                                    ? humidity.toFixed(1) + " %"
                                    : "--"
                            }
                        </td>

                    </tr>
                `;

            })
            .join("");

}


/* =========================================================
   CHART LABELS
   ========================================================= */

function getLabels() {

    return sensorData.map(item => {

        return formatTime(
            item.created_at
        );

    });

}


/* =========================================================
   TEMPERATURE VALUES
   ========================================================= */

function getTemperatureValues() {

    return sensorData.map(item => {

        const value =
            parseFloat(item.field1);


        return Number.isFinite(value)
            ? value
            : null;

    });

}


/* =========================================================
   HUMIDITY VALUES
   ========================================================= */

function getHumidityValues() {

    return sensorData.map(item => {

        const value =
            parseFloat(item.field2);


        return Number.isFinite(value)
            ? value
            : null;

    });

}


/* =========================================================
   CHART SETTINGS
   ========================================================= */

function chartOptions(yTitle) {

    return {

        responsive: true,

        maintainAspectRatio: false,

        interaction: {

            intersect: false,

            mode: "index"

        },

        plugins: {

            legend: {

                display: false

            }

        },

        scales: {

            x: {

                grid: {

                    display: false

                },

                ticks: {

                    color: "#89958f",

                    font: {

                        size: 9

                    },

                    maxTicksLimit: 7

                }

            },

            y: {

                beginAtZero: false,

                grid: {

                    color:
                        "#edf0ee"

                },

                ticks: {

                    color: "#89958f",

                    font: {

                        size: 9

                    }

                },

                title: {

                    display: true,

                    text: yTitle,

                    color: "#89958f",

                    font: {

                        size: 9

                    }

                }

            }

        }

    };

}


/* =========================================================
   CREATE CHART
   ========================================================= */

function createChart(
    canvasId,
    existingChart,
    values,
    label,
    yTitle
) {

    const canvas =
        document.getElementById(
            canvasId
        );


    if (!canvas) {

        return existingChart;

    }


    if (existingChart) {

        existingChart.destroy();

    }


    return new Chart(

        canvas,

        {

            type: "line",

            data: {

                labels:
                    getLabels(),

                datasets: [

                    {

                        label: label,

                        data: values,

                        borderColor:
                            "#176b4d",

                        backgroundColor:
                            "rgba(23,107,77,0.08)",

                        borderWidth: 2,

                        pointRadius: 2,

                        pointHoverRadius: 5,

                        fill: true,

                        tension: 0.35

                    }

                ]

            },

            options:
                chartOptions(yTitle)

        }

    );

}


/* =========================================================
   DRAW ALL CHARTS
   ========================================================= */

function drawCharts() {

    const labels =
        getLabels();


    const temperatures =
        getTemperatureValues();


    const humidities =
        getHumidityValues();


    /* DASHBOARD TEMPERATURE */

    dashboardTemperatureChart =
        createChart(

            "dashboardTemperatureChart",

            dashboardTemperatureChart,

            temperatures,

            "Temperature",

            "°C"

        );


    /* DASHBOARD HUMIDITY */

    dashboardHumidityChart =
        createChart(

            "dashboardHumidityChart",

            dashboardHumidityChart,

            humidities,

            "Humidity",

            "%"

        );


    /* TEMPERATURE PAGE */

    temperatureChart =
        createChart(

            "temperatureChart",

            temperatureChart,

            temperatures,

            "Temperature",

            "°C"

        );


    /* HUMIDITY PAGE */

    humidityChart =
        createChart(

            "humidityChart",

            humidityChart,

            humidities,

            "Humidity",

            "%"

        );

}


/* =========================================================
   DOWNLOAD CSV
   ========================================================= */

function downloadCSV() {

    if (!sensorData.length) {

        alert(
            "No data available to download."
        );

        return;

    }


    let csv =
        "Time,Temperature (°C),Humidity (%)\n";


    sensorData.forEach(item => {

        const time =
            formatTime(item.created_at);


        const temperature =
            item.field1 ?? "";


        const humidity =
            item.field2 ?? "";


        csv +=
            `"${time}",${temperature},${humidity}\n`;

    });


    const blob =
        new Blob(

            [csv],

            {
                type:
                    "text/csv;charset=utf-8;"
            }

        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href =
        url;


    link.download =
        "climatesense_data.csv";


    document.body.appendChild(link);


    link.click();


    document.body.removeChild(link);


    URL.revokeObjectURL(url);

}


/* =========================================================
   AUTO REFRESH
   ========================================================= */

// Refresh every 30 seconds

setInterval(

    loadData,

    30000

);


/* =========================================================
   INITIAL LOAD
   ========================================================= */

document.addEventListener(

    "DOMContentLoaded",

    function() {

        loadData();

    }

);