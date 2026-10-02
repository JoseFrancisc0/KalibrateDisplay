/* ==========================================================
   nav.js — barra de navegación superior (Header)
   ========================================================== */

export function navHTML() {
  return `
    <header class="top-nav">
      <div class="nav-left">
        <span class="brand-coesti">COESTI</span>
        <div class="nav-divider"></div>
        <div class="nav-title-group">
          <h1 class="nav-title">BITÁCORA PRICING · OPERACIÓN DIRECTA</h1>
          <span class="nav-meta" id="meta-info">Última actualización: —</span>
        </div>
      </div>

      <div class="nav-right">
        <div class="nav-kpi-card">
          <span class="nav-kpi-label">ESTACIONES MONITOREADAS</span>
          <b class="nav-kpi-val" id="nav-total">—</b>
        </div>
      </div>
    </header>
  `;
}