/* ==========================================================
   views/variacion/vista.js — Vista "Variación Histórica"
   Layout consolidado optimizado para pantallas 16:9 (sin scroll)
   ========================================================== */
import { getBrandLogo, LOGO_GENERICO } from '../../config/marcas.js';
import { variacionState } from './state.js';
import { procesarVariacionHistorica } from './calculo.js';

// Alto del área de barras (px)
const ALTO_GRAFICO = 240;


export function variacionHTML() {
  return `
    <div id="variacion-shell" class="alineacion-shell" style="display: none; padding: 14px 16px; height: 100%; box-sizing: border-box; overflow: hidden;">
      <!-- Tarjeta Unificada -->
      <div style="background:#fff; border:1px solid var(--k-line); border-radius:8px; padding:16px 20px 14px 20px; box-shadow:0 2px 10px rgba(22,24,47,.05); height: 100%; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box;">
        
        <!-- Cabecera Consolidada Única -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px; flex-shrink: 0;">
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

        <!-- Contenedor del Gráfico y Cards -->
        <div id="variacion-chart-container" style="flex: 1; display: flex; flex-direction: column; justify-content: flex-end; position: relative;">
          <!-- Inyectado dinámicamente -->
        </div>

      </div>
    </div>
  `;
}

/** Diferencial vs COESTI bajo el precio: "(+0.78)". Línea vacía si no aplica, para alinear las tarjetas. */
function renderDiffCoesti(diff) {
  const texto = (diff === null || diff === undefined)
    ? '&nbsp;'
    : `(${diff > 0 ? '+' : ''}${diff.toFixed(2)})`;
  return `<div style="font-size:0.6rem; font-weight:700; color:#64748B; line-height:1; margin:-2px 0 4px 0; font-variant-numeric:tabular-nums;">${texto}</div>`;
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

  const chartBox = document.getElementById('variacion-chart-container');
  const subtitulo = document.getElementById('variacion-subtitulo');
  const badgeRango = document.getElementById('variacion-rango-badge');
  const badgeConteo = document.getElementById('var-eess-conteo');

  if (variacionState.cargandoHistorico) {
    if (chartBox) chartBox.innerHTML = `<div class="empty-state">Descargando datos históricos...</div>`;
    return;
  }

  const f1 = variacionState.fechaInicio;
  const f2 = variacionState.fechaFin;

  if (badgeRango) {
    badgeRango.innerHTML = `<span class="leg-chip leg-ok">Período: ${f1} ➔ ${f2}</span>`;
  }

  if (subtitulo) {
    const filtros = [];
    if (variacionState.corredor !== 'TODOS') filtros.push(`Corredor: ${variacionState.corredor}`);
    if (variacionState.departamento !== 'TODOS') filtros.push(`Depto: ${variacionState.departamento}`);
    if (variacionState.gpcGroup !== 'TODOS') filtros.push(`GPC: ${variacionState.gpcGroup}`);
    const alcance = variacionState.alcance === 'LM' ? ' · Local Market' : ' · Área de Influencia';
    subtitulo.innerText = `Evaluando ${variacionState.producto.toUpperCase()} ${filtros.length ? '· ' + filtros.join(' · ') : '· Red Nacional'}${alcance}`;
  }

  if (variacionState.alcance === 'LM' && variacionState.cargandoLM) {
    if (chartBox) chartBox.innerHTML = `<div class="empty-state">Descargando históricos de competidoras Local Market... <span id="var-lm-progreso"></span></div>`;
    return;
  }

  const data = procesarVariacionHistorica();

  if (data.length === 0) {
    if (chartBox) chartBox.innerHTML = `<div class="empty-state">No hay observaciones para las fechas y filtros seleccionados.</div>`;
    if (badgeConteo) badgeConteo.innerText = '0 EESS Activas';
    return;
  }

  const totalObservaciones = data.reduce((acc, d) => acc + d.conteoEess, 0);
  if (badgeConteo) badgeConteo.innerText = `${totalObservaciones} EESS Activas`;

  // Escala vertical de las barras
  const deltas = data.map(d => d.delta);
  const minVal = Math.min(...deltas);
  const maxVal = Math.max(...deltas);

  const chartHeight = ALTO_GRAFICO;
  const margenTexto = 26;

  let zeroY;
  let pxPorUnidad;

  if (minVal >= 0) {
    zeroY = chartHeight - 8;
    const rangoMax = Math.max(maxVal, 0.10);
    pxPorUnidad = (zeroY - margenTexto) / rangoMax;
  } else if (maxVal <= 0) {
    zeroY = margenTexto;
    const rangoMin = Math.abs(Math.min(minVal, -0.10));
    pxPorUnidad = (chartHeight - margenTexto - 8) / rangoMin;
  } else {
    const rangoTotal = maxVal - minVal;
    const propPositiva = maxVal / rangoTotal;
    const alturaUtil = chartHeight - (margenTexto * 2);
    zeroY = margenTexto + (propPositiva * alturaUtil);
    pxPorUnidad = alturaUtil / rangoTotal;
  }

  chartBox.innerHTML = `
    <!-- 1. ÁREA DE BARRAS -->
    <div style="position:relative; width:100%; height:${chartHeight}px; display:flex; align-items:center; justify-content:space-around;">
      <div style="position:absolute; left:0; right:0; top:${zeroY}px; height:2px; background:#94A3B8; z-index:1;"></div>
      <span style="position:absolute; left:0px; top:${zeroY - 15}px; font-size:0.68rem; color:#64748B; font-weight:700;">0.00</span>

      ${data.map(item => {
        const esCoesti = (item.marca === 'COESTI');
        const esPos = item.delta >= 0;
        const color = esCoesti 
          ? 'var(--k-emerald, #00D58A)' 
          : (esPos ? '#E53E3E' : '#3182CE');
        
        const hBarra = Math.max(Math.abs(item.delta) * pxPorUnidad, 3);
        const topPos = esPos ? (zeroY - hBarra) : zeroY;
        const signo = item.delta > 0 ? '+' : '';

        return `
          <div style="display:flex; flex-direction:column; align-items:center; width: 78px; height: 100%; position:relative;">
            <div style="position:absolute; ${esPos ? `top:${topPos - 20}px;` : `top:${topPos + hBarra + 5}px;`} font-size:0.85rem; font-weight:800; color:${color}; font-variant-numeric:tabular-nums; letter-spacing:-0.02em;">
              ${signo}${item.delta.toFixed(2)}
            </div>

            <div style="position:absolute; top:${topPos}px; width:36px; height:${hBarra}px; background:${color}; border-radius:${esPos ? '4px 4px 0 0' : '0 0 4px 4px'}; box-shadow:0 2px 5px rgba(0,0,0,0.06); transition:all .2s ease;"></div>
          </div>
        `;
      }).join('')}
    </div>

    <!-- 2. SEPARADOR DISCRETO -->
    <div style="height:1px; background:#E2E8F0; margin: 4px 0 12px 0;"></div>

    <!-- 3. FOOTER CON LOGOS Y CARDS (COMPACTAS) -->
    <div style="display:flex; justify-content:space-around; width:100%; align-items:flex-start;">
      ${data.map(item => {
        const esCoesti = (item.marca === 'COESTI');

        return `
          <div style="display:flex; flex-direction:column; align-items:center; width: 85px; text-align:center;">
            ${renderLogoMarca(item.marca)}

            <div style="font-size:0.72rem; font-weight:800; color:${esCoesti ? 'var(--k-emerald, #00D58A)' : 'var(--k-ink)'}; margin-bottom:6px; line-height:1.1; max-width:85px; height:22px; display:flex; align-items:center; justify-content:center;">
              ${item.marca}
            </div>

            <div style="background:${esCoesti ? '#F0FDF4' : '#F8FAFC'}; border:1px solid ${esCoesti ? '#BBF7D0' : '#E2E8F0'}; border-radius:5px; padding:4px 3px; width:100%; box-shadow:0 1px 2px rgba(0,0,0,0.03);">
              <div style="font-size:0.58rem; color:#64748B; text-transform:uppercase; font-weight:600; line-height:1;">Base</div>
              <div style="font-size:0.72rem; font-weight:700; color:#1E293B; margin-bottom:3px; font-variant-numeric:tabular-nums;">
                S/ ${item.precioF1.toFixed(2)}
              </div>
              ${renderDiffCoesti(item.diffF1)}

              <div style="font-size:0.58rem; color:#64748B; text-transform:uppercase; font-weight:600; line-height:1;">Corte</div>
              <div style="font-size:0.72rem; font-weight:700; color:#1E293B; margin-bottom:3px; font-variant-numeric:tabular-nums;">
                S/ ${item.precioF2.toFixed(2)}
              </div>
              ${renderDiffCoesti(item.diffF2)}

              <div style="font-size:0.58rem; color:#94A3B8; border-top:1px dashed #CBD5E1; padding-top:2px; margin-top:1px;">
                <b>${item.conteoEess}</b> EESS
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}