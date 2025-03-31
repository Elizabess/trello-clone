const columns = document.querySelectorAll('.column');

columns.forEach(column => {
    const addButton = column.querySelector('.add-card');
    const cardContainer = column.querySelector('.card-container');

    addButton.addEventListener('click', () => {
        const cardText = prompt('Enter card text:');
        if (cardText) {
            createCard(cardText, cardContainer);
            saveState();
        }
    });
});

function createCard(text, container) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerText = text;

    const deleteButton = document.createElement('span');
    deleteButton.innerHTML = '&#10006;'; 
    deleteButton.className = 'delete-card';
    deleteButton.addEventListener('click', () => {
        container.removeChild(card);
        saveState();
    });

    card.appendChild(deleteButton);
    container.appendChild(card);

    makeDraggable(card);
}

function saveState() {
    const state = {};
    columns.forEach(column => {
        const cards = Array.from(column.querySelectorAll('.card')).map(card => card.innerText.replace('✖️', '').trim());
        state[column.id] = cards;
    });
    localStorage.setItem('trelloState', JSON.stringify(state));
}

function loadState() {
    const state = JSON.parse(localStorage.getItem('trelloState'));
    if (state) {
        for (const [columnId, cards] of Object.entries(state)) {
            cards.forEach(cardText => createCard(cardText, document.getElementById(columnId).querySelector('.card-container')));
        }
    }
}

function makeDraggable(card) {
    card.draggable = true;
    
    card.addEventListener('dragstart', () => {
        card.classList.add('dragging');
    });

    card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
    });

    columns.forEach(column => {
        column.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = getDragAfterElement(column, e.clientY);
            const draggingCard = document.querySelector('.dragging');
            if (afterElement == null) {
                column.appendChild(draggingCard);
            } else {
                column.insertBefore(draggingCard, afterElement);
            }
            saveState();
        });
    });
}

function getDragAfterElement(column, y) {
    const draggableElements = [...column.querySelectorAll('.card:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

loadState();

