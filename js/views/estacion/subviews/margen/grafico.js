/* ==========================================================
   views/estacion/subviews/margen/grafico.js — Gráfico Dual Margen
   ========================================================== */
import { estacionState } from '../../state.js';

let chartInstancia = null;

const ESTILOS_RIVALES = [
  { color: '#2563EB', dash: [6, 4], point: 'rect' },
  { color: '#D97706', dash: [10, 3, 2, 3], point: 'rectRot' },
  { color: '#DC2626', dash: [3, 3], point: 'triangle' },
  { color: '#7C3AED', dash: [12, 5], point: 'star' },
  { color: '#DB2777', dash: [8, 3, 2, 3, 2, 3], point: 'crossRot' },
  { color: '#0891B2', dash: [4, 2], point: 'circle' },
  { color: '#4B5563', dash: [14, 4, 3, 4], point: 'rect' }
];

function obtenerPuntoVigenteEn(puntos, fechaCorte, key = 'p') {
  let val = null;
  for (const pt of puntos) {
    const f = (pt.t || '').slice(0, 10);
    if (f <= fechaCorte) {
      val = pt[key] !== undefined ? pt[key] : pt.c;
    } else {
      break;
    }
  }
  return val;
}

function generarRangoFechas(f1, f2) {
  const fechas = [];
  const cur = new Date(f1 + 'T00:00:00');
  const fin = new Date(f2 + 'T00:00:00');
  while (cur <= fin) {
    fechas.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return fechas;
}

export function renderMargen(container, est) {
  if (chartInstancia) {
    chartInstancia.destroy();
    chartInstancia = null;
  }

  const f = estacionState.filtros;
  const m = estacionState.metricasMargen;
  const prod = f.producto;
  const hist = (est.historico_ytd || est.historico_30d || {})[prod];

  if (!hist || !hist.costo || hist.costo.length === 0) {
    container.innerHTML = `<div class="empty-state" style="margin:auto; font-weight:600; color:var(--k-muted);">Sin historial de costo disponible para ${prod}.</div>`;
    return;
  }

  const f1 = f.fechaInicio;
  const f2 = f.fechaFin;
  const puntosPropio = [...(hist.propio || [])].sort((a, b) => a.t.localeCompare(b.t));
  const puntosCosto = [...(hist.costo || [])].sort((a, b) => a.t.localeCompare(b.t));
  const labelsX = generarRangoFechas(f1, f2);

  const actoresMap = new Map((est.actores || []).map(a => [a.site_id, a]));
  const rivalesSeleccionados = f.competidoresSeleccionados || new Set();

  const mostrarPrecios = m.has('PRECIOS');
  const mostrarCostos = m.has('COSTOS');
  const mostrarMargen = m.has('MARGEN');

  const usarEjeIzquierdo = mostrarPrecios || mostrarCostos;
  const usarEjeDerecho = mostrarMargen;

  const datasets = [];

  // 1. Serie Costo Propio COESTI
  const serieCostoPropio = labelsX.map(d => obtenerPuntoVigenteEn(puntosCosto, d, 'c'));
  if (mostrarCostos) {
    datasets.push({
      label: 'Costo Propio COESTI',
      data: serieCostoPropio,
      yAxisID: 'yPrecios',
      borderColor: '#0F172A',
      backgroundColor: 'transparent',
      borderWidth: 2.8,
      borderDash: [5, 4],
      pointRadius: 0,
      tension: 0.1,
      order: 1
    });
  }

  // 2. Series Propias (Precio y Margen)
  const seriePrecioPropio = labelsX.map(d => obtenerPuntoVigenteEn(puntosPropio, d, 'p'));

  if (mostrarPrecios) {
    datasets.push({
      label: `${est.estacion} (Precio Propio)`,
      data: seriePrecioPropio,
      yAxisID: 'yPrecios',
      borderColor: '#00D58A',
      backgroundColor: '#00D58A',
      borderWidth: 3.5,
      pointStyle: 'circle',
      pointRadius: 3,
      tension: 0.12,
      order: 2
    });
  }

  if (mostrarMargen) {
    const serieMargenPropio = labelsX.map((d, i) => {
      const p = seriePrecioPropio[i];
      const c = serieCostoPropio[i];
      return (p !== null && c !== null) ? Number((p - c).toFixed(2)) : null;
    });

    datasets.push({
      label: `${est.estacion} (Margen Propio)`,
      data: serieMargenPropio,
      yAxisID: 'yMargen',
      borderColor: '#00D58A',
      backgroundColor: 'transparent',
      borderWidth: 2.5,
      borderDash: [3, 3],
      pointStyle: 'crossRot',
      pointRadius: 3.5,
      tension: 0.12,
      order: 3
    });
  }

  // 3. Series de Competidores
  let estiloIdx = 0;
  Object.entries(hist.competidores || {}).forEach(([siteId, puntos]) => {
    if (!rivalesSeleccionados.has(siteId)) return;

    const actor = actoresMap.get(siteId);
    const puntosComp = [...(puntos || [])].sort((a, b) => a.t.localeCompare(b.t));
    const estilo = ESTILOS_RIVALES[estiloIdx % ESTILOS_RIVALES.length];
    estiloIdx++;

    const nombre = actor ? actor.nombre_linea : 'Competidor';
    const dist = actor?.distancia_km !== undefined ? ` (${actor.distancia_km.toFixed(1)} km)` : '';

    const seriePrecioComp = labelsX.map(d => obtenerPuntoVigenteEn(puntosComp, d, 'p'));

    if (mostrarPrecios) {
      datasets.push({
        label: `${nombre}${dist} (Precio)`,
        data: seriePrecioComp,
        yAxisID: 'yPrecios',
        borderColor: estilo.color,
        backgroundColor: estilo.color,
        borderWidth: 2,
        borderDash: estilo.dash,
        pointStyle: estilo.point,
        pointRadius: 2.5,
        tension: 0.12,
        order: 4
      });
    }

    if (mostrarMargen) {
      const serieMargenComp = labelsX.map((d, i) => {
        const pRival = seriePrecioComp[i];
        const cPropio = serieCostoPropio[i];
        return (pRival !== null && cPropio !== null) ? Number((pRival - cPropio).toFixed(2)) : null;
      });

      datasets.push({
        label: `${nombre}${dist} (Margen Est.)`,
        data: serieMargenComp,
        yAxisID: 'yMargen',
        borderColor: estilo.color,
        backgroundColor: 'transparent',
        borderWidth: 1.6,
        borderDash: [2, 2],
        pointStyle: 'crossRot',
        pointRadius: 2,
        tension: 0.12,
        order: 5
      });
    }
  });

  // 4. Inyección del DOM
  container.innerHTML = `
    <div style="background:#fff; border:1px solid var(--k-line); border-radius:8px; padding:14px 18px 10px; box-shadow:0 2px 10px rgba(22,24,47,.05); width:100%; height:100%; display:flex; flex-direction:column; box-sizing:border-box; overflow:hidden;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-shrink:0;">
        <div>
          <h2 style="margin:0; font-size:1.15rem; color:var(--k-ink); font-weight:800; letter-spacing:-0.01em;">
            Análisis de Margen: ${prod.toUpperCase()}
          </h2>
          <p style="margin:2px 0 0 0; color:var(--k-muted); font-size:0.75rem;">
            ${est.estacion} vs Rivales directos · Período: ${f1} ➔ ${f2}
          </p>
        </div>
        <div class="count-badge" style="font-weight:700;">
          ${datasets.length} Series Representadas
        </div>
      </div>
      <div style="flex:1 1 0; min-height:0; position:relative; width:100%;">
        <canvas id="chart-subview-margen" style="position:absolute; inset:0; width:100%!important; height:100%!important;"></canvas>
      </div>
    </div>
  `;

  const ctx = document.getElementById('chart-subview-margen');
  if (!ctx || typeof Chart === 'undefined') return;

  const scalesConfig = {
    x: {
      grid: { color: 'rgba(226, 232, 240, 0.5)' },
      ticks: { font: { family: "'Inter', sans-serif", size: 9.5, weight: '500' }, color: '#64748B', maxRotation: 0, autoSkip: true, maxTicksLimit: 12 }
    }
  };

  if (usarEjeIzquierdo) {
    scalesConfig.yPrecios = {
      type: 'linear',
      position: 'left',
      grid: { color: 'rgba(226, 232, 240, 0.7)' },
      title: { display: usarEjeDerecho, text: 'Precios y Costo (S/)', font: { family: "'Poppins', sans-serif", size: 10, weight: '700' }, color: '#1E293B' },
      ticks: { font: { family: "'Poppins', sans-serif", size: 9.5, weight: '600' }, color: '#1E293B', callback: (val) => `S/ ${val.toFixed(2)}` }
    };
  }

  if (usarEjeDerecho) {
    scalesConfig.yMargen = {
      type: 'linear',
      position: 'right',
      grid: { drawOnChartArea: !usarEjeIzquierdo, color: 'rgba(2, 132, 199, 0.15)' },
      title: { display: usarEjeIzquierdo, text: 'Margen Unitario (S/)', font: { family: "'Poppins', sans-serif", size: 10, weight: '700' }, color: '#0284C7' },
      ticks: { font: { family: "'Poppins', sans-serif", size: 9.5, weight: '700' }, color: '#0284C7', callback: (val) => `S/ ${val.toFixed(2)}` }
    };
  }

  chartInstancia = new Chart(ctx, {
    type: 'line',
    data: { labels: labelsX, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { boxWidth: 14, usePointStyle: true, font: { family: "'Poppins', sans-serif", size: 9.5, weight: '600' }, color: '#334155', padding: 8 }
        },
        tooltip: {
          backgroundColor: '#16182F',
          padding: 8,
          cornerRadius: 5,
          callbacks: {
            title: (items) => items.length ? `Fecha: ${items[0].label}` : '',
            label: (ctx) => {
              const val = ctx.parsed.y;
              return val !== null ? ` ${ctx.dataset.label}: S/ ${val.toFixed(2)}` : ' Sin datos';
            }
          }
        }
      },
      scales: scalesConfig
    }
  });
}