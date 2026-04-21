// todo-script.js

// Function to add a todo item
function addTodo() {
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');
    const newTodo = todoInput.value;

    if (newTodo) {
        // Add the new todo to the list
        const li = document.createElement('li');
        li.textContent = newTodo;
        todoList.appendChild(li);

        // Save to local storage
        saveToLocalStorage(newTodo);

        // Clear input
        todoInput.value = '';
    }
}

// Function to save todo items in local storage
function saveToLocalStorage(todo) {
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    todos.push(todo);
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Function to load todos from local storage
function loadTodos() {
    consttodos = JSON.parse(localStorage.getItem('todos')) || [];
    const todoList = document.getElementById('todo-list');
    todos.forEach(todo => {
        const li = document.createElement('li');
        li.textContent = todo;
        todoList.appendChild(li);
    });
}

// Load todos on page load
document.addEventListener('DOMContentLoaded', loadTodos);

// Event listener for adding a todo
document.getElementById('add-todo-button').addEventListener('click', addTodo);