// Load Tasks from API
async function fetchTasks() {
  try {
    const response = await fetch("/api/tasks/list", {
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401) {
        // User not logged in, redirect to login
        window.location.href = "/login";
        return [];
      }
      throw new Error("Failed to fetch tasks");
    }

    const tasks = await response.json();
    return tasks;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
}

// Function to add notification when a new task is created
async function addTaskNotification(taskData) {
  try {
    // Get existing notifications from localStorage
    let notifications = JSON.parse(
      localStorage.getItem("deadlineBuddyNotifications") || "[]"
    );

    // If localStorage is empty, load from JSON first
    if (notifications.length === 0) {
      try {
        const response = await fetch("notifications.json");
        notifications = await response.json();
      } catch (error) {
        console.log("No existing notifications found, starting fresh");
        notifications = [];
      }
    }

    // Generate a unique ID for the notification
    const newNotificationId =
      notifications.length > 0
        ? Math.max(...notifications.map((n) => n.id)) + 1
        : 1;

    // Determine priority based on days until deadline
    const taskDate = new Date(taskData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    taskDate.setHours(0, 0, 0, 0);
    const daysUntil = Math.ceil((taskDate - today) / (1000 * 60 * 60 * 24));

    let priority = taskData.priority || "low";

    // Determine notification type
    let notificationType = "deadline";

    // Create descriptive message based on days until deadline
    let messageText = "";
    if (daysUntil < 0) {
      messageText = `${taskData.name} was due ${Math.abs(daysUntil)} days ago`;
    } else if (daysUntil === 0) {
      messageText = `${taskData.name} is due today`;
    } else if (daysUntil === 1) {
      messageText = `${taskData.name} is due tomorrow`;
    } else {
      messageText = `${taskData.name} for ${taskData.subject} is due in ${daysUntil} days`;
    }

    // Create new notification object matching JSON structure
    const newNotification = {
      id: newNotificationId,
      type: notificationType,
      title: `New Task: ${taskData.name}`,
      message: messageText,
      priority: priority,
      date: taskData.date,
      time: "11:59 PM",
      subject: taskData.subject,
      read: false,
    };

    // Add to beginning of notifications array (newest first)
    notifications.unshift(newNotification);

    // Save back to localStorage
    localStorage.setItem(
      "deadlineBuddyNotifications",
      JSON.stringify(notifications)
    );

    console.log("Notification created successfully:", newNotification);
  } catch (error) {
    console.error("Error creating notification:", error);
  }
}

// Update Statistics
function updateStats() {
  const pendingTasks = document.querySelectorAll(
    "#upcomingTasks .task-item"
  ).length;
  const completedTasks = document.querySelectorAll(
    "#completedTasks .task-item"
  ).length;
  const total = pendingTasks + completedTasks;

  document.getElementById("pendingCount").textContent = pendingTasks;
  document.getElementById("completedCount").textContent = completedTasks;
  document.getElementById("completedCountDisplay").textContent = completedTasks;
  document.getElementById("upcomingCount").textContent = pendingTasks;

  // Calculate weekly progress percentage
  const progress = total > 0 ? Math.round((completedTasks / total) * 100) : 0;
  document.getElementById("progressPercent").textContent = progress + "%";
  document.querySelector(".progress-fill").style.width = progress + "%";
  document.querySelector(
    ".progress-text"
  ).textContent = `${completedTasks} of ${total} tasks completed`;
}

// Update Priority Progress
function updatePriorityProgress(pendingTasks) {
    const priorities = ["high", "medium", "low"];

    priorities.forEach((p) => {
        // Only count pending tasks for priority bar
        const totalP = pendingTasks.filter((t) => t.priority === p).length;

        // You don't want completed tasks shown here → always 0
        const completedP = 0;

        // If tasks exist, bar should show 100% (full width)
        const percent = totalP > 0 ? 100 : 0;

        // Get progress bar and count elements
        const bar = document.querySelector(`.mini-progress-fill.${p}`);
        const count = bar?.parentElement.nextElementSibling;

        // Update UI
        if (bar) bar.style.width = percent + "%";
        if (count) count.textContent = `${totalP}/${totalP}`;
    });
}


// Add Task to DOM
function addTaskToDOM(task, animate = false) {
  const item = document.createElement("label");
  item.className = "task-item";
  item.dataset.dynamic = "true";
  item.dataset.taskId = task._id || task.id;

  const daysLeft = Math.ceil(
    (new Date(task.date) - new Date()) / (1000 * 60 * 60 * 24)
  );
  const urgentClass = daysLeft <= 3 ? "urgent" : "";
  const formattedDate = new Date(task.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const taskName = task.title || task.name;
  const priority = task.priority || "low";
  const isChecked = task.isCompleted || task.completed || false;

  item.innerHTML = `
    <input type="checkbox" class="task-checkbox" ${isChecked ? "checked" : ""}>
    <div class="task-content">
      <div class="task-info">
        <span class="task-name">${taskName}</span>
        <span class="task-date">${formattedDate}</span>
        <span class="task-subject">${task.subject}</span>
      </div>
      <div class="task-meta">
        <span class="priority-tag ${priority}">${
    priority.charAt(0).toUpperCase() + priority.slice(1)
  }</span>
        <span class="days-left ${urgentClass}">${daysLeft} days left</span>
      </div>
    </div>
  `;

  const container = isChecked
    ? document.getElementById("completedTasks")
    : document.getElementById("upcomingTasks");
  container.appendChild(item);

  item
    .querySelector(".task-checkbox")
    .addEventListener("change", async function () {
      if (this.checked) {
        setTimeout(() => moveToCompleted(item, task), 500);
      }
    });

  if (animate) {
    item.style.cssText = "opacity: 0; transform: translateY(-20px)";
    setTimeout(() => {
      item.style.transition = "all 0.3s ease";
      item.style.cssText = "opacity: 1; transform: translateY(0)";
    }, 100);
  }
}

// Add Completed Task to DOM
function addCompletedToDOM(task) {
  const item = document.createElement("div");
  item.className = "task-item completed";
  item.dataset.dynamic = "true";
  item.dataset.taskId = task._id || task.id;
  const formattedDate = new Date(task.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const taskName = task.title || task.name;
  const completedDate = task.completedDate || formattedDate;

  item.innerHTML = `
    <div class="task-content">
      <div class="task-info">
        <span class="task-name">${taskName}</span>
        <span class="task-date">Completed ${completedDate}</span>
        <span class="task-subject">${task.subject}</span>
      </div>
      <div class="completion-badge">
        <i class="ph ph-check"></i>
      </div>
    </div>
  `;
  document.getElementById("completedTasks").appendChild(item);
}

// Load All Tasks
// Load All Tasks
async function loadTasks() {
    // Clear dynamic tasks
    document
        .querySelectorAll('[data-dynamic="true"]')
        .forEach((el) => el.remove());

    try {
        const tasks = await fetchTasks();

        const pending = tasks.filter((task) => !task.isCompleted);
        const completed = tasks.filter((task) => task.isCompleted);

        pending.forEach((task) => addTaskToDOM(task, false));
        completed.forEach((task) => addCompletedToDOM(task));

        updateStats(); 
        updatePriorityProgress(pending);   // 🔥 FIXED LINE ADDED

    } catch (error) {
        console.error("Error loading tasks:", error);
        showNotification("Error loading tasks");
    }
}


// Move Task to Completed
async function moveToCompleted(item, task) {
  try {
    const taskId = task._id || task.id;
    const response = await fetch("/api/tasks/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id: taskId }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }
      const errorData = await response
        .json()
        .catch(() => ({ error: "Failed to toggle task" }));
      throw new Error(errorData.error || "Failed to toggle task");
    }

    await loadTasks();
    showNotification("Task completed!");
  } catch (error) {
    console.error("Error toggling task:", error);
    showNotification(error.message || "Error completing task");
  }
}

// Reset All Tasks
async function resetAllTasks() {
  if (!confirm("Are you sure you want to reset ALL tasks?")) return;

  try {
    const response = await fetch("/api/tasks/reset", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    });

    const data = await response.json();

    if (data.success) {
      document.getElementById("upcomingTasks").innerHTML = "";
      document.getElementById("completedTasks").innerHTML = "";

      updateStats();
      updatePriorityProgress([]); // reset priority bars instantly

      showNotification("All tasks have been reset!");
    } else {
      showNotification("Reset failed.");
    }
  } catch (err) {
    console.error("Reset error:", err);
    showNotification("Error resetting tasks.");
  }
}



// Load Subjects (FIXED VERSION)
function loadSubjects() {
  const select = document.getElementById("taskSubject");
  select.innerHTML = `<option value="">Select Subject</option>`;

  let subjects = JSON.parse(localStorage.getItem("subjects"));

  // If empty → use real default subjects (matching subjects.js)
  if (!subjects || subjects.length === 0) {
    subjects = [
      { name: "OOP in JAVA" },
      { name: "Data Structures and Algorithms" },
      { name: "Web Development" },
    ];
    localStorage.setItem("subjects", JSON.stringify(subjects));
  }

  subjects.forEach((sub) => {
    const opt = document.createElement("option");
    opt.value = sub.name;
    opt.textContent = sub.name;
    select.appendChild(opt);
  });
}

// Show Notification Toast
function showNotification(message) {
  const toast = document.createElement("div");
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #00F5D4, #00D4AA);
    color: #1A1A2E;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    box-shadow: 0 4px 15px rgba(0, 245, 212, 0.4);
    z-index: 10000;
  `;
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(400px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
// Listen for updates from Subjects Page
window.addEventListener("subjectsUpdated", loadSubjects);

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  loadSubjects();
  loadTasks();
  document.getElementById("taskDate").min = new Date()
    .toISOString()
    .split("T")[0];
});
