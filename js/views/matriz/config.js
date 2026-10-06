/* ==========================================================
   views/matriz/config.js — constantes propias de la Matriz.
   ========================================================== */

/* ----------------------------------------------------------
   Formas de dividir las pestañas de la cinta inferior.
   Agregar una dimensión nueva = agregar una entrada aquí.
     id       → clave interna (matrizState.agrupacionTabs)
     label    → texto del selector dropUp y del encabezado
     plural   → se usa en el contador "248 · 9 corredores"
     campo    → propiedad de la estación que agrupa
     sinValor → etiqueta para estaciones sin ese dato
     prefijo  → prefijo redundante a limpiar en la pestaña
   ---------------------------------------------------------- */
export const AGRUPACIONES = [
  { id: 'CORREDOR',     label: 'Corredores',    plural: 'corredores',
    campo: 'corredor',     sinValor: 'SIN CORREDOR',     prefijo: 'CORREDOR ' },
  { id: 'DEPARTAMENTO', label: 'Departamentos', plural: 'departamentos',
    campo: 'departamento', sinValor: 'SIN DEPARTAMENTO', prefijo: 'DEPARTAMENTO ' },
  { id: 'GPC',          label: 'GPC Groups',    plural: 'GPC groups',
    campo: 'gpc_group',    sinValor: 'SIN GPC GROUP',    prefijo: '' }
];

export const AGRUPACION_DEFECTO = 'CORREDOR';

export function getAgrupacion(id) {
  return AGRUPACIONES.find(a => a.id === id)
      || AGRUPACIONES.find(a => a.id === AGRUPACION_DEFECTO)
      || AGRUPACIONES[0];
}

// Alturas de fila/cabecera para calcular cuántas estaciones caben por página
export const ROW_H   = 34;
export const THEAD_H = 34;
