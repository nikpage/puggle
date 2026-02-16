let config = {
    sliders: {},
    weights: {}
};

// Load config from localStorage first, then fall back to file
async function loadConfig() {
    const saved = localStorage.getItem('pet_config');
    if (saved) {
        try {
            config = JSON.parse(saved);
            renderSliders();
            return;
        } catch (e) {
            // fall through to file
        }
    }

    try {
        const response = await fetch('config.txt');
        const text = await response.text();
        parseConfig(text);
        renderSliders();
    } catch (error) {
        console.error('Error loading config:', error);
        // Set defaults
        config = {
            sliders: { emotion: 50, affection: 75, energy: 40 },
            weights: { emotion: 33, affection: 33, energy: 34 }
        };
        renderSliders();
    }
}

// Parse config.txt
function parseConfig(text) {
    const lines = text.split('\n');
    let currentSection = '';

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

// Render all sliders
function renderSliders() {
    const container = document.getElementById('sliderContainer');
    container.innerHTML = '';

    for (const [name, value] of Object.entries(config.sliders)) {
        const weight = config.weights[name] || 0;

        const group = document.createElement('div');
        group.className = 'slider-group';
        group.innerHTML = `
            <h2>${capitalize(name)}</h2>
            <div class="slider-row">
                <label>-100</label>
                <input
                    type="range"
                    min="-100"
                    max="100"
                    value="${value}"
                    class="slider"
                    data-slider="${name}"
                    id="slider_${name}"
                >
                <span class="slider-value" id="value_${name}">${value}</span>
                <label>+100</label>
            </div>
            <div class="slider-row">
                <label>Weight:</label>
                <input
                    type="number"
                    min="0"
                    max="100"
                    value="${weight}"
                    class="weight-input"
                    data-weight="${name}"
                    id="weight_${name}"
                >
                <span style="color: #999; font-size: 12px;">%</span>
            </div>
        `;

        container.appendChild(group);
    }

    // Add weight total indicator
    const totalDiv = document.createElement('div');
    totalDiv.className = 'weight-total';
    totalDiv.id = 'weightTotal';
    container.appendChild(totalDiv);

    // Add event listeners
    document.querySelectorAll('.slider').forEach(slider => {
        slider.addEventListener('input', (e) => {
            const name = e.target.dataset.slider;
            config.sliders[name] = parseInt(e.target.value);
            document.getElementById(`value_${name}`).textContent = e.target.value;
        });
    });

    document.querySelectorAll('.weight-input').forEach(input => {
        input.addEventListener('input', (e) => {
            const name = e.target.dataset.weight;
            config.weights[name] = parseInt(e.target.value) || 0;
            updateWeightTotal();
        });
    });

    updateWeightTotal();
}

// Update weight total display
function updateWeightTotal() {
    const total = Object.values(config.weights).reduce((sum, w) => sum + w, 0);
    const div = document.getElementById('weightTotal');

    if (total === 100) {
        div.className = 'weight-total ok';
        div.textContent = `✓ Weights total: ${total}%`;
    } else {
        div.className = 'weight-total error';
        div.textContent = `✗ Weights total: ${total}% (must be 100%)`;
    }
}

// Convert text to Title Case
function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

// Save config to localStorage
function saveConfig() {
    const total = Object.values(config.weights).reduce((sum, w) => sum + w, 0);

    if (total !== 100) {
        showStatus('Weights must add up to 100%', false);
        return;
    }

    localStorage.setItem('pet_config', JSON.stringify(config));
    showStatus('Settings saved!', true);
}

// Save API key
function saveApiKey() {
    const input = document.getElementById('apiKeyInput');
    const key = input.value.trim();
    if (key) {
        localStorage.setItem('gemini_api_key', key);
        showStatus('API key saved!', true);
    } else {
        localStorage.removeItem('gemini_api_key');
        showStatus('API key removed.', true);
    }
}

// Show status message
function showStatus(message, isSuccess) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = isSuccess ? 'status success' : 'status error';
}

// Event listeners
document.getElementById('saveBtn').addEventListener('click', saveConfig);
document.getElementById('saveApiKeyBtn').addEventListener('click', saveApiKey);
document.getElementById('backBtn').addEventListener('click', () => {
    window.location.href = 'index.html';
});

// Load existing API key into field
window.addEventListener('load', () => {
    const existingKey = localStorage.getItem('gemini_api_key') || '';
    document.getElementById('apiKeyInput').value = existingKey;
});

// Initialize
loadConfig();
