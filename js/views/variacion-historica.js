/* ==========================================================
   views/variacion-historica.js — Vista "Variación Histórica"
   COESTI vs PRIMAX (DEALERS) independientes | Escala Dinámica
   ========================================================== */
import { state } from '../state.js';
import { getBrandLogo, LOGO_GENERICO } from '../config.js';

export function variacionHTML() {
  return `
    <div id="variacion-shell" class="alineacion-shell" style="display: none; padding: 20px; overflow-y: auto;">
      <div class="alineacion-header" style="margin-bottom: 16px;">
        <div>
          <h2>Variación Histórica de Precios por Marca</h2>
          <p id="variacion-subtitulo">Comparativa de variación neta de precio entre dos fechas de corte.</p>
        </div>
        <div class="alineacion-legend-mini" id="variacion-rango-badge">
          <span class="leg-chip leg-ok">Cargando fechas...</span>
        </div>
      </div>

      <div style="background:#fff; border:1px solid var(--k-line); border-radius:8px; padding:24px 20px 20px 20px; box-shadow:0 2px 12px rgba(22,24,47,.05);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 24px;">
          <div>
            <h3 id="var-chart-title" style="margin:0; font-size:1.05rem; color:var(--k-ink); font-weight:700;">Variación de Precio Promedio Zonal (S/)</h3>
            <small id="var-chart-desc" style="color:var(--k-muted); font-size:0.75rem;">Calculado sobre las estaciones que cumplen con la segmentación activa.</small>
          </div>
          <div id="var-eess-conteo" class="count-badge" style="font-weight:700;">0 Observaciones</div>
        </div>

        <div id="variacion-chart-container" style="min-height: 480px; position: relative;">
          <!-- Inyectado dinámicamente -->
        </div>
      </div>
    </div>
  `;
}

function renderLogoMarca(marca) {
  const norm = (marca || '').trim().toUpperCase();
  const keyBusqueda = (norm === 'COESTI' || norm.includes('DEALER')) ? 'PRIMAX' : norm;
  const rutaLogo = getBrandLogo(keyBusqueda);

  return `
    <div style="width:38px; height:38px; border-radius:50%; background:#fff; border:1px solid #E2E8F0; display:flex; align-items:center; justify-content:center; margin-bottom:6px; box-shadow:0 1px 4px rgba(0,0,0,0.06); overflow:hidden; padding:2px;">
      <img src="${rutaLogo}" alt="${norm}" onerror="this.src='${LOGO_GENERICO}'" style="width:100%; height:100%; object-fit:contain; border-radius:50%;">
    </div>
  `;
}

export function procesarVariacionHistorica() {
  if (!state.historicoMarcasData || !state.historicoMarcasData.datos) return [];

  const prodSel = state.variacionProducto || 'Diesel';
  const f1 = state.variacionFechaInicio;
  const f2 = state.variacionFechaFin;

  const corrSel = state.variacionCorredor || 'TODOS';
  const deptoSel = state.variacionDepartamento || 'TODOS';
  const gpcSel = state.variacionGpcGroup || 'TODOS';

  const observaciones = state.historicoMarcasData.datos.filter(item => {
    if (item.p !== prodSel) return false;

    const c = (item.c || '').trim().toUpperCase();
    const d = (item.d || '').trim().toUpperCase();
    const g = (item.g || '').trim().toUpperCase();

    const matchCorr = (corrSel === 'TODOS' || c === corrSel);
    const matchDepto = (deptoSel === 'TODOS' || d === deptoSel);
    const matchGpc = (gpcSel === 'TODOS' || g === gpcSel);

    return matchCorr && matchDepto && matchGpc;
  });

  // Normalización defensiva (funciona tanto si el JSON trae 'COESTI' como si trae 'PRIMAX')
  const observacionesNormalizadas = observaciones.map(item => {
    let m = (item.m || '').trim().toUpperCase();
    if (m === 'PRIMAX') m = 'COESTI';
    return { ...item, m_std: m };
  });

  const marcasSet = new Set(observacionesNormalizadas.map(o => o.m_std));
  state.variacionMarcasDisponibles = Array.from(marcasSet).sort();

  if (!state.variacionMarcasSeleccionadas) {
    state.variacionMarcasSeleccionadas = new Set(state.variacionMarcasDisponibles);
  }

  const marcaFechaMap = {};

  observacionesNormalizadas.forEach(item => {
    if (!state.variacionMarcasSeleccionadas.has(item.m_std)) return;

    if (!marcaFechaMap[item.m_std]) marcaFechaMap[item.m_std] = {};
    if (!marcaFechaMap[item.m_std][item.f]) {
      marcaFechaMap[item.m_std][item.f] = { suma: 0, pesoTotal: 0 };
    }
    const entry = marcaFechaMap[item.m_std][item.f];
    entry.suma += (item.pr * item.n);
    entry.pesoTotal += item.n;
  });

  const resultados = [];

  Object.keys(marcaFechaMap).forEach(marca => {
    const fechas = Object.keys(marcaFechaMap[marca]).sort();
    if (fechas.length === 0) return;

    const fechasF1 = fechas.filter(f => f <= f1);
    const fechasF2 = fechas.filter(f => f <= f2);

    if (fechasF1.length === 0 || fechasF2.length === 0) return;

    const ultimaF1 = fechasF1[fechasF1.length - 1];
    const ultimaF2 = fechasF2[fechasF2.length - 1];

    const dataF1 = marcaFechaMap[marca][ultimaF1];
    const dataF2 = marcaFechaMap[marca][ultimaF2];

    const p1 = dataF1.pesoTotal > 0 ? (dataF1.suma / dataF1.pesoTotal) : 0;
    const p2 = dataF2.pesoTotal > 0 ? (dataF2.suma / dataF2.pesoTotal) : 0;
    const delta = p2 - p1;

    resultados.push({
      marca,
      precioF1: p1,
      precioF2: p2,
      delta: Number(delta.toFixed(3)),
      conteoEess: dataF2.pesoTotal
    });
  });

  // Orden estricto de MENOR a MAYOR variación neta
  resultados.sort((a, b) => a.delta - b.delta);

  return resultados;
}

export function renderVariacionHistorica() {
  const shell = document.getElementById('variacion-shell');
  if (!shell) return;

  const chartBox = document.getElementById('variacion-chart-container');
  const subtitulo = document.getElementById('variacion-subtitulo');
  const badgeRango = document.getElementById('variacion-rango-badge');
  const badgeConteo = document.getElementById('var-eess-conteo');

  if (state.cargandoHistorico) {
    if (chartBox) chartBox.innerHTML = `<div class="empty-state">Descargando datos históricos...</div>`;
    return;
  }

  const f1 = state.variacionFechaInicio;
  const f2 = state.variacionFechaFin;

  if (badgeRango) {
    badgeRango.innerHTML = `<span class="leg-chip leg-ok">Período: ${f1} ➔ ${f2}</span>`;
  }

  if (subtitulo) {
    const filtros = [];
    if (state.variacionCorredor !== 'TODOS') filtros.push(`Corredor: ${state.variacionCorredor}`);
    if (state.variacionDepartamento !== 'TODOS') filtros.push(`Depto: ${state.variacionDepartamento}`);
    if (state.variacionGpcGroup !== 'TODOS') filtros.push(`GPC: ${state.variacionGpcGroup}`);
    subtitulo.innerText = `Evaluando ${state.variacionProducto.toUpperCase()} ${filtros.length ? '· ' + filtros.join(' · ') : '· Red Nacional'}`;
  }

  const data = procesarVariacionHistorica();

  if (data.length === 0) {
    if (chartBox) chartBox.innerHTML = `<div class="empty-state">No hay observaciones para las fechas y filtros seleccionados.</div>`;
    if (badgeConteo) badgeConteo.innerText = '0 Observaciones';
    return;
  }

  const totalObservaciones = data.reduce((acc, d) => acc + d.conteoEess, 0);
  if (badgeConteo) badgeConteo.innerText = `${totalObservaciones} EESS Activas`;

  // Escala dinámica del eje cero
  const deltas = data.map(d => d.delta);
  const minVal = Math.min(...deltas);
  const maxVal = Math.max(...deltas);

  const chartHeight = 280;
  const margenTexto = 28;

  let zeroY;
  let pxPorUnidad;

  if (minVal >= 0) {
    zeroY = chartHeight - 10;
    const rangoMax = Math.max(maxVal, 0.10);
    pxPorUnidad = (zeroY - margenTexto) / rangoMax;
  } else if (maxVal <= 0) {
    zeroY = margenTexto;
    const rangoMin = Math.abs(Math.min(minVal, -0.10));
    pxPorUnidad = (chartHeight - margenTexto - 10) / rangoMin;
  } else {
    const rangoTotal = maxVal - minVal;
    const propPositiva = maxVal / rangoTotal;
    const alturaUtil = chartHeight - (margenTexto * 2);
    zeroY = margenTexto + (propPositiva * alturaUtil);
    pxPorUnidad = alturaUtil / rangoTotal;
  }

  chartBox.innerHTML = `
    <!-- 1. BARRAS CON ALTURA MAXIMIZADA -->
    <div style="position:relative; width:100%; height:${chartHeight}px; display:flex; align-items:center; justify-content:space-around;">
      <div style="position:absolute; left:0; right:0; top:${zeroY}px; height:2px; background:#94A3B8; z-index:1;"></div>
      <span style="position:absolute; left:0px; top:${zeroY - 16}px; font-size:0.68rem; color:#64748B; font-weight:700;">0.00</span>

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
          <div style="display:flex; flex-direction:column; align-items:center; width: 80px; height: 100%; position:relative;">
            <div style="position:absolute; ${esPos ? `top:${topPos - 22}px;` : `top:${topPos + hBarra + 6}px;`} font-size:0.84rem; font-weight:800; color:${color}; font-variant-numeric:tabular-nums; letter-spacing:-0.02em;">
              ${signo}${item.delta.toFixed(2)}
            </div>

            <div style="position:absolute; top:${topPos}px; width:36px; height:${hBarra}px; background:${color}; border-radius:${esPos ? '4px 4px 0 0' : '0 0 4px 4px'}; box-shadow:0 2px 6px rgba(0,0,0,0.07); transition:all .25s ease;"></div>
          </div>
        `;
      }).join('')}
    </div>

    <!-- 2. LÍNEA DIVISORIA -->
    <div style="height:1px; background:#E2E8F0; margin: 6px 0 16px 0;"></div>

    <!-- 3. CARDS INFORMATIVAS POR MARCA -->
    <div style="display:flex; justify-content:space-around; width:100%; align-items:flex-start;">
      ${data.map(item => {
        const esCoesti = (item.marca === 'COESTI');

        return `
          <div style="display:flex; flex-direction:column; align-items:center; width: 90px; text-align:center;">
            ${renderLogoMarca(item.marca)}

            <div style="font-size:0.73rem; font-weight:800; color:${esCoesti ? 'var(--k-emerald, #00D58A)' : 'var(--k-ink)'}; margin-bottom:8px; line-height:1.15; max-width:90px; height:24px; display:flex; align-items:center; justify-content:center;">
              ${item.marca}
            </div>

            <div style="background:${esCoesti ? '#F0FDF4' : '#F8FAFC'}; border:1px solid ${esCoesti ? '#BBF7D0' : '#E2E8F0'}; border-radius:6px; padding:6px 4px; width:100%; box-shadow:0 1px 3px rgba(0,0,0,0.03);">
              <div style="font-size:0.60rem; color:#64748B; text-transform:uppercase; font-weight:600; line-height:1;">Base</div>
              <div style="font-size:0.75rem; font-weight:700; color:#1E293B; margin-bottom:4px; font-variant-numeric:tabular-nums;">
                S/ ${item.precioF1.toFixed(2)}
              </div>

              <div style="font-size:0.60rem; color:#64748B; text-transform:uppercase; font-weight:600; line-height:1;">Corte</div>
              <div style="font-size:0.75rem; font-weight:700; color:#1E293B; margin-bottom:4px; font-variant-numeric:tabular-nums;">
                S/ ${item.precioF2.toFixed(2)}
              </div>

              <div style="font-size:0.60rem; color:#94A3B8; border-top:1px dashed #CBD5E1; padding-top:3px; margin-top:2px;">
                <b>${item.conteoEess}</b> EESS
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}