const addBtns = document.querySelectorAll('.add-btn:not(.solid)');
const saveItemBtns = document.querySelectorAll('.solid');
const addItemContainers = document.querySelectorAll('.add-container');
const addItems = document.querySelectorAll('.add-item');
// Item Lists
const listColumns = document.querySelectorAll('.drag-item-list');
const backlogList = document.getElementById('backlog-list');
const progressList = document.getElementById('progress-list');
const completeList = document.getElementById('complete-list');
const onHoldList = document.getElementById('on-hold-list');

// Items
let updatedOnLoad = false;

// Initialize Arrays
let backlogListArray = [];
let progressListArray = [];
let completeListArray = [];
let onHoldListArray = [];
let listArrays = []; // Array of the other arrays

// Drag Functionality
let draggedItem;
let dragging = false;
let currentColumn;

// Get Arrays from localStorage if available, set default values if not
function getSavedColumns() {
    if (localStorage.getItem('backlogItems')) {
        // Check local storage and load
        backlogListArray = JSON.parse(localStorage.backlogItems);
        progressListArray = JSON.parse(localStorage.progressItems);
        completeListArray = JSON.parse(localStorage.completeItems);
        onHoldListArray = JSON.parse(localStorage.onHoldItems);
    } else {
        //Set default values for sample
        backlogListArray = ['Release the course', 'Sit back and relax'];
        progressListArray = ['Work on projects', 'Listen to music'];
        completeListArray = ['Being cool', 'Getting stuff done'];
        onHoldListArray = ['Being uncool'];
    }
}

// Set localStorage Arrays
function updateSavedColumns() {
    listArrays = [
        backlogListArray,
        progressListArray,
        completeListArray,
        onHoldListArray,
    ];
    const arrayNames = ['backlog', 'progress', 'complete', 'onHold'];
    arrayNames.forEach((arrayName, index) => {
        //Save array to local storage with key: [listName]Items
        localStorage.setItem(
            `${arrayName}Items`,
            JSON.stringify(listArrays[index])
        );
    });
}

//Filter Array to remove empty entries (deleted or accidentally void)
const filterArray = (array) => {
    const filteredArray = array.filter((item) => item !== null);
    return filteredArray;
};

// Create DOM Elements for each list item
function createItemEl(columnEl, colIndex, item, index) {
    // List Item
    const listEl = document.createElement('li');
    listEl.classList.add('drag-item');
    listEl.textContent = item;
    listEl.draggable = true;
    listEl.setAttribute('ondragstart', 'drag(event)');
    listEl.contentEditable = true;
    listEl.id = index;
    listEl.setAttribute('onfocusout', `updateItem(${index}, ${colIndex})`);

    // Append
    columnEl.appendChild(listEl);
}

// Update Columns in DOM - Reset HTML, Filter Array, Update localStorage
function updateDOM() {
    // Check localStorage ONCE
    if (!updatedOnLoad) {
        getSavedColumns();
    }
    // Backlog Column
    backlogList.textContent = '';
    backlogListArray = filterArray(backlogListArray);
    backlogListArray.forEach((backlogItem, index) => {
        createItemEl(backlogList, 0, backlogItem, index);
    });
    // Progress Column
    progressList.textContent = '';
    progressListArray = filterArray(progressListArray);
    progressListArray.forEach((progressItem, index) => {
        createItemEl(progressList, 1, progressItem, index);
    });
    // Complete Column
    completeList.textContent = '';
    completeListArray = filterArray(completeListArray);
    completeListArray.forEach((completeItem, index) => {
        createItemEl(completeList, 2, completeItem, index);
    });

    // On Hold Column
    onHoldList.textContent = '';
    onHoldListArray = filterArray(onHoldListArray);
    onHoldListArray.forEach((onHoldItem, index) => {
        createItemEl(onHoldList, 3, onHoldItem, index);
    });

    // Run getSavedColumns only once, Update Local Storage
    updatedOnLoad = true;
    updateSavedColumns();
}

// Update or delete item, or update array to show changed item
const updateItem = (id, colIndex) => {
    const selectedArray = listArrays[colIndex];
    const selectedColumnEl = listColumns[colIndex].children;
    if (!dragging) {
        if (!selectedColumnEl[id].textContent) {
            delete selectedArray[id];
        } else {
            selectedArray[id] = selectedColumnEl[id].textContent;
        }
        console.log(selectedArray);
        updateDOM();
    }
};

const addToColumn = (colIndex) => {
    const itemText = addItems[colIndex].textContent;
    const selectedArray = listArrays[colIndex];
    selectedArray.push(itemText);
    addItems[colIndex].textContent = '';
    updateDOM();
};

// Show add-item input box
const showInputBox = (colIndex) => {
    addBtns[colIndex].style.visibility = 'hidden';
    saveItemBtns[colIndex].style.display = 'flex';
    addItemContainers[colIndex].style.display = 'flex';
};

// Hide add-item input box
const hideInputBox = (colIndex) => {
    addBtns[colIndex].style.visibility = 'visible';
    saveItemBtns[colIndex].style.display = 'none';
    addItemContainers[colIndex].style.display = 'none';

    // Save the new item to column
    addToColumn(colIndex);
};

// Allow arrays to reflect item drag-drops
const rebuildArrays = () => {
    //rebuilds arrays from DOM structure
    backlogListArray = Array.from(backlogList.children).map(
        (i) => i.textContent
    );
    progressListArray = Array.from(progressList.children).map(
        (i) => i.textContent
    );
    completeListArray = Array.from(completeList.children).map(
        (i) => i.textContent
    );
    onHoldListArray = Array.from(onHoldList.children).map((i) => i.textContent);

    updateDOM();
};

// Respond to item being dragged.
const drag = (e) => {
    draggedItem = e.target;
    dragging = true;
    console.log(draggedItem);
};

// When item is dragged over column area
const dragEnter = (colIndex) => {
    listColumns[colIndex].classList.add('over');
    currentColumn = colIndex;
};

// Col allows for item to be dropped in
const allowDrop = (e) => {
    e.preventDefault();
};

// Dropping item into column
const drop = (e) => {
    e.preventDefault();
    // Remove dragover styling
    listColumns.forEach((column) => {
        column.classList.remove('over');
    });
    //Add item to new column
    const parent = listColumns[currentColumn];
    // here, appendChild moves the html element to a different column div in the DOM.
    parent.appendChild(draggedItem);
    // dragging complete
    dragging = false;
    rebuildArrays();
};

//On Load

updateDOM();
