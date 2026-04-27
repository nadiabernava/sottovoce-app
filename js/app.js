// Sottovoce v1.0-beta
// App state
const appState = {
    currentUser: null,
    checkIns: [],
    tasks: {
        'cose-per-me': [],
        'cose-per-chi-amo': [],
        'cose-per-la-casa': []
    },
    currentSection: 'checkin'
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    initializeCheckIn();
    initializeTasks();
});

// ===== CHECK-IN LOGIC =====

function initializeCheckIn() {
    const checkinSection = document.getElementById('checkin');
    
    const states = [
        {
            id: 'bene',
            label: 'Sto bene, sono presente',
            icon: '✓'
        },
        {
            id: 'stanca',
            label: 'Sono stanca/o, ma ce la faccio',
            icon: '⏳'
        },
        {
            id: 'agitata',
            label: 'Sono agitata/o, non riesco a fermarmi',
            icon: '⚡'
        },
        {
            id: 'sopraffatta',
            label: 'Sono sopraffatta/o',
            icon: '💧'
        },
        {
            id: 'spenta',
            label: 'Sono spenta/o — non riesco a sentire niente',
            icon: '●'
        }
    ];

    // Clear previous buttons
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'checkin-buttons';

    states.forEach(state => {
        const button = document.createElement('button');
        button.className = 'checkin-btn';
        button.innerHTML = `<span class="icon">${state.icon}</span> ${state.label}`;
        button.addEventListener('click', () => handleCheckIn(state.id));
        buttonsContainer.appendChild(button);
    });

    checkinSection.appendChild(buttonsContainer);
}

function handleCheckIn(stateId) {
    const timestamp = new Date().toISOString();
    
    // Save check-in
    appState.checkIns.push({
        timestamp: timestamp,
        state: stateId,
        tasksCompleted: countCompletedTasks()
    });

    saveToLocalStorage();

    // Play audio (placeholder for now)
    console.log(`Check-in: ${stateId}`);
    
    // Show audio player or next step
    showAudioForState(stateId);
}

function showAudioForState(stateId) {
    // Placeholder — audio logic will go here
    const audioMap = {
        'bene': 'audio-4-benessere.mp3',
        'stanca': 'audio-5a-stanca.mp3',
        'agitata': 'audio-5b-agitata.mp3',
        'sopraffatta': 'audio-5c-sopraffatta.mp3',
        'spenta': 'audio-5d-spenta.mp3'
    };
    
    console.log(`Play audio: ${audioMap[stateId]}`);
}

// ===== TASK MANAGER LOGIC =====

function initializeTasks() {
    const tasksSection = document.getElementById('tasks');
    
    // Create tabs
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'task-tabs';
    
    const tabs = [
        { id: 'cose-per-me', label: 'Cose per me' },
        { id: 'cose-per-chi-amo', label: 'Cose per chi amo' },
        { id: 'cose-per-la-casa', label: 'Cose per la casa' }
    ];

    tabs.forEach(tab => {
        const tabBtn = document.createElement('button');
        tabBtn.className = 'tab-btn';
        tabBtn.textContent = tab.label;
        tabBtn.addEventListener('click', () => showTaskCategory(tab.id));
        tabsContainer.appendChild(tabBtn);
    });

    tasksSection.appendChild(tabsContainer);

    // Create task container
    const taskContainer = document.createElement('div');
    taskContainer.id = 'task-container';
    taskContainer.className = 'task-container';
    tasksSection.appendChild(taskContainer);

    // Show first category by default
    showTaskCategory('cose-per-me');
}

function showTaskCategory(categoryId) {
    const taskContainer = document.getElementById('task-container');
    taskContainer.innerHTML = '';

    // Input field
    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'task-input-wrapper';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Aggiungi un compito...';
    input.className = 'task-input';

    const addBtn = document.createElement('button');
    addBtn.textContent = 'Aggiungi';
    addBtn.className = 'task-add-btn';
    addBtn.addEventListener('click', () => addTask(categoryId, input.value, input));

    inputWrapper.appendChild(input);
    inputWrapper.appendChild(addBtn);
    taskContainer.appendChild(inputWrapper);

    // Task list
    const taskList = document.createElement('ul');
    taskList.className = 'task-list';

    appState.tasks[categoryId].forEach((task, index) => {
        const li = createTaskElement(task, categoryId, index);
        taskList.appendChild(li);
    });

    taskContainer.appendChild(taskList);

    // Counter
    const counter = document.createElement('p');
    counter.className = 'task-counter';
    counter.textContent = `${countCompletedTasks()} completati`;
    taskContainer.appendChild(counter);
}

function createTaskElement(task, categoryId, index) {
    const li = document.createElement('li');
    if (task.completed) li.classList.add('completed');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTask(categoryId, index, checkbox.checked));

    const label = document.createElement('span');
    label.textContent = task.name;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '✕';
    deleteBtn.className = 'task-delete-btn';
    deleteBtn.addEventListener('click', () => deleteTask(categoryId, index));

    li.appendChild(checkbox);
    li.appendChild(label);
    li.appendChild(deleteBtn);

    return li;
}

function addTask(categoryId, taskName, inputElement) {
    if (!taskName.trim()) return;

    appState.tasks[categoryId].push({
        name: taskName,
        completed: false,
        createdAt: new Date().toISOString()
    });

    saveToLocalStorage();
    inputElement.value = '';
    showTaskCategory(categoryId);
}

function toggleTask(categoryId, index, completed) {
    appState.tasks[categoryId][index].completed = completed;
    saveToLocalStorage();
    showTaskCategory(categoryId);
}

function deleteTask(categoryId, index) {
    appState.tasks[categoryId].splice(index, 1);
    saveToLocalStorage();
    showTaskCategory(categoryId);
}

function countCompletedTasks() {
    let count = 0;
    Object.values(appState.tasks).forEach(category => {
        count += category.filter(task => task.completed).length;
    });
    return count;
}

// ===== LOCAL STORAGE =====

function saveToLocalStorage() {
    localStorage.setItem('sottovoce-app-state', JSON.stringify(appState));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('sottovoce-app-state');
    if (saved) {
        Object.assign(appState, JSON.parse(saved));
    }
}