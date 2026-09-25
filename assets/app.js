"use strict";

/* =====================================================
   ANKUL AI - APP.JS
   ===================================================== */

const state = {
    messages: [],
    isLoading: false,
    isListening: false,

    theme:
        localStorage.getItem("ankul_theme") || "dark",

    enterToSend:
        localStorage.getItem("ankul_enter_send") !== "false",

    showTimestamps:
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

const chatForm = $("#chatForm");
const messageInput = $("#messageInput");
const sendButton = $("#sendButton");

const messages = $("#messages");
const welcomeScreen = $("#welcomeScreen");
const typingIndicator = $("#typingIndicator");
const chatArea = $("#chatArea");

const sidebar = $("#sidebar");
const sidebarOverlay = $("#sidebarOverlay");

const toast = $("#toast");


/* =====================================================
   START
   ===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        applyTheme(state.theme);

        setupInput();
        setupSuggestions();
        setupSidebar();
        setupTheme();
        setupModals();
        setupVoice();
        setupAttach();
        setupNewChat();

        restoreSettings();

        updateSendButton();

    }
);


/* =====================================================
   INPUT
   ===================================================== */

function setupInput() {

    if (!messageInput || !chatForm) {
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
   TEXTAREA RESIZE
   ===================================================== */

function autoResize() {

    if (!messageInput) {
        return;
    }

    messageInput.style.height = "auto";

    messageInput.style.height =
        Math.min(
            messageInput.scrollHeight,
            150
        ) + "px";

}


/* =====================================================
   SEND BUTTON
   ===================================================== */

function updateSendButton() {

    if (!sendButton || !messageInput) {
        return;
    }

    const hasText =
        messageInput.value.trim().length > 0;

    sendButton.disabled =
        !hasText ||
        state.isLoading;

}


/* =====================================================
   SEND MESSAGE
   ===================================================== */

async function sendMessage(customPrompt = null) {

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


    /* Save previous history BEFORE adding current message */

    const historyForAPI =
        state.messages
            .slice(-12)
            .map((item) => ({
                role:
                    item.role === "assistant"
                        ? "assistant"
                        : "user",

                content:
                    item.content
            }));


    addMessage(
        "user",
        text
    );


    if (messageInput) {
        messageInput.value = "";
        autoResize();
    }

    updateSendButton();

    state.isLoading = true;

    hideWelcome();

    showTyping(true);

    updateSendButton();

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

                    body: JSON.stringify({
                        message: text,
                        history:
                            historyForAPI
                    })
                }
            );


        if (!response.ok) {

            throw new Error(
                "HTTP " + response.status
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
                "AI response failed."
            );

        }


        addMessage(
            "assistant",
            data.message ||
            "I received your message."
        );


    } catch (error) {

        console.error(
            "Ankul AI error:",
            error
        );


        addMessage(
            "assistant",
            "Sorry, I couldn't connect to Ankul AI right now. Please check the server/API configuration."
        );


        showToast(
            "AI connection failed."
        );

    } finally {

        state.isLoading = false;

        showTyping(false);

        updateSendButton();

        scrollToBottom();

    }

}


/* =====================================================
   ADD MESSAGE
   ===================================================== */

function addMessage(role, text) {

    const timestamp =
        new Date();


    state.messages.push({
        role: role,
        content: String(text),
        timestamp:
            timestamp.toISOString()
    });


    if (!messages) {
        return;
    }


    const element =
        document.createElement("div");


    const actualRole =
        role === "user"
            ? "user"
            : "assistant";


    element.className =
        "message " + actualRole;


    if (actualRole === "assistant") {

        element.innerHTML = `

            <div class="message-avatar">
                A
            </div>

            <div class="message-body">

                ${formatMessage(text)}

                ${
                    state.showTimestamps
                        ? `
                            <div class="message-time">
                                ${formatTime(timestamp)}
                            </div>
                        `
                        : ""
                }

            </div>

        `;

    } else {

        element.innerHTML = `

            <div class="message-body">

                ${escapeHTML(text)}

                ${
                    state.showTimestamps
                        ? `
                            <div class="message-time">
                                ${formatTime(timestamp)}
                            </div>
                        `
                        : ""
                }

            </div>

            <div class="message-avatar">
                A
            </div>

        `;

    }


    messages.appendChild(element);

    scrollToBottom();

}


/* =====================================================
   FORMAT AI MESSAGE
   ===================================================== */

function formatMessage(text) {

    let safe =
        escapeHTML(text);


    /* Code blocks */

    safe =
        safe.replace(
            /```([\s\S]*?)```/g,
            "<pre><code>$1</code></pre>"
        );


    /* Bold */

    safe =
        safe.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );


    /* Inline code */

    safe =
        safe.replace(
            /`([^`]+)`/g,
            "<code>$1</code>"
        );


    /* New lines */

    safe =
        safe.replace(
            /\n/g,
            "<br>"
        );


    return safe;

}


/* =====================================================
   ESCAPE HTML
   ===================================================== */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =====================================================
   TIME
   ===================================================== */

function formatTime(date) {

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
   SUGGESTIONS
   ===================================================== */

function setupSuggestions() {

    $$(".suggestion-card")
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        const prompt =
                            button.dataset.prompt;

                        if (!prompt) {
                            return;
                        }

                        sendMessage(prompt);

                    }
                );

            }
        );

}


/* =====================================================
   TYPING
   ===================================================== */

function showTyping(show) {

    if (!typingIndicator) {
        return;
    }


    typingIndicator.hidden =
        !show;


    typingIndicator.classList.toggle(
        "hidden",
        !show
    );

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

    $("#newChatButton")
        ?.addEventListener(
            "click",
            () => {

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


                if (messageInput) {

                    messageInput.value = "";

                    autoResize();

                }


                updateSendButton();

                closeSidebar();

                showToast(
                    "New chat started."
                );

            }
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
   THEME
   ===================================================== */

function setupTheme() {

    $("#themeButton")
        ?.addEventListener(
            "click",
            () => {

                const next =
                    state.theme === "dark"
                        ? "light"
                        : "dark";

                applyTheme(next);

            }
        );


    $$(".theme-button")
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        applyTheme(
                            button.dataset.theme
                        );

                    }
                );

            }
        );

}


function applyTheme(theme) {

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


    $$(".theme-button")
        .forEach(
            (button) => {

                button.classList.toggle(
                    "active",
                    button.dataset.theme ===
                        state.theme
                );

            }
        );

}


/* =====================================================
   MODALS
   ===================================================== */

function setupModals() {

    const settingsModal =
        $("#settingsModal");

    const aboutModal =
        $("#aboutModal");


    /* Open Settings */

    $("#settingsButton")
        ?.addEventListener(
            "click",
            () => {

                openModal(
                    settingsModal
                );

                closeSidebar();

            }
        );


    /* Open About */

    $("#aboutButton")
        ?.addEventListener(
            "click",
            () => {

                openModal(
                    aboutModal
                );

                closeSidebar();

            }
        );


    /* Close buttons */

    $$("[data-close-modal]")
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        const modalId =
                            button.getAttribute(
                                "data-close-modal"
                            );

                        const modal =
                            document.getElementById(
                                modalId
                            );

                        closeModal(modal);

                    }
                );

            }
        );


    /* Click outside */

    [
        settingsModal,
        aboutModal
    ].forEach(
        (modal) => {

            modal?.addEventListener(
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


    /* Escape */

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape"
            ) {

                closeModal(
                    settingsModal
                );

                closeModal(
                    aboutModal
                );

                closeSidebar();

            }

        }
    );


    /* Enter to send */

    $("#enterSendSwitch")
        ?.addEventListener(
            "click",
            (event) => {

                state.enterToSend =
                    !state.enterToSend;


                updateToggle(
                    event.currentTarget,
                    state.enterToSend
                );


                localStorage.setItem(
                    "ankul_enter_send",
                    String(
                        state.enterToSend
                    )
                );

            }
        );


    /* Timestamps */

    $("#timestampSwitch")
        ?.addEventListener(
            "click",
            (event) => {

                state.showTimestamps =
                    !state.showTimestamps;


                updateToggle(
                    event.currentTarget,
                    state.showTimestamps
                );


                localStorage.setItem(
                    "ankul_timestamps",
                    String(
                        state.showTimestamps
                    )
                );


                rerenderMessages();

            }
        );


    /* Dark mode switch */

    $("#darkModeSwitch")
        ?.addEventListener(
            "click",
            (event) => {

                const next =
                    state.theme === "dark"
                        ? "light"
                        : "dark";

                applyTheme(next);

                updateToggle(
                    event.currentTarget,
                    next === "dark"
                );

            }
        );

}


/* =====================================================
   OPEN MODAL
   ===================================================== */

function openModal(modal) {

    if (!modal) {
        return;
    }


    modal.hidden = false;

    modal.classList.add(
        "active"
    );

    document.body.classList.add(
        "modal-open"
    );

}


/* =====================================================
   CLOSE MODAL
   ===================================================== */

function closeModal(modal) {

    if (!modal) {
        return;
    }


    modal.hidden = true;

    modal.classList.remove(
        "active"
    );

    document.body.classList.remove(
        "modal-open"
    );

}


/* =====================================================
   CLOSE SETTINGS
   ===================================================== */

function closeSettings() {

    closeModal(
        $("#settingsModal")
    );

}


/* =====================================================
   CLOSE ABOUT
   ===================================================== */

function closeAbout() {

    closeModal(
        $("#aboutModal")
    );

}


/* =====================================================
   TOGGLE
   ===================================================== */

function updateToggle(
    button,
    active
) {

    if (!button) {
        return;
    }


    button.classList.toggle(
        "active",
        active
    );


    button.setAttribute(
        "aria-pressed",
        String(active)
    );

}


/* =====================================================
   RESTORE SETTINGS
   ===================================================== */

function restoreSettings() {

    updateToggle(
        $("#darkModeSwitch"),
        state.theme === "dark"
    );


    updateToggle(
        $("#enterSendSwitch"),
        state.enterToSend
    );


    updateToggle(
        $("#timestampSwitch"),
        state.showTimestamps
    );

}


/* ===============================
