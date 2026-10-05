/* ==========================================================
   views/frente-a-frente.js — Vista "Frente a Frente" (Head-to-Head)
   Análisis comparativo de posicionamiento vs una marca específica.
   ========================================================== */
import { state } from '../state.js';
import { COMBUSTIBLES, getBrandLogo } from '../config.js';

export function frenteAFrenteHTML() {
  return `
    <div id="frente-shell" class="frente-shell" style="display: none;">
      <!-- Cabecera de la vista -->
      <div class="frente-header">
        <div class="frente-header-left">
          <div id="frente-brand-avatar" class="brand-avatar-box"></div>
          <div>
            <h2 id="frente-titulo">Primax (COESTI) vs REPSOL</h2>
            <p id="frente-subtitulo">Evaluando estaciones con presencia directa de la marca competidora.</p>
          </div>
        </div>
        <div class="frente-coverage-badge" id="frente-coverage-box">
          <!-- Cobertura territorial inyectada dinámicamente -->
        </div>
      </div>

      <!-- Cuadrícula de Paridad de Precios por Combustible -->
      <div id="frente-parity-grid" class="frente-parity-grid"></div>

      <!-- Sección de Detalle / Drill-Down -->
      <div class="frente-detail-section">
        <div class="frente-detail-toolbar">
          <div class="detail-title-group">
            <h3 id="frente-drilldown-title">Estaciones en Foco: DIESEL</h3>
            <span id="frente-drilldown-counter" class="count-badge">0 EESS</span>
          </div>
          <div class="frente-detail-filters">
            <label class="toggle-lm-only">
              <input type="checkbox" id="chk-frente-only-lm" onchange="window.toggleFrenteSoloLM(this.checked)">
              <span>Solo donde es Local Market</span>
            </label>
            <div class="detail-filter-pills">
              <button class="pill-btn active" data-filtro="TODOS" onclick="window.cambiarFiltroFrenteDetalle('TODOS')">Todas</button>
              <button class="pill-btn" data-filtro="MAS_CAROS" onclick="window.cambiarFiltroFrenteDetalle('MAS_CAROS')">Más Caros (+)</button>
              <button class="pill-btn" data-filtro="A_LA_PAR" onclick="window.cambiarFiltroFrenteDetalle('A_LA_PAR')">A la Par (0)</button>
              <button class="pill-btn" data-filtro="MAS_BARATOS" onclick="window.cambiarFiltroFrenteDetalle('MAS_BARATOS')">Más Baratos (−)</button>
            </div>
          </div>
        </div>

        <div class="frente-table-wrap">
          <table class="frente-table">
            <thead>
              <tr>
                <th style="width: 24%;">Estación Propia</th>
                <th style="width: 14%;">Ubicación</th>
                <th style="width: 10%; text-align: right;">Precio Propio</th>
                <th style="width: 28%;">Competidor Rival Evaluado</th>
                <th style="width: 12%; text-align: right;">Precio Rival</th>
                <th style="width: 12%; text-align: right;">Brecha Neta</th>
              </tr>
            </thead>
            <tbody id="frente-table-body">
              <!-- Filas inyectadas dinámicamente -->
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

/**
 * Procesa y filtra las estaciones contra la marca elegida
 */
export function procesarDatosFrente(estaciones) {
  const marcaRival = state.frenteMarcaRival || 'REPSOL';
  const criterioComp = state.frenteCriterioComp || 'CERCANO'; // 'CERCANO' | 'PROMEDIO'
  const corrSel = state.frenteCorredor || 'TODOS';
  const deptoSel = state.frenteDepartamento || 'TODOS';
  const gpcSel = state.frenteGpcGroup || 'TODOS';

  // 1. Filtrado geográfico
  const estacionesPropias = estaciones.filter(e => {
    const tienePropio = e.actores && e.actores.some(a => a.tipo_actor === 'PROPIO');
    if (!tienePropio || e.gpc_group === 'INACTIVAS') return false;

    const c = (e.corredor && e.corredor.trim()) ? e.corredor.trim().toUpperCase() : 'SIN CORREDOR';
    const d = (e.departamento && e.departamento.trim()) ? e.departamento.trim().toUpperCase() : 'SIN DEPARTAMENTO';
    const g = (e.gpc_group && e.gpc_group.trim()) ? e.gpc_group.trim().toUpperCase() : 'SIN GPC';

    return (corrSel === 'TODOS' || c === corrSel) &&
           (deptoSel === 'TODOS' || d === deptoSel) &&
           (gpcSel === 'TODOS' || g === gpcSel);
  });

  // 2. Métricas de cobertura territorial global de la marca rival
  let eessConPresenciaMarca = 0;
  let eessConMarcaComoLM = 0;

  estacionesPropias.forEach(e => {
    const rivales = e.actores.filter(a => {
      if (a.tipo_actor !== 'COMPETENCIA' || a.es_competidor_propio) return false;
      let m = (a.marca || '').trim().toUpperCase();
      if (m === 'WHITE PRODUCTS' || m === 'WHITE PRODUCT') m = 'WP';
      return m === marcaRival;
    });

    if (rivales.length > 0) eessConPresenciaMarca++;

    const esLMEnAlguno = rivales.some(r => {
      return COMBUSTIBLES.some(c => r.combustibles?.[c]?.main_marker);
    });
    if (esLMEnAlguno) eessConMarcaComoLM++;
  });

  // 3. Métricas y comparativas por cada combustible
  const resumenPorProd = {};
  COMBUSTIBLES.forEach(prod => {
    resumenPorProd[prod] = {
      producto: prod,
      totalConPresencia: 0,
      totalComoLM: 0,
      masCaros: 0,
      aLaPar: 0,
      masBaratos: 0,
      sumaBrechas: 0,
      items: []
    };
  });

  estacionesPropias.forEach(est => {
    const propio = est.actores.find(a => a.tipo_actor === 'PROPIO');
    if (!propio || !propio.combustibles) return;

    // Obtener rivales de esta marca en la zona
    const rivales = est.actores.filter(a => {
      if (a.tipo_actor !== 'COMPETENCIA' || a.es_competidor_propio) return false;
      let m = (a.marca || '').trim().toUpperCase();
      if (m === 'WHITE PRODUCTS' || m === 'WHITE PRODUCT') m = 'WP';
      return m === marcaRival;
    });

    if (rivales.length === 0) return;

    COMBUSTIBLES.forEach(prod => {
      const fuelPropio = propio.combustibles[prod];
      if (!fuelPropio || !fuelPropio.precio || fuelPropio.precio <= 0) return;

      const pPropio = fuelPropio.precio;
      const rivalesConProd = rivales.filter(r => r.combustibles?.[prod]?.precio > 0);
      if (rivalesConProd.length === 0) return;

      const res = resumenPorProd[prod];
      res.totalConPresencia++;

      // Determinar competidor o promedio rival
      let pRival = 0;
      let nombreRival = '';
      let distRival = null;
      let esLM = false;

      // Ordenar por distancia (menor a mayor)
      rivalesConProd.sort((a, b) => (a.distancia_km ?? 99) - (b.distancia_km ?? 99));

      // ¿Hay alguno que sea Local Market para este producto?
      const rivalLM = rivalesConProd.find(r => r.combustibles[prod].main_marker);
      if (rivalLM) {
        res.totalComoLM++;
        esLM = true;
      }

      if (criterioComp === 'PROMEDIO') {
        const suma = rivalesConProd.reduce((acc, r) => acc + r.combustibles[prod].precio, 0);
        pRival = suma / rivalesConProd.length;
        nombreRival = `Promedio de ${rivalesConProd.length} rivales`;
        distRival = rivalesConProd[0].distancia_km;
      } else {
        // Por defecto: Más cercano (o priorizar LM si existe)
        const target = rivalLM || rivalesConProd[0];
        pRival = target.combustibles[prod].precio;
        nombreRival = target.nombre_linea;
        distRival = target.distancia_km;
      }

      const brecha = pPropio - pRival; // + más caros, - más baratos
      res.sumaBrechas += brecha;

      if (brecha > 0.02) {
        res.masCaros++;
      } else if (brecha < -0.02) {
        res.masBaratos++;
      } else {
        res.aLaPar++;
      }

      res.items.push({
        siteId: est.own_site_id,
        nombrePropio: est.estacion_cabecera,
        corredor: est.corredor || 'SIN CORREDOR',
        departamento: est.departamento || 'SIN DEPTO',
        gpcGroup: est.gpc_group || 'SIN GPC',
        precioPropio: pPropio,
        nombreRival,
        distRival,
        precioRival: pRival,
        brecha,
        esLM
      });
    });
  });

  return {
    marcaRival,
    totalPropias: estacionesPropias.length,
    eessConPresenciaMarca,
    eessConMarcaComoLM,
    resumenPorProd
  };
}

/**
 * Renderizado de la vista Frente a Frente
 */
export function renderFrenteAFrente(estaciones) {
  const shell = document.getElementById('frente-shell');
  if (!shell) return;

  const data = procesarDatosFrente(estaciones);
  const prodActivo = state.frenteProductoSeleccionado || 'Diesel';

  // 1. Cabecera y Avatar
  const logoUrl = getBrandLogo(data.marcaRival);
  const avatarBox = document.getElementById('frente-brand-avatar');
  if (avatarBox) {
    avatarBox.innerHTML = `<img src="${logoUrl}" alt="${data.marcaRival}" onerror="this.src='logos/generico.png'">`;
  }

  const tituloEl = document.getElementById('frente-titulo');
  if (tituloEl) {
    const labelMarca = data.marcaRival === 'WP' ? 'WHITE PRODUCTS' : data.marcaRival;
    tituloEl.innerText = `COESTI vs ${labelMarca}`;
  }

  const subtituloEl = document.getElementById('frente-subtitulo');
  if (subtituloEl) {
    const filtros = [];
    if (state.frenteCorredor !== 'TODOS') filtros.push(`Corredor: ${state.frenteCorredor}`);
    if (state.frenteDepartamento !== 'TODOS') filtros.push(`Depto: ${state.frenteDepartamento}`);
    if (state.frenteGpcGroup !== 'TODOS') filtros.push(`GPC: ${state.frenteGpcGroup}`);
    subtituloEl.innerText = filtros.length 
      ? `Filtrado por: ${filtros.join(' · ')} (${data.totalPropias} estaciones evaluadas)` 
      : `Evaluación sobre la red monitoreada (${data.totalPropias} estaciones propias).`;
  }

  // Cobertura badge
  const coverageBox = document.getElementById('frente-coverage-box');
  if (coverageBox) {
    const pctPresencia = data.totalPropias > 0 ? Math.round((data.eessConPresenciaMarca / data.totalPropias) * 100) : 0;
    coverageBox.innerHTML = `
      <div class="cov-stat">
        <span class="cov-val">${data.eessConPresenciaMarca} <small>/ ${data.totalPropias}</small></span>
        <span class="cov-label">Presencia Directa (${pctPresencia}%)</span>
      </div>
      <div class="cov-divider"></div>
      <div class="cov-stat">
        <span class="cov-val">${data.eessConMarcaComoLM}</span>
        <span class="cov-label">Designadas Local Market</span>
      </div>
    `;
  }

  // 2. Grid de Paridad de Precios por Producto
  const gridEl = document.getElementById('frente-parity-grid');
  if (gridEl) {
    gridEl.innerHTML = COMBUSTIBLES.map(prod => {
      const d = data.resumenPorProd[prod];
      const isActive = prod === prodActivo;
      const brechaMedia = d.totalConPresencia > 0 ? (d.sumaBrechas / d.totalConPresencia) : 0;
      const signo = brechaMedia >= 0 ? '+' : '';
      const colorBrecha = Math.abs(brechaMedia) <= 0.02 ? 'neutral' : (brechaMedia > 0 ? 'alert' : 'ok');

      const pctMasCaros = d.totalConPresencia > 0 ? Math.round((d.masCaros / d.totalConPresencia) * 100) : 0;
      const pctPar = d.totalConPresencia > 0 ? Math.round((d.aLaPar / d.totalConPresencia) * 100) : 0;
      const pctMasBaratos = d.totalConPresencia > 0 ? Math.round((d.masBaratos / d.totalConPresencia) * 100) : 0;

      return `
        <div class="frente-kpi-card ${isActive ? 'active-card' : ''}" onclick="window.seleccionarProductoFrente('${prod}')">
          <div class="f-kpi-top">
            <span class="f-prod-name">${prod.toUpperCase()}</span>
            <span class="f-prod-count">${d.totalConPresencia} EESS</span>
          </div>

          <div class="f-brecha-main">
            <small>Brecha Neta Promedio</small>
            <div class="f-brecha-val ${colorBrecha}">
              ${d.totalConPresencia > 0 ? `${signo}${brechaMedia.toFixed(2)}` : '—'}
            </div>
          </div>

          <!-- Barra Semáforo de Distribución -->
          <div class="f-bar-track" title="Más Caros: ${pctMasCaros}% | A la Par: ${pctPar}% | Más Baratos: ${pctMasBaratos}%">
            <div class="f-bar-seg bar-red" style="width: ${pctMasCaros}%;"></div>
            <div class="f-bar-seg bar-gray" style="width: ${pctPar}%;"></div>
            <div class="f-bar-seg bar-green" style="width: ${pctMasBaratos}%;"></div>
          </div>

          <div class="f-bar-labels">
            <span class="lbl-red">${d.masCaros} (+)</span>
            <span class="lbl-gray">${d.aLaPar} (=)</span>
            <span class="lbl-green">${d.masBaratos} (−)</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // 3. Renderizar Tabla Drill-down
  renderFrenteDrilldown(data.resumenPorProd);
}

function renderFrenteDrilldown(resumenPorProd) {
  const prodActivo = state.frenteProductoSeleccionado || 'Diesel';
  const filtroTabla = state.frenteFiltroDetalle || 'TODOS';
  const soloLM = state.frenteSoloLM || false;
  const dataProd = resumenPorProd[prodActivo] || { items: [] };

  const titleEl = document.getElementById('frente-drilldown-title');
  if (titleEl) titleEl.innerText = `Estaciones en Foco: ${prodActivo.toUpperCase()}`;

  let items = dataProd.items;

  if (soloLM) {
    items = items.filter(i => i.esLM);
  }

  if (filtroTabla === 'MAS_CAROS') {
    items = items.filter(i => i.brecha > 0.02);
  } else if (filtroTabla === 'A_LA_PAR') {
    items = items.filter(i => Math.abs(i.brecha) <= 0.02);
  } else if (filtroTabla === 'MAS_BARATOS') {
    items = items.filter(i => i.brecha < -0.02);
  }

  const counterEl = document.getElementById('frente-drilldown-counter');
  if (counterEl) counterEl.innerText = `${items.length} de ${dataProd.totalConPresencia} EESS con competencia directa`;

  // Actualizar botones pills activos
  document.querySelectorAll('.frente-detail-filters .pill-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filtro === filtroTabla);
  });

  const chkLM = document.getElementById('chk-frente-only-lm');
  if (chkLM) chkLM.checked = soloLM;

  const tbody = document.getElementById('frente-table-body');
  if (!tbody) return;

  if (items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-detail">No hay estaciones que coincidan con los filtros aplicados.</td></tr>`;
    return;
  }

  // Ordenar por magnitud de brecha absoluta descendente
  const itemsOrdenados = [...items].sort((a, b) => Math.abs(b.brecha) - Math.abs(a.brecha));

  tbody.innerHTML = itemsOrdenados.map(item => {
    const signo = item.brecha >= 0 ? '+' : '';
    const claseBrecha = Math.abs(item.brecha) <= 0.02 ? 'neutral' : (item.brecha > 0 ? 'alert' : 'ok');
    const badgeLM = item.esLM ? `<span class="badge-lm" title="Designado como Local Market de esta estación">LOCAL MARKET</span>` : '';
    const distText = (item.distRival !== null && item.distRival !== undefined) ? `${item.distRival.toFixed(1)} km` : '';

    return `
      <tr>
        <td>
          <div class="site-main-info">
            <b class="site-name-text">${item.nombrePropio}</b>
            <small class="site-sub-text">GPC: ${item.gpcGroup}</small>
          </div>
        </td>
        <td>
          <div class="location-col">
            <span>${item.departamento}</span>
            <small>${item.corredor}</small>
          </div>
        </td>
        <td style="text-align: right;">
          <b class="precio-propio-tag">S/ ${item.precioPropio.toFixed(2)}</b>
        </td>
        <td>
          <div class="rival-main-info">
            <div class="rival-name-row">
              <span class="rival-name" title="${item.nombreRival}">${item.nombreRival}</span>
              ${badgeLM}
            </div>
            ${distText ? `<small class="rival-dist">${distText}</small>` : ''}
          </div>
        </td>
        <td style="text-align: right;">
          <span class="precio-rival-tag">S/ ${item.precioRival.toFixed(2)}</span>
        </td>
        <td style="text-align: right;">
          <div class="brecha-badge ${claseBrecha}">
            ${signo}${item.brecha.toFixed(2)}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}