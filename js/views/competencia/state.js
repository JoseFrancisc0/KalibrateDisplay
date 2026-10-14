/* ==========================================================
   views/competencia/state.js
   ========================================================== */
export const competenciaSemanalState = {
    datosCrudos: null,          // Array de registros desde cambios_semanales_competencia.json
    cargando: false,
    rangos: null,               // { ACTUAL: { desde, hasta }, PASADA: { desde, hasta } }
    periodoActivo: 'ACTUAL',    // 'ACTUAL' | 'PASADA'
    modoVista: 'ESTACIONES',    // 'ESTACIONES' | 'MARCAS'
    
    // Filtros
    producto: 'Diesel',
    departamento: 'TODOS',
    provincia: 'TODOS',
    distrito: 'TODOS',

    // Listas únicas para selects dinámicos
    departamentosDisponibles: [],
    provinciasDisponibles: [],
    distritosDisponibles: []
};