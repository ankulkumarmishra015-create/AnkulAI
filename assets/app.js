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
