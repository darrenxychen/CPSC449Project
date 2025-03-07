const CLIENT_ID = "09bc150f223e4e3ebf65fa757c60a889";
const CLIENT_SECRET = "7413757e943a481cb2e457dbbe92fc1a";

// Function to get an access token
async function getAccessToken() {
    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `grant_type=client_credentials&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`,
    });

    const data = await response.json();
    return data.access_token;
}

async function getArtistData(artistName) {
    const token = await getAccessToken();
    console.log("Access Token:", token); // Debugging

    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();
    console.log("API Response:", data); // Debugging

    if (!data.artists || data.artists.items.length === 0) {
        document.getElementById("artist-info").innerHTML = "<p>Artist not found.</p>";
        return;
    }

    const artist = data.artists.items[0];
    document.getElementById("artist-info").innerHTML = `
        <h2>${artist.name}</h2>
        <p><strong>Followers:</strong> ${artist.followers.total.toLocaleString()}</p>
        <p><strong>Genres:</strong> ${artist.genres.join(", ") || "N/A"}</p>
        <img src="${artist.images.length ? artist.images[0].url : 'https://via.placeholder.com/150'}" alt="${artist.name}" width="200">
        <p><a href="${artist.external_urls.spotify}" target="_blank">View on Spotify</a></p>
    `;
}


// Add event listener to search button
document.getElementById("search-artist").addEventListener("click", () => {
    const artistName = document.getElementById("artist-name").value;
    if (artistName.trim()) {
        getArtistData(artistName);
    }
});



// {"access_token":"BQAX64qjFEFcsIhz_oGU4TM8Vztt2nDDuDfHrLQ-YBNgCRED_n6-Y219z9Mv0R4mZADuGGXtL5v9PyEBK_4LQIf44gUg-bmPeRIOVFkVKQqYTLZusprSutg7sWxt5wbHxGBIgTbYN8c",
//     "token_type":"Bearer",
//     "expires_in":3600}

//     https://open.spotify.com/artist/64tJ2EAv1R6UaZqc4iOCyj?si=mGb_fS9jTzmwikHk6tEYaA

//     curl "https://api.spotify.com/v1/artists/64tJ2EAv1R6UaZqc4iOCyj" -H "Authorization: Bearer  BQAX64qjFEFcsIhz_oGU4TM8Vztt2nDDuDfHrLQ-YBNgCRED_n6-Y219z9Mv0R4mZADuGGXtL5v9PyEBK_4LQIf44gUg-bmPeRIOVFkVKQqYTLZusprSutg7sWxt5wbHxGBIgTbYN8c"
