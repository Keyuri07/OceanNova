// ============================================================
// OCEANVIEW3D
// Frontend + FastAPI + Cesium
// ============================================================


// ============================================================
// 1. BASIC VARIABLES
// ============================================================
function showLoading() {
    const loading = document.getElementById("loadingSpinner");

    if (loading) {
        loading.style.display = "block";
    }
}

function hideLoading() {
    const loading = document.getElementById("loadingSpinner");

    if (loading) {
        loading.style.display = "none";
    }
}
let currentDepth = 100;
let currentTime = "2025-01-01T00:00:00";

let currentMinTemp = 0;
let currentMaxTemp = 30;

let isPlaying = false;
let animationTimer = null;
let animationSpeed = 5;

let DEPTHS = [];
let TIMES = [];

const API_BASE_URL = " https://oceannova-y07i.onrender.com";

let temperatureEntities = [];


// ============================================================
// 2. HELPER FUNCTIONS
// ============================================================



function hideLoading() {
    const loading = document.getElementById("loadingSpinner");

    if (loading) {
        loading.style.display = "none";
    }
}


function showError(message) {

    console.error("OceanView3D Error:", message);

    const errorDiv = document.getElementById("error");

    if (errorDiv) {

        errorDiv.textContent = message;
        errorDiv.style.display = "block";

        setTimeout(() => {
            errorDiv.style.display = "none";
        }, 5000);
    }
}


function updateStatus(message) {

    const status = document.getElementById("status");

    if (status) {
        status.textContent = message;
    }
}


function formatTime(timeString) {

    if (!timeString) {
        return "";
    }

    return timeString
        .replace(".000000000", "")
        .replace(".000000", "")
        .replace("T", " ");
}


// ============================================================
// 3. CESIUM SETUP
// ============================================================

Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6ImlKT3doRWh6X2tXYkIyOE8iLCJqdGkiOiIxZjA5NjVmZC0zZDUyLTQ5MjMtOTk1ZS00NTY3MDZkNmJlYjAiLCJpZCI6NTA0MTAzLCJzdWIiOiJLcnVwYWxpLTAyIiwiaXNzIjoiaHR0cHM6Ly9hcGkuY2VzaXVtLmNvbSIsImF1ZCI6IktydXBhbGktMDJfZGVmYXVsdCIsImlhdCI6MTc5MDM1NzE5NX0.zvfhSBJEWtAn3gJFmsVcOpDZGxECl9UVy6-67DTHrb8";


const viewer = new Cesium.Viewer("cesiumContainer", {

    animation: false,

    timeline: false,

    baseLayerPicker: false,

    

    geocoder: false,

    homeButton: false,

    sceneModePicker: false,

    navigationHelpButton: false,

    fullscreenButton: false
});


console.log("Cesium 3D Globe Loaded!");


// ============================================================
// 4. COLOR FUNCTION
// ============================================================

// Converts temperature into a color.
//
// Cold  → Blue
// Medium → Green / Yellow
// Hot   → Red

function temperatureToColor(temp, minTemp, maxTemp) {

    if (!Number.isFinite(temp)) {

        return Cesium.Color.TRANSPARENT;
    }


    let normalized =
        (temp - minTemp) /
        (maxTemp - minTemp);


    normalized =
        Math.max(0, Math.min(1, normalized));


    // Blue → Cyan → Green → Yellow → Red

    let r;
    let g;
    let b;


    if (normalized < 0.25) {

        const t = normalized / 0.25;

        r = 0;
        g = Math.round(80 + 150 * t);
        b = 255;

    }

    else if (normalized < 0.50) {

        const t = (normalized - 0.25) / 0.25;

        r = 0;
        g = 230;
        b = Math.round(255 - 180 * t);

    }

    else if (normalized < 0.75) {

        const t = (normalized - 0.50) / 0.25;

        r = Math.round(255 * t);
        g = 230;
        b = 0;

    }

    else {

        const t = (normalized - 0.75) / 0.25;

        r = 255;
        g = Math.round(230 - 180 * t);
        b = 0;
    }


    return Cesium.Color.fromBytes(
        r,
        g,
        b,
        180
    );
}


// ============================================================
// 5. CLEAR OLD TEMPERATURE GRID
// ============================================================

function clearTemperatureGrid() {

    temperatureEntities.forEach(entity => {

        viewer.entities.remove(entity);

    });

    temperatureEntities = [];
}


// ============================================================
// 6. DRAW TEMPERATURE GRID
// ============================================================

function drawTemperatureGrid(data) {

    clearTemperatureGrid();

    const latitudes = data.data.latitude;
    const longitudes = data.data.longitude;
    const temperatures = data.data.temperature;

    const minTemp = data.stats.min_temp;
    const maxTemp = data.stats.max_temp;

    currentMinTemp = minTemp;
    currentMaxTemp = maxTemp;

    console.log(
        "Smooth temperature layer:",
        minTemp,
        maxTemp
    );

    // ---------------------------------------------------------
    // Create high-resolution canvas
    // This interpolates the 16x16 data into a smooth heatmap.
    // ---------------------------------------------------------

    const canvas = document.createElement("canvas");

    const width = 600;
    const height = 600;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");

    const imageData = ctx.createImageData(width, height);
    const pixels = imageData.data;

    const latCount = latitudes.length;
    const lonCount = longitudes.length;

    // ---------------------------------------------------------
    // Bilinear interpolation
    // ---------------------------------------------------------

    for (let y = 0; y < height; y++) {

        // Canvas top = northern side
        const latPosition =
            ((height - 1 - y) / (height - 1)) *
            (latCount - 1);

        const lat0 = Math.floor(latPosition);
        const lat1 = Math.min(lat0 + 1, latCount - 1);

        const latWeight = latPosition - lat0;


        for (let x = 0; x < width; x++) {

            const lonPosition =
                (x / (width - 1)) *
                (lonCount - 1);

            const lon0 = Math.floor(lonPosition);
            const lon1 = Math.min(lon0 + 1, lonCount - 1);

            const lonWeight = lonPosition - lon0;


            const v00 = temperatures[lat0][lon0];
            const v01 = temperatures[lat0][lon1];
            const v10 = temperatures[lat1][lon0];
            const v11 = temperatures[lat1][lon1];


            let temperature;

            if (
                Number.isFinite(v00) &&
                Number.isFinite(v01) &&
                Number.isFinite(v10) &&
                Number.isFinite(v11)
            ) {

                // Bilinear interpolation

                const top =
                    v00 +
                    (v01 - v00) * lonWeight;

                const bottom =
                    v10 +
                    (v11 - v10) * lonWeight;

                temperature =
                    top +
                    (bottom - top) * latWeight;

            } else {

                temperature = NaN;
            }


            const pixelIndex =
                (y * width + x) * 4;


            if (!Number.isFinite(temperature)) {

                pixels[pixelIndex] = 0;
                pixels[pixelIndex + 1] = 0;
                pixels[pixelIndex + 2] = 0;
                pixels[pixelIndex + 3] = 0;

                continue;
            }


            const color =
                temperatureToColor(
                    temperature,
                    minTemp,
                    maxTemp
                );


            // Cesium Color values are 0–1

            pixels[pixelIndex] =
                Math.round(color.red * 255);

            pixels[pixelIndex + 1] =
                Math.round(color.green * 255);

            pixels[pixelIndex + 2] =
                Math.round(color.blue * 255);

            pixels[pixelIndex + 3] =
                185;
        }
    }


    ctx.putImageData(imageData, 0, 0);


    // ---------------------------------------------------------
    // Calculate geographical boundaries
    // ---------------------------------------------------------

    const south =
        latitudes[0] -
        (latitudes[1] - latitudes[0]) / 2;

    const north =
        latitudes[latCount - 1] +
        (latitudes[latCount - 1] -
            latitudes[latCount - 2]) / 2;

    const west =
        longitudes[0] -
        (longitudes[1] - longitudes[0]) / 2;

    const east =
        longitudes[lonCount - 1] +
        (longitudes[lonCount - 1] -
            longitudes[lonCount - 2]) / 2;


    // ---------------------------------------------------------
    // Put smooth canvas over the Arabian Sea
    // ---------------------------------------------------------

    const entity =
        viewer.entities.add({

            rectangle: {

                coordinates:
                    Cesium.Rectangle.fromDegrees(
                        west,
                        south,
                        east,
                        north
                    ),

                material:
                    new Cesium.ImageMaterialProperty({

                        image: canvas,

                        transparent: true
                    }),

                height: 0,

                heightReference:
                    Cesium.HeightReference.CLAMP_TO_GROUND
            },

            properties: {

                depth:
                    data.depth,

                time:
                    data.time
            }
        });


    temperatureEntities.push(entity);


    console.log(
        "Smooth temperature layer rendered."
    );
}


// ============================================================
// 7. FLY TO DATA REGION
// ============================================================

function flyToTemperatureRegion(data) {

    const latitudes =
        data.data.latitude;

    const longitudes =
        data.data.longitude;


    if (
        !latitudes ||
        !longitudes ||
        latitudes.length === 0 ||
        longitudes.length === 0
    ) {

        return;
    }


    const south =
        Math.min(...latitudes);

    const north =
        Math.max(...latitudes);

    const west =
        Math.min(...longitudes);

    const east =
        Math.max(...longitudes);


    if (
        Number.isFinite(south) &&
        Number.isFinite(north) &&
        Number.isFinite(west) &&
        Number.isFinite(east)
    ) {

        viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(
        72.5,   // longitude
        17.5,   // latitude
        3200000 // height
    ),
    orientation: {
        heading: 0,
        pitch: Cesium.Math.toRadians(-90),
        roll: 0
    },
    duration: 1.5
});
    }
}


// ============================================================
// 8. UPDATE COLORBAR
// ============================================================

function updateColorbar(data) {

    const minValue =
        document.getElementById("minValue");

    const maxValue =
        document.getElementById("maxValue");


    if (minValue) {

        minValue.textContent =
            Number(data.stats.min_temp).toFixed(1) +
            " °C";
    }


    if (maxValue) {

        maxValue.textContent =
            Number(data.stats.max_temp).toFixed(1) +
            " °C";
    }
}


// ============================================================
// 9. FETCH TEMPERATURE FROM FASTAPI
// ============================================================

async function loadTemperature(
    depth,
    time
) {

    showLoading();


    try {

        const url =
            `${API_BASE_URL}/api/temperature` +
            `?depth=${encodeURIComponent(depth)}` +
            `&time=${encodeURIComponent(time)}`;


        console.log(
            "Fetching:",
            url
        );


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                `API returned HTTP ${response.status}`
            );
        }


        const data =
            await response.json();


        console.log(
            "API response received:",
            data
        );


        // Draw new temperature grid

        drawTemperatureGrid(data);
        
        // Fly camera to temperature region

        flyToTemperatureRegion(data);

        // Update colorbar

        updateColorbar(data);


        // Update current values

        currentDepth =
            data.depth;

        currentTime =
            data.time;


        // Update UI

        const depthValue =
            document.getElementById("depthValue");


        const timeValue =
            document.getElementById("timeValue");


        if (depthValue) {

            depthValue.textContent =
                Number(data.depth) +
                " m";
        }


        if (timeValue) {

            timeValue.textContent =
                formatTime(data.time);
        }


        updateStatus(
            `Depth: ${data.depth} m | ` +
            `Time: ${formatTime(data.time)}`
        );


    }

    catch (error) {

        console.error(
            "Temperature API error:",
            error
        );


        showError(
            "Could not load ocean temperature data. " +
            "Make sure FastAPI is running."
        );
    }

    finally {

        hideLoading();
    }
}


// ============================================================
// 10. LOAD AVAILABLE DEPTHS
// ============================================================

async function loadAvailableDepths() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/available_depths`
            );


        if (!response.ok) {

            throw new Error(
                `Depth API HTTP ${response.status}`
            );
        }


        const result =
            await response.json();


        DEPTHS =
            result.depths;


        console.log(
            "Available depths:",
            DEPTHS
        );


        const depthSlider =
            document.getElementById(
                "depthSlider"
            );


        if (
            depthSlider &&
            DEPTHS.length > 0
        ) {

            depthSlider.min = 0;

            depthSlider.max =
                DEPTHS.length - 1;

            depthSlider.step = 1;


            // Default = 100 m

            let defaultIndex =
                DEPTHS.indexOf(100);


            if (defaultIndex === -1) {

                defaultIndex = 0;
            }


            depthSlider.value =
                defaultIndex;


            currentDepth =
                DEPTHS[defaultIndex];


            const depthValue =
                document.getElementById(
                    "depthValue"
                );


            if (depthValue) {

                depthValue.textContent =
                    currentDepth +
                    " m";
            }
        }

    }

    catch (error) {

        console.error(
            "Depth loading error:",
            error
        );


        showError(
            "Could not load ocean depths."
        );
    }
}


// ============================================================
// 11. LOAD AVAILABLE TIMES
// ============================================================

async function loadAvailableTimes() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/api/available_times`
            );


        if (!response.ok) {

            throw new Error(
                `Time API HTTP ${response.status}`
            );
        }


        const result =
            await response.json();


        // Person 1's current API returns
        // sample_times.
        //
        // We use those values here.

        TIMES =
            result.sample_times || [];


        console.log(
            "Available times:",
            TIMES
        );


        const timeSlider =
            document.getElementById(
                "timeSlider"
            );


        if (
            timeSlider &&
            TIMES.length > 0
        ) {

            timeSlider.min = 0;

            timeSlider.max =
                TIMES.length - 1;

            timeSlider.step = 1;

            timeSlider.value = 0;


            currentTime =
                TIMES[0];


            const timeValue =
                document.getElementById(
                    "timeValue"
                );


            if (timeValue) {

                timeValue.textContent =
                    formatTime(
                        currentTime
                    );
            }
        }

    }

    catch (error) {

        console.error(
            "Time loading error:",
            error
        );


        showError(
            "Could not load available times."
        );
    }
}


// ============================================================
// 12. DEPTH SLIDER EVENT
// ============================================================

document
    .getElementById("depthSlider")
    .addEventListener(
        "input",
        async function(event) {

            if (DEPTHS.length === 0) {
                return;
            }


            const index =
                Number(event.target.value);


            currentDepth =
                DEPTHS[index];


            document
                .getElementById(
                    "depthValue"
                )
                .textContent =
                currentDepth + " m";


            updateStatus(
                "Loading " +
                currentDepth +
                " m temperature..."
            );


            await loadTemperature(
                currentDepth,
                currentTime
            );
        }
    );


// ============================================================
// 13. TIME SLIDER EVENT
// ============================================================

document
    .getElementById("timeSlider")
    .addEventListener(
        "input",
        async function(event) {

            if (TIMES.length === 0) {
                return;
            }


            const index =
                Number(event.target.value);


            currentTime =
                TIMES[index];


            document
                .getElementById(
                    "timeValue"
                )
                .textContent =
                formatTime(
                    currentTime
                );


            updateStatus(
                "Loading " +
                formatTime(currentTime) +
                "..."
            );


            await loadTemperature(
                currentDepth,
                currentTime
            );
        }
    );


// ============================================================
// 14. PLAY / PAUSE
// ============================================================

document
    .getElementById("playButton")
    .addEventListener(
        "click",
        function() {

            const button =
                document.getElementById(
                    "playButton"
                );


            if (isPlaying) {

                clearInterval(
                    animationTimer
                );


                isPlaying = false;


                button.textContent =
                    "▶ Play";


                updateStatus(
                    "Paused"
                );


                return;
            }


            if (TIMES.length === 0) {

                showError(
                    "Time data is not loaded."
                );

                return;
            }


            isPlaying = true;


            button.textContent =
                "❚❚ Pause";


            updateStatus(
                "Playing..."
            );


            animationTimer =
                setInterval(
                    async function() {

                        const slider =
                            document.getElementById(
                                "timeSlider"
                            );


                        let index =
                            Number(
                                slider.value
                            );


                        index =
                            (index + 1) %
                            TIMES.length;


                        slider.value =
                            index;


                        currentTime =
                            TIMES[index];


                        document
                            .getElementById(
                                "timeValue"
                            )
                            .textContent =
                            formatTime(
                                currentTime
                            );


                        await loadTemperature(
                            currentDepth,
                            currentTime
                        );

                    },
                    Math.max(200, 3000 / animationSpeed)
                );
        }
    );


// ============================================================
// 15. RESET BUTTON
// ============================================================

document
    .getElementById("resetButton")
    .addEventListener(
        "click",
        async function() {

            clearInterval(
                animationTimer
            );


            isPlaying = false;


            document
                .getElementById(
                    "playButton"
                )
                .textContent =
                "▶ Play";


            // Reset depth to 100 m

            let depthIndex =
                DEPTHS.indexOf(100);


            if (depthIndex === -1) {

                depthIndex = 0;
            }


            currentDepth =
                DEPTHS[depthIndex];


            document
                .getElementById(
                    "depthSlider"
                )
                .value =
                depthIndex;


            // Reset time

            currentTime =
                TIMES[0];


            document
                .getElementById(
                    "timeSlider"
                )
                .value =
                0;


            document
                .getElementById(
                    "depthValue"
                )
                .textContent =
                currentDepth + " m";


            document
                .getElementById(
                    "timeValue"
                )
                .textContent =
                formatTime(
                    currentTime
                );


            updateStatus(
                "Resetting..."
            );


            await loadTemperature(
                currentDepth,
                currentTime
            );
        }
    );


// ============================================================
// 16. INITIALIZE OCEAN DATA
// ============================================================

async function initializeOceanData() {

    console.log(
        "Initializing OceanView3D..."
    );


    showLoading();


    try {

        // Get real depths

        await loadAvailableDepths();


        // Get real times

        await loadAvailableTimes();


        // Make sure both APIs returned data

        if (
            DEPTHS.length === 0 ||
            TIMES.length === 0
        ) {

            throw new Error(
                "No depth or time data received."
            );
        }


        console.log(
            "Depths:",
            DEPTHS
        );


        console.log(
            "Times:",
            TIMES
        );


        // Load initial temperature

        await loadTemperature(
            currentDepth,
            currentTime
        );


        console.log(
            "OceanView3D initialization complete!"
        );


    }

    catch (error) {

        console.error(
            "Initialization failed:",
            error
        );


        showError(
            "OceanView3D could not initialize."
        );
    }


    finally {

        hideLoading();
    }
}


// ============================================================
// 17. START APPLICATION
// ============================================================

initializeOceanData();
loadArgoFloats();
// ============================================================
// ARGO FLOAT MARKERS
// ============================================================

let argoEntities = [];

async function loadArgoFloats() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/argo_floats`);
        const floats = await response.json();

        // Remove old Argo markers
        argoEntities.forEach(entity => {
            viewer.entities.remove(entity);
        });
        argoEntities = [];

        floats.forEach(f => {

            let markerColor = Cesium.Color.BLUE;

if (f.temperature >= 21 && f.temperature < 22) {
    markerColor = Cesium.Color.CYAN;
}

if (f.temperature >= 22 && f.temperature < 23) {
    markerColor = Cesium.Color.YELLOW;
}

if (f.temperature >= 23) {
    markerColor = Cesium.Color.RED;
}

const entity = viewer.entities.add({
    name: `Argo Float ${f.id}`,
    id: f.id,
    
    position: Cesium.Cartesian3.fromDegrees(f.lon, f.lat, 100000),

    point: {
    pixelSize: 16,
    color: temperatureToColor(f.temperature, 19.7, 23.1),
    outlineColor: Cesium.Color.WHITE,
    outlineWidth: 3,
    disableDepthTestDistance: Number.POSITIVE_INFINITY
},
    label: {
        text: f.id,
        font: "14px sans-serif",
        showBackground: true,
        pixelOffset: new Cesium.Cartesian2(0, -20)
    },

    description: `
        <h3>Argo Float ${f.id}</h3>
        <p><b>Latitude:</b> ${f.lat}°</p>
        <p><b>Longitude:</b> ${f.lon}°</p>
        <p><b>Depth:</b> ${f.depth} m</p>
        <p><b>Temperature:</b> ${f.temperature} °C</p>
        <p><b>Time:</b> ${f.time}</p>
    `
});

argoEntities.push(entity);

            argoEntities.push(entity);
        });

        console.log("Argo floats loaded:", floats.length);

    } catch (error) {
        console.error("Error loading Argo floats:", error);
    }
}
document.getElementById("speedSlider").addEventListener("input", function(event) {
    animationSpeed = Number(event.target.value);

    document.getElementById("speedValue").textContent =
        animationSpeed + "x";

    console.log("Animation speed:", animationSpeed);
});