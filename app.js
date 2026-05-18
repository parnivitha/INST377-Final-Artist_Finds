const express = require("express");
const path = require("path");
const supabaseClient = require("@supabase/supabase-js");

const app = express();
const port = 3000;

const LASTFM_API_KEY = process.env.LASTFM_API_KEY;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY; 

const supabase = supabaseClient.createClient(SUPABASE_URL, SUPABASE_KEY);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile("public/discovery_homepage.html", { root: __dirname });
});

app.get("/search", (req, res) => {
  res.sendFile("public/discovery_searchpage.html", { root: __dirname });
});

app.get("/favorite", (req, res) => {
  res.sendFile("public/discovery_favoritespage.html", { root: __dirname });
});

app.get("/about", (req, res) => {
  res.sendFile("public/discovery_aboutpage.html", { root: __dirname });
});

app.get("/help", (req, res) => {
  res.sendFile("public/discovery_helppage.html", { root: __dirname });
});

app.get("/api/similar-artists", async (req, res) => {
  const artistName = req.query.artist;
  const minListeners = Number(req.query.minListeners) || 0;
  const minPlaycount = Number(req.query.minPlaycount) || 0;

  if (!artistName) {
    return res.status(400).json({ error: "Artist name is required." });
  }

  try {
    const similarUrl = `https://ws.audioscrobbler.com/2.0/?method=artist.getSimilar&artist=${encodeURIComponent(
      artistName
    )}&limit=10&api_key=${LASTFM_API_KEY}&format=json`;

    const similarResponse = await fetch(similarUrl);
    const similarData = await similarResponse.json();

    if (!similarData.similarartists || !similarData.similarartists.artist) {
      return res.status(404).json({ error: "No similar artists found." });
    }

    const similarArtists = similarData.similarartists.artist;

    const artistDetails = await Promise.all(
      similarArtists.map(async (artist) => {
        const infoUrl = `https://ws.audioscrobbler.com/2.0/?method=artist.getInfo&artist=${encodeURIComponent(
          artist.name
        )}&api_key=${LASTFM_API_KEY}&format=json`;

        const infoResponse = await fetch(infoUrl);
        const infoData = await infoResponse.json();

        const info = infoData.artist;

        if (!info) {
          return null;
        }

        const listeners = Number(info.stats?.listeners) || 0;
        const playcount = Number(info.stats?.playcount) || 0;

        if (listeners < minListeners || playcount < minPlaycount) {
          return null;
        }

        const genres =
          info.tags?.tag?.slice(0, 3).map((tag) => tag.name) || [];

        const image = await getArtistImage(info.name);

        return {
          artist_name: info.name,
          lastfm_link: info.url,
          listeners: listeners,
          playcount: playcount,
          genres: genres,
          bio:
            info.bio?.summary?.replace(/<a[^>]*>.*?<\/a>/g, "") ||
            "No biography available.",
          image: image,
        };
      })
    );

    const filteredArtists = artistDetails.filter((artist) => artist !== null);

    res.json(filteredArtists);
  } catch (error) {
    console.error("Error fetching similar artists:", error);
    res.status(500).json({ error: "Failed to fetch similar artists." });
  }
});

async function getArtistImage(artistName) {
  try {
    const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
      artistName
    )}&type=channel&maxResults=1&key=${YOUTUBE_API_KEY}`;

    const youtubeResponse = await fetch(youtubeUrl);
    const youtubeData = await youtubeResponse.json();

    if (!youtubeData.items || youtubeData.items.length === 0) {
      return "https://placehold.co/300x300?text=No+Image";
    }

    return (
      youtubeData.items[0].snippet.thumbnails.medium?.url ||
      youtubeData.items[0].snippet.thumbnails.default?.url ||
      "https://placehold.co/300x300?text=No+Image"
    );
  } catch (error) {
    console.error("Error fetching image:", error);
    return "https://placehold.co/300x300?text=No+Image";
  }
}

app.post("/api/favorite-artists", async (req, res) => {
  const artist = req.body;

  if (!artist.artist_name || !artist.lastfm_link) {
    return res.status(400).json({ error: "Artist name and link are required." });
  }

  try {
    const { data: insertedArtist, error: artistError } = await supabase
      .from("artist")
      .insert({
        artist_name: artist.artist_name,
        lastfm_link: artist.lastfm_link,
      })
      .select()
      .single();

    if (artistError) {
      console.error("Artist insert error:", artistError);
      return res.status(500).json({ error: "Could not save artist." });
    }

    const artistId = insertedArtist.artist_id;

    for (const genreName of artist.genres || []) {
      let genreId;

      const { data: existingGenre } = await supabase
        .from("genre")
        .select()
        .eq("genre_name", genreName)
        .maybeSingle();

      if (existingGenre) {
        genreId = existingGenre.genre_id;
      } else {
        const { data: newGenre, error: genreError } = await supabase
          .from("genre")
          .insert({
            genre_name: genreName,
          })
          .select()
          .single();

        if (genreError) {
          console.error("Genre insert error:", genreError);
          continue;
        }

        genreId = newGenre.genre_id;
      }

      await supabase.from("artist_genre").insert({
        artist_id: artistId,
        genre_id: genreId,
      });
    }

    res.json({
      message: "Favorite artist saved successfully.",
      artist: insertedArtist,
    });
  } catch (error) {
    console.error("Favorite save error:", error);
    res.status(500).json({ error: "Failed to save favorite artist." });
  }
});

app.get("/api/favorite-artists", async (req, res) => {
  try {
    const { data, error } = await supabase.from("artist").select(`
      artist_id,
      artist_name,
      lastfm_link,
      date_time_saved,
      artist_genre (
        genre (
          genre_name
        )
      )
    `);

    if (error) {
      console.error("Favorites fetch error:", error);
      return res.status(500).json({ error: "Could not fetch favorites." });
    }

    const favorites = data.map((artist) => {
      const genres = artist.artist_genre.map(
        (item) => item.genre.genre_name
      );

      return {
        artist_id: artist.artist_id,
        artist_name: artist.artist_name,
        lastfm_link: artist.lastfm_link,
        date_time_saved: artist.date_time_saved,
        genres: genres,
      };
    });

    res.json(favorites);
  } catch (error) {
    console.error("Favorites route error:", error);
    res.status(500).json({ error: "Failed to fetch favorite artists." });
  }
});

app.use((req, res) => {
  res.status(404).sendFile("public/404.html", { root: __dirname });
});

if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`Express app listening on port: ${port}`);
  });
}

module.exports = app;