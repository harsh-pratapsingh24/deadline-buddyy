// ==================== NOTIFICATION CLASS ====================

class Notification {
    constructor(id, title, message, type, priority, subject, date, time, read = false) {
        this.id = id;
        this.title = title;
        this.message = message;
        this.type = type;
        this.priority = priority;
        this.subject = subject;
        this.date = date;
        this.time = time;
        this.read = read;
    }

    // Format icon based on type
    getIconClass() {
        const icons = {
            deadline: "ph ph-alarm",
            exam: "ph ph-graduation-cap",
            reminder: "ph ph-bell-ringing"
        };
        return icons[this.type] || "ph ph-info";
    }

    // Convert date
    getFormattedDate() {
        const date = new Date(this.date);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    }

    // Remaining time
    getTimeLeft() {
        const now = new Date();
        const target = new Date(this.date);
        const diff = target - now;
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

        if (days < 0) return "Overdue";
        if (days === 0) return "Today";
        if (days === 1) return "Tomorrow";
        return `${days} days left`;
    }

    // Filter logic
    matchesFilter(filter) {
        if (filter === "all") return true;
        if (filter === "unread") return !this.read;
        if (filter === "high") return this.priority === "high";
        return this.type === filter;
    }

    // Generate HTML
    renderHTML() {
        return `
        <div class="notification-card ${this.read ? "read" : "unread"} priority-${this.priority}" data-id="${this.id}">
            <div class="notification-icon ${this.type}">
                <i class="${this.getIconClass()}"></i>
            </div>

            <div class="notification-content">
                <div class="notification-header">
                    <h3>${this.title}</h3>
                    <span class="priority-badge ${this.priority}">${this.priority}</span>
                </div>

                <p class="notification-message">${this.message}</p>

                <div class="notification-meta">
                    <span><i class="ph ph-book"></i> ${this.subject}</span>
                    <span><i class="ph ph-calendar"></i> ${this.getFormattedDate()} at ${this.time}</span>
                    <span><i class="ph ph-clock"></i> ${this.getTimeLeft()}</span>
                </div>
            </div>

            <div class="notification-actions">
                ${!this.read ? `
                    <button class="action-btn mark-read" onclick="notificationManager.markNotificationAsRead('${this.id}')">
                        <i class="ph ph-check"></i>
                    </button>
                ` : ""}

                <button class="action-btn delete" onclick="notificationManager.deleteNotification('${this.id}')">
                    <i class="ph ph-trash"></i>
                </button>
            </div>
        </div>
        `;
    }
}



// ==================== NOTIFICATION MANAGER ====================

class NotificationManager {
    constructor() {
        this.notifications = [];
        this.currentFilter = "all";
        this.container = document.getElementById("notificationsContainer");
    }

    // Load notifications from MongoDB
    async loadNotifications() {
        try {
            const response = await fetch("/api/notifications", {
                method: "GET",
                credentials: "include"
            });

            const data = await response.json();
            if (!data.success) throw new Error("Failed to fetch notifications");

            this.notifications = data.notifications.map(n =>
                new Notification(
                    n._id,
                    n.title,
                    n.message,
                    n.type,
                    n.priority,
                    n.subject,
                    n.date,
                    n.time,
                    n.read
                )
            );

            this.renderNotifications();
        } catch (err) {
            console.error("Error loading notifications:", err);
            this.container.innerHTML = `<p class="error-message">Failed to load notifications.</p>`;
        }
    }

    // Filter notifications
    getFilteredNotifications() {
        return this.notifications.filter(n => n.matchesFilter(this.currentFilter));
    }

    // Render UI
    renderNotifications() {
        const list = this.getFilteredNotifications();

        if (list.length === 0) {
            this.container.innerHTML = `<p class="no-notifications">No notifications to display</p>`;
            return;
        }

        this.container.innerHTML = list.map(n => n.renderHTML()).join("");
    }

    // MARK READ (MongoDB)
    async markNotificationAsRead(id) {
        try {
            const response = await fetch("/api/notifications/mark-read", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = "/login";
                    return;
                }
                const errorData = await response.json().catch(() => ({ error: "Failed to mark as read" }));
                throw new Error(errorData.error || "Failed to mark as read");
            }

            const data = await response.json();
            if (data.success) {
                const notif = this.notifications.find(n => n.id === id);
                if (notif) notif.read = true;
                this.renderNotifications();
                this.showNotification("Marked as read");
            } else {
                throw new Error(data.error || "Failed to mark as read");
            }

        } catch (err) {
            console.error("Failed to mark as read:", err);
            this.showNotification(err.message || "Failed to mark as read");
        }
    }

    // DELETE (MongoDB)
    async deleteNotification(id) {
        if (!confirm("Delete this notification?")) return;

        try {
            const response = await fetch("/api/notifications/delete", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = "/login";
                    return;
                }
                const errorData = await response.json().catch(() => ({ error: "Failed to delete notification" }));
                throw new Error(errorData.error || "Failed to delete notification");
            }

            const data = await response.json();
            if (data.success) {
                this.notifications = this.notifications.filter(n => n.id !== id);
                this.renderNotifications();
                this.showNotification("Notification deleted");
            } else {
                throw new Error(data.error || "Failed to delete notification");
            }

        } catch (err) {
            console.error("Failed to delete notification:", err);
            this.showNotification(err.message || "Failed to delete notification");
        }
    }

    // MARK ALL READ (MongoDB)
    async markAllAsRead() {
        try {
            const response = await fetch("/api/notifications/mark-all-read", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = "/login";
                    return;
                }
                const errorData = await response.json().catch(() => ({ error: "Failed to mark all as read" }));
                throw new Error(errorData.error || "Failed to mark all as read");
            }

            const data = await response.json();
            if (data.success) {
                this.notifications.forEach(n => (n.read = true));
                this.renderNotifications();
                this.showNotification("All marked as read");
            } else {
                throw new Error(data.error || "Failed to mark all as read");
            }

        } catch (err) {
            console.error("Failed to mark all read:", err);
            this.showNotification(err.message || "Failed to mark all as read");
        }
    }

    // CLEAR ALL (MongoDB)
    async clearAll() {
        if (!confirm("Clear ALL notifications?")) return;

        try {
            const response = await fetch("/api/notifications/clear-all", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = "/login";
                    return;
                }
                const errorData = await response.json().catch(() => ({ error: "Failed to clear all notifications" }));
                throw new Error(errorData.error || "Failed to clear all notifications");
            }

            const data = await response.json();
            if (data.success) {
                this.notifications = [];
                this.renderNotifications();
                this.showNotification("All notifications cleared");
            } else {
                throw new Error(data.error || "Failed to clear all notifications");
            }

        } catch (err) {
            console.error("Failed to clear all:", err);
            this.showNotification(err.message || "Failed to clear all notifications");
        }
    }

    // Set filter
    setFilter(filter) {
        this.currentFilter = filter;
        this.renderNotifications();
    }

    // Toast popup
    showNotification(message) {
        const el = document.createElement("div");
        el.style.cssText = `
            position: fixed;
            top: 20px; right: 20px;
            background: linear-gradient(135deg, #00F5D4, #00D4AA);
            padding: 1rem 1.5rem;
            border-radius: 10px;
            font-weight: 600;
            z-index: 9999;
            color: #1A1A2E;
        `;
        el.textContent = message;

        document.body.appendChild(el);
        setTimeout(() => {
            el.style.opacity = "0";
            setTimeout(() => el.remove(), 300);
        }, 2000);
    }
}



// ==================== APPLICATION INIT ====================

const notificationManager = new NotificationManager();

// Event Listeners
document.getElementById("markAllRead").addEventListener("click", () => {
    notificationManager.markAllAsRead();
});

document.getElementById("clearAll").addEventListener("click", () => {
    notificationManager.clearAll();
});

document.querySelectorAll(".filter-tab").forEach(tab => {
    tab.addEventListener("click", e => {
        document.querySelectorAll(".filter-tab").forEach(t => t.classList.remove("active"));
        e.target.classList.add("active");
        notificationManager.setFilter(e.target.dataset.filter);
    });
});

// Initial Load
document.addEventListener("DOMContentLoaded", () => {
    notificationManager.loadNotifications();
});
