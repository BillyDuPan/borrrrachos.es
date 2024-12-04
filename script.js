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
        applyFiltersButton: document.getElementById('applyFilters'),
        // Toggle for Showing Closed Places
        showClosedToggle: document.getElementById('showClosedToggle'),
        // Filters
        filters: {},
        neighborhoodFilters: {}
    };

    // Constants
    const BUTTON_PHRASES = [
        "Dame otra",
        "Una más",
        "¡Next!",
        "Otro",
        "Veremos",
        "Prueba otra",
        "Enséñame más",
        "¿Qué más hay?",
        "No está mal",
        "Continúa",
        "Más opciones"
    ];

    const TEASING_MESSAGES = [
        "¡Venga, ve ya!",
        "¿No te decides, eh?",
        "¡Este es perfecto para ti!",
        "Confía, te va a encantar.",
        "¡Deja de hacer clic y empieza a beber!",
        "En serio, este es el bueno.",
        "Vamos, dale una oportunidad.",
        "¿Miedo al compromiso?",
        "¡Este lugar lleva tu nombre!",
        "Vale, una más y ya...",
        "¿Cuántas veces más vas a hacer clic?",
        "El siguiente eres tú.",
        "¿Buscando el bar perfecto?",
        "¡Ni que fueras tan exigente!",
        "En algún momento tendrás que elegir.",
        "Podrías estar bebiendo ya...",
        "Este sí que sí.",
        "¡No seas indeciso!",
        "¿Te decides o seguimos toda la noche?",
        "Deja el móvil y agarra una cerveza."
    ];

    const BEER_FACTS = [
        "¡La cerveza es una de las bebidas más antiguas del mundo, data del 5000 a.C.!",
        "La receta más antigua de cerveza tiene más de 4000 años, de la antigua Mesopotamia.",
        "Alemania tiene más de 1,500 tipos diferentes de cerveza.",
        "La cenosilicafobia es el miedo a un vaso de cerveza vacío.",
        "En 1814, Londres sufrió la Gran Inundación de Cerveza, ¡liberando más de 1 millón de litros!",
        "La cerveza más fuerte del mundo tiene un 67.5% de alcohol.",
        "En la Edad Media, la cerveza se consumía diariamente porque el agua no era segura.",
        "La Oktoberfest de Múnich comenzó en 1810 como una celebración de una boda real.",
        "Los antiguos egipcios pagaban a los trabajadores con cerveza.",
        "La palabra 'cerveza' proviene del latín 'cerevisia'.",
        "¿Sabías que Cervezabeer.es es tu mejor aliado para descubrir nuevos lugares?",
        "Esta app fue creada para aventureros cerveceros como tú.",
        "No importa cuántas veces hagas clic, siempre hay un bar esperándote.",
        "Cervezabeer.es es tu guía al azar en el mundo de las cervezas.",
        "En la antigua Babilonia, si una cerveza era mala, el cervecero podía ser ahogado en ella.",
        "La cerveza es la tercera bebida más popular del mundo después del agua y el té.",
        "La espuma en la cerveza ayuda a evitar que se oxide al mantener el oxígeno alejado.",
        "En Japón, existe cerveza de arroz hecha con hongos koji.",
        "Los monjes trapenses de Bélgica elaboran cerveza para financiar su monasterio."
    ];

    // Variables
    let beerPlaces = [];
    let lottieAnimation;
    let clickCount = 0;

    // Initialization
    init();

    /**
     * Initializes the application by setting up necessary components.
     */
    function init() {
        disableGenerateButton('Cargando...');
        loadLottieAnimation();
        loadBeerPlaces();
        addEventListeners();
        showInstructionModal();
    }

    /**
     * Disables the generate button and sets its text.
     * @param {string} text - The text to display on the button.
     */
    function disableGenerateButton(text) {
        elements.generateButton.disabled = true;
        elements.generateButton.innerText = text;
    }

    /**
     * Enables the generate button and sets its text.
     * @param {string} text - The text to display on the button.
     */
    function enableGenerateButton(text) {
        elements.generateButton.disabled = false;
        elements.generateButton.innerText = text;
    }

    /**
     * Loads beer places data from a JSON file.
     */
    async function loadBeerPlaces() {
        try {
            const response = await fetch('beer_places.json');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();

            beerPlaces = data.map(place => ({
                name: place['Name'],
                type: place['Nom_Activitat'],
                address: place['Ggl Adress'],
                neighborhood: place['Bario'],
                googleLink: place['Google Link'],
                openingHours: {
                    Monday: place['Monday'],
                    Tuesday: place['Tuesday'],
                    Wednesday: place['Wednesday'],
                    Thursday: place['Thursday'],
                    Friday: place['Friday'],
                    Saturday: place['Saturday'],
                    Sunday: place['Sunday']
                }
            }));

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

    /**
     * Loads the Lottie animation.
     */
    function loadLottieAnimation() {
        lottieAnimation = lottie.loadAnimation({
            container: elements.lottieContainer,
            renderer: 'svg',
            loop: false,
            autoplay: false,
            path: 'beer.json'
        });
        lottieAnimation.setSpeed(2.5);
    }

    /**
     * Adds all necessary event listeners.
     */
    function addEventListeners() {
        elements.generateButton.addEventListener('click', debounce(handleGenerateButtonClick, 400));
        elements.openFilterModalButton.addEventListener('click', showFilterModal);
        elements.applyFiltersButton.addEventListener('click', () => {
            hideFilterModal();
            updateErrorMessage();
        });
        elements.closeModalButton.addEventListener('click', hideInstructionModal);
        window.addEventListener('click', handleWindowClick);
        elements.showClosedToggle.addEventListener('change', updateErrorMessage);
    }

    /**
     * Handles clicks outside modals to close them.
     * @param {Event} event - The click event.
     */
    function handleWindowClick(event) {
        if (event.target === elements.instructionModal) {
            hideInstructionModal();
        }
        if (event.target === elements.filterModal) {
            hideFilterModal();
        }
    }

    /**
     * Handles the generate button click event.
     */
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

        await delay(400); // Simulate loading delay

        const filteredPlaces = getFilteredPlaces();

        if (filteredPlaces.length === 0) {
            displayErrorMessage('No hay lugares que coincidan con tus filtros.');
            hideLoadingState();
            elements.generateButton.innerText = 'Prueba a ajustar tus filtros';
            return;
        }

        const randomPlace = getRandomItem(filteredPlaces);
        const randomFact = getRandomItem(BEER_FACTS);

        displayResult(randomPlace, randomFact);
    }

    /**
     * Plays the beer sound.
     */
    function playBeerSound() {
        elements.beerSound.play().catch(error => {
            console.error('Error playing sound:', error);
        });
    }

    /**
     * Shows the loading state with animation.
     */
    function showLoadingState() {
        elements.lottieContainer.style.display = 'block';
        clearResult();
        lottieAnimation.goToAndPlay(0, true);
    }

    /**
     * Hides the loading state.
     */
    function hideLoadingState() {
        elements.lottieContainer.style.display = 'none';
    }

    /**
     * Updates the generate button text based on click count.
     */
    function updateButtonText() {
        elements.generateButton.innerText = getButtonText();
    }

    /**
     * Determines the button text based on the number of clicks.
     * @returns {string} - The text to display on the button.
     */
    function getButtonText() {
        if (clickCount === 0) {
            return '¡Empieza tu aventura!';
        } else if (clickCount <= BUTTON_PHRASES.length) {
            return BUTTON_PHRASES[clickCount - 1];
        } else {
            const index = (clickCount - BUTTON_PHRASES.length - 1) % TEASING_MESSAGES.length;
            return TEASING_MESSAGES[index];
        }
    }

    /**
     * Retrieves the list of places filtered by selected criteria.
     * @returns {Array} - The filtered list of beer places.
     */
    function getFilteredPlaces() {
        const selectedTypes = Object.keys(elements.filters).filter(key => elements.filters[key].checked);
        const selectedNeighborhoods = Object.keys(elements.neighborhoodFilters).filter(key => elements.neighborhoodFilters[key].checked);
        const includeClosed = elements.showClosedToggle.checked;

        return beerPlaces.filter(place => {
            const matchesType = selectedTypes.includes(place.type);
            const matchesNeighborhood = selectedNeighborhoods.includes(place.neighborhood);
            const isOpen = isPlaceOpenNow(place);
            return matchesType && matchesNeighborhood && (isOpen || includeClosed);
        });
    }

    /**
     * Displays the result with place details and a beer fact.
     * @param {Object} place - The selected beer place.
     * @param {string} fact - The random beer fact.
     */
    function displayResult(place, fact) {
        hideLoadingState();

        const barDetailsElement = createBarDetailsElement(place);
        elements.resultElement.appendChild(barDetailsElement);

        elements.beerFactElement.innerText = `Dato curioso: ${fact}`;
    }

    /**
     * Creates the DOM element containing the bar details.
     * @param {Object} place - The beer place details.
     * @returns {HTMLElement} - The bar details element.
     */
    function createBarDetailsElement(place) {
        const barDetailsElement = document.createElement('div');
        barDetailsElement.classList.add('bar-details');

        const isOpen = isPlaceOpenNow(place);
        const openStatusLabel = isOpen ? 'Abierto' : 'Cerrado';

        const statusChip = document.createElement('span');
        statusChip.classList.add('status-chip', isOpen ? 'open' : 'closed');
        statusChip.textContent = openStatusLabel;

        barDetailsElement.appendChild(statusChip);

        const googleMapsUrl = place.googleLink;
        const whatsappUrl = `https://api.whatsapp.com/send?text=¡Mira%20este%20sitio!:%20${encodeURIComponent(place.name)}%20en%20${encodeURIComponent(place.address)}.%20Cómo%20llegar:%20${encodeURIComponent(googleMapsUrl)}`;

        barDetailsElement.innerHTML += `
            <p class="bar-name"><strong>${place.name}</strong></p>
            <div class="labels">
                <span class="label neighborhood">📍 ${place.neighborhood}</span>
                <span class="label category">${capitalizeFirstLetter(place.type)}</span>
            </div>
            <p class="bar-address">
                ${place.address}
            </p>
            <div class="button-group">
                <a href="#" class="button map-button"><i class="fas fa-map-marker-alt"></i>Cómo llegar</a>
                <a href="${whatsappUrl}" target="_blank" class="button"><i class="fab fa-whatsapp"></i>Compartir</a>
            </div>
        `;

        // Add event listener for "Cómo llegar" button
        const mapButton = barDetailsElement.querySelector('.map-button');
        mapButton.addEventListener('click', (e) => {
            e.preventDefault();
            openGoogleMapsLink(googleMapsUrl);
        });

        return barDetailsElement;
    }

    /**
     * Determines if a place is currently open based on its opening hours.
     * @param {Object} place - The beer place details.
     * @returns {boolean} - True if open, false otherwise.
     */
    function isPlaceOpenNow(place) {
        const options = {
            timeZone: 'Europe/Madrid',
            hour12: false,
            weekday: 'long',
            hour: 'numeric',
            minute: 'numeric'
        };
        const formatter = new Intl.DateTimeFormat('en-US', options);
        const parts = formatter.formatToParts(new Date());
        let currentDayName = '';
        let currentHour = 0;
        let currentMinute = 0;

        parts.forEach(part => {
            if (part.type === 'weekday') {
                currentDayName = part.value;
            }
            if (part.type === 'hour') {
                currentHour = parseInt(part.value);
            }
            if (part.type === 'minute') {
                currentMinute = parseInt(part.value);
            }
        });

        const currentTime = currentHour * 60 + currentMinute;
        const hoursToday = place.openingHours[currentDayName];

        if (!hoursToday || hoursToday.toLowerCase().includes('closed')) {
            return false;
        }

        // Clean and split the time strings
        let cleanedHours = hoursToday.replace(/\s+/g, ' ').trim()
                                     .replace(/[–—−‑]/g, '-')
                                     .replace(/\s*-\s*/, '-');
        const [openTimeStr, closeTimeStr] = cleanedHours.split('-').map(s => s.trim());

        if (!openTimeStr || !closeTimeStr) {
            console.error(`Could not split opening hours for ${place.name}: ${hoursToday}`);
            return false;
        }

        const openTime = parseTimeString(openTimeStr);
        const closeTime = parseTimeString(closeTimeStr);

        if (openTime === null || closeTime === null) {
            console.error(`Invalid time format for ${place.name}: ${hoursToday}`);
            return false;
        }

        // Adjust for places that close after midnight
        if (closeTime < openTime) {
            return currentTime >= openTime || currentTime < closeTime;
        } else {
            return currentTime >= openTime && currentTime < closeTime;
        }
    }

    /**
     * Parses a time string into minutes since midnight.
     * @param {string} timeStr - The time string (e.g., "10:00 AM").
     * @returns {number|null} - The time in minutes or null if invalid.
     */
    function parseTimeString(timeStr) {
        if (!timeStr) {
            console.error('Time string is undefined or null');
            return null;
        }

        timeStr = timeStr.replace(/\s+/g, ' ').trim().replace(/(AM|PM)/i, ' $1').trim();
        const timeParts = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);

        if (!timeParts) {
            console.error(`Invalid time string: ${timeStr}`);
            return null;
        }

        let hours = parseInt(timeParts[1], 10);
        const minutes = parseInt(timeParts[2], 10);
        const ampm = timeParts[3].toUpperCase();

        if (ampm === 'PM' && hours < 12) {
            hours += 12;
        }
        if (ampm === 'AM' && hours === 12) {
            hours = 0;
        }

        return hours * 60 + minutes;
    }

    /**
     * Clears the previous result from the DOM.
     */
    function clearResult() {
        const barDetails = elements.resultElement.querySelector('.bar-details');
        if (barDetails) {
            barDetails.remove();
        }

        // Remove "¿Cómo funciona?" link if it exists
        const comoFunctionaLink = document.getElementById('comoFunctionaLink');
        if (comoFunctionaLink) {
            comoFunctionaLink.remove();
        }
    }

    /**
     * Checks if all filters are unchecked.
     * @returns {boolean} - True if all filters are unchecked, false otherwise.
     */
    function areAllFiltersUnchecked() {
        const typeFiltersUnchecked = !Object.values(elements.filters).some(filter => filter.checked);
        const neighborhoodFiltersUnchecked = !Object.values(elements.neighborhoodFilters).some(filter => filter.checked);
        return typeFiltersUnchecked || neighborhoodFiltersUnchecked;
    }

    /**
     * Updates the error message based on filter selection.
     */
    function updateErrorMessage() {
        if (areAllFiltersUnchecked()) {
            displayErrorMessage('No has seleccionado ningún filtro. Por favor, elige al menos uno.');
            disableGenerateButton('Selecciona filtros');
        } else {
            clearErrorMessage();
            enableGenerateButton(getButtonText());
        }
    }

    /**
     * Displays an error message.
     * @param {string} message - The error message to display.
     */
    function displayErrorMessage(message) {
        elements.errorMessageElement.innerHTML = `<p>${message}</p>`;
    }

    /**
     * Clears the error message.
     */
    function clearErrorMessage() {
        elements.errorMessageElement.innerHTML = '';
    }

    /**
     * Shows the instruction modal.
     */
    function showInstructionModal() {
        elements.instructionModal.style.display = 'grid';
        document.body.style.overflow = 'hidden';
    }

    /**
     * Hides the instruction modal and adds the "¿Cómo funciona?" link.
     */
    function hideInstructionModal() {
        elements.instructionModal.style.display = 'none';
        document.body.style.overflow = '';

        // Check if 'comoFunctionaLink' exists
        if (!document.getElementById('comoFunctionaLink')) {
            const link = document.createElement('a');
            link.href = '#';
            link.id = 'comoFunctionaLink';
            link.textContent = '¿Cómo funciona?';
            link.classList.add('como-funciona-link');

            // Add click listener to reopen the instruction modal
            link.addEventListener('click', (e) => {
                e.preventDefault();
                showInstructionModal();
                link.remove();
            });

            // Append the link to the result element
            elements.resultElement.appendChild(link);

            // Reset the Lottie animation
            lottieAnimation.goToAndStop(0, true);
            elements.lottieContainer.style.display = 'block';
            link.insertAdjacentElement('afterend', elements.lottieContainer);
        }
    }

    /**
     * Shows the filter modal.
     */
    function showFilterModal() {
        elements.filterModal.style.display = 'grid';
        document.body.style.overflow = 'hidden';
    }

    /**
     * Hides the filter modal.
     */
    function hideFilterModal() {
        elements.filterModal.style.display = 'none';
        document.body.style.overflow = '';
    }

    /**
     * Returns a promise that resolves after a specified delay.
     * @param {number} ms - The delay in milliseconds.
     * @returns {Promise}
     */
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Retrieves a random item from an array.
     * @param {Array} array - The array to select from.
     * @returns {*} - A random item from the array.
     */
    function getRandomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
     * Capitalizes the first letter of each word in a string.
     * @param {string} string - The string to capitalize.
     * @returns {string} - The capitalized string.
     */
    function capitalizeFirstLetter(string) {
        return string.replace(/\b\w/g, char => char.toUpperCase());
    }

    /**
     * Populates the type filters based on beer places data.
     */
    function populateTypeFilters() {
        const typeFiltersContainer = document.getElementById('type-filters');
        const types = [...new Set(beerPlaces.map(place => place.type))];

        types.forEach(type => {
            const checkboxId = `filter${type.replace(/[^a-zA-Z0-9]/g, '')}`;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = checkboxId;
            checkbox.checked = true;
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

    /**
     * Populates the neighborhood filters based on beer places data.
     */
    function populateNeighborhoodFilters() {
        const neighborhoodFiltersContainer = document.getElementById('neighborhood-filters');
        const neighborhoods = [...new Set(beerPlaces.map(place => place.neighborhood))];

        neighborhoods.forEach(neighborhood => {
            const checkboxId = `filter${neighborhood.replace(/[^a-zA-Z0-9]/g, '')}`;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = checkboxId;
            checkbox.checked = true;
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

    /**
     * Detects if the user's device is Android.
     * @returns {boolean} - True if Android, false otherwise.
     */
    function isAndroid() {
        return /Android/i.test(navigator.userAgent);
    }

    /**
     * Detects if the user's device is iOS.
     * @returns {boolean} - True if iOS, false otherwise.
     */
    function isIOS() {
        return /iPhone|iPad|iPod/i.test(navigator.userAgent);
    }

    /**
     * Opens the Google Maps link appropriately based on the user's device.
     * @param {string} url - The Google Maps URL to open.
     */
    function openGoogleMapsLink(url) {
        if (isAndroid()) {
            const intentUrl = `intent://maps.google.com/maps?${new URLSearchParams({
                q: decodeURIComponent(url.split('query=')[1])
            }).toString()}#Intent;scheme=https;package=com.google.android.apps.maps;end`;
            window.location = intentUrl;
        } else if (isIOS()) {
            const appUrl = `comgooglemaps://?q=${encodeURIComponent(url.split('query=')[1])}`;
            window.location = appUrl;
            setTimeout(() => {
                window.open(url, '_blank');
            }, 500);
        } else {
            window.open(url, '_blank');
        }
    }

        /**
     * Debounces a function by the specified delay.
     * @param {Function} func - The function to debounce.
     * @param {number} delayMs - The delay in milliseconds.
     * @returns {Function} - The debounced function.
     */
    function debounce(func, delayMs) {
        let timeoutId;
        return function(...args) {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delayMs);
        };
    }
});
