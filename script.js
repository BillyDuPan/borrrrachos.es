document.addEventListener('DOMContentLoaded', () => {
    // Referencias de Elementos
    const beerSound = document.getElementById('beerSound');
    const generateButton = document.getElementById('generateButton');
    const resultElement = document.getElementById('result');
    const beerFactElement = document.getElementById('beerFact');
    const lottieContainer = document.getElementById('lottie-animation');

    // Checkboxes de Filtros Actualizados
    const filterBarsCheckbox = document.getElementById('filterBars');
    const filterCupasCheckbox = document.getElementById('filterCupas');
    const filterTiendaCheckbox = document.getElementById('filterTienda');
    const filterComidaCheckbox = document.getElementById('filterComida');

    // Constantes y Variables
    const buttonPhrases = [
        "¡A beber!",
        "¡Ponme una birra!",
        "¡Encuentra mi birra!",
        "¡Salud!",
        "¡Vamos al lío!"
    ];

    const teasingMessages = [
        "¡Venga, ve ya!",
        "¿No te decides, eh?",
        "¡Este es perfecto para ti!",
        "Confía, te va a encantar.",
        "¡Deja de hacer clic y empieza a beber!",
        "En serio, este es el bueno.",
        "Vamos, dale una oportunidad.",
        "¿Miedo al compromiso?",
        "¡Este lugar lleva tu nombre!",
        "Vale, una más y ya..."
    ];

    const beerFacts = [
        "¡La cerveza es una de las bebidas más antiguas del mundo, data del 5000 a.C.!",
        "¡La receta más antigua de cerveza tiene más de 4000 años, de la antigua Mesopotamia!",
        "Alemania tiene más de 1500 tipos diferentes de cerveza.",
        "La cenosilicafobia es el miedo a un vaso de cerveza vacío.",
        "En 1814, Londres sufrió la Gran Inundación de Cerveza, ¡liberando más de 323,000 galones!"
    ];

    let beerPlaces = [];
    let lottieAnimation;
    let clickCount = 0;

    // Desactivar el botón hasta que los datos estén cargados
    generateButton.disabled = true;
    generateButton.innerText = 'Cargando...';

    // Cargar Animación Lottie
    loadLottieAnimation();

    // Obtener los datos
    async function loadBeerPlaces() {
        try {
            const response = await fetch('beer_places.json');
            if (!response.ok) {
                throw new Error(`Error HTTP! Estado: ${response.status}`);
            }
            beerPlaces = await response.json();
            // Habilitar el botón
            generateButton.disabled = false;
            generateButton.innerText = '¡Encuentra un garito!';
        } catch (error) {
            console.error('Error al obtener los datos de los bares:', error);
            alert('No se pudo cargar la información. Por favor, inténtalo más tarde.');
            generateButton.innerText = 'No disponible';
            generateButton.disabled = true;
        }
    }

    // Llamar a la función para cargar los datos
    loadBeerPlaces();

    // Evento para el Botón Generar
    generateButton.addEventListener('click', () => {
        findBeerPlace();
    });

    async function findBeerPlace() {
        // Incrementar contador de clics
        clickCount++;

        // Reproducir sonido de cerveza
        beerSound.play().catch(error => {
            console.error('Error al reproducir el sonido:', error);
        });

        // Mostrar animación Lottie y ocultar el contenido actual
        lottieContainer.style.display = 'block';
        const barDetails = resultElement.querySelector('.bar-details');
        if (barDetails) {
            barDetails.remove(); // Eliminamos el contenido anterior
        }

        // Cambiar texto del botón según el número de clics
        if (clickCount <= buttonPhrases.length) {
            generateButton.innerText = buttonPhrases[clickCount - 1];
        } else {
            generateButton.innerText = teasingMessages[(clickCount - buttonPhrases.length - 1) % teasingMessages.length];
        }

        // Reproducir animación desde el inicio
        lottieAnimation.goToAndPlay(0, true);

        // Esperar 2 segundos (simular retraso)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Obtener los valores de los checkboxes
        const filterBars = filterBarsCheckbox.checked;
        const filterCupas = filterCupasCheckbox.checked;
        const filterTienda = filterTiendaCheckbox.checked;
        const filterComida = filterComidaCheckbox.checked;

        // Filtrar los lugares según los filtros seleccionados
        let filteredPlaces = beerPlaces.filter(place => {
            return (
                (place.type === 'bares' && filterBars) ||
                (place.type === 'copas / pubs' && filterCupas) ||
                (place.type === 'tiendas' && filterTienda) ||
                (place.type === 'con comida' && filterComida)
            );
        });

        // Implementar disminución de aleatoriedad
        if (clickCount > 3) {
            // Después de 3 clics, limitar las sugerencias a un subconjunto más pequeño
            const limit = Math.max(1, Math.floor(filteredPlaces.length / clickCount));
            filteredPlaces = filteredPlaces.slice(0, limit);
        }

        // Verificar si hay lugares después de filtrar
        if (filteredPlaces.length === 0) {
            resultElement.innerHTML = '<p>No hay lugares que coincidan con tus filtros.</p>';
            lottieContainer.style.display = 'none';
            generateButton.innerText = 'Prueba a ajustar tus filtros';
            return;
        }

        const randomPlace = filteredPlaces[Math.floor(Math.random() * filteredPlaces.length)];
        const randomFact = beerFacts[Math.floor(Math.random() * beerFacts.length)];

        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(randomPlace.address)}`;
        const whatsappUrl = `https://api.whatsapp.com/send?text=¡Mira este sitio!: ${encodeURIComponent(randomPlace.name)} en ${encodeURIComponent(randomPlace.address)}. Cómo llegar: ${encodeURIComponent(googleMapsUrl)}`;

        // Crear el elemento de detalles del bar
        const barDetailsElement = document.createElement('div');
        barDetailsElement.classList.add('bar-details');

        barDetailsElement.innerHTML = `
            <p class="bar-name"><strong>${randomPlace.name}</strong></p>
            <div class="labels">
                <span class="label neighborhood">${randomPlace.neighborhood}</span>
                <span class="label category">${capitalizeFirstLetter(randomPlace.type)}</span>
            </div>
            <p class="bar-address">
                ${randomPlace.address}
            </p>
            <div class="button-group">
                <a href="${googleMapsUrl}" target="_blank" class="button"><i class="fas fa-map-marker-alt"></i>Cómo llegar</a>
                <a href="${whatsappUrl}" target="_blank" class="button"><i class="fab fa-whatsapp"></i>Compartir</a>
            </div>
        `;

        // Ocultar la animación y mostrar el contenido del bar
        lottieContainer.style.display = 'none';
        resultElement.appendChild(barDetailsElement);

        // Actualizar el dato curioso
        beerFactElement.innerText = `Dato curioso: ${randomFact}`;
    }

    // Cargar Animación Lottie
    function loadLottieAnimation() {
        lottieAnimation = lottie.loadAnimation({
            container: document.getElementById('lottie-animation'),
            renderer: 'svg',
            loop: false,
            autoplay: false,
            path: 'beer.json'
        });

        lottieAnimation.setSpeed(1.5);
    }

    // Función para Capitalizar Cada Palabra
    function capitalizeFirstLetter(string) {
        return string.replace(/\b\w/g, char => char.toUpperCase());
    }
});
