(() => {
    "use strict";

    /* =====================================================
       ANKUL AI - COMPLETE APP.JS
       ===================================================== */

    const $ = (selector, parent = document) =>
        parent.querySelector(selector);

    const $$ = (selector, parent = document) =>
        [...parent.querySelectorAll(selector)];


    /* =====================================================
       STATE
       ===================================================== */

    const state = {
        messages: [],
        chats: JSON.parse(
            localStorage.getItem("ankul_chats") || "[]"
        ),

        selectedModel:
            localStorage.getItem("ankul_model") ||
            "gemini-3.8-flash",

        theme:
            localStorage.getItem("ankul_theme") ||
            "dark",

        enterToSend:
            localStorage.getItem("ankul_enter_send") !== "false",

        timestamps:
            localStorage.getItem("ankul_timestamps") === "true",

        isLoading: false,
        isListening: false,
        currentChatId: null,
        attachedFiles: []
    };


    /* =====================================================
       BASIC HELPERS
       ===================================================== */

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    function toast(message) {
        const el = $("#toast");

        if (!el) return;

        el.textContent = message;
        el.classList.add("show");

        clearTimeout(toast.timer);

        toast.timer = setTimeout(() => {
            el.classList.remove("show");
        }, 2200);
    }


    function now() {
        return new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
    }


    function generateId() {
        return (
            Date.now().toString(36) +
            Math.random()
                .toString(36)
                .slice(2)
        );
    }


    /* =====================================================
       MARKDOWN FORMATTER
       ===================================================== */

    function formatMessage(text) {

        let html = escapeHTML(text);

        const codeBlocks = [];

        html = html.replace(
            /```([\w+-]*)\n?([\s\S]*?)```/g,
            (_, language, code) => {

                const id =
                    "code-" +
                    Math.random()
                        .toString(36)
                        .slice(2);

                codeBlocks.push({
                    id,
                    code
                });

                return `
                    <div class="ankul-code-block">
                        <div style="
                            display:flex;
                            justify-content:space-between;
                            align-items:center;
                            padding:6px 8px;
                            border-bottom:1px solid #292c35;
                            color:#777;
                            font-size:8px;
                        ">
                            <span>${escapeHTML(language || "code")}</span>

                            <button
                                type="button"
                                class="copy-code"
                                data-code-id="${id}"
                            >
                                Copy
                            </button>
                        </div>

                        <pre id="${id}" style="
                            margin:0;
                            padding:12px;
                            overflow:auto;
                            color:#d7d9e0;
                            font-size:10px;
                            line-height:1.55;
                        ">${escapeHTML(code)}</pre>
                    </div>
                `;
            }
        );


        html = html.replace(
            /`([^`]+)`/g,
            "<code>$1</code>"
        );


        html = html.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );


        html = html.replace(
            /\*(.*?)\*/g,
            "<em>$1</em>"
        );


        html = html.replace(
            /\n/g,
            "<br>"
        );


        return html;
    }


    /* =====================================================
       STORAGE
       ===================================================== */

    function saveChats() {
        localStorage.setItem(
            "ankul_chats",
            JSON.stringify(state.chats)
        );
    }


    function saveCurrentChat() {

        if (!state.currentChatId) return;

        const chat =
            state.chats.find(
                c => c.id === state.currentChatId
            );

        if (!chat) return;

        chat.messages =
            state.messages.map(m => ({
                role: m.role,
                content: m.content,
                time: m.time || ""
            }));

        saveChats();
        renderHistory();
    }


    function loadChat(id) {

        const chat =
            state.chats.find(
                c => c.id === id
            );

        if (!chat) return;

        state.currentChatId = id;

        state.messages =
            Array.isArray(chat.messages)
                ? [...chat.messages]
                : [];

        renderMessages();
        closeSidebar();

        setActiveNav("history");
    }


    /* =====================================================
       THEME
       ===================================================== */

    function applyTheme() {

        document.body.classList.toggle(
            "light-theme",
            state.theme === "light"
        );

        document.documentElement.dataset.theme =
            state.theme;

        localStorage.setItem(
            "ankul_theme",
            state.theme
        );
    }


    /* =====================================================
       MODEL
       ===================================================== */

    function updateModelUI() {

        const selected = $("#selectedModel");

        if (selected) {
            selected.textContent =
                state.selectedModel;
        }


        $$(".model-option").forEach(option => {

            option.classList.toggle(
                "active",
                option.dataset.model ===
                    state.selectedModel
            );

            const check =
                option.querySelector("span:last-child");

            if (
                check &&
                option.dataset.model !==
                    state.selectedModel
            ) {
                check.textContent = "";
            }
        });


        localStorage.setItem(
            "ankul_model",
            state.selectedModel
        );
    }


    /* =====================================================
       WELCOME
       ===================================================== */

    function showWelcome() {

        const welcome = $("#welcomeScreen");
        const messages = $("#messages");

        if (!welcome || !messages) return;

        if (state.messages.length === 0) {

            welcome.hidden = false;
            messages.hidden = true;

        } else {

            welcome.hidden = true;
            messages.hidden = false;
        }
    }


    /* =====================================================
       RENDER MESSAGES
       ===================================================== */

    function renderMessages() {

        const container = $("#messages");

        if (!container) return;

        container.innerHTML = "";


        state.messages.forEach(
            (message, index) => {

                const isUser =
                    message.role === "user";

                const wrapper =
                    document.createElement("div");

                wrapper.className =
                    "message " +
                    (
                        isUser
                            ? "user-message"
                            : "assistant-message"
                    );


                const content =
                    formatMessage(
                        message.content
                    );


                const time =
                    state.timestamps &&
                    message.time
                        ? `
                            <div class="message-time">
                                ${escapeHTML(message.time)}
                            </div>
                          `
                        : "";


                wrapper.innerHTML = `

                    <div class="message-avatar">
                        ${isUser ? "U" : "A"}
                    </div>

                    <div class="message-content">

                        <div class="message-name">
                            ${isUser ? "You" : "Ankul AI"}
                        </div>

                        <div class="message-text">
                            ${content}
                        </div>

                        ${time}

                        <div
                            class="message-actions"
                            style="
                                display:flex;
                                gap:5px;
                                margin-top:7px;
                            "
                        >

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


        setTimeout(() => {

            const chat =
                $("#chatArea");

            if (chat) {
                chat.scrollTop =
                    chat.scrollHeight;
            }

        }, 20);
    }


    /* =====================================================
       ADD MESSAGE
       ===================================================== */

    function addMessage(
        role,
        content
    ) {

        state.messages.push({

            role,

            content,

            time: now()
        });


        renderMessages();
        saveCurrentChat();
    }


    /* =====================================================
       LOADING
       ===================================================== */

    function setLoading(value) {

        state.isLoading = value;

        const indicator =
            $("#typingIndicator");

        const send =
            $("#sendButton");


        if (indicator) {
            indicator.hidden = !value;
        }


        if (send) {

            send.textContent =
                value ? "■" : "➤";

            send.title =
                value
                    ? "Stop"
                    : "Send";
        }
    }


    /* =====================================================
       SEND MESSAGE
       ===================================================== */

    async function sendMessage(
        forcedText = null
    ) {

        if (state.isLoading) {
            return;
        }


        const input =
            $("#messageInput");

        if (!input) return;


        const message =
            forcedText !== null
                ? String(forcedText).trim()
                : input.value.trim();


        if (
            !message &&
            state.attachedFiles.length === 0
        ) {

            toast("Message likho.");
            return;
        }


        const attachments =
            [...state.attachedFiles];


        input.value = "";

        resizeTextarea();


        addMessage(
            "user",
            message ||
                "Please analyze the attached file."
        );


        const history =
            state.messages
                .slice(0, -1)
                .map(item => ({
                    role: item.role,
                    content: item.content
                }));


        state.attachedFiles = [];

        renderAttachmentState();


        setLoading(true);


        try {

            const response =
                await fetch(
                    "/api/chat.php",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            message:
                                message ||
                                "Please analyze the attached file.",

                            model:
                                state.selectedModel,

                            history,

                            attachments
                        })
                    }
                );


            let data = null;

            try {
                data =
                    await response.json();
            } catch {
                throw new Error(
                    "Server returned invalid response."
                );
            }


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "AI request failed."
                );
            }


            addMessage(
                "assistant",
                data.message
            );


        } catch (error) {

            console.error(error);

            addMessage(
                "assistant",
                "⚠️ Error: " +
                (
                    error.message ||
                    "AI response nahi aa saka."
                )
            );

            toast("AI request failed.");

        } finally {

            setLoading(false);
        }
    }


    /* =====================================================
       NEW CHAT
       ===================================================== */

    function newChat() {

        if (
            state.messages.length > 0 &&
            state.currentChatId
        ) {
            saveCurrentChat();
        }


        const id =
            generateId();


        state.currentChatId = id;
        state.messages = [];
        state.attachedFiles = [];


        state.chats.unshift({

            id,

            title: "New chat",

            messages: [],

            createdAt:
                Date.now()
        });


        saveChats();

        renderMessages();
        renderHistory();
        renderAttachmentState();

        closeSidebar();

        setActiveNav("home");

        const input =
            $("#messageInput");

        if (input) {
            input.focus();
        }
    }


    /* =====================================================
       HISTORY
       ===================================================== */

    function renderHistory(
        filter = ""
    ) {

        const list =
            $("#historyList");

        if (!list) return;


        list.innerHTML = "";


        const query =
            filter
                .trim()
                .toLowerCase();


        const chats =
            state.chats.filter(chat => {

                if (!query) {
                    return true;
                }

                return (
                    String(
                        chat.title || ""
                    )
                    .toLowerCase()
                    .includes(query)
                );
            });


        if (chats.length === 0) {

            list.innerHTML = `
                <div class="empty-history">
                    No chats yet
                </div>
            `;

            return;
        }


        chats.forEach(chat => {

            const button =
                document.createElement("button");

            button.type = "button";

            button.className =
                "history-item";


            button.textContent =
                chat.title ||
                "New chat";


            button.dataset.chatId =
                chat.id;


            list.appendChild(button);
        });
    }


    /* =====================================================
       CHAT TITLE
       ===================================================== */

    function updateChatTitle() {

        if (!state.currentChatId) {
            return;
        }


        const chat =
            state.chats.find(
                c => c.id === state.currentChatId
            );


        if (!chat) return;


        const firstUser =
            state.messages.find(
                m => m.role === "user"
            );


        if (firstUser) {

            let title =
                firstUser.content.trim();


            if (title.length > 45) {
                title =
                    title.slice(0, 45) +
                    "…";
            }


            chat.title =
                title || "New chat";
        }


        saveChats();
        renderHistory();
    }


    /* =====================================================
       SIDEBAR
       ===================================================== */

    function openSidebar() {

        const sidebar =
            $("#sidebar");

        if (sidebar) {
            sidebar.classList.add("open");
        }
    }


    function closeSidebar() {

        const sidebar =
            $("#sidebar");

        if (sidebar) {
            sidebar.classList.remove("open");
        }
    }


    /* =====================================================
       NAVIGATION
       ===================================================== */

    function setActiveNav(page) {

        $$(".nav-item").forEach(item => {

            item.classList.toggle(
                "active",
                item.dataset
