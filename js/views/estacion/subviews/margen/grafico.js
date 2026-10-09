import { estacionState } from '../../state.js';

let chartInstancia = null;

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
  const competidores = (est.actores || []).filter(a => a.tipo_actor !== 'PROPIO');
  if (!m.competidorId && competidores.length > 0) m.competidorId = competidores[0].site_id;

  const actorRival = competidores.find(c => c.site_id === m.competidorId);
  const rivalId = m.competidorId;

  const puntosPropio = [...(hist.propio || [])].sort((a, b) => a.t.localeCompare(b.t));
  const puntosCosto = [...(hist.costo || [])].sort((a, b) => a.t.localeCompare(b.t));
  const puntosRival = [...((hist.competidores && hist.competidores[rivalId]) || [])].sort((a, b) => a.t.localeCompare(b.t));

  const labelsX = generarRangoFechas(f1, f2);

  const dataMargenPropio = [];
  const dataMargenRival = [];
  const todosMargenes = [];

  labelsX.forEach(fecha => {
    const pPropio = obtenerValorVigenteEn(puntosPropio, fecha, 'p');
    const cPropio = obtenerValorVigenteEn(puntosCosto, fecha, 'c');
    const pRival = obtenerValorVigenteEn(puntosRival, fecha, 'p');

    // Margen propio = P_propio - Costo
    if (pPropio !== null && cPropio !== null) {
      const margP = Number((pPropio - cPropio).toFixed(3));
      dataMargenPropio.push(margP);
      todosMargenes.push(margP);
    } else {
      dataMargenPropio.push(null);
    }

    // Margen rival estimado = P_rival - Costo
    if (pRival !== null && cPropio !== null) {
      const margR = Number((pRival - cPropio).toFixed(3));
      dataMargenRival.push(margR);
      todosMargenes.push(margR);
    } else {
      dataMargenRival.push(null);
    }
  });

  if (todosMargenes.length === 0) {
    container.innerHTML = `<div class="empty-state">No se registraron datos suficientes para evaluar márgenes entre ${f1} y ${f2}.</div>`;
    return;
  }

  const minM = Math.min(...todosMargenes);
  const maxM = Math.max(...todosMargenes);
  const rangoYMin = Number((Math.floor(minM * 10) / 10 - 0.10).toFixed(2));
  const rangoYMax = Number((Math.ceil(maxM * 10) / 10 + 0.10).toFixed(2));

  const nombreRival = actorRival ? actorRival.nombre_linea : 'Competidor';
  const distRival = actorRival?.distancia_km !== undefined ? ` (${actorRival.distancia_km.toFixed(1)} km)` : '';

  container.innerHTML = `
    <div style="flex: 1 1 0; height: 100%; display: flex; flex-direction: column; background: #fff; border-radius: 6px; border: 1px solid var(--k-line); padding: 10px 16px 8px; box-sizing: border-box; overflow: hidden;">
      <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; flex: 0 0 auto;">
        <div>
          <h3 style="font-family: 'Poppins', sans-serif; font-size: 1.0rem; font-weight: 800; color: var(--k-ink); margin: 0;">
            Análisis de Margen: ${prod.toUpperCase()}
          </h3>
          <p style="font-size: 0.70rem; color: var(--k-muted); margin: 1px 0 0 0;">
            Margen Propio vs Margen Estimado del Rival [${nombreRival}${distRival}] usando costo propio como base de mercado.
          </p>
        </div>
      </div>

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
      datasets: [
        {
          label: `${est.estacion} (PROPIO)`,
          data: dataMargenPropio,
          borderColor: '#00BF6F',
          backgroundColor: '#00BF6F',
          borderWidth: 3.5,
          pointStyle: 'circle',
          pointRadius: 3.5,
          pointHoverRadius: 7,
          tension: 0.12,
          spanGaps: true
        },
        {
          label: `${nombreRival} (ESTIMADO)`,
          data: dataMargenRival,
          borderColor: '#2563EB',
          backgroundColor: '#2563EB',
          borderWidth: 2,
          borderDash: [6, 4],
          pointStyle: 'rect',
          pointRadius: 3.5,
          pointHoverRadius: 6,
          tension: 0.12,
          spanGaps: true
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
          labels: {
            usePointStyle: true,
            font: { family: "'Poppins', sans-serif", size: 10, weight: '600' },
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