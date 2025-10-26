// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categoryFilter = document.getElementById('categoryFilter');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteCategory = document.getElementById('newQuoteCategory');
const quoteCount = document.getElementById('quoteCount');
const categoryCount = document.getElementById('categoryCount');
const filteredCount = document.getElementById('filteredCount');
const exportBtn = document.getElementById('exportBtn');
const clearStorageBtn = document.getElementById('clearStorageBtn');
const importFile = document.getElementById('importFile');
const sessionInfo = document.getElementById('sessionInfo');
const syncStatus = document.getElementById('syncStatus');
const syncNowBtn = document.getElementById('syncNowBtn');
const resolveConflictsBtn = document.getElementById('resolveConflictsBtn');
const conflictResolutionModal = document.getElementById('conflictResolutionModal');
const conflictMessage = document.getElementById('conflictMessage');
const conflictOptions = document.getElementById('conflictOptions');
const closeConflictModal = document.getElementById('closeConflictModal');

// Server simulation using JSONPlaceholder
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts';
let serverQuotes = [];
let pendingConflicts = [];
let syncInterval;

// Load quotes from localStorage or use default quotes
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
    { id: generateId(), text: "The only way to do great work is to love what you do.", category: "Inspiration", version: 1 },
    { id: generateId(), text: "Innovation distinguishes between a leader and a follower.", category: "Leadership", version: 1 },
    { id: generateId(), text: "Your time is limited, so don't waste it living someone else's life.", category: "Life", version: 1 },
    { id: generateId(), text: "Stay hungry, stay foolish.", category: "Wisdom", version: 1 },
    { id: generateId(), text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", category: "Perseverance", version: 1 }
];

// Load session data
let sessionData = JSON.parse(sessionStorage.getItem('quoteSession')) || {
    lastViewedQuote: null,
    viewCount: 0,
    lastFilter: 'all',
    lastSync: null
};

// Generate unique ID for quotes
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Save quotes to localStorage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
    updateStats();
}

// Save session data
function saveSessionData() {
    sessionStorage.setItem('quoteSession', JSON.stringify(sessionData));
}

// Update sync status display
function updateSyncStatus(message, type = 'info') {
    const colors = {
        info: '#e7f3ff',
        success: '#d4edda',
        warning: '#fff3cd',
        error: '#f8d7da'
    };
    syncStatus.style.backgroundColor = colors[type] || colors.info;
    syncStatus.textContent = `Sync: ${message}`;
    syncStatus.style.display = 'block';
}

// Simulate fetching data from server
async function fetchFromServer() {
    updateSyncStatus('Fetching data from server...', 'info');
    
    try {
        // Simulate server delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In a real app, this would be: const response = await fetch(SERVER_URL);
        // For simulation, we'll create mock server data
        const mockServerData = [
            { id: 'server1', text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams", version: 2 },
            { id: 'server2', text: "It is during our darkest moments that we must focus to see the light.", category: "Perseverance", version: 1 },
            { id: 'server3', text: "Whoever is happy will make others happy too.", category: "Happiness", version: 1 }
        ];
        
        serverQuotes = mockServerData;
        updateSyncStatus('Server data fetched successfully', 'success');
        return mockServerData;
    } catch (error) {
        updateSyncStatus('Failed to fetch from server', 'error');
        console.error('Server fetch error:', error);
        return [];
    }
}

// Simulate posting data to server
async function postToServer(data) {
    updateSyncStatus('Sending data to server...', 'info');
    
    try {
        // Simulate server delay and processing
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // In a real app, this would be:
        // const response = await fetch(SERVER_URL, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(data)
        // });
        
        updateSyncStatus('Data sent to server successfully', 'success');
        return { success: true, id: generateId() };
    } catch (error) {
        updateSyncStatus('Failed to send data to server', 'error');
        console.error('Server post error:', error);
        return { success: false };
    }
}

// Sync data with server
async function syncWithServer() {
    const serverData = await fetchFromServer();
    
    if (serverData.length > 0) {
        const conflicts = await mergeData(serverData);
        
        if (conflicts.length > 0) {
            pendingConflicts = conflicts;
            resolveConflictsBtn.style.display = 'block';
            updateSyncStatus(`${conflicts.length} conflicts detected`, 'warning');
            showConflictNotification(conflicts);
        } else {
            updateSyncStatus('Sync completed successfully', 'success');
        }
        
        sessionData.lastSync = new Date().toISOString();
        saveSessionData();
        updateSessionInfo();
    }
}

// Merge server data with local data
async function mergeData(serverData) {
    const conflicts = [];
    const localQuoteMap = new Map(quotes.map(q => [q.id, q]));
    
    for (const serverQuote of serverData) {
        const localQuote = localQuoteMap.get(serverQuote.id);
        
        if (localQuote) {
            // Conflict detected - same ID but different content
            if (localQuote.text !== serverQuote.text || localQuote.category !== serverQuote.category) {
                if (serverQuote.version > (localQuote.version || 1)) {
                    // Server version is newer - auto-resolve using server data
                    const index = quotes.findIndex(q => q.id === serverQuote.id);
                    quotes[index] = { ...serverQuote };
                    conflicts.push({
                        type: 'auto-resolved',
                        local: localQuote,
                        server: serverQuote,
                        resolution: 'server'
                    });
                } else {
                    // Manual resolution needed
                    conflicts.push({
                        type: 'manual',
                        local: localQuote,
                        server: serverQuote
                    });
                }
            }
        } else {
            // New quote from server
            quotes.push(serverQuote);
        }
    }
    
    // Send local changes to server
    for (const localQuote of quotes) {
        if (!serverData.find(sq => sq.id === localQuote.id)) {
            await postToServer(localQuote);
        }
    }
    
    saveQuotes();
    populateCategories();
    return conflicts;
}

// Show conflict notification
function showConflictNotification(conflicts) {
    const manualConflicts = conflicts.filter(c => c.type === 'manual');
    
    if (manualConflicts.length > 0) {
        conflictMessage.textContent = `Found ${manualConflicts.length} conflicts that need manual resolution.`;
        conflictOptions.innerHTML = '';
        
        manualConflicts.forEach((conflict, index) => {
            const conflictDiv = document.createElement('div');
            conflictDiv.style.margin = '10px 0';
            conflictDiv.style.padding = '10px';
            conflictDiv.style.border = '1px solid #ccc';
            conflictDiv.style.borderRadius = '5px';
            
            conflictDiv.innerHTML = `
                <h4>Conflict ${index + 1}</h4>
                <p><strong>Local Version:</strong> "${conflict.local.text}" (${conflict.local.category})</p>
                <p><strong>Server Version:</strong> "${conflict.server.text}" (${conflict.server.category})</p>
                <div>
                    <button onclick="resolveConflict(${index}, 'local')">Keep Local</button>
                    <button onclick="resolveConflict(${index}, 'server')">Use Server</button>
                    <button onclick="resolveConflict(${index}, 'merge')">Merge</button>
                </div>
            `;
            conflictOptions.appendChild(conflictDiv);
        });
        
        conflictResolutionModal.style.display = 'block';
    }
}

// Resolve individual conflict
function resolveConflict(conflictIndex, resolution) {
    const conflict = pendingConflicts[conflictIndex];
    
    switch (resolution) {
        case 'local':
            // Keep local version - no changes needed
            break;
        case 'server':
            // Use server version
            const index = quotes.findIndex(q => q.id === conflict.local.id);
            quotes[index] = { ...conflict.server };
            break;
        case 'merge':
            // Create merged version
            const mergeIndex = quotes.findIndex(q => q.id === conflict.local.id);
            quotes[mergeIndex] = {
                ...conflict.local,
                text: `${conflict.local.text} (Also: ${conflict.server.text})`,
                version: Math.max(conflict.local.version || 1, conflict.server.version || 1) + 1
            };
            break;
    }
    
    // Remove from pending conflicts
    pendingConflicts.splice(conflictIndex, 1);
    
    if (pendingConflicts.length === 0) {
        resolveConflictsBtn.style.display = 'none';
        conflictResolutionModal.style.display = 'none';
        updateSyncStatus('All conflicts resolved', 'success');
    }
    
    saveQuotes();
    populateCategories();
    showRandomQuote();
}

// Populate categories in the dropdown
function populateCategories() {
    // Get unique categories
    const categories = [...new Set(quotes.map(quote => quote.category))];
    
    // Clear existing options except "All Categories"
    while (categoryFilter.children.length > 1) {
        categoryFilter.removeChild(categoryFilter.lastChild);
    }
    
    // Add categories to dropdown
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
    
    // Restore last selected filter
    const savedFilter = sessionData.lastFilter || 'all';
    categoryFilter.value = savedFilter;
    
    // Update stats
    updateStats();
}

// Filter quotes based on selected category
function filterQuotes() {
    const selectedCategory = categoryFilter.value;
    
    // Save filter preference
    sessionData.lastFilter = selectedCategory;
    saveSessionData();
    
    // Show a random quote from filtered category
    showRandomQuote();
}

// Show a random quote
function showRandomQuote() {
    const selectedCategory = categoryFilter.value;
    let filteredQuotes = quotes;
    
    // Filter by category if not "all"
    if (selectedCategory !== 'all') {
        filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
    }
    
    // Update filtered count
    filteredCount.textContent = `Showing: ${selectedCategory === 'all' ? 'All quotes' : `${filteredQuotes.length} quotes in ${selectedCategory}`}`;
    
    // If no quotes in selected category, show message
    if (filteredQuotes.length === 0) {
        quoteDisplay.innerHTML = `
            <p>No quotes available in the "${selectedCategory}" category.</p>
            <p>Try adding a quote or selecting a different category.</p>
        `;
        return;
    }
    
    // Get random quote
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const randomQuote = filteredQuotes[randomIndex];
    
    // Display the quote
    quoteDisplay.innerHTML = `
        <p>"${randomQuote.text}"</p>
        <p><em>— ${randomQuote.category}</em></p>
    `;
    
    // Update session data
    sessionData.lastViewedQuote = randomQuote;
    sessionData.viewCount++;
    saveSessionData();
    updateSessionInfo();
}

// Add a new quote
async function addQuote() {
    const text = newQuoteText.value.trim();
    const category = newQuoteCategory.value.trim();
    
    // Validate inputs
    if (!text) {
        alert('Please enter a quote text.');
        return;
    }
    
    if (!category) {
        alert('Please enter a category.');
        return;
    }
    
    // Create new quote with ID and version
    const newQuote = {
        id: generateId(),
        text,
        category,
        version: 1
    };
    
    // Add the new quote locally
    quotes.push(newQuote);
    
    // Save to localStorage
    saveQuotes();
    
    // Send to server
    await postToServer(newQuote);
    
    // Update categories dropdown if new category
    populateCategories();
    
    // Clear form
    newQuoteText.value = '';
    newQuoteCategory.value = '';
    
    // Show a random quote (could be the new one)
    showRandomQuote();
    
    // Show success message
    alert('Quote added successfully!');
}

// Update statistics
function updateStats() {
    const categories = [...new Set(quotes.map(quote => quote.category))];
    quoteCount.textContent = `Total Quotes: ${quotes.length}`;
    categoryCount.textContent = `Categories: ${categories.length}`;
}

// Update session information display
function updateSessionInfo() {
    const filterText = categoryFilter.value === 'all' ? 'All Categories' : categoryFilter.value;
    const lastSync = sessionData.lastSync ? new Date(sessionData.lastSync).toLocaleTimeString() : 'Never';
    
    if (sessionData.lastViewedQuote) {
        sessionInfo.textContent = `Last viewed: "${sessionData.lastViewedQuote.text}" | Views: ${sessionData.viewCount} | Current filter: ${filterText} | Last sync: ${lastSync}`;
    } else {
        sessionInfo.textContent = `Last viewed quote: None | Current filter: ${filterText} | Last sync: ${lastSync}`;
    }
}

// Export quotes to JSON file
function exportToJson() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'quotes.json';
    link.click();
    
    URL.revokeObjectURL(link.href);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const fileReader = new FileReader();
    fileReader.onload = function(e) {
        try {
            const importedQuotes = JSON.parse(e.target.result);
            
            // Validate imported data
            if (!Array.isArray(importedQuotes)) {
                throw new Error('Invalid JSON format: Expected an array of quotes');
            }
            
            // Add imported quotes with IDs and versions
            importedQuotes.forEach(quote => {
                if (!quote.id) quote.id = generateId();
                if (!quote.version) quote.version = 1;
                quotes.push(quote);
            });
            
            saveQuotes();
            populateCategories();
            showRandomQuote();
            
            alert(`Successfully imported ${importedQuotes.length} quotes!`);
            
            // Reset file input
            event.target.value = '';
        } catch (error) {
            alert('Error importing quotes: ' + error.message);
        }
    };
    fileReader.readAsText(file);
}

// Clear all data
function clearAllData() {
    if (confirm('Are you sure you want to clear all quotes and data? This action cannot be undone.')) {
        quotes = [];
        localStorage.removeItem('quotes');
        sessionStorage.removeItem('quoteSession');
        sessionData = { lastViewedQuote: null, viewCount: 0, lastFilter: 'all', lastSync: null };
        
        populateCategories();
        updateSessionInfo();
        quoteDisplay.innerHTML = '<p>All data has been cleared. Add new quotes to get started.</p>';
        
        alert('All data has been cleared.');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    newQuoteBtn.addEventListener('click', showRandomQuote);
    addQuoteBtn.addEventListener('click', addQuote);
    categoryFilter.addEventListener('change', filterQuotes);
    exportBtn.addEventListener('click', exportToJson);
    clearStorageBtn.addEventListener('click', clearAllData);
    importFile.addEventListener('change', importFromJsonFile);
    syncNowBtn.addEventListener('click', syncWithServer);
    resolveConflictsBtn.addEventListener('click', () => showConflictNotification(pendingConflicts));
    closeConflictModal.addEventListener('click', () => conflictResolutionModal.style.display = 'none');
    
    // Initialize the application
    populateCategories();
    updateSessionInfo();
    showRandomQuote();
    
    // Start periodic syncing (every 30 seconds)
    syncInterval = setInterval(syncWithServer, 30000);
    
    // Initial sync
    setTimeout(syncWithServer, 2000);
});

// Make resolveConflict function available globally
window.resolveConflict = resolveConflict;