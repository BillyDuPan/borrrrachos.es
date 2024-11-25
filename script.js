let beerPlaces = []; // This will hold the data from the JSON file

// Fetch the JSON data when the script loads
fetch('beer_places.json')
    .then(response => response.json())
    .then(data => {
        beerPlaces = data;
    })
    .catch(error => {
        console.error('Error fetching beer places data:', error);
    });

function findBeerPlace() {
    const fizzElement = document.getElementById('fizz');
    const beerSound = document.getElementById('beerSound');
    const button = document.getElementById('generateButton');
    const buttonPhrases = ["Let’s Drink Up!", "Beer Me!", "Find My Brew!", "Cheers!", "Hop to It!"];

    // Play beer sound
    beerSound.play();

    // Show fizz animation
    fizzElement.style.display = 'block';

    // Change button text
    button.innerText = buttonPhrases[Math.floor(Math.random() * buttonPhrases.length)];

    // Wait for 2 seconds (simulate delay)
    setTimeout(() => {
        // Check if the data has been loaded
        if (beerPlaces.length === 0) {
            console.error('Beer places data is not loaded yet.');
            fizzElement.style.display = 'none';
            alert('Data is still loading, please try again in a moment.');
            return;
        }

        const filterBar = document.getElementById('filterBar').checked;
        const filterBrewery = document.getElementById('filterBrewery').checked;
        const filterCraftBeer = document.getElementById('filterCraftBeer').checked;

        const filteredPlaces = beerPlaces.filter(place => {
            if (place.type === 'bar' && filterBar) return true;
            if (place.type === 'brewery' && filterBrewery) return true;
            if (place.type === 'craft beer shop' && filterCraftBeer) return true;
            return false;
        });

        // Check if there are any places after filtering
        if (filteredPlaces.length === 0) {
            document.getElementById('result').innerHTML = '<p>No places match your filters.</p>';
            fizzElement.style.display = 'none';
            return;
        }

        const randomIndex = Math.floor(Math.random() * filteredPlaces.length);
        const beerPlace = filteredPlaces[randomIndex];

        const beerFacts = [
            "Beer is one of the oldest drinks in the world, dating back to 5,000 BC!",
            "The oldest known recipe for beer is over 4,000 years old, from ancient Mesopotamia!",
            "Germany has over 1,500 different types of beer.",
            "Cenosillicaphobia is the fear of an empty beer glass.",
            "In 1814, London experienced the Great Beer Flood, releasing over 323,000 gallons of beer."
        ];

        const randomFactIndex = Math.floor(Math.random() * beerFacts.length);
        const beerFact = beerFacts[randomFactIndex];

        const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(beerPlace.address)}`;
        const whatsappUrl = `https://api.whatsapp.com/send?text=Check%20out%20this%20beer%20spot:%20${encodeURIComponent(beerPlace.name)}%20at%20${encodeURIComponent(beerPlace.address)}.%20Get%20directions%20here:%20${encodeURIComponent(googleMapsUrl)}`;

        document.getElementById('result').innerHTML = `
            <p class="bar-name"><strong>${beerPlace.name}</strong></p>
            <img src="${beerPlace.image}" alt="${beerPlace.name}">
            <p>Address: ${beerPlace.address}<br>
            Rating: ${beerPlace.rating}<br>
            <a href="${googleMapsUrl}" target="_blank">Get Directions</a> | <a href="${whatsappUrl}" target="_blank">Share on WhatsApp</a></p>
        `;
        document.getElementById('beerFact').innerText = `Fun Fact: ${beerFact}`;

        fizzElement.style.display = 'none';
    }, 2000);
}