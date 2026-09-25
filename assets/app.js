"use strict";

/* =====================================================
   ANKUL AI - COMPLETE APP
   ===================================================== */

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
        localStorage.getItem("ankul_timestamps") === "true"

};


/* =====================================================
   HELPERS
   ===================================================== */

const $ = (selector) =>
    document.querySelector(selector);

const $$ = (selector) =>
    document.querySelectorAll(selector);


/* =====================================================
   ELEMENTS
   ===================================================== */

const chatForm =
    $("#chatForm");

const messageInput =
    $("#messageInput");

const sendButton =
    $("#sendButton");

const messages =
    $("#messages");

const welcomeScreen =
    $("#welcomeScreen");

const typingIndicator =
    $("#typingIndicator");

const chatArea =
    $("#chatArea");

const sidebar =
    $("#sidebar");

const sidebarOverlay =
    $("#sidebarOverlay");

const toast =
    $("#toast");

const historyList =
    $("#historyList");

const fileInput =
    $("#fileInput");


/* =====================================================
   START
   ===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        applyTheme(
            state.theme
        );

        setupInput();

        setupSuggestions();

        setupSidebar();

        setupTheme();

        setupModals();

        setupVoice();

        setupAttachment();

        setupNewChat();

        setupModelSelector();

        setupNavigation();

        setupSearch();

        setupClearChats();

        restoreSettings();

        renderHistory();

        updateSendButton();

    }
);


/* =====================================================
   INPUT
   ===================================================== */

function setupInput() {

    if (!chatForm || !messageInput) {
        return;
    }


    messageInput.addEventListener(
        "input",
        () => {

            autoResize();

            updateSendButton();

        }
    );


    messageInput.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Enter" &&
                !event.shiftKey &&
                state.enterToSend
            ) {

                event.preventDefault();

                if (
                    !state.isLoading &&
                    messageInput.value.trim()
                ) {

                    sendMessage();

                }

            }

        }
    );


    chatForm.addEventListener(
        "submit",
        (event) => {

            event.preventDefault();

            sendMessage();

        }
    );

}


/* =====================================================
   RESIZE
   ===================================================== */

function autoResize() {

    if (!messageInput) {
        return;
    }

    messageInput.style.height =
        "auto";

    messageInput.style.height =
        Math.min(
            messageInput.scrollHeight,
            130
        ) + "px";

}


/* =====================================================
   SEND BUTTON
   ===================================================== */

function updateSendButton() {

    if (!sendButton || !messageInput) {
        return;
    }

    sendButton.disabled =
        state.isLoading ||
        !messageInput.value.trim();

}


/* =====================================================
   SEND MESSAGE
   ===================================================== */

async function sendMessage(
    customPrompt = null
) {

    if (state.isLoading) {
        return;
    }


    const text =
        customPrompt !== null
            ? String(customPrompt).trim()
            : messageInput.value.trim();


    if (!text) {
        return;
    }


    const previousHistory =
        state.messages
            .slice(-12)
            .map(
                (item) => ({
                    role:
                        item.role === "assistant"
                            ? "assistant"
                            : "user",

                    content:
                        item.content
                })
            );


    addMessage(
        "user",
        text
    );


    messageInput.value = "";

    autoResize();

    updateSendButton();

    hideWelcome();

    state.isLoading = true;

    showTyping(true);

    scrollToBottom();


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

                    body:
                        JSON.stringify({
                            message: text,

                            history:
                                previousHistory
                        })
                }
            );


        if (!response.ok) {

            throw new Error(
                "HTTP " +
                response.status
            );

        }


        const data =
            await response.json();


        if (
            !data ||
            data.success !== true
        ) {

            throw new Error(
                data?.error ||
                "AI response failed"
            );

        }


        addMessage(
            "assistant",
            data.message ||
            "I received your message."
        );


        saveConversation();


    } catch (error) {

        console.error(
            "Ankul AI:",
            error
        );


        addMessage(
            "assistant",
            "Sorry, I couldn't connect to Ankul AI right now. Please check your server/API configuration."
        );


        showToast(
            "AI connection failed."
        );

    } finally {

        state.isLoading =
            false;

        showTyping(
            false
        );

        updateSendButton();

        scrollToBottom();

    }

}


/* =====================================================
   ADD MESSAGE
   ===================================================== */

function addMessage(
    role,
    content,
    options = {}
) {

    const time =
        options.timestamp
            ? new Date(options.timestamp)
            : new Date();


    const item = {

        role,

        content:
            String(content),

        timestamp:
            time.toISOString()

    };


    state.messages.push(
        item
    );


    if (!messages) {
        return;
    }


    const element =
        document.createElement(
            "div"
        );


    element.className =
        "message " +
        (
            role === "user"
                ? "user"
                : "assistant"
        );


    const timeHTML =
        state.timestamps
            ? `
                <div class="message-time">
                    ${formatTime(time)}
                </div>
            `
            : "";


    element.innerHTML = `

        <div class="message-avatar">
            ${role === "assistant" ? "A" : "U"}
        </div>

        <div class="message-body">

            ${
                role === "assistant"
                    ? formatMessage(content)
                    : escapeHTML(content)
            }

            ${timeHTML}

        </div>

    `;


    messages.appendChild(
        element
    );


    scrollToBottom();

}


/* =====================================================
   FORMAT AI RESPONSE
   ===================================================== */

function formatMessage(text) {

    let safe =
        escapeHTML(text);


    safe =
        safe.replace(
            /```([\s\S]*?)```/g,
            "<pre><code>$1</code></pre>"
        );


    safe =
        safe.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );


    safe =
        safe.replace(
            /`([^`]+)`/g,
            "<code>$1</code>"
        );


    safe =
        safe.replace(
            /\n/g,
            "<br>"
        );


    return safe;

}


/* =====================================================
   ESCAPE
   ===================================================== */

function escapeHTML(value) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =====================================================
   TIME
   ===================================================== */

function formatTime(
    date
) {

    return date.toLocaleTimeString(
        [],
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* =====================================================
   WELCOME
   ===================================================== */

function hideWelcome() {

    if (!welcomeScreen) {
        return;
    }

    welcomeScreen.style.display =
        "none";

}


function showWelcome() {

    if (!welcomeScreen) {
        return;
    }

    welcomeScreen.style.display =
        "flex";

}


/* =====================================================
   PROMPT CARDS
   ===================================================== */

function setupSuggestions() {

    $$(".prompt-card")
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        const prompt =
                            button.dataset.prompt;

                        if (prompt) {
                            sendMessage(
                                prompt
                            );
                        }

                    }
                );

            }
        );

}


/* =====================================================
   TYPING
   ===================================================== */

function showTyping(
    show
) {

    if (!typingIndicator) {
        return;
    }


    typingIndicator.hidden =
        !show;

}


/* =====================================================
   SCROLL
   ===================================================== */

function scrollToBottom() {

    if (!chatArea) {
        return;
    }


    requestAnimationFrame(
        () => {

            chatArea.scrollTo({
                top:
                    chatArea.scrollHeight,

                behavior:
                    "smooth"
            });

        }
    );

}


/* =====================================================
   NEW CHAT
   ===================================================== */

function setupNewChat() {

    [
        $("#newChatButton"),
        $("#quickNewChat")
    ]
        .forEach(
            (button) => {

                button?.addEventListener(
                    "click",
                    newChat
                );

            }
        );

}


function newChat() {

    if (state.isLoading) {

        showToast(
            "Please wait for the current response."
        );

        return;
    }


    state.messages = [];


    if (messages) {
        messages.innerHTML = "";
    }


    showWelcome();

    messageInput.value = "";

    autoResize();

    updateSendButton();

    closeSidebar();

    saveHistory();

    showToast(
        "New chat started."
    );

}


/* =====================================================
   SIDEBAR
   ===================================================== */

function setupSidebar() {

    $("#menuButton")
        ?.addEventListener(
            "click",
            openSidebar
        );


    $("#closeSidebar")
        ?.addEventListener(
            "click",
            closeSidebar
        );


    sidebarOverlay
        ?.addEventListener(
            "click",
            closeSidebar
        );

}


function openSidebar() {

    sidebar?.classList.add(
        "open"
    );

    sidebarOverlay?.classList.add(
        "active"
    );

}


function closeSidebar() {

    sidebar?.classList.remove(
        "open"
    );

    sidebarOverlay?.classList.remove(
        "active"
    );

}


/* =====================================================
   MODEL SELECTOR
   ===================================================== */

function setupModelSelector() {

    const button =
        $("#modelButton");

    const menu =
        $("#modelMenu");


    if (!button || !menu) {
        return;
    }


    button.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            menu.classList.toggle(
                "open"
            );

        }
    );


    $$(".model-option")
        .forEach(
            (option) => {

                option.addEventListener(
                    "click",
                    () => {

                        state.selectedModel =
                            option.dataset.model;

                        localStorage.setItem(
                            "ankul_model",
                            state.selectedModel
                        );


                        const name =
                            option.querySelector(
                                "span"
                            )?.textContent ||
                            "Auto";


                        $("#selectedModel")
                            .textContent =
                            name;


                        $$(".model-option")
                            .forEach(
                                (item) => {

                                    item.classList.toggle(
                                        "active",
                                        item === option
                                    );

                                }
                            );


                        menu.classList.remove(
                            "open"
                        );

                    }
                );

            }
        );


    document.addEventListener(
        "click",
        () => {

            menu.classList.remove(
                "open"
            );

        }
    );

}


/* =====================================================
   THEME
   ===================================================== */

function setupTheme() {

    $("#themeButton")
        ?.addEventListener(
            "click",
            () => {

                applyTheme(
                    state.theme === "dark"
                        ? "light"
                        : "dark"
                );

            }
        );


    $("#darkModeSwitch")
        ?.addEventListener(
            "click",
            () => {

                applyTheme(
                    state.theme === "dark"
                        ? "light"
                        : "dark"
                );

                restoreSettings();

            }
        );

}


function applyTheme(
    theme
) {

    state.theme =
        theme === "light"
            ? "light"
            : "dark";


    document.body.classList.toggle(
        "light",
        state.theme === "light"
    );


    localStorage.setItem(
        "ankul_theme",
        state.theme
    );

}


/* =====================================================
   MODALS
   ===================================================== */

function setupModals() {

    $("#settingsButton")
        ?.addEventListener(
            "click",
            () => {

                openModal(
                    $("#settingsModal")
                );

                closeSidebar();

            }
        );


    $("#aboutButton")
        ?.addEventListener(
            "click",
            () => {

                openModal(
                    $("#aboutModal")
                );

                closeSidebar();

            }
        );


    $$("[data-close-modal]")
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.getAttribute(
                                "data-close-modal"
                            );

                        closeModal(
                            document.getElementById(
                                id
                            )
                        );

                    }
                );

            }
        );


    $$(".modal-backdrop")
        .forEach(
            (modal) => {

                modal.addEventListener(
                    "click",
                    (event) => {

                        if (
                            event.target === modal
                        ) {

                            closeModal(
                                modal
                            );

                        }

                    }
                );

            }
        );


    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape"
            ) {

                $$(".modal-backdrop")
                    .forEach(
                        closeModal
                    );

                closeSidebar();

            }

        }
    );


    $("#enterSendSwitch")
        ?.addEventListener(
            "click",
            () => {

                state.enterToSend =
                    !state.enterToSend;

                localStorage.setItem(
                    "ankul_enter_send",
                    String(
                        state.enterToSend
                    )
                );

                restoreSettings();

            }
        );


    $("#timestampSwitch")
        ?.addEventListener(
            "click",
            () => {

                state.timestamps =
                    !state.timestamps;

                localStorage.setItem(
                    "ankul_timestamps",
                    String(
                        state.timestamps
                    )
                );

                rerenderMessages();

                restoreSettings();

            }
        );

}


function openModal(
    modal
) {

    if (!modal) {
        return;
    }

    modal.hidden =
        false;

}


function closeModal(
    modal
) {

    if (!modal) {
        return;
    }

    modal.hidden =
        true;

}


/* =====================================================
   SETTINGS
   ===================================================== */

function restoreSettings() {

    $("#darkModeSwitch")
        ?.classList.toggle(
            "active",
            state.theme === "dark"
        );


    $("#enterSendSwitch")
        ?.classList.toggle(
            "active",
            state.enterToSend
        );


    $("#timestampSwitch")
        ?.classList.toggle(
            "active",
            state.timestamps
        );

}


/* =====================================================
   RERENDER
   ===================================================== */

function rerenderMessages() {

    if (!messages) {
        return;
    }


    const saved =
        [...state.messages];


    messages.innerHTML = "";


    saved.forEach(
        (item) => {

            addMessage(
                item.role,
                item.content,
                {
                    timestamp:
                      
