/* ==========================================================
   components/tabbar.js — barra inferior de corredores.
   ========================================================== */

export function tabbarHTML() {
  return `
    <div class="tabbar-head">
      Corredores
      <b id="tab-count">—</b>
    </div>
    <div class="tabs" id="tabs"></div>
  `;
}