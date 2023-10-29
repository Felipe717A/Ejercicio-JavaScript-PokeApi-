const apiUrl = "https://pokeapi.co/api/v2/pokemon/";
const speciesUrl = "https://pokeapi.co/api/v2/pokemon-species/";

const home = document.getElementById("home");
const pokemonInfo = document.getElementById("pokemonInfo");
const searchButton = document.getElementById("searchButton");
const evolveButton = document.getElementById("evolveButton");
const error = document.getElementById("error");
const homeLink = document.getElementById("homeLink");


let currentPokemon = null; // Variable global para almacenar el Pokémon actual

searchButton.addEventListener("click", () => {
    const pokemonName = document.getElementById("pokemonName").value.toLowerCase();

    fetch(`${apiUrl}${pokemonName}`)
        .then((response) => response.json())
        .then((data) => {
            currentPokemon = data; // Almacenar el Pokémon actual en la variable global
            console.log(currentPokemon);
            displayPokemon(data);
            error.classList.add("hidden");
        })
        .catch(() => {
            error.classList.remove("hidden");
            alert("Este Pokémon no se ha encontrado.");
            hidePokemonInfo();
        });
});


evolveButton.addEventListener("click", () => {
    if (currentPokemon && currentPokemon.species) {
        const speciesUrl = currentPokemon.species.url; // Obtener la URL de la especie del Pokémon

        fetch(speciesUrl)
            .then((response) => response.json())
            .then((speciesData) => {
                const evolutionChainUrl = speciesData.evolution_chain.url;

                fetch(evolutionChainUrl)
                    .then((response) => response.json())
                    .then((evolutionChainData) => {
                        const nextEvolutionName = findNextEvolution(evolutionChainData, currentPokemon.name);
                        if (nextEvolutionName) {
                            fetch(`${apiUrl}${nextEvolutionName}`)
                                .then((response) => response.json())
                                .then((evolutionData) => {
                                    currentPokemon = evolutionData;
                                    displayPokemon(evolutionData);
                                });
                        } else {
                            // No hay evolución disponible.
                            alert("Este Pokémon no tiene una evolución.");
                        }
                    });
            });
    }
});

function findNextEvolution(evolutionChainData, currentPokemonName) {
    const chain = evolutionChainData.chain;
    let nextEvolution = null;

    const findEvolution = (chain) => {
        if (chain.species.name === currentPokemonName && chain.evolves_to.length > 0) {
            nextEvolution = chain.evolves_to[0].species.name;
            return;
        }
        chain.evolves_to.forEach((evolution) => {
            findEvolution(evolution);
        });
    };

    findEvolution(chain);
    return nextEvolution;
}


homeLink.addEventListener("click", () => {
    hidePokemonInfo();
});

function displayPokemon(data) {
    const name = data.name;
    const image = data.sprites.front_default;
    const abilities = data.abilities.map((ability) => ability.ability.name);

    document.getElementById("pokemonTitle").textContent = name;
    document.getElementById("pokemonImage").src = image;
    document.getElementById("pokemonAbilities").textContent = "Habilidades: " + abilities.join(", ");

   
    evolveButton.classList.add("hidden");
    if (data.species) {
        fetch(data.species.url)
            .then((response) => response.json())
            .then((speciesData) => {
                const evolutionChainUrl = speciesData.evolution_chain.url;
                fetch(evolutionChainUrl)
                    .then((response) => response.json())
                    .then((evolutionChainData) => {
                        if (evolutionChainData.chain.evolves_to.length > 0) {
                            const nextEvolutionName = findNextEvolution(evolutionChainData, data.name);
                    if (nextEvolutionName) {
                        document.getElementById("nextEvolution").textContent = "Siguiente Evolución: " + nextEvolutionName;
                    } else {
                        document.getElementById("nextEvolution").textContent = "No hay siguiente evolución.";
                    }
                            evolveButton.classList.remove("hidden");
                        }
                    });
            });
    }




    pokemonInfo.classList.remove("hidden");
}

function hidePokemonInfo() {
    home.classList.remove("hidden");
    pokemonInfo.classList.add("hidden");
    error.classList.add("hidden");
}
