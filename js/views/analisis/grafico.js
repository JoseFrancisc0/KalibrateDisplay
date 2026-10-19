/* ==========================================================
   views/analisis/grafico.js — Análisis Estadístico de Precios
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

/* ==========================================================
   MODO 1: HISTOGRAMAS DINÁMICOS SIDE-BY-SIDE (Chart.js)
   ========================================================== */
function renderModoDistribucion(estaciones, combustible) {
  destruirCharts();

  const preciosCoesti = [];
  const preciosComp = [];
  let sobreMercadoCount = 0;
  let paridadCount = 0;
  let bajoMercadoCount = 0;
  let eessConRivalValido = 0;

  estaciones.forEach(est => {
    const propio = est.actores?.find(a => a.tipo_actor === 'PROPIO');
    const pPropio = propio?.combustibles?.[combustible]?.precio;
    if (pPropio && pPropio > 0) preciosCoesti.push(pPropio);

    const comps = est.actores?.filter(esCompetenciaExterna) || [];
    const preciosRivalEstacion = [];
    comps.forEach(c => {
      const p = c.combustibles?.[combustible]?.precio;
      if (p && p > 0) {
        preciosComp.push(p);
        preciosRivalEstacion.push(p);
      }
    });

    // Comparativa de postura comercial directa (vs rival más cercano / promedio local)
    if (pPropio && pPropio > 0 && preciosRivalEstacion.length > 0) {
      eessConRivalValido++;
      const pRivalMedio = preciosRivalEstacion.reduce((a, b) => a + b, 0) / preciosRivalEstacion.length;
      const diff = Math.round((pPropio - pRivalMedio) * 100) / 100;
      if (diff > 0.05) sobreMercadoCount++;
      else if (diff < -0.05) bajoMercadoCount++;
      else paridadCount++;
    }
  });

  const stCoesti = stats(preciosCoesti);
  const stComp = stats(preciosComp);
  const todos = [...preciosCoesti, ...preciosComp];

  if (todos.length === 0) return;

  // 1. DETERMINAR PASO (BIN STEP) DINÁMICO
  const minVal = Math.min(...todos);
  const maxVal = Math.max(...todos);
  const rangoTotal = maxVal - minVal;

  // Si el rango es estrecho (ej. GNV o GLP < 4 soles de dispersión), bin de 0.50, si no de 1.00
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

  function conteoBins(precios) {
    const counts = new Array(binEdges.length).fill(0);
    precios.forEach(p => {
      let idx = Math.floor((p - minBin) / binStep);
      if (idx < 0) idx = 0;
      if (idx >= counts.length) idx = counts.length - 1;
      counts[idx]++;
    });
    return counts;
  }

  const freqComp = conteoBins(preciosComp);
  const freqCoesti = conteoBins(preciosCoesti);

  // 2. IDENTIFICAR MODA POR BIN
  let maxFreqComp = -1, idxModaComp = 0;
  freqComp.forEach((f, i) => { if (f > maxFreqComp) { maxFreqComp = f; idxModaComp = i; } });

  let maxFreqCoesti = -1, idxModaCoesti = 0;
  freqCoesti.forEach((f, i) => { if (f > maxFreqCoesti) { maxFreqCoesti = f; idxModaCoesti = i; } });

  const labelModaCoesti = binEdges[idxModaCoesti] !== undefined ? `${binEdges[idxModaCoesti].toFixed(2)}` : '—';
  const labelModaComp = binEdges[idxModaComp] !== undefined ? `${binEdges[idxModaComp].toFixed(2)}` : '—';

  // 3. ACTUALIZAR KPIS ESTRATÉGICOS
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

  // Card 1: Promedio COESTI
  if (elCoesti) elCoesti.textContent = stCoesti.mean > 0 ? `S/ ${stCoesti.mean.toFixed(2)}` : '—';
  if (elSubCoesti) elSubCoesti.textContent = `${stCoesti.count} EESS Propias`;

  // Card 2: Promedio Competencia
  if (elComp) elComp.textContent = stComp.mean > 0 ? `S/ ${stComp.mean.toFixed(2)}` : '—';
  if (elSubComp) elSubComp.textContent = `${stComp.count} Rivales Directos`;

  // Card 3: Spread Mercado
  if (elSpread && stCoesti.mean > 0 && stComp.mean > 0) {
    const diff = stCoesti.mean - stComp.mean;
    elSpread.textContent = `${diff >= 0 ? '+' : ''}S/ ${diff.toFixed(2)}`;
    // Más caro = rojo/alerta (neg), más barato = verde (pos)
    elSpread.style.color = diff > 0.05 ? 'var(--diff-neg)' : (diff < -0.05 ? 'var(--diff-pos)' : 'var(--k-muted)');
  } else if (elSpread) {
    elSpread.textContent = '—';
    elSpread.style.color = 'var(--k-ink)';
  }

  // Card 4: Moda COESTI (con referencia al rival en subtexto)
  if (elModa) {
    elModa.textContent = labelModaCoesti !== '—' ? `S/ ${labelModaCoesti}` : '—';
  }
  if (elSubModa) {
    elSubModa.textContent = `${maxFreqCoesti} EESS (Rival: S/ ${labelModaComp})`;
  }

  // Card 5: Postura vs Rival Directo
  if (elPostura && eessConRivalValido > 0) {
    const pctSobre = Math.round((sobreMercadoCount / eessConRivalValido) * 100);
    const pctPar = Math.round((paridadCount / eessConRivalValido) * 100);
    const pctBajo = Math.round((bajoMercadoCount / eessConRivalValido) * 100);
    elPostura.textContent = `${pctSobre}% / ${pctPar}% / ${pctBajo}%`;
    if (elSubPostura) elSubPostura.textContent = `${pctSobre}% Sobre · ${pctPar}% Par · ${pctBajo}% Bajo`;
  } else if (elPostura) {
    elPostura.textContent = '—';
  }

  // Card 6: Dispersión COESTI (Desviación e IQR)
  if (elDispersion) {
    elDispersion.textContent = `± S/ ${stCoesti.stdev.toFixed(2)}`;
  }
  if (elSubDisp) {
    elSubDisp.textContent = `IQR: S/ ${stCoesti.iqr.toFixed(2)} (Comp: ±${stComp.stdev.toFixed(2)})`;
  }

  // 4. PREPARACIÓN DE GAUSS
  const centrosX = binEdges.map(b => b + (binStep / 2));
  const gaussComp = centrosX.map(x => {
    if (stComp.stdev === 0) return 0;
    return Number((pdfGauss(x, stComp.mean, stComp.stdev) * stComp.count * binStep).toFixed(2));
  });

  const gaussCoesti = centrosX.map(x => {
    if (stCoesti.stdev === 0) return 0;
    return Number((pdfGauss(x, stCoesti.mean, stCoesti.stdev) * stCoesti.count * binStep).toFixed(2));
  });

  // Headroom en Eje Y (+25% para que la etiqueta superior no se corte)
  const yMaxComp = Math.ceil(Math.max(...freqComp, ...gaussComp) * 1.10);
  const yMaxCoesti = Math.ceil(Math.max(...freqCoesti, ...gaussCoesti) * 1.10);

  // 5. CHART COMPETENCIA
  const ctxComp = document.getElementById('chart-comp-canvas');
  if (ctxComp) {
    chartCompInstancia = new Chart(ctxComp, {
      type: 'bar',
      plugins: [topModalLabelPlugin],
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
        layout: { padding: { top: 12 } },
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 9.5, weight: '600' } } },
          tooltip: { enabled: false, external: externalTooltipHandler }
        },
        scales: {
          x: { grid: { color: 'rgba(226, 232, 240, 0.6)' }, ticks: { font: { size: 9, weight: '600' } } },
          y: {
            beginAtZero: true,
            max: yMaxComp,
            grid: { color: 'rgba(226, 232, 240, 0.6)' },
            title: { display: true, text: 'Frecuencia (EESS)', font: { size: 10, weight: '600' } }
          }
        }
      }
    });
  }

  // 6. CHART COESTI
  const ctxCoesti = document.getElementById('chart-coesti-canvas');
  if (ctxCoesti) {
    chartCoestiInstancia = new Chart(ctxCoesti, {
      type: 'bar',
      plugins: [topModalLabelPlugin],
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
            backgroundColor: 'rgba(0, 213, 138, 0.45)',
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
        layout: { padding: { top: 12 } },
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 9.5, weight: '600' } } },
          tooltip: { enabled: false, external: externalTooltipHandler }
        },
        scales: {
          x: { grid: { color: 'rgba(226, 232, 240, 0.6)' }, ticks: { font: { size: 9, weight: '600' } } },
          y: {
            beginAtZero: true,
            max: yMaxCoesti,
            grid: { color: 'rgba(226, 232, 240, 0.6)' },
            title: { display: true, text: 'Frecuencia (EESS)', font: { size: 10, weight: '600' } }
          }
        }
      }
    });
  }
}

/* ==========================================================
   MODO 2: DOT-PLOT POR MARCAS (Preservado intacto)
   ========================================================== */
function renderModoMarca(estaciones, combustible, benchmark) {
  const container = document.getElementById('analytics-svg-wrap');
  if (!container) return;
  container.innerHTML = '';

  const marcasSel = analisisState.marcasSeleccionadas || new Set();
  const datosPorMarca = new Map();

  estaciones.forEach(est => {
    const comps = (est.actores || []).filter(esCompetenciaExterna);
    comps.forEach(c => {
      const marcaNorm = normalizarMarca(c.marca);
      if (!marcasSel.has(marcaNorm)) return;
      const p = c.combustibles?.[combustible]?.precio;
      if (p && p > 0) {
        if (!datosPorMarca.has(marcaNorm)) datosPorMarca.set(marcaNorm, []);
        datosPorMarca.get(marcaNorm).push(p);
      }
    });
  });

  const filas = [];
  datosPorMarca.forEach((precios, marca) => {
    const s = stats(precios);
    filas.push({ marca, ...s });
  });

  filas.sort((a, b) => b.mean - a.mean);

  // KPIs de benchmark flotantes
  let bajoCount = 0, sobreCount = 0;
  filas.forEach(f => {
    if (f.mean < benchmark) bajoCount += f.count;
    else if (f.mean > benchmark) sobreCount += f.count;
  });

  const elValBajo = document.getElementById('val-bajo-coesti');
  const elEessBajo = document.getElementById('eess-bajo-coesti');
  const elValSobre = document.getElementById('val-sobre-coesti');
  const elEessSobre = document.getElementById('eess-sobre-coesti');

  if (elValBajo) elValBajo.textContent = benchmark > 0 ? `S/ ${benchmark.toFixed(2)}` : '—';
  if (elEessBajo) elEessBajo.textContent = `${bajoCount} EESS`;
  if (elValSobre) elValSobre.textContent = benchmark > 0 ? `S/ ${benchmark.toFixed(2)}` : '—';
  if (elEessSobre) elEessSobre.textContent = `${sobreCount} EESS`;

  if (filas.length === 0) {
    container.innerHTML = '<div class="empty-state" style="margin:auto;">Sin marcas seleccionadas</div>';
    return;
  }

  // Geometría SVG
  const w = container.clientWidth || 800;
  const h = container.clientHeight || 450;
  const padL = 90, padR = 40, padT = 30, padB = 40;

  const todosPrecios = filas.map(f => f.mean);
  if (benchmark > 0) todosPrecios.push(benchmark);
  const minX = Math.min(...todosPrecios) - 0.4;
  const maxX = Math.max(...todosPrecios) + 0.4;

  const scaleX = val => padL + ((val - minX) / (maxX - minX)) * (w - padL - padR);
  const stepY = (h - padT - padB) / (filas.length + 1);

  let svg = `<svg class="analytics-svg" viewBox="0 0 ${w} ${h}">`;

  // Línea Guía Benchmark COESTI
  if (benchmark > 0) {
    const xBm = scaleX(benchmark);
    svg += `
      <line x1="${xBm}" y1="${padT - 10}" x2="${xBm}" y2="${h - padB + 10}" stroke="var(--k-emerald, #00D58A)" stroke-width="2" stroke-dasharray="4,4"/>
      <text x="${xBm}" y="${padT - 14}" fill="var(--k-emerald, #00D58A)" font-size="10" font-weight="700" text-anchor="middle">COESTI: S/ ${benchmark.toFixed(2)}</text>
    `;
  }

  // Filas por Marca
  filas.forEach((f, idx) => {
    const y = padT + (idx + 1) * stepY;
    const x = scaleX(f.mean);
    const logo = getBrandLogo(f.marca);

    svg += `
      <line x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}" stroke="rgba(226, 232, 240, 0.8)" stroke-width="1"/>
      <text x="${padL - 10}" y="${y + 4}" fill="var(--k-ink)" font-size="11" font-weight="600" text-anchor="end">${f.marca}</text>
      <circle cx="${x}" cy="${y}" r="6" fill="#0284C7" class="dot-node"/>
      <text x="${x}" y="${y - 9}" fill="#0284C7" font-size="10" font-weight="700" text-anchor="middle">S/ ${f.mean.toFixed(2)}</text>
    `;
  });

  svg += '</svg>';
  container.innerHTML = svg;
}