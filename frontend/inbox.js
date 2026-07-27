const API_URL = "https://campus-market-92ie.onrender.com";

// ================= SOCKET =================
const socket = io("https://campus-market-92ie.onrender.com");

// ================= USER =================
const user = JSON.parse(localStorage.getItem("user") || "null");
const token = localStorage.getItem("token");

let allConversations = [];

// ================= LOGIN CHECK =================
if (!user || !token) {
    alert("Please login first");
    window.location.href = "login.html";
}

// ================= JOIN SOCKET ROOM =================
if (user && user.id) {
    socket.emit("join", user.id);
}

// ================= LOAD INBOX =================
async function loadInbox() {
    try {
        const response = await fetch(`${API_URL}/messages/inbox`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();
        console.log("INBOX DATA:", data);

        allConversations = data.conversations || [];
        displayConversations(allConversations);
        updateBadge(data.unreadCount || 0);

    } catch (error) {
        console.log("Inbox error:", error);
    }
}

// ================= UPDATE MESSAGE BADGE =================
function updateBadge(count) {
    const badge = document.getElementById("message-count");
    if (!badge) return;

    if (count > 0) {
        badge.innerHTML = count;
        badge.style.display = "inline-block";
    } else {
        badge.innerHTML = "";
        badge.style.display = "none";
    }
}

// ================= DISPLAY CONVERSATIONS =================
function displayConversations(conversations) {
    const container = document.getElementById("conversations");
    if (!container) return;

    container.innerHTML = "";

    if (!conversations || conversations.length === 0) {
        container.innerHTML = `
        <div class="empty-inbox">
            <h3>📭 No messages yet</h3>
            <p>Start buying or selling on Campus Market</p>
        </div>
        `;
        return;
    }

    conversations.forEach(chat => {
        if (!chat.user) return;

        const time = chat.time
            ? new Date(chat.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "";

        const firstLetter = (chat.user.name || "U").charAt(0).toUpperCase();

        container.innerHTML += `
        <div class="conversation-card" onclick="openChat('${chat.user._id}', '${chat.user.name}')">
            <div class="avatar">
                ${firstLetter}
            </div>

            <div class="conversation-info">
                <h3>${chat.user.name}</h3>
                <p>${chat.lastMessage || "No messages yet"}</p>
            </div>

            <div class="conversation-right">
                <small>${time}</small>
                ${chat.unread > 0 ? `<span class="unread-badge">${chat.unread}</span>` : ""}
            </div>
        </div>
        `;
    });
}

// ================= OPEN CHAT =================
function openChat(userId, name) {
    window.location.href = `chat.html?seller=${userId}&name=${encodeURIComponent(name)}`;
}

// ================= SEARCH =================
const search = document.getElementById("searchMessages");

if (search) {
    search.addEventListener("input", function() {
        const value = this.value.toLowerCase();
        const filtered = allConversations.filter(chat => {
            if (!chat.user || !chat.user.name) return false;
            return chat.user.name.toLowerCase().includes(value);
        });
        displayConversations(filtered);
    });
}

// ================= SOCKET REAL TIME =================
socket.on("newMessage", () => {
    console.log("📩 New message received");
    loadInbox();
});

socket.on("newNotification", () => {
    console.log("🔔 Notification received");
    loadInbox();
});

// ================= REFRESH WHEN OPEN =================
window.addEventListener("focus", () => {
    loadInbox();
});

// ================= START =================
loadInbox();