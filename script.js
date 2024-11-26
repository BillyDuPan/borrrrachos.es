document.addEventListener('DOMContentLoaded', () => {
    // Element References
    const fizzElement = document.getElementById('fizz');
    const beerSound = document.getElementById('beerSound');
    const generateButton = document.getElementById('generateButton');
    const resultElement = document.getElementById('result');
    const beerFactElement = document.getElementById('beerFact');
    const badgesElement = document.getElementById('badges');
    const filterBarCheckbox = document.getElementById('filterBar');
    const filterBreweryCheckbox = document.getElementById('filterBrewery');
    const filterCraftBeerCheckbox = document.getElementById('filterCraftBeer');

    // Constants and Variables
    const buttonPhrases = ["Let’s Drink Up!", "Beer Me!", "Find My Brew!", "Cheers!", "Hop to It!"];
    const beerFacts = [
        "Beer is one of the oldest drinks in the world, dating back to 5,000 BC!",
        "The oldest known recipe for beer is over 4,000 years old, from ancient Mesopotamia!",
        "Germany has over 1,500 different types of beer.",
        "Cenosillicaphobia is the fear of an empty beer glass.",
        "In 1814, London experienced the Great Beer Flood, releasing over 323,000 gallons of beer."
    ];
    let beerPlaces = []; // This will hold the data from the JSON file
    let achievements = []; // To track user achievements

    // Disable the button until data is loaded
    generateButton.disabled = true;
    generateButton.innerText = 'Loading...';

    // Load Lottie Animation
    let lottieAnimation;
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
        }
    }

    // Call the function to load data
    loadBeerPlaces();

    // Event Listener for the Generate Button
    generateButton.addEventListener('click', () => {
        findBeerPlace();
    });

    async function findBeerPlace() {
        // Play beer sound
        beerSound.play();

        // Show fizz animation
        fizzElement.style.display = 'block';

        // Start Lottie Animation
        lottieAnimation.play();

        // Change button text
        generateButton.innerText = buttonPhrases[Math.floor(Math.random() * buttonPhrases.length)];

        // Wait for 2 seconds (simulate delay)
        await new Promise(resolve => setTimeout(resolve, 2000));

        const filterBar = filterBarCheckbox.checked;
        const filterBrewery = filterBreweryCheckbox.checked;
        const filterCraftBeer = filterCraftBeerCheckbox.checked;

        const filteredPlaces = beerPlaces.filter(place => {
            return (
                (place.type === 'bar' && filterBar) ||
                (place.type === 'brewery' && filterBrewery) ||
                (place.type === 'craft beer shop' && filterCraftBeer)
            );
        });

        // Check if there are any places after filtering
        if (filteredPlaces.length === 0) {
            resultElement.innerHTML = '<p>No places match your filters.</p>';
            fizzElement.style.display = 'none';
            lottieAnimation.stop();
            generateButton.innerText = 'Generate Random Beer Spot';
            return;
        }

        const randomPlace = filteredPlaces[Math.floor(Math.random() * filteredPlaces.length)];
        const randomFact = beerFacts[Math.floor(Math.random() * beerFacts.length)];

        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(randomPlace.address)}`;
        const whatsappUrl = `https://api.whatsapp.com/send?text=Check%20out%20this%20beer%20spot:%20${encodeURIComponent(randomPlace.name)}%20at%20${encodeURIComponent(randomPlace.address)}.%20Get%20directions%20here:%20${encodeURIComponent(googleMapsUrl)}`;

        resultElement.innerHTML = `
            <p class="bar-name"><strong>${randomPlace.name}</strong></p>
            <div class="bar-details">
                <img data-src="${randomPlace.image}" alt="${randomPlace.name}" class="lazy">
                <p>
                    Address: ${randomPlace.address}<br>
                    Rating: ${randomPlace.rating}<br>
                    <a href="${googleMapsUrl}" target="_blank">Get Directions</a> | <a href="${whatsappUrl}" target="_blank">Share on WhatsApp</a>
                </p>
            </div>
        `;
        beerFactElement.innerText = `Fun Fact: ${randomFact}`;

        // Lazy Load Images
        lazyLoadImages();

        // Unlock Achievements
        unlockAchievement('first_generate');

        // Hide fizz animation and reset button text
        fizzElement.style.display = 'none';
        lottieAnimation.stop();
        generateButton.innerText = 'Generate Random Beer Spot';
    }

    // Load Lottie Animation
    function loadLottieAnimation() {
        lottieAnimation = lottie.loadAnimation({
            container: document.getElementById('lottie-animation'),
            renderer: 'svg',
            loop: false,
            autoplay: false,
            path: 'beer.json' // Path to your Lottie animation JSON file
        });
    }

    // Lazy Load Images
    function lazyLoadImages() {
        const lazyImages = document.querySelectorAll('.lazy');
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.onload = () => img.classList.remove('lazy');
        });
    }

    // Achievements System
    function unlockAchievement(achievementId) {
        if (achievements.includes(achievementId)) return;

        achievements.push(achievementId);
        let badge;

        switch (achievementId) {
            case 'first_generate':
                badge = createBadge('First Beer!', 'fa-beer');
                break;
            // Add more achievements here
            default:
                return;
        }

        badgesElement.appendChild(badge);
    }

    function createBadge(title, iconClass) {
        const badge = document.createElement('div');
        badge.classList.add('badge');
        badge.innerHTML = `<i class="fas ${iconClass}"></i> ${title}`;
        return badge;
    }
});