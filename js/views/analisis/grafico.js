/* ==========================================================
   views/analisis/grafico.js — Análisis Ponderado
   - Modo DISTRIBUCION: 2 Histogramas side-by-side con Gauss (Chart.js)
   - Modo MARCA: Dot-Plot SVG con Logos y KPIs de Benchmark
   ========================================================== */

import { getBrandLogo } from '../../config/marcas.js';
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

    <!-- TARJETAS KPIS GENERALES (Modo DISTRIBUCION) -->
    <div class="analytics-kpis-grid" id="analytics-kpis-wrap" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 10px; flex: 0 0 auto;">
      <div class="analytics-kpi-card" style="background:#fff; border:1px solid var(--k-line); border-radius:6px; padding:6px 12px;">
        <span style="font-size:0.6rem; font-weight:700; color:var(--k-muted); text-transform:uppercase;">COESTI Ponderado</span>
        <div style="font-size:1.05rem; font-weight:800; color:var(--k-ink);" id="kpi-val-coesti">—</div>
        <span style="font-size:0.62rem; color:var(--k-muted);" id="kpi-sub-coesti">EESS Propias</span>
      </div>
      <div class="analytics-kpi-card" style="background:#fff; border:1px solid var(--k-line); border-radius:6px; padding:6px 12px;">
        <span style="font-size:0.6rem; font-weight:700; color:var(--k-muted); text-transform:uppercase;">Promedio Competencia</span>
        <div style="font-size:1.05rem; font-weight:800; color:var(--k-ink);" id="kpi-val-comp">—</div>
        <span style="font-size:0.62rem; color:var(--k-muted);" id="kpi-sub-comp">Rivales Directos</span>
      </div>
      <div class="analytics-kpi-card" style="background:#fff; border:1px solid var(--k-line); border-radius:6px; padding:6px 12px;">
        <span style="font-size:0.6rem; font-weight:700; color:var(--k-muted); text-transform:uppercase;">Diferencial Mercado</span>
        <div style="font-size:1.05rem; font-weight:800;" id="kpi-val-diff">—</div>
        <span style="font-size:0.62rem; color:var(--k-muted);">Spread Ponderado</span>
      </div>
      <div class="analytics-kpi-card" style="background:#fff; border:1px solid var(--k-line); border-radius:6px; padding:6px 12px;">
        <span style="font-size:0.6rem; font-weight:700; color:var(--k-muted); text-transform:uppercase;">Rango Precios</span>
        <div style="font-size:1.05rem; font-weight:800; color:var(--k-ink);" id="kpi-val-rango">—</div>
        <span style="font-size:0.62rem; color:var(--k-muted);">Mínimo — Máximo</span>
      </div>
    </div>

    <!-- CONTENEDOR 1: HISTOGRAMAS SIDE-BY-SIDE (Modo DISTRIBUCION) -->
    <div id="analytics-distribucion-wrap" style="flex: 1 1 0; min-height: 0; display: flex; gap: 12px; width: 100%;">
      
      <!-- Panel Competencia -->
      <div style="flex: 1 1 50%; display: flex; flex-direction: column; background: #fff; border: 1px solid var(--k-line); border-radius: 6px; padding: 10px 12px; position: relative;">
        <span style="font-family:'Poppins',sans-serif; font-size:0.75rem; font-weight:700; color:#0284C7; margin-bottom:4px;">
          DISTRIBUCIÓN: COMPETENCIA
        </span>
        <div style="flex: 1 1 0; min-height: 0; position: relative; width: 100%;">
          <canvas id="chart-comp-canvas" style="position: absolute; inset: 0; width: 100%!important; height: 100%!important;"></canvas>
        </div>
      </div>

      <!-- Panel COESTI -->
      <div style="flex: 1 1 50%; display: flex; flex-direction: column; background: #fff; border: 1px solid var(--k-line); border-radius: 6px; padding: 10px 12px; position: relative;">
        <span style="font-family:'Poppins',sans-serif; font-size:0.75rem; font-weight:700; color:#00D58A; margin-bottom:4px;">
          DISTRIBUCIÓN: COESTI (PROPIAS)
        </span>
        <div style="flex: 1 1 0; min-height: 0; position: relative; width: 100%;">
          <canvas id="chart-coesti-canvas" style="position: absolute; inset: 0; width: 100%!important; height: 100%!important;"></canvas>
        </div>
      </div>

    </div>

    <!-- CONTENEDOR 2: DOT-PLOT POR MARCAS (Modo MARCA) -->
    <div id="analytics-marca-wrap" style="flex: 1 1 0; min-height: 0; width: 100%; display: none; position: relative; background: #fff; border: 1px solid var(--k-line); border-radius: 6px; overflow: hidden;">
      
      <!-- KPI Flotante Superior Izquierdo: Bajo COESTI -->
      <div id="card-bajo-coesti" style="position: absolute; top: 16px; left: 20px; z-index: 10; background: #fff; border: 1px solid var(--k-line); border-left: 4px solid var(--k-indigo); border-radius: 5px; padding: 8px 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
        <div style="font-size: 0.6rem; font-weight: 700; color: var(--k-indigo); text-transform: uppercase;">Competencia Bajo COESTI</div>
        <div style="font-size: 0.58rem; color: var(--k-muted); margin-bottom: 2px;">Marcas seleccionadas bajo el benchmark propio</div>
        <div style="display: flex; align-items: baseline; gap: 8px;">
          <span style="font-size: 1.15rem; font-weight: 800; color: var(--k-ink);" id="val-bajo-coesti">—</span>
          <span style="font-size: 0.68rem; font-weight: 700; color: var(--k-indigo);" id="eess-bajo-coesti">— EESS</span>
        </div>
      </div>

      <!-- KPI Flotante Inferior Derecho: Sobre COESTI -->
      <div id="card-sobre-coesti" style="position: absolute; bottom: 16px; right: 20px; z-index: 10; background: #fff; border: 1px solid var(--k-line); border-left: 4px solid #D92D4E; border-radius: 5px; padding: 8px 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
        <div style="font-size: 0.6rem; font-weight: 700; color: #D92D4E; text-transform: uppercase;">Competencia Sobre COESTI</div>
        <div style="font-size: 0.58rem; color: var(--k-muted); margin-bottom: 2px;">Marcas seleccionadas sobre el benchmark propio</div>
        <div style="display: flex; align-items: baseline; gap: 8px;">
          <span style="font-size: 1.15rem; font-weight: 800; color: var(--k-ink);" id="val-sobre-coesti">—</span>
          <span style="font-size: 0.68rem; font-weight: 700; color: #D92D4E;" id="eess-sobre-coesti">— EESS</span>
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
  if (!arr || arr.length === 0) return { mean: 0, stdev: 0, min: 0, max: 0, count: 0 };
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (arr.length > 1 ? arr.length - 1 : 1);
  return {
    mean,
    stdev: Math.sqrt(variance),
    min: Math.min(...arr),
    max: Math.max(...arr),
    count: arr.length
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
   externalTooltipHandler con filtro para la Campana de Gauss
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

  const puntosVisibles = (tooltip.dataPoints || []).filter(dp => {
    return dp.dataset.type !== 'line';
  });

  if (puntosVisibles.length === 0) {
    tooltipEl.style.opacity = '0';
    return;
  }

  const titleLines = tooltip.title || [];
  let innerHtml = '<div style="font-weight:700; margin-bottom:4px; font-family:\'Poppins\',sans-serif; color:#fff;">';
  titleLines.forEach(title => {
    innerHtml += title;
  });
  innerHtml += '</div>';

  puntosVisibles.forEach(dp => {
    const color = dp.dataset.borderColor || dp.dataset.backgroundColor;
    const colorBox = `<span style="display:inline-block; width:9px; height:9px; margin-right:6px; border-radius:2px; background:${dp.dataset.backgroundColor}; border:1px solid ${dp.dataset.borderColor};"></span>`;
    innerHtml += `<div style="display:flex; align-items:center; margin-top:2px; font-size:0.72rem; color:#E2E8F0;">${colorBox}Estaciones: ${dp.parsed.y}</div>`;
  });

  tooltipEl.innerHTML = innerHtml;

  const canvasRect = chart.canvas.getBoundingClientRect();
  const posX = canvasRect.left + tooltip.caretX;
  const posY = canvasRect.top + tooltip.caretY;

  tooltipEl.style.opacity = '1';
  tooltipEl.style.left = `${posX}px`;
  tooltipEl.style.top = `${posY}px`;
  tooltipEl.style.transform = 'translate(-50%, -115%)';
}

/* ==========================================================
   RENDER PRINCIPAL
   ========================================================== */
export function renderAnalisis(todasLasEstaciones) {
  const combustible = analisisState.producto || 'Diesel';
  const modo = (analisisState.modo === 'MARCA') ? 'MARCA' : 'DISTRIBUCION';

  // 1. Filtrar estaciones según controles del rail
  const estaciones = todasLasEstaciones.filter(e =>
    cumpleSegmentacion(e, {
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
    if (analisisState.corredor && analisisState.corredor !== 'TODOS') filtros.push(`Corredor: ${analisisState.corredor}`);
    if (analisisState.departamento && analisisState.departamento !== 'TODOS') filtros.push(`Depto: ${analisisState.departamento}`);
    const tagFiltro = filtros.length ? `(${filtros.join(' · ')})` : '(Red Total)';
    sub.innerText = (modo === 'MARCA')
      ? `Promedio consolidado por marca vs COESTI PONDERADO ${tagFiltro}.`
      : `Distribución bimodal de frecuencias por rangos de precio ${tagFiltro}.`;
  }

  // Alternancia de contenedores
  const distWrap = document.getElementById('analytics-distribucion-wrap');
  const marcaWrap = document.getElementById('analytics-marca-wrap');
  const kpisWrap = document.getElementById('analytics-kpis-wrap');

  if (modo === 'DISTRIBUCION') {
    if (distWrap) distWrap.style.display = 'flex';
    if (kpisWrap) kpisWrap.style.display = 'grid';
    if (marcaWrap) marcaWrap.style.display = 'none';
    renderModoDistribucion(estaciones, combustible, benchmark);
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

/* ==========================================================
   MODO 1: HISTOGRAMAS CON BINS DE 1 SOL (Chart.js)
   ========================================================== */
function renderModoDistribucion(estaciones, combustible, benchmark) {
  destruirCharts();

  const preciosCoesti = [];
  const preciosComp = [];

  estaciones.forEach(est => {
    const propio = est.actores?.find(a => a.tipo_actor === 'PROPIO');
    const pPropio = propio?.combustibles?.[combustible]?.precio;
    if (pPropio && pPropio > 0) preciosCoesti.push(pPropio);

    const comps = est.actores?.filter(esCompetenciaExterna) || [];
    comps.forEach(c => {
      const p = c.combustibles?.[combustible]?.precio;
      if (p && p > 0) preciosComp.push(p);
    });
  });

  const stCoesti = stats(preciosCoesti);
  const stComp = stats(preciosComp);

  // Actualizar Cards KPI
  const elKpiCoesti = document.getElementById('kpi-val-coesti');
  const elKpiComp = document.getElementById('kpi-val-comp');
  const elKpiDiff = document.getElementById('kpi-val-diff');
  const elKpiRango = document.getElementById('kpi-val-rango');

  if (elKpiCoesti) elKpiCoesti.textContent = stCoesti.mean > 0 ? `S/ ${stCoesti.mean.toFixed(2)}` : '—';
  if (elKpiComp) elKpiComp.textContent = stComp.mean > 0 ? `S/ ${stComp.mean.toFixed(2)}` : '—';

  if (elKpiDiff && stCoesti.mean > 0 && stComp.mean > 0) {
    const d = stCoesti.mean - stComp.mean;
    elKpiDiff.textContent = `${d > 0 ? '+' : ''}S/ ${d.toFixed(2)}`;
    elKpiDiff.style.color = d > 0 ? 'var(--diff-neg)' : 'var(--diff-pos)';
  } else if (elKpiDiff) {
    elKpiDiff.textContent = '—';
    elKpiDiff.style.color = 'var(--k-ink)';
  }

  const todos = [...preciosCoesti, ...preciosComp];
  if (elKpiRango) {
    elKpiRango.textContent = todos.length ? `S/ ${Math.min(...todos).toFixed(2)} — ${Math.max(...todos).toFixed(2)}` : '—';
  }

  if (todos.length === 0) return;

  // Bins enteros (paso de S/ 1.00): [10-11>, [11-12>, etc.
  const minBin = Math.floor(Math.min(...todos));
  const maxBin = Math.ceil(Math.max(...todos));

  const binsLabels = [];
  const binEdges = [];
  for (let b = minBin; b < maxBin; b++) {
    binEdges.push(b);
    binsLabels.push(`S/ ${b} - ${b + 1}`);
  }
  // Si minBin == maxBin, agregar al menos 1
  if (binEdges.length === 0) {
    binEdges.push(minBin);
    binsLabels.push(`S/ ${minBin} - ${minBin + 1}`);
  }

  function conteoBins(precios) {
    const counts = new Array(binEdges.length).fill(0);
    precios.forEach(p => {
      let idx = Math.floor(p - minBin);
      if (idx < 0) idx = 0;
      if (idx >= counts.length) idx = counts.length - 1;
      counts[idx]++;
    });
    return counts;
  }

  const freqComp = conteoBins(preciosComp);
  const freqCoesti = conteoBins(preciosCoesti);

  // Puntos medios de bin para evaluar la campana de Gauss
  const centrosX = binEdges.map(b => b + 0.5);

  const gaussComp = centrosX.map(x => {
    if (stComp.stdev === 0) return 0;
    return Number((pdfGauss(x, stComp.mean, stComp.stdev) * stComp.count * 1.0).toFixed(2));
  });

  const gaussCoesti = centrosX.map(x => {
    if (stCoesti.stdev === 0) return 0;
    return Number((pdfGauss(x, stCoesti.mean, stCoesti.stdev) * stCoesti.count * 1.0).toFixed(2));
  });

  // 1. Chart Competencia
  const ctxComp = document.getElementById('chart-comp-canvas');
  if (ctxComp) {
    chartCompInstancia = new Chart(ctxComp, {
      type: 'bar',
      data: {
        labels: binsLabels,
        datasets: [
          {
            type: 'line',
            label: 'Campana Gauss',
            data: gaussComp,
            borderColor: '#0284C7',
            borderWidth: 2.5,
            pointRadius: 0,
            tension: 0.35,
            order: 0
          },
          {
            type: 'bar',
            label: `Estaciones (${stComp.count} EESS)`,
            data: freqComp,
            backgroundColor: 'rgba(2, 132, 199, 0.45)',
            borderColor: '#0284C7',
            borderWidth: 1.5,
            borderRadius: 4,
            order: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: { 
            position: 'bottom', 
            labels: { boxWidth: 12, font: { size: 9.5, weight: '600' } } 
          },
          tooltip: {
            enabled: false,
            external: externalTooltipHandler
          }
        },
        scales: {
          x: { grid: { color: 'rgba(226, 232, 240, 0.6)' }, ticks: { font: { size: 9, weight: '600' } } },
          y: { beginAtZero: true, grid: { color: 'rgba(226, 232, 240, 0.6)' }, title: { display: true, text: 'Frecuencia (EESS)', font: { size: 9.5 } } }
        }
      }
    });
  }

  // 2. Chart COESTI
  const ctxCoesti = document.getElementById('chart-coesti-canvas');
  if (ctxCoesti) {
    chartCoestiInstancia = new Chart(ctxCoesti, {
      type: 'bar',
      data: {
        labels: binsLabels,
        datasets: [
          {
            type: 'line',
            label: 'Campana Gauss',
            data: gaussCoesti,
            borderColor: '#00D58A',
            borderWidth: 2.5,
            pointRadius: 0,
            tension: 0.35,
            order: 0
          },
          {
            type: 'bar',
            label: `Estaciones (${stCoesti.count} EESS)`,
            data: freqCoesti,
            backgroundColor: 'rgba(0, 213, 138, 0.55)',
            borderColor: '#00D58A',
            borderWidth: 1.5,
            borderRadius: 4,
            order: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: { 
            position: 'bottom', 
            labels: { boxWidth: 12, font: { size: 9.5, weight: '600' } } 
          },
          tooltip: {
            enabled: false,
            external: externalTooltipHandler,
          }
        },
        scales: {
          x: { grid: { color: 'rgba(226, 232, 240, 0.6)' }, ticks: { font: { size: 9, weight: '600' } } },
          y: { beginAtZero: true, grid: { color: 'rgba(226, 232, 240, 0.6)' }, title: { display: true, text: 'Frecuencia (EESS)', font: { size: 9.5 } } }
        }
      }
    });
  }
}

/* ==========================================================
   MODO 2: PROMEDIO POR MARCAS (Motor SVG Nativo con Logos)
   ========================================================== */
function renderModoMarca(estaciones, combustible, benchmark) {
  const wrap = document.getElementById('analytics-svg-wrap');
  if (!wrap) return;

  // 1. Agrupar precios por marca
  const acumulador = {};
  estaciones.forEach(est => {
    const comps = est.actores?.filter(esCompetenciaExterna) || [];
    comps.forEach(c => {
      const m = normalizarMarca(c.marca);
      if (!m || m === 'SIN MARCA') return;
      if (analisisState.marcasSeleccionadas && !analisisState.marcasSeleccionadas.has(m)) return;

      const p = c.combustibles?.[combustible]?.precio;
      if (p && p > 0) {
        if (!acumulador[m]) acumulador[m] = { suma: 0, conteo: 0, estaciones: new Set() };
        acumulador[m].suma += p;
        acumulador[m].conteo++;
        acumulador[m].estaciones.add(c.site_id || c.nombre_linea);
      }
    });
  });

  const items = [];
  Object.keys(acumulador).forEach(m => {
    let nombreDisplay = m;
    let marcaDisplay = m;
    if (m === 'PRIMAX') { nombreDisplay = 'PRIMAX (DEALERS)'; marcaDisplay = 'PRIMAX (DEALER)'; }
    else if (m === 'WP') { nombreDisplay = 'WHITE PRODUCTS'; marcaDisplay = 'WHITE PRODUCTS'; }

    items.push({
      id: m,
      nombre: nombreDisplay,
      marca: marcaDisplay,
      rawMarca: m,
      totalEstaciones: acumulador[m].estaciones.size,
      precio: acumulador[m].suma / acumulador[m].conteo,
      esBenchmark: false
    });
  });

  // 2. Benchmark propio
  let totalEstacionesCoesti = 0;
  const setCoesti = new Set();
  estaciones.forEach(est => {
    const propio = est.actores?.find(a => a.tipo_actor === 'PROPIO');
    if (propio?.combustibles?.[combustible]?.precio > 0) {
      setCoesti.add(est.own_site_id);
    }
  });
  totalEstacionesCoesti = setCoesti.size;

  if (benchmark > 0) {
    items.push({
      id: 'coesti-ponderado-node',
      nombre: 'COESTI PONDERADO',
      marca: 'PRIMAX (COESTI)',
      rawMarca: 'COESTI',
      totalEstaciones: totalEstacionesCoesti,
      precio: benchmark,
      esBenchmark: true
    });
  }

  if (items.length === 0) {
    wrap.innerHTML = `<div style="text-align:center; padding:60px; color:var(--k-muted);">No hay marcas para los filtros seleccionados.</div>`;
    return;
  }

  // 3. KPIs de marcas sobre y bajo COESTI
  let sumaArriba = 0, eessArriba = 0;
  let sumaAbajo = 0, eessAbajo = 0;

  items.filter(d => !d.esBenchmark).forEach(d => {
    if (d.precio > benchmark) {
      sumaArriba += (d.precio * d.totalEstaciones);
      eessArriba += d.totalEstaciones;
    } else if (d.precio < benchmark) {
      sumaAbajo += (d.precio * d.totalEstaciones);
      eessAbajo += d.totalEstaciones;
    }
  });

  const valBajo = document.getElementById('val-bajo-coesti');
  const eessBajo = document.getElementById('eess-bajo-coesti');
  const valSobre = document.getElementById('val-sobre-coesti');
  const eessSobre = document.getElementById('eess-sobre-coesti');

  if (valBajo) valBajo.textContent = eessAbajo > 0 ? `S/ ${(sumaAbajo / eessAbajo).toFixed(2)}` : '—';
  if (eessBajo) eessBajo.textContent = `${eessAbajo} EESS`;
  if (valSobre) valSobre.textContent = eessArriba > 0 ? `S/ ${(sumaArriba / eessArriba).toFixed(2)}` : '—';
  if (eessSobre) eessSobre.textContent = `${eessArriba} EESS`;

  // 4. Renderizado SVG
  const sorted = [...items].sort((a, b) => a.precio - b.precio);

  const W = 1600;
  const H = 680;
  const topPad = 140;
  const bottomPad = 140;
  const leftPad = 80;
  const rightPad = 80;

  const precios = sorted.map(d => d.precio);
  const minP = Math.min(...precios) - 0.25;
  const maxP = Math.max(...precios) + 0.25;

  const chartH = H - topPad - bottomPad;
  const scaleY = (val) => (H - bottomPad) - ((val - minP) / (maxP - minP || 1)) * chartH;
  const benchY = scaleY(benchmark);

  const chartW = W - leftPad - rightPad;
  const stepX = chartW / Math.max(1, sorted.length - 1);

  let elementsSvg = '';

  // Línea roja punteada del Benchmark COESTI
  elementsSvg += `
    <line x1="${leftPad - 30}" y1="${benchY}" x2="${W - rightPad + 30}" y2="${benchY}" 
          stroke="#D92D4E" stroke-width="1.8" stroke-dasharray="4,4" />
    <text x="${leftPad - 30}" y="${benchY - 8}" font-size="13" font-weight="800" fill="#D92D4E" font-family="'Poppins', sans-serif">
      COESTI PONDERADO: S/ ${benchmark.toFixed(2)}
    </text>
  `;

  sorted.forEach((d, i) => {
    const cx = leftPad + (i * stepX);
    const cy = scaleY(d.precio);
    const isBench = d.esBenchmark;

    // Conector vertical
    elementsSvg += `<line x1="${cx}" y1="${benchY}" x2="${cx}" y2="${cy}" stroke="${isBench ? '#D92D4E' : '#D8E0E9'}" stroke-width="${isBench ? 2 : 1.2}" stroke-dasharray="${isBench ? '3,3' : 'none'}" />`;

    // Nodo/Punto
    elementsSvg += `<circle cx="${cx}" cy="${cy}" r="${isBench ? 6 : 5}" fill="${isBench ? '#D92D4E' : '#2E3192'}" />`;

    const posArriba = cy < benchY;
    const logoY = posArriba ? (cy - 74) : (cy + 24);
    const textY = posArriba ? (cy - 116) : (cy + 96);
    const countY = posArriba ? (cy - 98) : (cy + 114);
    const priceY = posArriba ? (cy - 80) : (cy + 134);

    if (!isBench) {
      const logoUrl = getBrandLogo(d.rawMarca);
      elementsSvg += `
        <image href="${logoUrl}" x="${cx - 22}" y="${logoY}" width="44" height="44" preserveAspectRatio="xMidYMid meet" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.14));" />
      `;
    }

    const countText = d.totalEstaciones ? `${d.totalEstaciones} EESS` : '';

    elementsSvg += `
      <text x="${cx}" y="${isBench ? (posArriba ? cy - 42 : cy + 44) : textY}" text-anchor="middle" font-size="14" font-weight="${isBench ? '800' : '700'}" fill="${isBench ? '#D92D4E' : '#16182F'}" font-family="'Inter', sans-serif">
        ${d.nombre}
      </text>
      ${countText ? `
      <text x="${cx}" y="${isBench ? (posArriba ? cy - 24 : cy + 62) : countY}" text-anchor="middle" font-size="12" font-weight="600" fill="${isBench ? '#D92D4E' : '#7A8699'}" font-family="'Inter', sans-serif">
        ${countText}
      </text>` : ''}
      <text x="${cx}" y="${isBench ? (posArriba ? cy - 6 : cy + 80) : priceY}" text-anchor="middle" font-size="15" font-weight="800" fill="${isBench ? '#D92D4E' : '#505F79'}" font-family="'Poppins', sans-serif">
        S/ ${d.precio.toFixed(2)}
      </text>
    `;
  });

  wrap.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" style="width:100%; height:100%; display:block;" preserveAspectRatio="xMidYMid meet">
      ${elementsSvg}
    </svg>
  `;
}