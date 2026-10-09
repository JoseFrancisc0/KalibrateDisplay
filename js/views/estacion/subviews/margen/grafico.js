/* ==========================================================
   views/estacion/subviews/margen/grafico.js —
   Análisis comparativo de márgenes multi-estación en Chart.js
   ========================================================== */
import { estacionState } from '../../state.js';

let chartInstancia = null;

// Mismo catálogo de estilos para distinguir rápidamente cada línea
const ESTILOS_RIVALES = [
  { color: '#2563EB', dash: [6, 4],            point: 'rect' },       // Azul · Guiones · Cuadrado
  { color: '#D97706', dash: [10, 3, 2, 3],      point: 'rectRot' },    // Ámbar · Raya-punto · Rombo
  { color: '#DC2626', dash: [3, 3],            point: 'triangle' },   // Rojo · Punteada · Triángulo
  { color: '#7C3AED', dash: [12, 5],           point: 'star' },       // Violeta · Raya larga · Estrella
  { color: '#DB2777', dash: [8, 3, 2, 3, 2, 3], point: 'crossRot' },   // Rosa · Aspa (X)
  { color: '#0891B2', dash: [4, 2],            point: 'circle' },     // Cian · Círculo
  { color: '#4B5563', dash: [14, 4, 3, 4],      point: 'rect' },       // Gris · Cuadrado
  { color: '#059669', dash: [2, 2],            point: 'rectRot' }     // Verde oscuro · Rombo
];

function obtenerValorVigenteEn(puntos, fechaCorte, prop = 'p') {
  let val = null;
  for (const pt of puntos) {
    const f = pt.t.slice(0, 10);
    if (f <= fechaCorte) {
      val = pt[prop] !== undefined ? pt[prop] : pt.c;
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
  const m = estacionState.margen;
  const prod = m.producto;
  const hist = (est.historico_ytd || est.historico_30d || {})[prod];

  if (!hist || !hist.costo || hist.costo.length === 0) {
    container.innerHTML = `<div class="empty-state">Sin historial de costo disponible para ${prod}.</div>`;
    return;
  }

  const f1 = m.fechaInicio;
  const f2 = m.fechaFin;

  const puntosPropio = [...(hist.propio || [])].sort((a, b) => a.t.localeCompare(b.t));
  const puntosCosto = [...(hist.costo || [])].sort((a, b) => a.t.localeCompare(b.t));

  const labelsX = generarRangoFechas(f1, f2);

  const actoresMap = new Map((est.actores || []).map(a => [a.site_id, a]));
  const rivalesSeleccionados = m.competidoresSeleccionados || new Set();

  const datasets = [];
  const todosMargenes = [];

  // 1. Datasets de Competidores (Margen Estimado = P_rival - C_propio)
  let estiloIdx = 0;
  Object.entries(hist.competidores || {}).forEach(([siteId, puntos]) => {
    if (!rivalesSeleccionados.has(siteId)) return;
    const actor = actoresMap.get(siteId);
    const puntosOrdenados = [...(puntos || [])].sort((a, b) => a.t.localeCompare(b.t));

    const dataMargen = labelsX.map(fecha => {
      const pRival = obtenerValorVigenteEn(puntosOrdenados, fecha, 'p');
      const cPropio = obtenerValorVigenteEn(puntosCosto, fecha, 'c');
      if (pRival !== null && cPropio !== null) {
        const marg = Number((pRival - cPropio).toFixed(3));
        todosMargenes.push(marg);
        return marg;
      }
      return null;
    });

    if (dataMargen.some(v => v !== null)) {
      const estilo = ESTILOS_RIVALES[estiloIdx % ESTILOS_RIVALES.length];
      estiloIdx++;

      const nombre = actor ? actor.nombre_linea : 'Competidor';
      const dist = actor?.distancia_km !== undefined ? ` (${actor.distancia_km.toFixed(1)} km)` : '';

      datasets.push({
        label: `${nombre}${dist} (EST.)`,
        data: dataMargen,
        borderColor: estilo.color,
        backgroundColor: estilo.color,
        borderWidth: 2,
        borderDash: estilo.dash,
        pointStyle: estilo.point,
        pointRadius: 3.5,
        pointHoverRadius: 6,
        tension: 0.12,
        spanGaps: true
      });
    }
  });

  // 2. Dataset Estación Propia (Margen Real = P_propio - C_propio)
  const dataMargenPropio = labelsX.map(fecha => {
    const pPropio = obtenerValorVigenteEn(puntosPropio, fecha, 'p');
    const cPropio = obtenerValorVigenteEn(puntosCosto, fecha, 'c');
    if (pPropio !== null && cPropio !== null) {
      const marg = Number((pPropio - cPropio).toFixed(3));
      todosMargenes.push(marg);
      return marg;
    }
    return null;
  });

  if (dataMargenPropio.some(v => v !== null)) {
    datasets.unshift({
      label: `${est.estacion} (PROPIO)`,
      data: dataMargenPropio,
      borderColor: '#00BF6F',
      backgroundColor: '#00BF6F',
      borderWidth: 3.5,
      borderDash: [],
      pointStyle: 'circle',
      pointRadius: 4.5,
      pointHoverRadius: 8,
      pointBackgroundColor: '#16182F',
      pointBorderColor: '#00BF6F',
      pointBorderWidth: 2,
      order: 0,
      tension: 0.12,
      spanGaps: true
    });
  }

  if (datasets.length === 0 || todosMargenes.length === 0) {
    container.innerHTML = `<div class="empty-state">No se registraron datos suficientes para evaluar márgenes entre ${f1} y ${f2}.</div>`;
    return;
  }

  const minM = Math.min(...todosMargenes);
  const maxM = Math.max(...todosMargenes);
  const rangoYMin = Number((Math.floor(minM * 10) / 10 - 0.10).toFixed(2));
  const rangoYMax = Number((Math.ceil(maxM * 10) / 10 + 0.10).toFixed(2));

  container.innerHTML = `
    <div style="flex: 1 1 0; height: 100%; display: flex; flex-direction: column; background: #fff; border-radius: 6px; border: 1px solid var(--k-line); padding: 10px 16px 8px; box-sizing: border-box; overflow: hidden;">
      
      <!-- Cabecera -->
      <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; flex: 0 0 auto;">
        <div>
          <h3 style="font-family: 'Poppins', sans-serif; font-size: 1.0rem; font-weight: 800; color: var(--k-ink); margin: 0;">
            Análisis de Margen: ${prod.toUpperCase()}
          </h3>
          <p style="font-size: 0.70rem; color: var(--k-muted); margin: 1px 0 0 0;">
            Margen Propio Real vs Margen Estimado de Rivales (usando costo propio como referencia de mercado).
          </p>
        </div>
      </div>

      <!-- Canvas -->
      <div style="flex: 1 1 0; min-height: 0; width: 100%; position: relative; overflow: hidden;">
        <canvas id="chart-margen" style="position: absolute; inset: 0; width: 100% !important; height: 100% !important;"></canvas>
      </div>

    </div>
  `;

  if (chartInstancia) {
    chartInstancia.destroy();
    chartInstancia = null;
  }

  const ctx = document.getElementById('chart-margen');
  if (!ctx || typeof Chart === 'undefined') return;

  chartInstancia = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labelsX,
      datasets: datasets
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
          labels: {
            boxWidth: 16,
            usePointStyle: true,
            font: { family: "'Poppins', sans-serif", size: 9.5, weight: '600' },
            color: '#334155',
            padding: 8
          }
        },
        tooltip: {
          backgroundColor: '#16182F',
          titleFont: { family: "'Poppins', sans-serif", size: 11, weight: '700' },
          bodyFont: { family: "'Inter', sans-serif", size: 10.5 },
          padding: 8,
          cornerRadius: 5,
          usePointStyle: true,
          callbacks: {
            title: (items) => items.length ? `Fecha: ${items[0].label}` : '',
            label: (context) => {
              const valor = context.parsed.y !== null ? `S/ ${context.parsed.y.toFixed(2)}` : 'Sin datos';
              return ` ${context.dataset.label}: ${valor}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(226, 232, 240, 0.5)' },
          ticks: {
            font: { family: "'Inter', sans-serif", size: 10, weight: '500' },
            color: '#64748B',
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 12
          }
        },
        y: {
          min: rangoYMin,
          max: rangoYMax,
          grid: { color: 'rgba(226, 232, 240, 0.6)' },
          ticks: {
            font: { family: "'Poppins', sans-serif", size: 10, weight: '600' },
            color: '#64748B',
            callback: (val) => `S/ ${val.toFixed(2)}`
          }
        }
      }
    }
  });
}