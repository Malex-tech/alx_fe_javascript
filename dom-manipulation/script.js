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

// --- Core Features ---

function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes available. Add some!</p>";
    return;
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  // Clear and rebuild content dynamically
  quoteDisplay.innerHTML = "";
  const quoteText = document.createElement("p");
  quoteText.textContent = `"${quote.text}"`;
  
  const quoteCategory = document.createElement("small");
  quoteCategory.textContent = ` - ${quote.category}`;
  quoteCategory.style.display = "block";
  quoteCategory.style.fontStyle = "italic";

  quoteDisplay.appendChild(quoteText);
  quoteDisplay.appendChild(quoteCategory);

  // Save last viewed category in sessionStorage
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

  textInput.value = "";
  categoryInput.value = "";

  alert("Quote added successfully!");
  showRandomQuote();
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
      alert("Quotes imported successfully!");
      showRandomQuote();
    } catch (error) {
      alert("Error parsing JSON file: " + error.message);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// --- Session Storage Info Display ---
function displaySessionInfo() {
  const lastCategory = sessionStorage.getItem("lastCategory");
  sessionInfo.textContent = lastCategory 
    ? `Last viewed quote category: ${lastCategory}` 
    : "No quote viewed yet in this session.";
}

// --- Initialization ---
loadQuotes();
createAddQuoteForm();
newQuoteButton.addEventListener("click", showRandomQuote);
showRandomQuote();
displaySessionInfo();
