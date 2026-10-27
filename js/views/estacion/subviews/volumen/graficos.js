/* ==========================================================
   views/estacion/subviews/volumen/graficos.js
   ========================================================== */
import { volumenSubViewState } from './state.js';

let chartInstancias = {};

function destruirGraficos() {
  Object.keys(chartInstancias).forEach(k => {
    if (chartInstancias[k]) {
      chartInstancias[k].destroy();
      chartInstancias[k] = null;
    }
  });
}

export function renderGraficosVolumen(historico) {
  destruirGraficos();

  if (volumenSubViewState.tabInterna === 'FOTO') {
    renderMixDonut(historico);
    renderSemanalBarras(historico);
  } else {
    renderBenchmarkMeses(historico);
    renderCruceDual(historico);
  }
}

// 1. Donut Chart de Mix por Producto
function renderMixDonut(historico) {
  const canvas = document.getElementById('chart-volumen-mix-donut');
  if (!canvas) return;

  const regMes = historico.filter(r => r.fecha >= '2026-10-01');
  const sumaPorProd = {};
  regMes.forEach(r => {
    sumaPorProd[r.producto] = (sumaPorProd[r.producto] || 0) + (r.volumen || 0);
  });

  const labels = Object.keys(sumaPorProd);
  const dataVals = labels.map(p => Math.round(sumaPorProd[p]));
  const colores = {
    'Diesel': '#1E293B',
    'Regular': '#0284C7',
    'Premium': '#D92D4E',
    'GNV': '#00D58A',
    'GLP': '#F59E0B'
  };

  chartInstancias.donut = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: dataVals,
        backgroundColor: labels.map(p => colores[p] || '#94A3B8'),
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10, weight: '600' } } },
        tooltip: {
          callbacks: {
            label(ctx) {
              const total = dataVals.reduce((a, b) => a + b, 0);
              const val = ctx.parsed;
              const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
              return ` ${ctx.label}: ${val.toLocaleString()} gal (${pct}%)`;
            }
          }
        }
      }
    }
  });
}

// 2. Gráfico de Barras Agrupadas: Día de Semana (Semana Actual vs Anterior)
function renderSemanalBarras(historico) {
  const canvas = document.getElementById('chart-volumen-semanal-barras');
  if (!canvas) return;

  const diasOrden = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const semActualVals = [0, 0, 0, 0, 0, 0, 0];
  const semPasadaVals = [0, 0, 0, 0, 0, 0, 0];

  const campoMetrica = volumenSubViewState.metricaSemanal === 'VOLUMEN' ? 'volumen' : 'ventas';

  historico.forEach(r => {
    const f = new Date(r.fecha + 'T00:00:00');
    let idx = f.getDay() - 1;
    if (idx === -1) idx = 6; // Domingo

    // Semana Actual: del 2026-10-19 al 2026-10-25
    if (r.fecha >= '2026-10-19' && r.fecha <= '2026-10-25') {
      semActualVals[idx] += (r[campoMetrica] || 0);
    }
    // Semana Anterior: del 2026-10-12 al 2026-10-18
    else if (r.fecha >= '2026-10-12' && r.fecha <= '2026-10-18') {
      semPasadaVals[idx] += (r[campoMetrica] || 0);
    }
  });

  chartInstancias.semanal = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: diasOrden,
      datasets: [
        {
          label: 'Semana Actual',
          data: semActualVals.map(v => Math.round(v)),
          backgroundColor: '#00D58A',
          borderRadius: 4
        },
        {
          label: 'Semana Anterior',
          data: semPasadaVals.map(v => Math.round(v)),
          backgroundColor: '#CBD5E1',
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { grid: { display: false }, ticks: { font: { weight: '700', size: 10 } } },
        y: { grid: { color: '#F1F5F9' }, ticks: { font: { size: 9 } } }
      },
      plugins: {
        legend: { position: 'top', align: 'end', labels: { boxWidth: 10, font: { size: 10 } } }
      }
    }
  });
}

// 3. Benchmark de Días Homólogos: Mes Presente vs Mes Pasado (Día 1 al 26)
function renderBenchmarkMeses(historico) {
  const canvas = document.getElementById('chart-volumen-benchmark-meses');
  if (!canvas) return;

  const prod = volumenSubViewState.productoEvolutivo;
  const regProd = historico.filter(r => (r.producto || '').toUpperCase() === prod.toUpperCase());

  const dias = Array.from({ length: 26 }, (_, i) => String(i + 1).padStart(2, '0'));
  const valsOctubre = new Array(26).fill(null);
  const valsSeptiembre = new Array(26).fill(null);

  regProd.forEach(r => {
    if (r.fecha.startsWith('2026-10-')) {
      const diaNum = parseInt(r.fecha.slice(8, 10), 10);
      if (diaNum <= 26) valsOctubre[diaNum - 1] = Math.round(r.volumen || 0);
    } else if (r.fecha.startsWith('2026-09-')) {
      const diaNum = parseInt(r.fecha.slice(8, 10), 10);
      if (diaNum <= 26) valsSeptiembre[diaNum - 1] = Math.round(r.volumen || 0);
    }
  });

  chartInstancias.benchmark = new Chart(canvas, {
    type: 'line',
    data: {
      labels: dias.map(d => `Día ${d}`),
      datasets: [
        {
          label: 'Octubre 2026 (Mes Actual)',
          data: valsOctubre,
          borderColor: '#00D58A',
          backgroundColor: 'rgba(0, 213, 138, 0.1)',
          fill: true,
          tension: 0.25,
          borderWidth: 2.5,
          pointRadius: 2
        },
        {
          label: 'Septiembre 2026 (Mes Anterior)',
          data: valsSeptiembre,
          borderColor: '#94A3B8',
          borderDash: [4, 4],
          tension: 0.25,
          borderWidth: 2,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 9.5 } } },
        y: { grid: { color: '#F1F5F9' }, ticks: { font: { size: 9 } } }
      },
      plugins: {
        legend: { position: 'top', align: 'end', labels: { boxWidth: 10, font: { size: 10 } } }
      }
    }
  });
}

// 4. Cruce Dual: Volumen Despachado (Barras) vs Precio Ponderado (Línea)
function renderCruceDual(historico) {
  const canvas = document.getElementById('chart-volumen-cruce-dual');
  if (!canvas) return;

  const prod = volumenSubViewState.productoEvolutivo;
  const regOct = historico
    .filter(r => r.fecha >= '2026-10-01' && (r.producto || '').toUpperCase() === prod.toUpperCase())
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  const labels = regOct.map(r => r.fecha.slice(5)); // '10-01', '10-02', etc.
  const volData = regOct.map(r => Math.round(r.volumen || 0));
  const precioData = regOct.map(r => r.precio_prom_ponderado ? Number(r.precio_prom_ponderado.toFixed(2)) : null);

  chartInstancias.cruce = new Chart(canvas, {
    data: {
      labels,
      datasets: [
        {
          type: 'bar',
          label: 'Volumen (gal)',
          data: volData,
          backgroundColor: 'rgba(2, 132, 199, 0.35)',
          borderColor: '#0284C7',
          borderWidth: 1,
          borderRadius: 3,
          yAxisID: 'yVol'
        },
        {
          type: 'line',
          label: 'Precio Prom. Venta (S/)',
          data: precioData,
          borderColor: '#D92D4E',
          backgroundColor: '#D92D4E',
          borderWidth: 2.5,
          pointRadius: 3,
          yAxisID: 'yPrecio'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 9.5 } } },
        yVol: {
          type: 'linear',
          position: 'left',
          grid: { color: '#F1F5F9' },
          title: { display: true, text: 'Galones', font: { size: 9.5, weight: '700' } }
        },
        yPrecio: {
          type: 'linear',
          position: 'right',
          grid: { display: false },
          title: { display: true, text: 'Soles / galón', font: { size: 9.5, weight: '700' } }
        }
      },
      plugins: {
        legend: { position: 'top', align: 'end', labels: { boxWidth: 10, font: { size: 10 } } }
      }
    }
  });
}