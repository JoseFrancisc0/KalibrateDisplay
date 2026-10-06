# Bitácora Pricing · Operación Directa

Visor estático de precios de la red COESTI frente a la competencia (fuente: Kalibrate API).
HTML + CSS + JavaScript nativo (módulos ES), sin dependencias ni build.

## Cómo levantarlo

Los datos se leen con `fetch`, así que **no funciona abriendo `index.html` con doble clic**. Hay que servir la carpeta:

```bash
python -m http.server 8000
# abrir http://localhost:8000
```

## Estructura

```
index.html                 Armazón: 4 contenedores vacíos + hojas de estilo + js/main.js
data/                      JSON generados por el notebook (no se editan a mano)
logos/                     Logos de marcas

css/
  base/                    tokens (variables), reset y grilla general
  layout/                  piezas fijas: nav superior, rail, barra de vistas
  shared/                  estilos usados por varias vistas (gotas Main Marker)
  views/                   un archivo (o carpeta) por vista

js/
  main.js                  Punto de entrada: monta la pantalla, conecta eventos, carga datos
  config/                  Constantes: productos, logos de marcas, rutas de datos
  core/
    state.js               Estado GLOBAL (datos, vista activa, nivel GENERAL/ESTACION)
    data.js                Único lugar que hace fetch
    events.js              Delegación de eventos (data-click / data-change / data-input)
    router.js              Cambio de vista, render y contrato de las vistas
  shared/                  Lógica reutilizable: marcas, segmentación geográfica, DOM, íconos
  layout/                  HTML de nav, rail y barra de vistas
  views/
    index.js               REGISTRO de vistas (orden de pestañas, rail y contenedores)
    matriz/                Matriz Competitiva
    analisis/              Análisis Ponderado
    alineacion/            Alineación Competitiva
    variacion/             Variación Histórica
    estacion/              Detalle de estación (se abre desde la Matriz)
```

### Anatomía de una vista (`js/views/<vista>/`)

| Archivo        | Responsabilidad                                                  |
|----------------|------------------------------------------------------------------|
| `index.js`     | Definición de la vista (contrato del router)                     |
| `state.js`     | Estado propio de la vista                                        |
| `rail.js`      | Panel de filtros del rail                                        |
| `acciones.js`  | Respuesta a los controles + poblado de filtros                   |
| `calculo.js`   | Cálculos sin DOM (cuando la vista los tiene)                     |
| `vista.js` / `grafico.js` / `filas.js` | HTML del contenedor y render              |

## Cómo fluye

1. `main.js` monta nav, rail, `<main>` y cinta inferior a partir del registro de vistas.
2. Los controles no usan `onclick`: declaran `data-click="accion"` (o `data-change` / `data-input`) y opcionalmente `data-arg="valor"`. `core/events.js` despacha a la acción registrada.
3. Toda acción modifica el estado de su vista y llama a `render()` (`core/router.js`), que dibuja la vista activa o el detalle de estación.

## Agregar una vista nueva

1. Crear `js/views/<vista>/` con al menos `index.js`, `state.js`, `rail.js`, `acciones.js` y su render.
2. En `index.js` exportar un objeto con el contrato documentado en `core/router.js`:
   `id, label, tabId, shellSelector, display, railId, usaTabbar, railHTML, mainHTML, render, etiquetaModo, alEntrar?, alRedimensionar?, acciones?, iniciarListeners?`
3. Agregarla al arreglo `VISTAS` en `js/views/index.js`.
4. Si tiene estilos, crear `css/views/<vista>.css` y enlazarlo en `index.html` (al final, después de las demás vistas).

La pestaña, el panel del rail, el contenedor y sus acciones se conectan solos.

## Notas

- El orden de las hojas de estilo en `index.html` importa (cascada).
- `css/views/alineacion.css` también define clases que reutilizan Variación y Detalle de estación (`alineacion-shell`, `leg-chip`, `count-badge`), y `css/views/matriz/table.css` define `.empty-state`, que también usan otras vistas.
