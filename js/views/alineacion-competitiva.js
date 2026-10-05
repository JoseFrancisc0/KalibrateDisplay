/* ==========================================================
   views/alineacion-competitiva.js — Vista "Alineación Competitiva"
   Diagnóstico: EESS propias bajo Local Market y bajo Zona de Influencia.
   ========================================================== */
import { state } from '../state.js';
import { COMBUSTIBLES } from '../config.js';

export function alineacionHTML() {
  return `
    <div id="alineacion-shell" class="alineacion-shell" style="display: none;">
      <!-- Cabecera de la vista -->
      <div class="alineacion-header">
        <div>
          <h2>Alineación Competitiva y Cumplimiento</h2>
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
            <button class="pill-btn active" data-filtro="TODOS" onclick="window.cambiarFiltroAlineacionDetalle('TODOS')">Todas</button>
            <button class="pill-btn" data-filtro="BAJO_LM" onclick="window.cambiarFiltroAlineacionDetalle('BAJO_LM')">Bajo Local Market</button>
            <button class="pill-btn" data-filtro="BAJO_ZONA" onclick="window.cambiarFiltroAlineacionDetalle('BAJO_ZONA')">Bajo Zona de Influencia</button>
            <button class="pill-btn" data-filtro="BAJO_AMBOS" onclick="window.cambiarFiltroAlineacionDetalle('BAJO_AMBOS')">Bajo Ambos</button>
          </div>
        </div>

        <div class="alineacion-table-wrap">
          <table class="alineacion-table">
            <thead>
              <tr>
                <th style="width: 28%;">Estación Propia</th>
                <th style="width: 14%;">Ubicación</th>
                <th style="width: 10%; text-align: right;">Precio Propio</th>
                <th style="width: 24%;">Local Market (Main Marker)</th>
                <th style="width: 24%;">Promedio Zona Influencia</th>
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
 * Procesa todas las estaciones y calcula los diagnósticos
 */
export function procesarDatosAlineacion(estaciones) {
  // 1. Filtrado geográfico según el estado actual
  const corrSel = state.alineacionCorredor || 'TODOS';
  const deptoSel = state.alineacionDepartamento || 'TODOS';
  const gpcSel = state.alineacionGpcGroup || 'TODOS';

  const estacionesFiltradas = estaciones.filter(e => {
    // Excluir inactivas o sin registro propio
    const tienePropio = e.actores && e.actores.some(a => a.tipo_actor === 'PROPIO');
    if (!tienePropio || e.gpc_group === 'INACTIVAS') return false;

    const c = (e.corredor && e.corredor.trim()) ? e.corredor.trim().toUpperCase() : 'SIN CORREDOR';
    const d = (e.departamento && e.departamento.trim()) ? e.departamento.trim().toUpperCase() : 'SIN DEPARTAMENTO';
    const g = (e.gpc_group && e.gpc_group.trim()) ? e.gpc_group.trim().toUpperCase() : 'SIN GPC';

    const matchCorr = (corrSel === 'TODOS' || c === corrSel);
    const matchDepto = (deptoSel === 'TODOS' || d === deptoSel);
    const matchGpc = (gpcSel === 'TODOS' || g === gpcSel);

    return matchCorr && matchDepto && matchGpc;
  });

  // 2. Diagnóstico por producto
  const resumenPorProd = {};
  COMBUSTIBLES.forEach(prod => {
    resumenPorProd[prod] = {
      producto: prod,
      totalEESS: 0,
      bajoLocalMarket: 0,
      conLocalMarket: 0,
      bajoZona: 0,
      conZona: 0,
      items: []
    };
  });

  estacionesFiltradas.forEach(est => {
    const propio = est.actores.find(a => a.tipo_actor === 'PROPIO');
    if (!propio || !propio.combustibles) return;

    // Competencia externa de la zona de influencia (excluyendo propias)
    const competidores = est.actores.filter(a => a.tipo_actor === 'COMPETENCIA' && !a.es_competidor_propio);

    COMBUSTIBLES.forEach(prod => {
      const fuelPropio = propio.combustibles[prod];
      if (!fuelPropio || !fuelPropio.precio || fuelPropio.precio <= 0) return;

      const pPropio = fuelPropio.precio;
      const res = resumenPorProd[prod];
      res.totalEESS++;

      // A. Evaluación Local Market (Main Marker para este producto)
      const lmActor = competidores.find(c => c.combustibles && c.combustibles[prod] && c.combustibles[prod].main_marker);
      let lmData = null;
      if (lmActor && lmActor.combustibles[prod].precio > 0) {
        res.conLocalMarket++;
        const pLM = lmActor.combustibles[prod].precio;
        const diffLM = pPropio - pLM; // < 0 => Propio es menor
        const estaBajoLM = diffLM < -0.001;
        if (estaBajoLM) res.bajoLocalMarket++;

        lmData = {
          nombre: lmActor.nombre_linea,
          marca: lmActor.marca,
          precio: pLM,
          diff: diffLM,
          estaBajo: estaBajoLM
        };
      }

      // B. Evaluación Promedio Zona de Influencia (Media simple)
      const compsConProd = competidores.filter(c => c.combustibles && c.combustibles[prod] && c.combustibles[prod].precio > 0);
      let zonaData = null;
      if (compsConProd.length > 0) {
        res.conZona++;
        const sumaPrecios = compsConProd.reduce((acc, c) => acc + c.combustibles[prod].precio, 0);
        const promZona = sumaPrecios / compsConProd.length;
        const diffZona = pPropio - promZona;
        const estaBajoZona = diffZona < -0.001;
        if (estaBajoZona) res.bajoZona++;

        zonaData = {
          promedio: promZona,
          diff: diffZona,
          conteoCompetidores: compsConProd.length,
          estaBajo: estaBajoZona
        };
      }

      res.items.push({
        siteId: est.own_site_id,
        nombre: est.estacion_cabecera,
        corredor: est.corredor || 'SIN CORREDOR',
        departamento: est.departamento || 'SIN DEPTO',
        gpcGroup: est.gpc_group || 'SIN GPC',
        precioPropio: pPropio,
        localMarket: lmData,
        zona: zonaData
      });
    });
  });

  return { estacionesFiltradas, resumenPorProd };
}

/**
 * Renderiza la vista completa
 */
export function renderAlineacion(estaciones) {
  const shell = document.getElementById('alineacion-shell');
  if (!shell) return;

  const { estacionesFiltradas, resumenPorProd } = procesarDatosAlineacion(estaciones);

  // Subtítulo con contexto
  const subtitulo = document.getElementById('alineacion-subtitulo');
  if (subtitulo) {
    const filtros = [];
    if (state.alineacionCorredor !== 'TODOS') filtros.push(`Corredor: ${state.alineacionCorredor}`);
    if (state.alineacionDepartamento !== 'TODOS') filtros.push(`Depto: ${state.alineacionDepartamento}`);
    if (state.alineacionGpcGroup !== 'TODOS') filtros.push(`GPC: ${state.alineacionGpcGroup}`);
    subtitulo.innerText = filtros.length 
      ? `Filtrado por: ${filtros.join(' · ')} (${estacionesFiltradas.length} estaciones evaluadas)` 
      : `Red Total: ${estacionesFiltradas.length} estaciones propias evaluadas.`;
  }

  // 1. Renderizar KPI Cards
  const kpiGrid = document.getElementById('alineacion-kpi-grid');
  if (kpiGrid) {
    const prodActivo = state.alineacionProductoSeleccionado || 'Diesel';
    kpiGrid.innerHTML = COMBUSTIBLES.map(prod => {
      const d = resumenPorProd[prod];
      const pctLM = d.conLocalMarket > 0 ? Math.round((d.bajoLocalMarket / d.conLocalMarket) * 100) : 0;
      const pctZona = d.conZona > 0 ? Math.round((d.bajoZona / d.conZona) * 100) : 0;
      const isActive = prod === prodActivo;

      return `
        <div class="kpi-card ${isActive ? 'active-card' : ''}" onclick="window.seleccionarProductoAlineacion('${prod}')">
          <div class="kpi-card-header">
            <span class="kpi-prod-name">${prod.toUpperCase()}</span>
            <span class="kpi-eess-total">${d.totalEESS} EESS</span>
          </div>

          <!-- Métrica 1: Bajo Local Market -->
          <div class="kpi-metric-row">
            <div class="kpi-metric-label">
              <span>Bajo Local Market</span>
              <small>vs Competidor Marker</small>
            </div>
            <div class="kpi-metric-val ${d.bajoLocalMarket > 0 ? 'text-alert' : 'text-ok'}">
              <b>${d.bajoLocalMarket}</b>
              <span class="pct-badge">${pctLM}%</span>
            </div>
          </div>

          <!-- Métrica 2: Bajo Zona de Influencia -->
          <div class="kpi-metric-row">
            <div class="kpi-metric-label">
              <span>Bajo Prom. Zona</span>
              <small>vs Competidores directos</small>
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
  renderDrillDown(resumenPorProd);
}

function renderDrillDown(resumenPorProd) {
  const prodActivo = state.alineacionProductoSeleccionado || 'Diesel';
  const filtroTabla = state.alineacionFiltroDetalle || 'TODOS';
  const dataProd = resumenPorProd[prodActivo] || { items: [] };

  const titleEl = document.getElementById('drilldown-title');
  if (titleEl) titleEl.innerText = `Detalle de Estaciones: ${prodActivo.toUpperCase()}`;

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
  if (counterEl) counterEl.innerText = `${items.length} de ${dataProd.totalEESS} EESS`;

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

  // Ordenar primero las que están desalineadas (bajo LM o bajo Zona)
  const itemsOrdenados = [...items].sort((a, b) => {
    const aBajo = (a.localMarket?.estaBajo ? 2 : 0) + (a.zona?.estaBajo ? 1 : 0);
    const bBajo = (b.localMarket?.estaBajo ? 2 : 0) + (b.zona?.estaBajo ? 1 : 0);
    return bBajo - aBajo;
  });

  tbody.innerHTML = itemsOrdenados.map(item => {
    // Local market cell
    let lmHtml = `<span class="text-muted">Sin Local Market</span>`;
    if (item.localMarket) {
      const badgeClass = item.localMarket.estaBajo ? 'status-pill alert' : 'status-pill ok';
      const signo = item.localMarket.diff >= 0 ? '+' : '';
      lmHtml = `
        <div class="cell-bench-wrap">
          <div class="bench-top">
            <span class="bench-name" title="${item.localMarket.nombre}">${item.localMarket.nombre}</span>
            <span class="${badgeClass}">${item.localMarket.estaBajo ? 'BAJO LM' : 'OK'}</span>
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
            <span class="bench-name">${item.zona.conteoCompetidores} competidores</span>
            <span class="${badgeClass}">${item.zona.estaBajo ? 'BAJO ZONA' : 'OK'}</span>
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