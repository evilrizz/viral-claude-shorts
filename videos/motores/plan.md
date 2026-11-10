# Motores (Idio-two): plan del mundo

**Idea:** un motor se arma pieza por pieza (pistón, biela y cigüeñal, válvulas, levas y bujía, volante, aceite y radiador) para llegar a la pieza que casi nadie revisa: la banda de distribución. Si se rompe, los pistones golpean las válvulas: revisa en el manual cada cuánto se cambia.

**Estilo:** flat2d, pero con el contorno café oscuro grueso (`#2b1a14`) de la referencia `assets/tico-dota.png`, en todo, para que los personajes y las piezas se vean del mismo mundo. Colores planos, sin texturas ni degradados.

**Audio:** voces de ElevenLabs (otra sesión). Los tiempos de las palabras salen de las 19 líneas sueltas (inicio de cada línea exacto, palabras estimadas dentro de cada frase): no hubo modelo de transcripción porque la red bloquea huggingface.co.

## Elenco (personajes del usuario, Idio-two)
- **Tico** (`moTico`): mono alto café oscuro, lentes redondos grandes, camiseta azul, cara de "ya te dije". Proporción: cabeza grande (radio 130) sobre un cuerpo de 235, piernas cortas. Articulaciones: hombros, codos (brazos de dos tramos), cadera, rodillas implícitas en piernas rectas.
  - Estados: `cross` (brazos cruzados, por defecto), `point` (brazo derecho arriba señalando, el izquierdo colgando), `palm` (mano en la cara), `hold` (dos brazos al frente, sostiene algo: tubo o manual). Boca: `smirk` / `talk` (se abre y cierra mientras habla). Extra: `bulb` (foco de idea encima). Cambios instantáneos entre poses; la boca a 0.12 s por golpe.
- **Dota** (`moDota`): mono chico café claro, cabeza enorme, tres mechones, camiseta amarilla, curita en la nariz, boca abierta, ojos chuecos.
  - Estados: `up` (brazos arriba, celebrando), `down` (brazos abajo), `hug` (abraza algo al frente), `reach` (brazo estirado para tocar). Extras: `bump` (chipote), `black` (ojo morado), `stars` (estrellitas de mareo, giran en bucle), `screws` (3 tornillos en la mano). Habla: la boca se estira y encoge.
- **Motor en corte** (`moEngine`): cilindro (paredes grises), cabeza con 2 puertos, pistón, biela, cigüeñal (disco con contrapeso y muñón), válvula de admisión (izq.) y de escape (der.), árbol de levas (2 levas), bujía al centro, volante de inercia detrás del cigüeñal, mezcla dentro de la cámara. Todo se posa con UN ángulo del cigüeñal `a` (0–720°): biela real (largo 250, radio 80), levas a la mitad de vuelta, válvulas según los 4 tiempos (admisión 0–180, compresión 180–360, explosión 360–540, escape 540–720), chispa al llegar a 360.
- **Distribución, vista de frente** (`moTiming`): bloque del motor, polea de levas grande (radio 120) arriba, polea del cigüeñal chica (radio 60) abajo, banda con dientes que corre. Estados: `hidden` (tapada por el "?"), `run`, `glow` (resaltada), `broken` (dos tiras sueltas).
- **Utilería**: volante de coche (`moWheel`), mesa de taller (`moTable`), tubo de metal (`moTube`), gota de gasolina, chispa, explosión (`moBoom`), humo (`moSmoke`), calor (`moHeat`), aceite (`moOil`), radiador con manguera (`moRadiator`), manual (`moManual`), coche (`moCar`), tarjetas de los 4 tiempos (`moStroke`), tornillos.

## Escenarios
- **Sol de taller** (`moBurst`): rayos crema y amarillo pálido como el banner; gira lento en bucle. Para escenas con personajes.
- **Plano azul** (`moPrint`): azul noche con cuadrícula tenue, para los acercamientos del motor. Título blanco.

## Cámara (composiciones)
- `wide`: personajes abajo + objeto al centro.
- `cut`: el motor en corte centrado (y 660–1530).
- `front`: la distribución de frente centrada.
- Movimiento: acercamiento lento (escala 1 → 1.04) durante la escena (`moCam`).
- Personajes chicos en las esquinas inferiores cuando el protagonista es el motor: Tico (190, 1590, ×0.5), Dota (890, 1590, ×0.55).

## Lenguaje visual
- **Etiqueta** (`moTag`): píldora azul noche con texto blanco: el nombre de la pieza. Entra con rebote 0.35 s + `pop`.
- **Flechas**: azul = entra aire/mezcla; gris = sale humo; amarilla = movimiento.
- **Chispa**: estrella amarilla 0.25 s + `zip`. **Explosión**: estallido naranja 0.4 s + `hit`/`impact`.
- **"?"**: tarjeta amarilla con "?" que tapa la pieza misteriosa.

## Sonido
Tempo 100 BPM en D. Curva: curioso (gancho) → juguetón (burla a Dota) → calmado/energético alternando mientras se arma (cada pieza nueva sube un poco) → tenso (se calienta, banda que se rompe, oscuro en el golpe) → triunfal (consejo y cierre) → juguetón (Dota al final). Ambiente `room` en el taller. Efectos: `pop` etiquetas, `zip` chispas, `hit` explosiones, `fail` cuando algo sale mal, `impact` en el golpe pistón-válvula, `whoosh` cuando Dota sale volando.

## Efectos de caricatura (foley)
Capa aparte, `foley.ts`: sonidos sintetizados (deterministas) con su propio volumen, unos 8 dB bajo la voz, encima de la música. Resorte (`boing`) cuando Dota brinca o aparece, silbato que sube + soplido cuando sale volando y un choque lejano al caer, explosiones suaves (ruido filtrado corto, sin saturar), golpes metálicos (`clank`) al poner o atorar piezas, chispas (`crackle`), gotas (`plip`), burbujas del radiador, vapor (`hiss`), el motor andando (pulsos graves suaves), zumbido del volante, la banda que truena (`snap`), el golpe del pistón (`bonk`), hojas del manual, el coche que arranca con claxon, pasos y estrellitas de Dota mareado.
Después de cambiar `scenes.json`: `node videos/motores/foley.ts` y luego `node core/render.ts videos/motores`.
