(() => {
    "use strict";

    const $ = (selector, parent = document) =>
        parent.querySelector(selector);

    const $$ = (selector, parent = document) =>
        [...parent.querySelectorAll(selector)];

    const STORAGE = {
        chats: "ankul_chats",
        model: "ankul_model",
        theme: "ankul_theme",
        enterSend: "ankul_enter_send",
        timestamps: "ankul_timestamps",
        saved: "ankul_saved"
    };

    function safeJSON(value, fallback) {
        try {
            const parsed = JSON.parse(value);
            return parsed ?? fallback;
        } catch {
            return fallback;
        }
    }

    const state = {
        messages: [],
        chats: safeJSON(
            localStorage.getItem(STORAGE.chats) || "[]",
            []
        ),
        saved: safeJSON(
            localStorage.getItem(STORAGE.saved) || "[]",
            []
        ),

        selectedModel:
            localStorage.getItem(STORAGE.model) ||
            "gemini-3.8-flash",

        theme:
            localStorage.getItem(STORAGE.theme) ||
            "dark",

        enterToSend:
            localStorage.getItem(STORAGE.enterSend) !== "false",

        timestamps:
            localStorage.getItem(STORAGE.timestamps) === "true",

        currentChatId: null,
        attachedFiles: [],
        isLoading: false,
        abortController: null,
        recognition: null,
        isListening: false
    };

    function generateId() {
        return (
            Date.now().toString(36) +
            "-" +
            Math.random()
                .toString(36)
                .slice(2, 10)
        );
    }

    function now() {
        return new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function toast(message, duration = 2600) {
        const el = $("#toast");

        if (!el) return;

        el.textContent = String(message);
        el.classList.add("show");

        clearTimeout(toast.timer);

        toast.timer = setTimeout(() => {
            el.classList.remove("show");
        }, duration);
    }

    function persistChats() {
        localStorage.setItem(
            STORAGE.chats,
            JSON.stringify(state.chats)
        );
    }

    function persistSaved() {
        localStorage.setItem(
            STORAGE.saved,
            JSON.stringify(state.saved)
        );
    }

    function currentChat() {
        return (
            state.chats.find(
                chat =>
                    chat.id ===
                    state.currentChatId
            ) || null
        );
    }

    function ensureCurrentChat() {
        if (
            state.currentChatId &&
            currentChat()
        ) {
            return currentChat();
        }

        const chat = {
            id: generateId(),
            title: "New chat",
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        state.currentChatId = chat.id;

        state.chats.unshift(chat);

        persistChats();
        renderHistory();

        return chat;
    }

    function saveCurrentChat() {
        const chat = currentChat();

        if (!chat) return;

        chat.messages =
            state.messages.map(message => ({
                role: message.role,
                content: message.content,
                time: message.time || ""
            }));

        chat.updatedAt = Date.now();

        persistChats();
        renderHistory();
    }

    function updateChatTitle() {
        const chat = currentChat();

        if (!chat) return;

        const firstUser =
            state.messages.find(
                message =>
                    message.role === "user"
            );

        if (firstUser) {
            const clean =
                firstUser.content
                    .replace(/\s+/g, " ")
                    .trim();

            chat.title =
                clean.length > 55
                    ? clean.slice(0, 55) + "…"
                    : clean || "New chat";
        }

        chat.updatedAt = Date.now();

        persistChats();
        renderHistory();
    }

    function applyTheme() {
        document.body.classList.toggle(
            "light-theme",
            state.theme === "light"
        );

        document.documentElement.dataset.theme =
            state.theme;

        localStorage.setItem(
            STORAGE.theme,
            state.theme
        );
    }

    function updateSettingsUI() {
        const enter =
            $("#enterSendSwitch");

        const timestamps =
            $("#timestampSwitch");

        if (enter) {
            enter.checked =
                state.enterToSend;
        }

        if (timestamps) {
            timestamps.checked =
                state.timestamps;
        }
    }

    function setModel(model) {
        const allowed = [
            "gemini-3.8-flash",
            "gemini-3.6-flash",
            "auto"
        ];

        state.selectedModel =
            allowed.includes(model)
                ? model
                : "gemini-3.8-flash";

        localStorage.setItem(
            STORAGE.model,
            state.selectedModel
        );

        const selected =
            $("#selectedModel");

        if (selected) {
            selected.textContent =
                state.selectedModel;
        }

        $$(".model-option").forEach(
            option => {
                const active =
                    option.dataset.model ===
                    state.selectedModel;

                option.classList.toggle(
                    "active",
                    active
                );

                const last =
                    option.querySelector(
                        "span:last-child"
                    );

                if (last) {
                    last.textContent =
                        active ? "✓" : "";
                }
            }
        );
    }

    function formatMessage(text) {
        let html = escapeHTML(text);

        html = html.replace(
            /```([a-zA-Z0-9_+#.-]*)\s*\n?([\s\S]*?)```/g,
            (_, language, code) => {
                const id =
                    "code-" +
                    generateId();

                return `
                    <div class="ankul-code-block">
                        <div class="code-header">
                            <span>
                                ${escapeHTML(
                                    language ||
                                    "code"
                                )}
                            </span>

                            <button
                                type="button"
                                class="copy-code"
                                data-code-id="${id}"
                            >
                                Copy
                            </button>
                        </div>

                        <pre id="${id}">
<code>${escapeHTML(
                    code.replace(/\n$/, "")
                )}</code>
                        </pre>
                    </div>
                `;
            }
        );

        html = html.replace(
            /`([^`\n]+)`/g,
            "<code>$1</code>"
        );

        html = html.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );

        html = html.replace(
            /(^|[\s(])\*(?!\s)([^*]+)\*(?=[\s).,!?:;]|$)/g,
            "$1<em>$2</em>"
        );

        html = html.replace(
            /\n/g,
            "<br>"
        );

        return html;
    }

    function showWelcome() {
        const welcome =
            $("#welcomeScreen");

        const messages =
            $("#messages");

        if (!welcome || !messages) {
            return;
        }

        const hasMessages =
            state.messages.length > 0;

        welcome.hidden =
            hasMessages;

        messages.hidden =
            !hasMessages;
    }

    function renderMessages() {
        const container =
            $("#messages");

        if (!container) return;

        container.innerHTML = "";

        state.messages.forEach(
            (message, index) => {
                const isUser =
                    message.role ===
                    "user";

                const wrapper =
                    document.createElement(
                        "article"
                    );

                wrapper.className =
                    `message ${
                        isUser
                            ? "user-message"
                            : "assistant-message"
                    }`;

                const time =
                    state.timestamps &&
                    message.time
                        ? `
                            <div class="message-time">
                                ${escapeHTML(
                                    message.time
                                )}
                            </div>
                          `
                        : "";

                wrapper.innerHTML = `
                    <div class="message-avatar">
                        ${isUser ? "U" : "A"}
                    </div>

                    <div class="message-content">

                        <div class="message-name">
                            ${
                                isUser
                                    ? "You"
                                    : "Ankul AI"
                            }
                        </div>

                        <div class="message-text">
                            ${formatMessage(
                                message.content
                            )}
                        </div>

                        ${time}

                        <div class="message-actions">

                            <button
                                type="button"
                                class="message-tool"
                                data-action="copy"
                                data-index="${index}"
                                title="Copy"
                            >
                                ⧉
                            </button>

                            ${
                                !isUser
                                    ? `
                                <button
                                    type="button"
                                    class="message-tool"
                                    data-action="regenerate"
                                    data-index="${index}"
                                    title="Regenerate"
                                >
                                    ↻
                                </button>

                                <button
                                    type="button"
                                    class="message-tool"
                                    data-action="save"
                                    data-index="${index}"
                                    title="Save"
                                >
                                    ♡
                                </button>
                            `
                                    : ""
                            }

                            <button
                                type="button"
                                class="message-tool"
                                data-action="delete"
                                data-index="${index}"
                                title="Delete"
                            >
                                ×
                            </button>

                        </div>

                    </div>
                `;

                container.appendChild(
                    wrapper
                );
            }
        );

        showWelcome();

        requestAnimationFrame(() => {
            const chat =
                $("#chatArea");

            if (chat) {
                chat.scrollTop =
                    chat.scrollHeight;
            }
        });
    }

    function addMessage(
        role,
        content
    ) {
        state.messages.push({
            role,
            content: String(
                content ?? ""
            ),
            time: now()
        });

        renderMessages();
        saveCurrentChat();
    }

    function setLoading(loading) {
        state.isLoading =
            loading;

        const indicator =
            $("#typingIndicator");

        const send =
            $("#sendButton");

        if (indicator) {
            indicator.hidden =
                !loading;
        }

        if (send) {
            send.textContent =
                loading
                    ? "■"
                    : "➤";

            send.title =
                loading
                    ? "Stop"
                    : "Send";
        }
    }

    function friendlyError(error) {
        const message =
            String(
                error?.message ||
                error ||
                "Unknown error"
            );

        if (
            /failed to fetch|networkerror|load failed/i.test(
                message
            )
        ) {
            return (
                "Network error: server/API " +
                "se connection nahi ho paaya. " +
                "Internet aur Vercel deployment check karo."
            );
        }

        if (/abort/i.test(message)) {
            return "Generation stopped.";
        }

        return message;
    }

    async function sendMessage(
        forcedText = null
    ) {
        if (state.isLoading) {
            return;
        }

        const input =
            $("#messageInput");

        if (!input) return;

        const text =
            forcedText !== null
                ? String(
                      forcedText
                  ).trim()
                : input.value.trim();

        if (
            !text &&
            state.attachedFiles.length ===
                0
        ) {
            toast(
                "Message likho ya file attach karo."
            );

            input.focus();

            return;
        }

        ensureCurrentChat();

        const attachments =
            state.attachedFiles.map(
                file => ({
                    ...file
                })
            );

        const visibleUserText =
            text ||
            "Please analyze the attached file(s).";

        input.value = "";

        resizeTextarea();

        addMessage(
            "user",
            visibleUserText
        );

        updateChatTitle();

        const history =
            state.messages
                .slice(0, -1)
                .filter(
                    message =>
                        message.role ===
                            "user" ||
                        message.role ===
                            "assistant"
                )
                .slice(-40)
                .map(message => ({
                    role:
                        message.role,
                    content:
                        message.content
                }));

        state.attachedFiles = [];

        renderAttachmentState();

        setLoading(true);

        state.abortController =
            new AbortController();

        try {
            const response =
                await fetch(
                    "/api/chat.php",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Accept:
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                message:
                                    text,

                                model:
                                    state.selectedModel,

                                history,

                                attachments
                            }),

                        signal:
                            state.abortController
                                .signal
                    }
                );

            const raw =
                await response.text();

            let data;

            try {
                data =
                    JSON.parse(raw);
            } catch {
                throw new Error(
                    `Server returned non-JSON response (${response.status}). ${raw.slice(
                        0,
                        180
                    )}`
                );
            }

            if (
                !response.ok ||
                !data.success
            ) {
                throw new Error(
                    data.message ||
                        data.error ||
                        `AI request failed (${response.status}).`
                );
            }

            if (
                !data.message ||
                !String(
                    data.message
                ).trim()
            ) {
                throw new Error(
                    "Gemini returned an empty response."
                );
            }

            addMessage(
                "assistant",
                data.message
            );

            updateChatTitle();
        } catch (error) {
            const message =
                friendlyError(error);

            if (
                !/generation stopped/i.test(
                    message
                )
            ) {
                console.error(
                    "Ankul AI:",
                    error
                );

                addMessage(
                    "assistant",
                    `⚠️ ${message}`
                );

                toast(
                    "AI response failed."
                );
            } else {
                toast(message);
            }
        } finally {
            state.abortController =
                null;

            setLoading(false);
        }
    }

    function stopGeneration() {
        if (
            state.abortController
        ) {
            state.abortController.abort();
        }
    }

    function newChat() {
        if (state.messages.length) {
            saveCurrentChat();
        }

        const chat = {
            id: generateId(),
            title: "New chat",
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        state.chats.unshift(chat);

        state.currentChatId =
            chat.id;

        state.messages = [];

        state.attachedFiles = [];

        persistChats();

        renderHistory();
        renderMessages();
        renderAttachmentState();

        closeSidebar();

        setActiveNav("home");

        const input =
            $("#messageInput");

        if (input) {
            input.focus();
        }
    }

    function loadChat(id) {
        const chat =
            state.chats.find(
                item =>
                    item.id === id
            );

        if (!chat) return;

        state.currentChatId =
            id;

        state.messages =
            Array.isArray(
                chat.messages
            )
                ? chat.messages.map(
                      message => ({
                          role:
                              message.role,

                          content:
                              String(
                                 
