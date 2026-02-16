let config = {
    sliders: {},
    weights: {}
};

// Load config
async function loadConfig() {
    try {
        const response = await fetch('config.txt');
        const text = await response.text();
        parseConfig(text);
        renderSliders();
    } catch (error) {
        console.error('Error loading config:', error);
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

// Save config
function saveConfig() {
    const total = Object.values(config.weights).reduce((sum, w) => sum + w, 0);
    
    if (total !== 100) {
        showStatus('Weights must add up to 100%', false);
        return;
    }
    
    let configText = '[sliders]\n';
    for (const [name, value] of Object.entries(config.sliders)) {
        configText += `${name}=${value}\n`;
    }
    
    configText += '\n[weights]\n';
    for (const [name, weight] of Object.entries(config.weights)) {
        configText += `${name}=${weight}\n`;
    }
    
    // In a real app, you'd send this to a server
    // For now, just download it
    downloadFile(configText, 'config.txt');
    showStatus('Settings saved! Replace your config.txt file.', true);
}

// Download file helper
function downloadFile(content, filename) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// Show status message
function showStatus(message, isSuccess) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = isSuccess ? 'status success' : 'status error';
}

// Event listeners
document.getElementById('saveBtn').addEventListener('click', saveConfig);
document.getElementById('backBtn').addEventListener('click', () => {
    window.location.href = 'index.html';
});

// Initialize
loadConfig();
