// Fetch user data from MongoDB via API
async function fetchUserData() {
  try {
    const response = await fetch("/api/user/me", {
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = "/login";
        return null;
      }
      throw new Error("Failed to fetch user data");
    }

    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error("Error fetching user data:", error);
    showNotification("Error loading user data");
    return null;
  }
}

// Load profile data from MongoDB
async function loadProfile() {
  const userData = await fetchUserData();
  
  if (!userData) {
    return;
  }

  // Update email display in profile info section (if element exists)
  const profileEmail = document.querySelector(".profile-info h3");
  if (profileEmail) {
    profileEmail.textContent = userData.email;
  }

  // Update email input field (if element exists)
  const emailInput = document.getElementById("email");
  if (emailInput) {
    emailInput.value = userData.email;
  }
}

// Toggle edit mode (if edit button exists)
const editBtn = document.getElementById("editBtn");
if (editBtn) {
  let isEditing = false;
  editBtn.addEventListener("click", () => {
    isEditing = !isEditing;
    const inputs = document.querySelectorAll("#profileForm input, #profileForm select");
    const actionButtons = document.getElementById("actionButtons");
    
    if (inputs.length > 0) {
      inputs.forEach(input => input.disabled = !isEditing);
    }
    editBtn.innerHTML = isEditing 
        ? '<i class="ph ph-x"></i> Cancel' 
        : '<i class="ph ph-pencil"></i> Edit';
    if (actionButtons) {
      actionButtons.style.display = isEditing ? "flex" : "none";
    }
    
    if (!isEditing) loadProfile(); // Reset on cancel
  });

  // Cancel button
  const cancelBtn = document.getElementById("cancelBtn");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      editBtn.click();
    });
  }

  // Save profile (if form exists)
  const profileForm = document.getElementById("profileForm");
  if (profileForm) {
    profileForm.addEventListener("submit", (e) => {
      e.preventDefault();
      showNotification("Profile update feature coming soon!");
      editBtn.click(); // Exit edit mode
    });
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  loadProfile();
});
// Show Notification Toast
function showNotification(message) {
  const toast = document.createElement('div');
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
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(400px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
