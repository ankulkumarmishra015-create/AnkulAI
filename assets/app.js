"use strict";

/* =========================================================
   ANKUL AI — ADVANCED FRONTEND CONTROLLER
   ========================================================= */

const state = {
    messages: [],
    isLoading: false,
    isListening: false,

    theme: localStorage.getItem("ankul_theme") || "dark",

    enterToSend:
        localStorage.getItem("ankul_enter_send") !== "false",

    showTimestamps:
        localStorage.getItem("ankul_timestamps") === "true"
};


/* =========================================================
   DOM HELPERS
   ========================================================= */

const $ = (selector) =>
    document.querySelector(selector);

const $$ = (selector) =>
    document.querySelectorAll(selector);


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const chatForm = $("#chatForm");
const messageInput = $("#messageInput");
const sendButton = $("#sendButton");
const messages = $("#messages");
const welcomeScreen = $("#welcomeScreen");
const typingIndicator = $("#typingIndicator");
const chatContainer = $("#chatContainer");

const sidebar = $("#sidebar");
const sidebarOverlay = $("#sidebarOverlay");

const toast = $("#toast");


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* Make sure hidden elements actually stay hidden */
    if (!document.getElementById("ankul-hidden-style")) {

        const style = document.createElement("style");

        style.id = "ankul-hidden-style";

        style.textContent = `
            .hidden {
                display: none !important;
            }

            .mobile-only {
                display: none;
            }

            @media (max-width: 700px) {
                .mobile-only {
                    display: grid;
                }
            }
        `;

        document.head.appendChild(style);
    }


    applyTheme(state.theme);

    setupInput();

    setupSuggestions();

    setupSidebar();

    setupTheme();

    setupModals();

    setupVoice();

    setupAttach();

    restoreSettings();

    updateSendButton();

});


/* =========================================================
   INPUT
   ========================================================= */

function setupInput() {

    if (!messageInput || !chatForm) {
        return;
    }


    messageInput.addEventListener("input", () => {

        autoResize();

        updateSendButton();

    });


    messageInput.addEventListener("keydown", (event) => {

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

    });


    chatForm.addEventListener("submit", (event) => {

        event.preventDefault();

        sendMessage();

    });

}


/* =========================================================
   AUTO RESIZE
   ========================================================= */

function autoResize() {

    if (!messageInput) {
        return;
    }


    messageInput.style.height = "auto";


    messageInput.style.height =
        Math.min(
            messageInput.scrollHeight,
            160
        ) + "px";

}


/* =========================================================
   SEND BUTTON
   ========================================================= */

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


/* =========================================================
   SEND MESSAGE
   ========================================================= */

async function sendMessage(customPrompt = null) {

    if (state.isLoading) {
        return;
    }


    const text =
        customPrompt !== null
            ? customPrompt.trim()
            : messageInput.value.trim();


    if (!text) {
        return;
    }


    /*
     * Save history BEFORE adding the new message.
     * This avoids sending the current user message twice.
     */

    const historyForAPI =
        state.messages.slice(-12);


    addMessage("user", text);


    if (messageInput) {

        messageInput.value = "";

        autoResize();

    }


    updateSendButton();

    state.isLoading = true;


    hideWelcome();

    showTyping(true);

    scrollToBottom();


    try {

        const response =
            await fetch("api/chat.php", {
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
            });


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
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
            data.message
        );


    } catch (error) {

        console.error(
            "Ankul AI error:",
            error
        );


        addMessage(
            "assistant",
            "Sorry, I couldn't process that request right now. Please check the server/API configuration and try again."
        );


        showToast(
            "Unable to connect to Ankul AI."
        );


    } finally {

        state.isLoading = false;

        showTyping(false);

        updateSendButton();

        scrollToBottom();

    }

}


/* =========================================================
   MESSAGE RENDERING
   ========================================================= */

function addMessage(role, text) {

    const timestamp =
        new Date();


    const message = {
        role: role,
        content: text,
        timestamp: timestamp.toISOString()
    };


    state.messages.push(message);


    if (!messages) {
        return;
    }


    const element =
        document.createElement("div");


    /*
     * CSS uses "assistant", not "ai".
     */

    const cssRole =
        role === "user"
            ? "user"
            : "assistant";


    element.className =
        `message ${cssRole}`;


    if (cssRole === "assistant") {

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


/* =========================================================
   FORMAT AI MESSAGE
   ========================================================= */

function formatMessage(text) {

    let safe =
        escapeHTML(text);


    /*
     * Code blocks
     */

    safe =
        safe.replace(
            /```([\s\S]*?)```/g,
            "<pre><code>$1</code></pre>"
        );


    /*
     * Bold
     */

    safe =
        safe.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );


    /*
     * Inline code
     */

    safe =
        safe.replace(
            /`([^`]+)`/g,
            "<code>$1</code>"
        );


    /*
     * New lines
     */

    safe =
        safe.replace(
            /\n/g,
            "<br>"
        );


    return safe;

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================================
   TIMESTAMP
   ========================================================= */

function formatTime(date) {

    return date.toLocaleTimeString(
        [],
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* =========================================================
   WELCOME
   ========================================================= */

function hideWelcome() {

    if (!welcomeScreen) {
        return;
    }


    welcomeScreen.style.display = "none";

}


function showWelcome() {

    if (!welcomeScreen) {
        return;
    }


    welcomeScreen.style.display = "";

}


/* =========================================================
   SUGGESTIONS
   ========================================================= */

function setupSuggestions() {

    $$(".suggestion-card")
        .forEach((button) => {

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

        });

}


/* =========================================================
   TYPING INDICATOR
   ========================================================= */

function showTyping(show) {

    if (!typingIndicator) {
        return;
    }


    typingIndicator.classList.toggle(
        "active",
        show
    );


    typingIndicator.classList.toggle(
        "hidden",
        !show
    );

}


/* =========================================================
   SCROLL
   ========================================================= */

function scrollToBottom() {

    if (!chatContainer) {
        return;
    }


    requestAnimationFrame(() => {

        chatContainer.scrollTo({
            top: chatContainer.scrollHeight,
            behavior: "smooth"
        });

    });

}


/* =========================================================
   NEW CHAT
   ========================================================= */

$("#newChatButton")
    ?.addEventListener("click", () => {

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

    });


/* =========================================================
   SIDEBAR
   ========================================================= */

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

    sidebar?.classList.add("open");

    sidebarOverlay?.classList.add("active");

}


function closeSidebar() {

    sidebar?.classList.remove("open");

    sidebarOverlay?.classList.remove("active");

}


/* =========================================================
   THEME
   ========================================================= */

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
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    applyTheme(
                        button.dataset.theme
                    );

                }
            );

        });

}


/* =========================================================
   APPLY THEME
   ========================================================= */

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
        .forEach((button) => {

            button.classList.toggle(
                "active",
                button.dataset.theme ===
                    state.theme
            );

        });

}


/* =========================================================
   MODALS
   ========================================================= */

function setupModals() {

    const settingsModal =
        $("#settingsModal");

    const aboutModal =
        $("#aboutModal");


    /*
     * SETTINGS
     */

    $("#settingsButton")
        ?.addEventListener(
            "click",
            () => {

                settingsModal
                    ?.classList
                    .remove("hidden");

                closeSidebar();

            }
        );


    $("#closeSettings")
        ?.addEventListener(
            "click",
            closeSettings
        );


    /*
     * ABOUT
     */

    $("#aboutButton")
        ?.addEventListener(
            "click",
            () => {

                aboutModal
                    ?.classList
                    .remove("hidden");

                closeSidebar();

            }
        );


    $("#closeAbout")
        ?.addEventListener(
            "click",
            closeAbout
        );


    /*
     * Click outside modal
     */

    [settingsModal, aboutModal]
        .forEach((modal) => {

            modal?.addEventListener(
                "click",
                (event) => {

                    if (
                        event.target === modal
                    ) {

                        modal.classList.add(
                            "hidden"
                        );

                    }

                }
            );

        });


    /*
     * Enter to send
     */

    $("#enterToSend")
        ?.addEventListener(
            "click",
            (event) => {

                const button =
                    event.currentTarget;


                state.enterToSend =
                    !state.enterToSend;


                updateToggle(
                    button,
                    state.enterToSend
                );


                localStorage.setItem(
                    "ankul_enter_send",
                    state.enterToSend
                );

            }
        );


    /*
     * Show timestamps
     */

    $("#showTimestamps")
        ?.addEventListener(
            "click",
            (event) => {

                const button =
                    event.currentTarget;


                state.showTimestamps =
                    !state.showTimestamps;


                updateToggle(
                    button,
                    state.showTimestamps
                );


                localStorage.setItem(
                    "ankul_timestamps",
                    state.showTimestamps
                );


                rerenderMessages();

            }
        );


    /*
     * ESC closes modal
     */

    document.addEventListener(
        "keydown",
        (event) => {

            if (event.key !== "Escape") {
                return;
            }


            closeSettings();

            closeAbout();

            closeSidebar();

        }
    );

}


/* =========================================================
   MODAL HELPERS
   ========================================================= */

function closeSettings() {

    $("#settingsModal")
        ?.classList
        .add("hidden");

}


function closeAbout() {

    $("#aboutModal")
        ?.classList
        .add("hidden");

}


/* =========================================================
   TOGGLE UI
   ========================================================= */

function updateToggle(button, active) {

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


/* =========================================================
   RESTORE SETTINGS
   ========================================================= */

function restoreSettings() {

    const enterButton =
        $("#enterToSend");

    const timestampButton =
        $("#showTimestamps");


    updateToggle(
        enterButton,
        state.enterToSend
    );


    updateToggle(
        timestampButton,
        state.showTimestamps
    );

}


/* =========================================================
   RERENDER MESSAGES
   ========================================================= */

function rerenderMessages() {

    if (!messages) {
        return;
    }


    messages.innerHTML = "";


    const savedMessages =
        [...state.messages];


    state.messages = [];


    savedMessages.forEach((message) => {

        addMessage(
            message.role,
            message.content
        );

    });

}


/* =========================================================
   VOICE INPUT
   ========================================================= */

function setupVoice() {

    const button =
        $("#voiceButton");


    if (!button) {
        return;
    }


    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        button.title =
            "Voice input is not supported by this browser.";

        return;

    }


    const recognition =
        new SpeechRecognition();


    recognition.lang =
        "en-IN";

    recognition.interimResults =
        true;

    recognition.continuous =
        false;


    recognition.onstart = () => {

        state.isListening = true;


        button.classList.add(
            "listening"
        );


        showToast(
            "Listening..."
        );

    };


    recognition.onresult =
        (event) => {

            let transcript = "";


            for (
                let i = event.resultIndex;
                i < event.results.length;
                i++
            ) {

                transcript +=
                    event.results[i][0]
                        .transcr
