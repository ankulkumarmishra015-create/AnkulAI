"use strict";

/* =========================================================
   ANKUL AI — FRONTEND CONTROLLER
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
   DOM
   ========================================================= */

const $ = (selector) =>
    document.querySelector(selector);

const $$ = (selector) =>
    document.querySelectorAll(selector);


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

const chatContainer =
    $("#chatContainer");

const sidebar =
    $("#sidebar");

const toast =
    $("#toast");


/* =========================================================
   INITIALIZATION
   ========================================================= */

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

        updateSendButton();

    }
);


/* =========================================================
   INPUT
   ========================================================= */

function setupInput() {

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


function autoResize() {

    messageInput.style.height =
        "auto";

    messageInput.style.height =
        Math.min(
            messageInput.scrollHeight,
            180
        ) + "px";

}


function updateSendButton() {

    const hasText =
        messageInput.value.trim().length > 0;

    sendButton.disabled =
        !hasText ||
        state.isLoading;

}


/* =========================================================
   SEND MESSAGE
   ========================================================= */

async function sendMessage(
    customPrompt = null
) {

    if (state.isLoading) {
        return;
    }


    const text =
        customPrompt ??
        messageInput.value.trim();


    if (!text) {
        return;
    }


    addMessage(
        "user",
        text
    );


    messageInput.value = "";

    autoResize();

    updateSendButton();


    state.isLoading = true;

    showTyping(true);

    hideWelcome();

    scrollToBottom();


    try {

        const response =
            await fetch(
                "api/chat.php",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        message: text,
                        history:
                            state.messages
                                .slice(-12)
                    })
                }
            );


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
            "ai",
            data.message
        );


    } catch (error) {

        console.error(
            "Ankul AI error:",
            error
        );


        addMessage(
            "ai",
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

function addMessage(
    role,
    text
) {

    const message = {
        role,
        content: text,
        timestamp:
            new Date().toISOString()
    };


    state.messages.push(
        message
    );


    const element =
        document.createElement(
            "div"
        );


    element.className =
        `message ${role}`;


    if (role === "ai") {

        element.innerHTML = `
            <div class="ai-avatar">A</div>

            <div class="message-content">
                ${formatMessage(text)}
            </div>
        `;

    } else {

        element.innerHTML = `
            <div class="message-content">
                ${escapeHTML(text)}
            </div>
        `;

    }


    messages.appendChild(
        element
    );


    scrollToBottom();

}


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
            /\n/g,
            "<br>"
        );


    return safe;

}


function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================================
   WELCOME
   ========================================================= */

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
        "";

}


/* =========================================================
   SUGGESTIONS
   ========================================================= */

function setupSuggestions() {

    $$(".suggestion-card")
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        const prompt =
                            button.dataset.prompt;

                        sendMessage(
                            prompt
                        );

                    }
                );

            }
        );

}


/* =========================================================
   TYPING
   ========================================================= */

function showTyping(show) {

    if (!typingIndicator) {
        return;
    }


    typingIndicator.classList.toggle(
        "hidden",
        !show
    );

}


/* =========================================================
   SCROLL
   ========================================================= */

function scrollToBottom() {

    requestAnimationFrame(
        () => {

            chatContainer.scrollTo({
                top:
                    chatContainer.scrollHeight,

                behavior:
                    "smooth"
            });

        }
    );

}


/* =========================================================
   NEW CHAT
   ========================================================= */

$("#newChatButton")
    ?.addEventListener(
        "click",
        () => {

            state.messages = [];

            messages.innerHTML = "";

            showWelcome();

            messageInput.value = "";

            autoResize();

            updateSendButton();

            showToast(
                "New chat started."
            );

            sidebar.classList.remove(
                "open"
            );

        }
    );


/* =========================================================
   SIDEBAR
   ========================================================= */

function setupSidebar() {

    $("#menuButton")
        ?.addEventListener(
            "click",
            () => {

                sidebar.classList.add(
                    "open"
                );

            }
        );


    $("#closeSidebar")
        ?.addEventListener(
            "click",
            () => {

                sidebar.classList.remove(
                    "open"
                );

            }
        );

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


    $$(".theme-option")
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


    $$(".theme-option")
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


/* =========================================================
   MODALS
   ========================================================= */

function setupModals() {

    const settingsModal =
        $("#settingsModal");

    const aboutModal =
        $("#aboutModal");


    $("#settingsButton")
        ?.addEventListener(
            "click",
            () => {

                settingsModal.classList.remove(
                    "hidden"
                );

            }
        );


    $("#closeSettings")
        ?.addEventListener(
            "click",
            () => {

                settingsModal.classList.add(
                    "hidden"
                );

            }
        );


    $("#aboutButton")
        ?.addEventListener(
            "click",
            () => {

                aboutModal.classList.remove(
                    "hidden"
                );

            }
        );


    $("#closeAbout")
        ?.addEventListener(
            "click",
            () => {

                aboutModal.classList.add(
                    "hidden"
                );

            }
        );


    $$(".modal-backdrop")
        .forEach(
            (backdrop) => {

                backdrop.addEventListener(
                    "click",
                    () => {

                        backdrop
                            .parentElement
                            .classList.add(
                                "hidden"
                            );

                    }
                );

            }
        );


    $("#enterToSend")
        ?.addEventListener(
            "change",
            (event) => {

                state.enterToSend =
                    event.target.checked;

                localStorage.setItem(
                    "ankul_enter_send",
                    state.enterToSend
                );

            }
        );


    $("#showTimestamps")
        ?.addEventListener(
            "change",
            (event) => {

                state.showTimestamps =
                    event.target.checked;

                localStorage.setItem(
                    "ankul_timestamps",
                    state.showTimestamps
                );

            }
        );

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


    recognition.onstart =
        () => {

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
                        .transcript;

            }


            messageInput.value =
                transcript;

            autoResize();

            updateSendButton();

        };


    recognition.onend =
        () => {

            state.isListening = false;

            button.classList.remove(
                "listening"
            );

        };


    recognition.onerror =
        () => {

            state.isListening = false;

            button.classList.remove(
                "listening"
            );

            showToast(
                "Voice input failed."
            );

        };


    button.addEventListener(
        "click",
        () => {

            if (state.isListening) {

                recognition.stop();

                return;

            }

            recognition.start();

        }
    );

}


/* =========================================================
   TOAST
   ========================================================= */

let toastTimer = null;


function showToast(message) {

    if (!toast) {
        return;
    }


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2600
        );

          }
