/* ==========================================================
   views/variacion/vista.js — Vista "Variación Histórica"
   Alineación pixel-perfect de Chart.js con Footer y escala fija en 0.
   ========================================================== */
import { getBrandLogo, LOGO_GENERICO } from '../../config/marcas.js';
import { variacionState } from './state.js';
import { procesarVariacionHistorica } from './calculo.js';

let chartVariacionInstancia = null;

export function variacionHTML() {
  return `
  <div id="variacion-shell" class="alineacion-shell" style="display: none; padding: 14px 16px; height: 100%; box-sizing: border-box; overflow: hidden;">
    <div style="background:#fff; border:1px solid var(--k-line); border-radius:8px; padding:16px 20px 14px 20px; box-shadow:0 2px 10px rgba(22,24,47,.05); height: 100%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;">
      
      <!-- HEADER -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px; flex-shrink: 0;">
        <div>
          <h2 id="var-chart-title" style="margin:0; font-size:1.15rem; color:var(--k-ink); font-weight:800; letter-spacing:-0.01em;">Variación Histórica de Precios por Marca (S/)</h2>
          <p id="variacion-subtitulo" style="margin:2px 0 0 0; color:var(--k-muted); font-size:0.75rem;">Calculado sobre las estaciones que cumplen con la segmentación activa.</p>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <div id="variacion-rango-badge" class="alineacion-legend-mini">
            <span class="leg-chip leg-ok">Período: Cargando...</span>
          </div>
          <div id="var-eess-conteo" class="count-badge" style="font-weight:700;">0 EESS Activas</div>
        </div>
      </div>

      <!-- CONTENEDOR PRINCIPAL DINÁMICO -->
      <div id="variacion-chart-container" style="flex: 1; display: flex; flex-direction: column; min-height: 0; position: relative;">
        <!-- Inyectado por renderVariacionHistorica -->
      </div>

    </div>
  </div>
  `;
}

function renderDiffCoesti(diff) {
  if (diff === null || diff === undefined) {
    return `<div style="font-size:0.6rem; font-weight:700; color:#64748B; line-height:1; margin:-2px 0 4px 0;">&nbsp;</div>`;
  }

  let color = '#64748B';
  let signo = '';

  if (diff > 0.001) {
    color = 'var(--diff-pos, #D92D4E)';
    signo = '+';
  } else if (diff < -0.001) {
    color = 'var(--diff-neg, #00A35E)';
  }

  return `
    <div style="font-size:0.62rem; font-weight:800; color:${color}; line-height:1; margin:-2px 0 4px 0; font-variant-numeric:tabular-nums;">
      (${signo}${diff.toFixed(2)})
    </div>
  `;
}

function renderLogoMarca(marca) {
  const norm = (marca || '').trim().toUpperCase();
  const keyBusqueda = (norm === 'COESTI' || norm.includes('DEALER')) ? 'PRIMAX' : norm;
  const rutaLogo = getBrandLogo(keyBusqueda);

  return `
    <div style="width:36px; height:36px; border-radius:50%; background:#fff; border:1px solid #E2E8F0; display:flex; align-items:center; justify-content:center; margin-bottom:4px; box-shadow:0 1px 3px rgba(0,0,0,0.06); overflow:hidden; padding:2px; flex-shrink:0;">
      <img src="${rutaLogo}" alt="${norm}" onerror="this.src='${LOGO_GENERICO}'" style="width:100%; height:100%; object-fit:contain; border-radius:50%;">
    </div>
  `;
}

export function renderVariacionHistorica() {
  const shell = document.getElementById('variacion-shell');
  if (!shell) return;

  const chartContainer = document.getElementById('variacion-chart-container');
  const subtitulo = document.getElementById('variacion-subtitulo');
  const badgeRango = document.getElementById('variacion-rango-badge');
  const badgeConteo = document.getElementById('var-eess-conteo');

  if (variacionState.cargandoHistorico) {
    if (chartContainer) {
      chartContainer.innerHTML = `<div class="empty-state" style="margin:auto; font-weight:600; color:var(--k-muted);">Descargando datos históricos...</div>`;
    }
    return;
  }

  const f1 = variacionState.fechaInicio;
  const f2 = variacionState.fechaFin;

  if (badgeRango) badgeRango.innerHTML = `<span class="leg-chip leg-ok">Período: ${f1} ➔ ${f2}</span>`;

  if (subtitulo) {
    const filtros = [];
    if (variacionState.gpc && variacionState.gpc !== 'TODOS') filtros.push(`GPC GROUP: ${variacionState.gpc}`);
    if (variacionState.gop && variacionState.gop !== 'TODOS') filtros.push(`GOP: ${variacionState.gop}`);
    if (variacionState.jop && variacionState.jop !== 'TODOS') filtros.push(`JOP: ${variacionState.jop}`);
    if (variacionState.corredor && variacionState.corredor !== 'TODOS') filtros.push(`Corredor: ${variacionState.corredor}`);
    if (variacionState.departamento && variacionState.departamento !== 'TODOS') filtros.push(`Depto: ${variacionState.departamento}`);
    subtitulo.innerText = `Evaluando ${variacionState.producto.toUpperCase()} ${filtros.length ? '· ' + filtros.join(' · ') : '· Red Nacional'}`;
  }

  const data = procesarVariacionHistorica();

  if (data.length === 0) {
    if (chartContainer) {
      chartContainer.innerHTML = `<div class="empty-state" style="margin:auto; font-weight:600; color:var(--k-muted);">No hay observaciones para las fechas y filtros seleccionados.</div>`;
    }
    if (badgeConteo) badgeConteo.innerText = '0 EESS Activas';
    return;
  }

  const totalObservaciones = data.reduce((acc, d) => acc + d.conteoEess, 0);
  if (badgeConteo) badgeConteo.innerText = `${totalObservaciones} EESS Activas`;

  // Asegurar redondeo limpio a 2 decimales para evitar micro-ruido flotante
  data.forEach(d => {
    d.delta = Math.round(d.delta * 100) / 100;
  });

  // Reconstrucción del Layout (El canvas ocupa el 100% y el footer coincide en columnas exactas)
  chartContainer.innerHTML = `
    <div style="flex: 1 1 58%; min-height: 190px; position: relative; width: 100%;">
      <canvas id="chart-variacion-canvas" style="position: absolute; inset: 0; width: 100%!important; height: 100%!important;"></canvas>
    </div>
    <div style="height: 1px; background: #E2E8F0; margin: 4px 0 10px 0; flex-shrink: 0;"></div>
    <div id="variacion-cards-footer" style="flex: 0 0 auto; display: flex; width: 100%; align-items: flex-start;"></div>
  `;

  // Renderizar Footer (Columna proporcional exacta por marca)
  const footerBox = document.getElementById('variacion-cards-footer');
  if (footerBox) {
    const colWidthPct = (100 / data.length).toFixed(3);
    footerBox.innerHTML = data.map(item => {
      const esCoesti = (item.marca === 'COESTI');
      const margenHtml = item.margenActual !== null 
        ? `<div style="font-size:0.56rem; color:#64748B; text-transform:uppercase; font-weight:700; line-height:1; margin-top:3px; border-top:1px dashed #CBD5E1; padding-top:3px;">Margen Actual</div>
           <div style="font-size:0.72rem; font-weight:800; color:${item.margenActual >= 0 ? '#0284C7' : 'var(--diff-pos)'}; font-variant-numeric:tabular-nums;">S/ ${item.margenActual.toFixed(2)}</div>`
        : '';

      return `
        <div style="flex: 1 1 0; max-width: ${colWidthPct}%; display: flex; flex-direction: column; align-items: center; text-align: center; padding: 0 4px; box-sizing: border-box;">
          ${renderLogoMarca(item.marca)}

          <div style="font-size:0.70rem; font-weight:800; color:${esCoesti ? 'var(--k-emerald, #00D58A)' : 'var(--k-ink)'}; margin-bottom:5px; line-height:1.1; width:100%; height:22px; display:flex; align-items:center; justify-content:center;">
            ${item.marca}
          </div>

          <div style="background:${esCoesti ? '#F0FDF4' : '#F8FAFC'}; border:1px solid ${esCoesti ? '#BBF7D0' : '#E2E8F0'}; border-radius:5px; padding:4px 3px; width: 100%; max-width: 90px; box-shadow:0 1px 2px rgba(0,0,0,0.03); box-sizing: border-box;">
            <div style="font-size:0.56rem; color:#64748B; text-transform:uppercase; font-weight:600; line-height:1;">Base</div>
            <div style="font-size:0.70rem; font-weight:700; color:#1E293B; margin-bottom:2px; font-variant-numeric:tabular-nums;">
              S/ ${item.precioF1.toFixed(2)}
            </div>
            ${renderDiffCoesti(item.diffF1)}

            <div style="font-size:0.56rem; color:#64748B; text-transform:uppercase; font-weight:600; line-height:1;">Corte</div>
            <div style="font-size:0.70rem; font-weight:700; color:#1E293B; margin-bottom:2px; font-variant-numeric:tabular-nums;">
              S/ ${item.precioF2.toFixed(2)}
            </div>
            ${renderDiffCoesti(item.diffF2)}

            ${margenHtml}

            <div style="font-size:0.54rem; color:#94A3B8; border-top:1px dashed #CBD5E1; padding-top:2px; margin-top:3px;">
              <b>${item.conteoEess}</b> EESS
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Configuración de escala Y controlada (evita colapso de ceros y cortes de etiquetas)
  const canvas = document.getElementById('chart-variacion-canvas');
  if (!canvas || typeof Chart === 'undefined') return;

  if (chartVariacionInstancia) {
    chartVariacionInstancia.destroy();
    chartVariacionInstancia = null;
  }

  const labels = data.map(d => d.marca);
  const deltas = data.map(d => d.delta);

  // Determinar límites del eje Y asegurando rango mínimo saludable
  const maxAbsDelta = Math.max(...deltas.map(v => Math.abs(v)));
  const limiteY = Math.max(0.30, Math.ceil((maxAbsDelta + 0.15) * 10) / 10);

  const backgroundColors = data.map(d => {
    if (d.marca === 'COESTI') return '#00D58A';
    return d.delta >= 0 ? '#EF4444' : '#3B82F6';
  });

  const borderColors = data.map(d => {
    if (d.marca === 'COESTI') return '#00B072';
    return d.delta >= 0 ? '#DC2626' : '#2563EB';
  });

  // Plugin: Sincronización del Footer, Línea 0.00 y Labels numéricos
  const baselineAndLabelsPlugin = {
    id: 'baselineAndLabels',
    // 1. Sincroniza los márgenes del footer con el área real de dibujo de barras
    afterLayout(chart) {
      const footerBox = document.getElementById('variacion-cards-footer');
      if (footerBox && chart.chartArea) {
        footerBox.style.paddingLeft = `${chart.chartArea.left}px`;
        footerBox.style.paddingRight = `${chart.width - chart.chartArea.right}px`;
        footerBox.style.boxSizing = 'border-box';
      }
    },
    // 2. Dibuja la línea de cero y los textos sobre/debajo de las barras
    afterDraw(chart) {
      const { ctx, chartArea, scales: { y } } = chart;
      const zeroPixel = y.getPixelForValue(0);

      ctx.save();

      // Línea horizontal 0.00
      ctx.beginPath();
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1.8;
      ctx.moveTo(chartArea.left, zeroPixel);
      ctx.lineTo(chartArea.right, zeroPixel);
      ctx.stroke();

      // Label 0.00 a la izquierda
      ctx.fillStyle = '#64748B';
      ctx.font = "bold 11px 'Inter', sans-serif";
      ctx.textAlign = 'right';
      ctx.fillText('0.00', chartArea.left - 8, zeroPixel + 3.5);

      // Valores numéricos en cada barra
      chart.data.datasets.forEach((dataset, i) => {
        const meta = chart.getDatasetMeta(i);
        meta.data.forEach((bar, index) => {
          const val = dataset.data[index];
          const signo = val > 0 ? '+' : '';
          const str = `${signo}${val.toFixed(2)}`;

          ctx.font = "bold 11.5px 'Inter', sans-serif";
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
  
  chartVariacionInstancia = new Chart(canvas, {
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
        padding: {
          top: 25,     // Evita que los números positivos toquen el techo
          bottom: 15,  // Evita que los números negativos toquen el piso
          left: 0,    // Espacio para la etiqueta "0.00"
          right: 0
        }
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
              const d = data[ctx.dataIndex];
              const s = d.delta > 0 ? '+' : '';
              return [
                ` Variación: S/ ${s}${d.delta.toFixed(2)}`,
                ` • Base (${f1}): S/ ${d.precioF1.toFixed(2)}`,
                ` • Corte (${f2}): S/ ${d.precioF2.toFixed(2)}`,
                d.margenActual !== null ? ` • Margen Corte: S/ ${d.margenActual.toFixed(2)}` : null
              ].filter(Boolean);
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { display: false }
        },
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