const CLIENT_ID = "09bc150f223e4e3ebf65fa757c60a889";
const CLIENT_SECRET = "7413757e943a481cb2e457dbbe92fc1a";
const API_KEY = "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"; 
const API_URL = "https://api.groq.com/openai/v1/chat/completions"; 

// take the search history from local storage or create an empty array
let searchHistory = JSON.parse(localStorage.getItem('songSearchHistory')) || [];
const MAX_HISTORY_ITEMS = 10;

// update the search history display
function updateSearchHistoryDisplay() {
    const historyList = document.getElementById("history-list");
    historyList.innerHTML = "";
    
    // display the most recent searches first
    searchHistory.slice().reverse().forEach((songData, index) => {
        const li = document.createElement("li");
        li.className = "history-item";
        
        // mini song card for each history item
        li.innerHTML = `
            <img src="${songData.image || 'https://via.placeholder.com/40'}" alt="${songData.name}" class="history-image">
            <div class="history-text">
                <div class="history-song-name">${songData.name}</div>
                <div class="history-artist-name">${songData.artist}</div>
            </div>
            <button class="history-delete-btn" aria-label="Delete from history">×</button>
        `;
        
        // song click handler
        li.querySelector(".history-text").addEventListener("click", () => {
            document.getElementById("song-name").value = songData.searchQuery;
            getSongData(songData.searchQuery);
        });
        
        // delete button click handler
        li.querySelector(".history-delete-btn").addEventListener("click", (e) => {
            e.stopPropagation(); // prevents clicking the song card
            removeFromSearchHistory(searchHistory.length - 1 - index); // converts reversed index to actual index
        });
        
        historyList.appendChild(li);
    });
}

// function to remove a song from search history
function removeFromSearchHistory(index) {
    // removes the item at the specified index
    searchHistory.splice(index, 1);
    
    // saves updated history
    localStorage.setItem('songSearchHistory', JSON.stringify(searchHistory));
    updateSearchHistoryDisplay();
}

// function to add a song to search history
function addToSearchHistory(songName, songData) {
    // if the search is empty, don't add it to the history
    if (!songName.trim() || !songData) return;
    
    const newEntry = {
        searchQuery: songName,
        name: songData.name,
        artist: songData.artists.map(artist => artist.name).join(", "),
        image: songData.album.images.length ? songData.album.images[songData.album.images.length - 1].url : 'https://via.placeholder.com/40'
    };
    
    // remove duplicate if exists (by song name)
    const index = searchHistory.findIndex(item => item.name === newEntry.name && item.artist === newEntry.artist);
    if (index !== -1) {
        searchHistory.splice(index, 1);
    }
    
    // add to the array
    searchHistory.push(newEntry);
    
    // limit the history size
    if (searchHistory.length > MAX_HISTORY_ITEMS) {
        searchHistory = searchHistory.slice(-MAX_HISTORY_ITEMS);
    }
    
    // save to local storage
    localStorage.setItem('songSearchHistory', JSON.stringify(searchHistory));
    
    // update function
    updateSearchHistoryDisplay();
}

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

// function to get a description from the AI
async function getSongDescription(songName, artistName) {
    const prompt = `Give me a 2-3 sentence description of the song "${songName}" by ${artistName}.`;

    const payload = {
        model: "llama-3.3-70b-versatile", 
        messages: [{ role: "user", content: prompt }]
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
            return data.choices[0].message.content;
        } else {
            return "No description available.";
        }
    } catch (error) {
        console.error("Error fetching song description:", error);
        return "Error fetching description.";
    }
}

// function to get song data from spotify API
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
        <div class="song-info-container">
            <div class="song-details">
                <h2>${song.name}</h2>
                <p><strong>Artist:</strong> ${song.artists.map(artist => artist.name).join(", ")}</p>
                <p><strong>Album:</strong> ${song.album.name}</p>
                <img src="${song.album.images.length ? song.album.images[0].url : 'https://via.placeholder.com/150'}" alt="${song.name}" width="200">
                <p><a href="${song.external_urls.spotify}" target="_blank" class="spotify-button">Listen on Spotify</a></p>
            </div>
            <div id="song-description"><em>Loading description...</em></div>
        </div>
    `;

    // call function to get desc from AI and put it under the song
    const description = await getSongDescription(song.name, song.artists.map(artist => artist.name).join(", "));
    const descriptionDiv = document.getElementById("song-description");
    descriptionDiv.innerHTML = `<p>${description}</p>`;

    // Add search to history after successful search
    addToSearchHistory(songName, song);
}

document.getElementById("search-song").addEventListener("click", () => {
    const songName = document.getElementById("song-name").value;
    if (songName.trim()) {
        getSongData(songName);
    }
});

// Also allow search by pressing Enter key
document.getElementById("song-name").addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        const songName = document.getElementById("song-name").value;
        if (songName.trim()) {
            getSongData(songName);
        }
    }
});

// initialize search history display on page load
document.addEventListener("DOMContentLoaded", () => {
    updateSearchHistoryDisplay();
});

// function to add a message to the chat box
function addMessage(sender, message) {
    const chatBox = document.getElementById("chat-box");
    const msg = document.createElement("div");
    
    // different bubble colors for the user and for groq
    if (sender === "You") {
        msg.className = "message user-message";
        msg.textContent = message;
    } else {
        msg.className = "message groq-message";
        msg.textContent = message;
    }
    
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// send message to AI bot
async function sendMessage() {
    const userInput = document.getElementById("user-input").value;
    if (userInput.trim() === "") return;

    addMessage("You", userInput);

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
