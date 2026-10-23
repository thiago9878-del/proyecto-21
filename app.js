// State Management
let transactions = [];

// DOM Elements
const balanceAmount = document.getElementById('balance-amount');
const incomeAmount = document.getElementById('income-amount');
const expenseAmount = document.getElementById('expense-amount');
const transactionList = document.getElementById('transaction-list');
const transactionForm = document.getElementById('transaction-form');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const typeSelect = document.getElementById('type');
const categorySelect = document.getElementById('category');
const progressBarFill = document.getElementById('progress-bar-fill');
const progressPercent = document.getElementById('progress-percent');
const budgetWarning = document.getElementById('budget-warning');
const filterBtns = document.querySelectorAll('.filter-btn');

// Initialize App
function init() {
    const localStorageTransactions = JSON.parse(localStorage.getItem('estudiante_presupuesto'));
    transactions = localStorageTransactions !== null ? localStorageTransactions : [];
    updateUI();
}

// Add Transaction
function addTransaction(e) {
    e.preventDefault();

    const description = descriptionInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const type = typeSelect.value;
    const category = categorySelect.value;

    if (description === '' || isNaN(amount) || amount <= 0) {
        alert('Por favor, ingresa una descripción válida y un monto positivo.');
        return;
    }

    const transaction = {
        id: generateID(),
        description,
        amount,
        type,
        category,
        date: new Date().toLocaleString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    };

    transactions.push(transaction);
    updateLocalStorage();
    updateUI();
    
    // Reset Form
    transactionForm.reset();
}

// Generate Random ID
function generateID() {
    return Math.floor(Math.random() * 100000000);
}

// Update LocalStorage
function updateLocalStorage() {
    localStorage.setItem('estudiante_presupuesto', JSON.stringify(transactions));
}

// Delete Transaction
function deleteTransaction(id) {
    if(confirm('¿Estás seguro de que deseas eliminar esta transacción?')) {
        transactions = transactions.filter(t => t.id !== id);
        updateLocalStorage();
        updateUI();
    }
}

// Calculate Totals and Update UI
function updateUI(filter = 'all') {
    // Filter transactions
    const filteredTransactions = transactions.filter(t => {
        if (filter === 'all') return true;
        return t.type === filter;
    });

    // Render List
    transactionList.innerHTML = '';
    filteredTransactions.forEach(t => {
        const li = document.createElement('li');
        li.classList.add('transaction-item', t.type);
        
        li.innerHTML = `
            <div class="item-info">
                <span class="item-title">${t.description}</span>
                <span class="item-meta">${t.category} • ${t.date}</span>
            </div>
            <div class="item-amount">
                ${t.type === 'income' ? '+' : '-'}$${t.amount.toLocaleString('es-ES', {minimumFractionDigits: 2})}
            </div>
            <button class="delete-btn" onclick="deleteTransaction(${t.id})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        transactionList.appendChild(li);
    });

    // Update Dashboard Numbers (based on ALL transactions, not just filtered)
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0);

    const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);

    const balance = income - expense;

    balanceAmount.innerText = `$${balance.toLocaleString('es-ES', {minimumFractionDigits: 2})}`;
    incomeAmount.innerText = `$${income.toLocaleString('es-ES', {minimumFractionDigits: 2})}`;
    expenseAmount.innerText = `$${expense.toLocaleString('es-ES', {minimumFractionDigits: 2})}`;

    // Update Progress Bar
    let percentage = 0;
    if (income > 0) {
        percentage = (expense / income) * 100;
    } else if (expense > 0) {
        percentage = 100; // Over budget if no income but expenses exist
    }

    const displayPercent = Math.min(Math.round(percentage), 100);
    progressBarFill.style.width = `${displayPercent}%`;
    progressPercent.innerText = `${Math.round(percentage)}%`;

    // Visual Alert Logic
    progressBarFill.classList.remove('warning', 'danger');
    budgetWarning.style.display = 'none';

    if (percentage >= 100) {
        progressBarFill.classList.add('danger');
        budgetWarning.innerHTML = '<i class="fas fa-exclamation-circle"></i> ¡Peligro! Has agotado todo tu presupuesto.';
        budgetWarning.style.display = 'block';
    } else if (percentage >= 80) {
        progressBarFill.classList.add('danger');
        budgetWarning.innerHTML = '<i class="fas fa-exclamation-triangle"></i> ¡Cuidado! Has superado el 80% de tus ingresos.';
        budgetWarning.style.display = 'block';
    } else if (percentage >= 60) {
        progressBarFill.classList.add('warning');
    }
}

// Event Listeners
transactionForm.addEventListener('submit', addTransaction);

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Update active class
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Filter UI
        updateUI(btn.dataset.filter);
    });
});

// Run Init
init();
