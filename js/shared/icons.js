/* ==========================================================
   shared/icons.js — SVG reutilizables.
   La gota de Main Marker la usan la simbología del rail y
   las celdas de la tabla; se define una sola vez aquí.
   ========================================================== */

import { DROP_COLORS } from '../config/productos.js';

const DROP_PATH = 'M5 0C5 0 0 6 0 9.5C0 12 2.2 14 5 14C7.8 14 10 12 10 9.5C10 6 5 0 5 0Z';

/** Gota con color explícito (usada por la simbología del rail). */
export function dropSVG(fill, title, style) {
  const attrTitle = title ? ` title="${title}"` : '';
  const attrStyle = style ? ` style="${style}"` : '';
  return `<svg class="drop-marker" viewBox="0 0 10 14"${attrTitle}${attrStyle}><path d="${DROP_PATH}" fill="${fill}"/></svg>`;
}

/** Gota del combustible indicado (usada por las celdas de la tabla). */
export function renderDrop(combustible) {
  const color = DROP_COLORS[combustible] || 'var(--k-lime)';
  return dropSVG(color, `Main Marker (${combustible})`);
}

/** Isotipo en versión marca de agua (rail). */
export function kbtWatermarkSVG() {
  return `
      <svg viewBox="0 0 100 100">
        <polygon points="0,0 100,0 0,100" fill="#FFFFFF" opacity="0.055"/>
        <polygon points="56,44 100,100 0,100" fill="#FFFFFF" opacity="0.10"/>
      </svg>`;
}

/** Lupa del buscador. */
export function searchSVG() {
  return `
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2.4" stroke-linecap="round">
            <circle cx="11" cy="11" r="7"/><path d="M20 20l-4.2-4.2"/>
          </svg>`;
}
