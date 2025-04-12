const CLIENT_ID = "09bc150f223e4e3ebf65fa757c60a889";
const CLIENT_SECRET = "7413757e943a481cb2e457dbbe92fc1a";
const API_KEY = "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"; // Replace with your Groq API key
const API_URL = "https://api.groq.com/openai/v1/chat/completions"; // Adjust endpoint if needed

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

async function getSongData(songName) {
    const token = await getAccessToken();
    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(songName)}&type=track&limit=1`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();
    if (!data.tracks || data.tracks.items.length === 0) {
        document.getElementById("song-info").innerHTML = "<p>Song not found.</p>";
        return;
    }

    const song = data.tracks.items[0];
    document.getElementById("song-info").innerHTML = `
        <h2>${song.name}</h2>
        <p><strong>Artist:</strong> ${song.artists.map(artist => artist.name).join(", ")}</p>
        <p><strong>Album:</strong> ${song.album.name}</p>
        <img src="${song.album.images.length ? song.album.images[0].url : 'https://via.placeholder.com/150'}" alt="${song.name}" width="200">
        <p><a href="${song.external_urls.spotify}" target="_blank">Listen on Spotify</a></p>
    `;
}

document.getElementById("search-song").addEventListener("click", () => {
    const songName = document.getElementById("song-name").value;
    if (songName.trim()) {
        getSongData(songName);
    }
});

// Function to add a message to the chat box
function addMessage(sender, message) {
    const chatBox = document.getElementById("chat-box");
    const msg = document.createElement("div");
    msg.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Send user input to the API
async function sendMessage() {
    const userInput = document.getElementById("user-input").value;
    if (userInput.trim() === "") return;

    // Show user message
    addMessage("You", userInput);

    // Prepare the API request
    const payload = {
        model: "llama-3.3-70b-versatile", // Update to correct model if needed
        messages: [{ role: "user", content: userInput }]
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
            const botResponse = data.choices[0].message.content;
            addMessage("Groq", botResponse);
        } else {
            addMessage("Groq", "Oops! No response from AI.");
        }
    } catch (error) {
        console.error("Error:", error);
        addMessage("Groq", "Error connecting to AI service.");
    }

    // Clear input
    document.getElementById("user-input").value = "";
}
