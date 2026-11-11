# Avión (Idio-two), estilo "serie educativa": plan

Misma historia, cortes, tiempos y sonidos que `videos/avion`. Lo que cambia es la **animación de personajes** y el acabado de dibujo:

- **Personajes redibujados en cada dibujo** (12 por segundo, "a dos cuadros", como la animación tradicional), no piezas rígidas que se mueven:
  - brazos y piernas flexibles resueltos con cinemática inversa (hombro → codo → mano) y dibujados como un solo trazo curvo;
  - cuerpo que se aplasta y se estira (respiración, al hablar, al cambiar de pose, al aterrizar de un brinco);
  - poses alcanzadas con anticipación y rebote;
  - la cabeza sigue al cuerpo con retraso; orejas, mechón de Tico y mechones de Dota se mueven después (seguimiento);
  - párpados que parpadean (a veces doble), pupilas que miran y saltan, cejas que actúan, boca con formas de sílaba al hablar; Dota con ojos rectos salvo cuando se golpea o le dicen idiota.
- **Acabado de dibujo:** las líneas "vibran" como trazos a mano (filtro de desplazamiento que cambia 8 veces por segundo) y una viñeta suave.
- Implementación: `world.ts` (`asCharSvg`, `asDraw`, `asIK`), todo en función del tiempo `t`.
