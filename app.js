// Mirocódromo v9.0 - Enhanced Features
let canvas, ctx, viewCanvas, viewCtx;
let img = new Image();
let detectedHolds = [];
let selectedHolds = [];
let currentBlock = {};
let editingIndex = null;
let manualMode = false;
let lateralityMode = false;
let currentLaterality = "B"; // B = Ambas (Both), L = Izquierda (Left), R = Derecha (Right)
let searchQuery = "";
let exportBlocksCheckboxes = [];
let filterFavoritesOnly = false;

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
    document.getElementById("toggle-info-btn").addEventListener("click", toggleInfoPanel);
    document.getElementById("search-input").addEventListener("input", (e) => {
        searchQuery = e.target.value.toLowerCase();
        displayBlocks();
    });
    document.getElementById("filter-grade").addEventListener("change", displayBlocks);
    document.getElementById("filter-zone").addEventListener("change", displayBlocks);
    document.getElementById("filter-favorites-btn").addEventListener("click", toggleFavoritesFilter);
    document.getElementById("options-btn").addEventListener("click", openOptionsModal);
    document.querySelector(".modal-close").addEventListener("click", closeOptionsModal);
    document.getElementById("options-modal").addEventListener("click", (e) => {
        if(e.target.id === "options-modal") closeOptionsModal();
    });
    document.getElementById("modal-export-btn").addEventListener("click", openExportModal);
    document.getElementById("modal-import-btn").addEventListener("click", () => {
        document.getElementById("import-file").click();
    });
    document.getElementById("import-file").addEventListener("change", importData);
    document.getElementById("select-all-btn").addEventListener("click", selectAllExportBlocks);
    document.getElementById("deselect-all-btn").addEventListener("click", deselectAllExportBlocks);
    document.getElementById("confirm-export-btn").addEventListener("click", confirmExport);
    document.getElementById("cancel-export-btn").addEventListener("click", closeExportModal);
    document.getElementById("toggle-favorite-btn").addEventListener("click", toggleFavorite);
    
    // Close export modal from close button
    const exportModalCloseBtn = document.querySelector("#export-modal .modal-close");
    if(exportModalCloseBtn){
        exportModalCloseBtn.addEventListener("click", closeExportModal);
    }
    
    document.getElementById("export-modal").addEventListener("click", (e) => {
        if(e.target.id === "export-modal") closeExportModal();
    });

    document.querySelectorAll(".back-btn").forEach(b => b.addEventListener("click", goHome));
    document.getElementById("logo").addEventListener("click", goHome);

    canvas.addEventListener("click", handleCanvasClick);
    const toggleBtn = document.getElementById("toggle-manual-btn");
    if (toggleBtn) toggleBtn.addEventListener("click", toggleManualMode);
    
    const toggleLateralityBtn = document.getElementById("toggle-laterality-btn");
    if (toggleLateralityBtn) toggleLateralityBtn.addEventListener("click", toggleLateralityMode);

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
    // Mostrar botones de new-block-actions nuevamente
    const newBlockActions = document.getElementById("new-block-actions");
    if (newBlockActions) newBlockActions.classList.remove("hidden");
    // Mostrar botones de canvas nuevamente
    const canvasActions = document.getElementById("canvas-actions");
    if (canvasActions) canvasActions.classList.remove("hidden");
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
    // Ocultar botones de new-block-section cuando entramos en canvas
    const newBlockActions = document.getElementById("new-block-actions");
    if (newBlockActions) newBlockActions.classList.add("hidden");
    document.getElementById("canvas-section").style.display = "block";
    document.getElementById("home-section").style.display = "none";
    document.getElementById("new-block-section").style.display = "none";
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
    // `selectedHolds` stores normalized coordinates (0..1) and laterality.
    currentBlock.holds = selectedHolds.map(h => ({ 
        x: h.x, 
        y: h.y,
        laterality: h.laterality || "B"
    }));

    // Try to read metadata from the creation form (if present).
    const nameEl = document.getElementById("block-name");
    if (nameEl) currentBlock.name = nameEl.value;
    const gradeEl = document.getElementById("block-grade");
    if (gradeEl) currentBlock.grade = gradeEl.value;
    const zoneEl = document.getElementById("block-zone");
    if (zoneEl) currentBlock.zone = zoneEl.value;
    const notesEl = document.getElementById("block-notes");
    if (notesEl) currentBlock.notes = notesEl.value;
    
    // Inicializar favorito si es nuevo
    if(currentBlock.favorite === undefined) currentBlock.favorite = false;

    // ⚠️ ALMACENAMIENTO CRÍTICO - NO MODIFICAR LA CLAVE "blocks"
    // Esta clave es usada en todo el código. Cambiarla romperá la persistencia de datos
    // en todos los dispositivos que usen la app.
    const blocks = JSON.parse(localStorage.getItem("blocks") || "[]");
    if (editingIndex !== null) blocks[editingIndex] = currentBlock; else blocks.push(currentBlock);
    localStorage.setItem("blocks", JSON.stringify(blocks));

    // Clear temporary state so user can create another block immediately
    const input = document.getElementById("photo-input");
    if (input) input.value = "";
    img.src = "";
    selectedHolds = [];
    detectedHolds = [];

    // Show success notification
    showToast("✓ Presas guardadas correctamente");
    
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

function drawLateralityCircle(x, y, radius, laterality) {
    // Dibuja un círculo con dos mitades de diferentes grosores según laterality
    const lat = laterality || "B";
    ctx.strokeStyle = "red";
    
    if (lat === "L") {
        // Mitad izquierda gruesa, mitad derecha fina
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(x, y, radius, Math.PI / 2, Math.PI * 1.5);
        ctx.stroke();
        
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, radius, Math.PI * 1.5, Math.PI / 2);
        ctx.stroke();
    } else if (lat === "R") {
        // Mitad izquierda fina, mitad derecha gruesa
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, radius, Math.PI / 2, Math.PI * 1.5);
        ctx.stroke();
        
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(x, y, radius, Math.PI * 1.5, Math.PI / 2);
        ctx.stroke();
    } else {
        // Ambas mitades con grosor igual
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();
    }
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

    selectedHolds.forEach(h=>{
        const x = h.x * canvas.width;
        const y = h.y * canvas.height;
        const laterality = h.laterality || "B";
        
        drawLateralityCircle(x, y, 10, laterality);
    });
}

function handleCanvasClick(e){
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) * (canvas.width / r.width);
    const y = (e.clientY - r.top) * (canvas.height / r.height);
    
    if (lateralityMode) {
        // En modo lateralidad, ciclar a través de L, R, B para pieza seleccionada
        for (const h of selectedHolds) {
            const sx = (h.x <= 1 ? h.x * canvas.width : h.x);
            const sy = (h.y <= 1 ? h.y * canvas.height : h.y);
            if (Math.hypot(sx - x, sy - y) < 12) {
                const current = h.laterality || "B";
                if (current === "L") h.laterality = "R";
                else if (current === "R") h.laterality = "B";
                else h.laterality = "L";
                drawCanvas();
                return;
            }
        }
        return;
    }
    
    if (manualMode) {
        // toggle selected hold by direct click position
        const idx = selectedHolds.findIndex(s => {
            const sx = (s.x <= 1 ? s.x * canvas.width : s.x);
            const sy = (s.y <= 1 ? s.y * canvas.height : s.y);
            return Math.hypot(sx - x, sy - y) < 12;
        });
        if (idx >= 0) selectedHolds.splice(idx, 1);
        else selectedHolds.push({ x: x / canvas.width, y: y / canvas.height, laterality: currentLaterality });
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
            else selectedHolds.push({ x: h.x / canvas.width, y: h.y / canvas.height, laterality: currentLaterality });

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

function toggleLateralityMode() {
    lateralityMode = !lateralityMode;
    const btn = document.getElementById('toggle-laterality-btn');
    if (btn) {
        btn.textContent = lateralityMode ? 'Modo Lateralidad: ON' : 'Modo Lateralidad: OFF';
        btn.classList.toggle('active', lateralityMode);
    }
}

// ---------- Guardado ----------
function saveEditedBlock(){
    currentBlock.name = document.getElementById("edit-block-name").value;
    currentBlock.grade = document.getElementById("edit-block-grade").value;
    currentBlock.zone = document.getElementById("edit-block-zone").value;
    currentBlock.notes = document.getElementById("edit-block-notes").value;

    // ⚠️ ALMACENAMIENTO CRÍTICO - NO MODIFICAR LA CLAVE "blocks"
    const blocks = JSON.parse(localStorage.getItem("blocks")||"[]");
    editingIndex!==null ? blocks[editingIndex]=currentBlock : blocks.push(currentBlock);
    localStorage.setItem("blocks",JSON.stringify(blocks));
    // Limpiar estado de la creación para permitir nuevas operaciones sin refresh
    const input = document.getElementById("photo-input");
    if (input) input.value = "";
    img.src = "";
    selectedHolds = [];
    detectedHolds = [];
    
    // Show success notification
    showToast("✓ Bloque actualizado correctamente");
    
    goHome();
}

function deleteBlock(){
    if(editingIndex===null) return;
    if(!confirm("¿Seguro que quieres borrar este bloque?")) return;
    // ⚠️ ALMACENAMIENTO CRÍTICO - NO MODIFICAR LA CLAVE "blocks"
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
    
    let totalCount = 0;
    let favCount = 0;

    blocks.forEach((b,idx)=>{
        if(g&&b.grade!==g) return;
        if(z&&b.zone!==z) return;
        if(filterFavoritesOnly && !b.favorite) return;
        
        // Smart search: busca en nombre, grado y zona
        if(searchQuery) {
            const nameMatch = b.name.toLowerCase().includes(searchQuery);
            const gradeMatch = b.grade && b.grade.toLowerCase().includes(searchQuery);
            const zoneMatch = b.zone && b.zone.toLowerCase().includes(searchQuery);
            if(!nameMatch && !gradeMatch && !zoneMatch) return;
        }
        
        totalCount++;
        if(b.favorite) favCount++;

        const card=document.createElement("div");
        card.className="block-card";
        if(b.favorite) card.classList.add("favorite");
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
    
    // Actualizar estadísticas
    updateStats();
}

function updateStats(){
    const blocks=JSON.parse(localStorage.getItem("blocks")||"[]");
    const totalBlocks = blocks.length;
    const favoriteCount = blocks.filter(b => b.favorite).length;
    // Update stats only if the elements exist (prevents errors on pages without these elements)
    const statTotalEl = document.getElementById("stat-total");
    const statFavoritesEl = document.getElementById("stat-favorites");
    if (statTotalEl) statTotalEl.textContent = totalBlocks;
    if (statFavoritesEl) statFavoritesEl.textContent = favoriteCount;
}

function showViewBlockSection(){
    hideCreateButton();
    document.querySelectorAll("section").forEach(s=>s.style.display="none");
    document.getElementById("view-block-section").style.display="block";
    
    // Rellena la información del bloque
    document.getElementById("view-block-name").textContent = currentBlock.name || "Sin nombre";
    document.getElementById("view-block-grade").textContent = currentBlock.grade || "-";
    document.getElementById("view-block-zone").textContent = currentBlock.zone || "-";
    document.getElementById("view-block-notes").textContent = currentBlock.notes || "Sin notas";
    
    // Actualiza el botón de favorito
    const favBtn = document.getElementById("toggle-favorite-btn");
    if(currentBlock.favorite){
        favBtn.classList.add("active");
        favBtn.textContent = "★ Quitar Favorito";
    } else {
        favBtn.classList.remove("active");
        favBtn.textContent = "☆ Marcar Favorito";
    }
    
    // Cierra el panel de información
    const infoPanel = document.getElementById("view-block-info");
    infoPanel.classList.remove("expanded");
    infoPanel.classList.add("collapsed");
    
    drawViewBlock();
}

function drawViewLateralityCircle(x, y, radius, laterality) {
    // Dibuja un círculo con dos mitades de diferentes grosores según laterality
    const lat = laterality || "B";
    viewCtx.strokeStyle = "red";
    
    if (lat === "L") {
        // Mitad izquierda gruesa, mitad derecha fina
        viewCtx.lineWidth = 5;
        viewCtx.beginPath();
        viewCtx.arc(x, y, radius, Math.PI / 2, Math.PI * 1.5);
        viewCtx.stroke();
        
        viewCtx.lineWidth = 2;
        viewCtx.beginPath();
        viewCtx.arc(x, y, radius, Math.PI * 1.5, Math.PI / 2);
        viewCtx.stroke();
    } else if (lat === "R") {
        // Mitad izquierda fina, mitad derecha gruesa
        viewCtx.lineWidth = 2;
        viewCtx.beginPath();
        viewCtx.arc(x, y, radius, Math.PI / 2, Math.PI * 1.5);
        viewCtx.stroke();
        
        viewCtx.lineWidth = 5;
        viewCtx.beginPath();
        viewCtx.arc(x, y, radius, Math.PI * 1.5, Math.PI / 2);
        viewCtx.stroke();
    } else {
        // Ambas mitades con grosor igual
        viewCtx.lineWidth = 3;
        viewCtx.beginPath();
        viewCtx.arc(x, y, radius, 0, Math.PI * 2);
        viewCtx.stroke();
    }
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

        currentBlock.holds.forEach(h=>{
            const x = h.x * viewCanvas.width;
            const y = h.y * viewCanvas.height;
            const laterality = h.laterality || "B";
            
            drawViewLateralityCircle(x, y, 10, laterality);
        });
        
        // Make canvas clickable to zoom
        viewCanvas.style.cursor = "pointer";
        viewCanvas.onclick = () => openImageZoom(currentBlock.imgSrcOriginal);
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

function toggleInfoPanel(){
    const infoPanel = document.getElementById("view-block-info");
    const toggleBtn = document.getElementById("toggle-info-btn");
    
    if(infoPanel.classList.contains("collapsed")){
        infoPanel.classList.remove("collapsed");
        infoPanel.classList.add("expanded");
        toggleBtn.textContent = "Ocultar Información";
    } else {
        infoPanel.classList.remove("expanded");
        infoPanel.classList.add("collapsed");
        toggleBtn.textContent = "Ver Información";
    }
}

// ---------- Nuevas Funcionalidades ----------

function openOptionsModal(){
    document.getElementById("options-modal").classList.remove("hidden");
    updateModalStats();
}

function closeOptionsModal(){
    document.getElementById("options-modal").classList.add("hidden");
}

function updateModalStats(){
    const blocks = JSON.parse(localStorage.getItem("blocks")||"[]");
    const totalBlocks = blocks.length;
    const favoriteCount = blocks.filter(b => b.favorite).length;
    
    document.getElementById("modal-stat-total").textContent = totalBlocks;
    document.getElementById("modal-stat-favorites").textContent = favoriteCount;
}

function toggleFavorite(){
    if(editingIndex === null) return;
    // ⚠️ ALMACENAMIENTO CRÍTICO - NO MODIFICAR LA CLAVE "blocks"
    const blocks = JSON.parse(localStorage.getItem("blocks")||"[]");
    blocks[editingIndex].favorite = !blocks[editingIndex].favorite;
    localStorage.setItem("blocks", JSON.stringify(blocks));
    currentBlock.favorite = blocks[editingIndex].favorite;
    
    const favBtn = document.getElementById("toggle-favorite-btn");
    if(currentBlock.favorite){
        favBtn.classList.add("active");
        favBtn.textContent = "★ Quitar Favorito";
    } else {
        favBtn.classList.remove("active");
        favBtn.textContent = "☆ Marcar Favorito";
    }
    goHome();
}

function openExportModal(){
    const blocks = JSON.parse(localStorage.getItem("blocks")||"[]");
    const blocksList = document.getElementById("export-blocks-list");
    blocksList.innerHTML = "";
    exportBlocksCheckboxes = [];
    
    blocks.forEach((block, idx) => {
        const item = document.createElement("div");
        item.className = "export-block-item";
        
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = "export-check-" + idx;
        checkbox.value = idx;
        checkbox.checked = true;
        
        const info = document.createElement("div");
        info.className = "export-block-info";
        
        const name = document.createElement("div");
        name.className = "export-block-name";
        name.textContent = block.name || "Sin nombre";
        
        const meta = document.createElement("div");
        meta.className = "export-block-meta";
        meta.textContent = (block.grade || "-") + " • " + (block.zone || "-");
        
        info.appendChild(name);
        info.appendChild(meta);
        
        item.appendChild(checkbox);
        item.appendChild(info);
        blocksList.appendChild(item);
        
        exportBlocksCheckboxes.push(checkbox);
    });
    
    document.getElementById("options-modal").classList.add("hidden");
    document.getElementById("export-modal").classList.remove("hidden");
}

function closeExportModal(){
    document.getElementById("export-modal").classList.add("hidden");
}

function selectAllExportBlocks(){
    exportBlocksCheckboxes.forEach(cb => cb.checked = true);
}

function deselectAllExportBlocks(){
    exportBlocksCheckboxes.forEach(cb => cb.checked = false);
}

function confirmExport(){
    const selectedIndices = exportBlocksCheckboxes
        .map((cb, idx) => cb.checked ? parseInt(cb.value) : null)
        .filter(idx => idx !== null);
    
    if(selectedIndices.length === 0){
        alert("Por favor selecciona al menos un bloque para exportar");
        return;
    }
    
    // ⚠️ ALMACENAMIENTO CRÍTICO - NO MODIFICAR LA CLAVE "blocks"
    const allBlocks = JSON.parse(localStorage.getItem("blocks")||"[]");
    const selectedBlocks = selectedIndices.map(idx => allBlocks[idx]);
    
    const dataStr = JSON.stringify(selectedBlocks, null, 2);
    const dataBlob = new Blob([dataStr], {type: "application/json"});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    const timestamp = new Date().toISOString().split('T')[0];
    const blockCount = selectedBlocks.length;
    link.download = `app-bloque-bloques(${blockCount})-${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    closeExportModal();
    alert("Se han exportado " + blockCount + " vías correctamente. Puedes compartir este archivo con tus amigos.");
}

function importData(event){
    const file = event.target.files[0];
    if(!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const importedBlocks = JSON.parse(e.target.result);
            if(!Array.isArray(importedBlocks)){
                alert("Formato de archivo inválido");
                return;
            }
            
            // ⚠️ ALMACENAMIENTO CRÍTICO - NO MODIFICAR LA CLAVE "blocks"
            // Los bloques importados se FUSIONAN con los existentes (no reemplazan)
            const currentBlocks = JSON.parse(localStorage.getItem("blocks")||"[]");
            const mergedBlocks = [...currentBlocks, ...importedBlocks];
            localStorage.setItem("blocks", JSON.stringify(mergedBlocks));
            
            alert("Se han importado " + importedBlocks.length + " bloques correctamente. Total de bloques: " + mergedBlocks.length);
            closeOptionsModal();
            location.reload();
        } catch(err) {
            alert("Error al leer el archivo: " + err.message);
        }
    };
    reader.readAsText(file);
}

// ---------- Zoom Image Functions ----------
function openImageZoom(imageSrc) {
    const modal = document.getElementById("image-zoom-modal");
    const img = document.getElementById("zoom-image");
    if (!modal || !img) return;
    
    img.src = imageSrc;
    img.style.transform = "scale(1) translate(0, 0)";
    modal.classList.remove("hidden");
}

function closeImageZoom() {
    const modal = document.getElementById("image-zoom-modal");
    if (!modal) return;
    modal.classList.add("hidden");
}

// ---------- Filter Functions ----------
function toggleFavoritesFilter() {
    filterFavoritesOnly = !filterFavoritesOnly;
    const btn = document.getElementById("filter-favorites-btn");
    if (btn) {
        btn.classList.toggle("active", filterFavoritesOnly);
        btn.textContent = filterFavoritesOnly ? "★ Favoritos" : "☆ Favoritos";
    }
    displayBlocks();
}

function clearAllFilters() {
    document.getElementById("filter-grade").value = "";
    document.getElementById("filter-zone").value = "";
    document.getElementById("search-input").value = "";
    filterFavoritesOnly = false;
    
    const favBtn = document.getElementById("filter-favorites-btn");
    if (favBtn) {
        favBtn.classList.remove("active");
        favBtn.textContent = "☆ Favoritos";
    }
    
    searchQuery = "";
    displayBlocks();
    showToast("Filtros limpiados");
}

// ---------- Toast Notification ----------
function showToast(message) {
    const toast = document.getElementById("toast-notification");
    if (!toast) return;
    
    toast.textContent = message;
    toast.classList.remove("hidden");
    
    setTimeout(() => {
        toast.classList.add("hidden");
    }, 3000);
}

document.addEventListener("DOMContentLoaded", () => {
    const closeBtn = document.getElementById("close-zoom-btn");
    const zoomModal = document.getElementById("image-zoom-modal");
    const zoomImg = document.getElementById("zoom-image");
    
    if (closeBtn) {
        closeBtn.addEventListener("click", closeImageZoom);
    }
    
    if (zoomModal) {
        zoomModal.addEventListener("click", (e) => {
            if (e.target === zoomModal) closeImageZoom();
        });
    }
    
    if (zoomImg) {
        let scale = 1;
        let panning = false;
        let pointX = 0;
        let pointY = 0;
        let start = { x: 0, y: 0 };
        
        zoomImg.addEventListener("wheel", (e) => {
            e.preventDefault();
            let xs = (e.offsetX) / scale;
            let ys = (e.offsetY) / scale;
            let delta = (e.wheelDelta > 0 || e.detail < 0) ? 1.2 : 0.8;
            scale *= delta;
            scale = Math.max(1, Math.min(scale, 5));
            pointX = xs - (e.offsetX) / scale;
            pointY = ys - (e.offsetY) / scale;
            zoomImg.style.transform = `scale(${scale}) translate(${-pointX}px, ${-pointY}px)`;
        }, { passive: false });
        
        zoomImg.addEventListener("mousedown", (e) => {
            if (scale <= 1) return;
            e.preventDefault();
            start = { x: e.clientX - pointX, y: e.clientY - pointY };
            panning = true;
        });
        
        zoomImg.addEventListener("mousemove", (e) => {
            if (!panning || scale <= 1) return;
            e.preventDefault();
            pointX = e.clientX - start.x;
            pointY = e.clientY - start.y;
            zoomImg.style.transform = `scale(${scale}) translate(${-pointX}px, ${-pointY}px)`;
        });
        
        zoomImg.addEventListener("mouseup", () => {
            panning = false;
        });
        
        zoomImg.addEventListener("mouseleave", () => {
            panning = false;
        });
    }
}, { once: true });
