/* ==========================================================
   views/heatmap/vista.js — Heatmap Matricial Estilo Seaborn
   Grid continuo, anotaciones numéricas y escala divergente.
   ========================================================== */

import { COMBUSTIBLES } from '../../config/productos.js';
import { heatmapState } from './state.js';
import { procesarDatosHeatmap } from './calculo.js';

// Rango dinámico máximo de diferencial para el gradiente (S/ -0.60 a +0.60)
const DELTA_MIN = -0.60;
const DELTA_MAX = 0.60;

/**
 * Interpolador continuo divergente estilo Seaborn (Azul <-> Blanco <-> Rojo)
 * Retorna { bg: 'rgb(...)', text: '#...' }
 */
function interpolarColorSeaborn(delta) {
  if (delta === null || delta === undefined) {
    return { bg: '#F8FAFC', text: '#CBD5E1' }; // No vende
  }

  // Clampear valor dentro de la escala
  const v = Math.max(DELTA_MIN, Math.min(DELTA_MAX, delta));

  let r, g, b;

  if (v < 0) {
    // De Blanco (0.00) hacia Azul Profundo (DELTA_MIN)
    const t = Math.abs(v) / Math.abs(DELTA_MIN); // 0 a 1
    // Color base negativo: Azul Seaborn (#0284C7 -> rgb(2, 132, 199))
    r = Math.round(255 - t * (255 - 2));
    g = Math.round(255 - t * (255 - 132));
    b = Math.round(255 - t * (255 - 199));
  } else {
    // De Blanco (0.00) hacia Rojo Intenso (DELTA_MAX)
    const t = v / DELTA_MAX; // 0 a 1
    // Color base positivo: Rojo Carmesí (#E11D48 -> rgb(225, 29, 72))
    r = Math.round(255 - t * (255 - 225));
    g = Math.round(255 - t * (255 - 29));
    b = Math.round(255 - t * (255 - 72));
  }

  // Cálculo de luminancia para contraste automático de la anotación
  const luminancia = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const textColor = luminancia < 0.65 ? '#FFFFFF' : '#1E293B';

  return {
    bg: `rgb(${r}, ${g}, ${b})`,
    text: textColor
  };
}

export function heatmapHTML() {
  return `
  <div id="heatmap-shell" class="alineacion-shell" style="display:none; flex-direction:column; width:100%; height:100%; padding:14px 18px; box-sizing:border-box;">
    
    <!-- HEADER -->
    <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom: 8px; flex: 0 0 auto;">
      <div>
        <h2 style="font-family:'Poppins',sans-serif; font-size:1.15rem; font-weight:800; margin:0; color:var(--k-ink);">Matriz de Postura Comercial</h2>
        <p id="heatmap-subtitulo" style="font-size:0.72rem; color:var(--k-muted); margin:2px 0 0 0;">Diferencial propio vs promedio zonal (S/).</p>
      </div>

      <div style="display:flex; align-items:center; gap:10px;">
        <span id="heatmap-counter" class="count-badge" style="font-weight:700;">0 EESS</span>
      </div>
    </div>

    <!-- CONTENEDOR PRINCIPAL: MATRIZ + COLORBAR LATERAL -->
    <div style="flex:1 1 0; min-height:0; display:flex; gap:12px; width:100%;">
      
      <!-- CUADRÍCULA SEABORN (STICKY ROWS & COLS) -->
      <div style="flex:1 1 auto; height:100%; min-width:0; background:#fff; border:1px solid #CBD5E1; border-radius:6px; overflow:auto; position:relative; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
        
        <table style="width:100%; border-collapse:collapse; font-family:'Inter',sans-serif; table-layout:fixed;">
          
          <!-- CABECERA STICKY -->
          <thead style="position:sticky; top:0; z-index:30; background:#fff;">
            <tr>
              <th data-click="ordenarHeatmap" data-arg="nombre" 
                  style="position:sticky; left:0; z-index:35; background:#F8FAFC; text-align:left; padding:8px 12px; border-bottom:1px solid #CBD5E1; border-right:2px solid #CBD5E1; width:220px; font-size:0.72rem; font-weight:700; color:var(--k-ink); cursor:pointer; user-select:none;">
                ESTACIÓN PROPIA <span id="sort-icon-nombre" style="font-size:0.65rem; color:var(--k-muted);">↕</span>
              </th>
              ${COMBUSTIBLES.map(prod => `
                <th data-click="ordenarHeatmap" data-arg="${prod}" 
                    style="text-align:center; padding:8px 4px; border-bottom:1px solid #CBD5E1; border-right:1px solid #fff; font-size:0.72rem; font-weight:700; color:var(--k-ink); background:#F8FAFC; cursor:pointer; user-select:none;">
                  ${prod.toUpperCase()} <span id="sort-icon-${prod}" style="font-size:0.65rem; color:var(--k-muted);">↕</span>
                </th>
              `).join('')}
              <th data-click="ordenarHeatmap" data-arg="deltaMedio" 
                  style="text-align:center; padding:8px 6px; border-bottom:1px solid #CBD5E1; border-left:2px solid #CBD5E1; width:110px; font-size:0.72rem; font-weight:800; color:var(--k-ink); background:#F1F5F9; cursor:pointer; user-select:none;">
                DELTA MEDIO <span id="sort-icon-deltaMedio" style="font-size:0.65rem; color:var(--k-muted);">↕</span>
              </th>
            </tr>
          </thead>

          <!-- CUERPO DE CELDAS SEABORN -->
          <tbody id="heatmap-tbody"></tbody>

          <!-- RESUMEN PROMEDIO DEPARTAMENTO (FOOTER STICKY) -->
          <tfoot id="heatmap-tfoot" style="position:sticky; bottom:0; z-index:30; background:#fff; border-top:2px solid #CBD5E1;"></tfoot>

        </table>

        <!-- Tooltip flotante de precisión -->
        <div id="heatmap-cell-tooltip" style="position:fixed; display:none; pointer-events:none; z-index:99999; background:rgba(22,24,47,0.96); border:1px solid rgba(255,255,255,0.15); border-radius:6px; padding:9px 12px; box-shadow:0 4px 16px rgba(0,0,0,0.35); min-width:210px; color:#fff; font-size:0.72rem;"></div>

      </div>

      <!-- BARRA DE COLOR SEABORN (COLORBAR VERTICAL CONTINUA) -->
      <div style="flex:0 0 54px; height:100%; background:#fff; border:1px solid #CBD5E1; border-radius:6px; padding:12px 6px; box-sizing:border-box; display:flex; flex-direction:column; align-items:center; justify-content:space-between; user-select:none;">
        <span style="font-size:0.62rem; font-weight:800; color:#E11D48;">+${DELTA_MAX.toFixed(2)}</span>
        <span style="font-size:0.58rem; font-weight:600; color:var(--k-muted);">+0.30</span>
        
        <!-- Gradiente continuo idéntico a Seaborn -->
        <div style="flex:1; width:14px; margin:6px 0; border-radius:2px; border:1px solid rgba(0,0,0,0.15); background:linear-gradient(to bottom, #E11D48 0%, #FFFFFF 50%, #0284C7 100%);"></div>
        
        <span style="font-size:0.58rem; font-weight:600; color:var(--k-muted);">-0.30</span>
        <span style="font-size:0.62rem; font-weight:800; color:#0284C7;">${DELTA_MIN.toFixed(2)}</span>
      </div>

    </div>

  </div>
  `;
}

export function renderHeatmap(estaciones) {
  const shell = document.getElementById('heatmap-shell');
  if (!shell) return;

  const { filas, resumenFooter, totalEstaciones } = procesarDatosHeatmap(estaciones);

  // Subtítulo y contador
  const sub = document.getElementById('heatmap-subtitulo');
  const counter = document.getElementById('heatmap-counter');
  if (sub) {
    sub.innerText = `Evaluando ${totalEstaciones} estaciones en ${heatmapState.departamento}. Diferencial propio vs promedio zonal.`;
  }
  if (counter) counter.innerText = `${totalEstaciones} EESS`;

  // Actualizar iconos de ordenamiento
  const cols = ['nombre', ...COMBUSTIBLES, 'deltaMedio'];
  cols.forEach(col => {
    const elIcon = document.getElementById(`sort-icon-${col}`);
    if (elIcon) {
      if (heatmapState.columnaOrden === col) {
        elIcon.textContent = heatmapState.ordenAscendente ? '▲' : '▼';
        elIcon.style.color = 'var(--k-ink)';
      } else {
        elIcon.textContent = '↕';
        elIcon.style.color = 'var(--k-muted)';
      }
    }
  });

  const tbody = document.getElementById('heatmap-tbody');
  if (tbody) {
    if (filas.length === 0) {
      tbody.innerHTML = `<tr><td colspan="${COMBUSTIBLES.length + 2}" style="text-align:center; padding:30px; color:var(--k-muted);">No hay estaciones en esta selección.</td></tr>`;
    } else {
      tbody.innerHTML = filas.map(f => {
        // Celdas de combustibles
        const celdasCombustibles = COMBUSTIBLES.map(prod => {
          const item = f.productos[prod];

          if (item.estado === 'NO_VENDE') {
            return `
              <td style="text-align:center; padding:0; height:28px; background:#F8FAFC; color:#CBD5E1; font-size:0.75rem; border-right:1px solid #fff; border-bottom:1px solid #fff;">
                —
              </td>
            `;
          }

          if (item.estado === 'SIN_RIVAL') {
            return `
              <td style="text-align:center; padding:0; height:28px; background:#F1F5F9; color:#94A3B8; font-size:0.65rem; font-weight:600; border-right:1px solid #fff; border-bottom:1px solid #fff;"
                  title="Precio Propio: S/ ${item.precioPropio.toFixed(2)} (Sin rivales en su zona)">
                S/ ${item.precioPropio.toFixed(2)}*
              </td>
            `;
          }

          const d = item.delta;
          const signo = d > 0 ? '+' : '';
          const { bg, text } = interpolarColorSeaborn(d);

          return `
            <td class="heatmap-cell-node" 
                data-estacion="${f.nombre}" 
                data-prod="${prod}" 
                data-propio="${item.precioPropio}" 
                data-rival="${item.promRival}" 
                data-delta="${d}" 
                data-totalrival="${item.totalRivales}" 
                data-rivalcercano="${item.rivalMasCercano.nombre}" 
                data-rivalmarca="${item.rivalMasCercano.marca}" 
                data-rivalprecio="${item.rivalMasCercano.precio}" 
                data-rivaldist="${item.rivalMasCercano.distanciaKm ?? ''}"
                style="text-align:center; padding:0; height:28px; background:${bg}; color:${text}; font-size:0.72rem; font-weight:700; border-right:1px solid #fff; border-bottom:1px solid #fff; font-variant-numeric:tabular-nums; cursor:pointer;">
              ${signo}${d.toFixed(2)}
            </td>
          `;
        }).join('');

        // Celda Delta Medio
        const dMedio = f.deltaMedio;
        const signoMedio = (dMedio !== null && dMedio > 0) ? '+' : '';
        const colorMedio = interpolarColorSeaborn(dMedio);

        return `
          <tr>
            <!-- Columna Fija Izquierda: Estación -->
            <td style="position:sticky; left:0; z-index:20; background:#fff; padding:5px 12px; height:28px; border-bottom:1px solid #E2E8F0; border-right:2px solid #CBD5E1; white-space:nowrap;">
              <div style="font-weight:700; font-size:0.74rem; color:var(--k-ink); line-height:1.2;">${f.nombre}</div>
              <div style="font-size:0.62rem; color:var(--k-muted); line-height:1;">${f.distrito} · ${f.provincia}</div>
            </td>
            ${celdasCombustibles}
            <!-- Columna Fija Derecha: Delta Medio -->
            <td style="text-align:center; padding:0; height:28px; background:${colorMedio.bg}; color:${colorMedio.text}; font-size:0.74rem; font-weight:800; border-left:2px solid #CBD5E1; border-bottom:1px solid #fff; font-variant-numeric:tabular-nums;">
              ${dMedio !== null ? `${signoMedio}${dMedio.toFixed(2)}` : '—'}
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  // Render Footer Resumen Depto
  const tfoot = document.getElementById('heatmap-tfoot');
  if (tfoot) {
    const celdasFooter = COMBUSTIBLES.map(prod => {
      const res = resumenFooter[prod];
      if (res.promDelta === null) {
        return `<td style="text-align:center; padding:0; height:30px; background:#F8FAFC; color:#CBD5E1; border-right:1px solid #fff;">—</td>`;
      }
      const signo = res.promDelta > 0 ? '+' : '';
      const { bg, text } = interpolarColorSeaborn(res.promDelta);

      return `
        <td style="text-align:center; padding:0; height:30px; background:${bg}; color:${text}; font-size:0.74rem; font-weight:800; border-right:1px solid #fff; font-variant-numeric:tabular-nums;" 
            title="Promedio Propio: S/ ${res.promPropio.toFixed(2)} | Promedio Rival: S/ ${res.promComp.toFixed(2)} (${res.conteoEESS} EESS)">
          ${signo}${res.promDelta.toFixed(2)}
        </td>
      `;
    }).join('');

    tfoot.innerHTML = `
      <tr>
        <td style="position:sticky; left:0; z-index:35; background:#F8FAFC; padding:6px 12px; height:30px; border-right:2px solid #CBD5E1; color:var(--k-ink); font-size:0.7rem; font-weight:800;">
          PROMEDIO ${heatmapState.departamento}
        </td>
        ${celdasFooter}
        <td style="text-align:center; padding:0; height:30px; background:#F1F5F9; color:var(--k-muted); font-size:0.65rem; font-weight:800; border-left:2px solid #CBD5E1;">
          RESUMEN
        </td>
      </tr>
    `;
  }

  inicializarTooltipHeatmap();
}

function inicializarTooltipHeatmap() {
  const tooltip = document.getElementById('heatmap-cell-tooltip');
  if (!tooltip) return;

  const celdas = document.querySelectorAll('.heatmap-cell-node');
  celdas.forEach(c => {
    c.addEventListener('mouseenter', e => {
      const d = e.target.dataset;
      const signo = Number(d.delta) > 0 ? '+' : '';
      const colorDelta = Number(d.delta) > 0.05 ? '#E11D48' : (Number(d.delta) < -0.05 ? '#0284C7' : '#94A3B8');
      const distStr = d.rivaldist ? `(${Number(d.rivaldist).toFixed(1)} km)` : '';

      tooltip.innerHTML = `
        <div style="font-weight:800; font-family:'Poppins',sans-serif; color:#fff; margin-bottom:2px;">
          ${d.estacion}
        </div>
        <div style="font-size:0.65rem; color:#94A3B8; margin-bottom:6px;">
          Combustible: <b style="color:#00D58A;">${d.prod.toUpperCase()}</b>
        </div>
        
        <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
          <span style="color:#CBD5E1;">Precio Propio:</span>
          <b>S/ ${Number(d.propio).toFixed(2)}</b>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <span style="color:#CBD5E1;">Promedio Rivales (${d.totalrival}):</span>
          <b>S/ ${Number(d.rival).toFixed(2)}</b>
        </div>

        <div style="display:flex; justify-content:space-between; padding-top:4px; border-top:1px solid rgba(255,255,255,0.15); margin-bottom:6px;">
          <span style="color:#CBD5E1;">Diferencial:</span>
          <b style="color:${colorDelta}; font-size:0.85rem;">${signo}${Number(d.delta).toFixed(2)}</b>
        </div>

        <div style="font-size:0.62rem; color:#93C5FD; border-top:1px dashed rgba(255,255,255,0.15); padding-top:4px;">
          Rival más cercano: <b>${d.rivalcercano}</b> ${distStr} a S/ ${Number(d.rivalprecio).toFixed(2)}
        </div>
      `;

      tooltip.style.display = 'block';
    });

    c.addEventListener('mousemove', e => {
      const tooltipW = tooltip.offsetWidth || 220;
      const posX = (e.clientX + tooltipW + 20 > window.innerWidth) ? (e.clientX - tooltipW - 15) : (e.clientX + 15);
      const posY = Math.max(10, e.clientY - 40);

      tooltip.style.left = `${posX}px`;
      tooltip.style.top = `${posY}px`;
    });

    c.addEventListener('mouseleave', () => {
      tooltip.style.display = 'none';
    });
  });
}