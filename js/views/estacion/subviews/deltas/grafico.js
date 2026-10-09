/* ==========================================================
   views/estacion/subviews/deltas/grafico.js —
   Evolución de diferenciales vs competidor seleccionado.
   ========================================================== */
import { diffState } from './state.js';

let chartInstancia = null;

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

export function renderEvolucionDiff(container, est) {
  const prod = diffState.producto;
  const hist = (est.historico_ytd || est.historico_30d || {})[prod];

  if (!hist) {
    container.innerHTML = `<div class="empty-state">Sin historial disponible para ${prod}.</div>`;
    return;
  }

  const f1 = diffState.fechaInicio;
  const f2 = diffState.fechaFin;

  const competidores = (est.actores || []).filter(a => a.tipo_actor !== 'PROPIO');
  if (!diffState.competidorId && competidores.length > 0) {
    diffState.competidorId = competidores[0].site_id;
  }

  const actorRival = competidores.find(c => c.site_id === diffState.competidorId);
  const rivalId = diffState.competidorId;

  const puntosPropio = [...(hist.propio || [])].sort((a, b) => a.t.localeCompare(b.t));
  const puntosRival = [...((hist.competidores && hist.competidores[rivalId]) || [])].sort((a, b) => a.t.localeCompare(b.t));

  const labelsX = generarRangoFechas(f1, f2);

  // 1. Calcular el diferencial día a día (P_propio - P_rival)
  const deltas = [];
  const datosHover = []; // Guardará los precios individuales para el tooltip

  labelsX.forEach(fecha => {
    const pPropio = obtenerPrecioVigenteEn(puntosPropio, fecha);
    const pRival = obtenerPrecioVigenteEn(puntosRival, fecha);

    if (pPropio !== null && pRival !== null) {
      const d = Number((pPropio - pRival).toFixed(3));
      deltas.push(d);
      datosHover.push({ pPropio, pRival, delta: d });
    } else {
      deltas.push(null);
      datosHover.push(null);
    }
  });

  const deltasValidos = deltas.filter(d => d !== null);
  if (deltasValidos.length === 0) {
    container.innerHTML = `<div class="empty-state">No hay suficientes datos comparativos entre ${f1} y ${f2}.</div>`;
    return;
  }

  // 2. Límites simétricos para centrar el eje 0
  const maxAbs = Math.max(...deltasValidos.map(Math.abs), 0.20);
  const limiteY = Number((Math.ceil(maxAbs * 10) / 10 + 0.15).toFixed(2));

  // 3. Plugin para línea 0 semitransparente y marcas de texto en áreas
  const pluginAreas = {
    id: 'diffAreasPlugin',
    beforeDraw(chart) {
      const { ctx, chartArea: { left, right, top, bottom }, scales: { y } } = chart;
      const yZero = y.getPixelForValue(0);

      // Franja semitransparente de la línea 0
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(22, 24, 47, 0.45)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.moveTo(left, yZero);
      ctx.lineTo(right, yZero);
      ctx.stroke();

      // Texto Región Superior
      ctx.font = "800 10px 'Poppins', sans-serif";
      ctx.fillStyle = "rgba(217, 45, 78, 0.65)"; // Rojo suave
      ctx.fillText("▲ POR ENCIMA DEL COMPETIDOR", left + 14, top + 18);

      // Texto Región Inferior
      ctx.fillStyle = "rgba(0, 163, 94, 0.65)"; // Verde suave
      ctx.fillText("▼ POR DEBAJO DEL COMPETIDOR", left + 14, bottom - 12);
      ctx.restore();
    }
  };

  const nombreRival = actorRival ? actorRival.nombre_linea : 'Competidor';
  const distRival = actorRival?.distancia_km !== undefined ? ` (${actorRival.distancia_km.toFixed(1)} km)` : '';

  container.innerHTML = `
    <div style="flex: 1 1 0; height: 100%; display: flex; flex-direction: column; background: #fff; border-radius: 6px; border: 1px solid var(--k-line); padding: 10px 16px 8px; box-sizing: border-box; overflow: hidden;">
      
      <!-- Cabecera -->
      <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; flex: 0 0 auto;">
        <div>
          <h3 style="font-family: 'Poppins', sans-serif; font-size: 1.0rem; font-weight: 800; color: var(--k-ink); margin: 0;">
            Evolución de Diferenciales: ${prod.toUpperCase()}
          </h3>
          <p style="font-size: 0.70rem; color: var(--k-muted); margin: 1px 0 0 0;">
            Diferencial (S/) = [${est.estacion}] − [${nombreRival}${distRival}]
          </p>
        </div>
      </div>

      <!-- Canvas -->
      <div style="flex: 1 1 0; min-height: 0; width: 100%; position: relative; overflow: hidden;">
        <canvas id="chart-evolucion-diff" style="position: absolute; inset: 0; width: 100% !important; height: 100% !important;"></canvas>
      </div>

    </div>
  `;

  if (chartInstancia) {
    chartInstancia.destroy();
    chartInstancia = null;
  }

  const ctx = document.getElementById('chart-evolucion-diff');
  if (!ctx || typeof Chart === 'undefined') return;

  chartInstancia = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labelsX,
      datasets: [{
        label: `Diferencial vs ${nombreRival}`,
        data: deltas,
        borderColor: '#2E3192', // Azul institucional[cite: 7]
        backgroundColor: '#2E3192',
        borderWidth: 2.5,
        pointStyle: 'circle',
        pointRadius: 3,
        pointHoverRadius: 7,
        tension: 0.12,
        spanGaps: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#16182F', //[cite: 7, 21]
          titleFont: { family: "'Poppins', sans-serif", size: 11, weight: '700' },
          bodyFont: { family: "'Inter', sans-serif", size: 10.5 },
          padding: 8,
          cornerRadius: 5,
          callbacks: {
            title: (items) => items.length ? `Fecha: ${items[0].label}` : '',
            label: (context) => {
              const idx = context.dataIndex;
              const info = datosHover[idx];
              if (!info) return 'Sin datos';

              const signo = info.delta > 0 ? '+' : '';
              return [
                ` Diferencial: S/ ${signo}${info.delta.toFixed(2)}`,
                ` • Propio: S/ ${info.pPropio.toFixed(2)}`,
                ` • Rival:  S/ ${info.pRival.toFixed(2)}`
              ];
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
          min: -limiteY,
          max: limiteY,
          grid: { color: 'rgba(226, 232, 240, 0.6)' },
          ticks: {
            font: { family: "'Poppins', sans-serif", size: 10, weight: '600' },
            color: '#64748B',
            callback: (val) => {
              if (val === 0) return '0.00';
              return (val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2));
            }
          }
        }
      }
    },
    plugins: [pluginAreas]
  });
}