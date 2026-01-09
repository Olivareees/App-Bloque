// Mirocódromo v6.6 Mejorado
let canvas, ctx, viewCanvas, viewCtx;
let img = new Image();
let detectedHolds = [];
let selectedHolds = [];
let currentBlock = {};
let editingIndex = null;
let manualMode = false;

const grados = ["4","5","5+","6a","6a+","6b","6b+","6c","6c+","7a","7a+","7b","7b+"];
const ubicaciones = [
    "cueva (izquierda)", "cueva (izquierda desplome)", "cueva centro",
    "cueva (derecha)", "cueva (derecha desplome)", "techo (desplome)",
    "techo", "desplome (izquierda)", "desplome (centro)", "desplome (derecha)"
];

document.addEventListener("DOMContentLoaded", () => {
    canvas = document.getElementById("block-canvas");
    ctx = canvas.getContext("2d");
    viewCanvas = document.getElementById("view-block-canvas");
    viewCtx = viewCanvas.getContext("2d");

    document.getElementById("photo-input").addEventListener("change", handlePhotoUpload);
    document.getElementById("save-new-block").addEventListener("click", goToCanvasNewBlock);
    document.getElementById("save-canvas-block").addEventListener("click", saveCanvasHolds);
    document.getElementById("save-edit-block").addEventListener("click", saveEditedBlock);
    document.getElementById("delete-block").addEventListener("click", deleteBlock);
    document.getElementById("edit-holds-btn").addEventListener("click", editHolds);
    document.getElementById("new-block-btn").addEventListener("click", showNewBlockForm);
    document.getElementById("edit-from-view-btn").addEventListener("click", showEditBlockSection);

    document.querySelectorAll(".back-btn").forEach(b => b.addEventListener("click", goHome));
    document.getElementById("logo").addEventListener("click", goHome);
    document.getElementById("filter-grade").addEventListener("change", displayBlocks);
    document.getElementById("filter-zone").addEventListener("change", displayBlocks);

    canvas.addEventListener("click", handleCanvasClick);
    const toggleBtn = document.getElementById("toggle-manual-btn");
    if (toggleBtn) toggleBtn.addEventListener("click", toggleManualMode);

    populateGrados();
    populateUbicaciones();
    goHome();
    // Inicialmente no permitir avanzar hasta que suban una foto
    const saveNewBtn = document.getElementById("save-new-block");
    if (saveNewBtn) saveNewBtn.disabled = true;
});

// ---------- Selects ----------
function populateGrados() {
    const selects = [
        document.getElementById("filter-grade"),
        document.getElementById("block-grade"),
        document.getElementById("edit-block-grade")
    ];
    selects.forEach(sel => {
        sel.innerHTML = '<option value="">Todos los grados</option>';
        grados.forEach(g => {
            const opt = document.createElement("option");
            opt.value = g;
            opt.textContent = g;
            sel.appendChild(opt);
        });
    });
}

function populateUbicaciones() {
    const selects = [
        document.getElementById("filter-zone"),
        document.getElementById("block-zone"),
        document.getElementById("edit-block-zone")
    ];
    selects.forEach(sel => {
        sel.innerHTML = '<option value="">Todas las zonas</option>';
        ubicaciones.forEach(u => {
            const opt = document.createElement("option");
            opt.value = u;
            opt.textContent = u;
            sel.appendChild(opt);
        });
    });
}

// ---------- Navegación ----------
function goHome() {
    document.querySelectorAll("section").forEach(s => s.style.display="none");
    document.getElementById("home-section").style.display="block";
    document.getElementById("new-block-btn").style.display="inline-block";
    displayBlocks();
}

function hideCreateButton() {
    document.getElementById("new-block-btn").style.display="none";
}

function showNewBlockForm() {
    hideCreateButton();
    editingIndex = null;
    currentBlock = {};
    selectedHolds = [];
    detectedHolds = [];
    img.src = "";

    const input = document.getElementById("photo-input");
    if (input) input.value = ""; // permitir volver a subir la misma foto

    const previewEl = document.getElementById("photo-preview");
    if (previewEl) previewEl.innerHTML = "";
    const placeholder = document.getElementById("photo-placeholder");
    if (placeholder) placeholder.style.display = "flex";

    // Deshabilitar avanzar hasta que haya foto
    const saveNewBtn = document.getElementById("save-new-block");
    if (saveNewBtn) saveNewBtn.disabled = true;

    document.getElementById("new-block-section").style.display = "block";
    document.getElementById("home-section").style.display = "none";
}

function showCanvasSection() {
    hideCreateButton();
    document.getElementById("canvas-section").style.display = "block";
    document.getElementById("home-section").style.display = "none";
    document.getElementById("edit-block-section").style.display = "none";
}

// ---------- Imagen ----------
function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
        img.src = ev.target.result;

        // Mostrar miniatura y ocultar el cuadro "Foto"
        const preview = document.getElementById("photo-preview");
        preview.innerHTML = "";
        const thumb = document.createElement("img");
        thumb.src = ev.target.result;
        preview.appendChild(thumb);

        document.getElementById("photo-placeholder").style.display = "none";
        // Permitir avanzar a la selección de presas
        const saveNewBtn = document.getElementById("save-new-block");
        if (saveNewBtn) saveNewBtn.disabled = false;
    };
    reader.readAsDataURL(file);

    img.onload = () => setCanvasSize(canvas, img);
}

function setCanvasSize(canvasEl, image) {
    const maxSize = 400;
    const scale = Math.min(maxSize / image.width, maxSize / image.height, 1);
    canvasEl.width = image.width * scale;
    canvasEl.height = image.height * scale;
}

// ---------- Crear / Editar ----------
function goToCanvasNewBlock() {
    if (!img.src) return alert("Selecciona una imagen");

    currentBlock = {
        name: document.getElementById("block-name").value,
        zone: document.getElementById("block-zone").value,
        grade: document.getElementById("block-grade").value,
        notes: document.getElementById("block-notes").value,
        imgSrcOriginal: img.src,
        holds: []
    };

    showCanvasSection();
    drawCanvas();
    detectHolds();
}

function editHolds() {
    hideCreateButton();
    img.src = currentBlock.imgSrcOriginal;
    img.onload = () => {
        setCanvasSize(canvas, img);
        selectedHolds = [...(currentBlock.holds || [])];
        detectedHolds = [];
        showCanvasSection();
        drawCanvas();
        detectHolds();
    };
}

function saveCanvasHolds() {
    // `selectedHolds` stores normalized coordinates (0..1).
    currentBlock.holds = selectedHolds.map(h => ({ x: h.x, y: h.y }));

    // Try to read metadata from the creation form (if present).
    const nameEl = document.getElementById("block-name");
    if (nameEl) currentBlock.name = nameEl.value;
    const gradeEl = document.getElementById("block-grade");
    if (gradeEl) currentBlock.grade = gradeEl.value;
    const zoneEl = document.getElementById("block-zone");
    if (zoneEl) currentBlock.zone = zoneEl.value;
    const notesEl = document.getElementById("block-notes");
    if (notesEl) currentBlock.notes = notesEl.value;

    // Save to localStorage (new or edited)
    const blocks = JSON.parse(localStorage.getItem("blocks") || "[]");
    if (editingIndex !== null) blocks[editingIndex] = currentBlock; else blocks.push(currentBlock);
    localStorage.setItem("blocks", JSON.stringify(blocks));

    // Clear temporary state so user can create another block immediately
    const input = document.getElementById("photo-input");
    if (input) input.value = "";
    img.src = "";
    selectedHolds = [];
    detectedHolds = [];

    // Go back to home/grid view
    goHome();
}

// ---------- Canvas / IA ----------
function detectHolds() {
    // Improved detection on a smaller offscreen canvas for performance
    detectedHolds = [];
    const w = canvas.width, h = canvas.height;
    if (w === 0 || h === 0) return;

    const maxDetect = 200;
    const scale = Math.min(1, maxDetect / Math.max(w, h));
    const dw = Math.max(40, Math.round(w * scale));
    const dh = Math.max(40, Math.round(h * scale));

    const off = document.createElement('canvas');
    off.width = dw; off.height = dh;
    const offCtx = off.getContext('2d');
    offCtx.drawImage(img, 0, 0, dw, dh);
    const imageData = offCtx.getImageData(0, 0, dw, dh);

    // grayscale
    const gray = new Float32Array(dw * dh);
    for (let i = 0, p = 0; i < dw * dh; i++, p += 4) {
        gray[i] = 0.299 * imageData.data[p] + 0.587 * imageData.data[p + 1] + 0.114 * imageData.data[p + 2];
    }

    // blur
    const blurred = boxBlurFloat(gray, dw, dh, 1);

    // Sobel
    const mag = new Float32Array(dw * dh);
    let sum = 0;
    for (let y = 1; y < dh - 1; y++) {
        for (let x = 1; x < dw - 1; x++) {
            const i = y * dw + x;
            const tl = blurred[i - dw - 1], tc = blurred[i - dw], tr = blurred[i - dw + 1];
            const l = blurred[i - 1], r = blurred[i + 1];
            const bl = blurred[i + dw - 1], bc = blurred[i + dw], br = blurred[i + dw + 1];

            const gx = -tl - 2 * l - bl + tr + 2 * r + br;
            const gy = -tl - 2 * tc - tr + bl + 2 * bc + br;
            const v = Math.hypot(gx, gy);
            mag[i] = v;
            sum += v;
        }
    }

    const mean = sum / (dw * dh);
    let ssum = 0;
    for (let i = 0; i < dw * dh; i++) {
        const d = mag[i] - mean;
        ssum += d * d;
    }
    const std = Math.sqrt(ssum / (dw * dh));
    const threshold = Math.max(mean + std * 0.7, 12);

    const mask = new Uint8Array(dw * dh);
    for (let i = 0; i < dw * dh; i++) if (mag[i] > threshold) mask[i] = 1;

    const components = connectedComponents(mask, dw, dh);
    components.forEach(comp => {
        if (comp.length < 4) return;
        let sx = 0, sy = 0;
        comp.forEach(idx => { sx += idx % dw; sy += Math.floor(idx / dw); });
        const cx = sx / comp.length;
        const cy = sy / comp.length;
        // map to main canvas coordinates
        const mainX = cx * (w / dw);
        const mainY = cy * (h / dh);
        detectedHolds.push({ x: mainX, y: mainY });
    });

    drawCanvas();
}

function boxBlurFloat(src, w, h, radius) {
    // separable box blur, radius usually 1
    const tmp = new Float32Array(w * h);
    const out = new Float32Array(w * h);
    const r = Math.max(1, radius);

    // horizontal
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            let s = 0;
            let c = 0;
            for (let dx = -r; dx <= r; dx++) {
                const nx = Math.min(w - 1, Math.max(0, x + dx));
                s += src[y * w + nx];
                c++;
            }
            tmp[y * w + x] = s / c;
        }
    }

    // vertical
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            let s = 0;
            let c = 0;
            for (let dy = -r; dy <= r; dy++) {
                const ny = Math.min(h - 1, Math.max(0, y + dy));
                s += tmp[ny * w + x];
                c++;
            }
            out[y * w + x] = s / c;
        }
    }
    return out;
}

function connectedComponents(mask, w, h) {
    const comps = [];
    const visited = new Uint8Array(w * h);
    const stack = [];
    for (let i = 0; i < w * h; i++) {
        if (!mask[i] || visited[i]) continue;
        stack.push(i);
        visited[i] = 1;
        const pixels = [];
        while (stack.length) {
            const cur = stack.pop();
            pixels.push(cur);
            const x = cur % w, y = Math.floor(cur / w);
            const neighbors = [ [x-1,y],[x+1,y],[x,y-1],[x,y+1] ];
            for (const [nx,ny] of neighbors) {
                if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
                const ni = ny * w + nx;
                if (!visited[ni] && mask[ni]) { visited[ni] = 1; stack.push(ni); }
            }
        }
        comps.push(pixels);
    }
    return comps;
}

function drawCanvas() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(img,0,0,canvas.width,canvas.height);

    ctx.fillStyle="rgba(173,216,230,0.4)";
    detectedHolds.forEach(h=>{
        ctx.beginPath();
        ctx.arc(h.x,h.y,10,0,Math.PI*2);
        ctx.fill();
    });

    ctx.strokeStyle="red";
    ctx.lineWidth=3;
    selectedHolds.forEach(h=>{
        const x = h.x * canvas.width;
        const y = h.y * canvas.height;
        ctx.beginPath();
        ctx.arc(x,y,10,0,Math.PI*2);
        ctx.stroke();
    });
}

function handleCanvasClick(e){
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) * (canvas.width / r.width);
    const y = (e.clientY - r.top) * (canvas.height / r.height);
    if (manualMode) {
        // toggle selected hold by direct click position
        const idx = selectedHolds.findIndex(s => {
            const sx = (s.x <= 1 ? s.x * canvas.width : s.x);
            const sy = (s.y <= 1 ? s.y * canvas.height : s.y);
            return Math.hypot(sx - x, sy - y) < 12;
        });
        if (idx >= 0) selectedHolds.splice(idx, 1);
        else selectedHolds.push({ x: x / canvas.width, y: y / canvas.height });
        drawCanvas();
        return;
    }

    // Toggle selection for the detected hold closest to the click.
    for (const h of detectedHolds) {
        if (Math.hypot(h.x - x, h.y - y) < 15) {
            const idx = selectedHolds.findIndex(s => {
                const sx = (s.x <= 1 ? s.x * canvas.width : s.x);
                const sy = (s.y <= 1 ? s.y * canvas.height : s.y);
                return Math.hypot(sx - h.x, sy - h.y) < 6;
            });

            if (idx >= 0) selectedHolds.splice(idx, 1);
            else selectedHolds.push({ x: h.x / canvas.width, y: h.y / canvas.height });

            drawCanvas();
            break;
        }
    }
}

function toggleManualMode() {
    manualMode = !manualMode;
    const btn = document.getElementById('toggle-manual-btn');
    if (btn) {
        btn.textContent = manualMode ? 'Modo manual: ON' : 'Modo manual: OFF';
        btn.classList.toggle('active', manualMode);
    }
}

// ---------- Guardado ----------
function saveEditedBlock(){
    currentBlock.name = document.getElementById("edit-block-name").value;
    currentBlock.grade = document.getElementById("edit-block-grade").value;
    currentBlock.zone = document.getElementById("edit-block-zone").value;
    currentBlock.notes = document.getElementById("edit-block-notes").value;

    const blocks = JSON.parse(localStorage.getItem("blocks")||"[]");
    editingIndex!==null ? blocks[editingIndex]=currentBlock : blocks.push(currentBlock);
    localStorage.setItem("blocks",JSON.stringify(blocks));
    // Limpiar estado de la creación para permitir nuevas operaciones sin refresh
    const input = document.getElementById("photo-input");
    if (input) input.value = "";
    img.src = "";
    selectedHolds = [];
    detectedHolds = [];
    goHome();
}

function deleteBlock(){
    if(editingIndex===null) return;
    if(!confirm("¿Seguro que quieres borrar este bloque?")) return;
    const blocks=JSON.parse(localStorage.getItem("blocks")||"[]");
    blocks.splice(editingIndex,1);
    localStorage.setItem("blocks",JSON.stringify(blocks));
    goHome();
}

// ---------- Grid / Vista ----------
function displayBlocks(){
    const grid=document.getElementById("blocks-grid");
    grid.innerHTML="";
    const blocks=JSON.parse(localStorage.getItem("blocks")||"[]");
    const g=document.getElementById("filter-grade").value;
    const z=document.getElementById("filter-zone").value;

    blocks.forEach((b,idx)=>{
        if(g&&b.grade!==g) return;
        if(z&&b.zone!==z) return;

        const card=document.createElement("div");
        card.className="block-card";
        card.innerHTML=`<img src="${b.imgSrcOriginal}">
        <div class="info"><h3>${b.name||"Sin nombre"}</h3>
        <p>${b.grade||""}</p><p>${b.zone||""}</p></div>`;

        card.onclick=()=>{
            editingIndex=idx;
            currentBlock=b;
            showViewBlockSection();
        };
        grid.appendChild(card);
    });
}

function showViewBlockSection(){
    hideCreateButton();
    document.querySelectorAll("section").forEach(s=>s.style.display="none");
    document.getElementById("view-block-section").style.display="block";
    drawViewBlock();
}

function drawViewBlock(){
    const image=new Image();
    image.src=currentBlock.imgSrcOriginal;
    image.onload=()=>{
        const maxSize = 400;
        const scale = Math.min(maxSize / image.width, maxSize / image.height, 1);
        viewCanvas.width = image.width * scale;
        viewCanvas.height = image.height * scale;

        viewCtx.clearRect(0,0,viewCanvas.width,viewCanvas.height);
        viewCtx.drawImage(image,0,0,viewCanvas.width,viewCanvas.height);

        viewCtx.strokeStyle="red";
        viewCtx.lineWidth=3;
        currentBlock.holds.forEach(h=>{
            viewCtx.beginPath();
            viewCtx.arc(h.x*viewCanvas.width,h.y*viewCanvas.height,10,0,Math.PI*2);
            viewCtx.stroke();
        });
    };
}

function showEditBlockSection(){
    hideCreateButton();
    document.querySelectorAll("section").forEach(s=>s.style.display="none");
    document.getElementById("edit-block-section").style.display="block";

    document.getElementById("edit-block-name").value=currentBlock.name||"";
    document.getElementById("edit-block-grade").value=currentBlock.grade||"";
    document.getElementById("edit-block-zone").value=currentBlock.zone||"";
    document.getElementById("edit-block-notes").value=currentBlock.notes||"";
}
