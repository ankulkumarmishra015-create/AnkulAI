(() => {
    "use strict";

    /* =========================================================
       ANKUL AI - ADVANCED FRONTEND
       ========================================================= */

    const state = {
        messages: [],
        isLoading: false,
        isListening: false,
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
        savedMessages:
            JSON.parse(
                localStorage.getItem("ankul_saved_messages") || "[]"
            ),
        controller: null,
        attachedFiles: []
    };

    const $ = (selector) =>
        document.querySelector(selector);

    const $$ = (selector) =>
        [...document.querySelectorAll(selector)];


    /* =========================================================
       BASIC HELPERS
       ========================================================= */

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
        let value = String(text ?? "");

        const codeBlocks = [];

        value = value.replace(
            /```(\w*)\n?([\s\S]*?)```/g,
            (_, language, code) => {
                const id = "code_" + Math.random()
                    .toString(36)
                    .slice(2);

                codeBlocks.push({
                    id,
                    language: language || "code",
                    code
                });

                return `___CODEBLOCK_${codeBlocks.length - 1}___`;
            }
        );

        value = escapeHTML(value);

        value = value.replace(
            /`([^`]+)`/g,
            "<code>$1</code>"
        );

        value = value.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );

        value = value.replace(
            /\*(.*?)\*/g,
            "<em>$1</em>"
        );

        value = value.replace(
            /^### (.*)$/gm,
            "<h4>$1</h4>"
        );

        value = value.replace(
            /^## (.*)$/gm,
            "<h3>$1</h3>"
        );

        value = value.replace(
            /^# (.*)$/gm,
            "<h2>$1</h2>"
        );

        value = value.replace(
            /^\s*[-*] (.*)$/gm,
            "• $1"
        );

        value = value.replace(
            /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
            '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
        );

        value = value.replace(
            /\n/g,
            "<br>"
        );

        codeBlocks.forEach((block, index) => {
            const code = escapeHTML(block.code);

            const html = `
                <div class="ankul-code-block"
                     style="
                        margin:10px 0;
                        border:1px solid rgba(255,255,255,.12);
                        border-radius:10px;
                        overflow:hidden;
                        background:rgba(0,0,0,.25);
                     ">

                    <div style="
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                        padding:7px 10px;
                        font-size:11px;
                        opacity:.75;
                        border-bottom:1px solid rgba(255,255,255,.08);
                     ">

                        <span>${escapeHTML(block.language)}</span>

                        <button
                            type="button"
                            class="copy-code-button"
                            data-code="${encodeURIComponent(block.code)}"
                            style="
                                cursor:pointer;
                                border:0;
                                border-radius:6px;
                                padding:4px 8px;
                                background:rgba(255,255,255,.08);
                                color:inherit;
                            "
                        >
                            Copy
                        </button>

                    </div>

                    <pre style="
                        margin:0;
                        padding:12px;
                        overflow:auto;
                        font-size:12px;
                        line-height:1.55;
                     "><code>${code}</code></pre>

                </div>
            `;

            value = value.replace(
                `___CODEBLOCK_${index}___`,
                html
            );
        });

        return value;
    }


    /* =========================================================
       STORAGE
       ========================================================= */

    function saveState() {
        localStorage.setItem(
            "ankul_messages",
            JSON.stringify(state.messages)
        );
    }


    function loadState() {
        try {
            const saved =
                localStorage.getItem("ankul_messages");

            if (!saved) {
                state.messages = [];
                return;
            }

            const parsed = JSON.parse(saved);

            state.messages =
                Array.isArray(parsed)
                    ? parsed
                    : [];

        } catch (error) {
            console.error(error);
            state.messages = [];
        }
    }


    function saveSavedMessages() {
        localStorage.setItem(
            "ankul_saved_messages",
            JSON.stringify(state.savedMessages)
        );
    }


    /* =========================================================
       THEME
       ========================================================= */

    function applyTheme() {
        document.documentElement.setAttribute(
            "data-theme",
            state.theme
        );

        document.body.classList.toggle(
            "light-theme",
            state.theme === "light"
        );

        localStorage.setItem(
            "ankul_theme",
            state.theme
        );
    }


    /* =========================================================
       MODEL
       ========================================================= */

    function updateModelUI() {
        const selected =
            $("#selectedModel");

        if (selected) {
            selected.textContent =
                state.selectedModel;
        }

        $$(".model-option").forEach((item) => {
            item.classList.toggle(
                "active",
                item.dataset.model ===
                    state.selectedModel
            );
        });
    }


    function closeModelMenu() {
        const menu = $("#modelMenu");

        if (menu) {
            menu.hidden = true;
        }
    }


    function setupModelSelector() {
        const button =
            $("#modelButton");

        const menu =
            $("#modelMenu");

        if (!button || !menu) return;

        button.addEventListener(
            "click",
            (event) => {
                event.stopPropagation();

                menu.hidden =
                    !menu.hidden;
            }
        );

        menu.addEventListener(
            "click",
            (event) => {
                const option =
                    event.target.closest(
                        "[data-model]"
                    );

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
            }
        );

        document.addEventListener(
            "click",
            (event) => {
                if (
                    !menu.contains(event.target) &&
                    !button.contains(event.target)
                ) {
                    closeModelMenu();
                }
            }
        );
    }


    /* =========================================================
       WELCOME / CHAT
       ========================================================= */

    function showWelcome() {
        const welcome =
            $("#welcomeScreen");

        const messages =
            $("#messages");

        if (!welcome || !messages) return;

        welcome.hidden =
            state.messages.length > 0;

        messages.hidden =
            state.messages.length === 0;
    }


    function renderMessages() {
        const container =
            $("#messages");

        if (!container) return;

        container.innerHTML = "";

        state.messages.forEach(
            (message, index) => {

                const item =
                    document.createElement("div");

                item.className =
                    message.role === "user"
                        ? "message user-message"
                        : "message assistant-message";

                const time =
                    message.time
                        ? new Date(
                              message.time
                          ).toLocaleTimeString(
                              [],
                              {
                                  hour: "2-digit",
                                  minute: "2-digit"
                              }
                          )
                        : "";

                item.innerHTML = `
                    <div class="message-avatar">
                        ${
                            message.role === "user"
                                ? "U"
                                : "A"
                        }
                    </div>

                    <div class="message-content">

                        <div class="message-name">
                            ${
                                message.role === "user"
                                    ? "You"
                                    : "Ankul AI"
                            }
                        </div>

                        <div class="message-text">
                            ${formatMessage(
                                message.content
                            )}
                        </div>

                        ${
                            state.timestamps && time
                                ? `
                                    <div class="message-time">
                                        ${time}
                                    </div>
                                  `
                                : ""
                        }

                        <div
                            class="message-tools"
                            style="
                                display:flex;
                                gap:5px;
                                margin-top:8px;
                                flex-wrap:wrap;
                            "
                        >

                            <button
                                type="button"
                                class="message-tool"
                                data-action="copy"
                                data-index="${index}"
                                title="Copy"
                            >
                                📋
                            </button>

                            ${
                                message.role ===
                                "assistant"
                                    ? `
                                    <button
                                        type="button"
                                        class="message-tool"
                                        data-action="regenerate"
                                        data-index="${index}"
                                        title="Regenerate"
                                    >
                                        🔄
                                    </button>
                                    `
                                    : ""
                            }

                            <button
                                type="button"
                                class="message-tool"
                                data-action="save"
                                data-index="${index}"
                                title="Save"
                            >
                                💾
                            </button>

                            <button
                                type="button"
                                class="message-tool"
                                data-action="delete"
                                data-index="${index}"
                                title="Delete"
                            >
                                🗑️
                            </button>

                        </div>

                    </div>
                `;

                container.appendChild(item);
            }
        );

        showWelcome();

        requestAnimationFrame(() => {
            container.scrollTop =
                container.scrollHeight;
        });
    }


    function addMessage(
        role,
        content
    ) {
        state.messages.push({
            role,
            content,
            time: Date.now()
        });

        saveState();
        renderMessages();
        renderHistory();
    }


    /* =========================================================
       LOADING / STOP
       ========================================================= */

    function setLoading(value) {
        state.isLoading = value;

        const typing =
            $("#typingIndicator");

        const send =
            $("#sendButton");

        if (typing) {
            typing.hidden = !value;
        }

        if (send) {
            send.disabled = value;

            send.textContent =
                value ? "■" : "➤";
        }
    }


    function stopGeneration() {
        if (!state.controller) {
            return;
        }

        state.controller.abort();

        state.controller = null;

        setLoading(false);

        toast("Generation stopped");
    }


    /* =========================================================
       SEND MESSAGE
       ========================================================= */

    async function sendMessage(text) {
        text = String(text || "").trim();

        if (!text) return;

        if (state.isLoading) {
            stopGeneration();
            return;
        }

        addMessage(
            "user",
            text
        );

        const input =
            $("#messageInput");

        if (input) {
            input.value = "";
            input.style.height = "auto";
        }

        setLoading(true);

        state.controller =
            new AbortController();

        try {
            const history =
                state.messages
                    .slice(0, -1)
                    .map((m) => ({
                        role: m.role,
                        content: m.content
                    }));

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
                            message: text,
                            history,
                            model:
                                state.selectedModel
                        }),

                        signal:
                            state.controller.signal
                    }
                );

            let data;

            try {
                data =
                    await response.json();
            } catch {
                throw new Error(
                    "Server returned invalid JSON."
                );
            }

            if (
                !response.ok ||
                !data.success
            ) {
                throw new Error(
                    data.message ||
                    data.error ||
                    "AI response failed."
                );
            }

            addMessage(
                "assistant",
                data.message ||
                    "No response received."
            );

        } catch (error) {

            if (
                error.name ===
                "AbortError"
            ) {
                return;
            }

            console.error(
                "Ankul AI:",
                error
            );

            addMessage(
                "assistant",
                "Sorry, abhi AI response nahi de pa raha hoon.\n\n" +
                "Please check your Gemini API configuration and try again."
            );

            toast(
                "AI response failed"
            );

        } finally {

            state.controller = null;

            setLoading(false);

            const input =
                $("#messageInput");

            if (input) {
                input.focus();
            }
        }
    }


    /* =========================================================
       NEW CHAT
       ========================================================= */

    function newChat() {
        if (
            state.messages.length &&
            !confirm(
                "Start a new chat?"
            )
        ) {
            return;
        }

        state.messages = [];

        localStorage.removeItem(
            "ankul_messages"
        );

        renderMessages();
        renderHistory();

        const input =
            $("#messageInput");

        if (input) {
            input.value = "";
            input.focus();
        }

        closeModelMenu();
        closeSidebar();

        toast(
            "New chat started"
        );
    }


    /* =========================================================
       HISTORY
       ========================================================= */

    function renderHistory(
        filter = ""
    ) {
        const list =
            $("#historyList");

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

        const firstUserMessage =
            state.messages.find(
                (m) =>
                    m.role === "user"
            );

        const title =
            firstUserMessage
                ? firstUserMessage.content
                      .replace(/\s+/g, " ")
                      .slice(0, 40)
                : "New chat";

        if (
            filter &&
            !title
                .toLowerCase()
                .includes(
                    f
