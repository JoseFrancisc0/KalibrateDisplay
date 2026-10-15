/* ==========================================================
   views/matriz/config.js — constantes propias de la Matriz.
   ========================================================== */

export const AGRUPACIONES = [
  {
    id: 'CORREDOR',
    label: 'Corredores',
    plural: 'corredores',
    campo: 'corredor',
    sinValor: 'SIN CORREDOR',
    prefijo: 'CORREDOR ',
    esJerarquico: false
  },
  {
    id: 'UBICACION',
    label: 'Ubicación Política',
    plural: 'ubicaciones',
    campo: 'departamento',
    sinValor: 'SIN UBICACION',
    prefijo: 'DEPARTAMENTO ',
    esJerarquico: true
  }
];

export const AGRUPACION_DEFECTO = 'CORREDOR';

export function getAgrupacion(id) {
  return AGRUPACIONES.find(a => a.id === id) || 
         AGRUPACIONES.find(a => a.id === AGRUPACION_DEFECTO) || 
         AGRUPACIONES[0];
}

export const ROW_H = 34;
export const THEAD_H = 34;
