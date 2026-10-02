/* ==========================================================
   components/table.js — armazón estático de la tabla
   (contenedor, colgroup, cabecera y tbody vacío).
   Estilos: css/components/table.css
   Las filas las inyecta js/views/matriz-competitiva.js
   dentro de #grid-body.
   ========================================================== */

// Ancho: más espacio al nombre del competidor (52%) y celdas compactas (9.6%)
const ANCHO_NOMBRE = '52%';
const ANCHO_CELDA  = '9.6%';

// [etiqueta, color de la franja de cabecera]
const COLUMNAS = [
  ['Diesel',  '#060cb8'],
  ['Regular', '#6202bb'],
  ['Premium', '#6202bb'],
  ['GNV',     '#00BF6F'],
  ['GLP',     '#00A3E0']
];

export function tableHTML() {
  return `
    <div class="table-shell">
      <div class="table-scroll" id="table-scroll">
        <table id="matriz-table">
          <colgroup>
            <col style="width:${ANCHO_NOMBRE}">
            ${COLUMNAS.map(() => `<col style="width:${ANCHO_CELDA}">`).join('')}
          </colgroup>
          <thead>
            <tr>
              <th>Estación Propia / Competidor</th>
              ${COLUMNAS.map(([etiqueta, color]) =>
                `<th class="col-num" style="--fuel:${color}">${etiqueta}</th>`).join('')}
            </tr>
          </thead>
          <tbody id="grid-body"></tbody>
        </table>
        <div id="empty-state" class="empty-state" style="display:none">
          No hay estaciones que coincidan con la búsqueda.
        </div>
      </div>
    </div>
  `;
}
