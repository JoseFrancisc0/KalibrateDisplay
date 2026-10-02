/* ==========================================================
   views/analisis-ponderado.js — Gráfico Horizontal Dot-Plot
   ========================================================== */

import { state } from '../state.js';
import { getBrandLogo } from '../config.js';

export function analyticsHTML() {
  return `
    <div class="analytics-shell" id="analytics-shell" style="display:none;">
      <div class="analytics-header">
        <h2 id="analytics-chart-title">Dispersión de Precios</h2>
        <p id="analytics-chart-sub"></p>
      </div>
      <div class="analytics-chart-container" id="analytics-container">
        <div id="analytics-svg-wrap" style="width:100%; height:100%;"></div>
      </div>
      <div id="analytics-tooltip" class="analytics-tooltip"></div>
    </div>
  `;
}

function calcularBenchmarkCOESTI(listaEstaciones, combustible) {
  let suma = 0, conteo = 0;
  listaEstaciones.forEach(est => {
    if (!est.actores) return;
    const propio = est.actores.find(a => a.tipo_actor === 'PROPIO');
    if (propio && propio.combustibles && propio.combustibles[combustible]) {
      const p = propio.combustibles[combustible].precio;
      if (p && p > 0) { suma += p; conteo++; }
    }
  });
  return conteo > 0 ? (suma / conteo) : 0;
}

export function renderAnalisis(todasLasEstaciones) {
  const wrap = document.getElementById('analytics-svg-wrap');
  const tooltip = document.getElementById('analytics-tooltip');
  if (!wrap) return;

  // 1. Filtrar lista por corredor seleccionado en el dropdown
  const corredorSel = state.analisisCorredor || 'TODOS';
  const listaEstaciones = (corredorSel === 'TODOS')
    ? todasLasEstaciones
    : todasLasEstaciones.filter(e => {
        const c = (e.corredor && e.corredor.trim()) ? e.corredor.trim().toUpperCase() : 'SIN CORREDOR';
        return c === corredorSel;
      });

  const combustible = state.analisisProducto || 'Diesel';
  const modo = state.analisisModo || 'COMPETENCIA';
  const benchmark = calcularBenchmarkCOESTI(listaEstaciones, combustible);

  const sub = document.getElementById('analytics-chart-sub');
  if (sub) {
    const textoCorredor = corredorSel === 'TODOS' ? 'Red Total' : corredorSel;
    sub.innerText = (modo === 'MARCA')
      ? `Promedio consolidado por marca vs COESTI PONDERADO (${textoCorredor}).`
      : `Puntos ordenados de menor a mayor precio (${textoCorredor}).`;
  }

  // 2. Recolección de registros según el alcance seleccionado
  let items = [];

  if (modo === 'COESTI') {
    listaEstaciones.forEach(est => {
      const propio = est.actores?.find(a => a.tipo_actor === 'PROPIO');
      if (propio && propio.combustibles && propio.combustibles[combustible]) {
        const p = propio.combustibles[combustible].precio;
        if (p && p > 0) {
          items.push({
            id: est.own_site_id,
            nombre: est.estacion_cabecera,
            marca: 'PRIMAX (COESTI)',
            rawMarca: 'PRIMAX',
            precio: p,
            esBenchmark: false
          });
        }
      }
    });
  } else if (modo === 'COMPETENCIA') {
    const map = new Map();
    listaEstaciones.forEach(est => {
      const comps = est.actores?.filter(a => a.tipo_actor === 'COMPETENCIA' && !a.es_competidor_propio) || [];
      comps.forEach(c => {
        if (c.combustibles && c.combustibles[combustible] && c.combustibles[combustible].precio > 0) {
          const key = c.site_id || c.nombre_linea;
          if (!map.has(key)) {
            const m = (c.marca || '').trim().toUpperCase();
            const marcaDisplay = (m === 'PRIMAX') ? 'PRIMAX (DEALER)' : (c.marca || 'S/M');

            map.set(key, {
              id: key,
              nombre: c.nombre_linea,
              marca: marcaDisplay,
              rawMarca: m,
              precio: c.combustibles[combustible].precio,
              esBenchmark: false
            });
          }
        }
      });
    });
    items = Array.from(map.values());
  } else if (modo === 'MARCA') {
    const acumulador = {};
    listaEstaciones.forEach(est => {
      const comps = est.actores?.filter(a => a.tipo_actor === 'COMPETENCIA' && !a.es_competidor_propio) || [];
      comps.forEach(c => {
        let m = (c.marca || '').trim().toUpperCase();
        if (!m || m === 'SIN MARCA') return;
        if (m === 'WP' || m === 'WHITE PRODUCTS' || m === 'WHITE PRODUCT') m = 'WP';

        if (c.combustibles && c.combustibles[combustible] && c.combustibles[combustible].precio > 0) {
          if (!acumulador[m]) acumulador[m] = { suma: 0, conteo: 0, estaciones: new Set() };
          acumulador[m].suma += c.combustibles[combustible].precio;
          acumulador[m].conteo++;
          acumulador[m].estaciones.add(c.site_id || c.nombre_linea);
        }
      });
    });

    Object.keys(acumulador).forEach(m => {
      let nombreDisplay = m;
      let marcaDisplay = m;

      if (m === 'PRIMAX') {
        nombreDisplay = 'PRIMAX (DEALERS)';
        marcaDisplay = 'PRIMAX (DEALER)';
      } else if (m === 'WP') {
        nombreDisplay = 'WHITE PRODUCTS';
        marcaDisplay = 'WHITE PRODUCTS';
      }

      items.push({
        id: m,
        nombre: nombreDisplay,
        marca: marcaDisplay,
        rawMarca: m,
        totalEstaciones: acumulador[m].estaciones.size,
        precio: acumulador[m].suma / acumulador[m].conteo,
        esBenchmark: false
      });
    });
  }

  if (items.length === 0 && benchmark <= 0) {
    wrap.innerHTML = `<div style="text-align:center; padding:60px; color:var(--k-muted);">No hay información de precios para ${combustible} en el corredor seleccionado.</div>`;
    return;
  }

  // 3. Métricas agregadas por encima y por debajo de COESTI PONDERADO
  let sumaArriba = 0, conteoArriba = 0, setEessArriba = new Set();
  let sumaAbajo  = 0, conteoAbajo  = 0, setEessAbajo  = new Set();

  listaEstaciones.forEach(est => {
    const comps = est.actores?.filter(a => a.tipo_actor === 'COMPETENCIA' && !a.es_competidor_propio) || [];
    comps.forEach(c => {
      const p = c.combustibles?.[combustible]?.precio;
      if (p && p > 0) {
        const idComp = c.site_id || c.nombre_linea;
        if (p > benchmark) {
          sumaArriba += p;
          conteoArriba++;
          setEessArriba.add(idComp);
        } else if (p < benchmark) {
          sumaAbajo += p;
          conteoAbajo++;
          setEessAbajo.add(idComp);
        }
      }
    });
  });

  const promArriba = conteoArriba > 0 ? (sumaArriba / conteoArriba) : 0;
  const promAbajo  = conteoAbajo  > 0 ? (sumaAbajo  / conteoAbajo)  : 0;

  // 4. Insertar el punto de referencia COESTI PONDERADO
  if (benchmark > 0) {
    let totalEstacionesCoesti = 0;
    if (modo === 'MARCA') {
      const setCoesti = new Set();
      listaEstaciones.forEach(est => {
        const propio = est.actores?.find(a => a.tipo_actor === 'PROPIO');
        if (propio?.combustibles?.[combustible]?.precio > 0) {
          setCoesti.add(est.own_site_id);
        }
      });
      totalEstacionesCoesti = setCoesti.size;
    }

    items.push({
      id: 'coesti-ponderado-node',
      nombre: 'COESTI PONDERADO',
      marca: 'PRIMAX (COESTI)',
      rawMarca: 'COESTI',
      totalEstaciones: totalEstacionesCoesti,
      precio: benchmark,
      esBenchmark: true
    });
  }

  // Ordenar de menor a mayor precio
  const sorted = [...items].sort((a, b) => a.precio - b.precio);

  // =========================================================================
  // PERILLAS DE AJUSTE
  // =========================================================================
  const CONFIG_GRAFICO = {
    W: 1700,
    H: 720,
    topPad: 130,
    bottomPad: 130,
    leftPad: 65,
    rightPad: 65,
    minDistanciaX: 95
  };

  const { W, H, topPad, bottomPad, leftPad, rightPad, minDistanciaX } = CONFIG_GRAFICO;
  const chartH = H - topPad - bottomPad;

  const precios = sorted.map(d => d.precio);
  const minP = Math.min(...precios) - 0.20;
  const maxP = Math.max(...precios) + 0.20;

  const scaleY = (val) => (H - bottomPad) - ((val - minP) / (maxP - minP || 1)) * chartH;
  const benchY = scaleY(benchmark);

  const chartW = W - leftPad - rightPad;
  const stepX = chartW / Math.max(1, sorted.length - 1);

  // Coordenada X del punto COESTI PONDERADO (eje divisor vertical)
  const benchIndex = sorted.findIndex(d => d.esBenchmark);
  const benchX = benchIndex !== -1 ? (leftPad + (benchIndex * stepX)) : (W / 2);

  // 5. Muestreo de etiquetas para evitar solapes
  const indicesVisibles = new Set();
  const n = sorted.length;

  if (modo === 'MARCA') {
    for (let i = 0; i < n; i++) indicesVisibles.add(i);
  } else {
    let ultimoXArriba = -999;
    let ultimoXAbajo  = -999;
    const steps = 24;

    for (let k = 0; k <= steps; k++) {
      const idx = Math.min(n - 1, Math.round((k / steps) * (n - 1)));
      const posX = leftPad + (idx * stepX);
      const esArriba = scaleY(sorted[idx].precio) <= benchY;

      if (esArriba) {
        if (posX - ultimoXArriba >= minDistanciaX || idx === n - 1) {
          indicesVisibles.add(idx);
          ultimoXArriba = posX;
        }
      } else {
        if (posX - ultimoXAbajo >= minDistanciaX || idx === 0) {
          indicesVisibles.add(idx);
          ultimoXAbajo = posX;
        }
      }
    }

    for (let k = 0; k <= steps; k++) {
      const idx = Math.min(n - 1, Math.round((k / steps) * (n - 1)));
      const posX = leftPad + (idx * stepX);
      const esArriba = scaleY(sorted[idx].precio) <= benchY;

      if (Math.abs(posX - benchX) < minDistanciaX) continue;

      if (esArriba) {
        if (posX - ultimoXArriba >= minDistanciaX || idx === n - 1) {
          indicesVisibles.add(idx);
          ultimoXArriba = posX;
        }
      } else {
        if (posX - ultimoXAbajo >= minDistanciaX || idx === 0) {
          indicesVisibles.add(idx);
          ultimoXAbajo = posX;
        }
      }
    }

    if (benchIndex !== -1) indicesVisibles.add(benchIndex);
  }

  let elementsSvg = '';
  let labelCounterArriba = 0;
  let labelCounterAbajo = 0;

  sorted.forEach((d, i) => {
    const cx = leftPad + (i * stepX);
    const cy = scaleY(d.precio);
    const diff = (d.precio - benchmark);
    const diffStr = (diff >= 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2));

    const isBench = d.esBenchmark;
    const nodeColor = isBench ? '#D92D4E' : '#2E3192';
    const nodeRadius = isBench ? 5.5 : (modo === 'MARCA' ? 5.0 : 2.5);
    const lineWidth = isBench ? 1.5 : (modo === 'MARCA' ? 1.0 : 0.7);

    elementsSvg += `<line x1="${cx}" y1="${benchY}" x2="${cx}" y2="${cy}" stroke="${isBench ? '#D92D4E' : '#D8E0E9'}" stroke-width="${lineWidth}" />`;

    if (modo === 'MARCA') {
      const posArriba = cy < benchY;
      const logoY  = posArriba ? (cy - 72) : (cy + 22);
      const textY  = posArriba ? (cy - 114) : (cy + 92);
      const countY = posArriba ? (cy - 97)  : (cy + 109);
      const priceY = posArriba ? (cy - 79)  : (cy + 128);

      if (!isBench) {
        const logoUrl = getBrandLogo(d.rawMarca);
        elementsSvg += `
          <image href="${logoUrl}" x="${cx - 24}" y="${logoY}" width="48" height="48" 
                 preserveAspectRatio="xMidYMid meet" style="filter: drop-shadow(0 1px 3px rgba(0,0,0,0.18));" />
        `;
      }

      const countText = d.totalEstaciones ? `${d.totalEstaciones} EESS` : '';

      elementsSvg += `
        <text x="${cx}" y="${isBench ? (posArriba ? cy - 36 : cy + 42) : textY}" 
              text-anchor="middle" font-size="16" font-weight="${isBench ? '700' : '600'}" 
              fill="${isBench ? '#D92D4E' : '#16182F'}">
          ${d.nombre}
        </text>

        ${countText ? `
          <text x="${cx}" y="${isBench ? (posArriba ? cy - 20 : cy + 58) : countY}" 
                text-anchor="middle" font-size="14" font-weight="600" 
                fill="${isBench ? '#D92D4E' : '#7A8699'}">
            ${countText}
          </text>
        ` : ''}

        <text x="${cx}" y="${isBench ? (posArriba ? cy - 4 : cy + 76) : priceY}" 
              text-anchor="middle" font-size="17" font-weight="700" 
              fill="${isBench ? '#D92D4E' : '#505F79'}">
          S/ ${d.precio.toFixed(2)}
        </text>
      `;
    } else if (indicesVisibles.has(i)) {
      const anchor = (cx < 110) ? 'start' : (cx > W - 110 ? 'end' : 'middle');

      if (isBench) {
        const benchTargetY = Math.max(topPad + 10, benchY - 65);
        elementsSvg += `
          <line x1="${cx}" y1="${cy - 6}" x2="${cx}" y2="${benchTargetY + 28}" 
                stroke="#D92D4E" stroke-width="1.3" stroke-dasharray="3,3" />
          <circle cx="${cx}" cy="${benchTargetY + 28}" r="2" fill="#D92D4E" />

          <text x="${cx}" y="${benchTargetY}" text-anchor="${anchor}" font-size="14" font-weight="700" fill="#D92D4E">
            COESTI POND.
          </text>
          <text x="${cx}" y="${benchTargetY + 16}" text-anchor="${anchor}" font-size="15" font-weight="700" fill="#D92D4E">
            S/ ${d.precio.toFixed(2)}
          </text>
        `;
      } else {
        const posArriba = cy <= benchY;
        const abrev = d.nombre.length > 15 ? d.nombre.substring(0, 13) + '…' : d.nombre;

        if (posArriba) {
          const nivelY = (labelCounterArriba % 2 === 0) ? 48 : 82;
          labelCounterArriba++;

          elementsSvg += `
            <line x1="${cx}" y1="${cy - 4}" x2="${cx}" y2="${nivelY + 18}" 
                  stroke="#B8C3D0" stroke-width="0.8" stroke-dasharray="2,2" />
            <circle cx="${cx}" cy="${nivelY + 18}" r="1.5" fill="#8A96A6" />
            <text x="${cx}" y="${nivelY}" text-anchor="${anchor}" font-size="13" font-weight="500" fill="#6A7789">
              ${abrev}
            </text>
            <text x="${cx}" y="${nivelY + 13}" text-anchor="${anchor}" font-size="13" font-weight="700" fill="#1F226B">
              S/ ${d.precio.toFixed(2)}
            </text>
          `;
        } else {
          const nivelY = (labelCounterAbajo % 2 === 0) ? (H - 85) : (H - 50);
          labelCounterAbajo++;

          elementsSvg += `
            <line x1="${cx}" y1="${cy + 4}" x2="${cx}" y2="${nivelY - 14}" 
                  stroke="#B8C3D0" stroke-width="0.8" stroke-dasharray="2,2" />
            <circle cx="${cx}" cy="${nivelY - 14}" r="1.5" fill="#8A96A6" />
            <text x="${cx}" y="${nivelY}" text-anchor="${anchor}" font-size="13" font-weight="700" fill="#1F226B">
              S/ ${d.precio.toFixed(2)}
            </text>
            <text x="${cx}" y="${nivelY + 13}" text-anchor="${anchor}" font-size="13" font-weight="500" fill="#6A7789">
              ${abrev}
            </text>
          `;
        }
      }
    }

    elementsSvg += `
      <circle cx="${cx}" cy="${cy}" r="${nodeRadius}" fill="${nodeColor}" class="dot-node"
              data-nombre="${d.nombre}" data-marca="${d.marca}" data-prod="${combustible}" 
              data-precio="${d.precio.toFixed(2)}" data-diff="${diffStr}" data-bench="${isBench}"
              data-eess="${d.totalEstaciones || ''}" />
    `;
  });

  // 6. Ensamble final: 4 Cuadrantes Virtuales
  wrap.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" width="100%" height="100%" preserveAspectRatio="none" class="analytics-svg">
      <defs>
        <filter id="card-shadow" x="-10%" y="-10%" width="125%" height="125%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.08" />
        </filter>
      </defs>

      ${benchmark > 0 ? `
        <!-- Cuadrante Inferior Izquierdo: Fondo azul tenue (Precios bajos) -->
        <rect x="0" y="${benchY}" width="${benchX}" height="${H - benchY}" fill="#2E3192" fill-opacity="0.035" />

        <!-- Cuadrante Superior Derecho: Fondo rojo tenue (Precios altos) -->
        <rect x="${benchX}" y="0" width="${W - benchX}" height="${benchY}" fill="#D92D4E" fill-opacity="0.035" />

        <!-- Línea divisoria vertical punteada (sobre COESTI PONDERADO) -->
        <line x1="${benchX}" y1="15" x2="${benchX}" y2="${H - 15}" 
              stroke="#D92D4E" stroke-width="1.3" stroke-dasharray="3,3" opacity="0.6" />

        <!-- Línea divisoria horizontal punteada (COESTI PONDERADO) -->
        <line x1="15" y1="${benchY}" x2="${W - 15}" y2="${benchY}" 
              stroke="#D92D4E" stroke-width="1.4" stroke-dasharray="4,4" />

        <!-- Etiqueta COESTI PONDERADO -->
        <rect x="15" y="${benchY - 18}" width="200" height="15" fill="#FBFCFE" opacity="0.94"/>
        <text x="20" y="${benchY - 7}" font-size="18" font-weight="700" fill="#D92D4E">
          COESTI PONDERADO: S/ ${benchmark.toFixed(2)}
        </text>

        <!-- ============================================================== -->
        <!-- CUADROS KPI EN CUADRANTES DESPEJADOS (Solo en PROMEDIO MARCAS) -->
        <!-- ============================================================== -->
        ${modo === 'MARCA' ? `
          <!-- CUADRANTE SUPERIOR IZQUIERDO: BAJO COESTI (MÁS BARATOS) -->
          <g transform="translate(35, 30)" filter="url(#card-shadow)">
            <rect width="360" height="100" rx="10" fill="#FFFFFF" stroke="#D1D9F0" stroke-width="1.5" />
            <rect width="6" height="100" rx="3" fill="#2E3192" />
            <text x="24" y="28" font-size="13" font-weight="800" fill="#2E3192" letter-spacing="0.08em">
              COMPETENCIA BAJO COESTI
            </text>
            <text x="24" y="44" font-size="11" font-weight="500" fill="#7A8699">
              Estaciones con precio inferior al benchmark propio
            </text>
            <text x="24" y="82" font-size="28" font-weight="800" fill="#16182F">
              S/ ${promAbajo.toFixed(2)}
            </text>
            <text x="180" y="80" font-size="14" font-weight="700" fill="#2E3192">
              ${setEessAbajo.size} <tspan font-weight="500" fill="#7A8699">EESS</tspan>
            </text>
          </g>

          <!-- CUADRANTE INFERIOR DERECHO: SOBRE COESTI (MÁS CAROS) -->
          <g transform="translate(${W - 395}, ${H - 130})" filter="url(#card-shadow)">
            <rect width="360" height="100" rx="10" fill="#FFFFFF" stroke="#F5CAD2" stroke-width="1.5" />
            <rect width="6" height="100" rx="3" fill="#D92D4E" />
            <text x="24" y="28" font-size="13" font-weight="800" fill="#D92D4E" letter-spacing="0.08em">
              COMPETENCIA SOBRE COESTI
            </text>
            <text x="24" y="44" font-size="11" font-weight="500" fill="#7A8699">
              Estaciones con precio superior al benchmark propio
            </text>
            <text x="24" y="82" font-size="28" font-weight="800" fill="#16182F">
              S/ ${promArriba.toFixed(2)}
            </text>
            <text x="180" y="80" font-size="14" font-weight="700" fill="#D92D4E">
              ${setEessArriba.size} <tspan font-weight="500" fill="#7A8699">EESS</tspan>
            </text>
          </g>
        ` : ''}
      ` : ''}

      <!-- Puntos, logos y etiquetas de marcas -->
      ${elementsSvg}
    </svg>
  `;

  // 7. Tooltip interactivo
  const chartContainer = document.getElementById('analytics-container');
  wrap.querySelectorAll('.dot-node').forEach(dot => {
    dot.addEventListener('mouseenter', (e) => {
      const { nombre, marca, prod, precio, diff, bench, eess } = e.target.dataset;
      const esBench = bench === 'true';

      tooltip.innerHTML = `
        <div class="tt-title">${nombre}</div>
        <div>Marca: <span>${marca}</span></div>
        ${eess ? `<div>Estaciones: <span>${eess} EESS</span></div>` : ''}
        <div>Producto: <span>${prod}</span></div>
        <div>Precio: <b>S/ ${precio}</b> ${esBench ? '(BENCHMARK)' : `(${diff})`}</div>
      `;
      tooltip.style.display = 'block';
    });

    dot.addEventListener('mousemove', (e) => {
      const rect = chartContainer.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const tooltipW = tooltip.offsetWidth || 160;
      let leftPos = mouseX + 12;
      if (leftPos + tooltipW > rect.width) {
        leftPos = mouseX - tooltipW - 12;
      }

      tooltip.style.left = `${leftPos}px`;
      tooltip.style.top = `${mouseY - 25}px`;
    });

    dot.addEventListener('mouseleave', () => {
      tooltip.style.display = 'none';
    });
  });
}