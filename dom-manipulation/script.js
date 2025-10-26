// script.js

// Initial quotes array
const quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
    { text: "Innovation distinguishes between a leader and a follower.", category: "Leadership" },
    { text: "Your time is limited, so don't waste it living someone else's life.", category: "Life" },
    { text: "Stay hungry, stay foolish.", category: "Wisdom" },
    { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", category: "Perseverance" }
];

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');

// Initialize the application
function initializeApp() {
    createAddQuoteForm();
    showRandomQuote();
}

// Show a random quote
function showRandomQuote() {
    if (quotes.length === 0) {
        quoteDisplay.innerHTML = '<p>No quotes available. Please add some quotes first.</p>';
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];
    
    quoteDisplay.innerHTML = `
        <p>"${randomQuote.text}"</p>
        <p><em>— ${randomQuote.category}</em></p>
    `;
}

// Create the add quote form dynamically using appendChild
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
    
    // Insert the form after the quote display using appendChild
    document.body.appendChild(formContainer);
}

// Add a new quote to the array and update display
function addQuote() {
    const quoteText = document.getElementById('newQuoteText').value.trim();
    const quoteCategory = document.getElementById('newQuoteCategory').value.trim();
    
    if (!quoteText || !quoteCategory) {
        alert('Please fill in both quote text and category');
        return;
    }
    
    // Add the new quote to the array
    quotes.push({
        text: quoteText,
        category: quoteCategory
    });
    
    // Clear the form
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    
    // Show confirmation
    alert('Quote added successfully!');
    
    // Show a random quote (could be the new one)
    showRandomQuote();
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    newQuoteBtn.addEventListener('click', showRandomQuote);
    initializeApp();
});