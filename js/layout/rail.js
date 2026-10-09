/* ==========================================================
   layout/rail.js — Panel lateral izquierdo (hijo directo de #cmp-rail)
   ========================================================== */
   
import { kbtWatermarkSVG } from '../shared/icons.js';

export function railHTML(vistas, nivelEstacion = null) {
  const panelesVistas = vistas.map(v => v.railHTML ? v.railHTML() : '').join('\n');
  const panelEstacion = (nivelEstacion && nivelEstacion.railHTML) ? nivelEstacion.railHTML() : '';

  return `
    ${panelesVistas}
    ${panelEstacion}
    <div class="rail-watermark">
      ${kbtWatermarkSVG()}
    </div>
    <div class="rail-foot">
      Fuente de datos: <b>Kalibrate API</b>
    </div>
  `;
}