/* ==========================================================
   views/alineacion/vista.js — Vista "Alineación Competitiva":
   KPI cards por producto + tabla drill-down por estación.
   ========================================================== */
import { COMBUSTIBLES } from '../../config/productos.js';
import { alineacionState } from './state.js';
import { procesarDatosAlineacion } from './calculo.js';

export function alineacionHTML() {
  return `
    <div id="alineacion-shell" class="alineacion-shell" style="display: none;">
      <!-- Cabecera de la vista -->
      <div class="alineacion-header">
        <div>
          <h2 id="alineacion-titulo-principal">Alineación Competitiva y Cumplimiento</h2>
          <p id="alineacion-subtitulo">Diagnóstico de estaciones propias bajo Local Market y Zona de Influencia.</p>
        </div>
        <div class="alineacion-legend-mini">
          <span class="leg-chip leg-alert">● Por debajo de referencia</span>
          <span class="leg-chip leg-ok">● A la par o sobre referencia</span>
        </div>
      </div>

      <!-- Cuadrícula de KPI Cards por Producto -->
      <div id="alineacion-kpi-grid" class="alineacion-kpi-grid"></div>

      <!-- Sección de Drill-down / Detalle por Estación -->
      <div class="alineacion-detail-section">
        <div class="alineacion-detail-toolbar">
          <div class="detail-title-group">
            <h3 id="drilldown-title">Detalle de Estaciones: DIESEL</h3>
            <span id="drilldown-counter" class="count-badge">0 EESS</span>
          </div>
          <div class="detail-filter-pills">
            <button class="pill-btn active" data-filtro="TODOS" data-click="cambiarFiltroAlineacionDetalle" data-arg="TODOS">Todas</button>
            <button class="pill-btn" data-filtro="BAJO_LM" data-click="cambiarFiltroAlineacionDetalle" data-arg="BAJO_LM">Bajo Local Market</button>
            <button class="pill-btn" data-filtro="BAJO_ZONA" data-click="cambiarFiltroAlineacionDetalle" data-arg="BAJO_ZONA">Bajo Zona</button>
            <button class="pill-btn" data-filtro="BAJO_AMBOS" data-click="cambiarFiltroAlineacionDetalle" data-arg="BAJO_AMBOS">Bajo Ambos</button>
          </div>
        </div>

        <div class="alineacion-table-wrap">
          <table class="alineacion-table">
            <thead>
              <tr>
                <th style="width: 26%;">Estación Propia</th>
                <th style="width: 14%;">Ubicación</th>
                <th style="width: 10%; text-align: right;">Precio Propio</th>
                <th style="width: 25%;" id="th-lm-col">Local Market (Main Marker)</th>
                <th style="width: 25%;" id="th-zona-col">Zona de Influencia</th>
              </tr>
            </thead>
            <tbody id="alineacion-table-body">
              <!-- Filas inyectadas dinámicamente -->
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renderiza la vista completa
 */
export function renderAlineacion(estaciones) {
  const shell = document.getElementById('alineacion-shell');
  if (!shell) return;

  const { estacionesFiltradasBase, resumenPorProd, marcaFiltro, criterioRival } = procesarDatosAlineacion(estaciones);
  const prodActivo = alineacionState.productoSeleccionado || 'Diesel';

  // Subtítulo con contexto
  const subtitulo = document.getElementById('alineacion-subtitulo');
  if (subtitulo) {
    const filtros = [];
    if (marcaFiltro !== 'TODAS') {
      const labelM = marcaFiltro === 'WP' ? 'WHITE PRODUCTS' : marcaFiltro;
      filtros.push(`Marca: ${labelM} (${criterioRival === 'CERCANO' ? 'Más cercano' : 'Promedio'})`);
    }
    if (alineacionState.gpcGroup !== 'TODOS') filtros.push(`GPC: ${alineacionState.gpcGroup}`);
    if (alineacionState.corredor !== 'TODOS') filtros.push(`Corredor: ${alineacionState.corredor}`);
    if (alineacionState.zona !== 'TODOS') filtros.push(`Zona: ${alineacionState.zona}`);
    if (alineacionState.departamento !== 'TODOS') filtros.push(`Depto: ${alineacionState.departamento}`);
    if (alineacionState.provincia !== 'TODOS') filtros.push(`Prov: ${alineacionState.provincia}`);
    if (alineacionState.distrito !== 'TODOS') filtros.push(`Dist: ${alineacionState.distrito}`);

    subtitulo.innerText = filtros.length 
      ? `Filtrado por: ${filtros.join(' · ')}` 
      : `Red Total: ${estacionesFiltradasBase.length} estaciones propias evaluadas.`;
  }

  // 1. Renderizar KPI Cards
  const kpiGrid = document.getElementById('alineacion-kpi-grid');
  if (kpiGrid) {
    kpiGrid.innerHTML = COMBUSTIBLES.map(prod => {
      const d = resumenPorProd[prod];
      const pctLM = d.conLocalMarket > 0 ? Math.round((d.bajoLocalMarket / d.conLocalMarket) * 100) : 0;
      const pctZona = d.conZona > 0 ? Math.round((d.bajoZona / d.conZona) * 100) : 0;
      const isActive = prod === prodActivo;

      const labelZonaKPI = (marcaFiltro === 'TODAS') 
        ? 'Bajo Prom. Zona' 
        : (criterioRival === 'CERCANO' ? 'Bajo Rival Cercano' : 'Bajo Prom. Marca');

      return `
        <div class="kpi-card ${isActive ? 'active-card' : ''}" data-click="seleccionarProductoAlineacion" data-arg="${prod}">
          <div class="kpi-card-header">
            <span class="kpi-prod-name">${prod.toUpperCase()}</span>
            <span class="kpi-eess-total">${d.totalEESS} EESS</span>
          </div>

          <!-- Métrica 1: Bajo Local Market -->
          <div class="kpi-metric-row">
            <div class="kpi-metric-label">
              <span>Bajo Local Market</span>
              <small>${marcaFiltro === 'TODAS' ? 'vs Competidor Marker' : 'vs LM o Referente'}</small>
            </div>
            <div class="kpi-metric-val ${d.bajoLocalMarket > 0 ? 'text-alert' : 'text-ok'}">
              <b>${d.bajoLocalMarket}</b>
              <span class="pct-badge">${pctLM}%</span>
            </div>
          </div>

          <!-- Métrica 2: Bajo Zona de Influencia -->
          <div class="kpi-metric-row">
            <div class="kpi-metric-label">
              <span>${labelZonaKPI}</span>
              <small>${marcaFiltro === 'TODAS' ? 'vs Competidores directos' : `vs ${marcaFiltro}`}</small>
            </div>
            <div class="kpi-metric-val ${d.bajoZona > 0 ? 'text-alert' : 'text-ok'}">
              <b>${d.bajoZona}</b>
              <span class="pct-badge">${pctZona}%</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // 2. Renderizar Tabla Drill-down
  renderDrillDown(resumenPorProd, marcaFiltro, criterioRival);
}

function renderDrillDown(resumenPorProd, marcaFiltro, criterioRival) {
  const prodActivo = alineacionState.productoSeleccionado || 'Diesel';
  const filtroTabla = alineacionState.filtroDetalle || 'TODOS';
  const dataProd = resumenPorProd[prodActivo] || { items: [] };

  const titleEl = document.getElementById('drilldown-title');
  if (titleEl) titleEl.innerText = `Detalle de Estaciones: ${prodActivo.toUpperCase()}`;

  // Encabezados dinámicos
  const thZona = document.getElementById('th-zona-col');
  if (thZona) {
    thZona.innerText = (marcaFiltro === 'TODAS') 
      ? 'Promedio Zona Influencia' 
      : (criterioRival === 'CERCANO' ? `Rival Más Cercano (${marcaFiltro})` : `Promedio Zona (${marcaFiltro})`);
  }

  // Filtrado de filas de la tabla
  let items = dataProd.items;
  if (filtroTabla === 'BAJO_LM') {
    items = items.filter(i => i.localMarket && i.localMarket.estaBajo);
  } else if (filtroTabla === 'BAJO_ZONA') {
    items = items.filter(i => i.zona && i.zona.estaBajo);
  } else if (filtroTabla === 'BAJO_AMBOS') {
    items = items.filter(i => (i.localMarket && i.localMarket.estaBajo) && (i.zona && i.zona.estaBajo));
  }

  const counterEl = document.getElementById('drilldown-counter');
  if (counterEl) counterEl.innerText = `${items.length} de ${dataProd.totalEESS} EESS evaluadas`;

  // Actualizar botones pills activos
  document.querySelectorAll('.detail-filter-pills .pill-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filtro === filtroTabla);
  });

  const tbody = document.getElementById('alineacion-table-body');
  if (!tbody) return;

  if (items.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-detail">No hay estaciones que cumplan con la condición seleccionada.</td></tr>`;
    return;
  }

  // Ordenar primero las que están desalineadas
  const itemsOrdenados = [...items].sort((a, b) => {
    const aBajo = (a.localMarket?.estaBajo ? 2 : 0) + (a.zona?.estaBajo ? 1 : 0);
    const bBajo = (b.localMarket?.estaBajo ? 2 : 0) + (b.zona?.estaBajo ? 1 : 0);
    return bBajo - aBajo;
  });

  tbody.innerHTML = itemsOrdenados.map(item => {
    // Local market cell
    let lmHtml = `<span class="text-muted">Sin referencia</span>`;
    if (item.localMarket) {
      const badgeClass = item.localMarket.estaBajo ? 'status-pill alert' : 'status-pill ok';
      const signo = item.localMarket.diff >= 0 ? '+' : '';
      const tagLM = item.localMarket.esOficialLM ? `<span style="font-size:0.5rem; background:#E0E7FF; color:#2E3192; padding:1px 4px; border-radius:2px; font-weight:700;">LM</span>` : '';
      lmHtml = `
        <div class="cell-bench-wrap">
          <div class="bench-top">
            <span class="bench-name" title="${item.localMarket.nombre}">${item.localMarket.nombre}</span>
            <div style="display:flex; gap:3px; align-items:center;">
              ${tagLM}
              <span class="${badgeClass}">${item.localMarket.estaBajo ? 'BAJO LM' : 'OK'}</span>
            </div>
          </div>
          <div class="bench-bot">
            <span>S/ ${item.localMarket.precio.toFixed(2)}</span>
            <b class="${item.localMarket.estaBajo ? 'diff-alert' : 'diff-ok'}">${signo}${item.localMarket.diff.toFixed(2)}</b>
          </div>
        </div>
      `;
    }

    // Zona cell
    let zonaHtml = `<span class="text-muted">Sin competidores</span>`;
    if (item.zona) {
      const badgeClass = item.zona.estaBajo ? 'status-pill alert' : 'status-pill ok';
      const signo = item.zona.diff >= 0 ? '+' : '';
      zonaHtml = `
        <div class="cell-bench-wrap">
          <div class="bench-top">
            <span class="bench-name">${item.zona.etiqueta}</span>
            <span class="${badgeClass}">${item.zona.estaBajo ? 'BAJO' : 'OK'}</span>
          </div>
          <div class="bench-bot">
            <span>S/ ${item.zona.promedio.toFixed(2)}</span>
            <b class="${item.zona.estaBajo ? 'diff-alert' : 'diff-ok'}">${signo}${item.zona.diff.toFixed(2)}</b>
          </div>
        </div>
      `;
    }

    return `
      <tr>
        <td>
          <div class="site-main-info">
            <b class="site-name-text">${item.nombre}</b>
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
        <td>${lmHtml}</td>
        <td>${zonaHtml}</td>
      </tr>
    `;
  }).join('');
}