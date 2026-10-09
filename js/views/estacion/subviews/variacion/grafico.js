/* ==========================================================
   views/estacion/subviews/variacion/grafico.js —
   Variación idéntica a la vista macro, adaptada a nivel estación.
   ========================================================== */
import { variacionState } from './state.js';
import { getBrandLogo } from '../../../../config/marcas.js';

function obtenerPrecioVigenteEn(puntos, fechaCorte) {
  let precio = null;
  for (const pt of puntos) {
    const f = pt.t.slice(0, 10);
    if (f <= fechaCorte) {
      precio = pt.p;
    } else {
      break;
    }
  }
  return precio;
}

export function renderVariacion(container, est) {
  const prod = variacionState.producto;
  const hist = (est.historico_ytd || est.historico_30d || {})[prod];

  if (!hist) {
    container.innerHTML = `<div class="empty-state">Sin historial disponible para ${prod}.</div>`;
    return;
  }

  const f1 = variacionState.fechaInicio;
  const f2 = variacionState.fechaFin;

  // 1. Precios de la Estación Propia para calcular deltas y diferenciales
  const puntosPropio = [...(hist.propio || [])].sort((a, b) => a.t.localeCompare(b.t));
  const p1Propio = obtenerPrecioVigenteEn(puntosPropio, f1);
  const p2Propio = obtenerPrecioVigenteEn(puntosPropio, f2);

  const items = [];

  // Agregar Estación Propia
  if (p1Propio !== null && p2Propio !== null) {
    items.push({
      siteId: est.site_id || 'propio',
      nombre: est.estacion,
      marca: 'PRIMAX',
      distancia: null,
      esPropio: true,
      pBase: p1Propio,
      pCorte: p2Propio,
      delta: Number((p2Propio - p1Propio).toFixed(2)),
      diffVsPropio: 0
    });
  }

  // 2. Agregar Competidores
  const actoresMap = new Map((est.actores || []).map(a => [a.site_id, a]));
  Object.entries(hist.competidores || {}).forEach(([siteId, puntos]) => {
    const actor = actoresMap.get(siteId);
    const puntosComp = [...(puntos || [])].sort((a, b) => a.t.localeCompare(b.t));
    const p1 = obtenerPrecioVigenteEn(puntosComp, f1);
    const p2 = obtenerPrecioVigenteEn(puntosComp, f2);

    if (p1 !== null && p2 !== null) {
      const delta = Number((p2 - p1).toFixed(2));
      // Diferencial vs estación propia a fecha de corte (P_rival - P_propio)
      const diffVsPropio = p2Propio !== null ? Number((p2 - p2Propio).toFixed(2)) : null;

      items.push({
        siteId,
        nombre: actor ? actor.nombre_linea : 'Competidor',
        marca: actor ? actor.marca : '—',
        distancia: actor?.distancia_km,
        esPropio: false,
        pBase: p1,
        pCorte: p2,
        delta,
        diffVsPropio
      });
    }
  });

  if (items.length === 0) {
    container.innerHTML = `<div class="empty-state">No se registraron datos en el rango ${f1} a ${f2}.</div>`;
    return;
  }

  // 3. ORDENAR TODAS LAS ESTACIONES (INCLUYENDO LA PROPIA) DE MENOR A MAYOR PRECIO DE CORTE
  items.sort((a, b) => a.pCorte - b.pCorte);

  // 4. CÁLCULO DINÁMICO DEL EJE Y (Aprovechamiento 100% de la altura sin huecos)
  const deltas = items.map(d => d.delta);
  const maxPos = Math.max(0, ...deltas);
  const minNeg = Math.min(0, ...deltas);

  const SVG_W = 1000;
  const SVG_H = 250;
  const padT = 30; // Margen superior para las etiquetas de texto
  const padB = 25; // Margen inferior
  const usableH = SVG_H - padT - padB;

  let zeroY;
  let scaleFactor;

  if (minNeg >= 0) {
    // Si todas subieron o son cero: la línea base queda abajo
    zeroY = SVG_H - padB;
    const maxVal = Math.max(maxPos, 0.10);
    scaleFactor = usableH / maxVal;
  } else if (maxPos <= 0) {
    // Si todas bajaron: la línea base queda arriba
    zeroY = padT;
    const maxVal = Math.max(Math.abs(minNeg), 0.10);
    scaleFactor = usableH / maxVal;
  } else {
    // Mixto: distribución proporcional
    const totalRange = maxPos + Math.abs(minNeg);
    zeroY = padT + (maxPos / totalRange) * usableH;
    scaleFactor = usableH / totalRange;
  }

  const totalItems = items.length;
  const colWidth = SVG_W / totalItems;
  const barWidth = Math.min(38, Math.max(22, colWidth * 0.42));

  // Generar trazados de barras
  const barrasSVG = items.map((it, idx) => {
    const xCentro = colWidth * idx + colWidth / 2;
    const xBar = xCentro - barWidth / 2;
    const hBar = Math.abs(it.delta) * scaleFactor;

    const subio = it.delta > 0;
    const bajo = it.delta < 0;

    // Regla de color estilo macro: propia en verde (#00D58A), rival sube = rojo (#D92D4E), rival baja = azul (#2563EB)
    let barColor = '#64748B';
    if (it.esPropio) {
      barColor = '#00D58A';
    } else if (subio) {
      barColor = '#D92D4E';
    } else if (bajo) {
      barColor = '#2563EB';
    }

    const signo = subio ? '+' : '';
    const textoDelta = it.delta === 0 ? '0.00' : `${signo}${it.delta.toFixed(2)}`;

    if (subio) {
      const yBar = zeroY - hBar;
      return `
        <rect x="${xBar}" y="${yBar}" width="${barWidth}" height="${hBar}" fill="${barColor}" rx="3" />
        <text x="${xCentro}" y="${yBar - 6}" font-family="'Poppins', sans-serif" font-weight="800" font-size="12" fill="${barColor}" text-anchor="middle">
          ${textoDelta}
        </text>
      `;
    } else if (bajo) {
      return `
        <rect x="${xBar}" y="${zeroY}" width="${barWidth}" height="${hBar}" fill="${barColor}" rx="3" />
        <text x="${xCentro}" y="${zeroY + hBar + 15}" font-family="'Poppins', sans-serif" font-weight="800" font-size="12" fill="${barColor}" text-anchor="middle">
          ${textoDelta}
        </text>
      `;
    } else {
      return `
        <line x1="${xBar}" y1="${zeroY}" x2="${xBar + barWidth}" y2="${zeroY}" stroke="${barColor}" stroke-width="3" />
        <text x="${xCentro}" y="${zeroY - 6}" font-family="'Poppins', sans-serif" font-weight="700" font-size="11" fill="#64748B" text-anchor="middle">
          0.00
        </text>
      `;
    }
  }).join('');

  container.innerHTML = `
    <div style="flex: 1 1 0; height: 100%; display: flex; flex-direction: column; background: #fff; border-radius: 6px; border: 1px solid var(--k-line); padding: 12px 18px 8px; box-sizing: border-box; overflow-y: auto;">
      
      <!-- Cabecera -->
      <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 2px; flex: 0 0 auto;">
        <div>
          <h3 style="font-family: 'Poppins', sans-serif; font-size: 1.05rem; font-weight: 800; color: var(--k-ink); margin: 0;">
            Variación Histórica de Precios por Estación (S/)
          </h3>
          <p style="font-size: 0.72rem; color: var(--k-muted); margin: 2px 0 0 0;">
            Evaluando ${prod.toUpperCase()} · Periodo: ${f1} ➔ ${f2}
          </p>
        </div>
      </div>

      <!-- Zona del Gráfico SVG -->
      <div style="flex: 1 1 auto; min-height: 220px; width: 100%; position: relative;">
        <svg viewBox="0 0 ${SVG_W} ${SVG_H}" style="width: 100%; height: 100%; display: block;" preserveAspectRatio="none">
          <!-- Línea Base 0.00 Dinámica -->
          <line x1="0" y1="${zeroY}" x2="${SVG_W}" y2="${zeroY}" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="3 3" />
          <text x="10" y="${zeroY - 5}" font-family="'Poppins', sans-serif" font-size="10" font-weight="700" fill="#94A3B8">0.00</text>
          
          <!-- Barras -->
          ${barrasSVG}
        </svg>
      </div>

      <!-- Fichas Inferiores por Estación -->
      <div style="display: flex; width: 100%; border-top: 1px solid var(--k-line); padding-top: 6px; flex: 0 0 auto; gap: 4px;">
        ${items.map(it => {
          let diffHTML = '';
          if (!it.esPropio && it.diffVsPropio !== null) {
            let colorDiff = '#64748B';
            let signo = '';
            if (it.diffVsPropio > 0.001) {
              colorDiff = '#D92D4E'; // Rojo: competidor más caro que nosotros
              signo = '+';
            } else if (it.diffVsPropio < -0.001) {
              colorDiff = '#00A35E'; // Verde: competidor más barato que nosotros
            }
            diffHTML = `<div style="font-size: 0.65rem; font-weight: 800; color: ${colorDiff}; margin-top: 1px;">(${signo}${it.diffVsPropio.toFixed(2)})</div>`;
          }

          const propioStyle = it.esPropio
            ? 'background: #F0FDF4; border: 1px solid #86EFAC; border-radius: 4px;'
            : '';

          return `
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; text-align: center; padding: 4px 2px; box-sizing: border-box; min-width: 0; ${propioStyle}">
              
              <!-- Logo Marca -->
              <div style="width: 24px; height: 24px; border-radius: 4px; overflow: hidden; background: #fff; border: 1px solid rgba(0,0,0,0.1); margin-bottom: 3px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                <img src="${getBrandLogo(it.marca)}" style="width: 100%; height: 100%; object-fit: cover;">
              </div>

              <!-- Nombre y Distancia -->
              <span style="font-size: 0.68rem; font-weight: 800; color: ${it.esPropio ? '#00A35E' : 'var(--k-ink)'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100\%;" title="${it.nombre}">
                ${it.esPropio ? it.nombre : it.nombre}
              </span>
              <span style="font-size: 0.58rem; color: var(--k-muted); margin-bottom: 2px;">
                ${it.esPropio ? 'PROPIA' : (it.distancia !== undefined && it.distancia !== null ? `${it.distancia.toFixed(1)} km` : it.marca)}
              </span>

              <!-- Precios Base y Corte -->
              <div style="font-size: 0.60rem; color: var(--k-muted);">
                BASE
              </div>
              <div style="font-size: 0.63rem; font-weight: 700; color: var(--k-ink);">
                S/ ${it.pBase.toFixed(2)}
              </div>
              
              <div style="font-size: 0.60rem; color: var(--k-muted); margin-top: 2px;">
                CORTE
              </div>
              <div style="font-size: 0.63rem; font-weight: 700; color: var(--k-ink);">
                S/ ${it.pCorte.toFixed(2)}
              </div>

              <!-- Diferencial vs Propia -->
              ${diffHTML}

            </div>
          `;
        }).join('')}
      </div>

    </div>
  `;
}