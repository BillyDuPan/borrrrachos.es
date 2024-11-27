document.addEventListener('DOMContentLoaded', () => {
    // Element References
    const beerSound = document.getElementById('beerSound');
    const generateButton = document.getElementById('generateButton');
    const resultElement = document.getElementById('result');
    const beerFactElement = document.getElementById('beerFact');
    const lottieContainer = document.getElementById('lottie-animation');
    const errorMessageElement = document.getElementById('error-message'); // New error message element

    // Updated Filter Checkboxes
    const filterBarsCheckbox = document.getElementById('filterBars');
    const filterCupasCheckbox = document.getElementById('filterCupas');
    const filterTiendaCheckbox = document.getElementById('filterTienda');
    const filterComidaCheckbox = document.getElementById('filterComida');

    // Constants and Variables
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

    // Disable the button until data is loaded
    generateButton.disabled = true;
    generateButton.innerText = 'Cargando...';

    // Load Lottie Animation
    loadLottieAnimation();

    // Fetch the data
    async function loadBeerPlaces() {
        try {
            const response = await fetch('beer_places.json');
            if (!response.ok) {
                throw new Error(`Error HTTP! Estado: ${response.status}`);
            }
            beerPlaces = await response.json();
            // Enable the button
            generateButton.disabled = false;
            generateButton.innerText = '¡Encuentra un garito!';
        } catch (error) {
            console.error('Error al obtener los datos de los bares:', error);
            alert('No se pudo cargar la información. Por favor, inténtalo más tarde.');
            generateButton.innerText = 'No disponible';
            generateButton.disabled = true;
        }
    }

    // Call the function to load data
    loadBeerPlaces();

    // Event Listener for the Generate Button
    generateButton.addEventListener('click', () => {
        findBeerPlace();
    });

    // Add event listeners to the filter checkboxes
    filterBarsCheckbox.addEventListener('change', updateErrorMessage);
    filterCupasCheckbox.addEventListener('change', updateErrorMessage);
    filterTiendaCheckbox.addEventListener('change', updateErrorMessage);
    filterComidaCheckbox.addEventListener('change', updateErrorMessage);

    // Call updateErrorMessage on page load
    updateErrorMessage();

    async function findBeerPlace() {
        if (areAllFiltersUnchecked()) {
            errorMessageElement.innerHTML = '<p>No has seleccionado ningún filtro. Por favor, elige al menos uno.</p>';
            generateButton.disabled = true;
            return;
        } else {
            errorMessageElement.innerHTML = '';
            generateButton.disabled = false;
        }

        // Increment click count
        clickCount++;

        // Play beer sound
        beerSound.play().catch(error => {
            console.error('Error al reproducir el sonido:', error);
        });

        // Show Lottie animation and remove current content
        lottieContainer.style.display = 'block';
        const barDetails = resultElement.querySelector('.bar-details');
        if (barDetails) {
            barDetails.remove();
        }

        // Change button text based on click count
        if (clickCount <= buttonPhrases.length) {
            generateButton.innerText = buttonPhrases[clickCount - 1];
        } else {
            generateButton.innerText = teasingMessages[(clickCount - buttonPhrases.length - 1) % teasingMessages.length];
        }

        // Play animation from start
        lottieAnimation.goToAndPlay(0, true);

        // Wait for 2 seconds (simulate delay)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Get the values of the checkboxes
        const filterBars = filterBarsCheckbox.checked;
        const filterCupas = filterCupasCheckbox.checked;
        const filterTienda = filterTiendaCheckbox.checked;
        const filterComida = filterComidaCheckbox.checked;

        // Filter the places based on the selected filters
        let filteredPlaces = beerPlaces.filter(place => {
            return (
                (place.type === 'bares' && filterBars) ||
                (place.type === 'copas / pubs' && filterCupas) ||
                (place.type === 'tiendas' && filterTienda) ||
                (place.type === 'con comida' && filterComida)
            );
        });

        // Implement decreasing randomness
        if (clickCount > 3) {
            // After 3 clicks, limit suggestions to a smaller subset
            const limit = Math.max(1, Math.floor(filteredPlaces.length / clickCount));
            filteredPlaces = filteredPlaces.slice(0, limit);
        }

        // Check if there are any places after filtering
        if (filteredPlaces.length === 0) {
            errorMessageElement.innerHTML = '<p>No hay lugares que coincidan con tus filtros.</p>';
            lottieContainer.style.display = 'none';
            generateButton.innerText = 'Prueba a ajustar tus filtros';
            return;
        } else {
            errorMessageElement.innerHTML = ''; // Clear any existing error message
        }

        const randomPlace = filteredPlaces[Math.floor(Math.random() * filteredPlaces.length)];
        const randomFact = beerFacts[Math.floor(Math.random() * beerFacts.length)];

        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(randomPlace.address)}`;
        const whatsappUrl = `https://api.whatsapp.com/send?text=¡Mira este sitio!: ${encodeURIComponent(randomPlace.name)} en ${encodeURIComponent(randomPlace.address)}. Cómo llegar: ${encodeURIComponent(googleMapsUrl)}`;

        // Create the bar details element
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

        // Hide the animation and display the bar content
        lottieContainer.style.display = 'none';
        resultElement.appendChild(barDetailsElement);

        // Update the beer fact
        beerFactElement.innerText = `Dato curioso: ${randomFact}`;
    }

    // Function to check if all filters are unchecked
    function areAllFiltersUnchecked() {
        return !filterBarsCheckbox.checked &&
               !filterCupasCheckbox.checked &&
               !filterTiendaCheckbox.checked &&
               !filterComidaCheckbox.checked;
    }

    // Function to update error message based on filter states
    function updateErrorMessage() {
        if (areAllFiltersUnchecked()) {
            errorMessageElement.innerHTML = '<p>No has seleccionado ningún filtro. Por favor, elige al menos uno.</p>';
            generateButton.disabled = true;
        } else {
            errorMessageElement.innerHTML = ''; // Clear any existing error message
            generateButton.disabled = false;
        }
    }

    // Load Lottie Animation
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

    // Helper Function to Capitalize Each Word
    function capitalizeFirstLetter(string) {
        return string.replace(/\b\w/g, char => char.toUpperCase());
    }
});
