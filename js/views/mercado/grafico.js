/* ==========================================================
   views/mercado/grafico.js — Render de Análisis de Mercado
   Gráfica combinada: Precios, Costo COESTI y Margen Unitario
   ========================================================== */
import { margenMercadoState } from './state.js';

let chartInstancia = null;

const ESTILOS_MARCAS = {
  'COESTI': { color: '#00D58A', dash: [], point: 'circle', width: 3.5 },
  'PRIMAX (DEALERS)': { color: '#FF7A00', dash: [6, 4], point: 'triangle', width: 2 },
  'REPSOL': { color: '#002B49', dash: [10, 3, 2, 3], point: 'rectRot', width: 2 },
  'PETROPERU': { color: '#E11D48', dash: [4, 4], point: 'rect', width: 2 },
  'WP': { color: '#0891B2', dash: [12, 5], point: 'star', width: 2 },
  'ENERGIGAS': { color: '#2563EB', dash: [8, 3, 2, 3, 2, 3], point: 'crossRot', width: 2 },
  'PECSA': { color: '#D97706', dash: [5, 3], point: 'triangle', width: 2 },
  'GASPETROL': { color: '#7C3AED', dash: [14, 4, 3, 4], point: 'rect', width: 2 },
  'GO! COMBUSTIBLES': { color: '#EA580C', dash: [2, 2], point: 'circle', width: 2 },
  'PETROAMERICA': { color: '#0284C7', dash: [6, 3, 2, 3], point: 'rectRot', width: 2 },
  'AVA': { color: '#9333EA', dash: [7, 4], point: 'cross', width: 2 },
  'HERCO': { color: '#4B5563', dash: [3, 2], point: 'triangle', width: 2 }
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
    container.innerHTML = `<div class="empty-state" style="margin:auto; font-weight:600; color:var(--k-muted);">Descargando datos históricos del mercado...</div>`;
    return;
  }

  const hData = margenMercadoState.historicoMarcasData;
  if (!hData || !hData.datos) {
    container.innerHTML = `<div class="empty-state" style="margin:auto; font-weight:600; color:var(--k-muted);">No hay datos históricos disponibles.</div>`;
    return;
  }

  const mm = margenMercadoState;
  const prodSel = mm.producto;
  const f1 = mm.fechaInicio;
  const f2 = mm.fechaFin;

  const mostrarPrecios = mm.metricasActivas.has('PRECIOS');
  const mostrarCostos = mm.metricasActivas.has('COSTOS');
  const mostrarMargen = mm.metricasActivas.has('MARGEN');

  // 1. Filtrar observaciones por producto y territorio
  const corrSel = mm.corredor || 'TODOS';
  const deptoSel = mm.departamento || 'TODOS';
  const provSel = mm.provincia || 'TODOS';
  const distSel = mm.distrito || 'TODOS';

  const observaciones = hData.datos.filter(item => {
    if (item.p !== prodSel) return false;
    const c = (item.c || '').trim().toUpperCase();
    const d = (item.d || '').trim().toUpperCase();
    const pv = (item.pv || '').trim().toUpperCase();
    const dt = (item.dt || '').trim().toUpperCase();

    return (corrSel === 'TODOS' || c === corrSel) &&
           (deptoSel === 'TODOS' || d === deptoSel) &&
           (provSel === 'TODOS' || pv === provSel) &&
           (distSel === 'TODOS' || dt === distSel);
  });

  if (observaciones.length === 0) {
    container.innerHTML = `<div class="empty-state" style="margin:auto; font-weight:600; color:var(--k-muted);">No hay observaciones que coincidan con los filtros seleccionados.</div>`;
    return;
  }

  // 2. Mapear precios de venta y costos representativos por fecha
  const marcaFechaMap = {};
  const costoFechaMap = {};

  observaciones.forEach(item => {
    let rawMarca = (item.m || '').trim().toUpperCase();
    const m = (rawMarca === 'PRIMAX') ? 'COESTI' : rawMarca;

    // Precios
    if (!marcaFechaMap[m]) marcaFechaMap[m] = {};
    if (!marcaFechaMap[m][item.f]) {
      marcaFechaMap[m][item.f] = { suma: 0, pesoTotal: 0 };
    }
    marcaFechaMap[m][item.f].suma += (item.pr * item.n);
    marcaFechaMap[m][item.f].pesoTotal += item.n;

    // Costos
    if (item.cs !== undefined && item.cs !== null && item.cs > 0) {
      if (!costoFechaMap[item.f]) {
        costoFechaMap[item.f] = { suma: 0, pesoTotal: 0 };
      }
      costoFechaMap[item.f].suma += (item.cs * item.n);
      costoFechaMap[item.f].pesoTotal += item.n;
    }
  });

  const labelsX = generarRangoFechas(f1, f2);

  // Serie continua de costo con forward-fill
  const fechasCostoOrdenadas = Object.keys(costoFechaMap).sort();
  const obtenerCostoEn = (fechaCorte) => {
    const validas = fechasCostoOrdenadas.filter(f => f <= fechaCorte);
    if (validas.length === 0) return null;
    const ult = costoFechaMap[validas[validas.length - 1]];
    return ult.pesoTotal > 0 ? (ult.suma / ult.pesoTotal) : null;
  };

  const serieCosto = labelsX.map(f => {
    const c = obtenerCostoEn(f);
    return c !== null ? Number(c.toFixed(2)) : null;
  });

  // 3. Montar Datasets para Chart.js
  const datasets = [];
  const marcasActivas = mm.marcasSeleccionadas || new Set(Object.keys(marcaFechaMap));

  // A. Serie de Costo COESTI
  if (mostrarCostos) {
    datasets.push({
      label: 'Costo COESTI',
      data: serieCosto,
      borderColor: '#0F172A',
      backgroundColor: 'transparent',
      borderWidth: 2.8,
      borderDash: [5, 4],
      pointRadius: 0,
      tension: 0.1,
      order: 1
    });
  }

  // B. Series de Precios y/o Márgenes por Marca
  Object.entries(marcaFechaMap).forEach(([marca, fechasObj]) => {
    if (!marcasActivas.has(marca)) return;

    const estilo = ESTILOS_MARCAS[marca] || { color: '#64748B', dash: [], point: 'circle', width: 2 };
    const fechasOrdenadas = Object.keys(fechasObj).sort();
    let ultimaObs = null;

    // Serie de Precio
    if (mostrarPrecios) {
      const dataPrecio = labelsX.map(fecha => {
        const obsFechas = fechasOrdenadas.filter(f => f <= fecha);
        if (obsFechas.length > 0) {
          const ultFecha = obsFechas[obsFechas.length - 1];
          const entry = fechasObj[ultFecha];
          if (entry && entry.pesoTotal > 0) {
            ultimaObs = Number((entry.suma / entry.pesoTotal).toFixed(2));
          }
        }
        return ultimaObs;
      });

      datasets.push({
        label: `Precio: ${marca}`,
        data: dataPrecio,
        borderColor: estilo.color,
        backgroundColor: estilo.color,
        borderWidth: estilo.width,
        borderDash: estilo.dash,
        pointStyle: estilo.point,
        pointRadius: 2.5,
        pointHoverRadius: 6,
        tension: 0.12,
        order: marca === 'COESTI' ? 2 : 3
      });
    }

    // Serie de Margen Unitario (Precio - Costo)
    if (mostrarMargen) {
      let ultPrecio = null;
      const dataMargen = labelsX.map((fecha, idx) => {
        const obsFechas = fechasOrdenadas.filter(f => f <= fecha);
        if (obsFechas.length > 0) {
          const ultFecha = obsFechas[obsFechas.length - 1];
          const entry = fechasObj[ultFecha];
          if (entry && entry.pesoTotal > 0) {
            ultPrecio = entry.suma / entry.pesoTotal;
          }
        }
        const costoDelDia = serieCosto[idx];
        if (ultPrecio !== null && costoDelDia !== null) {
          return Number((ultPrecio - costoDelDia).toFixed(2));
        }
        return null;
      });

      datasets.push({
        label: `Margen: ${marca}`,
        data: dataMargen,
        borderColor: estilo.color,
        backgroundColor: 'transparent',
        borderWidth: 1.8,
        borderDash: [3, 3],
        pointStyle: 'crossRot',
        pointRadius: 2,
        tension: 0.12,
        order: 4
      });
    }
  });

  // 4. Renderizar Contenedor y Canvas
  container.innerHTML = `
    <div style="background:#fff; border:1px solid var(--k-line); border-radius:8px; padding:16px 20px 14px; box-shadow:0 2px 10px rgba(22,24,47,.05); width:100%; height:100%; display:flex; flex-direction:column; box-sizing:border-box;">
      
      <!-- HEADER -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; flex-shrink:0;">
        <div>
          <h2 style="margin:0; font-size:1.15rem; color:var(--k-ink); font-weight:800; letter-spacing:-0.01em;">
            Análisis Dinámico de Mercado (S/)
          </h2>
          <p style="margin:2px 0 0 0; color:var(--k-muted); font-size:0.75rem;">
            Evolución histórica consolidada de ${prodSel.toUpperCase()} · Período: ${f1} ➔ ${f2}
          </p>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <div class="count-badge" style="font-weight:700;">
            ${datasets.length} Series Representadas
          </div>
        </div>
      </div>

      <!-- CANVAS -->
      <div style="flex:1 1 0; min-height:0; position:relative; width:100%;">
        <canvas id="chart-mercado-dinamico" style="position:absolute; inset:0; width:100%!important; height:100%!important;"></canvas>
      </div>

    </div>
  `;

  if (chartInstancia) {
    chartInstancia.destroy();
    chartInstancia = null;
  }

  const ctx = document.getElementById('chart-mercado-dinamico');
  if (!ctx || typeof Chart === 'undefined') return;

  chartInstancia = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labelsX,
      datasets
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
            padding: 8
          }
        },
        tooltip: {
          backgroundColor: '#16182F',
          padding: 8,
          cornerRadius: 5,
          callbacks: {
            title: (items) => items.length ? `Fecha: ${items[0].label}` : '',
            label: (context) => {
              const val = context.parsed.y;
              return val !== null ? ` ${context.dataset.label}: S/ ${val.toFixed(2)}` : ' Sin datos';
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