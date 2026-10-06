/* ==========================================================
   layout/rail.js — Panel lateral izquierdo (hijo directo de #cmp-rail)
   Cada vista aporta su propio panel de filtros (railHTML);
   aquí solo se ensamblan y se agregan las piezas comunes.
   ========================================================== */

import { kbtWatermarkSVG } from '../shared/icons.js';

export function railHTML(vistas) {
  return `
    ${vistas.map(v => v.railHTML()).join('\n')}

    <!-- MARCA DE AGUA KALIBRATE -->
    <div class="rail-watermark" aria-hidden="true">${kbtWatermarkSVG()}
    </div>

    <!-- FOOTER DEL RAIL -->
    <div class="rail-foot">
      Fuente de datos: <b>Kalibrate API</b>
    </div>
  `;
}
