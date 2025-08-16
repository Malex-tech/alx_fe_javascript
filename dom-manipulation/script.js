// Default quotes if none exist in localStorage
let quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" }
];

// DOM references
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteButton = document.getElementById("newQuote");
const sessionInfo = document.getElementById("sessionInfo");
const categoryFilter = document.getElementById("categoryFilter");
const syncStatus = document.getElementById("syncStatus");
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // Mock API


// --- Storage Functions ---
function saveQuotes() {
  localStorage.setItem("quotesData", JSON.stringify(quotes));
}

function loadQuotes() {
  const savedQuotes = localStorage.getItem("quotesData");
  if (savedQuotes) {
    quotes = JSON.parse(savedQuotes);
  }
}

// --- Category Functions ---
function populateCategories() {
  // Clear dropdown except "All"
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];
  uniqueCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore last selected category if it exists
  const savedCategory = localStorage.getItem("lastCategoryFilter");
  if (savedCategory && categoryFilter.querySelector(`option[value="${savedCategory}"]`)) {
    categoryFilter.value = savedCategory;
  }
}

function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem("lastCategoryFilter", selectedCategory);

  if (selectedCategory === "all") {
    showRandomQuote(); // Show any random quote
    return;
  }

  // Show only quotes in selected category
  const filtered = quotes.filter(q => q.category === selectedCategory);
  if (filtered.length === 0) {
    quoteDisplay.innerHTML = `<p>No quotes available in "${selectedCategory}" category.</p>`;
    return;
  }
  
  const randomIndex = Math.floor(Math.random() * filtered.length);
  const quote = filtered[randomIndex];

  quoteDisplay.innerHTML = "";
  const quoteText = document.createElement("p");
  quoteText.textContent = `"${quote.text}"`;

  const quoteCategory = document.createElement("small");
  quoteCategory.textContent = ` - ${quote.category}`;
  quoteCategory.style.display = "block";
  quoteCategory.style.fontStyle = "italic";

  quoteDisplay.appendChild(quoteText);
  quoteDisplay.appendChild(quoteCategory);

  sessionStorage.setItem("lastCategory", quote.category);
  displaySessionInfo();
}

// --- Core Quote Features ---
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes available. Add some!</p>";
    return;
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  quoteDisplay.innerHTML = "";
  const quoteText = document.createElement("p");
  quoteText.textContent = `"${quote.text}"`;

  const quoteCategory = document.createElement("small");
  quoteCategory.textContent = ` - ${quote.category}`;
  quoteCategory.style.display = "block";
  quoteCategory.style.fontStyle = "italic";

  quoteDisplay.appendChild(quoteText);
  quoteDisplay.appendChild(quoteCategory);

  sessionStorage.setItem("lastCategory", quote.category);
  displaySessionInfo();
}

function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const newText = textInput.value.trim();
  const newCategory = categoryInput.value.trim();

  if (!newText || !newCategory) {
    alert("Both fields are required!");
    return;
  }

  quotes.push({ text: newText, category: newCategory });
  saveQuotes();
  populateCategories(); // Update dropdown dynamically

  textInput.value = "";
  categoryInput.value = "";

  alert("Quote added successfully!");
  filterQuotes(); // Show a quote from current filter
}

function createAddQuoteForm() {
  const formContainer = document.getElementById("quoteFormContainer");
  
  const quoteInput = document.createElement("input");
  quoteInput.type = "text";
  quoteInput.id = "newQuoteText";
  quoteInput.placeholder = "Enter a new quote";
  quoteInput.style.marginRight = "5px";

  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";
  categoryInput.style.marginRight = "5px";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.onclick = addQuote;

  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);
}

// --- JSON Import/Export ---
function exportToJsonFile() {
  const jsonString = JSON.stringify(quotes, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  link.click();

  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (!Array.isArray(importedQuotes)) {
        alert("Invalid file format: Expected an array of quotes.");
        return;
      }
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      alert("Quotes imported successfully!");
      filterQuotes();
    } catch (error) {
      alert("Error parsing JSON file: " + error.message);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// --- Session Info Display ---
function displaySessionInfo() {
  const lastCategory = sessionStorage.getItem("lastCategory");
  sessionInfo.textContent = lastCategory 
    ? `Last viewed quote category: ${lastCategory}` 
    : "No quote viewed yet in this session.";
}

// --- Initialization ---
loadQuotes();
createAddQuoteForm();
populateCategories();
newQuoteButton.addEventListener("click", filterQuotes);
filterQuotes(); // Start with filter applied
displaySessionInfo();

// --- Utility to show sync messages ---
function notifyUser(message, color = "blue") {
  syncStatus.textContent = `Sync Status: ${message}`;
  syncStatus.style.color = color;
}

// --- Simulate Fetch from Server ---
async function fetchQuotesFromServer() {
  try {
    notifyUser("Fetching from server...");
    const response = await fetch(SERVER_URL);
    const data = await response.json();

    // Simulate server quotes: take only first 5 and format them
    const serverQuotes = data.slice(0, 5).map(item => ({
      text: item.title,
      category: "Server"
    }));

    notifyUser("Data fetched successfully.", "green");
    return serverQuotes;

  } catch (error) {
    notifyUser("Fetch failed!", "red");
    console.error("Error fetching server data:", error);
    return [];
  }
}

// --- Merge Local and Server Data ---
function mergeQuotes(serverQuotes) {
  let updated = false;

  serverQuotes.forEach(serverQuote => {
    // Check if a similar quote exists locally
    const localIndex = quotes.findIndex(q => q.text === serverQuote.text);
    if (localIndex === -1) {
      // New quote from server -> add locally
      quotes.push(serverQuote);
      updated = true;
    } else {
      // If conflict (category mismatch), server wins
      if (quotes[localIndex].category !== serverQuote.category) {
        quotes[localIndex] = serverQuote;
        updated = true;
      }
    }
  });

  if (updated) {
    saveQuotes();
    populateCategories();
    filterQuotes();
    notifyUser("Data merged with server.", "green");
    alert("Quotes updated from server (server data took precedence).");
  } else {
    notifyUser("No changes from server.", "green");
  }
}

// --- Sync Logic ---
async function syncQuotesWithServer() {
  const serverQuotes = await fetchQuotesFromServer();
  if (serverQuotes.length > 0) {
    mergeQuotes(serverQuotes);
  }
}

// --- Manual Sync Button ---
function manualSync() {
  syncQuotesWithServer();
}

// --- Auto Sync Every 30 Seconds ---
setInterval(syncQuotesWithServer, 30000);