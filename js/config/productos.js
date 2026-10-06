/* ==========================================================
   config/productos.js — catálogo de combustibles.
   ========================================================== */

export const COMBUSTIBLES = ["Diesel", "Regular", "Premium", "GNV", "GLP"];

// Grupos de producto para colapsar Main Markers
export const GRUPOS_MARKER = [
  { id: 'Diesel',   nombre: 'Diesel',   combustibles: ['Diesel'] },
  { id: 'Unleaded', nombre: 'Unleaded', combustibles: ['Regular', 'Premium'] },
  { id: 'GNV',      nombre: 'GNV',      combustibles: ['GNV'] },
  { id: 'GLP',      nombre: 'GLP',      combustibles: ['GLP'] }
];

// Colores de gotas por combustible y por grupo
export const DROP_COLORS = {
  "Diesel":   "var(--drop-diesel)",
  "Unleaded": "var(--drop-unleaded)",
  "Regular":  "var(--drop-unleaded)",
  "Premium":  "var(--drop-unleaded)",
  "GLP":      "var(--drop-glp)",
  "GNV":      "var(--drop-gnv)"
};
