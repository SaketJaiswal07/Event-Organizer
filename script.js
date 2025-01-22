const taskInput = document.getElementById("task-input");
const addTaskBtn = document.getElementById("add-task-btn");
const taskList = document.getElementById("task-list");
const searchBox = document.getElementById("search-box");
const themeToggle = document.getElementById("theme-toggle");

document.addEventListener("DOMContentLoaded", () => {
  loadTasks();
  loadTheme();
});

function addTask() {
  const taskText = taskInput.value.trim();
  const priority = prompt(
    "Enter priority for this task (low, medium, high):",
    "low"
  ).toLowerCase();
  const dueDate = prompt("Enter a due date (YYYY-MM-DD):");
  const category = prompt(
    "Enter category for this task (e.g., Work, Personal):"
  );

  if (
    taskText === "" ||
    (priority !== "low" &&
      priority !== "l" &&
      priority !== "medium" &&
      priority !== "m" &&
      priority !== "high" &&
      priority !== "h") ||
    !dueDate ||
    isNaN(Date.parse(dueDate))
  ) {
    alert(
      "Please enter a task, a valid priority (low/l, medium/m, high/h), and a valid due date!"
    );
    return;
  }

  const task = {
    text: taskText,
    completed: false,
    priority: priority,
    dueDate: dueDate,
    category: category,
  };

  saveTaskToLocalStorage(task);
  reloadTasks();
  taskInput.value = "";
}

function addTaskToList(task) {
  const li = document.createElement("li");
  li.innerHTML = `
    ${task.text} - <b>${task.priority}</b> | Due: ${task.dueDate} | Category: ${task.category}
  `;

  if (task.completed) {
    li.classList.add("completed");
  }

  const completeBtn = document.createElement("button");
  completeBtn.textContent = "Complete";
  completeBtn.addEventListener("click", () => {
    task.completed = !task.completed;
    li.classList.toggle("completed");
    updateTaskInLocalStorage(task.text, task);
    updateProgressBar();
  });

  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";
  editBtn.addEventListener("click", () => {
    editTask(task);
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.classList.add("delete-btn");
  deleteBtn.addEventListener("click", () => {
    li.remove();
    removeTaskFromLocalStorage(task.text);
    updateProgressBar();
  });

  li.appendChild(completeBtn);
  li.appendChild(editBtn);
  li.appendChild(deleteBtn);
  taskList.appendChild(li);
}

function editTask(task) {
  const newTaskText = prompt("Edit the task description:", task.text);
  const newPriority = prompt(
    "Edit the priority (low, medium, high):",
    task.priority
  ).toLowerCase();
  const newDueDate = prompt("Edit the due date (YYYY-MM-DD):", task.dueDate);
  const newCategory = prompt("Edit the category:", task.category);

  if (
    newTaskText === "" ||
    (newPriority !== "low" &&
      newPriority !== "l" &&
      newPriority !== "medium" &&
      newPriority !== "m" &&
      newPriority !== "high" &&
      newPriority !== "h") ||
    !newDueDate ||
    isNaN(Date.parse(newDueDate))
  ) {
    alert("Please enter a valid task, priority, and due date!");
    return;
  }

  task.text = newTaskText;
  task.priority = newPriority;
  task.dueDate = newDueDate;
  task.category = newCategory;

  updateTaskInLocalStorage(newTaskText, task);
  reloadTasks();
}

function saveTaskToLocalStorage(task) {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.push(task);
  tasks = sortTasksByPriority(tasks);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function updateTaskInLocalStorage(taskText, updatedTask) {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks = tasks.map((task) => (task.text === taskText ? updatedTask : task));
  tasks = sortTasksByPriority(tasks);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function removeTaskFromLocalStorage(taskText) {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks = tasks.filter((task) => task.text !== taskText);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks = sortTasksByPriority(tasks);
  taskList.innerHTML = "";
  tasks.forEach((task) => addTaskToList(task));
  updateProgressBar();
}

function reloadTasks() {
  taskList.innerHTML = "";
  loadTasks();
}

function sortTasksByPriority(tasks) {
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  return tasks.sort((a, b) => {
    if (priorityOrder[b.priority] !== priorityOrder[a.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return new Date(a.dueDate) - new Date(b.dueDate);
  });
}

function updateProgressBar() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const completedTasks = tasks.filter((task) => task.completed).length;
  const progress = tasks.length ? (completedTasks / tasks.length) * 100 : 0;
  document.getElementById("progress-bar").style.width = `${progress}%`;
}

function loadTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.body.className = savedTheme;
}

themeToggle.addEventListener("click", () => {
  const currentTheme = document.body.className;
  const newTheme = currentTheme === "light" ? "dark" : "light";
  document.body.className = newTheme;
  localStorage.setItem("theme", newTheme);
});

searchBox.addEventListener("input", () => {
  const searchQuery = searchBox.value.toLowerCase();
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const filteredTasks = tasks.filter((task) =>
    task.text.toLowerCase().includes(searchQuery)
  );
  taskList.innerHTML = "";
  filteredTasks.forEach((task) => addTaskToList(task));
});

addTaskBtn.addEventListener("click", addTask);

taskInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    addTask();
  }
});
