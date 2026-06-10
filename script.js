const ESTADO_KEY_BASE = 'pensum_v2_estados_';
const CARRERA_KEY = 'pensum_v2_carrera';
const SEGUNDA_CARRERA_KEY = 'pensum_v2_segunda_carrera';
const VISTA_KEY = 'pensum_v2_vista';

let estados = {};
let carreraActual = null;
let segundaCarreraId = null;
let segundaCarreraData = null;
let materiasMap = {};
let pensumFusionado = null;
let cardEls = {};
let activeId = null;
let vistaMode = 'completa';
let searchQuery = '';
let seleccionModeBtn = false;
let ctxTarget = null;

// Mapa de homologaciones automático
let mapaHomologaciones = {};

// ── Funciones para detección automática de equivalencias ─────────────
function normalizarTexto(texto) {
  return texto.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, '')
    .replace(/\b(introducci[oó]n a |b[aá]sica |i |ii |iii |iv |v |vi |vii |viii |ix |x |fundamentos de )/gi, '')
    .trim();
}

function levenshteinDist(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[b.length][a.length];
}

function similitudCadenas(a, b) {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  const dist = levenshteinDist(a, b);
  return 1 - dist / maxLen;
}

function sonEquivalentes(materia1, materia2) {
  if (materia1.codigo === materia2.codigo) return true;
  const nom1 = normalizarTexto(materia1.nombre);
  const nom2 = normalizarTexto(materia2.nombre);
  return similitudCadenas(nom1, nom2) > 0.8;
}

function construirMapaHomologaciones(principal, segunda) {
  const mapa = {};
  mapa[principal.id] = {};
  mapa[segunda.id] = {};
  const materiasPrinc = principal.semestres.flatMap(s => s.materias);
  const materiasSeg = segunda.semestres.flatMap(s => s.materias);
  for (const mp of materiasPrinc) {
    for (const ms of materiasSeg) {
      if (sonEquivalentes(mp, ms)) {
        mapa[principal.id][mp.id] = ms.id;
        mapa[segunda.id][ms.id] = mp.id;
      }
    }
  }
  return mapa;
}

// ── Validaciones de límite de créditos (sin restricción de segundo semestre) ──
function getLimiteCreditosSemestre() {
  if (!carreraActual) return 23;
  const cargaBase = carreraActual.carga_tipica_semestre || 17;
  return cargaBase <= 17 ? 23 : 25;
}

function creditosEnCursoEnSemestre(semestreNumero, incluirId = null) {
  let total = 0;
  const semestre = carreraActual.semestres.find(s => s.numero === semestreNumero);
  if (!semestre) return 0;
  for (const m of semestre.materias) {
    const estado = getEstado(m.id);
    if (estado === 'cursando') total += m.creditos;
    if (incluirId === m.id) total += m.creditos;
  }
  return total;
}

function validarLimiteCreditos(materiaId, nuevoEstado) {
  if (nuevoEstado !== 'cursando') return true;
  const m = materiasMap[materiaId];
  if (!m || m.carreraOrigen !== carreraActual?.id) return true;
  const semestreNum = m._sem;
  if (!semestreNum) return true;
  const actual = creditosEnCursoEnSemestre(semestreNum, materiaId);
  const limite = getLimiteCreditosSemestre();
  if (actual > limite) {
    alert(`No puedes cursar más de ${limite} créditos en el semestre ${semestreNum}. Actualmente ya tienes ${actual - m.creditos} créditos cursando.`);
    return false;
  }
  return true;
}

// ── Estado por carrera (principal) ──────────────────────────────────
function getEstadoKey() {
  if (!carreraActual) return ESTADO_KEY_BASE + 'default';
  return ESTADO_KEY_BASE + carreraActual.id;
}

function loadState() {
  const key = getEstadoKey();
  try { estados = JSON.parse(localStorage.getItem(key) || '{}'); } catch { estados = {}; }
}

function saveState() {
  const key = getEstadoKey();
  localStorage.setItem(key, JSON.stringify(estados));
}

function getEstado(id) {
  return estados[id] || null;
}

function setEstado(id, val) {
  if (val === 'cursando' && !validarLimiteCreditos(id, val)) return;
  if (val) estados[id] = val;
  else delete estados[id];
  saveState();
  // Sincronizar con segunda carrera si hay homologación
  if (segundaCarreraId && segundaCarreraData && mapaHomologaciones[carreraActual?.id] && mapaHomologaciones[carreraActual.id][id]) {
    const homologada = mapaHomologaciones[carreraActual.id][id];
    const secondKey = ESTADO_KEY_BASE + segundaCarreraId;
    let secondEstados = {};
    try { secondEstados = JSON.parse(localStorage.getItem(secondKey) || '{}'); } catch { }
    if (val) secondEstados[homologada] = val;
    else delete secondEstados[homologada];
    localStorage.setItem(secondKey, JSON.stringify(secondEstados));
  }
  render();
}

// ── Estado para segunda carrera (lectura) ───────────────────────────
let secondEstados = {};
function cargarEstadosSegundaCarrera() {
  if (!segundaCarreraId) {
    secondEstados = {};
    return;
  }
  const key = ESTADO_KEY_BASE + segundaCarreraId;
  try { secondEstados = JSON.parse(localStorage.getItem(key) || '{}'); } catch { secondEstados = {}; }
}
function getEstadoSegunda(id) {
  return secondEstados[id] || null;
}

// ── Fusión de pensums (excluyendo el primer semestre de la segunda carrera) ──
function fusionarPensums(principal, segunda) {
  mapaHomologaciones = construirMapaHomologaciones(principal, segunda);
  const semestresFusion = principal.semestres.map(s => ({
    numero: s.numero,
    creditos: s.creditos,
    materias: s.materias.map(m => ({ ...m, carreraOrigen: principal.id, homologacion: null }))
  }));

  const materiasHomologadasSegunda = new Set();
  for (const semF of semestresFusion) {
    for (const m of semF.materias) {
      if (mapaHomologaciones[principal.id] && mapaHomologaciones[principal.id][m.id]) {
        const homId = mapaHomologaciones[principal.id][m.id];
        const homMateria = segunda.semestres.flatMap(s => s.materias).find(mat => mat.id === homId);
        if (homMateria) {
          m.homologacion = { carrera: segunda.id, materiaId: homId, nombre: homMateria.nombre, codigo: homMateria.codigo };
          materiasHomologadasSegunda.add(homId);
        }
      }
    }
  }

  const maxSem = Math.max(principal.semestres.length, segunda.semestres.length);
  for (let i = 0; i < maxSem; i++) {
    const semNum = i + 1;
    let semFusion = semestresFusion.find(s => s.numero === semNum);
    if (!semFusion) {
      semFusion = { numero: semNum, creditos: 0, materias: [] };
      semestresFusion.push(semFusion);
    }
    const semSegunda = segunda.semestres.find(s => s.numero === semNum);
    if (semSegunda && semNum > 1) { // ← SOLO agregar materias de segunda carrera a partir de semestre 2
      for (const m of semSegunda.materias) {
        if (!materiasHomologadasSegunda.has(m.id)) {
          semFusion.materias.push({ ...m, carreraOrigen: segunda.id, homologacion: null });
        }
      }
    }
  }

  semestresFusion.sort((a, b) => a.numero - b.numero);
  for (const s of semestresFusion) {
    s.creditos = s.materias.reduce((sum, m) => sum + m.creditos, 0);
  }
  return semestresFusion;
}

function buildGlobalMap(semestresFusion) {
  materiasMap = {};
  for (const sem of semestresFusion) {
    for (const m of sem.materias) {
      materiasMap[m.id] = { ...m, _sem: sem.numero };
    }
  }
}

function calcVisible(id) {
  const m = materiasMap[id];
  if (!m) return 'disponible';
  const estado = (m.carreraOrigen === carreraActual?.id) ? getEstado(id) : getEstadoSegunda(id);
  if (estado) return estado;
  const prereqsOk = m.prerreqs.every(pid => {
    const pm = materiasMap[pid];
    if (!pm) return true;
    const estP = (pm.carreraOrigen === carreraActual?.id) ? getEstado(pid) : getEstadoSegunda(pid);
    return estP === 'aprobada';
  });
  const correqsOk = m.correqs.every(cid => {
    const cm = materiasMap[cid];
    if (!cm) return true;
    const estC = (cm.carreraOrigen === carreraActual?.id) ? getEstado(cid) : getEstadoSegunda(cid);
    return estC === 'cursando' || estC === 'aprobada';
  });
  return (prereqsOk && correqsOk) ? 'disponible' : 'bloqueada';
}

function makeCard(m) {
  const div = document.createElement('div');
  const estado = calcVisible(m.id);
  const estClass = estado !== 'disponible' && estado !== 'bloqueada' ? `estado-${estado}` : '';
  let additionalClass = '';
  if (m.carreraOrigen !== carreraActual?.id) additionalClass = ' segunda-carrera';
  div.className = `mat-card ${m.categoria} ${estClass}${additionalClass}`.trim();
  div.dataset.id = m.id;

  if (estado === 'bloqueada' && !calcVisible(m.id)) {
    const badge = document.createElement('span');
    badge.className = 'mat-bloqueada-badge';
    badge.textContent = '🔒';
    div.appendChild(badge);
  }

  const codigo = document.createElement('div');
  codigo.className = 'mat-codigo';
  codigo.textContent = m.codigo;
  const nombre = document.createElement('div');
  nombre.className = 'mat-nombre';
  nombre.textContent = m.nombre;
  const cred = document.createElement('div');
  cred.className = 'mat-cred';
  cred.textContent = `Cr. ${m.creditos} (${m.ht || 0}, ${m.hp || 0})`;
  div.appendChild(codigo);
  div.appendChild(nombre);
  div.appendChild(cred);

  if (m.carreraOrigen !== carreraActual?.id) {
    const originBadge = document.createElement('span');
    originBadge.className = 'origin-badge';
    originBadge.textContent = '2ª';
    originBadge.title = `Materia de ${segundaCarreraData?.nombre || 'segunda carrera'} (a partir de 2° semestre)`;
    div.appendChild(originBadge);
  }

  return div;
}

// ── Gestión de flechas y resaltado (igual que antes) ─────────────────
let positionsCache = null;
let positionsDirty = true;

function invalidatePositions() {
  positionsDirty = true;
}

function drawArrows() {
  if (!positionsDirty && positionsCache) {
    drawArrowsFromCache(positionsCache);
    return;
  }
  const svg = document.getElementById('arrows-svg');
  if (!svg) return;
  const canvasRect = document.getElementById('pensum-canvas').getBoundingClientRect();
  const scrollLeft = document.querySelector('.canvas-wrapper').scrollLeft;
  const scrollTop = document.querySelector('.canvas-wrapper').scrollTop;
  const positions = {};
  for (const [id, el] of Object.entries(cardEls)) {
    const rect = el.getBoundingClientRect();
    positions[id] = {
      x: rect.left - canvasRect.left + scrollLeft + rect.width / 2,
      y: rect.top - canvasRect.top + scrollTop + rect.height / 2
    };
  }
  positionsCache = positions;
  positionsDirty = false;
  drawArrowsFromCache(positions);
}

function drawArrowsFromCache(positions) {
  const svg = document.getElementById('arrows-svg');
  if (!svg) return;
  svg.innerHTML = '<defs><marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#94a3b8"/></marker><marker id="arr-co" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#f59e0b"/></marker></defs>';
  for (const [id, m] of Object.entries(materiasMap)) {
    const to = positions[id];
    if (!to) continue;
    m.prerreqs.forEach(pid => {
      const from = positions[pid];
      if (!from) return;
      const mx = (from.x + to.x) / 2;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M${from.x},${from.y} C${mx},${from.y} ${mx},${to.y} ${to.x},${to.y}`);
      path.setAttribute('stroke', '#94a3b8');
      path.setAttribute('stroke-width', '1.2');
      path.setAttribute('fill', 'none');
      path.setAttribute('opacity', '0.5');
      path.setAttribute('marker-end', 'url(#arr)');
      path.dataset.from = pid;
      path.dataset.to = id;
      path.dataset.type = 'pre';
      svg.appendChild(path);
    });
    m.correqs.forEach(cid => {
      const from = positions[cid];
      if (!from) return;
      const mx = (from.x + to.x) / 2;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M${from.x},${from.y} C${mx},${from.y} ${mx},${to.y} ${to.x},${to.y}`);
      path.setAttribute('stroke', '#f59e0b');
      path.setAttribute('stroke-width', '1.2');
      path.setAttribute('stroke-dasharray', '4,3');
      path.setAttribute('fill', 'none');
      path.setAttribute('opacity', '0.5');
      path.setAttribute('marker-end', 'url(#arr-co)');
      path.dataset.from = cid;
      path.dataset.to = id;
      path.dataset.type = 'co';
      svg.appendChild(path);
    });
  }
}

function computeRelIds(ids) {
  const related = new Set(ids);
  for (const id of ids) {
    const m = materiasMap[id];
    if (m) {
      m.prerreqs.forEach(p => related.add(p));
      m.correqs.forEach(c => related.add(c));
    }
  }
  for (const [oid, om] of Object.entries(materiasMap)) {
    if (om.prerreqs.some(p => ids.has(p)) || om.correqs.some(c => ids.has(c))) {
      related.add(oid);
    }
  }
  return related;
}

function updateArrowsHighlight(activeIds) {
  const svg = document.getElementById('arrows-svg');
  if (!svg) return;
  const paths = svg.querySelectorAll('path');
  if (activeIds.size === 0) {
    paths.forEach(p => {
      p.setAttribute('opacity', '0.5');
      if (p.dataset.type === 'pre') {
        p.setAttribute('stroke', '#94a3b8');
        p.setAttribute('stroke-width', '1.2');
      } else if (p.dataset.type === 'co') {
        p.setAttribute('stroke', '#f59e0b');
        p.setAttribute('stroke-width', '1.2');
      }
    });
    return;
  }
  paths.forEach(p => {
    p.setAttribute('opacity', '0.25');
    if (p.dataset.type === 'pre') {
      p.setAttribute('stroke', '#94a3b8');
      p.setAttribute('stroke-width', '1.2');
    } else if (p.dataset.type === 'co') {
      p.setAttribute('stroke', '#f59e0b');
      p.setAttribute('stroke-width', '1.2');
    }
  });
  paths.forEach(path => {
    const from = path.dataset.from;
    const to = path.dataset.to;
    if (!from || !to) return;
    const isRelated = activeIds.has(from) || activeIds.has(to);
    if (isRelated) {
      path.setAttribute('opacity', '1');
      if (path.dataset.type === 'pre') {
        path.setAttribute('stroke', '#3b82f6');
        path.setAttribute('stroke-width', '2.5');
      } else if (path.dataset.type === 'co') {
        path.setAttribute('stroke', '#ea580c');
        path.setAttribute('stroke-width', '2.5');
      }
    }
  });
}

let arrowFrame = null;
function scheduleDrawArrows() {
  if (arrowFrame) cancelAnimationFrame(arrowFrame);
  arrowFrame = requestAnimationFrame(() => {
    drawArrows();
    if (activeId) updateArrowsHighlight(new Set([activeId]));
    else if (seleccionIds.size) updateArrowsHighlight(seleccionIds);
    else updateArrowsHighlight(new Set());
    arrowFrame = null;
  });
}

// ── Render principal (sin cambios) ──────────────────────────────────
function render() {
  if (!carreraActual) return;
  const canvas = document.getElementById('pensum-canvas');
  canvas.innerHTML = '<svg class="arrows" id="arrows-svg"></svg>';
  cardEls = {};

  let semestresMostrar;
  if (segundaCarreraId && segundaCarreraData) {
    semestresMostrar = pensumFusionado;
  } else {
    semestresMostrar = carreraActual.semestres.map(s => ({
      numero: s.numero,
      creditos: s.creditos,
      materias: s.materias.map(m => ({ ...m, carreraOrigen: carreraActual.id, homologacion: null }))
    }));
    buildGlobalMap(semestresMostrar);
  }

  const rowSem = document.createElement('div');
  rowSem.className = 'row-sem';
  for (const sem of semestresMostrar) {
    const col = document.createElement('div');
    col.className = 'sem-col';
    col.id = `semcol-${sem.numero}`;
    const visibles = vistaMode === 'disponible'
      ? sem.materias.filter(m => calcVisible(m.id) !== 'bloqueada')
      : sem.materias;
    const dispCount = sem.materias.filter(m => calcVisible(m.id) === 'disponible').length;
    const dispBadge = vistaMode === 'completa' && dispCount > 0
      ? `<div class="disponibles-count">${dispCount} disponible${dispCount > 1 ? 's' : ''}</div>` : '';
    col.innerHTML = `<div class="sem-head"><div class="sem-num">Semestre ${toRoman(sem.numero)}</div><div class="sem-cred">Cré. ${sem.creditos}</div>${dispBadge}</div><div class="sem-body" id="sb-${sem.numero}"></div>`;
    if (vistaMode === 'disponible' && visibles.length === 0) col.classList.add('vd-hidden');
    rowSem.appendChild(col);
  }
  canvas.insertBefore(rowSem, canvas.querySelector('svg'));

  for (const sem of semestresMostrar) {
    const body = canvas.querySelector(`#sb-${sem.numero}`);
    if (!body) continue;
    const list = vistaMode === 'disponible'
      ? sem.materias.filter(m => calcVisible(m.id) !== 'bloqueada')
      : sem.materias;
    list.forEach(m => {
      const card = makeCard(m);
      body.appendChild(card);
      cardEls[m.id] = card;
    });
  }

  seleccionIds.forEach(id => { if (cardEls[id]) cardEls[id].classList.add('sel-check'); });

  renderStats();
  invalidatePositions();
  scheduleDrawArrows();
}

function toRoman(n) {
  const r = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  return r[n] || n;
}

function renderStats() {
  let ap = 0, rep = 0, cur = 0, disp = 0, total = 0, credAp = 0, credTot = 0;
  Object.values(materiasMap).forEach(m => {
    total++; credTot += m.creditos;
    const e = (m.carreraOrigen === carreraActual?.id) ? getEstado(m.id) : getEstadoSegunda(m.id);
    const v = calcVisible(m.id);
    if (e === 'aprobada') { ap++; credAp += m.creditos; }
    if (e === 'reprobada') rep++;
    if (e === 'cursando') cur++;
    if (v === 'disponible') disp++;
  });
  const pct = credTot > 0 ? Math.round(credAp / credTot * 100) : 0;
  const modoBadge = vistaMode === 'disponible'
    ? `<div class="vista-badge disponible">✦ Vista: disponible para mí · ${disp} materias</div>`
    : `<div class="vista-badge completa">⊞ Vista: malla completa</div>`;
  let secondInfo = '';
  if (segundaCarreraId && segundaCarreraData) {
    let ap2 = 0, rep2 = 0, cur2 = 0;
    Object.values(materiasMap).forEach(m => {
      if (m.carreraOrigen === segundaCarreraId) {
        const e = getEstadoSegunda(m.id);
        if (e === 'aprobada') ap2++;
        if (e === 'reprobada') rep2++;
        if (e === 'cursando') cur2++;
      }
    });
    secondInfo = `<div class="spill ap">Segunda: ${ap2} ap · ${rep2} rep · ${cur2} cur</div>`;
  }
  document.getElementById('stats-bar').innerHTML = `
    ${modoBadge}
    <div class="spill ap">${ap} aprobadas · ${credAp} cr.</div>
    <div class="spill rep">${rep} reprobadas</div>
    <div class="spill cur">${cur} cursando</div>
    <div class="spill tot">${ap}/${total} materias · ${pct}%</div>
    ${secondInfo}
  `;
}

// ── Eventos de usuario (selección, arrastre, etc.) sin cambios ──────
let seleccionIds = new Set();
let isDragging = false;
let dragStarted = false;
let dragOrigin = null;
const DRAG_THRESHOLD = 5;
const selRect = document.createElement('div');
selRect.id = 'sel-rect';
document.body.appendChild(selRect);

function updateBulkBar() {
  const bar = document.getElementById('bulk-bar');
  const count = seleccionIds.size;
  if (count === 0) {
    bar.classList.remove('open');
    if (!activeId) updateArrowsHighlight(new Set());
    else updateArrowsHighlight(new Set([activeId]));
    return;
  }
  bar.classList.add('open');
  document.getElementById('bulk-count').textContent = `${count} materia${count > 1 ? 's' : ''} seleccionada${count > 1 ? 's' : ''}`;
  updateArrowsHighlight(seleccionIds);
}

function clearSeleccion() {
  seleccionIds.clear();
  seleccionModeBtn = false;
  const btnSel = document.getElementById('btn-seleccion');
  if (btnSel) btnSel.classList.remove('active');
  Object.values(cardEls).forEach(el => el.classList.remove('sel-check'));
  updateBulkBar();
}

function hitTestRect(x1, y1, x2, y2) {
  const left = Math.min(x1, x2), top = Math.min(y1, y2);
  const right = Math.max(x1, x2), bottom = Math.max(y1, y2);
  Object.entries(cardEls).forEach(([id, el]) => {
    const r = el.getBoundingClientRect();
    const hit = r.left < right && r.right > left && r.top < bottom && r.bottom > top;
    if (hit) { seleccionIds.add(id); el.classList.add('sel-check'); }
    else { seleccionIds.delete(id); el.classList.remove('sel-check'); }
  });
  updateBulkBar();
}

function initDragSelect() {
  const wrapper = document.querySelector('.canvas-wrapper');

  wrapper.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    if (e.target.closest('.mat-card') || e.target.closest('.bulk-bar')) return;
    isDragging = true;
    dragStarted = false;
    dragOrigin = { x: e.clientX, y: e.clientY };
    selRect.style.cssText = `display:none;left:${e.clientX}px;top:${e.clientY}px;width:0;height:0`;
  });

  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const dx = e.clientX - dragOrigin.x;
    const dy = e.clientY - dragOrigin.y;
    if (!dragStarted && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    if (!dragStarted) {
      dragStarted = true;
      clearSeleccion();
      clearActive();
      selRect.style.display = 'block';
    }
    const x1 = Math.min(dragOrigin.x, e.clientX);
    const y1 = Math.min(dragOrigin.y, e.clientY);
    const w = Math.abs(dx), h = Math.abs(dy);
    selRect.style.left = x1 + 'px';
    selRect.style.top = y1 + 'px';
    selRect.style.width = w + 'px';
    selRect.style.height = h + 'px';
    hitTestRect(x1, y1, x1 + w, y1 + h);
  });

  document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    selRect.style.display = 'none';
    dragStarted = false;
  });

  document.getElementById('btn-seleccion').addEventListener('click', () => {
    seleccionModeBtn = !seleccionModeBtn;
    document.getElementById('btn-seleccion').classList.toggle('active', seleccionModeBtn);
    if (!seleccionModeBtn) clearSeleccion();
  });
}

document.getElementById('bulk-bar').addEventListener('click', e => {
  const btn = e.target.closest('[data-bulk]');
  if (!btn) return;
  const action = btn.dataset.bulk;
  if (action === 'cancel') { clearSeleccion(); return; }
  for (const id of seleccionIds) {
    if (action === 'cursando' && !validarLimiteCreditos(id, action)) continue;
    setEstado(id, action === 'reset' ? null : action);
  }
  clearSeleccion();
  render();
});

// Restablecer todo (modal)
document.getElementById('btn-reset-all').addEventListener('click', () => {
  document.getElementById('modal-reset').classList.add('open');
});
document.getElementById('modal-cancel').addEventListener('click', () => {
  document.getElementById('modal-reset').classList.remove('open');
});
document.getElementById('modal-confirm').addEventListener('click', () => {
  estados = {};
  saveState();
  if (segundaCarreraId && segundaCarreraData) {
    const secondKey = ESTADO_KEY_BASE + segundaCarreraId;
    localStorage.setItem(secondKey, '{}');
    cargarEstadosSegundaCarrera();
  }
  document.getElementById('modal-reset').classList.remove('open');
  render();
});

// Delegación de eventos de clic y contexto
const pensumCanvas = document.getElementById('pensum-canvas');
pensumCanvas.addEventListener('click', (e) => {
  const card = e.target.closest('.mat-card');
  if (!card) return;
  const id = card.dataset.id;
  if (!id) return;
  e.stopPropagation();
  if (e.shiftKey || seleccionModeBtn || seleccionIds.size > 0) {
    if (seleccionIds.has(id)) { seleccionIds.delete(id); card.classList.remove('sel-check'); }
    else { seleccionIds.add(id); card.classList.add('sel-check'); }
    updateBulkBar();
    return;
  }
  if (activeId === id) clearActive(); else activateCard(id);
});
pensumCanvas.addEventListener('contextmenu', (e) => {
  const card = e.target.closest('.mat-card');
  if (!card) return;
  e.preventDefault();
  ctxTarget = card.dataset.id;
  showCtx(e.clientX, e.clientY);
});

function activateCard(id) {
  activeId = id;
  const m = materiasMap[id];
  if (!m) return;

  Object.values(cardEls).forEach(el => el.classList.remove('dim', 'highlight-req', 'highlight-dep'));
  const relIds = computeRelIds(new Set([id]));

  Object.entries(cardEls).forEach(([eid, el]) => {
    if (!relIds.has(eid)) { el.classList.add('dim'); return; }
    if (eid === id) return;
    if (m.prerreqs.includes(eid) || m.correqs.includes(eid)) el.classList.add('highlight-req');
    else el.classList.add('highlight-dep');
  });

  updateArrowsHighlight(new Set([id]));
  showDetail(id);
}

function clearActive() {
  activeId = null;
  Object.values(cardEls).forEach(el => el.classList.remove('dim', 'highlight-req', 'highlight-dep'));
  if (seleccionIds.size > 0) updateArrowsHighlight(seleccionIds);
  else updateArrowsHighlight(new Set());
  document.getElementById('detail-panel').classList.remove('open');
}

function showDetail(id) {
  const m = materiasMap[id];
  if (!m) return;
  document.getElementById('dp-codigo').textContent = m.codigo;
  document.getElementById('dp-nombre').textContent = m.nombre;

  let html = `<div class="dp-section"><div class="dp-stitle">Créditos</div><div style="font-size:13px;font-weight:600">${m.creditos} &nbsp;<span style="font-size:10px;color:var(--muted)">(HT: ${m.ht || 0} · HP: ${m.hp || 0})</span></div></div>`;

  if (m.prerreqs.length > 0) {
    html += `<div class="dp-section"><div class="dp-stitle">Prerrequisitos</div>`;
    m.prerreqs.forEach(pid => {
      const pm = materiasMap[pid];
      const ok = (pm?.carreraOrigen === carreraActual?.id) ? getEstado(pid) === 'aprobada' : getEstadoSegunda(pid) === 'aprobada';
      html += `<div class="dp-row ${ok ? 'ok' : 'fail'}">${ok ? '✓' : '✗'} ${pm ? pm.nombre : pid} <span style="margin-left:auto;font-size:9px;opacity:0.7">${pm ? pm.codigo : ''}</span></div>`;
    });
    html += `</div>`;
  } else {
    html += `<div class="dp-section"><div class="dp-stitle">Prerrequisitos</div><div class="dp-empty">Sin prerrequisitos</div></div>`;
  }

  if (m.correqs.length > 0) {
    html += `<div class="dp-section"><div class="dp-stitle">Correquisitos</div>`;
    m.correqs.forEach(cid => {
      const cm = materiasMap[cid];
      const ce = (cm?.carreraOrigen === carreraActual?.id) ? getEstado(cid) : getEstadoSegunda(cid);
      const ok = ce === 'cursando' || ce === 'aprobada';
      html += `<div class="dp-row ${ok ? 'co-ok' : 'co-fail'}">${ok ? '✓' : '✗'} ${cm ? cm.nombre : cid} <span style="margin-left:auto;font-size:9px;opacity:0.7">${cm ? cm.codigo : ''}</span></div>`;
    });
    html += `</div>`;
  }

  const deps = Object.values(materiasMap).filter(om => om.prerreqs.includes(id) || om.correqs.includes(id));
  if (deps.length > 0) {
    html += `<div class="dp-section"><div class="dp-stitle">Desbloquea</div>`;
    deps.forEach(dm => {
      html += `<div class="dp-row dep">→ ${dm.nombre} <span style="margin-left:auto;font-size:9px;opacity:0.7">${dm.codigo}</span></div>`;
    });
    html += `</div>`;
  }

  document.getElementById('dp-body').innerHTML = html;
  document.getElementById('detail-panel').classList.add('open');
}

function showCtx(x, y) {
  const menu = document.getElementById('ctx-menu');
  menu.style.display = 'block';
  const mw = 180, mh = 150;
  menu.style.left = (x + mw > window.innerWidth ? x - mw : x) + 'px';
  menu.style.top = (y + mh > window.innerHeight ? y - mh : y) + 'px';
}

document.getElementById('ctx-menu').addEventListener('click', e => {
  const item = e.target.closest('.ctx-item');
  if (!item || !ctxTarget) return;
  const action = item.dataset.action;
  const materia = materiasMap[ctxTarget];
  if (!materia) return;
  if (materia.carreraOrigen === carreraActual?.id) {
    setEstado(ctxTarget, action === 'reset' ? null : action);
  } else if (segundaCarreraId && materia.carreraOrigen === segundaCarreraId) {
    const secondKey = ESTADO_KEY_BASE + segundaCarreraId;
    let secondEstadosLocal = {};
    try { secondEstadosLocal = JSON.parse(localStorage.getItem(secondKey) || '{}'); } catch { }
    if (action === 'reset') delete secondEstadosLocal[ctxTarget];
    else secondEstadosLocal[ctxTarget] = action;
    localStorage.setItem(secondKey, JSON.stringify(secondEstadosLocal));
    if (mapaHomologaciones[segundaCarreraId] && mapaHomologaciones[segundaCarreraId][ctxTarget]) {
      const hom = mapaHomologaciones[segundaCarreraId][ctxTarget];
      if (action === 'reset') delete estados[hom];
      else estados[hom] = action;
      saveState();
    }
    cargarEstadosSegundaCarrera();
  }
  document.getElementById('ctx-menu').style.display = 'none';
  render();
});

// ── Eventos globales ────────────────────────────────────────────────
document.addEventListener('click', e => {
  document.getElementById('ctx-menu').style.display = 'none';
  if (!e.target.closest('.mat-card') &&
    !e.target.closest('.detail-panel') &&
    !e.target.closest('.ctx-menu') &&
    !e.target.closest('.bulk-bar')) clearActive();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.getElementById('ctx-menu').style.display = 'none';
    document.getElementById('modal-reset').classList.remove('open');
    clearSeleccion();
    clearActive();
  }
  if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
    e.preventDefault();
    document.getElementById('search-input').focus();
  }
});

document.getElementById('dp-close').addEventListener('click', clearActive);

document.getElementById('view-toggle').addEventListener('click', e => {
  const btn = e.target.closest('.view-btn');
  if (!btn) return;
  vistaMode = btn.dataset.view;
  localStorage.setItem(VISTA_KEY, vistaMode);
  document.querySelectorAll('.view-btn').forEach(b => b.classList.toggle('active', b.dataset.view === vistaMode));
  clearActive();
  render();
});

let resizeTimer;
window.addEventListener('resize', () => {
  if (carreraActual) {
    invalidatePositions();
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => scheduleDrawArrows(), 100);
  }
});
const wrapperScroll = document.querySelector('.canvas-wrapper');
wrapperScroll.addEventListener('scroll', () => {
  if (carreraActual) {
    invalidatePositions();
    scheduleDrawArrows();
  }
});

// ── Buscador ────────────────────────────────────────────────────────
function applySearch(q) {
  searchQuery = q.trim().toLowerCase();
  const svg = document.getElementById('arrows-svg');

  if (!searchQuery) {
    Object.values(cardEls).forEach(el => el.classList.remove('dim', 'search-match'));
    if (svg) svg.querySelectorAll('path').forEach(p => { p.setAttribute('opacity', '0.5'); p.setAttribute('stroke-width', '1.2'); });
    if (activeId) updateArrowsHighlight(new Set([activeId]));
    else if (seleccionIds.size) updateArrowsHighlight(seleccionIds);
    else updateArrowsHighlight(new Set());
    return;
  }

  clearActive();
  const matchIds = new Set();
  Object.values(materiasMap).forEach(m => {
    if (m.nombre.toLowerCase().includes(searchQuery) || m.codigo.toLowerCase().includes(searchQuery))
      matchIds.add(m.id);
  });

  Object.entries(cardEls).forEach(([id, el]) => {
    el.classList.remove('search-match');
    if (matchIds.has(id)) { el.classList.remove('dim'); el.classList.add('search-match'); }
    else el.classList.add('dim');
  });

  if (svg) svg.querySelectorAll('path').forEach(p => { p.setAttribute('opacity', '0.05'); p.setAttribute('stroke-width', '1.2'); });

  if (matchIds.size === 1) {
    const id = [...matchIds][0];
    const el = cardEls[id];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
  }
}

document.getElementById('search-input').addEventListener('input', e => applySearch(e.target.value));
document.getElementById('search-clear').addEventListener('click', () => {
  document.getElementById('search-input').value = '';
  applySearch('');
  document.getElementById('search-input').focus();
});

// ── Cambio de carrera y segunda carrera (sin restricción de primer semestre) ──
function clearAllSelectionAndActive() {
  clearSeleccion();
  clearActive();
  seleccionModeBtn = false;
  const btnSel = document.getElementById('btn-seleccion');
  if (btnSel) btnSel.classList.remove('active');
  document.getElementById('search-input').value = '';
  applySearch('');
  document.getElementById('ctx-menu').style.display = 'none';
  document.getElementById('modal-reset').classList.remove('open');
}

function setCarrera(id) {
  clearAllSelectionAndActive();
  carreraActual = PENSUMS.find(c => c.id === id);
  if (!carreraActual) return;
  loadState();
  const savedSecond = localStorage.getItem(SEGUNDA_CARRERA_KEY);
  if (savedSecond && savedSecond !== id && PENSUMS.find(c => c.id === savedSecond)) {
    setSegundaCarrera(savedSecond);
  } else {
    setSegundaCarrera('');
  }
  document.getElementById('h-titulo').textContent = carreraActual.nombre.split('—')[0].trim();
  document.getElementById('h-sub').textContent = (carreraActual.nombre.split('—')[1] || '').trim() + (carreraActual.creditos_totales ? ` · ${carreraActual.creditos_totales} créditos totales` : '');
  render();
}

function setSegundaCarrera(secondId) {
  const sel2 = document.getElementById('segunda-carrera-select');

  // Validación de compatibilidad (sin restricción de primer semestre)
  if (secondId && CARRERAS_COMPATIBLES[carreraActual.id] && !CARRERAS_COMPATIBLES[carreraActual.id].includes(secondId)) {
    alert(`❌ La carrera ${PENSUMS.find(c => c.id === secondId)?.nombre} no es compatible con ${carreraActual.nombre} para doble programa.`);
    sel2.value = segundaCarreraId || '';
    return;
  }

  if (!secondId) {
    segundaCarreraId = null;
    segundaCarreraData = null;
    secondEstados = {};
    pensumFusionado = null;
    const semPrinc = carreraActual.semestres.map(s => ({
      numero: s.numero,
      creditos: s.creditos,
      materias: s.materias.map(m => ({ ...m, carreraOrigen: carreraActual.id, homologacion: null }))
    }));
    buildGlobalMap(semPrinc);
    mapaHomologaciones = {};
    localStorage.setItem(SEGUNDA_CARRERA_KEY, '');
    render();
    return;
  }

  segundaCarreraId = secondId;
  segundaCarreraData = PENSUMS.find(c => c.id === segundaCarreraId);
  if (!segundaCarreraData) {
    segundaCarreraId = null;
    return;
  }
  cargarEstadosSegundaCarrera();
  pensumFusionado = fusionarPensums(carreraActual, segundaCarreraData);
  buildGlobalMap(pensumFusionado);
  localStorage.setItem(SEGUNDA_CARRERA_KEY, segundaCarreraId);
  render();
}

// ── Inicialización ──────────────────────────────────────────────────
function init() {
  vistaMode = localStorage.getItem(VISTA_KEY) || 'completa';
  document.querySelectorAll('.view-btn').forEach(b => b.classList.toggle('active', b.dataset.view === vistaMode));

  const sel = document.getElementById('carrera-select');
  const sel2 = document.getElementById('segunda-carrera-select');

  PENSUMS.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.nombre;
    sel.appendChild(opt);
    const opt2 = document.createElement('option');
    opt2.value = c.id;
    opt2.textContent = c.nombre;
    sel2.appendChild(opt2);
  });

  const savedCarrera = localStorage.getItem(CARRERA_KEY) || PENSUMS[0]?.id;
  sel.value = savedCarrera || PENSUMS[0]?.id;
  setCarrera(sel.value);

  sel.addEventListener('change', () => {
    localStorage.setItem(CARRERA_KEY, sel.value);
    setCarrera(sel.value);
  });

  sel2.addEventListener('change', () => {
    setSegundaCarrera(sel2.value);
  });

  initDragSelect();
}

init();
// ── Sistema de Cambio de Carrera ─────────────────────────────────────────

let ccMateriasSeleccionadas = new Set();
let ccResultadoHomologacion = null;

function abrirModalCambioCarrera() {
  const modal = document.getElementById('modal-cambio-carrera');
  const selOrigen = document.getElementById('cc-origen');
  const selDestino = document.getElementById('cc-destino');
  const selSemestre = document.getElementById('cc-semestre');

  // Poblar selects de carrera
  selOrigen.innerHTML = '';
  selDestino.innerHTML = '';
  PENSUMS.forEach(c => {
    selOrigen.innerHTML += `<option value="${c.id}">${c.nombre}</option>`;
    selDestino.innerHTML += `<option value="${c.id}">${c.nombre}</option>`;
  });

  // Por defecto: origen = carrera actual, destino = otra
  if (carreraActual) {
    selOrigen.value = carreraActual.id;
    const otraCarrera = PENSUMS.find(c => c.id !== carreraActual.id);
    if (otraCarrera) selDestino.value = otraCarrera.id;
  }

  ccMateriasSeleccionadas = new Set();
  ccResultadoHomologacion = null;

  document.getElementById('cc-preview').style.display = 'none';
  document.getElementById('cc-aplicar').style.display = 'none';
  document.getElementById('cc-preview-btn').style.display = '';

  actualizarSemestresCC();
  actualizarMateriasCC();
  modal.classList.add('open');
}

function actualizarSemestresCC() {
  const origenId = document.getElementById('cc-origen').value;
  const pensum = PENSUMS.find(c => c.id === origenId);
  const selSemestre = document.getElementById('cc-semestre');
  selSemestre.innerHTML = '';
  if (!pensum) return;
  pensum.semestres.forEach(s => {
    selSemestre.innerHTML += `<option value="${s.numero}">Semestre ${s.numero}</option>`;
  });
  // Por defecto: último semestre con materias aprobadas en el estado actual, o semestre 1
  const maxSem = carreraActual?.id === origenId
    ? (() => {
        let max = 1;
        for (const s of pensum.semestres) {
          const tieneAprobadas = s.materias.some(m => getEstado(m.id) === 'aprobada');
          if (tieneAprobadas) max = s.numero;
        }
        return max;
      })()
    : 1;
  selSemestre.value = maxSem;
}

function actualizarMateriasCC() {
  const origenId = document.getElementById('cc-origen').value;
  const semestreNum = parseInt(document.getElementById('cc-semestre').value);
  const pensum = PENSUMS.find(c => c.id === origenId);
  const contenedor = document.getElementById('cc-materias-list');
  ccMateriasSeleccionadas = new Set();

  if (!pensum) {
    contenedor.innerHTML = '<span class="cc-empty">Selecciona una carrera.</span>';
    return;
  }

  // Recopilar todas las materias hasta el semestre seleccionado
  const materiasHasta = [];
  for (const s of pensum.semestres) {
    if (s.numero <= semestreNum) {
      materiasHasta.push(...s.materias.map(m => ({ ...m, semNum: s.numero })));
    }
  }

  if (materiasHasta.length === 0) {
    contenedor.innerHTML = '<span class="cc-empty">No hay materias disponibles.</span>';
    return;
  }

  // Pre-seleccionar las que ya están aprobadas en la carrera actual
  if (carreraActual?.id === origenId) {
    materiasHasta.forEach(m => {
      if (getEstado(m.id) === 'aprobada') ccMateriasSeleccionadas.add(m.id);
    });
  }

  // Renderizar chips
  contenedor.innerHTML = '';
  materiasHasta.forEach(m => {
    const chip = document.createElement('div');
    chip.className = 'cc-chip' + (ccMateriasSeleccionadas.has(m.id) ? ' selected' : '');
    chip.dataset.id = m.id;
    chip.title = `Sem ${m.semNum} · ${m.creditos} créditos`;
    chip.textContent = `${m.codigo} ${m.nombre}`;
    chip.addEventListener('click', () => {
      if (ccMateriasSeleccionadas.has(m.id)) {
        ccMateriasSeleccionadas.delete(m.id);
        chip.classList.remove('selected');
      } else {
        ccMateriasSeleccionadas.add(m.id);
        chip.classList.add('selected');
      }
    });
    contenedor.appendChild(chip);
  });
}

function calcularHomologacion() {
  const origenId = document.getElementById('cc-origen').value;
  const destinoId = document.getElementById('cc-destino').value;

  if (origenId === destinoId) {
    alert('La carrera origen y destino deben ser diferentes.');
    return null;
  }

  const pensumOrigen = PENSUMS.find(c => c.id === origenId);
  const pensumDestino = PENSUMS.find(c => c.id === destinoId);
  if (!pensumOrigen || !pensumDestino) return null;

  const materiasOrigen = pensumOrigen.semestres.flatMap(s => s.materias);
  const materiasDestino = pensumDestino.semestres.flatMap(s => s.materias);

  const resultados = [];
  let homologadas = 0;
  let noHomologadas = 0;

  for (const idAprobado of ccMateriasSeleccionadas) {
    const mOrigen = materiasOrigen.find(m => m.id === idAprobado);
    if (!mOrigen) continue;

    // Buscar equivalente en destino
    let mejorMatch = null;
    let mejorSim = 0;
    for (const mDest of materiasDestino) {
      if (mOrigen.codigo === mDest.codigo) {
        mejorMatch = mDest;
        mejorSim = 1;
        break;
      }
      const nom1 = normalizarTexto(mOrigen.nombre);
      const nom2 = normalizarTexto(mDest.nombre);
      const sim = similitudCadenas(nom1, nom2);
      if (sim > mejorSim && sim > 0.75) {
        mejorSim = sim;
        mejorMatch = mDest;
      }
    }

    resultados.push({
      origen: mOrigen,
      destino: mejorMatch,
      similitud: mejorSim,
      homologada: mejorMatch !== null
    });

    if (mejorMatch) homologadas++;
    else noHomologadas++;
  }

  return { resultados, homologadas, noHomologadas, pensumDestino, destinoId };
}

function mostrarPreviewHomologacion() {
  ccResultadoHomologacion = calcularHomologacion();
  if (!ccResultadoHomologacion) return;

  const { resultados, homologadas, noHomologadas } = ccResultadoHomologacion;
  const preview = document.getElementById('cc-preview');
  const body = document.getElementById('cc-preview-body');

  if (resultados.length === 0) {
    body.innerHTML = '<div style="font-size:13px;color:#64748b;padding:8px 0">No seleccionaste materias aprobadas. Selecciona al menos una para ver la homologación.</div>';
    preview.style.display = 'block';
    document.getElementById('cc-aplicar').style.display = 'none';
    return;
  }

  let html = '';
  // Mostrar las homologadas primero
  const hom = resultados.filter(r => r.homologada);
  const noHom = resultados.filter(r => !r.homologada);

  if (hom.length > 0) {
    html += `<div style="font-size:11px;font-weight:700;color:#15803d;text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px">✓ Homologadas (${hom.length})</div>`;
    hom.forEach(r => {
      html += `<div class="cc-hom-row">
        <div class="cc-hom-orig">${r.origen.codigo} ${r.origen.nombre}</div>
        <div class="cc-hom-arrow">→</div>
        <div class="cc-hom-dest match">${r.destino.codigo} ${r.destino.nombre}</div>
      </div>`;
    });
  }
  if (noHom.length > 0) {
    html += `<div style="font-size:11px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:.04em;margin:10px 0 6px">✗ Sin equivalente (${noHom.length})</div>`;
    noHom.forEach(r => {
      html += `<div class="cc-hom-row">
        <div class="cc-hom-orig">${r.origen.codigo} ${r.origen.nombre}</div>
        <div class="cc-hom-arrow">→</div>
        <div class="cc-hom-dest no-match">Sin materia equivalente</div>
      </div>`;
    });
  }

  const total = resultados.length;
  html += `<div class="cc-stats">
    <div class="cc-stat"><div class="cc-stat-val blue">${total}</div><div class="cc-stat-lbl">Materias aprobadas</div></div>
    <div class="cc-stat"><div class="cc-stat-val green">${homologadas}</div><div class="cc-stat-lbl">Homologadas</div></div>
    <div class="cc-stat"><div class="cc-stat-val red">${noHomologadas}</div><div class="cc-stat-lbl">Sin equivalente</div></div>
    <div class="cc-stat"><div class="cc-stat-val blue">${homologadas > 0 ? Math.round(homologadas/total*100) : 0}%</div><div class="cc-stat-lbl">Cobertura</div></div>
  </div>`;

  body.innerHTML = html;
  preview.style.display = 'block';
  document.getElementById('cc-aplicar').style.display = homologadas > 0 ? '' : 'none';
}

function aplicarCambioCarrera() {
  if (!ccResultadoHomologacion) return;
  const { resultados, destinoId } = ccResultadoHomologacion;

  // Cambiar a la carrera destino
  const selPrincipal = document.getElementById('carrera-select');
  selPrincipal.value = destinoId;
  localStorage.setItem(CARRERA_KEY, destinoId);
  carreraActual = PENSUMS.find(c => c.id === destinoId);
  loadState();

  // Limpiar estados destino
  estados = {};

  // Marcar las materias homologadas como aprobadas en destino
  const hom = resultados.filter(r => r.homologada);
  hom.forEach(r => {
    estados[r.destino.id] = 'aprobada';
  });
  saveState();

  // Cerrar modal y actualizar vista
  document.getElementById('modal-cambio-carrera').classList.remove('open');
  setSegundaCarrera('');
  document.getElementById('segunda-carrera-select').value = '';
  document.getElementById('h-titulo').textContent = carreraActual.nombre.split('—')[0].trim();
  document.getElementById('h-sub').textContent = (carreraActual.nombre.split('—')[1] || '').trim() + (carreraActual.creditos_totales ? ` · ${carreraActual.creditos_totales} créditos totales` : '');
  buildGlobalMap(carreraActual.semestres.map(s => ({ ...s, materias: s.materias.map(m => ({ ...m, carreraOrigen: carreraActual.id })) })));
  render();

  alert(`✓ Cambio de carrera aplicado. Se homologaron ${hom.length} materia(s) como aprobadas en ${carreraActual.nombre}.`);
}

// Event listeners del modal
document.getElementById('btn-cambio-carrera').addEventListener('click', abrirModalCambioCarrera);
document.getElementById('cc-cancel').addEventListener('click', () => {
  document.getElementById('modal-cambio-carrera').classList.remove('open');
});
document.getElementById('cc-origen').addEventListener('change', () => {
  actualizarSemestresCC();
  actualizarMateriasCC();
  document.getElementById('cc-preview').style.display = 'none';
  document.getElementById('cc-aplicar').style.display = 'none';
});
document.getElementById('cc-semestre').addEventListener('change', () => {
  actualizarMateriasCC();
  document.getElementById('cc-preview').style.display = 'none';
  document.getElementById('cc-aplicar').style.display = 'none';
});
document.getElementById('cc-destino').addEventListener('change', () => {
  document.getElementById('cc-preview').style.display = 'none';
  document.getElementById('cc-aplicar').style.display = 'none';
});
document.getElementById('cc-preview-btn').addEventListener('click', mostrarPreviewHomologacion);
document.getElementById('cc-aplicar').addEventListener('click', aplicarCambioCarrera);
