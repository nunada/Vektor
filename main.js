// =========================================================
// MATEMATIKA I — S1 TEKNIK SIPIL — UNESA
// Interaksi: toggle jawaban latihan + widget vektor SVG
// =========================================================

document.addEventListener('DOMContentLoaded', () => {

  // ---- Toggle latihan / jawaban ----
  document.querySelectorAll('.practice-q').forEach(q => {
    q.addEventListener('click', () => {
      q.closest('.practice').classList.toggle('open');
    });
  });

  // ---- Widget 1: Penjumlahan vektor (drag ujung u dan v) ----
  initAddWidget();

  // ---- Widget 2: Perkalian skalar (slider k) ----
  initScalarWidget();

  // ---- Widget 3: Sudut & hasil kali titik (slider sudut) ----
  initDotWidget();

  // ---- Widget 4: Luas jajar genjang via hasil kali silang (drag) ----
  initCrossWidget();

});

/* ---------------------------------------------------------
   Util: konversi koordinat "matematis" (pusat, y ke atas)
   ke koordinat SVG (origin kiri-atas, y ke bawah)
--------------------------------------------------------- */
function toSvg(cx, cy, scale, x, y){
  return { x: cx + x * scale, y: cy - y * scale };
}

function makeArrow(svgNS, x1, y1, x2, y2, color, widthPx){
  const g = document.createElementNS(svgNS, 'g');
  const line = document.createElementNS(svgNS, 'line');
  line.setAttribute('x1', x1); line.setAttribute('y1', y1);
  line.setAttribute('x2', x2); line.setAttribute('y2', y2);
  line.setAttribute('stroke', color);
  line.setAttribute('stroke-width', widthPx || 2.5);
  line.setAttribute('stroke-linecap', 'round');
  g.appendChild(line);

  const angle = Math.atan2(y2 - y1, x2 - x1);
  const headLen = 10;
  const p1x = x2 - headLen * Math.cos(angle - Math.PI / 7);
  const p1y = y2 - headLen * Math.sin(angle - Math.PI / 7);
  const p2x = x2 - headLen * Math.cos(angle + Math.PI / 7);
  const p2y = y2 - headLen * Math.sin(angle + Math.PI / 7);
  const head = document.createElementNS(svgNS, 'polygon');
  head.setAttribute('points', `${x2},${y2} ${p1x},${p1y} ${p2x},${p2y}`);
  head.setAttribute('fill', color);
  g.appendChild(head);
  return g;
}

function gridBackground(svg, svgNS, w, h, cx, cy, scale){
  const grp = document.createElementNS(svgNS, 'g');
  for (let gx = -10; gx <= 10; gx++){
    const x = cx + gx * scale;
    if (x < 0 || x > w) continue;
    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', x); line.setAttribute('y1', 0);
    line.setAttribute('x2', x); line.setAttribute('y2', h);
    line.setAttribute('stroke', 'rgba(163,201,230,0.10)');
    line.setAttribute('stroke-width', 1);
    grp.appendChild(line);
  }
  for (let gy = -10; gy <= 10; gy++){
    const y = cy - gy * scale;
    if (y < 0 || y > h) continue;
    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', 0); line.setAttribute('y1', y);
    line.setAttribute('x2', w); line.setAttribute('y2', y);
    line.setAttribute('stroke', 'rgba(163,201,230,0.10)');
    line.setAttribute('stroke-width', 1);
    grp.appendChild(line);
  }
  // axes
  const axisX = document.createElementNS(svgNS, 'line');
  axisX.setAttribute('x1', 0); axisX.setAttribute('y1', cy);
  axisX.setAttribute('x2', w); axisX.setAttribute('y2', cy);
  axisX.setAttribute('stroke', 'rgba(163,201,230,0.35)');
  axisX.setAttribute('stroke-width', 1.2);
  grp.appendChild(axisX);
  const axisY = document.createElementNS(svgNS, 'line');
  axisY.setAttribute('x1', cx); axisY.setAttribute('y1', 0);
  axisY.setAttribute('x2', cx); axisY.setAttribute('y2', h);
  axisY.setAttribute('stroke', 'rgba(163,201,230,0.35)');
  axisY.setAttribute('stroke-width', 1.2);
  grp.appendChild(axisY);
  svg.appendChild(grp);
}

/* ---------------------------------------------------------
   Widget 1 — Penjumlahan vektor (aturan jajar genjang)
   Seret ujung u (oranye) dan v (biru) untuk mengubah resultan
--------------------------------------------------------- */
function initAddWidget(){
  const mount = document.getElementById('w-add');
  if (!mount) return;
  const svgNS = 'http://www.w3.org/2000/svg';
  const W = mount.clientWidth || 460, H = 300;
  const cx = W / 2, cy = H / 2, scale = 26;

  let u = { x: 3, y: 2 };
  let v = { x: 2, y: -2.5 };

  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', '100%');
  svg.style.touchAction = 'none';
  mount.innerHTML = '';
  mount.appendChild(svg);

  const out = {
    ux: document.getElementById('add-ux'), uy: document.getElementById('add-uy'),
    vx: document.getElementById('add-vx'), vy: document.getElementById('add-vy'),
    rx: document.getElementById('add-rx'), ry: document.getElementById('add-ry'),
    rmag: document.getElementById('add-rmag'),
  };

  function render(){
    svg.innerHTML = '';
    gridBackground(svg, svgNS, W, H, cx, cy, scale);

    const O = toSvg(cx, cy, scale, 0, 0);
    const U = toSvg(cx, cy, scale, u.x, u.y);
    const V = toSvg(cx, cy, scale, v.x, v.y);
    const R = toSvg(cx, cy, scale, u.x + v.x, u.y + v.y);

    // dashed parallelogram guides
    [[U, R], [V, R]].forEach(([a, b]) => {
      const l = document.createElementNS(svgNS, 'line');
      l.setAttribute('x1', a.x); l.setAttribute('y1', a.y);
      l.setAttribute('x2', b.x); l.setAttribute('y2', b.y);
      l.setAttribute('stroke', 'rgba(163,201,230,0.4)');
      l.setAttribute('stroke-width', 1.2);
      l.setAttribute('stroke-dasharray', '4 4');
      svg.appendChild(l);
    });

    svg.appendChild(makeArrow(svgNS, O.x, O.y, U.x, U.y, '#F2A81D', 3));
    svg.appendChild(makeArrow(svgNS, O.x, O.y, V.x, V.y, '#6FA8D8', 3));
    svg.appendChild(makeArrow(svgNS, O.x, O.y, R.x, R.y, '#E8542A', 3.4));

    // draggable handles
    [{ pt: U, key: 'u', color: '#F2A81D' }, { pt: V, key: 'v', color: '#6FA8D8' }].forEach(h => {
      const c = document.createElementNS(svgNS, 'circle');
      c.setAttribute('cx', h.pt.x); c.setAttribute('cy', h.pt.y);
      c.setAttribute('r', 9);
      c.setAttribute('fill', h.color);
      c.setAttribute('fill-opacity', '0.25');
      c.setAttribute('stroke', h.color);
      c.setAttribute('stroke-width', 2);
      c.style.cursor = 'grab';
      c.addEventListener('pointerdown', (e) => startDrag(e, h.key));
      svg.appendChild(c);
    });

    // labels
    addLabel(svg, svgNS, U.x, U.y - 12, 'u', '#F2A81D');
    addLabel(svg, svgNS, V.x, V.y - 12, 'v', '#6FA8D8');
    addLabel(svg, svgNS, R.x, R.y - 12, 'u+v', '#E8542A');

    if (out.ux){
      out.ux.textContent = u.x.toFixed(1); out.uy.textContent = u.y.toFixed(1);
      out.vx.textContent = v.x.toFixed(1); out.vy.textContent = v.y.toFixed(1);
      const rx = u.x + v.x, ry = u.y + v.y;
      out.rx.textContent = rx.toFixed(1); out.ry.textContent = ry.toFixed(1);
      out.rmag.textContent = Math.sqrt(rx * rx + ry * ry).toFixed(2);
    }
  }

  function startDrag(e, key){
    e.target.setPointerCapture(e.pointerId);
    function move(ev){
      const rect = svg.getBoundingClientRect();
      const scaleFactorX = W / rect.width;
      const px = (ev.clientX - rect.left) * scaleFactorX;
      const py = (ev.clientY - rect.top) * scaleFactorX;
      let mx = (px - cx) / scale;
      let my = -(py - cy) / scale;
      mx = Math.max(-8, Math.min(8, Math.round(mx * 2) / 2));
      my = Math.max(-5, Math.min(5, Math.round(my * 2) / 2));
      if (key === 'u') u = { x: mx, y: my }; else v = { x: mx, y: my };
      render();
    }
    function up(){
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    }
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  function addLabel(svg, svgNS, x, y, text, color){
    const t = document.createElementNS(svgNS, 'text');
    t.setAttribute('x', x); t.setAttribute('y', y);
    t.setAttribute('fill', color);
    t.setAttribute('font-family', 'IBM Plex Mono, monospace');
    t.setAttribute('font-size', '13');
    t.setAttribute('font-style', 'italic');
    t.textContent = text;
    svg.appendChild(t);
  }

  render();
  window.addEventListener('resize', () => {}, { passive: true });
}

/* ---------------------------------------------------------
   Widget 2 — Perkalian skalar k·v (slider)
--------------------------------------------------------- */
function initScalarWidget(){
  const mount = document.getElementById('w-scalar');
  const slider = document.getElementById('scalar-k');
  if (!mount || !slider) return;
  const svgNS = 'http://www.w3.org/2000/svg';
  const W = mount.clientWidth || 460, H = 260;
  const cx = W / 2, cy = H / 2, scale = 26;
  const base = { x: 2, y: 1.5 };

  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', '100%');
  mount.innerHTML = '';
  mount.appendChild(svg);

  const kLabel = document.getElementById('scalar-k-val');
  const out = { x: document.getElementById('scalar-x'), y: document.getElementById('scalar-y'), mag: document.getElementById('scalar-mag') };

  function render(){
    const k = parseFloat(slider.value);
    if (kLabel) kLabel.textContent = k.toFixed(1);
    svg.innerHTML = '';
    gridBackground(svg, svgNS, W, H, cx, cy, scale);
    const O = toSvg(cx, cy, scale, 0, 0);
    const V = toSvg(cx, cy, scale, base.x, base.y);
    const KV = toSvg(cx, cy, scale, k * base.x, k * base.y);
    svg.appendChild(makeArrow(svgNS, O.x, O.y, V.x, V.y, 'rgba(111,168,216,0.55)', 2));
    const color = k < 0 ? '#E8542A' : '#F2A81D';
    svg.appendChild(makeArrow(svgNS, O.x, O.y, KV.x, KV.y, color, 3.2));
    if (out.x){
      out.x.textContent = (k * base.x).toFixed(1);
      out.y.textContent = (k * base.y).toFixed(1);
      out.mag.textContent = (Math.abs(k) * Math.sqrt(base.x ** 2 + base.y ** 2)).toFixed(2);
    }
  }
  slider.addEventListener('input', render);
  render();
}

/* ---------------------------------------------------------
   Widget 3 — Sudut antara dua vektor & hasil kali titik
--------------------------------------------------------- */
function initDotWidget(){
  const mount = document.getElementById('w-dot');
  const slider = document.getElementById('dot-theta');
  if (!mount || !slider) return;
  const svgNS = 'http://www.w3.org/2000/svg';
  const W = mount.clientWidth || 460, H = 280;
  const cx = W / 2, cy = H / 2, scale = 90;

  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', '100%');
  mount.innerHTML = '';
  mount.appendChild(svg);

  const thetaLabel = document.getElementById('dot-theta-val');
  const out = { dot: document.getElementById('dot-value'), rel: document.getElementById('dot-relation') };

  function render(){
    const thetaDeg = parseFloat(slider.value);
    const theta = thetaDeg * Math.PI / 180;
    if (thetaLabel) thetaLabel.textContent = thetaDeg.toFixed(0) + '\u00B0';
    svg.innerHTML = '';
    gridBackground(svg, svgNS, W, H, cx, cy, scale);

    const O = toSvg(cx, cy, scale, 0, 0);
    const u = { x: 1.6, y: 0 };
    const v = { x: 1.6 * Math.cos(theta), y: 1.6 * Math.sin(theta) };
    const U = toSvg(cx, cy, scale, u.x, u.y);
    const V = toSvg(cx, cy, scale, v.x, v.y);

    // angle arc
    const arc = document.createElementNS(svgNS, 'path');
    const r = 32;
    const startX = O.x + r, startY = O.y;
    const endX = O.x + r * Math.cos(theta), endY = O.y - r * Math.sin(theta);
    const largeArc = thetaDeg > 180 ? 1 : 0;
    arc.setAttribute('d', `M ${startX} ${startY} A ${r} ${r} 0 ${largeArc} 0 ${endX} ${endY}`);
    arc.setAttribute('stroke', '#F2A81D');
    arc.setAttribute('stroke-width', 1.6);
    arc.setAttribute('fill', 'none');
    svg.appendChild(arc);

    svg.appendChild(makeArrow(svgNS, O.x, O.y, U.x, U.y, '#F2A81D', 3));
    svg.appendChild(makeArrow(svgNS, O.x, O.y, V.x, V.y, '#6FA8D8', 3));

    const dot = u.x * v.x + u.y * v.y;
    if (out.dot) out.dot.textContent = dot.toFixed(2);
    if (out.rel){
      let rel = 'lancip';
      if (Math.abs(dot) < 0.01) rel = 'tegak lurus (ortogonal)';
      else if (dot < 0) rel = 'tumpul';
      out.rel.textContent = rel;
    }
  }
  slider.addEventListener('input', render);
  render();
}

/* ---------------------------------------------------------
   Widget 4 — Luas jajar genjang dari |u × v| (2D, drag ujung)
--------------------------------------------------------- */
function initCrossWidget(){
  const mount = document.getElementById('w-cross');
  if (!mount) return;
  const svgNS = 'http://www.w3.org/2000/svg';
  const W = mount.clientWidth || 460, H = 300;
  const cx = W / 2, cy = H / 2, scale = 30;

  let a = { x: 3, y: 0.5 };
  let b = { x: 1, y: 2.5 };

  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', '100%');
  svg.style.touchAction = 'none';
  mount.innerHTML = '';
  mount.appendChild(svg);

  const out = { area: document.getElementById('cross-area'), z: document.getElementById('cross-z') };

  function render(){
    svg.innerHTML = '';
    gridBackground(svg, svgNS, W, H, cx, cy, scale);
    const O = toSvg(cx, cy, scale, 0, 0);
    const A = toSvg(cx, cy, scale, a.x, a.y);
    const B = toSvg(cx, cy, scale, b.x, b.y);
    const C = toSvg(cx, cy, scale, a.x + b.x, a.y + b.y);

    const poly = document.createElementNS(svgNS, 'polygon');
    poly.setAttribute('points', `${O.x},${O.y} ${A.x},${A.y} ${C.x},${C.y} ${B.x},${B.y}`);
    poly.setAttribute('fill', 'rgba(242,168,29,0.16)');
    poly.setAttribute('stroke', 'rgba(242,168,29,0.5)');
    poly.setAttribute('stroke-width', 1.2);
    svg.appendChild(poly);

    svg.appendChild(makeArrow(svgNS, O.x, O.y, A.x, A.y, '#F2A81D', 3));
    svg.appendChild(makeArrow(svgNS, O.x, O.y, B.x, B.y, '#6FA8D8', 3));

    [{ pt: A, key: 'a', color: '#F2A81D' }, { pt: B, key: 'b', color: '#6FA8D8' }].forEach(h => {
      const c = document.createElementNS(svgNS, 'circle');
      c.setAttribute('cx', h.pt.x); c.setAttribute('cy', h.pt.y);
      c.setAttribute('r', 9);
      c.setAttribute('fill', h.color);
      c.setAttribute('fill-opacity', '0.25');
      c.setAttribute('stroke', h.color);
      c.setAttribute('stroke-width', 2);
      c.style.cursor = 'grab';
      c.addEventListener('pointerdown', (e) => startDrag(e, h.key));
      svg.appendChild(c);
    });

    const cross_z = a.x * b.y - a.y * b.x;
    if (out.area) out.area.textContent = Math.abs(cross_z).toFixed(2);
    if (out.z) out.z.textContent = cross_z.toFixed(2);
  }

  function startDrag(e, key){
    e.target.setPointerCapture(e.pointerId);
    function move(ev){
      const rect = svg.getBoundingClientRect();
      const scaleFactorX = W / rect.width;
      const px = (ev.clientX - rect.left) * scaleFactorX;
      const py = (ev.clientY - rect.top) * scaleFactorX;
      let mx = (px - cx) / scale;
      let my = -(py - cy) / scale;
      mx = Math.max(-8, Math.min(8, Math.round(mx * 2) / 2));
      my = Math.max(-5, Math.min(5, Math.round(my * 2) / 2));
      if (key === 'a') a = { x: mx, y: my }; else b = { x: mx, y: my };
      render();
    }
    function up(){
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    }
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  render();
}
