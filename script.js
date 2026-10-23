/**
 * Simulador de Interconexión LAN a WAN
 * Basado en la lógica algorítmica de Capa 2 y Capa 3
 */

// Pseudocódigo fuente estructurado por fases
const PSEUDOCODE_LINES = [
  { text: "// Algoritmo de Simulación del Funcionamiento de Interconexión LAN a WAN", comment: true },
  { text: "Inicio", phase: 0 },
  { text: "  // Declaración de parámetros lógicos y topológicos", comment: true },
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
  { text: "  Router_A desencapsula Capa 2 y analiza IP_Destino en tabla de rutas", phase: 3 },
  { text: "  Si ruta existe: Encapsula WAN (PPP/HDLC) y transmite hacia Router_B", phase: 3 },
  { text: "  Sino: Descartar paquete; emitir ICMP destino inalcanzable; Terminar", phase: 3, failBranch: true },
  { text: "", comment: true },
  { text: "  // Fase 5: Tránsito por Nube WAN y Recepción en Sede Destino", comment: true },
  { text: "  Router_B desencapsula WAN; examina dirección IP de destino", phase: 4 },
  { text: "  Router_B envía trama Ethernet hacia Switch_B mediante interfaz LAN", phase: 4 },
  { text: "", comment: true },
  { text: "  // Fase 6: Entrega final en Capa 2 remota", comment: true },
  { text: "  Switch_B recibe trama; analiza dirección MAC en tabla CAM", phase: 5 },
  { text: "  Switch_B transfiere trama hacia Computadora_B", phase: 5 },
  { text: "  Computadora_B procesa información exitosamente", phase: 6 },
  { text: "Fin", phase: 6 }
];

// Definición de estados y fases de la simulación
const SIMULATION_STEPS = [
  {
    step: 0,
    title: "Fase 1: Inicialización Topológica y Enlace Físico",
    activeNode: "node-pcA",
    activeLink: null,
    packetPos: { x: 90, y: 200 },
    packetVisible: false,
    eventText: "Infraestructura inicializada: cables UTP Cat6 conectados en ambas LANs y enlace WAN punto a punto activo.",
    osi: {
      status: "Esperando Generación de Tráfico",
      l4: { src: "-", dst: "-", flag: "-" },
      l3: { src: "-", dst: "-", ttl: "-", proto: "-" },
      l2: { proto: "Capa 2 • Inactivo", src: "-", dst: "-", type: "-" }
    },
    camHighlight: null,
    routingHighlight: null
  },
  {
    step: 1,
    title: "Fase 2: Generación del Paquete en Computadora_A",
    activeNode: "node-pcA",
    activeLink: null,
    packetPos: { x: 90, y: 200 },
    packetVisible: true,
    eventText: "PC A evalúa la IP 192.168.20.10: está fuera de su subred (/24). Encapsula la trama con la MAC destino de su Gateway (Router A).",
    osi: {
      status: "Encapsulado Completo en Origen",
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
    activeLink: "link-pcA-swA",
    packetPos: { x: 220, y: 200 },
    packetVisible: true,
    eventText: "Switch A lee MAC destino en su tabla CAM. Aprende la MAC de PC A en Fa0/1 y reenvía la trama por el uplink Fa0/24.",
    osi: {
      status: "Traspaso de Conmutación Capa 2",
      l4: { src: "49152", dst: "80 (HTTP)", flag: "[SYN]" },
      l3: { src: "192.168.10.10", dst: "192.168.20.10", ttl: "64", proto: "0x06 (TCP)" },
      l2: { proto: "Capa 2 • Ethernet II", src: "00:1A:2B:3C:4D:01", dst: "AA:BB:CC:00:01:01", type: "0x0800" }
    },
    camHighlight: "cam-row-2",
    routingHighlight: null
  },
  {
    step: 3,
    title: "Fase 4: Enrutamiento en Capa 3 (Router A)",
    activeNode: "node-rtA",
    activeLink: "link-swA-rtA",
    packetPos: { x: 390, y: 200 },
    packetVisible: true,
    eventText: "Router A remueve encabezado Ethernet. Consulta tabla de enrutamiento: ruta encontrada hacia 192.168.20.0/24 vía 10.0.0.2. Decrementa TTL a 63.",
    osi: {
      status: "Desencapsulación L2 & Enrutamiento L3",
      l4: { src: "49152", dst: "80 (HTTP)", flag: "[SYN]" },
      l3: { src: "192.168.10.10", dst: "192.168.20.10", ttl: "63", proto: "0x06 (TCP)" },
      l2: { proto: "Capa 2 • Reescritura / WAN Framing", src: "Enlace Serial", dst: "Enlace Serial", type: "HDLC / PPP Flag" }
    },
    camHighlight: null,
    routingHighlight: "rt-row-3"
  },
  {
    step: 4,
    title: "Fase 5: Tránsito por la WAN hacia Router B",
    activeNode: "node-rtB",
    activeLink: "link-rtA-rtB",
    packetPos: { x: 610, y: 200 },
    packetVisible: true,
    eventText: "Router B intercepta paquete serial WAN. Verifica dirección de destino y confirma que la subred 192.168.20.0/24 está directamente conectada en Fa0/0.",
    osi: {
      status: "Recepción WAN & Reencapsulación Ethernet",
      l4: { src: "49152", dst: "80 (HTTP)", flag: "[SYN]" },
      l3: { src: "192.168.10.10", dst: "192.168.20.10", ttl: "62", proto: "0x06 (TCP)" },
      l2: { proto: "Capa 2 • Ethernet II (Nueva Trama)", src: "AA:BB:CC:00:02:01 (GW B)", dst: "00:1A:2B:3C:4D:02 (PC B)", type: "0x0800" }
    },
    camHighlight: null,
    routingHighlight: "rt-row-5"
  },
  {
    step: 5,
    title: "Fase 6: Entrega en Capa 2 Remota (Switch B)",
    activeNode: "node-swB",
    activeLink: "link-rtB-swB",
    packetPos: { x: 780, y: 200 },
    packetVisible: true,
    eventText: "Switch B examina la tabla CAM: encuentra la MAC destino de PC B asociada al puerto físico Fa0/1 y conmuta la trama.",
    osi: {
      status: "Conmutación Final en Red Destino",
      l4: { src: "49152", dst: "80 (HTTP)", flag: "[SYN]" },
      l3: { src: "192.168.10.10", dst: "192.168.20.10", ttl: "62", proto: "0x06 (TCP)" },
      l2: { proto: "Capa 2 • Ethernet II", src: "AA:BB:CC:00:02:01", dst: "00:1A:2B:3C:4D:02", type: "0x0800" }
    },
    camHighlight: "cam-row-4",
    routingHighlight: null
  },
  {
    step: 6,
    title: "Finalización: Paquete Procesado con Éxito",
    activeNode: "node-pcB",
    activeLink: "link-swB-pcB",
    packetPos: { x: 910, y: 200 },
    packetVisible: true,
    eventText: "¡Éxito! Computadora_B procesa el segmento TCP. La comunicación inter-red LAN a WAN se ha completado satisfactoriamente.",
    osi: {
      status: "Entrega Exitosa en Capa de Aplicación",
      l4: { src: "49152", dst: "80 (HTTP)", flag: "[SYN-ACK]" },
      l3: { src: "192.168.10.10", dst: "192.168.20.10", ttl: "62", proto: "0x06" },
      l2: { proto: "Capa 2 • Verificado", src: "AA:BB:CC:00:02:01", dst: "00:1A:2B:3C:4D:02", type: "0x0800" }
    },
    camHighlight: null,
    routingHighlight: null
  }
];

// Estado global de la aplicación
let currentStep = 0;
let isPlaying = false;
let playInterval = null;
let currentMode = "success"; // 'success' | 'fail'

// Referencias del DOM
const btnPlay = document.getElementById("btn-play");
const btnNext = document.getElementById("btn-next");
const btnPrev = document.getElementById("btn-prev");
const btnReset = document.getElementById("btn-reset");
const modeSelect = document.getElementById("simulation-mode");
const speedSelect = document.getElementById("playback-speed");
const stepCounter = document.getElementById("step-counter");
const eventDesc = document.getElementById("event-description");
const phaseTag = document.getElementById("phase-tag");

// Elementos SVG
const packetMarker = document.getElementById("packet-marker");
const packetCircle = packetMarker.querySelector(".packet-circle");

// Elementos OSI
const osiStatus = document.getElementById("osi-status");
const hdrIpSrc = document.getElementById("hdr-ip-src");
const hdrIpDst = document.getElementById("hdr-ip-dst");
const hdrTtl = document.getElementById("hdr-ttl");
const hdrL2Proto = document.getElementById("hdr-l2-proto");
const hdrL2Details = document.getElementById("hdr-l2-details");

// Inicializador
document.addEventListener("DOMContentLoaded", () => {
  renderPseudocode();
  setupEventListeners();
  updateView();
});

// Renderizar pseudocódigo en el contenedor con sintaxis resaltable
function renderPseudocode() {
  const codeContainer = document.getElementById("pseudocode-display");
  codeContainer.innerHTML = PSEUDOCODE_LINES.map((line, idx) => {
    const isComment = line.comment ? "code-comment" : "";
    return `<span class="code-line ${isComment}" id="line-${idx}">${escapeHtml(line.text)}</span>`;
  }).join("\n");
}

function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Configurar escuchadores de eventos
function setupEventListeners() {
  btnPlay.addEventListener("click", togglePlay);
  btnNext.addEventListener("click", nextStep);
  btnPrev.addEventListener("click", prevStep);
  btnReset.addEventListener("click", resetSimulation);

  modeSelect.addEventListener("change", (e) => {
    currentMode = e.target.value;
    resetSimulation();
  });

  speedSelect.addEventListener("change", () => {
    if (isPlaying) {
      clearInterval(playInterval);
      startPlayback();
    }
  });

  // Pestañas de tablas CAM / Enrutamiento
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-view").forEach(v => v.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.getAttribute("data-tab")).classList.add("active");
    });
  });
}

// Actualizar toda la interfaz de usuario en base al paso actual
function updateView() {
  // Manejo de escenario de falla en el paso 3 (Router A)
  if (currentMode === "fail" && currentStep >= 3) {
    handleFailureState();
    return;
  }

  const stepData = SIMULATION_STEPS[currentStep];

  // 1. Contador y descripciones
  stepCounter.textContent = `Paso ${currentStep} de 6`; phaseTag.textContent = `Fase ${currentStep}`;
  eventDesc.textContent = stepData.eventText;

  // 2. Resaltar Nodos y Enlaces
  document.querySelectorAll(".network-node").forEach(node => {
    node.classList.remove("active-node", "error-node");
  });
  if (stepData.activeNode) {
    const elNode = document.getElementById(stepData.activeNode);
    if (elNode) elNode.classList.add("active-node");
  }

  document.querySelectorAll(".cable").forEach(cable => {
    cable.classList.remove("active-link", "active-wan-link");
  });
  if (stepData.activeLink) {
    const elLink = document.getElementById(stepData.activeLink);
    if (elLink) {
      elLink.classList.add(stepData.activeLink === "link-rtA-rtB" ? "active-wan-link" : "active-link");
    }
  }

  // 3. Posicionar Paquete
  packetMarker.style.display = stepData.packetVisible ? "block" : "none";
  packetMarker.setAttribute("transform", `translate(${stepData.packetPos.x},${stepData.packetPos.y})`);
  packetCircle.setAttribute("fill", "#38bdf8");
  packetCircle.setAttribute("filter", "url(#glow-packet)");

  // 4. Actualizar Inspector OSI
  osiStatus.textContent = stepData.osi.status;
  hdrIpSrc.textContent = stepData.osi.l3.src;
  hdrIpDst.textContent = stepData.osi.l3.dst;
  hdrTtl.textContent = stepData.osi.l3.ttl;
  hdrL2Proto.textContent = stepData.osi.l2.proto;

  if (stepData.osi.l2.type.includes("HDLC") || stepData.osi.l2.type.includes("PPP")) {
    hdrL2Details.innerHTML = `<span>Formato WAN: <strong>PPP / HDLC Serial</strong></span><span>Flag: <strong>0x7E</strong></span>`;
  } else {
    hdrL2Details.innerHTML = `<span>MAC Origen: <strong>${stepData.osi.l2.src}</strong></span><span>MAC Destino: <strong>${stepData.osi.l2.dst}</strong></span><span>Tipo: <strong>${stepData.osi.l2.type}</strong></span>`; }  // 5. Sincronizar Pseudocódigo document.querySelectorAll(".code-line").forEach(l => l.classList.remove("active")); PSEUDOCODE_LINES.forEach((line, idx) => { if (line.phase === currentStep && !line.failBranch) { const lineEl = document.getElementById(`line-${idx}`);
      if (lineEl) lineEl.classList.add("active");
    }
  });

  // 6. Resaltar Tablas de Red
  document.querySelectorAll(".data-table tr").forEach(row => row.classList.remove("active-lookup"));
  if (stepData.camHighlight) {
    const elCam = document.getElementById(stepData.camHighlight);
    if (elCam) elCam.classList.add("active-lookup");
  }
  if (stepData.routingHighlight) {
    const elRt = document.getElementById(stepData.routingHighlight);
    if (elRt) elRt.classList.add("active-lookup");
  }
}

// Lógica especial cuando no existe ruta en Router A
function handleFailureState() {
  stepCounter.textContent = "Falla de Enrutamiento";
  phaseTag.textContent = "Error Capa 3";
  eventDesc.textContent = "Router A no posee ruta para la subred destino. Paquete DESCARTADO. Se genera mensaje ICMP Tipo 3 (Destination Unreachable) de vuelta a PC A.";

  // Resaltar error en Router A
  document.querySelectorAll(".network-node").forEach(n => n.classList.remove("active-node", "error-node"));
  document.getElementById("node-rtA").classList.add("error-node");

  // Paquete en rojo
  packetMarker.style.display = "block";
  packetMarker.setAttribute("transform", "translate(390, 200)");
  packetCircle.setAttribute("fill", "#ef4444");
  packetCircle.setAttribute("filter", "url(#glow-error)");

  // Actualizar OSI
  osiStatus.textContent = "Paquete Descartado (Drop)";
  hdrTtl.textContent = "0 (Descartado)";
  hdrL2Proto.textContent = "ICMP Error Mensaje";
  hdrL2Details.innerHTML = `<span>Tipo 3: <strong>Destination Host Unreachable</strong></span><span>Código: <strong>1</strong></span>`;

  // Resaltar línea de fallo en código
  document.querySelectorAll(".code-line").forEach(l => l.classList.remove("active"));
  PSEUDOCODE_LINES.forEach((line, idx) => {
    if (line.failBranch) {
      document.getElementById(`line-${idx}`).classList.add("active");
    }
  });

  pausePlayback();
}

// Controles de Reproducción
function togglePlay() {
  if (isPlaying) {
    pausePlayback();
  } else {
    startPlayback();
  }
}

function startPlayback() {
  if (currentStep >= SIMULATION_STEPS.length - 1) {
    currentStep = 0;
  }
  isPlaying = true;
  btnPlay.textContent = "⏸ Pausar";
  btnPlay.classList.add("btn-danger");
  
  const speed = parseInt(speedSelect.value, 10);
  playInterval = setInterval(() => {
    if (currentStep < SIMULATION_STEPS.length - 1) {
      if (currentMode === "fail" && currentStep === 3) {
        pausePlayback();
        return;
      }
      currentStep++;
      updateView();
    } else {
      pausePlayback();
    }
  }, speed);
}

function pausePlayback() {
  isPlaying = false;
  clearInterval(playInterval);
  btnPlay.textContent = "▶ Iniciar";
  btnPlay.classList.remove("btn-danger");
}

function nextStep() {
  pausePlayback();
  if (currentMode === "fail" && currentStep >= 3) return;
  if (currentStep < SIMULATION_STEPS.length - 1) {
    currentStep++;
    updateView();
  }
}

function prevStep() {
  pausePlayback();
  if (currentStep > 0) {
    currentStep--;
    updateView();
  }
}

function resetSimulation() {
  pausePlayback();
  currentStep = 0;
  updateView();
}