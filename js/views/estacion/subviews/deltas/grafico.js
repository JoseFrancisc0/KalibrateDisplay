/* ==========================================================
   views/estacion/subviews/deltas/grafico.js — Gráfico Dual Deltas
   ========================================================== */
import { estacionState } from '../../state.js';

let chartInstancia = null;

const ESTILOS_RIVALES = [
  { color: '#2563EB', dash: [6, 4], point: 'rect' },
  { color: '#D97706', dash: [10, 3, 2, 3], point: 'rectRot' },
  { color: '#DC2626', dash: [3, 3], point: 'triangle' },
  { color: '#7C3AED', dash: [12, 5], point: 'star' },
  { color: '#DB2777', dash: [8, 3, 2, 3, 2, 3], point: 'crossRot' },
  { color: '#0891B2', dash: [4, 2], point: 'circle' }
];

function obtenerPrecioVigenteEn(puntos, fechaCorte) {
  let precio = null;
  for (const pt of puntos) {
    const f = (pt.t || '').slice(0, 10);
    if (f <= fechaCorte) {
      precio = pt.p;
    } else {
      break;
    }
  }
  return precio;
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

export function renderEvolucionDiff(container, est) {
  if (chartInstancia) {
    chartInstancia.destroy();
    chartInstancia = null;
  }

  const f = estacionState.filtros;
  const m = estacionState.metricasDeltas;
  const prod = f.producto;
  const hist = (est.historico_ytd || est.historico_30d || {})[prod];

  if (!hist) {
    container.innerHTML = `<div class="empty-state" style="margin:auto; font-weight:600; color:var(--k-muted);">Sin historial disponible para ${prod}.</div>`;
    return;
  }

  const f1 = f.fechaInicio;
  const f2 = f.fechaFin;
  const puntosPropio = [...(hist.propio || [])].sort((a, b) => a.t.localeCompare(b.t));
  const labelsX = generarRangoFechas(f1, f2);

  const actoresMap = new Map((est.actores || []).map(a => [a.site_id, a]));
  const rivalesSeleccionados = f.competidoresSeleccionados || new Set();

  const mostrarPrecios = m.has('PRECIOS');
  const mostrarDeltas = m.has('DELTAS');

  const usarEjeIzquierdo = mostrarPrecios;
  const usarEjeDerecho = mostrarDeltas;

  const datasets = [];
  const todosDeltas = [];

  const seriePrecioPropio = labelsX.map(d => obtenerPrecioVigenteEn(puntosPropio, d));

  // 1. Serie Precio Propio COESTI
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
      order: 1
    });
  }

  // 2. Series de Competidores
  let estiloIdx = 0;
  Object.entries(hist.competidores || {}).forEach(([siteId, puntos]) => {
    if (!rivalesSeleccionados.has(siteId)) return;

    const actor = actoresMap.get(siteId);
    const puntosComp = [...(puntos || [])].sort((a, b) => a.t.localeCompare(b.t));
    const estilo = ESTILOS_RIVALES[estiloIdx % ESTILOS_RIVALES.length];
    estiloIdx++;

    const nombre = actor ? actor.nombre_linea : 'Competidor';
    const dist = actor?.distancia_km !== undefined ? ` (${actor.distancia_km.toFixed(1)} km)` : '';

    const seriePrecioComp = labelsX.map(d => obtenerPrecioVigenteEn(puntosComp, d));

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
        order: 2
      });
    }

    if (mostrarDeltas) {
      const serieDelta = labelsX.map((d, i) => {
        const pPropio = seriePrecioPropio[i];
        const pRival = seriePrecioComp[i];
        if (pPropio !== null && pRival !== null) {
          const delta = Number((pPropio - pRival).toFixed(2));
          todosDeltas.push(delta);
          return delta;
        }
        return null;
      });

      datasets.push({
        label: `Diff vs ${nombre}${dist}`,
        data: serieDelta,
        yAxisID: 'yDeltas',
        borderColor: estilo.color,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [3, 3],
        pointStyle: 'crossRot',
        pointRadius: 3,
        tension: 0.12,
        order: 3
      });
    }
  });

  // Cálculo simétrico para eje Delta centrado en 0.00
  const maxAbsDelta = todosDeltas.length ? Math.max(...todosDeltas.map(Math.abs), 0.20) : 0.40;
  const limiteDeltas = Number((Math.ceil(maxAbsDelta * 10) / 10 + 0.15).toFixed(2));

  // Plugin para línea 0.00
  const pluginZeroLine = {
    id: 'zeroLinePlugin',
    afterDraw(chart) {
      if (!usarEjeDerecho) return;
      const { ctx, chartArea, scales: { yDeltas } } = chart;
      if (!yDeltas) return;
      const yZero = yDeltas.getPixelForValue(0);

      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1.8;
      ctx.moveTo(chartArea.left, yZero);
      ctx.lineTo(chartArea.right, yZero);
      ctx.stroke();

      ctx.fillStyle = '#64748B';
      ctx.font = "bold 10px 'Inter', sans-serif";
      ctx.textAlign = 'right';
      ctx.fillText('0.00', chartArea.right + 28, yZero + 3.5);
      ctx.restore();
    }
  };

  container.innerHTML = `
    <div style="background:#fff; border:1px solid var(--k-line); border-radius:8px; padding:14px 18px 10px; box-shadow:0 2px 10px rgba(22,24,47,.05); width:100%; height:100%; display:flex; flex-direction:column; box-sizing:border-box; overflow:hidden;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-shrink:0;">
        <div>
          <h2 style="margin:0; font-size:1.15rem; color:var(--k-ink); font-weight:800; letter-spacing:-0.01em;">
            Evolución de Diferenciales: ${prod.toUpperCase()}
          </h2>
          <p style="margin:2px 0 0 0; color:var(--k-muted); font-size:0.75rem;">
            Diferencial (S/) = [Propio] − [Rival] · Período: ${f1} ➔ ${f2}
          </p>
        </div>
        <div class="count-badge" style="font-weight:700;">
          ${datasets.length} Series Representadas
        </div>
      </div>
      <div style="flex:1 1 0; min-height:0; position:relative; width:100%;">
        <canvas id="chart-subview-deltas" style="position:absolute; inset:0; width:100%!important; height:100%!important;"></canvas>
      </div>
    </div>
  `;

  const ctx = document.getElementById('chart-subview-deltas');
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
      title: { display: usarEjeDerecho, text: 'Precios de Venta (S/)', font: { family: "'Poppins', sans-serif", size: 10, weight: '700' }, color: '#1E293B' },
      ticks: { font: { family: "'Poppins', sans-serif", size: 9.5, weight: '600' }, color: '#1E293B', callback: (val) => `S/ ${val.toFixed(2)}` }
    };
  }

  if (usarEjeDerecho) {
    scalesConfig.yDeltas = {
      type: 'linear',
      position: 'right',
      min: -limiteDeltas,
      max: limiteDeltas,
      grid: { drawOnChartArea: !usarEjeIzquierdo, color: 'rgba(46, 49, 146, 0.15)' },
      title: { display: usarEjeIzquierdo, text: 'Diferencial vs Propio (S/)', font: { family: "'Poppins', sans-serif", size: 10, weight: '700' }, color: '#2E3192' },
      ticks: {
        font: { family: "'Poppins', sans-serif", size: 9.5, weight: '700' },
        color: '#2E3192',
        callback: (val) => val === 0 ? '' : (val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2))
      }
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
    },
    plugins: [pluginZeroLine]
  });
}