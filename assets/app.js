(() => {
    "use strict";

    const state = {
        messages: [],
        isLoading: false,
        isListening: false,
        selectedModel: localStorage.getItem("ankul_model") || "gemini-3.8-flash",
        theme: localStorage.getItem("ankul_theme") || "dark",
        enterToSend: localStorage.getItem("ankul_enter_send") !== "false",
        timestamps: localStorage.getItem("ankul_timestamps") === "true"
    };

    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => [...document.querySelectorAll(selector)];

    function toast(message) {
        const el = $("#toast");
        if (!el) return;

        el.textContent = message;
        el.classList.add("show");

        clearTimeout(window.__ankulToast);
        window.__ankulToast = setTimeout(() => {
            el.classList.remove("show");
        }, 2200);
    }

    function escapeHTML(text) {
        return String(text ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatMessage(text) {
        let html = escapeHTML(text);

        html = html.replace(
            /```([\s\S]*?)```/g,
            '<pre><code>$1</code></pre>'
        );

        html = html.replace(
            /`([^`]+)`/g,
            "<code>$1</code>"
        );

        html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        html = html.replace(/\n/g, "<br>");

        return html;
    }

    function saveState() {
        localStorage.setItem(
            "ankul_messages",
            JSON.stringify(state.messages)
        );
    }

    function loadState() {
        try {
            const saved = localStorage.getItem("ankul_messages");

            if (saved) {
                state.messages = JSON.parse(saved);

                if (!Array.isArray(state.messages)) {
                    state.messages = [];
                }
            }
        } catch {
            state.messages = [];
        }
    }

    function applyTheme() {
        document.documentElement.setAttribute(
            "data-theme",
            state.theme
        );

        document.body.classList.toggle(
            "light-theme",
            state.theme === "light"
        );

        localStorage.setItem("ankul_theme", state.theme);

        const switchEl = $("#darkModeSwitch");

        if (switchEl) {
            switchEl.checked = state.theme === "dark";
        }
    }

    function updateModelUI() {
        const selected = $("#selectedModel");

        if (selected) {
            selected.textContent = state.selectedModel;
        }

        $$(".model-option").forEach((item) => {
            item.classList.toggle(
                "active",
                item.dataset.model === state.selectedModel
            );
        });
    }

    function showWelcome() {
        const welcome = $("#welcomeScreen");
        const messages = $("#messages");

        if (welcome) welcome.hidden = state.messages.length > 0;
        if (messages) messages.hidden = state.messages.length === 0;
    }

    function renderMessages() {
        const container = $("#messages");

        if (!container) return;

        container.innerHTML = "";

        state.messages.forEach((message) => {
            const item = document.createElement("div");

            item.className =
                message.role === "user"
                    ? "message user-message"
                    : "message assistant-message";

            const time = message.time
                ? new Date(message.time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                  })
                : "";

            item.innerHTML = `
                <div class="message-avatar">
                    ${message.role === "user" ? "U" : "A"}
                </div>

                <div class="message-content">
                    <div class="message-name">
                        ${message.role === "user" ? "You" : "Ankul AI"}
                    </div>

                    <div class="message-text">
                        ${formatMessage(message.content)}
                    </div>

                    ${
                        state.timestamps && time
                            ? `<div class="message-time">${time}</div>`
                            : ""
                    }
                </div>
            `;

            container.appendChild(item);
        });

        showWelcome();

        requestAnimationFrame(() => {
            container.scrollTop = container.scrollHeight;
        });
    }

    function addMessage(role, content) {
        state.messages.push({
            role,
            content,
            time: Date.now()
        });

        saveState();
        renderMessages();
        renderHistory();
    }

    function setLoading(value) {
        state.isLoading = value;

        const typing = $("#typingIndicator");
        const send = $("#sendButton");

        if (typing) {
            typing.hidden = !value;
        }

        if (send) {
            send.disabled = value;
        }
    }

    async function sendMessage(text) {
        text = String(text || "").trim();

        if (!text || state.isLoading) return;

        addMessage("user", text);

        const input = $("#messageInput");

        if (input) {
            input.value = "";
            input.style.height = "auto";
        }

        setLoading(true);

        try {
            const history = state.messages
                .slice(0, -1)
                .map((m) => ({
                    role: m.role,
                    content: m.content
                }));

            const response = await fetch("/api/chat.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: text,
                    history: history,
                    model: state.selectedModel
                })
            });

            let data;

            try {
                data = await response.json();
            } catch {
                throw new Error("Server returned an invalid response.");
            }

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    data.error ||
                    "AI response failed."
                );
            }

            addMessage(
                "assistant",
                data.message || "No response received."
            );

        } catch (error) {
            console.error("Ankul AI error:", error);

            addMessage(
                "assistant",
                "Sorry, abhi AI response nahi de pa raha hoon.\n\n" +
                "Please check your Gemini API configuration and try again."
            );

            toast("AI response failed");
        } finally {
            setLoading(false);

            const input = $("#messageInput");

            if (input) {
                input.focus();
            }
        }
    }

    function newChat() {
        state.messages = [];

        localStorage.removeItem("ankul_messages");

        renderMessages();
        renderHistory();

        const input = $("#messageInput");

        if (input) {
            input.value = "";
            input.focus();
        }

        closeModelMenu();
        closeSidebar();

        toast("New chat started");
    }

    function renderHistory() {
        const list = $("#historyList");

        if (!list) return;

        list.innerHTML = "";

        if (!state.messages.length) {
            list.innerHTML = `
                <div class="empty-history">
                    No conversations yet
                </div>
            `;
            return;
        }

        const firstUserMessage = state.messages.find(
            (m) => m.role === "user"
        );

        const title = firstUserMessage
            ? firstUserMessage.content.slice(0, 32)
            : "New chat";

        const item = document.createElement("button");

        item.type = "button";
        item.className = "history-item";
        item.textContent = title;

        item.addEventListener("click", () => {
            renderMessages();
            closeSidebar();
        });

        list.appendChild(item);
    }

    function setupInput() {
        const input = $("#messageInput");
        const form = $("#chatForm");

        if (!input || !form) return;

        input.addEventListener("input", () => {
            input.style.height = "auto";
            input.style.height =
                Math.min(input.scrollHeight, 130) + "px";
        });

        input.addEventListener("keydown", (event) => {
            if (
                event.key === "Enter" &&
                !event.shiftKey &&
                state.enterToSend
            ) {
                event.preventDefault();
                form.requestSubmit();
            }
        });

        form.addEventListener("submit", (event) => {
            event.preventDefault();

            sendMessage(input.value);
        });
    }

    function setupSuggestions() {
        $$(".prompt-card").forEach((card) => {
            card.addEventListener("click", () => {
                const prompt =
                    card.dataset.prompt ||
                    card.querySelector("h3")?.textContent ||
                    card.textContent.trim();

                const input = $("#messageInput");

                if (!input) return;

                input.value = prompt;
                input.focus();

                input.dispatchEvent(new Event("input"));

                toast("Suggestion added");
            });
        });
    }

    function setupNewChat() {
        $("#newChatButton")?.addEventListener(
            "click",
            newChat
        );

        $("#quickNewChat")?.addEventListener(
            "click",
            newChat
        );
    }

    function setupSidebar() {
        const sidebar = $("#sidebar");
        const menuButton = $("#menuButton");
        const closeButton = $("#closeSidebar");

        menuButton?.addEventListener("click", () => {
            sidebar?.classList.add("open");
        });

        closeButton?.addEventListener("click", () => {
            closeSidebar();
        });
    }

    function closeSidebar() {
        $("#sidebar")?.classList.remove("open");
    }

    function setupSearch() {
        const input = $("#searchInput");

        if (!input) return;

        input.addEventListener("input", () => {
            const query = input.value.toLowerCase().trim();

            $$("#historyList .history-item").forEach((item) => {
                item.hidden =
                    query &&
                    !item.textContent.toLowerCase().includes(query);
            });
        });
    }

    function setupClearChats() {
        $("#clearChatsButton")?.addEventListener(
            "click",
            () => {
                if (!state.messages.length) {
                    toast("No chats to clear");
                    return;
                }

                const confirmed = confirm(
                    "Clear all chats?"
                );

                if (!confirmed) return;

                state.messages = [];

                localStorage.removeItem(
                    "ankul_messages"
                );

                renderMessages();
                renderHistory();

                toast("All chats cleared");
            }
        );
    }

    function closeModelMenu() {
        const menu = $("#modelMenu");

        if (menu) {
            menu.hidden = true;
        }
    }

    function setupModelSelector() {
        const button = $("#modelButton");
        const menu = $("#modelMenu");

        if (!button || !menu) return;

        button.addEventListener("click", (event) => {
            event.stopPropagation();
            menu.hidden = !menu.hidden;
        });

        menu.addEventListener("click", (event) => {
            const option =
                event.target.closest("[data-model]");

            if (!option) return;

            state.selectedModel =
                option.dataset.model;

            localStorage.setItem(
                "ankul_model",
                state.selectedModel
            );

            updateModelUI();
            closeModelMenu();

            toast(
                "Model: " +
                state.selectedModel
            );
        });

        document.addEventListener("click", (event) => {
            if (
                !menu.contains(event.target) &&
                !button.contains(event.target)
            ) {
                closeModelMenu();
            }
        });
    }

    function setupTheme() {
        $("#themeButton")?.addEventListener(
            "click",
            () => {
                state.theme =
                    state.theme === "dark"
                        ? "light"
                        : "dark";

                applyTheme();

                toast(
                    state.theme === "dark"
                        ? "Switched to dark mode"
                        : "Switched to light mode"
                );
            }
        );

        const switchEl = $("#darkModeSwitch");

        switchEl?.addEventListener(
            "change",
            () => {
                state.theme =
                    switchEl.checked
                        ? "dark"
                        : "light";

                applyTheme();
            }
        );
    }

    function setupModals() {
        $$("[data-close-modal]").forEach((button) => {
            button.addEventListener("click", () => {
                const id =
                    button.dataset.closeModal;

                const modal = document.getElementById(id);

                if (modal) {
                    modal.hidden = true;
                }
            });
        });

        $("#settingsButton")?.addEventListener(
            "click",
            () => {
                const modal = $("#settingsModal");

                if (modal) {
                    modal.hidden = false;
                }

                closeSidebar();
            }
        );

        $("#aboutButton")?.addEventListener(
            "click",
            () => {
                const modal = $("#aboutModal");

                if (modal) {
                    modal.hidden = false;
                }

                closeSidebar();
            }
        );

        $$(".modal").forEach((modal) => {
            modal.addEventListener("click", (event) => {
                if (event.target === modal) {
                    modal.hidden = true;
                }
            });
        });

        document.addEventListener("keydown", (event) => {
            if (event.key !== "Escape") return;

            $$(".modal").forEach((modal) => {
                modal.hidden = true;
            });

            closeModelMenu();
        });
    }

    function restoreSettings() {
        const enterSwitch = $("#enterSendSwitch");
        const timestampSwitch = $("#timestampSwitch");

        if (enterSwitch) {
            enterSwitch.checked =
                state.enterToSend;

            enterSwitch.addEventListener(
                "change",
                () => {
                    state.enterToSend =
                        enterSwitch.checked;

                    localStorage.setItem(
                        "ankul_enter_send",
                        String(state.enterToSend)
                    );
                }
            );
        }

        if (timestampSwitch) {
            timestampSwitch.checked =
                state.timestamps;

            timestampSwitch.addEventListener(
                "change",
                () => {
                    state.timestamps =
                        timestampSwitch.checked;

                    localStorage.setItem(
                        "ankul_timestamps",
                        String(state.timestamps)
                    );

                    renderMessages();
                }
            );
        }
    }

    function setupAttachment() {
        const button = $("#attachButton");
        const input = $("#fileInput");

        if (!button || !input) return;

        button.addEventListener("click", () => {
            input.click();
        });

        input.addEventListener("change", () => {
            const file = input.files?.[0];

            if (!file) return;

            toast(
                "Selected: " + file.name
            );

            input.value = "";
        });
    }

    function setupVoice() {
        const button = $("#voiceButton");

        if (!button) return;

        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            button.addEventListener("click", () => {
                toast(
                    "Voice input is not supported in this browser"
                );
            });

            return;
        }

        const recognition =
            new SpeechRecognition();

        recognition.lang = "hi-IN";
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            state.isListening = true;
            button.classList.add("active");
            toast("Listening...");
        };

        recognition.onresult = (event) => {
            const text =
                event.results[0][0].transcript;

            const input = $("#messageInput");

            if (input) {
                input.value =
                    (input.value
                        ? input.value + " "
                        : "") + text;

                input.dispatchEvent(
                    new Event("input")
                );

                input.focus();
            }
        };

        recognition.onerror = () => {
            toast("Voice input failed");
        };

        recognition.onend = () => {
            state.isListening = false;
            button.classList.remove("active");
        };

        button.addEventListener("click", () => {
            if (state.isListening) {
                recognition.stop();
            } else {
                recognition.start();
            }
        });
    }

    function setupNavigation() {
        $$(".nav-item").forEach((item) => {
            item.addEventListener("click", () => {
                $$(".nav-item").forEach((x) =>
                    x.classList.remove("active")
                );

                item.classList.add("active");

                const page = item.dataset.page;

                if (page === "home") {
                    if (!state.messages.length) {
                        showWelcome();
                    } else {
                        renderMessages();
                    }
                }

                if (page === "history") {
                    renderHistory();
                    toast("Chat history");
                }

                if (page === "saved") {
                    toast("Saved chats");
                }

                closeSidebar();
            });
        });

        $("#topMoreButton")?.addEventListener(
            "click",
            () => {
                toast("More options");
            }
        );
    }

    function setupGlobalClickSafety() {
        document.addEventListener(
            "click",
            (event) => {
                const button =
                    event.target.closest("button");

                if (!button) return;

                if (
                    button.disabled ||
                 
