/* ==========================================================
   views/analisis/grafico.js — Análisis Estadístico de Precios
   ========================================================== */

import { getBrandLogo } from '../../config/marcas.js';
import { obtenerCompetidoresUnicos } from '../../shared/competidores.js';
import { normalizarMarca, esCompetenciaExterna } from '../../shared/marcas.js';
import { cumpleSegmentacion } from '../../shared/segmentacion.js';
import { analisisState } from './state.js';

let chartCompInstancia = null;
let chartCoestiInstancia = null;

export function analyticsHTML() {
  return `
  <div class="analytics-shell" id="analytics-shell" style="display:none; flex-direction:column; width:100%; height:100%; padding:12px 16px; box-sizing:border-box;">
    
    <!-- HEADER -->
    <div class="analytics-header" style="margin-bottom: 6px; flex: 0 0 auto;">
      <h2 id="analytics-chart-title" style="font-family:'Poppins',sans-serif; font-size:1.15rem; font-weight:800; margin:0; color:var(--k-ink);">Dispersión de Precios</h2>
      <p id="analytics-chart-sub" style="font-size:0.72rem; color:var(--k-muted); margin:2px 0 0 0;"></p>
    </div>

    <!-- TARJETAS KPIS GENERALES (Modo DISTRIBUCION - 6 Cards Atómicas) -->
    <div class="analytics-kpis-grid" id="analytics-kpis-wrap" style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin-bottom: 10px; flex: 0 0 auto;">
      
      <!-- Card 1: Promedio Propio -->
      <div class="analytics-kpi-card" style="background:#fff; border:1px solid var(--k-line); border-radius:6px; padding:6px 10px;">
        <span style="font-size:0.58rem; font-weight:700; color:var(--k-muted); text-transform:uppercase;">Promedio COESTI</span>
        <div style="font-size:1.05rem; font-weight:800; color:#00D58A;" id="kpi-val-coesti">—</div>
        <span style="font-size:0.6rem; color:var(--k-muted);" id="kpi-sub-coesti">EESS Propias</span>
      </div>

      <!-- Card 2: Promedio Competencia -->
      <div class="analytics-kpi-card" style="background:#fff; border:1px solid var(--k-line); border-radius:6px; padding:6px 10px;">
        <span style="font-size:0.58rem; font-weight:700; color:var(--k-muted); text-transform:uppercase;">Promedio Comp.</span>
        <div style="font-size:1.05rem; font-weight:800; color:#0284C7;" id="kpi-val-comp">—</div>
        <span style="font-size:0.6rem; color:var(--k-muted);" id="kpi-sub-comp">Rivales Directos</span>
      </div>

      <!-- Card 3: Spread Diferencial -->
      <div class="analytics-kpi-card" style="background:#fff; border:1px solid var(--k-line); border-radius:6px; padding:6px 10px;">
        <span style="font-size:0.58rem; font-weight:700; color:var(--k-muted); text-transform:uppercase;">Spread Mercado</span>
        <div style="font-size:1.05rem; font-weight:800;" id="kpi-val-spread">—</div>
        <span style="font-size:0.6rem; color:var(--k-muted);">Diferencial Simple</span>
      </div>

      <!-- Card 4: Moda COESTI -->
      <div class="analytics-kpi-card" style="background:#fff; border:1px solid var(--k-line); border-radius:6px; padding:6px 10px;">
        <span style="font-size:0.58rem; font-weight:700; color:var(--k-muted); text-transform:uppercase;">Moda COESTI</span>
        <div style="font-size:1.05rem; font-weight:800; color:var(--k-ink);" id="kpi-val-moda">—</div>
        <span style="font-size:0.6rem; color:var(--k-muted);" id="kpi-sub-moda">—</span>
      </div>

      <!-- Card 5: Postura vs Rival -->
      <div class="analytics-kpi-card" style="background:#fff; border:1px solid var(--k-line); border-radius:6px; padding:6px 10px;">
        <span style="font-size:0.58rem; font-weight:700; color:var(--k-muted); text-transform:uppercase;">Postura vs Rival</span>
        <div style="font-size:1.05rem; font-weight:800; color:var(--k-ink);" id="kpi-val-postura">—</div>
        <span style="font-size:0.6rem; color:var(--k-muted);" id="kpi-sub-postura">% Sobre / Par / Bajo</span>
      </div>

      <!-- Card 6: Dispersión COESTI -->
      <div class="analytics-kpi-card" style="background:#fff; border:1px solid var(--k-line); border-radius:6px; padding:6px 10px;">
        <span style="font-size:0.58rem; font-weight:700; color:var(--k-muted); text-transform:uppercase;">Dispersión COESTI</span>
        <div style="font-size:1.05rem; font-weight:800; color:var(--k-ink);" id="kpi-val-dispersion">—</div>
        <span style="font-size:0.6rem; color:var(--k-muted);" id="kpi-sub-dispersion">IQR: —</span>
      </div>

    </div>

    <!-- CONTENEDOR 1: HISTOGRAMAS SIDE-BY-SIDE (Modo DISTRIBUCION) -->
    <div id="analytics-distribucion-wrap" style="flex: 0 0 auto; display: flex; gap: 12px; width: 100%; align-items: flex-start; margin-bottom: 14px;">
      
      <!-- Panel Competencia -->
      <div style="flex: 1 1 50%; display: flex; flex-direction: column; background: #fff; border: 1px solid var(--k-line); border-radius: 6px; padding: 12px 14px; position: relative; min-width: 0;">
        <span style="font-family:'Poppins',sans-serif; font-size:0.75rem; font-weight:700; color:#0284C7; margin-bottom:6px; flex-shrink: 0;">
          DISTRIBUCIÓN: COMPETENCIA
        </span>
        <!-- Altura fija para que nunca se encoja el gráfico -->
        <div id="canvas-comp-container" style="height: 320px; flex: 0 0 320px; position: relative; width: 100%;">
          <canvas id="chart-comp-canvas" style="position: absolute; inset: 0; width: 100%!important; height: 100%!important;"></canvas>
        </div>

        <!-- Cuadro Drill-down Debajo del Gráfico -->
        <div id="drilldown-comp-wrap" style="display: none; flex-direction: column; border-top: 1px solid var(--k-line); margin-top: 12px; padding-top: 10px; flex: 0 0 auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; flex-shrink: 0;">
            <span id="drilldown-comp-title" style="font-family:'Poppins',sans-serif; font-size:0.75rem; font-weight:700; color:#0284C7;">—</span>
            <button type="button" onclick="window.cerrarDrillDownBin('comp')" style="background:none; border:none; font-size:1.2rem; cursor:pointer; color:var(--k-muted); line-height:1; padding:0 4px;" title="Cerrar">&times;</button>
          </div>
          <div id="drilldown-comp-list" style="max-height: 290px; overflow-y: auto; display: flex; flex-direction: column; padding-right: 4px;"></div>
        </div>
      </div>

      <!-- Panel COESTI -->
      <div style="flex: 1 1 50%; display: flex; flex-direction: column; background: #fff; border: 1px solid var(--k-line); border-radius: 6px; padding: 12px 14px; position: relative; min-width: 0;">
        <span style="font-family:'Poppins',sans-serif; font-size:0.75rem; font-weight:700; color:#00D58A; margin-bottom:6px; flex-shrink: 0;">
          DISTRIBUCIÓN: COESTI (PROPIAS)
        </span>
        <!-- Altura fija para que nunca se encoja el gráfico -->
        <div id="canvas-coesti-container" style="height: 320px; flex: 0 0 320px; position: relative; width: 100%;">
          <canvas id="chart-coesti-canvas" style="position: absolute; inset: 0; width: 100%!important; height: 100%!important;"></canvas>
        </div>

        <!-- Cuadro Drill-down Debajo del Gráfico -->
        <div id="drilldown-coesti-wrap" style="display: none; flex-direction: column; border-top: 1px solid var(--k-line); margin-top: 12px; padding-top: 10px; flex: 0 0 auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; flex-shrink: 0;">
            <span id="drilldown-coesti-title" style="font-family:'Poppins',sans-serif; font-size:0.75rem; font-weight:700; color:#00D58A;">—</span>
            <button type="button" onclick="window.cerrarDrillDownBin('coesti')" style="background:none; border:none; font-size:1.2rem; cursor:pointer; color:var(--k-muted); line-height:1; padding:0 4px;" title="Cerrar">&times;</button>
          </div>
          <div id="drilldown-coesti-list" style="max-height: 290px; overflow-y: auto; display: flex; flex-direction: column; padding-right: 4px;"></div>
        </div>
      </div>
    </div>

    <!-- CONTENEDOR 2: DOT-PLOT POR MARCAS (Modo MARCA) -->
    <div id="analytics-marca-wrap" style="flex: 1 1 0; min-height: 0; width: 100%; display: none; position: relative; background: #fff; border: 1px solid var(--k-line); border-radius: 6px; overflow: hidden;">
      
      <!-- CUADRANTE SUPERIOR IZQUIERDO: Competencia Bajo COESTI -->
      <div id="card-bajo-coesti" style="position: absolute; top: 16px; left: 20px; z-index: 10; background: #fff; border: 1px solid var(--k-line); border-left: 4px solid var(--k-indigo); border-radius: 5px; padding: 7px 13px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
        <div style="font-size: 0.58rem; font-weight: 700; color: var(--k-indigo); text-transform: uppercase;">Competencia Bajo COESTI</div>
        <div style="font-size: 0.55rem; color: var(--k-muted); margin-bottom: 2px;">Marcas bajo benchmark propio</div>
        <div style="display: flex; align-items: baseline; gap: 8px;">
          <span style="font-size: 1.1rem; font-weight: 800; color: var(--k-ink);" id="val-bajo-coesti">—</span>
          <span style="font-size: 0.65rem; font-weight: 700; color: var(--k-indigo);" id="eess-bajo-coesti">— EESS</span>
        </div>
      </div>

      <!-- CUADRANTE INFERIOR DERECHO: Competencia Sobre COESTI -->
      <div id="card-sobre-coesti" style="position: absolute; bottom: 95px; right: 20px; z-index: 10; background: #fff; border: 1px solid var(--k-line); border-left: 4px solid #D92D4E; border-radius: 5px; padding: 7px 13px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
        <div style="font-size: 0.58rem; font-weight: 700; color: #D92D4E; text-transform: uppercase;">Competencia Sobre COESTI</div>
        <div style="font-size: 0.55rem; color: var(--k-muted); margin-bottom: 2px;">Marcas sobre benchmark propio</div>
        <div style="display: flex; align-items: baseline; gap: 8px;">
          <span style="font-size: 1.1rem; font-weight: 800; color: var(--k-ink);" id="val-sobre-coesti">—</span>
          <span style="font-size: 0.65rem; font-weight: 700; color: #D92D4E;" id="eess-sobre-coesti">— EESS</span>
        </div>
      </div>

      <!-- SVG Render -->
      <div id="analytics-svg-wrap" style="width: 100%; height: 100%;"></div>
    </div>

  </div>
  `;
}

/* ---------- Cálculos Estadísticos Auxiliares ---------- */
function stats(arr) {
  if (!arr || arr.length === 0) {
    return { mean: 0, stdev: 0, min: 0, max: 0, count: 0, p25: 0, p75: 0, iqr: 0 };
  }
  const ordenados = [...arr].sort((a, b) => a - b);
  const n = ordenados.length;
  const mean = ordenados.reduce((a, b) => a + b, 0) / n;
  const variance = ordenados.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (n > 1 ? n - 1 : 1);

  const p25 = ordenados[Math.floor(n * 0.25)];
  const p75 = ordenados[Math.floor(n * 0.75)];

  return {
    mean,
    stdev: Math.sqrt(variance),
    min: ordenados[0],
    max: ordenados[n - 1],
    count: n,
    p25,
    p75,
    iqr: p75 - p25
  };
}

function pdfGauss(x, mean, stdev) {
  if (!stdev || stdev <= 0) return 0;
  return (1 / (stdev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / stdev, 2));
}

function calcularBenchmarkCOESTI(listaEstaciones, combustible) {
  let suma = 0, conteo = 0;
  listaEstaciones.forEach(est => {
    const propio = est.actores?.find(a => a.tipo_actor === 'PROPIO');
    const p = propio?.combustibles?.[combustible]?.precio;
    if (p && p > 0) { suma += p; conteo++; }
  });
  return conteo > 0 ? (suma / conteo) : 0;
}

/* ==========================================================
   Plugin Chart.js: Etiqueta numérica sobre la barra Modal
   ========================================================== */
const topModalLabelPlugin = {
  id: 'topModalLabelPlugin',
  afterDatasetsDraw(chart) {
    const { ctx } = chart;
    const barMeta = chart.getDatasetMeta(1); // Dataset de barras
    if (!barMeta || !barMeta.data || barMeta.data.length === 0) return;

    let maxVal = -1;
    let maxIndex = -1;

    chart.data.datasets[1].data.forEach((val, idx) => {
      if (val > maxVal) {
        maxVal = val;
        maxIndex = idx;
      }
    });

    if (maxVal <= 0 || maxIndex === -1) return;

    const barElement = barMeta.data[maxIndex];
    if (!barElement) return;

    ctx.save();
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillStyle = chart.data.datasets[1].borderColor || '#16182F';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    
    // Dibujar conteo y texto con padding superior de 3px
    ctx.fillText(`${maxVal} EESS`, barElement.x, barElement.y - 4);
    ctx.restore();
  }
};

/* ==========================================================
   External Tooltip Handler
   ========================================================== */
function externalTooltipHandler(context) {
  let tooltipEl = document.getElementById('chartjs-external-tooltip');

  if (!tooltipEl) {
    tooltipEl = document.createElement('div');
    tooltipEl.id = 'chartjs-external-tooltip';
    tooltipEl.style.background = 'rgba(22, 24, 47, 0.95)';
    tooltipEl.style.borderRadius = '5px';
    tooltipEl.style.color = '#fff';
    tooltipEl.style.opacity = '0';
    tooltipEl.style.pointerEvents = 'none';
    tooltipEl.style.position = 'fixed';
    tooltipEl.style.transition = 'all .1s ease';
    tooltipEl.style.zIndex = '99999';
    tooltipEl.style.padding = '8px 12px';
    tooltipEl.style.fontSize = '0.75rem';
    tooltipEl.style.fontFamily = "'Inter', sans-serif";
    tooltipEl.style.boxShadow = '0 4px 14px rgba(0,0,0,0.3)';
    document.body.appendChild(tooltipEl);
  }

  const { chart, tooltip } = context;
  if (tooltip.opacity === 0) {
    tooltipEl.style.opacity = '0';
    return;
  }

  const puntosVisibles = (tooltip.dataPoints || []).filter(dp => dp.dataset.type !== 'line');
  if (puntosVisibles.length === 0) {
    tooltipEl.style.opacity = '0';
    return;
  }

  let innerHtml = `<div style="font-weight:700; margin-bottom:4px; font-family:'Poppins',sans-serif; color:#fff;">${tooltip.title?.[0] || ''}</div>`;
  puntosVisibles.forEach(dp => {
    const colorBox = `<span style="display:inline-block; width:9px; height:9px; margin-right:6px; border-radius:2px; background:${dp.dataset.backgroundColor}; border:1px solid ${dp.dataset.borderColor};"></span>`;
    innerHtml += `<div style="display:flex; align-items:center; margin-top:2px; font-size:0.72rem; color:#E2E8F0;">${colorBox}Estaciones: ${dp.parsed.y}</div>`;
  });

  tooltipEl.innerHTML = innerHtml;
  const canvasRect = chart.canvas.getBoundingClientRect();
  tooltipEl.style.opacity = '1';
  tooltipEl.style.left = `${canvasRect.left + tooltip.caretX}px`;
  tooltipEl.style.top = `${canvasRect.top + tooltip.caretY}px`;
  tooltipEl.style.transform = 'translate(-50%, -115%)';
}

/* ==========================================================
   RENDER PRINCIPAL
   ========================================================== */
export function renderAnalisis(todasLasEstaciones) {
  const combustible = analisisState.producto || 'Diesel';
  const modo = (analisisState.modo === 'MARCA') ? 'MARCA' : 'DISTRIBUCION';

  const estaciones = todasLasEstaciones.filter(e =>
    cumpleSegmentacion(e, {
      gpc: analisisState.gpc,
      gop: analisisState.gop,
      jop: analisisState.jop,
      corredor: analisisState.corredor,
      departamento: analisisState.departamento,
      provincia: analisisState.provincia,
      distrito: analisisState.distrito,
    })
  );

  const benchmark = calcularBenchmarkCOESTI(estaciones, combustible);

  // Subtítulo
  const sub = document.getElementById('analytics-chart-sub');
  if (sub) {
    const filtros = [];
    if (analisisState.gpc && analisisState.gpc !== 'TODOS') filtros.push(`GPC: ${analisisState.gpc}`);
    if (analisisState.gop && analisisState.gop !== 'TODOS') filtros.push(`GOP: ${analisisState.gop}`);
    if (analisisState.jop && analisisState.jop !== 'TODOS') filtros.push(`JOP: ${analisisState.jop}`);
    if (analisisState.corredor && analisisState.corredor !== 'TODOS') filtros.push(`Corredor: ${analisisState.corredor}`);
    if (analisisState.departamento && analisisState.departamento !== 'TODOS') filtros.push(`Depto: ${analisisState.departamento}`);
    const tagFiltro = filtros.length ? `(${filtros.join(' · ')})` : '(Red Total)';
    sub.innerText = (modo === 'MARCA')
      ? `Promedio simple por marca vs COESTI ${tagFiltro}.`
      : `Distribución de frecuencias por rangos de precio ${tagFiltro}.`;
  }

  const distWrap = document.getElementById('analytics-distribucion-wrap');
  const marcaWrap = document.getElementById('analytics-marca-wrap');
  const kpisWrap = document.getElementById('analytics-kpis-wrap');

  if (modo === 'DISTRIBUCION') {
    if (distWrap) distWrap.style.display = 'flex';
    if (kpisWrap) kpisWrap.style.display = 'grid';
    if (marcaWrap) marcaWrap.style.display = 'none';
    renderModoDistribucion(estaciones, combustible);
  } else {
    if (distWrap) distWrap.style.display = 'none';
    if (kpisWrap) kpisWrap.style.display = 'none';
    if (marcaWrap) marcaWrap.style.display = 'block';
    destruirCharts();
    renderModoMarca(estaciones, combustible, benchmark);
  }
}

function destruirCharts() {
  if (chartCompInstancia) { chartCompInstancia.destroy(); chartCompInstancia = null; }
  if (chartCoestiInstancia) { chartCoestiInstancia.destroy(); chartCoestiInstancia = null; }
}

// Exponer handlers globales para los botones de cierre
window.cerrarDrillDownBin = function(tipo) {
  const wrap = document.getElementById(`drilldown-${tipo}-wrap`);
  if (wrap) wrap.style.display = 'none';
};

/* ==========================================================
   MODO 1: HISTOGRAMAS DINÁMICOS SIDE-BY-SIDE (Chart.js)
   ========================================================== */
function renderModoDistribucion(estaciones, combustible) {
  destruirCharts();
  window.cerrarDrillDownBin('comp');
  window.cerrarDrillDownBin('coesti');

  // 1. Propias COESTI (ya únicas a nivel de estación cabecera)
  const registrosCoesti = [];
  estaciones.forEach(est => {
    const propio = est.actores?.find(a => a.tipo_actor === 'PROPIO');
    const pPropio = propio?.combustibles?.[combustible]?.precio;
    if (pPropio && pPropio > 0) {
      registrosCoesti.push({
        nombre: est.estacion || est.estacion_cabecera || 'E/S PROPIA',
        marca: 'COESTI',
        precio: pPropio,
        departamento: est.departamento || '—',
        provincia: est.provincia || '—',
        distrito: est.distrito || '—',
        propioDe: null,
        distanciaKm: null,
        rivalidades: []
      });
    }
  });

  // 2. Competencia Deduplicada Globalmente
  const registrosComp = obtenerCompetidoresUnicos(estaciones, combustible);

  // 3. Postura Comercial (Se mantiene contextual por cada propia frente a sus rivales locales)
  let sobreMercadoCount = 0;
  let paridadCount = 0;
  let bajoMercadoCount = 0;
  let eessConRivalValido = 0;

  estaciones.forEach(est => {
    const propio = est.actores?.find(a => a.tipo_actor === 'PROPIO');
    const pPropio = propio?.combustibles?.[combustible]?.precio;
    const comps = (est.actores || []).filter(esCompetenciaExterna);
    const preciosRivalEstacion = [];
    comps.forEach(c => {
      const p = c.combustibles?.[combustible]?.precio;
      if (p && p > 0) preciosRivalEstacion.push(p);
    });

    if (pPropio && pPropio > 0 && preciosRivalEstacion.length > 0) {
      eessConRivalValido++;
      const pRivalMedio = preciosRivalEstacion.reduce((a, b) => a + b, 0) / preciosRivalEstacion.length;
      const diff = Math.round((pPropio - pRivalMedio) * 100) / 100;
      if (diff > 0.05) sobreMercadoCount++;
      else if (diff < -0.05) bajoMercadoCount++;
      else paridadCount++;
    }
  });

  const preciosCoesti = registrosCoesti.map(r => r.precio);
  const preciosComp = registrosComp.map(r => r.precio);
  const stCoesti = stats(preciosCoesti);
  const stComp = stats(preciosComp);
  const todos = [...preciosCoesti, ...preciosComp];

  if (todos.length === 0) return;

  const minVal = Math.min(...todos);
  const maxVal = Math.max(...todos);
  const rangoTotal = maxVal - minVal;
  const binStep = rangoTotal <= 4.0 ? 0.5 : 1.0;

  const minBin = Math.floor(minVal / binStep) * binStep;
  const maxBin = Math.ceil(maxVal / binStep) * binStep;

  const binsLabels = [];
  const binEdges = [];
  for (let b = minBin; b < maxBin; b = Number((b + binStep).toFixed(2))) {
    binEdges.push(b);
    binsLabels.push(`S/ ${b.toFixed(2)} - ${(b + binStep).toFixed(2)}`);
  }

  if (binEdges.length === 0) {
    binEdges.push(minBin);
    binsLabels.push(`S/ ${minBin.toFixed(2)} - ${(minBin + binStep).toFixed(2)}`);
  }

  function clasificarEnBins(registros) {
    const bins = binEdges.map(() => []);
    registros.forEach(r => {
      let idx = Math.floor((r.precio - minBin) / binStep);
      if (idx < 0) idx = 0;
      if (idx >= bins.length) idx = bins.length - 1;
      bins[idx].push(r);
    });
    return bins;
  }

  const itemsPorBinComp = clasificarEnBins(registrosComp);
  const itemsPorBinCoesti = clasificarEnBins(registrosCoesti);

  const freqComp = itemsPorBinComp.map(b => b.length);
  const freqCoesti = itemsPorBinCoesti.map(b => b.length);

  // KPIs
  const elCoesti = document.getElementById('kpi-val-coesti');
  const elSubCoesti = document.getElementById('kpi-sub-coesti');
  const elComp = document.getElementById('kpi-val-comp');
  const elSubComp = document.getElementById('kpi-sub-comp');
  const elSpread = document.getElementById('kpi-val-spread');
  const elModa = document.getElementById('kpi-val-moda');
  const elSubModa = document.getElementById('kpi-sub-moda');
  const elPostura = document.getElementById('kpi-val-postura');
  const elSubPostura = document.getElementById('kpi-sub-postura');
  const elDispersion = document.getElementById('kpi-val-dispersion');
  const elSubDisp = document.getElementById('kpi-sub-dispersion');

  if (elCoesti) elCoesti.textContent = stCoesti.mean > 0 ? `S/ ${stCoesti.mean.toFixed(2)}` : '—';
  if (elSubCoesti) elSubCoesti.textContent = `${stCoesti.count} EESS Propias`;
  if (elComp) elComp.textContent = stComp.mean > 0 ? `S/ ${stComp.mean.toFixed(2)}` : '—';
  if (elSubComp) elSubComp.textContent = `${stComp.count} Rivales Físicos`;

  if (elSpread && stCoesti.mean > 0 && stComp.mean > 0) {
    const diff = stCoesti.mean - stComp.mean;
    elSpread.textContent = `${diff >= 0 ? '+' : ''}S/ ${diff.toFixed(2)}`;
    elSpread.style.color = diff > 0.05 ? 'var(--diff-neg)' : (diff < -0.05 ? 'var(--diff-pos)' : 'var(--k-muted)');
  }

  let maxFreqComp = -1, idxModaComp = 0;
  freqComp.forEach((f, i) => { if (f > maxFreqComp) { maxFreqComp = f; idxModaComp = i; } });
  let maxFreqCoesti = -1, idxModaCoesti = 0;
  freqCoesti.forEach((f, i) => { if (f > maxFreqCoesti) { maxFreqCoesti = f; idxModaCoesti = i; } });

  if (elModa) elModa.textContent = binEdges[idxModaCoesti] !== undefined ? `S/ ${binEdges[idxModaCoesti].toFixed(2)}` : '—';
  if (elSubModa) elSubModa.textContent = `${maxFreqCoesti} EESS (Rival: S/ ${binEdges[idxModaComp]?.toFixed(2) || '—'})`;

  if (elPostura && eessConRivalValido > 0) {
    const pctSobre = Math.round((sobreMercadoCount / eessConRivalValido) * 100);
    const pctPar = Math.round((paridadCount / eessConRivalValido) * 100);
    const pctBajo = Math.round((bajoMercadoCount / eessConRivalValido) * 100);
    elPostura.textContent = `${pctSobre}% / ${pctPar}% / ${pctBajo}%`;
    if (elSubPostura) elSubPostura.textContent = `${pctSobre}% Sobre · ${pctPar}% Par · ${pctBajo}% Bajo`;
  }

  if (elDispersion) elDispersion.textContent = `± S/ ${stCoesti.stdev.toFixed(2)}`;
  if (elSubDisp) elSubDisp.textContent = `IQR: S/ ${stCoesti.iqr.toFixed(2)} (Comp: ±${stComp.stdev.toFixed(2)})`;

  // Curvas Gauss
  const centrosX = binEdges.map(b => b + (binStep / 2));
  const gaussComp = centrosX.map(x => stComp.stdev === 0 ? 0 : Number((pdfGauss(x, stComp.mean, stComp.stdev) * stComp.count * binStep).toFixed(2)));
  const gaussCoesti = centrosX.map(x => stCoesti.stdev === 0 ? 0 : Number((pdfGauss(x, stCoesti.mean, stCoesti.stdev) * stCoesti.count * binStep).toFixed(2)));

  const yMaxComp = Math.ceil(Math.max(...freqComp, ...gaussComp) * 1.10);
  const yMaxCoesti = Math.ceil(Math.max(...freqCoesti, ...gaussCoesti) * 1.10);

  // Renderizador Drill-Down con agrupación 1-a-Muchos
  function mostrarDrillDown(tipo, binIndex) {
    const wrap = document.getElementById(`drilldown-${tipo}-wrap`);
    const title = document.getElementById(`drilldown-${tipo}-title`);
    const list = document.getElementById(`drilldown-${tipo}-list`);
    if (!wrap || !title || !list) return;

    const items = (tipo === 'comp' ? itemsPorBinComp : itemsPorBinCoesti)[binIndex] || [];
    const rangoLabel = binsLabels[binIndex];

    title.innerText = `${rangoLabel} · ${items.length} EESS`;
    wrap.style.display = 'flex';

    if (items.length === 0) {
      list.innerHTML = `<div style="margin:auto; font-size:0.75rem; color:var(--k-muted); padding:12px;">Sin estaciones registradas en este rango.</div>`;
      return;
    }

    items.sort((a, b) => b.precio - a.precio);

    list.innerHTML = items.map(item => {
      const logoUrl = getBrandLogo(item.marca);

      // Renderizar rivalidad: Más cercana + badge [+N] con tooltip
      let rivalHtml = '';
      if (item.rivalidades && item.rivalidades.length > 0) {
        const masCercano = item.rivalidades[0];
        const distStr = masCercano.distanciaKm !== null ? `(${masCercano.distanciaKm.toFixed(1)} km)` : '';
        const cantidadExtra = item.rivalidades.length - 1;

        // Texto completo de las estaciones adicionales para el tooltip
        const listaCompletaTooltip = item.rivalidades
          .map(r => `• ${r.nombrePropio}${r.distanciaKm !== null ? ` (${r.distanciaKm.toFixed(1)} km)` : ''}`)
          .join('\n');

        const badgeExtra = cantidadExtra > 0 ? `
          <span style="display: inline-block; font-size: 0.58rem; font-weight: 700; color: #0284C7; background: rgba(2, 132, 199, 0.12); padding: 1px 4px; border-radius: 3px; cursor: help; margin-left: 3px;" 
                title="También compite con:\n${listaCompletaTooltip}">
            [+${cantidadExtra}]
          </span>
        ` : '';

        rivalHtml = `
          <div style="font-size: 0.62rem; color: #0284C7; margin-top: 2px; line-height: 1.3;">
            Rival de: <b>${masCercano.nombrePropio}</b> ${distStr}${badgeExtra}
          </div>
        `;
      }

      return `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 7px 4px; border-bottom: 1px solid rgba(226, 232, 240, 0.7); gap: 10px;">
          <div style="display: flex; align-items: center; gap: 9px; min-width: 0; flex: 1;">
            <img src="${logoUrl}" style="width: 26px; height: 26px; object-fit: contain; border-radius: 50%; border: 1px solid #E2E8F0; padding: 2px; flex-shrink: 0; background: #fff;">
            <div style="min-width: 0; flex: 1;">
              <div style="font-size: 0.76rem; font-weight: 700; color: var(--k-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${item.nombre}
              </div>
              <div style="font-size: 0.64rem; color: var(--k-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 1px;">
                ${item.distrito} · ${item.provincia} · ${item.departamento}
              </div>
              ${rivalHtml}
            </div>
          </div>
          <div style="font-size: 0.92rem; font-weight: 800; color: var(--k-ink); flex-shrink: 0; font-variant-numeric: tabular-nums;">
            S/ ${item.precio.toFixed(2)}
          </div>
        </div>
      `;
    }).join('');

    setTimeout(() => {
      wrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 60);
  }

  // Instanciación Chart Competencia
  const ctxComp = document.getElementById('chart-comp-canvas');
  if (ctxComp) {
    chartCompInstancia = new Chart(ctxComp, {
      type: 'bar',
      plugins: [topModalLabelPlugin],
      data: {
        labels: binsLabels,
        datasets: [
          { type: 'line', label: 'Campana Gauss', data: gaussComp, borderColor: '#0284C7', borderWidth: 2.5, pointRadius: 0, tension: 0.35, order: 0 },
          { type: 'bar', label: `Estaciones (${stComp.count} EESS)`, data: freqComp, backgroundColor: 'rgba(2, 132, 199, 0.45)', borderColor: '#0284C7', borderWidth: 1.5, borderRadius: 4, order: 1 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 12 } },
        interaction: { mode: 'index', intersect: false },
        onClick: (event, elements) => {
          if (!elements || elements.length === 0) return;
          const barEl = elements.find(el => el.datasetIndex === 1) || elements[0];
          mostrarDrillDown('comp', barEl.index);
        },
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 9.5, weight: '600' } } },
          tooltip: { enabled: false, external: externalTooltipHandler }
        },
        scales: {
          x: { grid: { color: 'rgba(226, 232, 240, 0.6)' }, ticks: { font: { size: 9, weight: '600' } } },
          y: { beginAtZero: true, max: yMaxComp, grid: { color: 'rgba(226, 232, 240, 0.6)' }, title: { display: true, text: 'Frecuencia (EESS)', font: { size: 10, weight: '600' } } }
        }
      }
    });
  }

  // Instanciación Chart COESTI
  const ctxCoesti = document.getElementById('chart-coesti-canvas');
  if (ctxCoesti) {
    chartCoestiInstancia = new Chart(ctxCoesti, {
      type: 'bar',
      plugins: [topModalLabelPlugin],
      data: {
        labels: binsLabels,
        datasets: [
          { type: 'line', label: 'Campana Gauss', data: gaussCoesti, borderColor: '#00D58A', borderWidth: 2.5, pointRadius: 0, tension: 0.35, order: 0 },
          { type: 'bar', label: `Estaciones (${stCoesti.count} EESS)`, data: freqCoesti, backgroundColor: 'rgba(0, 213, 138, 0.45)', borderColor: '#00D58A', borderWidth: 1.5, borderRadius: 4, order: 1 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 12 } },
        interaction: { mode: 'index', intersect: false },
        onClick: (event, elements) => {
          if (!elements || elements.length === 0) return;
          const barEl = elements.find(el => el.datasetIndex === 1) || elements[0];
          mostrarDrillDown('coesti', barEl.index);
        },
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 9.5, weight: '600' } } },
          tooltip: { enabled: false, external: externalTooltipHandler }
        },
        scales: {
          x: { grid: { color: 'rgba(226, 232, 240, 0.6)' }, ticks: { font: { size: 9, weight: '600' } } },
          y: { beginAtZero: true, max: yMaxCoesti, grid: { color: 'rgba(226, 232, 240, 0.6)' }, title: { display: true, text: 'Frecuencia (EESS)', font: { size: 10, weight: '600' } } }
        }
      }
    });
  }
}

/* ==========================================================
   MODO 2: DOT-PLOT POR MARCAS 
   ========================================================== */
function renderModoMarca(estaciones, combustible, benchmark) {
  const container = document.getElementById('analytics-svg-wrap');
  if (!container) return;
  container.innerHTML = '';

  const marcasSel = analisisState.marcasSeleccionadas || new Set();
  const datosPorMarca = new Map();

  const competidoresUnicos = obtenerCompetidoresUnicos(estaciones, combustible);

  competidoresUnicos.forEach(comp => {
    if (!marcasSel.has(comp.marca)) return;
    if (!datosPorMarca.has(comp.marca)) datosPorMarca.set(comp.marca, []);
    datosPorMarca.get(comp.marca).push(comp.precio);
  });

  const filas = [];
  datosPorMarca.forEach((precios, marca) => {
    const s = stats(precios);
    filas.push({ marca, ...s });
  });

  // Orden ascendente de precio (menor a mayor)
  filas.sort((a, b) => a.mean - b.mean);

  // Cálculo de Precios Ponderados y Conteo por Cuadrante
  let sumaBajo = 0, countBajo = 0;
  let sumaSobre = 0, countSobre = 0;

  filas.forEach(f => {
    const totalPonderadoMarca = f.mean * f.count;
    if (f.mean < benchmark) {
      sumaBajo += totalPonderadoMarca;
      countBajo += f.count;
    } else if (f.mean > benchmark) {
      sumaSobre += totalPonderadoMarca;
      countSobre += f.count;
    }
  });

  const promBajoPonderado = countBajo > 0 ? (sumaBajo / countBajo) : 0;
  const promSobrePonderado = countSobre > 0 ? (sumaSobre / countSobre) : 0;

  const elValBajo = document.getElementById('val-bajo-coesti');
  const elEessBajo = document.getElementById('eess-bajo-coesti');
  const elValSobre = document.getElementById('val-sobre-coesti');
  const elEessSobre = document.getElementById('eess-sobre-coesti');

  if (elValBajo) {
    elValBajo.textContent = promBajoPonderado > 0 ? `S/ ${promBajoPonderado.toFixed(2)}` : '—';
  }
  if (elEessBajo) {
    elEessBajo.textContent = `${countBajo} EESS`;
  }
  if (elValSobre) {
    elValSobre.textContent = promSobrePonderado > 0 ? `S/ ${promSobrePonderado.toFixed(2)}` : '—';
  }
  if (elEessSobre) {
    elEessSobre.textContent = `${countSobre} EESS`;
  }

  if (filas.length === 0) {
    container.innerHTML = '<div class="empty-state" style="margin:auto; font-weight:600; color:var(--k-muted);">Sin marcas seleccionadas</div>';
    return;
  }

  // Geometría SVG
  const w = container.clientWidth || 950;
  const h = container.clientHeight || 530;
  const padL = 50, padR = 120, padT = 85, padB = 85;

  const todosPrecios = filas.map(f => f.mean);
  if (benchmark > 0) todosPrecios.push(benchmark);
  const minY = Math.min(...todosPrecios) - 0.35;
  const maxY = Math.max(...todosPrecios) + 0.35;
  const scaleY = val => (h - padB) - ((val - minY) / (maxY - minY)) * (h - padT - padB);

  const stepX = (w - padL - padR) / (filas.length > 0 ? filas.length : 1);
  const getX = idx => padL + (idx + 0.5) * stepX;
  const yBm = benchmark > 0 ? scaleY(benchmark) : (h - padB) / 2;

  // Frontera X divisoria entre Bajo y Sobre COESTI
  const ultimoBajoIdx = filas.map(f => f.mean <= benchmark).lastIndexOf(true);
  let xFrontera = null;
  if (ultimoBajoIdx !== -1 && ultimoBajoIdx < filas.length - 1) {
    xFrontera = (getX(ultimoBajoIdx) + getX(ultimoBajoIdx + 1)) / 2;
  } else if (ultimoBajoIdx === filas.length - 1) {
    xFrontera = getX(ultimoBajoIdx) + (stepX / 2);
  } else if (filas.length > 0) {
    xFrontera = getX(0) - (stepX / 2);
  }

  let svg = `
  <svg class="analytics-svg" viewBox="0 0 ${w} ${h}" style="width:100%; height:100%; overflow:visible;">
    <defs>
      <filter id="pill-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="2" flood-opacity="0.12"/>
      </filter>
    </defs>
  `;

  // 1. Línea Base Inferior (Eje X)
  svg += `<line x1="${padL - 10}" y1="${h - padB}" x2="${w - padR + 10}" y2="${h - padB}" stroke="var(--k-line)" stroke-width="1.5"/>`;

  // 2. Línea Vertical Gris Divisoria (Extendida de tope a fondo)
  if (xFrontera !== null) {
    svg += `
      <line x1="${xFrontera}" y1="12" x2="${xFrontera}" y2="${h - 20}" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.65"/>
    `;
  }

  // 3. Línea Horizontal Benchmark COESTI
  if (benchmark > 0) {
    svg += `
      <line x1="${padL - 10}" y1="${yBm}" x2="${w - padR + 10}" y2="${yBm}" stroke="#00D58A" stroke-width="2" stroke-dasharray="6,4"/>
      <g filter="url(#pill-shadow)">
        <rect x="${w - padR + 10}" y="${yBm - 11}" width="105" height="22" rx="4" fill="#00D58A"/>
        <text x="${w - padR + 62}" y="${yBm + 4}" fill="#16182F" font-family="'Poppins', sans-serif" font-size="10" font-weight="800" text-anchor="middle">
          COESTI: S/ ${benchmark.toFixed(2)}
        </text>
      </g>
    `;
  }

  // Dimensiones compactas de la píldora para 2 líneas
  const pillW = 62;
  const pillH = 28;

  // 4. Renderizado por Marca
  filas.forEach((f, idx) => {
    const x = getX(idx);
    const y = scaleY(f.mean);
    const logoUrl = getBrandLogo(f.marca);

    const diff = benchmark > 0 ? (f.mean - benchmark) : 0;
    const signo = diff > 0 ? '+' : '';
    const diffText = benchmark > 0 ? `${signo}${diff.toFixed(2)}` : '';
    const estaSobre = diff > 0.02;

    let colorPunto = '#0284C7';
    if (estaSobre) {
      colorPunto = '#D92D4E';
    } else if (Math.abs(diff) <= 0.02) {
      colorPunto = '#00D58A';
    }

    // Desfase para precios contiguos casi idénticos
    let baseOffset = 36;
    if (idx > 0) {
      const prevY = scaleY(filas[idx - 1].mean);
      if (Math.abs(y - prevY) < 18) {
        baseOffset = (idx % 2 === 0) ? 34 : 48;
      }
    }
    const pillY = y - baseOffset;

    svg += `
      <!-- Línea vertical nacida en la línea COESTI -->
      <line x1="${x}" y1="${yBm}" x2="${x}" y2="${y}" stroke="${colorPunto}" stroke-width="2" stroke-dasharray="4,3" opacity="0.85"/>

      <!-- Nodo y Pill con Precio Arriba y Diferencial Abajo -->
      <g class="dot-brand-group" style="cursor: pointer;">
        <g filter="url(#pill-shadow)">
          <rect x="${x - (pillW / 2)}" y="${pillY}" width="${pillW}" height="${pillH}" rx="6" fill="#ffffff" stroke="${colorPunto}" stroke-width="1.5"/>
        </g>
        <text text-anchor="middle">
          <!-- Línea 1: Precio -->
          <tspan x="${x}" y="${pillY + 12}" font-family="'Inter', sans-serif" font-size="9" font-weight="800" fill="${colorPunto}">
            S/ ${f.mean.toFixed(2)}
          </tspan>
          <!-- Línea 2: Diferencial del mismo color -->
          <tspan x="${x}" y="${pillY + 23}" font-family="'Inter', sans-serif" font-size="7.8" font-weight="700" fill="${colorPunto}">
            (${diffText})
          </tspan>
        </text>

        <!-- Nodo Central -->
        <circle cx="${x}" cy="${y}" r="6.5" fill="${colorPunto}" stroke="#ffffff" stroke-width="2.5" class="dot-node"/>
      </g>
    `;

    // Posicionamiento de Metadatos (Superior para Sobre COESTI / Inferior para Bajo COESTI)
    if (estaSobre) {
      svg += `
        <g>
          <line x1="${x}" y1="${padT - 18}" x2="${x}" y2="${y}" stroke="rgba(226, 232, 240, 0.4)" stroke-width="1"/>
          <image href="${logoUrl}" x="${x - 12}" y="${padT - 65}" width="24" height="24" preserveAspectRatio="xMidYMid meet"/>
          <text x="${x}" y="${padT - 30}" fill="var(--k-ink)" font-family="'Poppins', sans-serif" font-size="8.5" font-weight="700" text-anchor="middle" letter-spacing="-0.02em">
            ${f.marca}
          </text>
          <text x="${x}" y="${padT - 18}" fill="var(--k-muted)" font-family="'Inter', sans-serif" font-size="8" font-weight="600" text-anchor="middle">
            ${f.count} EESS
          </text>
        </g>
      `;
    } else {
      svg += `
        <g>
          <image href="${logoUrl}" x="${x - 12}" y="${h - padB + 8}" width="24" height="24" preserveAspectRatio="xMidYMid meet"/>
          <text x="${x}" y="${h - padB + 44}" fill="var(--k-ink)" font-family="'Poppins', sans-serif" font-size="8.5" font-weight="700" text-anchor="middle" letter-spacing="-0.02em">
            ${f.marca}
          </text>
          <text x="${x}" y="${h - padB + 56}" fill="var(--k-muted)" font-family="'Inter', sans-serif" font-size="8" font-weight="600" text-anchor="middle">
            ${f.count} EESS
          </text>
        </g>
      `;
    }
  });

  svg += '</svg>';
  container.innerHTML = svg;
}