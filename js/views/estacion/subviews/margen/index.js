import { renderMargen } from './grafico.js';
import { railMargenHTML } from './rail.js';
import { acciones } from './acciones.js';

export const margenSubView = {
  id: 'MARGEN',
  render: renderMargen,
  railHTML: railMargenHTML,
  acciones
};