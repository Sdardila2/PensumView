const ESTADO_KEY = 'pensum_v2_estados';
const CARRERA_KEY = 'pensum_v2_carrera';
const VISTA_KEY = 'pensum_v2_vista';
let estados = {};
let carreraActual = null;
let materiasMap = {};
let cardEls = {};
let ctxTarget = null;
let activeId = null;
let vistaMode = 'completa';
let searchQuery = '';
let seleccionModeBtn = false;

// ── Selección por arrastre ──────────────────────────────────
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
  seleccionIds.forEach(id => setEstado(id, action === 'reset' ? null : action));
  clearSeleccion();
  render();
});

// ── Restablecer todo ────────────────────────────────────────
document.getElementById('btn-reset-all').addEventListener('click', () => {
  document.getElementById('modal-reset').classList.add('open');
});
document.getElementById('modal-cancel').addEventListener('click', () => {
  document.getElementById('modal-reset').classList.remove('open');
});
document.getElementById('modal-confirm').addEventListener('click', () => {
  estados = {};
  saveState();
  document.getElementById('modal-reset').classList.remove('open');
  render();
});

// ── Estado ──────────────────────────────────────────────────
function loadState() {
  try { estados = JSON.parse(localStorage.getItem(ESTADO_KEY) || '{}'); } catch { estados = {}; }
}
function saveState() { localStorage.setItem(ESTADO_KEY, JSON.stringify(estados)); }
function getEstado(id) { return estados[id] || null; }
function setEstado(id, val) { if (val) estados[id] = val; else delete estados[id]; saveState(); }

function calcVisible(id) {
  const e = getEstado(id);
  if (e) return e;
  const m = materiasMap[id];
  if (!m) return 'disponible';
  const prereqsOk = m.prerreqs.every(pid => getEstado(pid) === 'aprobada');
  const correqsOk = m.correqs.every(cid => { const ce = getEstado(cid); return ce === 'cursando' || ce === 'aprobada'; });
  return (prereqsOk && correqsOk) ? 'disponible' : 'bloqueada';
}

function buildMap(carrera) {
  materiasMap = {};
  carrera.semestres.forEach(s => s.materias.forEach(m => { materiasMap[m.id] = { ...m, _sem: s.numero }; }));
  if (carrera.idiomas) carrera.idiomas.forEach(m => { materiasMap[m.id] = { ...m, _sem: m.semestre_ref }; });
}

// ── Cards optimizadas ───────────────────────────────────────
function makeCard(m) {
  const div = document.createElement('div');
  const estado = calcVisible(m.id);
  const estClass = estado !== 'disponible' && estado !== 'bloqueada' ? `estado-${estado}` : '';
  div.className = `mat-card ${m.categoria} ${estClass}`.trim();
  div.dataset.id = m.id;

  if (estado === 'bloqueada' && !getEstado(m.id)) {
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
  return div;
}

// ── Gestión de flechas y resaltado ──────────────────────────
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

// Calcula todas las materias relacionadas (prerreqs, correqs, y las que dependen) para un conjunto dado
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

// Actualiza la opacidad, color y grosor de las flechas según las materias activas
function updateArrowsHighlight(activeIds) {
  const svg = document.getElementById('arrows-svg');
  if (!svg) return;
  const paths = svg.querySelectorAll('path');
  if (activeIds.size === 0) {
    // Restaurar estilos base a todas las flechas
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
  // Primero, poner todas las flechas en estado atenuado (opacidad baja, colores base)
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
  // Luego resaltar las flechas relacionadas con las materias activas
  paths.forEach(path => {
    const from = path.dataset.from;
    const to = path.dataset.to;
    if (!from || !to) return;
    const isRelated = activeIds.has(from) || activeIds.has(to);
    if (isRelated) {
      path.setAttribute('opacity', '1');
      if (path.dataset.type === 'pre') {
        path.setAttribute('stroke', '#3b82f6'); // Azul brillante
        path.setAttribute('stroke-width', '2.5');
      } else if (path.dataset.type === 'co') {
        path.setAttribute('stroke', '#ea580c'); // Naranja intenso
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
    if (activeId) {
      updateArrowsHighlight(new Set([activeId]));
    } else if (seleccionIds.size > 0) {
      updateArrowsHighlight(seleccionIds);
    } else {
      updateArrowsHighlight(new Set());
    }
    arrowFrame = null;
  });
}

// ── Render principal ────────────────────────────────────────
function render() {
  if (!carreraActual) return;
  const canvas = document.getElementById('pensum-canvas');
  canvas.innerHTML = '<svg class="arrows" id="arrows-svg"></svg>';
  cardEls = {};

  const rowSem = document.createElement('div');
  rowSem.className = 'row-sem';

  carreraActual.semestres.forEach(sem => {
    const col = document.createElement('div');
    col.className = 'sem-col';
    col.id = `semcol-${sem.numero}`;

    const visibles = vistaMode === 'disponible'
      ? sem.materias.filter(m => { const v = calcVisible(m.id); return v !== 'bloqueada'; })
      : sem.materias;

    const dispCount = sem.materias.filter(m => calcVisible(m.id) === 'disponible').length;
    const dispBadge = vistaMode === 'completa' && dispCount > 0
      ? `<div class="disponibles-count">${dispCount} disponible${dispCount > 1 ? 's' : ''}</div>` : '';

    col.innerHTML = `<div class="sem-head"><div class="sem-num">Semestre ${toRoman(sem.numero)}</div><div class="sem-cred">Cré. ${sem.creditos}</div>${dispBadge}</div><div class="sem-body" id="sb-${sem.numero}"></div>`;

    if (vistaMode === 'disponible' && visibles.length === 0) col.classList.add('vd-hidden');
    rowSem.appendChild(col);
  });
  canvas.insertBefore(rowSem, canvas.querySelector('svg'));

  carreraActual.semestres.forEach(sem => {
    const body = canvas.querySelector(`#sb-${sem.numero}`);
    if (!body) return;
    const list = vistaMode === 'disponible'
      ? sem.materias.filter(m => { const v = calcVisible(m.id); return v !== 'bloqueada'; })
      : sem.materias;
    list.forEach(m => {
      const card = makeCard(m);
      body.appendChild(card);
      cardEls[m.id] = card;
    });
  });

  if (carreraActual.idiomas && carreraActual.idiomas.length > 0) {
    const rowId = document.createElement('div');
    rowId.className = 'row-idiomas';
    const nSem = carreraActual.semestres.length;
    const byRef = {};
    carreraActual.idiomas.forEach(m => { if (!byRef[m.semestre_ref]) byRef[m.semestre_ref] = []; byRef[m.semestre_ref].push(m); });
    let anyVisible = false;
    for (let i = 1; i <= nSem; i++) {
      const slot = document.createElement('div');
      slot.className = 'idioma-slot';
      const list = byRef[i] || [];
      const visibles = vistaMode === 'disponible'
        ? list.filter(m => { const v = calcVisible(m.id); return v !== 'bloqueada'; })
        : list;
      visibles.forEach(m => {
        const card = makeCard(m);
        slot.appendChild(card);
        cardEls[m.id] = card;
        anyVisible = true;
      });
      rowId.appendChild(slot);
    }
    if (!(vistaMode === 'disponible' && !anyVisible)) {
      canvas.insertBefore(rowId, canvas.querySelector('svg'));
    }
  }

  // Restore selection visual
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
    const e = getEstado(m.id);
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
  document.getElementById('stats-bar').innerHTML = `
    ${modoBadge}
    <div class="spill ap">${ap} aprobadas · ${credAp} cr.</div>
    <div class="spill rep">${rep} reprobadas</div>
    <div class="spill cur">${cur} cursando</div>
    <div class="spill tot">${ap}/${total} materias · ${pct}%</div>`;
}

// ── Delegación de eventos ───────────────────────────────────
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
  if (seleccionIds.size > 0) {
    updateArrowsHighlight(seleccionIds);
  } else {
    updateArrowsHighlight(new Set());
  }
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
      const ok = getEstado(pid) === 'aprobada';
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
      const ce = getEstado(cid);
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

// ── Menú contextual ──────────────────────────────────────────
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
  setEstado(ctxTarget, action === 'reset' ? null : action);
  document.getElementById('ctx-menu').style.display = 'none';
  render();
});

// ── Eventos globales optimizados ─────────────────────────────
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

// ── Buscador ─────────────────────────────────────────────────
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

// ── Init ─────────────────────────────────────────────────────
function init() {
  loadState();
  vistaMode = localStorage.getItem(VISTA_KEY) || 'completa';
  document.querySelectorAll('.view-btn').forEach(b => b.classList.toggle('active', b.dataset.view === vistaMode));
  const sel = document.getElementById('carrera-select');
  PENSUMS.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id; opt.textContent = c.nombre;
    sel.appendChild(opt);
  });
  const saved = localStorage.getItem(CARRERA_KEY) || PENSUMS[0]?.id;
  sel.value = saved || PENSUMS[0]?.id;
  setCarrera(sel.value);
  sel.addEventListener('change', () => { localStorage.setItem(CARRERA_KEY, sel.value); setCarrera(sel.value); });
  initDragSelect();
}

function setCarrera(id) {
  carreraActual = PENSUMS.find(c => c.id === id);
  if (!carreraActual) return;
  buildMap(carreraActual);
  document.getElementById('h-titulo').textContent = carreraActual.nombre.split('—')[0].trim();
  document.getElementById('h-sub').textContent = (carreraActual.nombre.split('—')[1] || '').trim() + (carreraActual.creditos_totales ? ` · ${carreraActual.creditos_totales} créditos totales` : '');
  render();
}

init();