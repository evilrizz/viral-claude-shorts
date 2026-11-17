# Cómo animar a Tico y a Dota

Guía para cualquier IA (o persona) que anime a Tico y Dota, los personajes del canal Idio-two.
Junto con esta guía, entrega siempre:

- las hojas de referencia: `videos/ref-ticodota/tico-referencia.png` y `videos/ref-ticodota/dota-referencia.png` (cada pose suelta está en `videos/ref-ticodota/poses/`);
- la lista de palabras con sus tiempos y quién dice cada una (sin eso no se puede sincronizar la boca ni los gestos).

```text
Vas a animar a Tico y Dota, los personajes del canal Idio-two. Usa las hojas de referencia
(tico-referencia.png y dota-referencia.png): ningún rasgo puede cambiar entre escenas.

QUIÉNES SON
- Tico: hermano mayor. Mono alto, café oscuro, cara color crema, lentes redondos, playera azul.
  Cara de "ya te dije": una ceja más alta que la otra. Es el que explica.
- Dota: hermano menor. Mono pequeño, café claro, cabeza grande, tres mechones arriba,
  playera amarilla, curita en la nariz. Es el que dice tonterías.
  Mira de frente, con los ojos rectos. Los "ojos locos" solo van cuando se golpea
  o cuando le dicen idiota.

ESTILO
- Dibujo 2D de colores planos, contorno grueso café oscuro y sombra suave abajo a la derecha.
- Pueden vivir dentro de un mundo 3D como recortes de papel que siempre miran a la cámara,
  con su sombra en el piso. Toman un poco del color de la luz de cada escena.

NUNCA SE QUEDAN QUIETOS
- Respiran: el cuerpo se estira y se encoge un poquito, todo el tiempo.
- Parpadean cada 3 segundos más o menos (a veces dos veces seguidas). Los ojos dan saltitos de mirada.
- La cabeza va un poco atrasada respecto al cuerpo. Las orejas y los mechones siguen el movimiento y rebotan.
- Brazos y piernas se doblan como de goma, con codos y rodillas. Nada de palos rígidos.
- Para pasar de una pose a otra: primero toman impulso hacia el lado contrario, luego llegan
  rápido (unos 0.2 s), se pasan un poco y se acomodan (unos 0.6 s en total).

ACTÚAN CON LA VOZ (te doy cada palabra con su tiempo y quién la dice)
- Boca: sigue las letras de cada palabra. "a" bien abierta, "o" y "u" redondas, "e" e "i"
  anchas y bajas, "m", "b" y "p" cerradas, "f" y "v" casi cerradas. Entre palabras, cerrada.
- Un gesto distinto por frase:
  - Si es pregunta, se encoge de hombros.
  - Si es exclamación, levanta los brazos (Tico emocionado, Dota celebrando).
  - Si no, Tico alterna entre explicar con las manos, señalar, contar con el dedo o tocarse la barbilla.
- En las palabras importantes: asiente con la cabeza, baja un poquito el cuerpo,
  sacude la mano y levanta las cejas.
- El que escucha voltea a ver al que habla.
- Cuando no hablan: Tico se acomoda los lentes o piensa; Dota se rasca la cabeza,
  saluda o da un saltito.
- Cuando pasa algo en la escena: Tico lo señala y Dota brinca emocionado.

EN LAS ESCENAS
- Si Tico explica algo, va chiquito en una esquina como presentador. No debe tapar
  lo que se explica, a otros personajes ni el título.
- Nada aparece antes de que se diga su palabra. Cada cosa nueva se señala una sola vez.
- Ningún corte raro: el movimiento sigue de una escena a la siguiente.

QUÉ EVITAR (ya pasó y se corrigió)
- Que parezcan figuras geométricas que solo se deslizan.
- Pupilas escondidas o cortadas.
- Dota con ojos locos todo el tiempo.
- Letras chiquitas o delgadas: deben ser grandes, gruesas y con contorno.
- Personajes encima del título o fuera de la zona segura de la pantalla.
```

## Poses que ya existen

- **Tico:** brazos cruzados, señalando, explicando, palma arriba, encogido de hombros, contando con el dedo, pensando, acomodando lentes, emocionado, tapándose la cara, manos en la cintura, por estornudar, triste, con idea (foco).
- **Dota:** brazos arriba, tranquilo, celebrando, rascándose la cabeza, saludando, señalando, ¿yo qué?, posando, ojos locos, mareado (chichón), triste, dedo lastimado, con termómetro, con varicela, abrazando, ¡achú!

## En este proyecto

El código que hace todo esto ya existe: la función de personaje 2D de `videos/primos/world3d.ts` (`q3Char`, con `force(gesto)`, `fx` para varicela, dedo lastimado, termómetro, estornudo y tristeza, `crazy`, `dizzy` y `side`). Para un video nuevo, copia ese archivo y cambia el prefijo de los nombres, como se hizo de `defensas` a `primos`.
