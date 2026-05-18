# Project Title: INST377-Final-Artist_Finds

## Project Description

Artist Finds is a music discovery web application that allows users to search for artists, explore similar artists, and receive personalized music recommendations based on their interests. Users can discover new artists similar to their own favorites through interactive filters, specifically the listener count and discography play count of related artists. They can also save favorite artists they discover for future reference. The application integrates external APIs and database functionality to create a fun and personalized music exploration experience.

The application was designed to help users move beyond repetitive listening habits and discover more artists that align with their music taste and genre. Features include artist searching, recommendation filtering, artist saving, artist previews, and interactive visual components.

---

## Target Browsers

Artist Finds is designed and tested for the following browsers and platforms:

### Desktop Browsers
- Google Chrome (recommended)
- Mozilla Firefox
- Microsoft Edge
- Safari

It is meant for Windows macOS, and Linux. The application can also work on mobile phones through Safari and Chrome IOS.

## Developer Manual

Future developers can use this manual to install, configure, run, and continue development of the Artist Finds application.

---

# Installation Instructions

## Clone the repository

Start by cloning the repository to your local machine.

```bash
git clone https://github.com/parnivitha/INST377-Final-Artist_Finds.git
```

Open files in the following project directory:

```bash
cd INST377-Final-Artist_Finds
```

---

## Install dependencies

Install all Node packages for this application:

```bash
npm install
```

There are many dependencies needed for database connection, API credentials, frontend Javascript libraries and more. There include the following:

- Express
- dotenv
- node-fetch
- Supabase client
- Nodemon
- Swiper
- Chart.js
- Annyang

---

# Environment Variables

Create a file named:

```bash
.env
```

Add the following variables:

```env
LASTFM_API_KEY=your_key_here
YOUTUBE_API_KEY=your_key_here
SUPABASE_URL=your_url_here
SUPABASE_KEY=your_key_here
```

These variables are required for API communication and database access. You must visit the SupaBase database platform as well as the Last.fm and YoutubeData platforms and create accounts in order to access your own variables. The links are attached below:

[Last.fm link](https://www.last.fm/api)

[Supabase link](https://supabase.com/)

[YoutubeData link](https://developers.google.com/youtube/v3)


---

# Running the Application

Start the server and run the application by running this in your terminal:

```bash
npm start
```

The application should run locally at:

```bash
http://localhost:3000
```

---

## Production Deployment

The production version of Artist Finds is deployed using Vercel.

Live application:

[Artist Finds Deployment](https://inst-377-final-artist-finds.vercel.app/)

To redeploy:

1. Push updates to the GitHub repository
2. Vercel automatically detects repository changes
3. Vercel builds and redeploys the application

For deployment to function properly, verify that the following environment variables are configured within Vercel:

```env
LASTFM_API_KEY
YOUTUBE_API_KEY
SUPABASE_URL
SUPABASE_KEY
```

Future developers should also verify the `vercel.json` configuration and server entry point settings before deployment.


# Server API Documentation

The server currently contains many endpoints from the Last.fm and YoutubeData APIs.

---

### GET /

Purpose:

Returns the homepage.

Response:

Serves:

```bash
discovery_homepage.html
```

---

### GET /search

Purpose:

Returns the artist discovery page.

Response:

Serves:

```bash
discovery_searchpage.html
```

---

### GET /favorite

Purpose:

Returns the saved favorites page.

Response:

Serves:

```bash
discovery_favoritespage.html
```

---

### GET /about

Purpose:

Returns application information page.

Response:

Serves:

```bash
discovery_aboutpage.html
```

---

### GET /help

Purpose:

Returns help and instructions page.

Response:

Serves:

```bash
discovery_helppage.html
```

---

# API Endpoints

## GET /api/similar-artists

Purpose:

Retrieves artists similar to a user-input artist using the Last.fm API. Additional filters can be applied based on listener count and play count.

Query Parameters:

```bash
artist
minListeners
minPlaycount
```

Example request:

```bash
GET /api/similar-artists?artist=Taylor+Swift&minListeners=100000&minPlaycount=1000000
```

Returns:

```json
[
  {
    "artist_name":"Artist Name",
    "lastfm_link":"URL",
    "listeners":12345,
    "playcount":45678,
    "genres":["Pop","Rock"],
    "bio":"Artist biography",
    "image":"imageURL"
  }
]
```

Used for:

- artist recommendations
- filtering similar artists
- populating search results

---

## POST /api/favorite-artists

Purpose:

Stores an artist in the Supabase favorites database.

Expected request body:

```json
{
  "artist_name":"Artist Name",
  "lastfm_link":"URL",
  "genres":["Pop","Rock"]
}
```

Response:

```json
{
  "message":"Favorite artist saved successfully."
}
```

Used for:

- saving user favorites

---

## GET /api/favorite-artists

Purpose:

Retrieves all favorite artists stored in Supabase.

Returns:

```json
[
 {
   "artist_id":1,
   "artist_name":"Artist Name",
   "lastfm_link":"URL",
   "date_time_saved":"timestamp",
   "genres":["Pop","Rock"]
 }
]
```

Used for:

- displaying saved artists
- populating favorites page

---

# YouTube Integration

The application uses the YouTube Search API internally through the helper function:

```javascript
getArtistImage()
```

Purpose:

Searches YouTube channels and retrieves artist thumbnail images.

Used for:

- artist profile images
- recommendation cards

This functionality is internal and does not expose a public endpoint.

---

# Third Party APIs

The system integrates:

## Last.fm API

Used for:

- artist information (description, playcount, listener count, genre)
- similar artist recommendations

---

## YouTube API

Used for:

- artist images

---

## Supabase

Used for:

- persistent storage of favorite artists

---

# Known Bugs

Current known issues:

### Vercel deployment instability

Occasionally deployment settings require updating on Vercel because Express server configuration differs between local and production environments.

---


### API limitations

External APIs occasionally rate-limit requests.

This can temporarily prevent recommendations from loading.

---

### Mobile responsiveness

Certain carousel and filter layouts may overlap on smaller screen sizes. This application is best for larger screen browsers, like laptops and computers.

---

# Roadmap for Future Development

Future improvements include:

### User authentication

Allow users to create accounts and store personalized recommendation histories.

---

### Playlist generation

Generate playlists based on:

- mood
- genre
- listening history

---

### Advanced filtering

Allow filtering by:

- popularity
- decade
- artist activity years
- region

---

### Accessibility improvements

Additional features:

- screen reader enhancements
- keyboard navigation
- color contrast customization
- larger text controls

---
