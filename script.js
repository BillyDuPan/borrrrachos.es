document.addEventListener('DOMContentLoaded', () => {
    // Element References
    const beerSound = document.getElementById('beerSound');
    const generateButton = document.getElementById('generateButton');
    const resultElement = document.getElementById('result');
    const beerFactElement = document.getElementById('beerFact');
    const lottieContainer = document.getElementById('lottie-animation');

    // Updated Filter Checkboxes
    const filterBarsCheckbox = document.getElementById('filterBars');
    const filterCupasCheckbox = document.getElementById('filterCupas');
    const filterTiendaCheckbox = document.getElementById('filterTienda');
    const filterComidaCheckbox = document.getElementById('filterComida');

    // Constants and Variables
    const buttonPhrases = ["Let’s Drink Up!", "Beer Me!", "Find My Brew!", "Cheers!", "Hop to It!"];
    const teasingMessages = [
        "Just go already!",
        "Indecisive, aren't we?",
        "This one is perfect for you!",
        "Trust me, you'll love it!",
        "Stop clicking and start drinking!",
        "Seriously, this is the one!",
        "Come on, give it a chance!",
        "Are you afraid of commitment?",
        "This place has your name on it!",
        "Fine, one more try..."
    ];
    const beerFacts = [
        "Beer is one of the oldest drinks in the world, dating back to 5,000 BC!",
        "The oldest known recipe for beer is over 4,000 years old, from ancient Mesopotamia!",
        "Germany has over 1,500 different types of beer.",
        "Cenosillicaphobia is the fear of an empty beer glass.",
        "In 1814, London experienced the Great Beer Flood, releasing over 323,000 gallons of beer."
    ];
    let beerPlaces = [];
    let lottieAnimation;
    let clickCount = 0;

    // Disable the button until data is loaded
    generateButton.disabled = true;
    generateButton.innerText = 'Loading...';

    // Load Lottie Animation
    loadLottieAnimation();

    // Fetch the data
    async function loadBeerPlaces() {
        try {
            const response = await fetch('beer_places.json');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            beerPlaces = await response.json();
            // Enable the button
            generateButton.disabled = false;
            generateButton.innerText = 'Generate Random Beer Spot';
        } catch (error) {
            console.error('Error fetching beer places data:', error);
            alert('Failed to load data. Please try again later.');
            generateButton.innerText = 'Unavailable';
            generateButton.disabled = true;
        }
    }

    // Call the function to load data
    loadBeerPlaces();

    // Event Listener for the Generate Button
    generateButton.addEventListener('click', () => {
        findBeerPlace();
    });

    async function findBeerPlace() {
        // Increment click count
        clickCount++;

        // Play beer sound
        beerSound.play().catch(error => {
            console.error('Error playing sound:', error);
        });

        // Show Lottie animation
        lottieContainer.style.display = 'block';
        lottieAnimation.goToAndPlay(0, true);

        // Change button text based on click count
        if (clickCount <= buttonPhrases.length) {
            generateButton.innerText = buttonPhrases[clickCount - 1];
        } else {
            generateButton.innerText = teasingMessages[(clickCount - buttonPhrases.length - 1) % teasingMessages.length];
        }

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
                (place.type === 'bars' && filterBars) ||
                (place.type === 'cupas / pubs' && filterCupas) ||
                (place.type === 'tienda' && filterTienda) ||
                (place.type === 'con comida' && filterComida)
            );
        });

        // Implement decreasing randomness
        if (clickCount > 3) {
            // After 3 clicks, limit the suggestions to a smaller subset
            const limit = Math.max(1, Math.floor(filteredPlaces.length / clickCount));
            filteredPlaces = filteredPlaces.slice(0, limit);
        }

        // Check if there are any places after filtering
        if (filteredPlaces.length === 0) {
            resultElement.innerHTML = '<p>No places match your filters.</p>';
            lottieContainer.style.display = 'none';
            generateButton.innerText = 'Try Adjusting Your Filters';
            return;
        }

        const randomPlace = filteredPlaces[Math.floor(Math.random() * filteredPlaces.length)];
        const randomFact = beerFacts[Math.floor(Math.random() * beerFacts.length)];

        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(randomPlace.address)}`;
        const whatsappUrl = `https://api.whatsapp.com/send?text=Check%20out%20this%20spot:%20${encodeURIComponent(randomPlace.name)}%20at%20${encodeURIComponent(randomPlace.address)}.%20Get%20directions%20here:%20${encodeURIComponent(googleMapsUrl)}`;

        resultElement.innerHTML = `
            <div class="bar-details">
                <p class="bar-name"><strong>${randomPlace.name}</strong></p>
                <div class="labels">
                    <span class="label neighborhood">${randomPlace.neighborhood}</span>
                    <span class="label category">${capitalizeFirstLetter(randomPlace.type)}</span>
                </div>
                <p class="bar-address">
                    ${randomPlace.address}
                </p>
                <div class="button-group">
                    <a href="${googleMapsUrl}" target="_blank" class="button"><i class="fas fa-map-marker-alt"></i>Directions</a>
                    <a href="${whatsappUrl}" target="_blank" class="button"><i class="fab fa-whatsapp"></i>Share</a>
                </div>
            </div>
        `;

        beerFactElement.innerText = `Fun Fact: ${randomFact}`;

        // Hide Lottie animation
        lottieContainer.style.display = 'none';
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