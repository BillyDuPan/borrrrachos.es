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

    setTimeout(() => {
        const beerPlaces = [
            { name: "Bar Barcelona", address: "Carrer de Mallorca, 123", rating: 4.5, image: "https://via.placeholder.com/300x200?text=Bar+Barcelona", type: "bar" },
            { name: "Cerveceria Catalana", address: "Carrer de Mallorca, 236", rating: 4.7, image: "https://via.placeholder.com/300x200?text=Cerveceria+Catalana", type: "bar" },
            { name: "BlackLab Brewhouse", address: "Plaça Pau Vila, 1", rating: 4.3, image: "https://via.placeholder.com/300x200?text=BlackLab+Brewhouse", type: "brewery" },
            { name: "BierCab", address: "Carrer de Muntaner, 55", rating: 4.6, image: "https://via.placeholder.com/300x200?text=BierCab", type: "bar" },
            { name: "Ale&Hop", address: "Carrer de les Basses de Sant Pere, 10", rating: 4.4, image: "https://via.placeholder.com/300x200?text=Ale%26Hop", type: "craft beer shop" },
            { name: "The Beer Spot", address: "Carrer de Balmes, 200", rating: 4.8, image: "https://via.placeholder.com/300x200?text=The+Beer+Spot", type: "craft beer shop" },
            { name: "La Birreria", address: "Carrer de la Diputació, 65", rating: 4.2, image: "https://via.placeholder.com/300x200?text=La+Birreria", type: "bar" },
            { name: "Craft & Draft", address: "Carrer de Provença, 75", rating: 4.9, image: "https://via.placeholder.com/300x200?text=Craft+%26+Draft", type: "bar" },
            { name: "Hopsters Haven", address: "Carrer de Pau Claris, 123", rating: 4.3, image: "https://via.placeholder.com/300x200?text=Hopsters+Haven", type: "craft beer shop" },
            { name: "Beer Brothers", address: "Carrer de Gran Via, 340", rating: 4.6, image: "https://via.placeholder.com/300x200?text=Beer+Brothers", type: "brewery" },
            { name: "Barrel & Tap", address: "Carrer de Casanova, 88", rating: 4.4, image: "https://via.placeholder.com/300x200?text=Barrel+%26+Tap", type: "bar" },
            { name: "Foam & Malt", address: "Carrer de Sants, 50", rating: 4.7, image: "https://via.placeholder.com/300x200?text=Foam+%26+Malt", type: "bar" },
            { name: "El Hoppin'", address: "Carrer de Gràcia, 29", rating: 4.5, image: "https://via.placeholder.com/300x200?text=El+Hoppin'", type: "bar" },
            { name: "Draft Kings", address: "Carrer de la Marina, 70", rating: 4.8, image: "https://via.placeholder.com/300x200?text=Draft+Kings", type: "brewery" },
            { name: "The Hoppy Place", address: "Carrer de Les Corts, 105", rating: 4.7, image: "https://via.placeholder.com/300x200?text=The+Hoppy+Place", type: "craft beer shop" }
        ];

        const filterBar = document.getElementById('filterBar').checked;
        const filterBrewery = document.getElementById('filterBrewery').checked;
        const filterCraftBeer = document.getElementById('filterCraftBeer').checked;

        const filteredPlaces = beerPlaces.filter(place => {
            if (place.type === 'bar' && filterBar) return true;
            if (place.type === 'brewery' && filterBrewery) return true;
            if (place.type === 'craft beer shop' && filterCraftBeer) return true;
            return false;
        });

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