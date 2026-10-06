/* ==========================================================
   layout/view-bar.js — barra de pestañas de vistas (nivel GENERAL).
   Las pestañas salen del registro de vistas (views/index.js).
   La barra del nivel ESTACIÓN vive en views/estacion/barra.js.
   Estructura 100% compatible con css/layout/view-bar.css
   ========================================================== */

export function viewBarGeneralHTML(vistas, vistaActiva) {
  const tabs = vistas.map(vista => `
        <button id="${vista.tabId}" class="view-tab ${vistaActiva === vista.id ? 'active' : ''}" data-click="setVista" data-arg="${vista.id}">${vista.label}</button>`).join('');

  return `
    <div class="view-bar">
      <!-- Pestaña verde diagonal VISTAS -->
      <div class="view-lead">VISTAS</div>

      <div class="view-tabs">${tabs}
      </div>

      <!-- Espaciador flexible que empuja el modo al extremo derecho -->
      <div class="view-spacer"></div>
      <div class="view-mode" id="view-mode">MÉTRICA ACTIVA: PRECIOS</div>
    </div>
  `;
}
