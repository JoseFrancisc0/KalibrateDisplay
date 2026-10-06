/* ==========================================================
   view-bar.js — Barra horizontal de cambio de vista y contexto.
   ========================================================== */

export function viewBarHTML() {
  return `
    <div class="view-bar">
      <div class="view-lead">Vistas</div>
      <div class="view-tabs">
        <button id="tab-view-matriz" class="view-tab active" onclick="window.setVista('MATRIZ')">Matriz Competitiva</button>
        <button id="tab-view-analisis" class="view-tab" onclick="window.setVista('ANALISIS')">Análisis Ponderado</button>
        <button id="tab-view-alineacion" class="view-tab" onclick="window.setVista('ALINEACION')">Alineación Competitiva</button>
        <button id="tab-view-variacion" class="view-tab" onclick="setVista('VARIACION')">VARIACIÓN HISTÓRICA</button>
      </div>
      <div class="view-spacer"></div>
      <div id="view-mode" class="view-mode">Métrica activa: Precios</div>
    </div>
  `;
}