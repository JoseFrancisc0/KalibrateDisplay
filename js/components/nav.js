/* ==========================================================
   components/nav.js — barra superior.
   Estilos: css/components/nav.css
   Se monta en #cmp-nav (que ya lleva la clase .nav).
   ========================================================== */

import { kbtMarkSVG } from '../icons.js';

export function navHTML() {
  return `
    <div class="nav-brand">
      ${kbtMarkSVG()}
      <span class="kbt-word">Kalibrate</span>
    </div>

    <div class="nav-sep"></div>

    <div class="nav-title">
      <h1>Bitácora Pricing · Operación Directa</h1>
      <p id="meta-info">Sincronizando información de Lakehouse...</p>
    </div>

    <div class="nav-spacer"></div>

    <div class="nav-block-dark">
      <span class="lbl">Estaciones monitoreadas</span>
      <span class="val" id="nav-total">—</span>
    </div>
  `;
}
