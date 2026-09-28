const canvas = document.getElementById("radarCanvas");
const ctx = canvas.getContext("2d");

const ESP32_IP = "192.168.29.238";

let sweepAngle = 15;
let liveAngle = 15;
let liveDistance = -1;

let detectedObjects = [];


// ============================================================
// RESIZE CANVAS
// ============================================================

function resizeCanvas() {

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}


// ============================================================
// DRAW RADAR
// ============================================================

function drawRadar() {

    const centerX = canvas.width / 2;
    const centerY = canvas.height * 0.88;

    const radius = Math.min(
        canvas.width / 2,
        canvas.height * 0.85
    );


    // Clear canvas
    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // ========================================================
    // BACKGROUND
    // ========================================================

    ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
);


    // ========================================================
    // RADAR ARCS
    // ========================================================

   ctx.strokeStyle =
    "rgba(195, 241, 236, 0.45)";

    ctx.lineWidth = 1;

    for (let i = 1; i <= 4; i++) {

        const r =
            radius * (i / 4);

        ctx.beginPath();

        ctx.arc(
            centerX,
            centerY,
            r,
            Math.PI,
            Math.PI * 2
        );

        ctx.stroke();
    }


    // ========================================================
    // RADAR BASE LINE
    // ========================================================

    ctx.beginPath();

    ctx.moveTo(
        centerX - radius,
        centerY
    );

    ctx.lineTo(
        centerX + radius,
        centerY
    );

    ctx.stroke();


    // ========================================================
    // ANGLE LINES
    // ========================================================

    const angles = [
        30,
        60,
        90,
        120,
        150
    ];

    angles.forEach(angle => {

        const rad =
            Math.PI -
            (angle * Math.PI / 180);

        const x =
            centerX +
            Math.cos(rad) * radius;

        const y =
            centerY -
            Math.sin(rad) * radius;

        ctx.beginPath();

        ctx.moveTo(
            centerX,
            centerY
        );

        ctx.lineTo(
            x,
            y
        );

        ctx.stroke();
    });


    // ========================================================
    // ANGLE LABELS
    // ========================================================

    ctx.fillStyle =
        "rgba(0, 255, 102, 0.65)";

    ctx.font = "11px Arial";

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const labelAngles = [
        0,
        30,
        60,
        90,
        120,
        150,
        180
    ];

    labelAngles.forEach(angle => {

        const rad =
            Math.PI -
            (angle * Math.PI / 180);

        const labelRadius =
            radius + 18;

        const x =
            centerX +
            Math.cos(rad) * labelRadius;

        const y =
            centerY -
            Math.sin(rad) * labelRadius;

        ctx.fillText(
            `${angle}°`,
            x,
            y
        );
    });


    // ========================================================
    // DISTANCE SCALE
    // ========================================================

    ctx.fillStyle =
        "rgba(0, 255, 102, 0.45)";

    ctx.font = "10px Arial";

    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    const distanceLabels = [
       10,
    20,
    30,
    
    ];

    distanceLabels.forEach(distance => {

        const scaleRadius =
            radius * (distance / 40);

        ctx.fillText(
            `${distance} cm`,
            centerX + 8,
            centerY - scaleRadius
        );
    });

    ctx.fillText(
        "40 cm",
        centerX + 8,
        centerY - radius
    );

// ========================================================
// SWEEP TRAIL
// ========================================================

for (let i = 1; i <= 18; i++) {

    const trailAngle =
        sweepAngle - (i * 1.5);

    if (trailAngle < 0) {
        continue;
    }

    const trailRad =
        Math.PI -
        (trailAngle * Math.PI / 180);

    const trailX =
        centerX +
        Math.cos(trailRad) * radius;

    const trailY =
        centerY -
        Math.sin(trailRad) * radius;

    const opacity =
        0.12 * (1 - i / 18);

    ctx.strokeStyle =
        `rgba(0, 255, 102, ${opacity})`;

    ctx.lineWidth = 1;

    ctx.beginPath();

    ctx.moveTo(
        centerX,
        centerY
    );

    ctx.lineTo(
        trailX,
        trailY
    );

    ctx.stroke();
}
    // ========================================================
    // LIVE SWEEP
    // ========================================================

    sweepAngle = liveAngle;

    const sweepRad =
        Math.PI -
        (sweepAngle * Math.PI / 180);

    const sweepX =
        centerX +
        Math.cos(sweepRad) * radius;

    const sweepY =
        centerY -
        Math.sin(sweepRad) * radius;


    // Glow
    ctx.shadowBlur = 25;
    ctx.shadowColor = "#00FF66";

    ctx.strokeStyle = "#00FF66";
    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.moveTo(
        centerX,
        centerY
    );

    ctx.lineTo(
        sweepX,
        sweepY
    );

    ctx.stroke();

    ctx.shadowBlur = 0;


    // ========================================================
    // CENTER POINT
    // ========================================================

    ctx.fillStyle = "#00FF66";

    ctx.beginPath();

    ctx.arc(
        centerX,
        centerY,
        4,
        0,
        Math.PI * 2
    );

    ctx.fill();


    // ========================================================
    // LIVE DETECTED OBJECT
    // ========================================================
// Detection history
detectedObjects.forEach(obj => {
obj.alpha -= 0.01;
    if (obj.distance > 0 && obj.distance <= 20) {

        const objectRad =
            Math.PI -
            (obj.angle * Math.PI / 180);

        const objectRadius =
            radius * (obj.distance / 20);

        const objectX =
            centerX +
            Math.cos(objectRad) * objectRadius;

        const objectY =
            centerY -
            Math.sin(objectRad) * objectRadius;

        ctx.save();

        ctx.globalAlpha = obj.alpha;
        ctx.fillStyle = "#00FF66";

        ctx.beginPath();
        ctx.arc(
            objectX,
            objectY,
            3,
            0,
            Math.PI * 2
        );
        ctx.fill();

        ctx.restore();
    }
});
    if (
        liveDistance > 0 &&
        liveDistance <= 20
    ) {

        const objectRad =
            Math.PI -
            (liveAngle * Math.PI / 180);

        const objectRadius =
            radius * (liveDistance / 40);

        const objectX =
            centerX +
            Math.cos(objectRad) *
            objectRadius;

        const objectY =
            centerY -
            Math.sin(objectRad) *
            objectRadius;


        ctx.save();

        ctx.shadowBlur = 40;
ctx.shadowColor = "#FF6B35";
ctx.fillStyle = "#FF6B35";
        ctx.beginPath();

        ctx.arc(
            objectX,
            objectY,
            8,
            0,
            Math.PI * 2
        );

        ctx.fill();
// Detection pulse
const pulse = 12 + Math.sin(Date.now() * 0.006) * 5;

ctx.strokeStyle =
    "rgba(255, 109, 0, 0.8)";

ctx.lineWidth = 1;

ctx.beginPath();

ctx.arc(
    objectX,
    objectY,
    pulse,
    0,
    Math.PI * 2
);

ctx.stroke();
        ctx.restore();
    }


    // ========================================================
    // CONTINUOUS ANIMATION
    // ========================================================

    requestAnimationFrame(drawRadar);
}


// ============================================================
// GET LIVE ESP32 DATA
// ============================================================

async function getRadarData() {

    try {

        const response =
            await fetch(
                `http://${ESP32_IP}/data`
            );

        const data =
            await response.text();

        const values =
            data.trim().split(",");

        const angle =
            parseFloat(values[0]);

        const distance =
            parseFloat(values[1]);


        if (
            isNaN(angle) ||
            isNaN(distance)
        ) {
            return;
        }


        // Store live values
        liveAngle = angle;
        liveDistance = distance;
if (distance > 0 && distance <= 40) {

    if (
    liveDistance > 0 &&
    liveDistance <= 40
) {
    const lastObject =
        detectedObjects[detectedObjects.length - 1];

    if (
        !lastObject ||
        Math.abs(lastObject.angle - liveAngle) >= 2
    ) {
        detectedObjects.push({
            angle: liveAngle,
            distance: liveDistance,
            alpha: 1
        });
    }

    if (detectedObjects.length > 20) {
        detectedObjects.shift();
    }
}
}

        // Update dashboard
        // Update dashboard
document.getElementById(
    "angleValue"
).textContent =
    `${angle}°`;

if (distance < 0) {
    document.getElementById(
        "distanceValue"
    ).textContent = "-- cm";
}
else {
    document.getElementById(
        "distanceValue"
    ).textContent =
        `${distance.toFixed(1)} cm`;
}
document.getElementById(
    "distanceValue"
).style.color =
    distance <= 40 ? "#FF6D00" : "#00FF66";

// ========================================================
// OBJECT DETECTION STATUS
// ========================================================

const statusElement =
    document.getElementById("radarStatus");

if (distance > 0 && distance <= 40) {

    statusElement.textContent =
        "OBJECT DETECTED";
statusElement.style.color = "#FF6B35";
}
else {

    statusElement.textContent =
        "CLEAR";
        statusElement.style.color = "#26A69A";
}
    }

    catch (error) {

        console.log(
            "ESP32 connection error:",
            error
        );
    }
}


// ============================================================
// START
// ============================================================

resizeCanvas();

drawRadar();

window.addEventListener(
    "resize",
    resizeCanvas
);

setInterval(
    getRadarData,
    100
);

getRadarData();