const GEMINI_API_KEY = 'YOUR_GEMINI_KEY_HERE';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

let config = {};
let chatHistory = [];

// Load config from file
async function loadConfig() {
    try {
        const response = await fetch('config.txt');
        const text = await response.text();
        parseConfig(text);
    } catch (error) {
        console.error('Error loading config:', error);
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
    const personalityDescription = getPersonalityDescription();
    
    const messages = [
        {
            role: 'user',
            content: personalityDescription + '\n\nUser says: ' + userMessage
        }
    ];
    
    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: messages
            })
        });
        
        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            return "Sorry, I got confused. Can you say that again?";
        }
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        return "Oops! Something went wrong.";
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
    
    const response = await getPetResponse(message);
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

// Pet seeks attention every 30 seconds
setInterval(petSeeksAttention, 30000);
