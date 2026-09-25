"use strict";

/* =====================================================
   ANKUL AI
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
const chatContainer = $("#chatContainer");

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
   RESIZE TEXTAREA
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

async function sendMessage(
    customPrompt = null
) {

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


    /* History BEFORE current message */

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


    messageInput.value = "";

    autoResize();

    updateSendButton();


    state.isLoading = true;

    hideWelcome();

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

                    body: JSON.stringify({
                        message: text,
                        history:
                            historyForAPI
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
            "Ankul AI:",
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

function addMessage(
    role,
    text
) {

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
        "message " +
        actualRole;


    if (
        actualRole ===
        "assistant"
    ) {

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


    /*
       Code blocks
    */

    safe =
        safe.replace(
            /```([\s\S]*?)```/g,
            "<pre><code>$1</code></pre>"
        );


    /*
       Bold
    */

    safe =
        safe.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );


    /*
       Inline code
    */

    safe =
        safe.replace(
            /`([^`]+)`/g,
            "<code>$1</code>"
        );


    /*
       New lines
    */

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
   SUGGESTION CARDS
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

                        sendMessage(
                            prompt
                        );

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


    typingIndicator.classList.toggle(
        "hidden",
        !show
    );

}


/* =====================================================
   SCROLL
   ===================================================== */

function scrollToBottom() {

    if (!chatContainer) {
        return;
    }


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


    [
        settingsModal,
        aboutModal
    ].forEach(
        (modal) => {

            modal?.addEventListener(
                "click",
                (event) => {

                    if (
                        event.target ===
                        modal
                    ) {

                        modal.classList.add(
                            "hidden"
                        );

                    }

                }
            );

        }
    );


    $("#enterToSend")
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
                    state.enterToSend
                );

            }
        );


    $("#showTimestamps")
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
                    state.showTimestamps
                );


                rerenderMessages();

            }
        );


    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key ===
                "Escape"
            ) {

                closeSettings();

                closeAbout();

                closeSidebar();

            }

        }
    );
}


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
        $("#enterToSend"),
        state.enterToSend
    );


    updateToggle(
        $("#showTimestamps"),
        state.showTimestamps
    );
}


/* =====================================================
   RERENDER
   ===================================================== */

function rerenderMessages() {

    if (!messages) {
        return;
    }


    messages.innerHTML = "";


    const saved =
        [...state.messages];


    state.messages = [];


    saved.forEach(
        (item) => {

            addMessage(
                item.role,
                item.content
            );

        }
    );
}


/* =====================================================
   VOICE
   ===================================================== */

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

            state.isListening =
                true;


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
                let i =
                    event.resultIndex;

                i <
                    event.results.length;

                i++
            ) {

                transcript +=
                    event.results[i][0]
                        .transcript;

            }


            if (messageInput) {

                messageInput.value =
                    transcript;

                autoResize();

                updateSendButton();

            }

        };


    
