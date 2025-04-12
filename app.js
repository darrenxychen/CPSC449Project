const API_KEY = "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"; // Replace with your Groq API key
const API_URL = "https://api.groq.com/openai/v1/chat/completions"; // Adjust endpoint if needed

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
