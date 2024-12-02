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
        // Add showClosedToggle to elements
        showClosedToggle: document.getElementById('showClosedToggle'),
        // Filters
        filters: {},
        neighborhoodFilters: {}
    };

    // Constants and Variables
    const buttonPhrases = [
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

    const beerFacts = [
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

        // Toggle for Showing Closed Places
        elements.showClosedToggle.addEventListener('change', updateErrorMessage);
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

        await delay(750); // Simulate loading delay

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
        const includeClosed = elements.showClosedToggle.checked;
    
        return beerPlaces.filter(place => {
            const matchesType = selectedTypes.includes(place.type);
            const matchesNeighborhood = selectedNeighborhoods.includes(place.neighborhood);
            const isOpen = isPlaceOpenNow(place);
            return matchesType && matchesNeighborhood && (isOpen || includeClosed);
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
                <a href="${googleMapsUrl}" target="_blank" class="button"><i class="fas fa-map-marker-alt"></i>Cómo llegar</a>
                <a href="${whatsappUrl}" target="_blank" class="button"><i class="fab fa-whatsapp"></i>Compartir</a>
            </div>
        `;
        return barDetailsElement;
    }

    function isPlaceOpenNow(place) {
        // Get current time in Barcelona, Spain
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
    
        // Clean up time strings
        let cleanedHours = hoursToday;
        // Replace all whitespace characters with a single space
        cleanedHours = cleanedHours.replace(/\s+/g, ' ').trim();
        // Replace various dashes with a standard hyphen
        cleanedHours = cleanedHours.replace(/[–—−‑]/g, '-');
        // Remove any spaces around the dash
        cleanedHours = cleanedHours.replace(/\s*-\s*/, '-');
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
            // Close time is after midnight
            if (currentTime >= openTime || currentTime < closeTime) {
                return true;
            }
        } else {
            if (currentTime >= openTime && currentTime < closeTime) {
                return true;
            }
        }
        return false;
    }
    
    function parseTimeString(timeStr) {
        if (!timeStr) {
            console.error('Time string is undefined or null');
            return null;
        }
        // Replace all whitespace characters with a single space
        timeStr = timeStr.replace(/\s+/g, ' ').trim();
        // Ensure there's a space before AM/PM
        timeStr = timeStr.replace(/(AM|PM)/i, ' $1').trim();
        // Parse the time string
        const timeParts = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (!timeParts) {
            console.error(`Invalid time string: ${timeStr}`);
            return null;
        }
        let hours = parseInt(timeParts[1]);
        const minutes = parseInt(timeParts[2]);
        const ampm = timeParts[3].toUpperCase();
        if (ampm === 'PM' && hours < 12) {
            hours += 12;
        }
        if (ampm === 'AM' && hours === 12) {
            hours = 0;
        }
        return hours * 60 + minutes;
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
