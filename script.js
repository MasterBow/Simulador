/**
 * Simulador de Interconexión LAN a WAN
 * Motor de simulación y renderizado con Pan & Zoom fluido y cinemática de curvas
 */

// 1. Estructura del Algoritmo en Pseudocódigo
const PSEUDOCODE_LINES = [
  { text: "// Algoritmo de Simulación del Funcionamiento de Interconexión LAN a WAN", comment: true },
  { text: "Inicio", phase: 0 },
  { text: "  Definir Subred_LAN_A como '192.168.10.0/24', Gateway_A como '192.168.10.1'", phase: 0 },
  { text: "  Definir Subred_LAN_B como '192.168.20.0/24', Gateway_B como '192.168.20.1'", phase: 0 },
  { text: "  Definir Enlace_WAN como segmentos IP '10.0.0.1' y '10.0.0.2'", phase: 0 },
  { text: "", comment: true },
  { text: "  // Fase 1: Inicialización física y enlace de nodos", comment: true },
  { text: "  Para cada Nodo_Final en Subred_LAN_A hacer: Establecer UTP Cat6 y TCP/IP", phase: 0 },
  { text: "  Conectar Switch_A -> Router_A; Router_A -> Router_B vía WAN", phase: 0 },
  { text: "", comment: true },
  { text: "  // Fase 2: Simulación de transmisión de paquetes extremo a extremo", comment: true },
  { text: "  Imprimir 'Generando paquete de datos en Computadora_A para Computadora_B'", phase: 1 },
  { text: "  Paquete = CrearEstructuraTCP(IP_Origen: '192.168.10.10', IP_Destino: '192.168.20.10')", phase: 1 },
  { text: "", comment: true },
  { text: "  // Fase 3: Conmutación local en Capa 2", comment: true },
  { text: "  Computadora_A transmite trama Ethernet hacia Switch_A", phase: 2 },
  { text: "  Si IP_Destino pertenece a la misma subred Entonces reenvía local", phase: 2 },
  { text: "  Sino: Switch_A canaliza trama hacia Router_A (Gateway_A)", phase: 2 },
  { text: "", comment: true },
  { text: "  // Fase 4: Enrutamiento de Capa 3 (Sede de Origen)", comment: true },
  { text: "  Router_A desencapsula trama L2 y analiza IP_Destino en tabla de rutas", phase: 3 },
  { text: "  Si ruta existe: Encapsula WAN (PPP/HDLC) y transmite hacia Router_B", phase: 3 },
  { text: "  Sino: Descartar paquete; emitir ICMP destino inalcanzable; Terminar", phase: 3, isFailLine: true },
  { text: "", comment: true },
  { text: "  // Fase 5: Tránsito por Nube WAN y Recepción en Sede Destino", comment: true },
  { text: "  Router_B desencapsula WAN; examina dirección IP de destino", phase: 4 },
  { text: "  Router_B envía trama Ethernet hacia Switch_B mediante interfaz LAN", phase: 4 },
  { text: "", comment: true },
  { text: "  // Fase 6: Entrega final en Capa 2 remota", comment: true },
  { text: "  Switch_B recibe trama; analiza dirección MAC receptora en tabla CAM", phase: 5 },
  { text: "  Switch_B transfiere trama hacia Computadora_B", phase: 5 },
  { text: "  Computadora_B procesa información recibida exitosamente", phase: 6 },
  { text: "Fin", phase: 6 }
];

// 2. Definición exhaustiva de las Fases del Algoritmo
const SIMULATION_STEPS = [
  {
    step: 0,
    title: "Fase 1: Inicialización Topológica y Enlace Físico",
    activeNode: "node-pcA",
    activeLink: null,
    pathId: null,
    packetVisible: false,
    eventText: "Fase 1: Enlaces físicos y parámetros TCP/IP inicializados. Subredes LAN A (192.168.10.0/24) y LAN B (192.168.20.0/24) operativas.",
    osi: {
      status: "Infraestructura Lista",
      l4: { src: "-", dst: "-", flag: "-" },
      l3: { src: "-", dst: "-", ttl: "-", proto: "-" },
      l2: { proto: "Capa 2 • Enlace en Reposo", src: "-", dst: "-", type: "-" }
    },
    camHighlight: null,
    routingHighlight: null
  },
  {
    step: 1,
    title: "Fase 2: Creación de Estructura TCP/IP en PC A",
    activeNode: "node-pcA",
    activeLink: "link-step-1",
    pathId: "link-step-1",
    packetVisible: true,
    eventText: "Fase 2: PC A crea segmento TCP. Al comparar la máscara /24 detecta que 192.168.20.10 es remota y resuelve enviar la trama al Gateway (192.168.10.1).",
    osi: {
      status: "Trama Encapsulada en Origen",
      l4: { src: "49152", dst: "80 (HTTP)", flag: "[SYN]" },
      l3: { src: "192.168.10.10", dst: "192.168.20.10", ttl: "64", proto: "0x06 (TCP)" },
      l2: { proto: "Capa 2 • Ethernet II", src: "00:1A:2B:3C:4D:01 (PC A)", dst: "AA:BB:CC:00:01:01 (GW A)", type: "0x0800 (IPv4)" }
    },
    camHighlight: null,
    routingHighlight: null
  },
  {
    step: 2,
    title: "Fase 3: Conmutación Local en Capa 2 (Switch A)",
    activeNode: "node-swA",
    activeLink: "link-step-2",
    pathId: "link-step-2",
    packetVisible: true,
    eventText: "Fase 3: Switch A lee cabecera Ethernet. Consulta su tabla CAM por la MAC destino (Router A) y reenvía por su puerto troncal/uplink Fa0/24.",
    osi: {
      status: "Conmutación Local Capa 2",
      l4: { src: "49152", dst: "80 (HTTP)", flag: "[SYN]" },
      l3: { src: "192.168.10.10", dst: "192.168.20.10", ttl: "64", proto: "0x06 (TCP)" },
      l2: { proto: "Capa 2 • Ethernet II", src: "00:1A:2B:3C:4D:01", dst: "AA:BB:CC:00:01:01", type: "0x0800" }
    },
    camHighlight: "cam-row-2",
    routingHighlight: null
  },
  {
    step: 3,
    title: "Fase 4: Enrutamiento Capa 3 y Salida WAN (Router A)",
    activeNode: "node-rtA",
    activeLink: "link-step-3",
    pathId: "link-step-3",
    packetVisible: true,
    eventText: "Fase 4: Router A desencapsula Ethernet. Encuentra ruta hacia 192.168.20.0/24 vía 10.0.0.2. Decrementa TTL a 63 y encapsula en trama WAN (PPP/HDLC).",
    osi: {
      status: "Enrutamiento L3 y Framing WAN",
      l4: { src: "49152", dst: "80 (HTTP)", flag: "[SYN]" },
      l3: { src: "192.168.10.10", dst: "192.168.20.10", ttl: "63", proto: "0x06 (TCP)" },
      l2: { proto: "Capa 2 • Encapsulación WAN", src: "Punto a Punto", dst: "Punto a Punto", type: "PPP/HDLC (0x7E)" }
    },
    camHighlight: null,
    routingHighlight: "rt-row-3"
  },
  {
    step: 4,
    title: "Fase 5: Tránsito WAN y Recepción en Router B",
    activeNode: "node-rtB",
    activeLink: "link-step-4",
    pathId: "link-step-4",
    packetVisible: true,
    eventText: "Fase 5: Router B recibe la trama serial WAN, retira cabeceras PPP y verifica que 192.168.20.0/24 es su red directa en Fa0/0. Decrementa TTL a 62.",
    osi: {
      status: "Desencapsulación WAN & Re-encapsulado L2",
      l4: { src: "49152", dst: "80 (HTTP)", flag: "[SYN]" },
      l3: { src: "192.168.10.10", dst: "192.168.20.10", ttl: "62", proto: "0x06 (TCP)" },
      l2: { proto: "Capa 2 • Ethernet II (Remota)", src: "AA:BB:CC:00:02:01 (GW B)", dst: "00:1A:2B:3C:4D:02 (PC B)", type: "0x0800" }
    },
    camHighlight: null,
    routingHighlight: "rt-row-5"
  },
  {
    step: 5,
    title: "Fase 6: Conmutación en Switch B",
    activeNode: "node-swB",
    activeLink: "link-step-5",
    pathId: "link-step-5",
    packetVisible: true,
    eventText: "Fase 6: Switch B examina la tabla CAM: encuentra la MAC de PC B en el puerto Fa0/1 y conmuta la trama directamente al destino.",
    osi: {
      status: "Conmutación Final en Destino",
      l4: { src: "49152", dst: "80 (HTTP)", flag: "[SYN]" },
      l3: { src: "192.168.10.10", dst: "192.168.20.10", ttl: "62", proto: "0x06 (TCP)" },
      l2: { proto: "Capa 2 • Ethernet II", src: "AA:BB:CC:00:02:01", dst: "00:1A:2B:3C:4D:02", type: "0x0800" }
    },
    camHighlight: "cam-row-4",
    routingHighlight: null
  },
  {
    step: 6,
    title: "Entrega Final: Comunicación Exitosa",
    activeNode: "node-pcB",
    activeLink: null,
    pathId: null,
    packetVisible: true,
    eventText: "¡Éxito! PC B recibe el paquete, valida la suma de comprobación y responde el handshake TCP [SYN-ACK]. Comunicación completada satisfactoriamente.",
    osi: {
      status: "Paquete Entregado a Capa de Aplicación",
      l4: { src: "49152", dst: "80 (HTTP)", flag: "[SYN-ACK]" },
      l3: { src: "192.168.10.10", dst: "192.168.20.10", ttl: "62", proto: "0x06 (TCP)" },
      l2: { proto: "Capa 2 • Verificado", src: "AA:BB:CC:00:02:01", dst: "00:1A:2B:3C:4D:02", type: "0x0800" }
    },
    camHighlight: null,
    routingHighlight: null
  }
];

// 3. Variables de Estado Global
let currentStep = 0;
let isPlaying = false;
let playTimer = null;
let currentMode = "success";
let animationFrameId = null;

// Variables de Control Pan & Zoom (Manipulación con Cursor)
let panX = 0;
let panY = 0;
let zoom = 1;
let isPanning = false;
let startPointerX = 0;
let startPointerY = 0;

// Referencias del DOM
const viewportContainer = document.getElementById("viewport-container");
const panZoomStage = document.getElementById("pan-zoom-stage");
const btnResetZoom = document.getElementById("btn-reset-zoom");
const scrubber = document.getElementById("timeline-scrubber");

const btnPlay = document.getElementById("btn-play");
const btnNext = document.getElementById("btn-next");
const btnPrev = document.getElementById("btn-prev");
const btnReset = document.getElementById("btn-reset");
const modeSelect = document.getElementById("simulation-mode");
const speedSelect = document.getElementById("playback-speed");

const stepCounter = document.getElementById("step-counter");
const phaseTag = document.getElementById("phase-tag");
const eventDesc = document.getElementById("event-description");

const packetMarker = document.getElementById("packet-marker");
const packetCircle = packetMarker.querySelector(".packet-circle");

// Elementos Inspector OSI
const osiStatus = document.getElementById("osi-status");
const hdrTcpSrc = document.getElementById("hdr-tcp-src");
const hdrTcpDst = document.getElementById("hdr-tcp-dst");
const hdrTcpFlag = document.getElementById("hdr-tcp-flag");
const hdrIpSrc = document.getElementById("hdr-ip-src");
const hdrIpDst = document.getElementById("hdr-ip-dst");
const hdrTtl = document.getElementById("hdr-ttl");
const hdrIpProto = document.getElementById("hdr-ip-proto");
const hdrL2Proto = document.getElementById("hdr-l2-proto");
const hdrL2Details = document.getElementById("hdr-l2-details");

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  renderPseudocode();
  setupPanAndZoom();
  setupEventListeners();
  applyStep(0, false);
});

// Renderizar el pseudocódigo en el panel con índices asignados
function renderPseudocode() {
  const container = document.getElementById("pseudocode-display");
  container.innerHTML = PSEUDOCODE_LINES.map((line, idx) => {
    const isComment = line.comment ? "code-comment" : "";
    return `<span class="code-line ${isComment}" id="code-line-${idx}">${escapeHtml(line.text)}</span>`;
  }).join("\n");
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ==========================================================
   MOTOR DE PAN & ZOOM SUAVE CON EL CURSOR
   ========================================================== */
function setupPanAndZoom() {
  function updateTransform() {
    panZoomStage.setAttribute("transform", `translate(${panX}, ${panY}) scale(${zoom})`);
  }

  // Eventos de arrastre con cursor (Pointer Events)
  viewportContainer.addEventListener("pointerdown", (e) => {
    isPanning = true;
    startPointerX = e.clientX - panX;
    startPointerY = e.clientY - panY;
    viewportContainer.classList.add("panning");
    viewportContainer.setPointerCapture(e.pointerId);
  });

  viewportContainer.addEventListener("pointermove", (e) => {
    if (!isPanning) return;
    panX = e.clientX - startPointerX;
    panY = e.clientY - startPointerY;
    updateTransform();
  });

  const stopPan = (e) => {
    if (isPanning) {
      isPanning = false;
      viewportContainer.classList.remove("panning");
      try { viewportContainer.releasePointerCapture(e.pointerId); } catch (_) {}
    }
  };

  viewportContainer.addEventListener("pointerup", stopPan);
  viewportContainer.addEventListener("pointercancel", stopPan);

  // Zoom suave centrado en la posición exacta del cursor
  viewportContainer.addEventListener("wheel", (e) => {
    e.preventDefault();
    const rect = viewportContainer.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
    const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.6), 3.0);

    // Ajustar posición del plano para centrar el zoom en el cursor
    panX = mouseX - (mouseX - panX) * (newZoom / zoom);
    panY = mouseY - (mouseY - panY) * (newZoom / zoom);
    zoom = newZoom;

    updateTransform();
  }, { passive: false });

  // Botón para restablecer la vista inicial
  btnResetZoom.addEventListener("click", () => {
    panX = 0;
    panY = 0;
    zoom = 1;
    updateTransform();
  });
}

/* ==========================================================
   ESCUCHADORES DE EVENTOS Y CONTROLADORES
   ========================================================== */
function setupEventListeners() {
  btnPlay.addEventListener("click", togglePlay);
  btnNext.addEventListener("click", () => { pausePlayback(); nextStep(); });
  btnPrev.addEventListener("click", () => { pausePlayback(); prevStep(); });
  btnReset.addEventListener("click", resetSimulation);

  // Deslizador de progreso interactivo
  scrubber.addEventListener("input", (e) => {
    pausePlayback();
    const step = parseInt(e.target.value, 10);
    applyStep(step, false);
  });

  // Selector de escenario (éxito / falla)
  modeSelect.addEventListener("change", (e) => {
    currentMode = e.target.value;
    resetSimulation();
  });

  // Selector de velocidad
  speedSelect.addEventListener("change", () => {
    if (isPlaying) {
      clearInterval(playTimer);
      startPlayback();
    }
  });

  // Pestañas CAM / Rutas
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-view").forEach(v => v.classList.remove("active"));
      btn.classList.add("active");
      const tabId = btn.getAttribute("data-tab");
      document.getElementById(tabId).classList.add("active");
    });
  });
}

/* ==========================================================
   CINEMÁTICA Y APLICACIÓN DE PASOS
   ========================================================== */
function applyStep(stepIndex, animate = true) {
  currentStep = stepIndex;
  scrubber.value = stepIndex;

  // Manejo de escenario de falla en Capa 3
  if (currentMode === "fail" && stepIndex >= 3) {
    handleFailureState();
    return;
  }

  const stepData = SIMULATION_STEPS[stepIndex];

  // 1. Contador y descripciones
  stepCounter.textContent = `Paso ${stepIndex} de 6`;
  phaseTag.textContent = `Fase ${stepIndex}`;
  eventDesc.textContent = stepData.eventText;

  // 2. Resaltar Nodos Activos
  document.querySelectorAll(".network-node").forEach(node => node.classList.remove("active-node", "error-node"));
  if (stepData.activeNode) {
    const elNode = document.getElementById(stepData.activeNode);
    if (elNode) elNode.classList.add("active-node");
  }

  // 3. Resaltar Cables
  document.querySelectorAll(".cable").forEach(cable => cable.classList.remove("active-link", "active-wan-link"));
  if (stepData.activeLink) {
    const elLink = document.getElementById(stepData.activeLink);
    if (elLink) {
      elLink.classList.add(stepData.activeLink === "link-step-3" ? "active-wan-link" : "active-link");
    }
  }

  // 4. Mover Paquete Suavemente por las Curvas del Cable
  if (animationFrameId) cancelAnimationFrame(animationFrameId);

  if (!stepData.packetVisible) {
    packetMarker.style.display = "none";
  } else {
    packetMarker.style.display = "block";
    packetCircle.setAttribute("fill", "#38bdf8");
    packetCircle.setAttribute("filter", "url(#glow-packet)");

    if (stepData.pathId && animate) {
      animatePacketAlongPath(stepData.pathId);
    } else {
      // Posición estática en el nodo actual
      setPacketToNodePosition(stepData.activeNode);
    }
  }

  // 5. Actualizar Inspector OSI
  updateOsiInspector(stepData.osi);

  // 6. Sincronizar y Auto-Desplazar Pseudocódigo
  syncPseudocode(stepIndex, false);

  // 7. Resaltar Tablas Operativas
  updateTables(stepData.camHighlight, stepData.routingHighlight);
}

// Animación de trayectoria continua sobre rutas vectoriales SVG (Bezier y Rectas)
function animatePacketAlongPath(pathId) {
  const path = document.getElementById(pathId);
  if (!path) return;

  const totalLength = path.getTotalLength();
  const duration = parseInt(speedSelect.value, 10) * 0.75;
  const startTime = performance.now();

  function stepAnimation(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Función de aceleración suave (ease-in-out)
    const easedT = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
    const point = path.getPointAtLength(easedT * totalLength);

    packetMarker.setAttribute("transform", `translate(${point.x}, ${point.y})`);

    if (progress < 1) {
      animationFrameId = requestAnimationFrame(stepAnimation);
    }
  }

  animationFrameId = requestAnimationFrame(stepAnimation);
}

function setPacketToNodePosition(nodeId) {
  const node = document.getElementById(nodeId);
  if (!node) return;
  const transform = node.getAttribute("transform");
  if (transform) {
    packetMarker.setAttribute("transform", transform);
  }
}

function updateOsiInspector(osi) {
  osiStatus.textContent = osi.status;
  hdrTcpSrc.textContent = osi.l4.src;
  hdrTcpDst.textContent = osi.l4.dst;
  hdrTcpFlag.textContent = osi.l4.flag;
  hdrIpSrc.textContent = osi.l3.src;
  hdrIpDst.textContent = osi.l3.dst;
  hdrTtl.textContent = osi.l3.ttl;
  hdrIpProto.textContent = osi.l3.proto;
  hdrL2Proto.textContent = osi.l2.proto;

  if (osi.l2.type.includes("PPP") || osi.l2.type.includes("HDLC")) {
    hdrL2Details.innerHTML = `<span>Encapsulación: <strong>PPP / HDLC Serial</strong></span><span>Flag: <strong>0x7E</strong></span><span>Enlace: <strong>Punto a Punto</strong></span>`;
  } else {
    hdrL2Details.innerHTML = `<span>MAC Origen: <strong>${osi.l2.src}</strong></span><span>MAC Destino: <strong>${osi.l2.dst}</strong></span><span>EtherType: <strong>${osi.l2.type}</strong></span>`;
  }
}

function syncPseudocode(stepIndex, isFail) {
  document.querySelectorAll(".code-line").forEach(l => l.classList.remove("active"));
  
  let targetLineEl = null;
  PSEUDOCODE_LINES.forEach((line, idx) => {
    if (isFail) {
      if (line.isFailLine) {
        targetLineEl = document.getElementById(`code-line-${idx}`);
        if (targetLineEl) targetLineEl.classList.add("active");
      }
    } else {
      if (line.phase === stepIndex && !line.isFailLine) {
        const el = document.getElementById(`code-line-${idx}`);
        if (el) {
          el.classList.add("active");
          if (!targetLineEl) targetLineEl = el;
        }
      }
    }
  });

  // Auto-desplazamiento suave para mantener visible la línea activa
  if (targetLineEl) {
    targetLineEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function updateTables(camId, rtId) {
  document.querySelectorAll(".data-table tr").forEach(row => row.classList.remove("active-lookup"));
  if (camId) {
    const row = document.getElementById(camId);
    if (row) row.classList.add("active-lookup");
  }
  if (rtId) {
    const row = document.getElementById(rtId);
    if (row) row.classList.add("active-lookup");
  }
}

// Manejo del Escenario de Error (Destino Inalcanzable ICMP)
function handleFailureState() {
  stepCounter.textContent = "Falla de Enrutamiento";
  phaseTag.textContent = "Error Capa 3 (Drop)";
  eventDesc.textContent = "Router A no posee una ruta válida hacia la subred 192.168.20.0/24. El paquete es DESCARTADO (Drop) y se genera mensaje ICMP Tipo 3 (Destination Host Unreachable).";

  // Resaltar nodo con error
  document.querySelectorAll(".network-node").forEach(n => n.classList.remove("active-node", "error-node"));
  document.getElementById("node-rtA").classList.add("error-node");

  // Detener paquete en Router A y pintar de rojo
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  setPacketToNodePosition("node-rtA");
  packetMarker.style.display = "block";
  packetCircle.setAttribute("fill", "#ef4444");
  packetCircle.setAttribute("filter", "url(#glow-error)");

  // Actualizar estado OSI
  osiStatus.textContent = "Paquete Descartado (Drop)";
  hdrTtl.textContent = "0 (Drop)";
  hdrL2Proto.textContent = "Mensaje de Control ICMP";
  hdrL2Details.innerHTML = `<span>Tipo 3: <strong>Destination Unreachable</strong></span><span>Código: <strong>1 (Host Unreachable)</strong></span>`;

  // Resaltar línea de excepción en el pseudocódigo
  syncPseudocode(3, true);
  pausePlayback();
}

/* ==========================================================
   REPRODUCTOR Y CONTROLES TEMPORALES
   ========================================================== */
function togglePlay() {
  if (isPlaying) {
    pausePlayback();
  } else {
    startPlayback();
  }
}

function startPlayback() {
  if (currentStep >= SIMULATION_STEPS.length - 1 || (currentMode === "fail" && currentStep >= 3)) {
    currentStep = 0;
  }
  isPlaying = true;
  btnPlay.textContent = "⏸ Pausar";
  btnPlay.classList.add("btn-danger");

  const interval = parseInt(speedSelect.value, 10);
  playTimer = setInterval(() => {
    if (currentStep < SIMULATION_STEPS.length - 1) {
      if (currentMode === "fail" && currentStep === 3) {
        pausePlayback();
        return;
      }
      currentStep++;
      applyStep(currentStep, true);
    } else {
      pausePlayback();
    }
  }, interval);
}

function pausePlayback() {
  isPlaying = false;
  if (playTimer) clearInterval(playTimer);
  btnPlay.textContent = "▶ Reproducir";
  btnPlay.classList.remove("btn-danger");
}

function nextStep() {
  if (currentMode === "fail" && currentStep >= 3) return;
  if (currentStep < SIMULATION_STEPS.length - 1) {
    applyStep(currentStep + 1, true);
  }
}

function prevStep() {
  if (currentStep > 0) {
    applyStep(currentStep - 1, false);
  }
}

function resetSimulation() {
  pausePlayback();
  applyStep(0, false);
}
