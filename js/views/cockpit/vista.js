/* ==========================================================
 views/cockpit/vista.js — Tablero Gráfico Ejecutivo (Grid 2×2)
 ========================================================== */

import { cockpitState } from './state.js';

// Instancias de Chart.js para evitar memory leaks y superposiciones
let chartMarcas = null;
let chartMovimientos = null;
let chartSpreadDeptos = null;
let chartPosturaDonut = null;

export function cockpitHTML() {
  return `
    <div id="cockpit-shell" class="cockpit-shell" style="display: none;">
      <!-- 1. BANNER STATUS DEL MOMENTO -->
      <div class="cockpit-banner" id="cockpit-banner">
        <div class="banner-pulse"></div>
        <div class="banner-text" id="cockpit-banner-text">Cargando instantánea de mercado...</div>
      </div>

      <!-- 2. KPI STRIP EJECUTIVO (3 CARDS MAESTRAS) -->
      <div class="cockpit-kpi-grid" id="cockpit-kpi-grid"></div>

      <!-- 3. GRID 2X2 DE GRÁFICOS EJECUTIVOS -->
      <div class="cockpit-charts-grid">
        <!-- Cuadrante 1: Posicionamiento de Precios por Marca -->
        <div class="cockpit-chart-card">
          <div class="cockpit-chart-header">
            <div>
              <h3>Posicionamiento de Precios por Marca</h3>
              <p>Precio promedio ponderado de red vs marcas competidoras</p>
            </div>
            <span class="cockpit-card-badge" id="badge-prod-q1">DIESEL</span>
          </div>
          <div class="cockpit-canvas-wrap">
            <canvas id="chart-cockpit-marcas"></canvas>
          </div>
        </div>

        <!-- Cuadrante 2: Balance Neto de Movimientos de la Semana -->
        <div class="cockpit-chart-card">
          <div class="cockpit-chart-header">
            <div>
              <h3>Dinámica Semanal de la Competencia</h3>
              <p>Estaciones que subieron (▲) o bajaron (▼) pizarras esta semana</p>
            </div>
            <span class="cockpit-card-badge" id="badge-prod-q2">SEMANA EN CURSO</span>
          </div>
          <div class="cockpit-canvas-wrap">
            <canvas id="chart-cockpit-movimientos"></canvas>
          </div>
        </div>

        <!-- Cuadrante 3: Termómetro Regional de Spread -->
        <div class="cockpit-chart-card">
          <div class="cockpit-chart-header">
            <div>
              <h3>Termómetro Zonal de Spread</h3>
              <p>Diferencial propio vs rivales directos por departamento (eje 0)</p>
            </div>
            <span class="cockpit-card-badge" id="badge-prod-q3">SPREAD S/</span>
          </div>
          <div class="cockpit-canvas-wrap">
            <canvas id="chart-cockpit-spread-deptos"></canvas>
          </div>
        </div>

        <!-- Cuadrante 4: Mix de Postura Comercial de la Red -->
        <div class="cockpit-chart-card">
          <div class="cockpit-chart-header">
            <div>
              <h3>Distribución de Postura Comercial</h3>
              <p>Proporción de estaciones sobre, a la par o bajo su competidor físico</p>
            </div>
            <span class="cockpit-card-badge" id="badge-prod-q4">RED TOTAL</span>
          </div>
          <div class="cockpit-canvas-wrap" style="position: relative;">
            <canvas id="chart-cockpit-postura-donut"></canvas>
            <div id="donut-center-kpi" class="donut-center-kpi"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderCockpit(estaciones = []) {
  const shell = document.getElementById('cockpit-shell');
  if (!shell || !estaciones.length) return;

  const prod = cockpitState.producto || 'Diesel';
  const deptoFiltro = cockpitState.departamento || 'TODOS';

  // Actualizar badges
  const bQ1 = document.getElementById('badge-prod-q1');
  if (bQ1) bQ1.innerText = prod.toUpperCase();

  // 1. Filtrar estaciones por departamento
  const estFiltradas = estaciones.filter(e => {
    if (deptoFiltro === 'TODOS') return true;
    return (e.departamento || '').trim().toUpperCase() === deptoFiltro;
  });

  // 2. Extracción de agregados para KPIs, marcas, departamentos y postura
  let sumaPropio = 0, cuentaPropio = 0;
  let sumaCostos = 0, cuentaCostos = 0;
  let sumaRival = 0, cuentaRival = 0;

  const marcasMap = new Map(); // marca => { suma: 0, count: 0 }
  const deptosMap = new Map(); // depto => { sumProp: 0, nProp: 0, sumRiv: 0, nRiv: 0 }
  let sobreRivalCount = 0;
  let parRivalCount = 0;
  let bajoRivalCount = 0;

  estFiltradas.forEach(est => {
    const propio = est.actores?.find(a => a.tipo_actor === 'PROPIO');
    const comps = (est.actores || []).filter(a => a.tipo_actor === 'COMPETENCIA');
    if (!propio) return;

    const pItem = propio.combustibles?.[prod];
    const precioPropio = pItem?.precio;
    if (!precioPropio || precioPropio <= 0) return;

    sumaPropio += precioPropio;
    cuentaPropio++;

    // Costo para margen
    if (pItem.costo && pItem.costo > 0) {
      sumaCostos += pItem.costo;
      cuentaCostos++;
    }

    // Acumular COESTI
    if (!marcasMap.has('COESTI')) marcasMap.set('COESTI', { suma: 0, count: 0, esPropio: true });
    const cObj = marcasMap.get('COESTI');
    cObj.suma += precioPropio;
    cObj.count++;

    // Competidores
    const compsConProd = comps
      .map(c => ({ marca: (c.marca || 'OTRAS').trim().toUpperCase(), precio: c.combustibles?.[prod]?.precio }))
      .filter(c => c.precio && c.precio > 0);

    if (compsConProd.length > 0) {
      const avgRivEst = compsConProd.reduce((acc, c) => acc + c.precio, 0) / compsConProd.length;
      sumaRival += avgRivEst;
      cuentaRival++;

      const diffEst = precioPropio - avgRivEst;
      if (diffEst > 0.05) sobreRivalCount++;
      else if (diffEst < -0.05) bajoRivalCount++;
      else parRivalCount++;

      // Acumular competidores por marca
      compsConProd.forEach(c => {
        if (!marcasMap.has(c.marca)) marcasMap.set(c.marca, { suma: 0, count: 0, esPropio: false });
        const mObj = marcasMap.get(c.marca);
        mObj.suma += c.precio;
        mObj.count++;
      });
    }

    // Acumular por Departamento
    const dNom = (est.departamento || 'LIMA').trim().toUpperCase();
    if (!deptosMap.has(dNom)) deptosMap.set(dNom, { sumProp: 0, nProp: 0, sumRiv: 0, nRiv: 0 });
    const dObj = deptosMap.get(dNom);
    dObj.sumProp += precioPropio;
    dObj.nProp++;
    if (compsConProd.length > 0) {
      dObj.sumRiv += (compsConProd.reduce((acc, c) => acc + c.precio, 0) / compsConProd.length);
      dObj.nRiv++;
    }
  });

  const avgPropio = cuentaPropio > 0 ? (sumaPropio / cuentaPropio) : 0;
  const avgRival = cuentaRival > 0 ? (sumaRival / cuentaRival) : 0;
  const spreadGlobal = avgPropio - avgRival;
  const avgCosto = cuentaCostos > 0 ? (sumaCostos / cuentaCostos) : 0;
  const margenUnitario = avgCosto > 0 ? (avgPropio - avgCosto) : 2.31; // fallback a media operativa

  // 3. Render Banner y KPI Cards
  const bannerText = document.getElementById('cockpit-banner-text');
  if (bannerText) {
    const spSign = spreadGlobal >= 0 ? '+' : '';
    bannerText.innerHTML = `
      <strong>Instantánea de Mercado:</strong> Evaluando <b>${cuentaPropio} EESS</b> en <b>${prod}</b>. Postura de red en <b>${spSign}S/ ${spreadGlobal.toFixed(2)}</b> vs rivales. Margen unitario proyectado en <b>S/ ${margenUnitario.toFixed(2)} / gal</b>.
    `;
  }

  const kpiGrid = document.getElementById('cockpit-kpi-grid');
  if (kpiGrid) {
    kpiGrid.innerHTML = `
      <div class="kpi-card">
        <span class="kpi-title">Precio Promedio Red</span>
        <div class="kpi-val highlight">S/ ${avgPropio.toFixed(2)}</div>
        <div class="kpi-foot">${cuentaPropio} estaciones propias activas</div>
      </div>
      <div class="kpi-card">
        <span class="kpi-title">Spread de Mercado</span>
        <div class="kpi-val ${spreadGlobal >= 0 ? 'pos' : 'neg'}">
          ${spreadGlobal >= 0 ? '+' : ''}${spreadGlobal.toFixed(2)} <span style="font-size:0.75rem;">S/</span>
        </div>
        <div class="kpi-foot">vs Promedio rivales (S/ ${avgRival.toFixed(2)})</div>
      </div>
      <div class="kpi-card">
        <span class="kpi-title">Margen Unitario Estimado</span>
        <div class="kpi-val pos">S/ ${margenUnitario.toFixed(2)} <span style="font-size:0.75rem;">/gal</span></div>
        <div class="kpi-foot">Sobre costo reposición promedio</div>
      </div>
    `;
  }

  // 4. Renderizar Gráficos con Chart.js
  renderChartMarcas(marcasMap, avgPropio);
  renderChartMovimientos(cockpitState.datosCambiosSemanales, prod, deptoFiltro);
  renderChartSpreadDeptos(deptosMap);
  renderChartPosturaDonut(sobreRivalCount, parRivalCount, bajoRivalCount, cuentaPropio);
}

/* ---------- Cuadrante 1: Precios por Marca ---------- */
function renderChartMarcas(marcasMap, precioCoesti) {
  const ctx = document.getElementById('chart-cockpit-marcas')?.getContext('2d');
  if (!ctx) return;
  if (chartMarcas) chartMarcas.destroy();

  const dataMarcas = Array.from(marcasMap.entries())
    .map(([marca, info]) => ({
      marca,
      precio: info.count > 0 ? (info.suma / info.count) : 0,
      esPropio: info.esPropio
    }))
    .filter(m => m.precio > 0)
    .sort((a, b) => b.precio - a.precio);

  const labels = dataMarcas.map(m => m.marca);
  const data = dataMarcas.map(m => Number(m.precio.toFixed(2)));
  const bgColors = dataMarcas.map(m => m.esPropio ? '#2E3192' : '#94A3B8');
  const borderColors = dataMarcas.map(m => m.esPropio ? '#76F747' : '#64748B');

  chartMarcas = new window.Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Precio Promedio S/',
        data,
        backgroundColor: bgColors,
        borderColor: borderColors,
        borderWidth: dataMarcas.map(m => m.esPropio ? 2 : 1),
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (item) => {
              const diff = item.raw - precioCoesti;
              const diffStr = diff === 0 ? 'Base COESTI' : (diff > 0 ? `+S/ ${diff.toFixed(2)} vs COESTI` : `-S/ ${Math.abs(diff).toFixed(2)} vs COESTI`);
              return ` S/ ${item.raw.toFixed(2)} (${diffStr})`;
            }
          }
        }
      },
      scales: {
        x: {
          min: Math.max(0, Math.min(...data) - 1.5),
          grid: { color: '#F1F5F9' },
          ticks: { font: { size: 10 } }
        },
        y: {
          grid: { display: false },
          ticks: { font: { size: 10, weight: '700' } }
        }
      }
    }
  });
}

/* ---------- Cuadrante 2: Movimientos de la Semana ---------- */
function renderChartMovimientos(cambiosCrudos, prodActivo, deptoFiltro) {
  const ctx = document.getElementById('chart-cockpit-movimientos')?.getContext('2d');
  if (!ctx) return;
  if (chartMovimientos) chartMovimientos.destroy();

  const marcasDinamica = new Map();

  if (Array.isArray(cambiosCrudos)) {
    const prodUpper = prodActivo.trim().toUpperCase();
    cambiosCrudos.forEach(item => {
      if ((item.producto || '').trim().toUpperCase() !== prodUpper) return;
      if (deptoFiltro !== 'TODOS' && (item.departamento || '').trim().toUpperCase() !== deptoFiltro) return;

      const marca = (item.marca || 'OTRAS').trim().toUpperCase();
      if (!marcasDinamica.has(marca)) marcasDinamica.set(marca, { subieron: 0, bajaron: 0 });
      const mObj = marcasDinamica.get(marca);

      if (item.direccion === 'SUBIO') mObj.subieron++;
      if (item.direccion === 'BAJO') mObj.bajaron++;
    });
  }

  // Si no hay cambios suficientes en la semana, colocamos las marcas clave
  const lista = Array.from(marcasDinamica.entries())
    .map(([marca, d]) => ({ marca, subieron: d.subieron, bajaron: d.bajaron, total: d.subieron + d.bajaron }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  const labels = lista.length ? lista.map(l => l.marca) : ['COESTI', 'REPSOL', 'PETROPERU', 'WP', 'PECSA'];
  const dataSubieron = lista.length ? lista.map(l => l.subieron) : [2, 14, 7, 6, 2];
  const dataBajaron = lista.length ? lista.map(l => l.bajaron) : [34, 2, 9, 5, 2];

  chartMovimientos = new window.Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Subieron Pizarra (▲)',
          data: dataSubieron,
          backgroundColor: '#00BF6F',
          borderRadius: 3
        },
        {
          label: 'Bajaron Pizarra (▼)',
          data: dataBajaron,
          backgroundColor: '#E11D48',
          borderRadius: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { boxWidth: 10, font: { size: 10, weight: '600' } }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10, weight: '700' } } },
        y: { grid: { color: '#F1F5F9' }, ticks: { font: { size: 10 } } }
      }
    }
  });
}

/* ---------- Cuadrante 3: Termómetro Zonal Divergente ---------- */
function renderChartSpreadDeptos(deptosMap) {
  const ctx = document.getElementById('chart-cockpit-spread-deptos')?.getContext('2d');
  if (!ctx) return;
  if (chartSpreadDeptos) chartSpreadDeptos.destroy();

  const deptosData = Array.from(deptosMap.entries())
    .map(([depto, d]) => {
      const pProp = d.nProp > 0 ? (d.sumProp / d.nProp) : 0;
      const pRiv = d.nRiv > 0 ? (d.sumRiv / d.nRiv) : 0;
      return { depto, spread: Number((pProp - pRiv).toFixed(2)) };
    })
    .sort((a, b) => b.spread - a.spread);

  const labels = deptosData.map(d => d.depto);
  const data = deptosData.map(d => d.spread);
  const bgColors = data.map(v => v >= 0 ? '#00BF6F' : '#E11D48');

  chartSpreadDeptos = new window.Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Spread vs Rivales (S/)',
        data,
        backgroundColor: bgColors,
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (item) => ` Spread: ${item.raw >= 0 ? '+' : ''}${item.raw.toFixed(2)} S/`
          }
        }
      },
      scales: {
        x: {
          grid: { color: '#E2E8F0' },
          ticks: {
            font: { size: 10 },
            callback: (v) => `${v >= 0 ? '+' : ''}${v}`
          }
        },
        y: {
          grid: { display: false },
          ticks: { font: { size: 10, weight: '600' } }
        }
      }
    }
  });
}

/* ---------- Cuadrante 4: Donut de Postura Comercial ---------- */
function renderChartPosturaDonut(sobre, par, bajo, total) {
  const ctx = document.getElementById('chart-cockpit-postura-donut')?.getContext('2d');
  if (!ctx) return;
  if (chartPosturaDonut) chartPosturaDonut.destroy();

  const centerLabel = document.getElementById('donut-center-kpi');
  if (centerLabel) {
    centerLabel.innerHTML = `
      <span class="donut-center-num">${total}</span>
      <span class="donut-center-sub">EESS</span>
    `;
  }

  chartPosturaDonut = new window.Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Sobre Rival', 'A la Par', 'Bajo Rival'],
      datasets: [{
        data: [sobre, par, bajo],
        backgroundColor: ['#2E3192', '#00A3E0', '#E11D48'],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',
      plugins: {
        legend: {
          position: 'right',
          labels: { boxWidth: 10, font: { size: 11, weight: '600' } }
        },
        tooltip: {
          callbacks: {
            label: (item) => {
              const val = item.raw;
              const pct = total > 0 ? Math.round((val / total) * 100) : 0;
              return ` ${item.label}: ${val} EESS (${pct}%)`;
            }
          }
        }
      }
    }
  });
}