document.addEventListener("DOMContentLoaded", function () {
  const taskInput = document.getElementById("taskInput");
  const addTaskBtn = document.getElementById("addTaskBtn");
  const taskList = document.getElementById("taskList");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const remainingCount = document.getElementById("remainingCount");

  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  let currentFilter = "all";

  // Initialize the app
  function init() {
    renderTasks();
    updateRemainingCount();
    addEventListeners();
  }

  // Add event listeners
  function addEventListeners() {
    addTaskBtn.addEventListener("click", addTask);
    taskInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") addTask();
    });

    filterBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        filterBtns.forEach((b) => b.classList.remove("active"));
        this.classList.add("active");
        currentFilter = this.dataset.filter;
        renderTasks();
      });
    });
  }

  // Add a new task
  function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText) {
      const newTask = {
        id: Date.now(),
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString(),
      };

      tasks.unshift(newTask);
      saveTasks();
      renderTasks();
      updateRemainingCount();
      taskInput.value = "";
    }
  }

  // Render tasks based on current filter
  function renderTasks() {
    taskList.innerHTML = "";

    let filteredTasks = tasks;
    if (currentFilter === "active") {
      filteredTasks = tasks.filter((task) => !task.completed);
    } else if (currentFilter === "completed") {
      filteredTasks = tasks.filter((task) => task.completed);
    }

    if (filteredTasks.length === 0) {
      taskList.innerHTML = '<p class="no-tasks">No tasks found</p>';
      return;
    }

    filteredTasks.forEach((task) => {
      const taskItem = document.createElement("li");
      taskItem.className = "task-item";
      taskItem.dataset.id = task.id;

      taskItem.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${
                  task.completed ? "checked" : ""
                }>
                <span class="task-text ${task.completed ? "completed" : ""}">${
        task.text
      }</span>
                <div class="task-actions">
                    <button class="edit-btn"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn"><i class="fas fa-trash"></i></button>
                </div>
            `;

      taskList.appendChild(taskItem);

      // Add event listeners to the new elements
      const checkbox = taskItem.querySelector(".task-checkbox");
      const editBtn = taskItem.querySelector(".edit-btn");
      const deleteBtn = taskItem.querySelector(".delete-btn");
      const taskText = taskItem.querySelector(".task-text");

      checkbox.addEventListener("change", function () {
        toggleTaskComplete(task.id, this.checked);
      });

      editBtn.addEventListener("click", function () {
        editTask(task.id, taskText);
      });

      deleteBtn.addEventListener("click", function () {
        deleteTask(task.id);
      });
    });
  }

  // Toggle task completion status
  function toggleTaskComplete(id, isCompleted) {
    const taskIndex = tasks.findIndex((task) => task.id === id);
    if (taskIndex !== -1) {
      tasks[taskIndex].completed = isCompleted;
      saveTasks();
      updateRemainingCount();

      // Immediately update the UI without refreshing
      const taskText = document.querySelector(`li[data-id="${id}"] .task-text`);
      if (taskText) {
        taskText.classList.toggle("completed", isCompleted);
      }
    }
  }
  // Edit task text
  function editTask(id, taskTextElement) {
    const currentText = taskTextElement.textContent;
    const input = document.createElement("input");
    input.type = "text";
    input.value = currentText;
    input.className = "edit-input";

    taskTextElement.replaceWith(input);
    input.focus();

    function saveEdit() {
      const newText = input.value.trim();
      if (newText && newText !== currentText) {
        const taskIndex = tasks.findIndex((task) => task.id === id);
        if (taskIndex !== -1) {
          tasks[taskIndex].text = newText;
          saveTasks();
        }
      }

      // Revert to text display
      taskTextElement.textContent = newText || currentText;
      input.replaceWith(taskTextElement);
    }

    input.addEventListener("blur", saveEdit);
    input.addEventListener("keypress", function (e) {
      if (e.key === "Enter") saveEdit();
    });
  }

  // Delete a task
  function deleteTask(id) {
    tasks = tasks.filter((task) => task.id !== id);
    saveTasks();
    renderTasks();
    updateRemainingCount();
  }

  // Update the remaining tasks count
  function updateRemainingCount() {
    const activeTasks = tasks.filter((task) => !task.completed).length;
    remainingCount.textContent = activeTasks;
  }

  // Save tasks to localStorage
  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  // Initialize the app
  init();
});
