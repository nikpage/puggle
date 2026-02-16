const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

let config = {
    sliders: { emotion: 50, affection: 75, energy: 40 },
    weights: { emotion: 33, affection: 33, energy: 34 }
};
let chatHistory = [];

// Get API key from localStorage
function getApiKey() {
    return localStorage.getItem('gemini_api_key') || '';
}

// Save API key to localStorage
function setApiKey(key) {
    localStorage.setItem('gemini_api_key', key.trim());
}

// Load config from localStorage first, then fall back to file
async function loadConfig() {
    const saved = localStorage.getItem('pet_config');
    if (saved) {
        try {
            config = JSON.parse(saved);
            return;
        } catch (e) {
            // fall through to file
        }
    }

    try {
        const response = await fetch('config.txt');
        const text = await response.text();
        parseConfig(text);
        localStorage.setItem('pet_config', JSON.stringify(config));
    } catch (error) {
        console.error('Error loading config:', error);
        // Set defaults if everything fails
        config = {
            sliders: { emotion: 50, affection: 75, energy: 40 },
            weights: { emotion: 33, affection: 33, energy: 34 }
        };
    }
}

// Parse config.txt format
function parseConfig(text) {
    const lines = text.split('\n');
    let currentSection = '';

    config.sliders = {};
    config.weights = {};

    for (let line of lines) {
        line = line.trim();
        if (!line || line.startsWith('#')) continue;

        if (line === '[sliders]') {
            currentSection = 'sliders';
            continue;
        }
        if (line === '[weights]') {
            currentSection = 'weights';
            continue;
        }

        const [key, value] = line.split('=');
        if (key && value !== undefined) {
            if (currentSection === 'sliders') {
                config.sliders[key.trim()] = parseInt(value);
            } else if (currentSection === 'weights') {
                config.weights[key.trim()] = parseInt(value);
            }
        }
    }
}

// Build personality description for the prompt
function getPersonalityDescription() {
    let description = 'You are an AI pet with this personality:\n';

    for (const [name, value] of Object.entries(config.sliders)) {
        const weight = config.weights[name] || 0;
        description += `- ${name}: ${value} (weight: ${weight}%)\n`;
    }

    description += '\nRespond like a 2-3 year old child would. Use simple words, short sentences. Be playful and fun.';
    return description;
}

// Send message to Gemini API
async function getPetResponse(userMessage) {
    const apiKey = getApiKey();
    if (!apiKey) {
        return "I need an API key to talk! Click Settings and add your Gemini API key.";
    }

    const personalityDescription = getPersonalityDescription();

    // Build conversation contents in Gemini's expected format
    const contents = [];

    // Add system context as the first user message if no history
    if (chatHistory.length === 0) {
        contents.push({
            role: 'user',
            parts: [{ text: personalityDescription + '\n\nUser says: ' + userMessage }]
        });
    } else {
        // First message includes personality description
        contents.push({
            role: 'user',
            parts: [{ text: personalityDescription + '\n\nUser says: ' + chatHistory[0].user }]
        });
        contents.push({
            role: 'model',
            parts: [{ text: chatHistory[0].pet }]
        });

        // Add remaining history
        for (let i = 1; i < chatHistory.length; i++) {
            contents.push({
                role: 'user',
                parts: [{ text: chatHistory[i].user }]
            });
            contents.push({
                role: 'model',
                parts: [{ text: chatHistory[i].pet }]
            });
        }

        // Add current message
        contents.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });
    }

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ contents })
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 400 || response.status === 403) {
                return "API key error — check your Gemini key in Settings.";
            }
            return "Oops! Something went wrong (status " + response.status + ").";
        }

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const petText = data.candidates[0].content.parts[0].text;
            // Save to chat history
            chatHistory.push({ user: userMessage, pet: petText });
            // Keep history manageable (last 20 exchanges)
            if (chatHistory.length > 20) chatHistory.shift();
            return petText;
        } else {
            return "Sorry, I got confused. Can you say that again?";
        }
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        return "Oops! Something went wrong. Check your internet connection.";
    }
}

// Add message to chat
function addMessage(text, isUser) {
    const chatWindow = document.getElementById('chatWindow');
    const messageDiv = document.createElement('div');
    messageDiv.className = isUser ? 'message user-message' : 'message pet-message';
    messageDiv.innerHTML = `<p>${escapeHtml(text)}</p>`;
    chatWindow.appendChild(messageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Escape HTML to prevent injection
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Handle sending message
async function sendMessage() {
    const input = document.getElementById('userInput');
    const message = input.value.trim();

    if (!message) return;

    addMessage(message, true);
    input.value = '';

    // Show typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message pet-message typing';
    typingDiv.innerHTML = '<p>...</p>';
    document.getElementById('chatWindow').appendChild(typingDiv);

    const response = await getPetResponse(message);

    // Remove typing indicator
    typingDiv.remove();

    addMessage(response, false);
}

// Request notification permission
async function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
    }
}

// Pet seeks attention
function petSeeksAttention() {
    const affection = config.sliders.affection || 0;
    const energy = config.sliders.energy || 0;

    // Higher affection and energy = more likely to seek attention
    const seekChance = ((affection + 100) / 200) * ((energy + 100) / 200) * 0.5;

    if (Math.random() < seekChance) {
        const messages = [
            "Hey! Pay attention to me!",
            "Hello? Are you there?",
            "I miss you!",
            "Wanna play with me?",
            "Look at me!"
        ];

        const message = messages[Math.floor(Math.random() * messages.length)];

        if (Notification.permission === 'granted') {
            new Notification('Your AI Pet', {
                body: message,
                icon: '🐾'
            });
        }
    }
}

// Set up event listeners
document.getElementById('sendBtn').addEventListener('click', sendMessage);
document.getElementById('userInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Initialize
loadConfig();
requestNotificationPermission();

// Show prompt for API key if not set
window.addEventListener('load', () => {
    if (!getApiKey()) {
        addMessage("Hi! Before we can chat, you need to add your Gemini API key. Click 'Settings' in the top right to add it.", false);
    }
});

// Pet seeks attention every 30 seconds
setInterval(petSeeksAttention, 30000);
