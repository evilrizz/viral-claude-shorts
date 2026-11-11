# Avión (Idio-two): plan del mundo

**Idea:** un avión se arma desde una tabla con dos alas: el ala curva e inclinada (sustentación), el motor, el estabilizador y el elevador, la deriva y el timón, los alerones y los flaps. Respuesta del gancho: sin motores no se cae como piedra, planea (Air Canada, 1983). Consejo: cinturón abrochado todo el vuelo.

**Estilo (de los videos de referencia del usuario, sin copiar su contenido):** escenario casi negro con textura fina de puntos y dunas tenues; pocos acentos vivos (naranja #ff6a3d, lima #d4ff3a, azul aire #5aa9ff) y papel crema para fichas; las sombras de las piezas hechas de puntos; títulos sin recuadro, la palabra clave en naranja; fichas de archivo (Air Canada · 1983, sello PLANEÓ); barras de nivel con etiquetas monoespaciadas; cada pieza se señala UNA vez, cuando se dice su nombre, con esquinas de enfoque lima y una ficha de papel con su nombre. Tico y Dota exactamente como en `assets/tico-dota.png`.

**Audio:** voces de ElevenLabs (otra sesión). Tiempos de palabras alineados con las 18 líneas sueltas (inicio de línea exacto; palabras estimadas dentro de cada frase).

## Elenco
- Tico, Dota (mismos que en motores; respiran, parpadean, Tico asiente al hablar, Dota rebota).
- Avión de tabla, 4 vistas: de lado (`avPlaneSide`: tabla, ala, turbina con ventilador, estabilizador + elevador articulado, deriva + timón, flap), de frente (`avPlaneFront`: alerones articulados en ±300, turbinas), desde arriba (`avPlaneTop`: timón al final), ala en corte (`avAirfoil`: flujo de aire animado, inclinación, flap, flechas de aire hacia abajo y sustentación).
- Utilería: medidor de combustible, ficha de archivo, barras de nivel, bici, piedra, asiento con cinturón, cabina.

## Sonido
Tempo 104 en E. Curva: curioso (gancho) → tenso (motores apagados) → juguetón (Dota) → calma/asombro al armar cada pieza, tenso en cada problema (cabecea, se va de lado, lento) → épico en Air Canada → triunfal en el consejo y el cierre. Capa de efectos (`foley.ts`): turbina y su apagado, viento por el ala, choque de la tabla, tapitas, timbre de bici, sello, clic del cinturón, golpe en el techo y "ding" en cada pieza.

## Versión 2 (audio con la escena «¡Felicidades, ya tienes un avión!»)
- **Armado del avión en estilo cielo** (segunda referencia del usuario): de «Te lo armo pieza por pieza» a «Ya tienes un avión». Cielo con degradado, nubes en 3 capas con paralaje, pasto; avión COMERCIAL (`avLiner`, de lado; `avLinerFront`, `avLinerTop`) con sombreado suave; la tabla con alas solo donde el guion la nombra (gancho, mesa, se estrella, cierre) para dar volumen; cada pieza nueva se pinta de lima y luego toma su color (`avPaint`); estela punteada; títulos en mayúsculas cursivas blancas con contorno. El ala en corte va sobre azul marino con rejilla (`avNavyGrid`).
- **Evolución:** cada pieza vuelve la tabla un poco más avión comercial (`avMorphTo`): turbinas → alas metálicas; estabilizador → fuselaje; elevador → cabina; deriva → ventanillas y franja; timón → aerolínea IDIO-TWO (letrero y logo «i2» en la cola).
- **Nueva escena:** la tabla con todas sus piezas brilla y se vuelve un avión comercial (`avAirliner`) que despega; Tico y Dota lo miran.
- **Lo demás** (gancho, respuesta, Air Canada, turbulencia, cierre) sigue en el estilo oscuro de puntos; el final es el banner.
- **Límite:** el estilo 3D del proyecto no se puede mezclar con flat2d en un mismo video; el volumen es con sombreado suave.

## Versión 3
- El avión es la **avioneta** de la referencia (ala alta, hélice, puntales, tren de aterrizaje) con la aerolínea IDIO-TWO (`avCessna`, `avCessnaFront`, `avCessnaTop`); la tabla se convierte en ella pieza por pieza (`avMorphTo`: 1 alas reales y puntal, 2 fuselaje, 3 ventanas, 4 franja y tren, 5 IDIO-TWO).
- Más movimiento en el cielo: la cámara se mece como en vuelo, el avión cruza la pantalla, nubes más rápidas.
- «Ya tienes un avión»: presentado como premio (acercamiento, rayos dorados, confeti, moño gigante, esquinas doradas).
- Cabina de verdad (`avCabin`): paredes curvas, compartimentos, ventanillas con cielo que pasa, filas de asientos; Tico abrochado, Dota sentado sin cinturón sale volando al techo.
