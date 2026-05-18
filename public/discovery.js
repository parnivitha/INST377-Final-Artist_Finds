const listenersSlider = document.getElementById("listeners-slider");
const listenersValue = document.getElementById("listeners-value");

const playcountSlider = document.getElementById("playcount-slider");
const playcountValue = document.getElementById("playcount-value");

const artistSearchInput = document.getElementById("artist-search");
const searchButton = document.getElementById("search-button");
const artistCarousel = document.getElementById("artist-carousel");

noUiSlider.create(listenersSlider, {
  start: [0],
  connect: true,
  range: {
    min: 0,
    max: 5000000,
  },
  step: 50000,
});

listenersSlider.noUiSlider.on("update", function (values) {
  listenersValue.innerHTML = Math.round(values[0]).toLocaleString();
});

noUiSlider.create(playcountSlider, {
  start: [0],
  connect: true,
  range: {
    min: 0,
    max: 10000000,
  },
  step: 100000,
});

playcountSlider.noUiSlider.on("update", function (values) {
  playcountValue.innerHTML = Math.round(values[0]).toLocaleString();
});

const swiper = new Swiper(".artistSwiper", {
  slidesPerView: 3,
  spaceBetween: 30,

  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },

  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
});

searchButton.addEventListener("click", function () {
  const artistName = artistSearchInput.value.trim();

  if (artistName === "") {
    alert("Please enter an artist name.");
    return;
  }

  loadArtists(artistName);
});

artistSearchInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    searchButton.click();
  }
});

async function loadArtists(artistName) {
  try {
    artistCarousel.innerHTML = `
      <div class="swiper-slide artist-card">
        <h3>Loading...</h3>
        <p>Finding artists similar to ${artistName}</p>
      </div>
    `;

    swiper.update();

    const minListeners = Math.round(Number(listenersSlider.noUiSlider.get()));
    const minPlaycount = Math.round(Number(playcountSlider.noUiSlider.get()));

    const response = await fetch(
      `/api/similar-artists?artist=${encodeURIComponent(
        artistName
      )}&minListeners=${minListeners}&minPlaycount=${minPlaycount}`
    );

    const artists = await response.json();

    if (!response.ok) {
      throw new Error(artists.error || "Failed to load artists.");
    }

    displayArtists(artists);
  } catch (error) {
    console.error(error);

    artistCarousel.innerHTML = `
      <div class="swiper-slide artist-card">
        <h3>No results found</h3>
        <p>Try searching another artist or lowering your filters.</p>
      </div>
    `;

    swiper.update();
  }
}

function displayArtists(artists) {
  artistCarousel.innerHTML = "";

  if (!artists || artists.length === 0) {
    artistCarousel.innerHTML = `
      <div class="swiper-slide artist-card">
        <h3>No artists matched your filters</h3>
        <p>Try lowering the listener or playcount filters.</p>
      </div>
    `;

    swiper.update();
    return;
  }

  artists.forEach((artist, index) => {
    artistCarousel.innerHTML += `
      <div class="swiper-slide artist-card">
        <img
          class="artist-image"
          src="${artist.image}"
          alt="${artist.artist_name}"
          referrerpolicy="no-referrer"
          onerror="this.onerror=null; this.src='https://placehold.co/300x300?text=No+Image';"
        />

        <h3>${artist.artist_name}</h3>
        <p><strong>Genre:</strong> ${artist.genres.join(", ")}</p>

        <p><strong>Total Listeners:</strong> ${artist.listeners.toLocaleString()}</p>
        <p><strong>Playcount:</strong> ${artist.playcount.toLocaleString()}</p>

        <p>${artist.bio}</p>

        <a href="${artist.lastfm_link}" target="_blank">View on Last.fm</a>

        <br /><br />

        <button class="favorite-button" onclick="saveFavorite(${index}, this)">
          ♡
        </button>
      </div>
    `;
  });

  window.currentArtists = artists;
  swiper.update();
}

async function saveFavorite(index, button) {
  const artist = window.currentArtists[index];

  try {
    button.disabled = true;
    button.innerHTML = "♥";
    button.classList.add("filled");

    const response = await fetch("/api/favorite-artists", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(artist),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to save favorite.");
    }
  } catch (error) {
    console.error(error);

    button.disabled = false;
    button.innerHTML = "♡";
    button.classList.remove("filled");
  }
}