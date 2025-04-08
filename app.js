// Initialize the data structure with cards and their transactions
let walletData = {
 cards: [
   {
     id: 'total',
     title: 'Gesamtguthaben',
     amount: '0,00 €',
     number: '',
     class: 'total-card',
     // Total card shows all transactions
     showAllTransactions: true
   },
 ],
 transactions: []
};

// Set up active card tracking (default to total)
let activeCardId = 'total';
let selectedCardColor = "135deg, #3b82f6, #2563eb";
let selectedIconColor = "#3b82f6";
let activeTransactionType = "income";

// Function to safely save data to localStorage with error handling
function saveToLocalStorage() {
 try {
   localStorage.setItem('walletData', JSON.stringify(walletData));
   localStorage.setItem('activeCardId', activeCardId);
   return true;
 } catch (error) {
   console.error("Fehler beim Speichern in localStorage:", error);
   alert("Ihre Daten konnten nicht gespeichert werden. Möglicherweise ist der Speicherplatz voll oder der Privat-Modus aktiv.");
   return false;
 }
}

// Function to safely load data from localStorage with error handling
function loadFromLocalStorage() {
 try {
   const savedData = localStorage.getItem('walletData');
   const savedActiveCardId = localStorage.getItem('activeCardId');

   if (savedData) {
     walletData = JSON.parse(savedData);

     // Ensure the total card is always present
     if (!walletData.cards.some(card => card.id === 'total')) {
       walletData.cards.unshift({
         id: 'total',
         title: 'Gesamtguthaben',
         amount: '0,00 €',
         number: '',
         class: 'total-card',
         showAllTransactions: true
       });
     }
   }

   if (savedActiveCardId) {
     // Make sure the saved activeCardId still exists in our cards
     if (walletData.cards.some(card => card.id === savedActiveCardId)) {
       activeCardId = savedActiveCardId;
     } else {
       activeCardId = 'total'; // Default to total if the saved card no longer exists
     }
   }
 } catch (error) {
   console.error("Fehler beim Laden aus localStorage:", error);
   // Reset to defaults on error
   walletData = {
     cards: [
       {
         id: 'total',
         title: 'Gesamtguthaben',
         amount: '0,00 €',
         number: '',
         class: 'total-card',
         showAllTransactions: true
       },
     ],
     transactions: []
   };
   activeCardId = 'total';
 }
}

// Function to render transactions based on the active card
function renderTransactions(cardId) {
 const transactionList = document.querySelector('.transaction-list');
 transactionList.innerHTML = ''; // Clear existing transactions

 // Find the active card
 const activeCard = walletData.cards.find(card => card.id === cardId);
 if (!activeCard) {
   console.error("Karte nicht gefunden:", cardId);
   return;
 }

 // Filter transactions based on the card
 let filteredTransactions = walletData.transactions;

 // If it's not the total card and it doesn't show all transactions, filter by cardId
 if (!activeCard.showAllTransactions) {
   filteredTransactions = filteredTransactions.filter(transaction => transaction.cardId === cardId);
 }

 // Update section title to show which card's transactions we're viewing
 document.querySelector('.section-title span:first-child').textContent =
   `Transaktionen ${activeCard.showAllTransactions ? 'Alle Konten' : `- ${activeCard.title}`}`;

 // Generate transaction HTML
 filteredTransactions.forEach(transaction => {
   const transactionEl = document.createElement('div');
   transactionEl.className = 'transaction-item';

   // Determine if it's income (positive amount) or expense
   const isIncome = transaction.amount.includes('+');
   const amountStyle = isIncome ? 'background-color: #dcfce7; color: #16a34a;' : 'background-color: #fee2e2; color: #ef4444;';

   transactionEl.innerHTML = `
     <div class="transaction-info">
       <div class="transaction-icon" style="background-color: ${transaction.iconColor};">${transaction.icon}</div>
       <div class="transaction-details">
         <div class="transaction-name">${transaction.name}</div>
         <div class="transaction-date">${transaction.date}</div>
       </div>
     </div>
     <div class="transaction-amount" style="${amountStyle}">${transaction.amount}</div>
   `;

   transactionList.appendChild(transactionEl);
 });

 // If no transactions for this card
 if (filteredTransactions.length === 0) {
   const emptyMessage = document.createElement('div');
   emptyMessage.style.padding = '20px 0';
   emptyMessage.style.textAlign = 'center';
   emptyMessage.style.color = '#777';
   emptyMessage.textContent = 'Keine Transaktionen verfügbar';
   transactionList.appendChild(emptyMessage);
 }
}

// Function to highlight the active card
function highlightActiveCard(cardId) {
 // Remove highlight from all cards
 document.querySelectorAll('.card').forEach(card => {
   card.style.transform = 'scale(1)';
   card.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
 });

 // Add highlight to active card
 const activeCard = document.querySelector(`.card[data-card-id="${cardId}"]`);
 if (activeCard && !activeCard.classList.contains('add-card')) {
   activeCard.style.transform = 'scale(1.05)';
   activeCard.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
 }
}

// Function to smooth scroll to a card
function scrollToCard(cardId) {
 const cardElement = document.querySelector(`.card[data-card-id="${cardId}"]`);
 if (cardElement) {
   const cardContainer = document.querySelector('.card-container');
   const containerLeft = cardContainer.getBoundingClientRect().left;
   const cardLeft = cardElement.getBoundingClientRect().left;

   cardContainer.scrollTo({
     left: cardContainer.scrollLeft + (cardLeft - containerLeft) - 20, // 20px is some offset
     behavior: 'smooth'
   });
 }
}

// Parse a money amount string to a floating-point number
function parseMoneyAmount(amountStr) {
 // Remove any non-numeric characters except for commas, dots, and minus sign
 let cleanAmount = amountStr.replace(/[^0-9,.,-]/g, '');

 // Check if it's a negative amount
 const isNegative = cleanAmount.includes('-');

 // Remove all non-numeric characters except comma or dot
 cleanAmount = cleanAmount.replace(/[^0-9,.]/g, '');

 // Replace comma with dot for parsing
 cleanAmount = cleanAmount.replace(',', '.');

 // Parse to float
 let amount = parseFloat(cleanAmount);

 // Apply negative sign if needed
 if (isNegative) {
   amount = -amount;
 }

 return isNaN(amount) ? 0 : amount;
}

// Format a number to a money string with German formatting
function formatMoneyAmount(amount) {
 return amount.toLocaleString('de-DE', {
   minimumFractionDigits: 2,
   maximumFractionDigits: 2
 }).replace('.', ',') + ' €';
}

// Set up the cards
function initializeCards() {
 const cardContainer = document.querySelector('.card-container');
 cardContainer.innerHTML = ''; // Clear existing cards

 // Add each card with data attributes
 walletData.cards.forEach(card => {
   const cardEl = document.createElement('div');
   cardEl.className = `card ${card.class || ''}`;
   cardEl.setAttribute('data-card-id', card.id);

   if (card.gradient) {
     cardEl.style.background = `linear-gradient(${card.gradient})`;
   }

   cardEl.innerHTML = `
     <div class="card-title">${card.title}</div>
     <div class="card-amount">${card.amount}</div>
     <div class="card-number">${card.type || "Standardkonto"}</div>
   `;

   // Add click handler to each card
   cardEl.addEventListener('click', () => {
     activeCardId = card.id;
     highlightActiveCard(activeCardId);
     renderTransactions(activeCardId);
     updateCarouselIndicators(); // Update indicators when clicking a card
     saveToLocalStorage(); // Save the active card change
   });

   cardContainer.appendChild(cardEl);
 });

 // Add the "Add card" button
 const addCardEl = document.createElement('div');
 addCardEl.className = 'card add-card';
 addCardEl.innerHTML = `
   <div class="add-icon">+</div>
   <div>Konto hinzufügen</div>
 `;

 addCardEl.addEventListener('click', () => {
   openModal('addCardModal');
 });

 cardContainer.appendChild(addCardEl);
}

// Set up navigation items
function setupNavigation() {
 document.querySelectorAll('.nav-item').forEach((item, index) => {
   // Clean up existing event listeners (removes duplications)
   const newItem = item.cloneNode(true);
   item.parentNode.replaceChild(newItem, item);

   newItem.addEventListener('click', function() {
     // Remove active class from all items
     document.querySelectorAll('.nav-item').forEach(navItem => {
       navItem.classList.remove('active');
     });

     // Add active class to clicked item
     this.classList.add('active');

   });
 });

 // Handle see all transactions
 const seeAllButton = document.querySelector('.see-all');
 // Clean up existing event listeners
 const newSeeAllButton = seeAllButton.cloneNode(true);
 seeAllButton.parentNode.replaceChild(newSeeAllButton, seeAllButton);

 newSeeAllButton.addEventListener('click', function() {
   alert('Hier würden alle Transaktionen angezeigt');
 });
}

// Set up scroll handling to detect which card is in view
// Aktualisieren Sie die setupCardScrollHandling-Funktion:
function setupCardScrollHandling() {
 const cardContainer = document.querySelector('.card-container');

 // Clean up existing event listeners
 const newCardContainer = cardContainer.cloneNode(false);
 while (cardContainer.firstChild) {
   newCardContainer.appendChild(cardContainer.firstChild);
 }
 cardContainer.parentNode.replaceChild(newCardContainer, cardContainer);

 newCardContainer.addEventListener('scroll', () => {
   // Using a simple approach to determine which card is most centered
   const containerRect = newCardContainer.getBoundingClientRect();
   const containerCenter = containerRect.left + containerRect.width / 2;

   let closestCard = null;
   let smallestDistance = Infinity;

   document.querySelectorAll('.card:not(.add-card)').forEach(card => {
     const cardRect = card.getBoundingClientRect();
     const cardCenter = cardRect.left + cardRect.width / 2;
     const distance = Math.abs(containerCenter - cardCenter);

     if (distance < smallestDistance) {
       smallestDistance = distance;
       closestCard = card;
     }
   });

   // If we found a closest card and it's different from the current active card
   if (closestCard) {
     const newActiveId = closestCard.getAttribute('data-card-id');
     if (newActiveId !== activeCardId) {
       activeCardId = newActiveId;
       highlightActiveCard(activeCardId);
       renderTransactions(activeCardId);
       saveToLocalStorage(); // Save the active card change
       updateCarouselIndicators(); // Update indicators when scrolling
     }
   }
 });
}

// Modal functions
function openModal(modalId) {
 const modal = document.getElementById(modalId);
 modal.classList.add('active');

 // Set up close handlers
 const closeBtn = modal.querySelector('.modal-close');
 const cancelBtn = modal.querySelector('.btn-cancel');

 // Clean up existing event listeners to prevent duplicates
 const newCloseBtn = closeBtn.cloneNode(true);
 closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
 const newCancelBtn = cancelBtn.cloneNode(true);
 cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

 // Add new event listeners
 newCloseBtn.addEventListener('click', () => closeModal(modalId));
 newCancelBtn.addEventListener('click', () => closeModal(modalId));

 // Close on outside click
 const clickHandler = (e) => {
   if (e.target === modal) {
     closeModal(modalId);
     modal.removeEventListener('click', clickHandler);
   }
 };
 modal.addEventListener('click', clickHandler);

 // Set up appropriate form handling
 if (modalId === 'addCardModal') {
   setupAddCardForm();
 } else if (modalId === 'transactionModal') {
   setupTransactionForm();
 }
}

function closeModal(modalId) {
 const modal = document.getElementById(modalId);
 modal.classList.remove('active');

 // Reset form fields
 if (modalId === 'addCardModal') {
   document.getElementById('card-title').value = '';
   document.getElementById('card-amount').value = '';
   document.getElementById('card-type').value = 'Girokonto';

   // Reset color selection
   modal.querySelectorAll('.color-option').forEach((opt, index) => {
     if (index === 0) {
       opt.classList.add('selected');
     } else {
       opt.classList.remove('selected');
     }
   });
 } else if (modalId === 'transactionModal') {
   document.getElementById('transaction-name').value = '';
   document.getElementById('transaction-amount').value = '';
   document.getElementById('transaction-icon').value = '';

   // Reset color selection
   modal.querySelectorAll('.color-option').forEach((opt, index) => {
     if (index === 0) {
       opt.classList.add('selected');
     } else {
       opt.classList.remove('selected');
     }
   });
 }
}

function setupAddCardForm() {
 const form = document.getElementById('addCardModal');
 const colorOptions = form.querySelectorAll('.color-option');
 const submitBtn = form.querySelector('.btn-primary');

 // Clean up existing event listeners on submit button
 const newSubmitBtn = submitBtn.cloneNode(true);
 submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);

 // Clean up existing event listeners on color options
 colorOptions.forEach(option => {
   const newOption = option.cloneNode(true);
   option.parentNode.replaceChild(newOption, option);

   newOption.addEventListener('click', () => {
     // Remove selected from all
     form.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
     // Add selected to clicked
     newOption.classList.add('selected');
     // Store the selected gradient
     selectedCardColor = newOption.getAttribute('data-gradient');
   });
 });

 // Form submission
 newSubmitBtn.addEventListener('click', function() {
   const title = document.getElementById('card-title').value.trim();
   const amount = document.getElementById('card-amount').value.trim();
   const type = document.getElementById('card-type').value;

   if (!title) {
     alert('Bitte geben Sie einen Kontonamen ein');
     return;
   }

   if (!amount) {
     alert('Bitte geben Sie einen Kontostand ein');
     return;
   }

   // Validiere den Betrag
   if (!/^-?\d+([,.]\d{1,2})?( ?€)?$/.test(amount.replace(/\s/g, ''))) {
     alert('Bitte geben Sie einen gültigen Betrag ein (z.B. 100,00 oder 100)');
     return;
   }

   // Parse amount to a number
   let numericAmount = parseMoneyAmount(amount);

   // Format amount consistently
   let formattedAmount = formatMoneyAmount(numericAmount);

   // Add new card to data
   const newCardId = 'card_' + Date.now();
   const newCard = {
     id: newCardId,
     title: title,
     amount: formattedAmount,
     number: '',
     type: type,
     gradient: selectedCardColor
   };

   walletData.cards.push(newCard);

   // Save changes to localStorage
   saveToLocalStorage();

   // Refresh cards and select the new one
   refreshUI();
   activeCardId = newCardId;
   highlightActiveCard(activeCardId);
   scrollToCard(activeCardId);
   renderTransactions(activeCardId);
   updateCarouselIndicators(); // Update indicators after adding a new card

   // Update total balance
   updateTotalBalance();

   // Close modal
   closeModal('addCardModal');
 });
}

function openTransactionModal(type) {
 // Open the transaction modal
 openModal('transactionModal');

 // Set the title based on transaction type
 const modalTitle = document.querySelector('#transactionModal .modal-title');
 if (type === "income") {
   modalTitle.textContent = 'Einnahme hinzufügen';
 } else {
   modalTitle.textContent = 'Ausgabe hinzufügen';
 }
}

// Set up transaction form
function setupTransactionForm() {
 const form = document.getElementById('transactionModal');
 const colorOptions = form.querySelectorAll('.color-option');
 const submitBtn = form.querySelector('.btn-primary');
 const transactionCardSelect = document.getElementById('transaction-card');

 // Clean up existing event listeners on submit button
 const newSubmitBtn = submitBtn.cloneNode(true);
 submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);

 // Clean up existing event listeners on color options
 colorOptions.forEach(option => {
   const newOption = option.cloneNode(true);
   option.parentNode.replaceChild(newOption, option);

   newOption.addEventListener('click', () => {
     // Remove selected from all
     form.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('selected'));
     // Add selected to clicked
     newOption.classList.add('selected');
     // Store the selected color
     selectedIconColor = newOption.getAttribute('data-color');
   });
 });

 // Populate the card dropdown with available cards
 transactionCardSelect.innerHTML = '';
 let nonTotalCards = walletData.cards.filter(card => card.id !== 'total');

 if (nonTotalCards.length > 0) {
   nonTotalCards.forEach(card => {
     const option = document.createElement('option');
     option.value = card.id;
     option.textContent = card.title;
     // Select active card by default, unless it's the total card
     if (card.id === activeCardId || (activeCardId === 'total' && card === nonTotalCards[0])) {
       option.selected = true;
     }
     transactionCardSelect.appendChild(option);
   });
   newSubmitBtn.disabled = false;
 } else {
   // If no cards are available except total, show a message
   const option = document.createElement('option');
   option.value = '';
   option.textContent = 'Bitte zuerst ein Konto erstellen';
   option.disabled = true;
   option.selected = true;
   transactionCardSelect.appendChild(option);
   newSubmitBtn.disabled = true;
 }

 // Form submission
 newSubmitBtn.addEventListener('click', function() {
   if (this.disabled) return;

   const name = document.getElementById('transaction-name').value.trim();
   const amount = document.getElementById('transaction-amount').value.trim();
   const cardId = document.getElementById('transaction-card').value;
   const icon = document.getElementById('transaction-icon').value.trim() || 'T';

   if (!name) {
     alert('Bitte geben Sie eine Beschreibung ein');
     return;
   }

   if (!amount) {
     alert('Bitte geben Sie einen Betrag ein');
     return;
   }

   // Validiere den Betrag
   if (!/^\d+([,.]\d{1,2})?( ?€)?$/.test(amount.replace(/\s/g, ''))) {
     alert('Bitte geben Sie einen gültigen Betrag ein (z.B. 100,00 oder 100)');
     return;
   }

   if (!cardId) {
     alert('Bitte wählen Sie ein Konto aus');
     return;
   }

   // Parse amount to a number
   let numericAmount = parseMoneyAmount(amount);

   // Add sign based on transaction type
   if (activeTransactionType === "expense") {
     numericAmount = -Math.abs(numericAmount);
   } else {
     numericAmount = Math.abs(numericAmount);
   }

   // Format with sign for display
   let formattedAmount = (numericAmount >= 0 ? '+' : '-') +
                        formatMoneyAmount(Math.abs(numericAmount)).trim();

   // Get current date and time for transaction
   const now = new Date();
   const options = { hour: '2-digit', minute: '2-digit' };
   const timeString = now.toLocaleTimeString('de-DE', options);
   const dateString = `Heute, ${timeString} Uhr`;

   // Add new transaction to data
   const newTransaction = {
     id: Date.now(),
     name: name,
     date: dateString,
     amount: formattedAmount,
     icon: icon.charAt(0).toUpperCase(),
     iconColor: selectedIconColor,
     cardId: cardId
   };

   walletData.transactions.unshift(newTransaction);

   // Update card balances
   updateCardBalances(newTransaction);

   // Save changes to localStorage
   saveToLocalStorage();

   // Refresh UI
   refreshUI();

   // Close modal
   closeModal('transactionModal');
 });
}

// Function to update card balances when adding new transactions
function updateCardBalances(transaction) {
 // Find the card for this transaction
 const card = walletData.cards.find(card => card.id === transaction.cardId);
 if (card) {
   // Parse transaction amount
   const transactionAmount = parseMoneyAmount(transaction.amount);

   // Parse card balance
   const cardBalance = parseMoneyAmount(card.amount);

   // Calculate new balance (transaction amount already has correct sign)
   const newBalance = cardBalance + transactionAmount;

   // Update card amount with formatted new balance
   card.amount = formatMoneyAmount(newBalance);

   // Update total balance
   updateTotalBalance();
 }
}

// Function to update total balance by summing all other cards
function updateTotalBalance() {
 let total = 0;

 // Sum up all non-total card balances
 walletData.cards.forEach(card => {
   if (card.id !== 'total') {
     const amount = parseMoneyAmount(card.amount);
     total += amount;
   }
 });

 // Update the total card
 const totalCard = walletData.cards.find(card => card.id === 'total');
 if (totalCard) {
   totalCard.amount = formatMoneyAmount(total);
 }

 // Save the updated data
 saveToLocalStorage();
}

// Refresh the entire UI
function refreshUI() {
 initializeCards();
 highlightActiveCard(activeCardId);
 renderTransactions(activeCardId);
 updateCarouselIndicators(); // Aktualisieren Sie die Indikatoren beim Refresh der UI
}

// Function to clear all data (for testing/reset)
function clearAllData() {
 localStorage.removeItem('walletData');
 localStorage.removeItem('activeCardId');
 location.reload();
}

// Initialize the application
function init() {
 // Load data from localStorage first
 loadFromLocalStorage();

 // Setup the UI with loaded data
 initializeCards();
 highlightActiveCard(activeCardId);
 renderTransactions(activeCardId);
 setupNavigation();
 setupCardScrollHandling();

 // Calculate total
 updateTotalBalance();
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
