/* ==========================================================
   views/estacion/subviews/evolucion_precios/grafico.js —
   Evolución temporal con estilos diferenciados por estación
   (colores, patrones de línea y marcadores geométricos).
   ========================================================== */
import { evolucionState } from './state.js';

let chartInstancia = null;

// Catálogo de estilos para distinguir claramente a cada competidor
const ESTILOS_RIVALES = [
  { color: '#2563EB', dash: [6, 4],            point: 'rect' },       // Azul · Línea a rayas · Cuadrado
  { color: '#D97706', dash: [10, 3, 2, 3],      point: 'rectRot' },    // Ámbar · Raya-punto · Rombo
  { color: '#DC2626', dash: [3, 3],            point: 'triangle' },   // Rojo · Punteada · Triángulo
  { color: '#7C3AED', dash: [12, 5],           point: 'star' },       // Violeta · Raya larga · Estrella
  { color: '#DB2777', dash: [8, 3, 2, 3, 2, 3], point: 'crossRot' },   // Rosa · Raya-doble punto · Aspa (X)
  { color: '#0891B2', dash: [4, 2],            point: 'circle' },     // Cian · Punteada suave · Círculo
  { color: '#4B5563', dash: [14, 4, 3, 4],      point: 'rect' },       // Gris · Raya extendida · Cuadrado
  { color: '#059669', dash: [2, 2],            point: 'rectRot' }     // Verde oscuro · Puntos finos · Rombo
];

function obtenerPrecioVigenteEn(puntos, fechaCorte) {
  let precio = null;
  for (const pt of puntos) {
    const f = pt.t.slice(0, 10);
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

export function renderEvolucionPrecios(container, est) {
  const prod = evolucionState.producto;
  const hist = (est.historico_ytd || est.historico_30d || {})[prod];

  if (!hist) {
    container.innerHTML = `<div class="empty-state">Sin historial disponible para ${prod}.</div>`;
    return;
  }

  const f1 = evolucionState.fechaInicio;
  const f2 = evolucionState.fechaFin;

  const labelsX = generarRangoFechas(f1, f2);
  const seriePropiaOrdenada = [...(hist.propio || [])].sort((a, b) => a.t.localeCompare(b.t));

  const actoresMap = new Map((est.actores || []).map(a => [a.site_id, a]));
  const rivalesSeleccionados = evolucionState.competidoresSeleccionados || new Set();

  const datasets = [];
  const todosPrecios = [];

  // 1. Datasets de Competidores con estilos y símbolos personalizados
  let estiloIdx = 0;
  Object.entries(hist.competidores || {}).forEach(([siteId, puntos]) => {
    if (!rivalesSeleccionados.has(siteId)) return;
    const actor = actoresMap.get(siteId);
    const puntosOrdenados = [...(puntos || [])].sort((a, b) => a.t.localeCompare(b.t));

    const dataAlineada = labelsX.map(fecha => {
      const p = obtenerPrecioVigenteEn(puntosOrdenados, fecha);
      if (p !== null) todosPrecios.push(p);
      return p;
    });

    if (dataAlineada.some(p => p !== null)) {
      const estilo = ESTILOS_RIVALES[estiloIdx % ESTILOS_RIVALES.length];
      estiloIdx++;

      const nombre = actor ? actor.nombre_linea : 'Competidor';
      const dist = actor?.distancia_km !== undefined ? ` (${actor.distancia_km.toFixed(1)} km)` : '';

      datasets.push({
        label: `${nombre}${dist}`,
        data: dataAlineada,
        borderColor: estilo.color,
        backgroundColor: estilo.color,
        borderWidth: 2,
        borderDash: estilo.dash,           // Patrón de trazo (rayas / puntos)
        pointStyle: estilo.point,          // Marcador geométrico
        pointRadius: 3.5,                  // Marcador visible sin saturar
        pointHoverRadius: 7,
        tension: 0.12,                     // Diagonales con curvatura suave
        spanGaps: true
      });
    }
  });

  // 2. Dataset Propio (Sólido, grueso y circular)
  const dataPropiaAlineada = labelsX.map(fecha => {
    const p = obtenerPrecioVigenteEn(seriePropiaOrdenada, fecha);
    if (p !== null) todosPrecios.push(p);
    return p;
  });

  if (dataPropiaAlineada.some(p => p !== null)) {
    datasets.unshift({
      label: `${est.estacion} (PROPIA)`,
      data: dataPropiaAlineada,
      borderColor: '#00BF6F',
      backgroundColor: '#00BF6F',
      borderWidth: 3.5,
      borderDash: [],                      // Línea continua sólida
      pointStyle: 'circle',                // Círculo distintivo
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

  if (datasets.length === 0 || todosPrecios.length === 0) {
    container.innerHTML = `<div class="empty-state">No se registraron precios para ${prod} entre ${f1} y ${f2}.</div>`;
    return;
  }

  const minPrecio = Math.min(...todosPrecios);
  const maxPrecio = Math.max(...todosPrecios);
  const rangoYMin = Number((Math.floor(minPrecio * 10) / 10 - 0.15).toFixed(2));
  const rangoYMax = Number((Math.ceil(maxPrecio * 10) / 10 + 0.15).toFixed(2));

  container.innerHTML = `
    <div style="flex: 1 1 0; height: 100%; display: flex; flex-direction: column; background: #fff; border-radius: 6px; border: 1px solid var(--k-line); padding: 10px 16px 8px; box-sizing: border-box; overflow: hidden;">
      
      <!-- Cabecera -->
      <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; flex: 0 0 auto;">
        <div>
          <h3 style="font-family: 'Poppins', sans-serif; font-size: 1.0rem; font-weight: 800; color: var(--k-ink); margin: 0;">
            Evolución de Precios: ${prod.toUpperCase()}
          </h3>
          <p style="font-size: 0.70rem; color: var(--k-muted); margin: 1px 0 0 0;">
            Histórico cronológico de precios de venta al público en el radio competitivo.
          </p>
        </div>
      </div>

      <!-- Lienzo Chart.js -->
      <div style="flex: 1 1 0; min-height: 0; width: 100%; position: relative; overflow: hidden;">
        <canvas id="chart-evolucion-precios" style="position: absolute; inset: 0; width: 100% !important; height: 100% !important;"></canvas>
      </div>

    </div>
  `;

  if (chartInstancia) {
    chartInstancia.destroy();
    chartInstancia = null;
  }

  const ctx = document.getElementById('chart-evolucion-precios');
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
            usePointStyle: true,           // Dibuja el símbolo geométrico en la leyenda
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
          boxPadding: 3,
          usePointStyle: true,             // Muestra el icono en el tooltip
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
          grid: { color: 'rgba(226, 232, 240, 0.7)' },
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