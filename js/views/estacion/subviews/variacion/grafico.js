/* ==========================================================
   views/estacion/subviews/variacion/grafico.js — Variación persistente
   ========================================================== */
import { estacionState } from '../../state.js';
import { getBrandLogo } from '../../../../config/marcas.js';

let chartSubVarInstancia = null;

function obtenerPuntoVigenteEn(puntos, fechaCorte, key = 'p') {
  let valor = null;
  for (const pt of puntos) {
    const f = (pt.t || '').slice(0, 10);
    if (f <= fechaCorte) {
      valor = pt[key];
    } else {
      break;
    }
  }
  return valor;
}

export function renderVariacion(container, est) {
  // LECTURA PERSISTENTE DESDE estacionState.filtros
  const f = estacionState.filtros;
  const prod = f.producto || 'Diesel';
  const hist = (est.historico_ytd || est.historico_30d || {})[prod];

  if (!hist) {
    container.innerHTML = `<div class="empty-state" style="margin:auto; font-weight:600; color:var(--k-muted);">Sin historial disponible para ${prod}.</div>`;
    return;
  }

  const f1 = f.fechaInicio;
  const f2 = f.fechaFin;

  // 1. Precios y Costo de la Estación Propia
  const puntosPropio = [...(hist.propio || [])].sort((a, b) => a.t.localeCompare(b.t));
  const puntosCosto = [...(hist.costo || [])].sort((a, b) => a.t.localeCompare(b.t));

  const p1Propio = obtenerPuntoVigenteEn(puntosPropio, f1, 'p');
  const p2Propio = obtenerPuntoVigenteEn(puntosPropio, f2, 'p');
  const c2Propio = obtenerPuntoVigenteEn(puntosCosto, f2, 'c');

  const items = [];

  // Agregar Estación Propia
  if (p1Propio !== null && p2Propio !== null) {
    const deltaPropio = Math.round((p2Propio - p1Propio) * 100) / 100;
    const margenPropio = (c2Propio !== null && p2Propio > 0) 
      ? Math.round((p2Propio - c2Propio) * 100) / 100 
      : null;

    items.push({
      siteId: est.site_id || est.own_site_id || 'propio',
      nombre: est.estacion,
      marca: 'PRIMAX',
      distancia: null,
      esPropio: true,
      pBase: p1Propio,
      pCorte: p2Propio,
      delta: deltaPropio,
      diffVsPropio: 0,
      margenActual: margenPropio
    });
  }

  // 2. Agregar Competidores Directos
  const actoresMap = new Map((est.actores || []).map(a => [a.site_id, a]));
  Object.entries(hist.competidores || {}).forEach(([siteId, puntos]) => {
    const actor = actoresMap.get(siteId);
    const puntosComp = [...(puntos || [])].sort((a, b) => a.t.localeCompare(b.t));
    const p1 = obtenerPuntoVigenteEn(puntosComp, f1, 'p');
    const p2 = obtenerPuntoVigenteEn(puntosComp, f2, 'p');

    if (p1 !== null && p2 !== null) {
      const delta = Math.round((p2 - p1) * 100) / 100;
      const diffVsPropio = p2Propio !== null ? Math.round((p2 - p2Propio) * 100) / 100 : null;
      const margenComp = (c2Propio !== null && p2 > 0) 
        ? Math.round((p2 - c2Propio) * 100) / 100 
        : null;

      items.push({
        siteId,
        nombre: actor ? actor.nombre_linea : 'Competidor',
        marca: actor ? actor.marca : '—',
        distancia: actor?.distancia_km,
        esPropio: false,
        pBase: p1,
        pCorte: p2,
        delta,
        diffVsPropio,
        margenActual: margenComp
      });
    }
  });

  if (items.length === 0) {
    container.innerHTML = `<div class="empty-state" style="margin:auto; font-weight:600; color:var(--k-muted);">No se registraron datos en el rango ${f1} a ${f2}.</div>`;
    return;
  }

  // 3. Ordenar estaciones por precio de corte ascendente
  items.sort((a, b) => a.pCorte - b.pCorte);

  // 4. Inyectar estructura HTML del contenedor
  container.innerHTML = `
    <div style="flex: 1 1 0; height: 100%; display: flex; flex-direction: column; background: #fff; border-radius: 8px; border: 1px solid var(--k-line); padding: 14px 18px 10px; box-sizing: border-box; overflow: hidden;">
      
      <!-- Cabecera -->
      <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; flex: 0 0 auto;">
        <div>
          <h3 style="font-family: 'Poppins', sans-serif; font-size: 1.05rem; font-weight: 800; color: var(--k-ink); margin: 0;">
            Variación Histórica de Precios por Estación (S/)
          </h3>
          <p style="font-size: 0.72rem; color: var(--k-muted); margin: 2px 0 0 0;">
            Evaluando ${prod.toUpperCase()} · Período: ${f1} ➔ ${f2}
          </p>
        </div>
        <div class="count-badge" style="font-weight:700;">${items.length} Estaciones Evaluadas</div>
      </div>

      <!-- Zona del Canvas Chart.js -->
      <div style="flex: 1 1 58%; min-height: 180px; width: 100%; position: relative;">
        <canvas id="chart-subview-variacion-canvas" style="position: absolute; inset: 0; width: 100%!important; height: 100%!important;"></canvas>
      </div>

      <!-- Separador -->
      <div style="height: 1px; background: #E2E8F0; margin: 4px 0 8px 0; flex-shrink: 0;"></div>

      <!-- Footer sincronizado con Tarjetas -->
      <div id="subview-variacion-footer" style="flex: 0 0 auto; display: flex; width: 100%; align-items: flex-start;"></div>

    </div>
  `;

  // 5. Renderizar Footer
  const footerBox = document.getElementById('subview-variacion-footer');
  if (footerBox) {
    const colWidthPct = (100 / items.length).toFixed(3);
    footerBox.innerHTML = items.map(it => {
      let diffHTML = '<div style="font-size:0.6rem; color:#64748B; line-height:1; margin:-2px 0 3px 0;">&nbsp;</div>';
      if (!it.esPropio && it.diffVsPropio !== null) {
        let colorDiff = '#64748B';
        let signo = '';
        if (it.diffVsPropio > 0.001) {
          colorDiff = 'var(--diff-pos, #D92D4E)';
          signo = '+';
        } else if (it.diffVsPropio < -0.001) {
          colorDiff = 'var(--diff-neg, #00A35E)';
        }
        diffHTML = `<div style="font-size: 0.62rem; font-weight: 800; color: ${colorDiff}; line-height:1; margin:-2px 0 3px 0; font-variant-numeric: tabular-nums;">(${signo}${it.diffVsPropio.toFixed(2)})</div>`;
      }

      const propioCardStyle = it.esPropio 
        ? 'background: #F0FDF4; border: 1px solid #BBF7D0;' 
        : 'background: #F8FAFC; border: 1px solid #E2E8F0;';

      const margenHtml = it.margenActual !== null
        ? `<div style="font-size:0.56rem; color:#64748B; text-transform:uppercase; font-weight:700; line-height:1; margin-top:2px; border-top:1px dashed #CBD5E1; padding-top:2px;">Margen Actual</div>
           <div style="font-size:0.70rem; font-weight:800; color:${it.margenActual >= 0 ? '#0284C7' : 'var(--diff-pos)'}; font-variant-numeric:tabular-nums;">S/ ${it.margenActual.toFixed(2)}</div>`
        : '';

      return `
        <div style="flex: 1 1 0; max-width: ${colWidthPct}%; display: flex; flex-direction: column; align-items: center; text-align: center; padding: 0 3px; box-sizing: border-box; min-width: 0;">
          <div style="width: 32px; height: 32px; border-radius: 50%; overflow: hidden; background: #fff; border: 1px solid #E2E8F0; margin-bottom: 3px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; padding: 2px; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">
            <img src="${getBrandLogo(it.marca)}" alt="${it.marca}" style="width: 100%; height: 100%; object-fit: contain; border-radius: 50%;">
          </div>
          <span style="font-size: 0.68rem; font-weight: 800; color: ${it.esPropio ? 'var(--k-emerald, #00D58A)' : 'var(--k-ink)'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; line-height: 1.1;" title="${it.nombre}">
            ${it.nombre}
          </span>
          <span style="font-size: 0.58rem; color: var(--k-muted); margin-bottom: 4px; font-weight: 600;">
            ${it.esPropio ? 'PROPIA' : (it.distancia !== undefined && it.distancia !== null ? `${it.distancia.toFixed(1)} km` : it.marca)}
          </span>
          <div style="${propioCardStyle} border-radius: 5px; padding: 4px 3px; width: 100%; max-width: 90px; box-shadow: 0 1px 2px rgba(0,0,0,0.03); box-sizing: border-box;">
            <div style="font-size: 0.56rem; color: #64748B; text-transform: uppercase; font-weight: 600; line-height: 1;">Base</div>
            <div style="font-size: 0.70rem; font-weight: 700; color: #1E293B; margin-bottom: 2px; font-variant-numeric: tabular-nums;">
              S/ ${it.pBase.toFixed(2)}
            </div>
            <div style="font-size: 0.56rem; color: #64748B; text-transform: uppercase; font-weight: 600; line-height: 1;">Corte</div>
            <div style="font-size: 0.70rem; font-weight: 700; color: #1E293B; margin-bottom: 2px; font-variant-numeric: tabular-nums;">
              S/ ${it.pCorte.toFixed(2)}
            </div>
            ${diffHTML}
            ${margenHtml}
          </div>
        </div>
      `;
    }).join('');
  }

  // 6. Configuración de Chart.js
  const canvas = document.getElementById('chart-subview-variacion-canvas');
  if (!canvas || typeof Chart === 'undefined') return;

  if (chartSubVarInstancia) {
    chartSubVarInstancia.destroy();
    chartSubVarInstancia = null;
  }

  const labels = items.map(d => d.nombre);
  const deltas = items.map(d => d.delta);
  const maxAbsDelta = Math.max(...deltas.map(v => Math.abs(v)));
  const limiteY = Math.max(0.30, Math.ceil((maxAbsDelta + 0.15) * 10) / 10);

  const backgroundColors = items.map(d => {
    if (d.esPropio) return '#00D58A';
    return d.delta >= 0 ? '#EF4444' : '#3B82F6';
  });

  const borderColors = items.map(d => {
    if (d.esPropio) return '#00B072';
    return d.delta >= 0 ? '#DC2626' : '#2563EB';
  });

  const baselineAndLabelsPlugin = {
    id: 'subviewBaselineAndLabels',
    afterLayout(chart) {
      const footer = document.getElementById('subview-variacion-footer');
      if (footer && chart.chartArea) {
        footer.style.paddingLeft = `${chart.chartArea.left}px`;
        footer.style.paddingRight = `${chart.width - chart.chartArea.right}px`;
        footer.style.boxSizing = 'border-box';
      }
    },
    afterDraw(chart) {
      const { ctx, chartArea, scales: { y } } = chart;
      const zeroPixel = y.getPixelForValue(0);

      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1.8;
      ctx.moveTo(chartArea.left, zeroPixel);
      ctx.lineTo(chartArea.right, zeroPixel);
      ctx.stroke();

      ctx.fillStyle = '#64748B';
      ctx.font = "bold 11px 'Inter', sans-serif";
      ctx.textAlign = 'right';
      ctx.fillText('0.00', chartArea.left - 8, zeroPixel + 3.5);

      chart.data.datasets.forEach((dataset, i) => {
        const meta = chart.getDatasetMeta(i);
        meta.data.forEach((bar, index) => {
          const val = dataset.data[index];
          const signo = val > 0 ? '+' : '';
          const str = `${signo}${val.toFixed(2)}`;

          ctx.font = "bold 11px 'Inter', sans-serif";
          ctx.fillStyle = backgroundColors[index];
          ctx.textAlign = 'center';

          let yPos = zeroPixel - 8;
          if (val > 0) {
            yPos = Math.max(chartArea.top + 14, bar.y - 7);
          } else if (val < 0) {
            yPos = Math.min(chartArea.bottom - 4, bar.y + 16);
          }
          ctx.fillText(str, bar.x, yPos);
        });
      });

      ctx.restore();
    }
  };

  chartSubVarInstancia = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: deltas,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1.5,
        borderRadius: (ctx) => {
          const val = ctx.raw;
          if (val > 0) return { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 };
          if (val < 0) return { topLeft: 0, topRight: 0, bottomLeft: 4, bottomRight: 4 };
          return 0;
        },
        barPercentage: 0.45
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: { top: 25, bottom: 15, left: 0, right: 0 }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#16182F',
          padding: 8,
          cornerRadius: 5,
          callbacks: {
            title: (items) => items.length ? items[0].label : '',
            label: (ctx) => {
              const d = items[ctx.dataIndex];
              const s = d.delta > 0 ? '+' : '';
              return [
                ` Variación: S/ ${s}${d.delta.toFixed(2)}`,
                ` • Base (${f1}): S/ ${d.pBase.toFixed(2)}`,
                ` • Corte (${f2}): S/ ${d.pCorte.toFixed(2)}`,
                d.margenActual !== null ? ` • Margen Corte: S/ ${d.margenActual.toFixed(2)}` : null
              ].filter(Boolean);
            }
          }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { display: false } },
        y: {
          min: -limiteY,
          max: limiteY,
          grid: {
            color: (context) => context.tick.value === 0 ? 'transparent' : 'rgba(226, 232, 240, 0.6)'
          },
          ticks: {
            font: { family: "'Inter', sans-serif", size: 10, weight: '600' },
            color: '#64748B',
            callback: (v) => v === 0 ? '' : (v > 0 ? `+${v.toFixed(2)}` : v.toFixed(2))
          }
        }
      }
    },
    plugins: [baselineAndLabelsPlugin]
  });
}