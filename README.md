# Unhappy Numbers — Visualización estilo 3Blue1Brown (sin dependencias)

Esta mini-app dibuja la iteración:

\[
n \;\mapsto\; \sum (\text{dígito})^2
\]

y **resalta el ciclo** cuando el número es **infeliz** (no llega a 1).

## Cómo ejecutarlo

- **Opción A (más simple)**: abre `index.html` en tu navegador.
- **Opción B (recomendado)**: sirve el directorio con un server local:

```bash
cd /Users/adambrosio/Developer/happy_numbers
python3 -m http.server 5173
```

Luego abre `http://localhost:5173`.

## Controles

- **Iniciar**: reproduce la iteración con animación.
- **Pausar**: detiene la reproducción.
- **Paso**: avanza una iteración (ideal para “ver” el ciclo formarse).
- **Layout**: cambia cómo se acomoda el grafo (recomendado: **Sin cruces**).
- **Velocidad**: ajusta la rapidez de la animación.
- **Aleatorio**: elige un número **infeliz** al azar.

## Estilo 3Blue1Brown (aproximación)

- Fondo oscuro, líneas finas, “glow” suave.
- Disposición orbital/espiral: la trayectoria aparece como un objeto geométrico.
- El ciclo se dibuja como un lazo interno y se colorea distinto.


