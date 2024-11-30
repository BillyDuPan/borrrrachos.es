document.addEventListener('DOMContentLoaded', () => {
    // Element References
    const elements = {
        beerSound: document.getElementById('beerSound'),
        generateButton: document.getElementById('generateButton'),
        resultElement: document.getElementById('result'),
        beerFactElement: document.getElementById('beerFact'),
        lottieContainer: document.getElementById('lottie-animation'),
        errorMessageElement: document.getElementById('error-message'),
        instructionModal: document.getElementById('instruction-modal'),
        closeModalButton: document.getElementById('close-modal'),
        // Filter Modal Elements
        openFilterModalButton: document.getElementById('openFilterModal'),
        filterModal: document.getElementById('filter-modal'),
        closeFilterModalButton: document.getElementById('closeFilterModal'),
        applyFiltersButton: document.getElementById('applyFilters'),
        // Filters
        filters: {},
        neighborhoodFilters: {}
    };

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

    // Initialization
    init();

    function init() {
        disableGenerateButton('Cargando...');
        loadLottieAnimation();
        loadBeerPlaces();
        addEventListeners();
        showInstructionModal();
    }

    function disableGenerateButton(text) {
        elements.generateButton.disabled = true;
        elements.generateButton.innerText = text;
    }

    function enableGenerateButton(text) {
        elements.generateButton.disabled = false;
        elements.generateButton.innerText = text;
    }

    async function loadBeerPlaces() {
        try {
            const response = await fetch('beer_places.json');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            beerPlaces = await response.json();
            populateTypeFilters();
            populateNeighborhoodFilters();
            enableGenerateButton('¡Empieza tu aventura!');
            updateErrorMessage();
        } catch (error) {
            console.error('Error loading beer places data:', error);
            alert('No se pudo cargar la información. Por favor, inténtalo más tarde.');
            disableGenerateButton('No disponible');
        }
    }

    function loadLottieAnimation() {
        lottieAnimation = lottie.loadAnimation({
            container: elements.lottieContainer,
            renderer: 'svg',
            loop: false,
            autoplay: false,
            path: 'beer.json'
        });
        lottieAnimation.setSpeed(1.5);
    }

    function addEventListeners() {
        // Generate Button
        elements.generateButton.addEventListener('click', handleGenerateButtonClick);

        // Open Filter Modal Button
        elements.openFilterModalButton.addEventListener('click', showFilterModal);

        // Close Filter Modal Button
        elements.closeFilterModalButton.addEventListener('click', hideFilterModal);

        // Apply Filters Button
        elements.applyFiltersButton.addEventListener('click', () => {
            hideFilterModal();
            updateErrorMessage();
        });

        // Modal Close Button
        elements.closeModalButton.addEventListener('click', hideInstructionModal);

        // Modal Outside Click
        window.addEventListener('click', (event) => {
            if (event.target === elements.instructionModal) {
                hideInstructionModal();
            }
            if (event.target === elements.filterModal) {
                hideFilterModal();
            }
        });
    }

    async function handleGenerateButtonClick() {
        if (areAllFiltersUnchecked()) {
            displayErrorMessage('No has seleccionado ningún filtro. Por favor, elige al menos uno.');
            disableGenerateButton('Selecciona filtros');
            return;
        } else {
            clearErrorMessage();
            enableGenerateButton(getButtonText());
        }

        clickCount++;
        playBeerSound();
        showLoadingState();
        updateButtonText();

        await delay(2000); // Simulate loading delay

        const filteredPlaces = getFilteredPlaces();

        if (filteredPlaces.length === 0) {
            displayErrorMessage('No hay lugares que coincidan con tus filtros.');
            hideLoadingState();
            elements.generateButton.innerText = 'Prueba a ajustar tus filtros';
            return;
        }

        const randomPlace = getRandomItem(filteredPlaces);
        const randomFact = getRandomItem(beerFacts);

        displayResult(randomPlace, randomFact);
    }

    function playBeerSound() {
        elements.beerSound.play().catch(error => {
            console.error('Error playing sound:', error);
        });
    }

    function showLoadingState() {
        elements.lottieContainer.style.display = 'block';
        clearResult();
        lottieAnimation.goToAndPlay(0, true);
    }

    function hideLoadingState() {
        elements.lottieContainer.style.display = 'none';
    }

    function updateButtonText() {
        elements.generateButton.innerText = getButtonText();
    }

    function getButtonText() {
        if (clickCount === 0) {
            return '¡Empieza tu aventura!';
        } else if (clickCount <= buttonPhrases.length) {
            return buttonPhrases[clickCount - 1];
        } else {
            const index = (clickCount - buttonPhrases.length - 1) % teasingMessages.length;
            return teasingMessages[index];
        }
    }

    function getFilteredPlaces() {
        const selectedTypes = Object.keys(elements.filters).filter(key => elements.filters[key].checked);
        const selectedNeighborhoods = Object.keys(elements.neighborhoodFilters).filter(key => elements.neighborhoodFilters[key].checked);

        return beerPlaces.filter(place => {
            const matchesType = selectedTypes.includes(place.type);
            const matchesNeighborhood = selectedNeighborhoods.includes(place.neighborhood);
            return matchesType && matchesNeighborhood;
        });
    }

    function displayResult(place, fact) {
        hideLoadingState();

        const barDetailsElement = createBarDetailsElement(place);
        elements.resultElement.appendChild(barDetailsElement);

        elements.beerFactElement.innerText = `Dato curioso: ${fact}`;
    }

    function createBarDetailsElement(place) {
        const barDetailsElement = document.createElement('div');
        barDetailsElement.classList.add('bar-details');

        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name} ${place.address}`)}`;
        const whatsappUrl = `https://api.whatsapp.com/send?text=¡Mira%20este%20sitio!:%20${encodeURIComponent(place.name)}%20en%20${encodeURIComponent(place.address)}.%20Cómo%20llegar:%20${encodeURIComponent(googleMapsUrl)}`;

        barDetailsElement.innerHTML = `
            <p class="bar-name"><strong>${place.name}</strong></p>
            <div class="labels">
                <span class="label neighborhood">📍 ${place.neighborhood}</span>
                <span class="label category">${capitalizeFirstLetter(place.type)}</span>
            </div>
            <p class="bar-address">
                ${place.address}
            </p>
            <div class="button-group">
                <a href="${googleMapsUrl}" target="_blank" class="button"><i class="fas fa-map-marker-alt"></i>Cómo llegar</a>
                <a href="${whatsappUrl}" target="_blank" class="button"><i class="fab fa-whatsapp"></i>Compartir</a>
            </div>
        `;
        return barDetailsElement;
    }

    function clearResult() {
        const barDetails = elements.resultElement.querySelector('.bar-details');
        if (barDetails) {
            barDetails.remove();
        }
    }

    function areAllFiltersUnchecked() {
        const typeFiltersUnchecked = !Object.values(elements.filters).some(filter => filter.checked);
        const neighborhoodFiltersUnchecked = !Object.values(elements.neighborhoodFilters).some(filter => filter.checked);
        return typeFiltersUnchecked || neighborhoodFiltersUnchecked;
    }

    function updateErrorMessage() {
        if (areAllFiltersUnchecked()) {
            displayErrorMessage('No has seleccionado ningún filtro. Por favor, elige al menos uno.');
            disableGenerateButton('Selecciona filtros');
        } else {
            clearErrorMessage();
            enableGenerateButton(getButtonText());
        }
    }

    function displayErrorMessage(message) {
        elements.errorMessageElement.innerHTML = `<p>${message}</p>`;
    }

    function clearErrorMessage() {
        elements.errorMessageElement.innerHTML = '';
    }

    function showInstructionModal() {
        elements.instructionModal.style.display = 'grid';
        document.body.style.overflow = 'hidden';
    }

    function hideInstructionModal() {
        elements.instructionModal.style.display = 'none';
        document.body.style.overflow = '';
    }

    function showFilterModal() {
        elements.filterModal.style.display = 'grid'; // Use 'grid' to align content
        document.body.style.overflow = 'hidden';
    }

    function hideFilterModal() {
        elements.filterModal.style.display = 'none';
        document.body.style.overflow = '';
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function getRandomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    function capitalizeFirstLetter(string) {
        return string.replace(/\b\w/g, char => char.toUpperCase());
    }

    function populateTypeFilters() {
        const typeFiltersContainer = document.getElementById('type-filters');
        const types = [...new Set(beerPlaces.map(place => place.type))];

        types.forEach(type => {
            const checkboxId = `filter${type.replace(/[^a-zA-Z0-9]/g, '')}`;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = checkboxId;
            checkbox.checked = true; // Set to checked by default
            checkbox.hidden = true;

            const label = document.createElement('label');
            label.classList.add('chip');
            label.htmlFor = checkboxId;
            label.textContent = type;

            typeFiltersContainer.appendChild(checkbox);
            typeFiltersContainer.appendChild(label);

            elements.filters[type] = checkbox;

            checkbox.addEventListener('change', updateErrorMessage);
        });
    }

    function populateNeighborhoodFilters() {
        const neighborhoodFiltersContainer = document.getElementById('neighborhood-filters');
        const neighborhoods = [...new Set(beerPlaces.map(place => place.neighborhood))];

        neighborhoods.forEach(neighborhood => {
            const checkboxId = `filter${neighborhood.replace(/[^a-zA-Z0-9]/g, '')}`;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = checkboxId;
            checkbox.checked = true; // Set to checked by default
            checkbox.hidden = true;

            const label = document.createElement('label');
            label.classList.add('chip');
            label.htmlFor = checkboxId;
            label.textContent = neighborhood;

            neighborhoodFiltersContainer.appendChild(checkbox);
            neighborhoodFiltersContainer.appendChild(label);

            elements.neighborhoodFilters[neighborhood] = checkbox;

            checkbox.addEventListener('change', updateErrorMessage);
        });
    }
});
