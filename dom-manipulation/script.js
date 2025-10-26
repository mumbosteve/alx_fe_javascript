// script.js

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categorySelect = document.getElementById('categorySelect');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteCategory = document.getElementById('newQuoteCategory');
const quoteCount = document.getElementById('quoteCount');
const categoryCount = document.getElementById('categoryCount');
const exportBtn = document.getElementById('exportBtn');
const clearStorageBtn = document.getElementById('clearStorageBtn');
const importFile = document.getElementById('importFile');
const sessionInfo = document.getElementById('sessionInfo');

// Load quotes from localStorage or use default quotes
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
    { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
    { text: "Innovation distinguishes between a leader and a follower.", category: "Leadership" },
    { text: "Your time is limited, so don't waste it living someone else's life.", category: "Life" },
    { text: "Stay hungry, stay foolish.", category: "Wisdom" },
    { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", category: "Perseverance" }
];

// Load session data
let sessionData = JSON.parse(sessionStorage.getItem('quoteSession')) || {
    lastViewedQuote: null,
    viewCount: 0
};

// Save quotes to localStorage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
    updateStats();
}

// Save session data
function saveSessionData() {
    sessionStorage.setItem('quoteSession', JSON.stringify(sessionData));
}

// Initialize categories in the dropdown
function initializeCategories() {
    // Get unique categories
    const categories = [...new Set(quotes.map(quote => quote.category))];
    
    // Clear existing options except "All Categories"
    while (categorySelect.children.length > 1) {
        categorySelect.removeChild(categorySelect.lastChild);
    }
    
    // Add categories to dropdown
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
    
    // Update stats
    updateStats();
}

// Show a random quote
function showRandomQuote() {
    const selectedCategory = categorySelect.value;
    let filteredQuotes = quotes;
    
    // Filter by category if not "all"
    if (selectedCategory !== 'all') {
        filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
    }
    
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
function addQuote() {
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
    
    // Add the new quote
    quotes.push({ text, category });
    
    // Save to localStorage
    saveQuotes();
    
    // Clear form
    newQuoteText.value = '';
    newQuoteCategory.value = '';
    
    // Update UI
    initializeCategories();
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
    if (sessionData.lastViewedQuote) {
        sessionInfo.textContent = `Last viewed: "${sessionData.lastViewedQuote.text}" (${sessionData.lastViewedQuote.category}) | Views: ${sessionData.viewCount}`;
    } else {
        sessionInfo.textContent = 'Last viewed quote: None';
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
            
            // Add imported quotes
            quotes.push(...importedQuotes);
            saveQuotes();
            initializeCategories();
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
        sessionData = { lastViewedQuote: null, viewCount: 0 };
        
        initializeCategories();
        updateSessionInfo();
        quoteDisplay.innerHTML = '<p>All data has been cleared. Add new quotes to get started.</p>';
        
        alert('All data has been cleared.');
    }
}

// Create the add quote form dynamically
function createAddQuoteForm() {
    const formContainer = document.createElement('div');
    
    // Create heading
    const heading = document.createElement('h2');
    heading.textContent = 'Add New Quote';
    formContainer.appendChild(heading);
    
    // Create input container
    const inputContainer = document.createElement('div');
    
    // Create quote text input
    const quoteTextInput = document.createElement('input');
    quoteTextInput.type = 'text';
    quoteTextInput.id = 'newQuoteText';
    quoteTextInput.placeholder = 'Enter a new quote';
    inputContainer.appendChild(quoteTextInput);
    
    // Create category input
    const categoryInput = document.createElement('input');
    categoryInput.type = 'text';
    categoryInput.id = 'newQuoteCategory';
    categoryInput.placeholder = 'Enter quote category';
    inputContainer.appendChild(categoryInput);
    
    // Create add button
    const addButton = document.createElement('button');
    addButton.textContent = 'Add Quote';
    addButton.onclick = addQuote;
    inputContainer.appendChild(addButton);
    
    // Add input container to form container
    formContainer.appendChild(inputContainer);
    
    // Insert the form after the quote display
    document.body.appendChild(formContainer);
}

// Initialize the application
function initializeApp() {
    createAddQuoteForm();
    initializeCategories();
    updateSessionInfo();
    showRandomQuote();
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    newQuoteBtn.addEventListener('click', showRandomQuote);
    exportBtn.addEventListener('click', exportToJson);
    clearStorageBtn.addEventListener('click', clearAllData);
    importFile.addEventListener('change', importFromJsonFile);
    initializeApp();
});