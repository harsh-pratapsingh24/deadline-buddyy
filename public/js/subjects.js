
document.addEventListener("DOMContentLoaded", () => {

  const openModalBtn = document.getElementById("openModal");
  const resetBtn = document.getElementById("resetSubjects");
  const modal = document.getElementById("subjectModal");
  const closeModalBtn = document.getElementById("closeModal");
  const form = document.getElementById("subjectForm");
  const grid = document.getElementById("subjectsGrid");

  const icons = [
    "ph ph-function",
    "ph ph-tree-structure",
    "ph ph-code",
    "ph ph-atom",
    "ph ph-scroll",
    "ph ph-flask",
    "ph ph-book",
    "ph ph-lightbulb",
    "ph ph-rocket"
  ];

  const defaultSubjects = [
    { name: "OOP in JAVA", icon: "ph ph-function" },
    { name: "Data Structures and Algorithms", icon: "ph ph-tree-structure" },
    { name: "Web Development", icon: "ph ph-code" }
  ];

  // Open modal
  openModalBtn?.addEventListener("click", () => {
    modal.classList.add("active");
  });

  // Close
  closeModalBtn?.addEventListener("click", () => {
    modal.classList.remove("active");
  });

  // Close when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("active");
  });

  // Reset subjects
  resetBtn?.addEventListener("click", () => {
    if (confirm("Reset all subjects?")) {
      localStorage.removeItem("subjects");
      showNotification("Subjects reset!");
      setTimeout(() => location.reload(), 600);
    }
  });

  function getTaskCount(subjectName) {
    const tasks = JSON.parse(localStorage.getItem("deadlineBuddyTasks") || "[]");
    return tasks.filter(t => t.subject === subjectName).length;
  }

  function renderSubjects() {
    grid.innerHTML = "";
    let storedSubjects = JSON.parse(localStorage.getItem("subjects"));

    if (!storedSubjects) {
      storedSubjects = defaultSubjects;
      localStorage.setItem("subjects", JSON.stringify(defaultSubjects));
    }

    storedSubjects.forEach(sub => {
      const taskCount = getTaskCount(sub.name);

      const card = document.createElement("div");
      card.classList.add("subject-card");

      card.innerHTML = `
        <i class="${sub.icon}"></i>
        <h3>${sub.name}</h3>
        <div class="subject-task-count">
          <span class="task-badge">${taskCount} active task${taskCount !== 1 ? "s" : ""}</span>
        </div>
      `;

      grid.appendChild(card);
    });
  }

// Add subject
form?.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("subjectName").value.trim();
  if (!name) return;

  const storedSubjects = JSON.parse(localStorage.getItem("subjects")) || [];
  const randomIcon = icons[Math.floor(Math.random() * icons.length)];

  storedSubjects.push({ name, icon: randomIcon });

  localStorage.setItem("subjects", JSON.stringify(storedSubjects));

  renderSubjects();

  // 🔥 NEW IMPORTANT LINE
  window.dispatchEvent(new Event("subjectsUpdated"));

  modal.classList.remove("active");
  form.reset();

  showNotification("Subject added!");
});


  renderSubjects();
});