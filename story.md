# Números Felices e Infelices

El año pasado, Fran Ruda (Dios lo tenga en la gloria) nos deseó un **feliz 2025 muy matemático**. Nos dio datos fascinantes sobre este año. Para honrar su legado, me puse a buscar curiosidades del 2026.

Y descubrí algo que no sabía: en **teoría de números** (la rama de las matemáticas que estudia las propiedades de los números enteros) existen números que se llaman **felices** y otros que se llaman **infelices**.

## ¿Cómo funciona?

El proceso es simple:

1. **Toma un número cualquiera**
2. **Separa sus dígitos** y eleva cada uno al cuadrado
3. **Suma todos esos cuadrados** para obtener un nuevo número
4. **Repite el proceso** con el número resultante

Si eventualmente llegas al **1**, el número original es **feliz** 😊

Si quedas atrapado en un **ciclo infinito** sin llegar al 1, el número es **infeliz** 😔

Veamos esto en acción con algunos ejemplos:

## El Número 2: Un Ejemplo Infeliz

Déjame mostrarte con un ejemplo. Empecemos por el número **2**:

- 2² = **4**
- 4² = **16**
- 1² + 6² = 1 + 36 = **37**
- 3² + 7² = 9 + 49 = **58**
- 5² + 8² = 25 + 64 = **89**
- 8² + 9² = 64 + 81 = **145**
- 1² + 4² + 5² = 1 + 16 + 25 = **42**
- 4² + 2² = 16 + 4 = **20**
- 2² + 0² = 4 + 0 = **4**

¿Y acá qué notamos? **Volvemos al 4**. Se forma un ciclo infinito sin escapatoria.

![Visualización del número 2 cayendo en el ciclo infinito del 4](image.png)

**No hay nada más triste que estar condenado a repetir lo mismo hasta el infinito** (como [el mito de Sísifo](https://en.wikipedia.org/wiki/The_Myth_of_Sisyphus)). Por eso llamamos al **2** un **número infeliz**.

_Piensen en nuestros usuarios cuando quedan atrapados en un loop infinito... ¿hay algo más infeliz que eso?_

Si probamos con otros números, veremos que la mayoría sigue el mismo patrón: avanzan por una cadena de transformaciones hasta que llegan al **4**, quedando atrapados en un ciclo eterno.

## Más Ejemplos de Números Infelices

Veamos qué pasa con los números **3**, **4**, **5** y **6**:

### El Número 3

- 3² = **9**
- 9² = **81**
- 8² + 1² = 64 + 1 = **65**
- 6² + 5² = 36 + 25 = **61**
- 6² + 1² = 36 + 1 = **37**
- 3² + 7² = 9 + 49 = **58**
- 5² + 8² = 25 + 64 = **89**
- 8² + 9² = 64 + 81 = **145**
- 1² + 4² + 5² = 1 + 16 + 25 = **42**
- 4² + 2² = 16 + 4 = **20**
- 2² + 0² = 4 + 0 = **4**

¡Otra vez llegamos al **4**! El 3 también es **infeliz**.

![Visualización del número 3 llegando al ciclo del 4](image-1.png)

### El Número 4

- 4² = **16**
- 1² + 6² = 1 + 36 = **37**
- 3² + 7² = 9 + 49 = **58**
- 5² + 8² = 25 + 64 = **89**
- 8² + 9² = 64 + 81 = **145**
- 1² + 4² + 5² = 1 + 16 + 25 = **42**
- 4² + 2² = 16 + 4 = **20**
- 2² + 0² = 4 + 0 = **4**

El **4** se encuentra a sí mismo en el ciclo. Es el corazón del bucle infinito. **Infeliz**, por supuesto.

![Visualización del número 4 en su propio ciclo infinito](image-2.png)

### El Número 5

- 5² = **25**
- 2² + 5² = 4 + 25 = **29**
- 2² + 9² = 4 + 81 = **85**
- 8² + 5² = 64 + 25 = **89**
- 8² + 9² = 64 + 81 = **145**
- 1² + 4² + 5² = 1 + 16 + 25 = **42**
- 4² + 2² = 16 + 4 = **20**
- 2² + 0² = 4 + 0 = **4**

Una vez más, todos los caminos conducen al **4**. El 5 es **infeliz**.

![Visualización del número 5 terminando en el ciclo del 4](image-3.png)

### El Número 6

- 6² = **36**
- 3² + 6² = 9 + 36 = **45**
- 4² + 5² = 16 + 25 = **41**
- 4² + 1² = 16 + 1 = **17**
- 1² + 7² = 1 + 49 = **50**
- 5² + 0² = 25 + 0 = **25**
- 2² + 5² = 4 + 25 = **29**
- 2² + 9² = 4 + 81 = **85**
- 8² + 5² = 64 + 25 = **89**
- 8² + 9² = 64 + 81 = **145**
- 1² + 4² + 5² = 1 + 16 + 25 = **42**
- 4² + 2² = 16 + 4 = **20**
- 2² + 0² = 4 + 0 = **4**

Después de un camino más largo, el 6 también termina atrapado en el **4**. **Infeliz**.

![Visualización del número 6 con su largo recorrido hasta el ciclo del 4](image-4.png)

## El Número 7: La primera sorpresa

Pero luego llegamos a un número mágico: el **7**.

- 7² = **49**
- 4² + 9² = 16 + 81 = **97**
- 9² + 7² = 81 + 49 = **130**
- 1² + 3² + 0² = 1 + 9 + 0 = **10**
- 1² + 0² = 1 + 0 = **1**
- 1² = **1**

¡Llegó a un final! Alcanzamos el **1** y el ciclo se rompió. Por eso llamamos al **7** un **número feliz**. Puede descansar en 1, sin loops infinitos y con el placer de haber cumplido con su deber.

![Visualización del número 7 alcanzando el 1 - ¡un número feliz!](image-5.png)

---

## ¿Y el 2026?

Ahora, ¿qué pasa con el **2026**? Veámoslo:

- 2² + 0² + 2² + 6² = 4 + 0 + 4 + 36 = **44**
- 4² + 4² = 16 + 16 = **32**
- 3² + 2² = 9 + 4 = **13**
- 1² + 3² = 1 + 9 = **10**
- 1² + 0² = 1 + 0 = **1**
- 1² = **1**

![Visualización del número 2026 alcanzando el 1 - ¡es un número feliz!](image-6.png)

¡Resulta que el **2026** efectivamente es un número feliz! 🎉

## Moraleja

Equipo, les deseo que tengan un 2026 tan feliz como el número 2026. Y ojalá que este año, podamos cerrar y cumplir con todas las cosas que queremos y no nos quedemos atrapados en un loop infinito. Que lo que empecemos, lo terminemos.

Abrazo y feliz 2026 feliz!
Pasti

---

**P.D.:** ¿Querés probar con otros números? Podés jugar con la visualización interactiva acá: https://andresdambrosio.github.io/happy_numbers/