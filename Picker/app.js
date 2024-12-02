const canvas = document.getElementById('seismicCanvas');
const ctx = canvas.getContext('2d');
const minimap = document.getElementById('minimap');
const minimapCtx = minimap.getContext('2d');
const fileInput = document.getElementById('fileInput');
const colorPicker = document.getElementById('colorPicker');

let mode = 'draw'; // Modes: draw, delete, highlight, auto
let drawing = false;
let seismicData = [];
let lineData = [];
let highlightData = [];
let zoom = 1;
let offsetX = 0;
let offsetY = 0;
let autoPoints = [];

// Set mode
function setMode(newMode) {
    mode = newMode;
    if (mode === 'auto') autoPoints = [];
    // Change cursor style based on mode
    canvas.style.cursor = (mode === 'draw') ? 'crosshair' : (mode === 'delete') ? 'url(delete-cursor.png), pointer' : 'pointer';
}

// Load seismic data from JSON
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            seismicData = JSON.parse(event.target.result);
            renderSeismicData();
        };
        reader.readAsText(file);
    }
});

function renderSeismicData() {
    const rows = seismicData.length;
    const cols = seismicData[0].length;

    canvas.width = cols;
    canvas.height = rows;

    minimap.width = 150; // Fixed size for minimap
    minimap.height = (rows / cols) * 150;

    // Render main image
    drawImage(ctx, seismicData, zoom, offsetX, offsetY);

    // Render minimap
    drawImage(minimapCtx, seismicData, 1, 0, 0);
    drawMinimapViewport();
}

function drawImage(context, data, zoomFactor, xOffset, yOffset) {
    const rows = data.length;
    const cols = data[0].length;
    const imageData = context.createImageData(cols, rows);

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const value = data[y][x];
            const index = (y * cols + x) * 4;

            // Grayscale
            imageData.data[index] = value;
            imageData.data[index + 1] = value;
            imageData.data[index + 2] = value;
            imageData.data[index + 3] = 255;
        }
    }

    context.putImageData(imageData, xOffset, yOffset);
}

function drawMinimapViewport() {
    minimapCtx.strokeStyle = 'red';
    minimapCtx.lineWidth = 2;
    const viewportWidth = minimap.width / zoom;
    const viewportHeight = minimap.height / zoom;
    minimapCtx.strokeRect(
        -offsetX / seismicData[0].length * minimap.width,
        -offsetY / seismicData.length * minimap.height,
        viewportWidth,
        viewportHeight
    );
}

// Zoom and Pan
canvas.addEventListener('wheel', (e) => {
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    zoom *= zoomFactor;
    offsetX = Math.max(0, offsetX * zoomFactor);
    offsetY = Math.max(0, offsetY * zoomFactor);
    renderSeismicData();
});

canvas.addEventListener('mousedown', (e) => {
    if (mode === 'auto') {
        autoPoints.push({ x: e.offsetX, y: e.offsetY });
        if (autoPoints.length === 2) {
            ctx.strokeStyle = colorPicker.value;
            ctx.beginPath();
            ctx.moveTo(autoPoints[0].x, autoPoints[0].y);
            ctx.lineTo(autoPoints[1].x, autoPoints[1].y);
            ctx.stroke();
            autoPoints = [];
        }
    } else {
        drawing = true;
        const clickPos = { x: e.offsetX, y: e.offsetY };
        if (mode === 'delete') {
            deleteLine(clickPos);
        } else {
            lineData.push({ x: e.offsetX, y: e.offsetY, color: colorPicker.value });
        }
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (!drawing || mode !== 'draw') return;
    ctx.strokeStyle = colorPicker.value;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    lineData.push({ x: e.offsetX, y: e.offsetY, color: colorPicker.value });
});

canvas.addEventListener('mouseup', () => {
    drawing = false;
});

// Delete a line
function deleteLine(clickPos) {
    for (let i = 0; i < lineData.length; i++) {
        const line = lineData[i];
        if (Math.abs(line.x - clickPos.x) < 10 && Math.abs(line.y - clickPos.y) < 10) {
            lineData.splice(i, 1); // Delete the closest point
            break;
        }
    }
    renderSeismicData();
}

// Save data (picks)
function saveData() {
    const blob = new Blob([JSON.stringify({
        lines: lineData,
        highlights: highlightData
    })], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'picks.json';
    link.click();
}
