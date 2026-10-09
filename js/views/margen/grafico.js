/* ==========================================================
   views/margen/grafico.js — Render de Margen de Mercado con Chart.js
   ========================================================== */
import { margenMercadoState } from './state.js';

let chartInstancia = null;

const ESTILOS_MARCAS = {
  'COESTI':             { color: '#00D58A', dash: [],                 point: 'circle', width: 3.5 },
  'PRIMAX (DEALERS)':   { color: '#FF7A00', dash: [6, 4],             point: 'triangle', width: 2 },
  'REPSOL':             { color: '#002B49', dash: [10, 3, 2, 3],       point: 'rectRot', width: 2 },
  'PETROPERU':          { color: '#E11D48', dash: [4, 4],             point: 'rect', width: 2 },
  'WP':                 { color: '#0891B2', dash: [12, 5],            point: 'star', width: 2 },
  'ENERGIGAS':          { color: '#2563EB', dash: [8, 3, 2, 3, 2, 3], point: 'crossRot', width: 2 },
  'PECSA':              { color: '#D97706', dash: [5, 3],             point: 'triangle', width: 2 },
  'GASPETROL':          { color: '#7C3AED', dash: [14, 4, 3, 4],       point: 'rect', width: 2 },
  'GO! COMBUSTIBLES':   { color: '#EA580C', dash: [2, 2],             point: 'circle', width: 2 },
  'PETROAMERICA':       { color: '#0284C7', dash: [6, 3, 2, 3],       point: 'rectRot', width: 2 },
  'AVA':                { color: '#9333EA', dash: [7, 4],             point: 'cross', width: 2 },
  'HERCO':              { color: '#4B5563', dash: [3, 2],             point: 'triangle', width: 2 }
};

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

export function renderMargenMercado(container) {
  if (margenMercadoState.cargandoHistorico) {
    container.innerHTML = `<div class="empty-state">Descargando datos históricos del mercado...</div>`;
    return;
  }

  const hData = margenMercadoState.historicoMarcasData;
  if (!hData || !hData.datos) {
    container.innerHTML = `<div class="empty-state">No hay datos históricos disponibles.</div>`;
    return;
  }

  const mm = margenMercadoState;
  const prodSel = mm.producto;
  const f1 = mm.fechaInicio;
  const f2 = mm.fechaFin;

  // 1. Filtrar observaciones según segmentación
  const gpcSel = mm.gpcGroup || 'TODOS';
  const corrSel = mm.corredor || 'TODOS';
  const zonaSel = mm.zona || 'TODOS';
  const deptoSel = mm.departamento || 'TODOS';
  const provSel = mm.provincia || 'TODOS';
  const distSel = mm.distrito || 'TODOS';

  const observaciones = hData.datos.filter(item => {
    if (item.p !== prodSel) return false;
    const g = (item.g || '').trim().toUpperCase();
    const c = (item.c || '').trim().toUpperCase();
    const z = (item.z || '').trim().toUpperCase();
    const d = (item.d || '').trim().toUpperCase();
    const pv = (item.pv || '').trim().toUpperCase();
    const dt = (item.dt || '').trim().toUpperCase();

    const matchGpc = (gpcSel === 'TODOS' || g === gpcSel);
    const matchCorr = (corrSel === 'TODOS' || c === corrSel);
    const matchZona = (zonaSel === 'TODOS' || z === zonaSel);
    const matchDepto = (deptoSel === 'TODOS' || d === deptoSel);
    const matchProv = (provSel === 'TODOS' || pv === provSel);
    const matchDist = (distSel === 'TODOS' || dt === distSel);

    return matchGpc && matchCorr && matchZona && matchDepto && matchProv && matchDist;
  });

  if (observaciones.length === 0) {
    container.innerHTML = `<div class="empty-state">No hay observaciones que coincidan con los filtros seleccionados.</div>`;
    return;
  }

  // Normalizar nombres de marca
  const obsNormalizadas = observaciones.map(item => {
    let m = (item.m || '').trim().toUpperCase();
    if (m === 'PRIMAX') m = 'COESTI';
    return { ...item, m_std: m };
  });

  // 2. Mapear precios promedio y conteo de EESS por marca y fecha
  const marcaFechaMap = {};
  obsNormalizadas.forEach(item => {
    if (!marcaFechaMap[item.m_std]) marcaFechaMap[item.m_std] = {};
    if (!marcaFechaMap[item.m_std][item.f]) {
      marcaFechaMap[item.m_std][item.f] = { suma: 0, pesoTotal: 0 };
    }
    const entry = marcaFechaMap[item.m_std][item.f];
    entry.suma += (item.pr * item.n);
    entry.pesoTotal += item.n;
  });

  // 3. Extraer costo de referencia diario (costo propio de COESTI o clave 'COSTO')
  // En caso no haya fila explícita 'COSTO', se toma el costo histórico de referencia de la red
  const costosHistoricos = (hData.costos && hData.costos[prodSel]) || [];
  const costoMap = new Map();
  costosHistoricos.forEach(c => costoMap.set(c.t.slice(0, 10), c.c));

  const labelsX = generarRangoFechas(f1, f2);

  let ultimoCosto = null;
  const costosDiarios = labelsX.map(f => {
    if (costoMap.has(f)) ultimoCosto = costoMap.get(f);
    // Si no está en hData.costos, buscar si venía en la serie propia
    return ultimoCosto !== null ? ultimoCosto : 0;
  });

  // 4. Construir datasets para Chart.js
  const marcasActivas = mm.marcasSeleccionadas || new Set(Object.keys(marcaFechaMap));
  const datasets = [];
  const todosMargenes = [];

  Object.entries(marcaFechaMap).forEach(([marca, fechasObj]) => {
    if (!marcasActivas.has(marca)) return;

    const fechasOrdenadas = Object.keys(fechasObj).sort();
    let ultimaObservacion = null;
    let maxEess = 0;

    const dataMargen = labelsX.map((fecha, idx) => {
      // Forward-fill del precio promedio de la marca hasta la fecha
      const fechasValidas = fechasOrdenadas.filter(f => f <= fecha);
      if (fechasValidas.length > 0) {
        ultimaObservacion = fechasObj[fechasValidas[fechasValidas.length - 1]];
      }

      if (ultimaObservacion && ultimaObservacion.pesoTotal > 0) {
        const precioProm = ultimaObservacion.suma / ultimaObservacion.pesoTotal;
        if (ultimaObservacion.pesoTotal > maxEess) maxEess = ultimaObservacion.pesoTotal;

        const costoRef = costosDiarios[idx];
        const margen = Number((precioProm - costoRef).toFixed(3));
        todosMargenes.push(margen);
        return margen;
      }
      return null;
    });

    if (dataMargen.some(v => v !== null)) {
      const estilo = ESTILOS_MARCAS[marca] || { color: '#64748B', dash: [], point: 'circle', width: 2 };
      const esPropio = marca === 'COESTI';

      datasets.push({
        label: `${marca} (${maxEess} EESS)`,
        data: dataMargen,
        borderColor: estilo.color,
        backgroundColor: estilo.color,
        borderWidth: estilo.width,
        borderDash: estilo.dash,
        pointStyle: estilo.point,
        pointRadius: esPropio ? 4 : 3,
        pointHoverRadius: 7,
        tension: 0.12,
        order: esPropio ? 0 : 1,
        spanGaps: true
      });
    }
  });

  if (datasets.length === 0 || todosMargenes.length === 0) {
    container.innerHTML = `<div class="empty-state">No hay suficientes datos para el rango de fechas seleccionado.</div>`;
    return;
  }

  // COESTI siempre al frente
  datasets.sort((a, b) => (a.label.includes('COESTI') ? -1 : b.label.includes('COESTI') ? 1 : 0));

  const minM = Math.min(...todosMargenes);
  const maxM = Math.max(...todosMargenes);
  const rangoYMin = Number((Math.floor(minM * 10) / 10 - 0.10).toFixed(2));
  const rangoYMax = Number((Math.ceil(maxM * 10) / 10 + 0.10).toFixed(2));

  container.innerHTML = `
    <div style="flex: 1 1 0; height: 100%; display: flex; flex-direction: column; background: #fff; border-radius: 6px; border: 1px solid var(--k-line); padding: 10px 16px 8px; box-sizing: border-box; overflow: hidden;">
      
      <!-- Cabecera -->
      <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; flex: 0 0 auto;">
        <div>
          <h3 style="font-family: 'Poppins', sans-serif; font-size: 1.05rem; font-weight: 800; color: var(--k-ink); margin: 0;">
            Análisis de Margen de Mercado por Marca: ${prodSel.toUpperCase()} (S/)
          </h3>
          <p style="font-size: 0.72rem; color: var(--k-muted); margin: 1px 0 0 0;">
            Margen Promedio Estimado = Precio Promedio Ponderado − Costo Propio de Referencia · Periodo: ${f1} ➔ ${f2}
          </p>
        </div>
      </div>

      <!-- Canvas -->
      <div style="flex: 1 1 0; min-height: 0; width: 100%; position: relative; overflow: hidden;">
        <canvas id="chart-margen-mercado" style="position: absolute; inset: 0; width: 100% !important; height: 100% !important;"></canvas>
      </div>

    </div>
  `;

  if (chartInstancia) {
    chartInstancia.destroy();
    chartInstancia = null;
  }

  const ctx = document.getElementById('chart-margen-mercado');
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
            boxWidth: 14,
            usePointStyle: true,
            font: { family: "'Poppins', sans-serif", size: 9.5, weight: '600' },
            color: '#334155',
            padding: 10
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