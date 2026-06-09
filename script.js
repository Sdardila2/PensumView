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
  if (count === 0) { bar.classList.remove('open'); return; }
  bar.classList.add('open');
  document.getElementById('bulk-count').textContent = `${count} materia${count > 1 ? 's' : ''} seleccionada${count > 1 ? 's' : ''}`;
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

// Drag listeners se adjuntan sobre canvas-wrapper después del DOM
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

// ── Cards ───────────────────────────────────────────────────
function makeCard(m) {
  const div = document.createElement('div');
  const estado = calcVisible(m.id);
  const estClass = estado !== 'disponible' && estado !== 'bloqueada' ? `estado-${estado}` : '';
  div.className = `mat-card ${m.categoria} ${estClass}`.trim();
  div.dataset.id = m.id;

  const bloq = (estado === 'bloqueada' && !getEstado(m.id)) ? `<span class="mat-bloqueada-badge">🔒</span>` : '';
  div.innerHTML = `${bloq}<div class="mat-codigo">${m.codigo}</div><div class="mat-nombre">${m.nombre}</div><div class="mat-cred">Cr. ${m.creditos} (${m.ht || 0}, ${m.hp || 0})</div>`;

  div.addEventListener('click', e => {
    e.stopPropagation();
    // Shift+clic, modo botón activo, o clic cuando hay selección activa → toggle selección
    if (e.shiftKey || seleccionModeBtn || seleccionIds.size > 0) {
      if (seleccionIds.has(m.id)) { seleccionIds.delete(m.id); div.classList.remove('sel-check'); }
      else { seleccionIds.add(m.id); div.classList.add('sel-check'); }
      updateBulkBar();
      return;
    }
    if (activeId === m.id) clearActive(); else activateCard(m.id);
  });
  div.addEventListener('contextmenu', e => {
    e.preventDefault();
    ctxTarget = m.id; showCtx(e.clientX, e.clientY);
  });
  return div;
}

// ── Render ──────────────────────────────────────────────────
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

  // Restore selection visual after re-render
  seleccionIds.forEach(id => { if (cardEls[id]) cardEls[id].classList.add('sel-check'); });

  renderStats();
  requestAnimationFrame(() => drawArrows());
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

// ── Flechas ─────────────────────────────────────────────────
function drawArrows() {
  const svg = document.getElementById('arrows-svg');
  if (!svg) return;
  svg.innerHTML = '<defs><marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#94a3b8"/></marker><marker id="arr-co" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#f59e0b"/></marker></defs>';

  const canvas = document.getElementById('pensum-canvas');
  const cr = canvas.getBoundingClientRect();
  const scrollX = canvas.parentElement.scrollLeft;

  function center(el) {
    const r = el.getBoundingClientRect();
    return { x: r.left - cr.left + scrollX + r.width / 2, y: r.top - cr.top + r.height / 2 };
  }

  Object.values(materiasMap).forEach(m => {
    const toEl = cardEls[m.id];
    if (!toEl) return;
    const to = center(toEl);

    m.prerreqs.forEach(pid => {
      const fromEl = cardEls[pid];
      if (!fromEl) return;
      const from = center(fromEl);
      const mx = (from.x + to.x) / 2;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M${from.x},${from.y} C${mx},${from.y} ${mx},${to.y} ${to.x},${to.y}`);
      path.setAttribute('stroke', '#94a3b8');
      path.setAttribute('stroke-width', '1.2');
      path.setAttribute('fill', 'none');
      path.setAttribute('opacity', '0.5');
      path.setAttribute('marker-end', 'url(#arr)');
      path.dataset.from = pid; path.dataset.to = m.id; path.dataset.type = 'pre';
      svg.appendChild(path);
    });

    m.correqs.forEach(cid => {
      const fromEl = cardEls[cid];
      if (!fromEl) return;
      const from = center(fromEl);
      const mx = (from.x + to.x) / 2;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M${from.x},${from.y} C${mx},${from.y} ${mx},${to.y} ${to.x},${to.y}`);
      path.setAttribute('stroke', '#f59e0b');
      path.setAttribute('stroke-width', '1.2');
      path.setAttribute('stroke-dasharray', '4,3');
      path.setAttribute('fill', 'none');
      path.setAttribute('opacity', '0.5');
      path.setAttribute('marker-end', 'url(#arr-co)');
      path.dataset.from = cid; path.dataset.to = m.id; path.dataset.type = 'co';
      svg.appendChild(path);
    });
  });
}

// ── Activar / Detalles ───────────────────────────────────────
function activateCard(id) {
  activeId = id;
  const m = materiasMap[id];
  if (!m) return;

  Object.values(cardEls).forEach(el => el.classList.remove('dim', 'highlight-req', 'highlight-dep'));
  const relIds = new Set([id]);
  m.prerreqs.forEach(p => relIds.add(p));
  m.correqs.forEach(c => relIds.add(c));
  Object.values(materiasMap).forEach(om => { if (om.prerreqs.includes(id) || om.correqs.includes(id)) relIds.add(om.id); });

  Object.entries(cardEls).forEach(([eid, el]) => {
    if (!relIds.has(eid)) { el.classList.add('dim'); return; }
    if (eid === id) return;
    if (m.prerreqs.includes(eid) || m.correqs.includes(eid)) el.classList.add('highlight-req');
    else el.classList.add('highlight-dep');
  });

  const svg = document.getElementById('arrows-svg');
  if (svg) svg.querySelectorAll('path').forEach(p => {
    const isRel = p.dataset.from === id || p.dataset.to === id || relIds.has(p.dataset.from) && p.dataset.to === id || p.dataset.from === id;
    p.setAttribute('opacity', isRel ? '0.9' : '0.08');
    if (isRel) { p.setAttribute('stroke-width', '2'); }
  });

  showDetail(id);
}

function clearActive() {
  activeId = null;
  Object.values(cardEls).forEach(el => el.classList.remove('dim', 'highlight-req', 'highlight-dep'));
  const svg = document.getElementById('arrows-svg');
  if (svg) svg.querySelectorAll('path').forEach(p => { p.setAttribute('opacity', '0.5'); p.setAttribute('stroke-width', '1.2'); });
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

// ── Eventos globales ─────────────────────────────────────────
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

window.addEventListener('resize', () => { if (carreraActual) requestAnimationFrame(drawArrows); });

// ── Buscador ─────────────────────────────────────────────────
function applySearch(q) {
  searchQuery = q.trim().toLowerCase();
  const svg = document.getElementById('arrows-svg');

  if (!searchQuery) {
    Object.values(cardEls).forEach(el => el.classList.remove('dim', 'search-match'));
    if (svg) svg.querySelectorAll('path').forEach(p => { p.setAttribute('opacity', '0.5'); p.setAttribute('stroke-width', '1.2'); });
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