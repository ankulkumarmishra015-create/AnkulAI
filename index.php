<?php
declare(strict_types=1);

session_start();

$appName = 'Ankul AI';
$appVersion = '1.0.0';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    >

    <meta name="theme-color" content="#090a0f">
    <meta name="description" content="Ankul AI - Personal AI Assistant">

    <title><?= htmlspecialchars($appName) ?></title>

    <link
        rel="stylesheet"
        href="/assets/style.css?v=10"
    >
</head>

<body>

<div class="app" id="app">

    <!-- ================= SIDEBAR ================= -->

    <aside class="sidebar" id="sidebar">

        <div class="sidebar-top">

            <div class="brand">
                <div class="brand-logo">A</div>

                <div class="brand-info">
                    <div class="brand-name">Ankul AI</div>
                    <div class="brand-subtitle">Personal AI Assistant</div>
                </div>

                <button
                    type="button"
                    class="icon-button sidebar-close"
                    id="closeSidebar"
                    aria-label="Close sidebar"
                >
                    ×
                </button>
            </div>

            <button
                type="button"
                class="new-chat-button"
                id="newChatButton"
            >
                <span class="plus">+</span>
                <span>New chat</span>
            </button>

        </div>


        <div class="sidebar-section">

            <div class="sidebar-title">
                RECENT
            </div>

            <div id="historyList" class="history-list">
                <div class="empty-history">
                    <span>☁</span>
                    <span>Your conversations will appear here.</span>
                </div>
            </div>

        </div>


        <div class="sidebar-bottom">

            <button
                type="button"
                class="sidebar-action"
                id="settingsButton"
            >
                <span>⚙</span>
                <span>Settings</span>
            </button>

            <button
                type="button"
                class="sidebar-action"
                id="aboutButton"
            >
                <span>ⓘ</span>
                <span>About Ankul AI</span>
            </button>

        </div>

    </aside>


    <!-- Mobile overlay -->

    <div
        class="sidebar-overlay"
        id="sidebarOverlay"
    ></div>


    <!-- ================= MAIN ================= -->

    <main class="main">

        <!-- TOPBAR -->

        <header class="topbar">

            <button
                type="button"
                class="icon-button menu-button"
                id="menuButton"
                aria-label="Open menu"
            >
                ☰
            </button>


            <div class="topbar-model">

                <span class="model-dot"></span>

                <span class="model-name">
                    Ankul AI
                </span>

                <span class="model-label">
                    AI Assistant
                </span>

            </div>


            <div class="topbar-actions">

                <button
                    type="button"
                    class="icon-button"
                    id="themeButton"
                    aria-label="Toggle theme"
                    title="Toggle theme"
                >
                    ◐
                </button>

            </div>

        </header>


        <!-- ================= CHAT AREA ================= -->

        <section
            class="chat-area"
            id="chatArea"
        >

            <!-- WELCOME -->

            <div
                class="welcome"
                id="welcomeScreen"
            >

                <div class="welcome-icon">
                    A
                </div>

                <h1>
                    How can I help you?
                </h1>

                <p>
                    Ask anything, write code, learn something new,
                    or just have a conversation.
                </p>


                <!-- SUGGESTIONS -->

                <div class="suggestions">

                    <button
                        type="button"
                        class="suggestion-card"
                        data-prompt="Explain a difficult programming concept in simple words."
                    >
                        <span class="suggestion-icon">💡</span>

                        <span class="suggestion-content">
                            <strong>Explain something</strong>
                            <small>Learn a topic simply</small>
                        </span>

                    </button>


                    <button
                        type="button"
                        class="suggestion-card"
                        data-prompt="Help me write a clean and modern website."
                    >
                        <span class="suggestion-icon">💻</span>

                        <span class="suggestion-content">
                            <strong>Build a website</strong>
                            <small>Get coding help</small>
                        </span>

                    </button>


                    <button
                        type="button"
                        class="suggestion-card"
                        data-prompt="Give me a step-by-step study plan for Computer Science."
                    >
                        <span class="suggestion-icon">📚</span>

                        <span class="suggestion-content">
                            <strong>Study plan</strong>
                            <small>Organize your learning</small>
                        </span>

                    </button>


                    <button
                        type="button"
                        class="suggestion-card"
                        data-prompt="Give me some useful project ideas for a CSE student."
                    >
                        <span class="suggestion-icon">🚀</span>

                        <span class="suggestion-content">
                            <strong>Project ideas</strong>
                            <small>Build something useful</small>
                        </span>

                    </button>

                </div>

            </div>


            <!-- MESSAGES -->

            <div
                class="messages"
                id="messages"
            ></div>


            <!-- TYPING -->

            <div
                class="typing-indicator"
                id="typingIndicator"
                hidden
            >
                <div class="typing-avatar">
                    A
                </div>

                <div class="typing-box">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>

        </section>


        <!-- ================= COMPOSER ================= -->

        <div class="composer-wrapper">

            <form
                class="composer"
                id="chatForm"
                autocomplete="off"
            >

                <button
                    type="button"
                    class="composer-button"
                    id="attachButton"
                    title="Attach file"
                    aria-label="Attach file"
                >
                    +
                </button>


                <textarea
                    id="messageInput"
                    name="message"
                    rows="1"
                    maxlength="10000"
                    placeholder="Message Ankul AI..."
                    autocomplete="off"
                ></textarea>


                <button
                    type="button"
                    class="composer-button voice-button"
                    id="voiceButton"
                    title="Voice input"
                    aria-label="Voice input"
                >
                    🎙
                </button>


                <button
                    type="submit"
                    class="send-button"
                    id="sendButton"
                    title="Send message"
                    aria-label="Send message"
                >
                    ↑
                </button>

            </form>


            <div class="composer-footer">
                Ankul AI can make mistakes. Check important information.
            </div>

        </div>

    </main>

</div>


<!-- ================= SETTINGS MODAL ================= -->

<div
    class="modal-backdrop"
    id="settingsModal"
    hidden
>

    <div
        class="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settingsTitle"
    >

        <div class="modal-header">

            <div>
                <h2 id="settingsTitle">
                    Settings
                </h2>

                <p>
                    Customize your Ankul AI experience.
                </p>
            </div>

            <button
                type="button"
                class="modal-close"
                data-close-modal="settingsModal"
            >
                ×
            </button>

        </div>


        <div class="settings-list">

            <div class="setting-item">

                <div>
                    <strong>Dark mode</strong>
                    <small>Use the dark interface.</small>
                </div>

                <button
                    type="button"
                    class="switch active"
                    id="darkModeSwitch"
                    aria-label="Dark mode"
                >
                    <span></span>
                </button>

            </div>


            <div class="setting-item">

                <div>
                    <strong>Enter to send</strong>
                    <small>Press Enter to send messages.</small>
                </div>

                <button
                    type="button"
                    class="switch active"
                    id="enterSendSwitch"
                    aria-label="Enter to send"
                >
                    <span></span>
                </button>

            </div>


            <div class="setting-item">

                <div>
                    <strong>Message timestamps</strong>
                    <small>Show the time of messages.</small>
                </div>

                <button
                    type="button"
                    class="switch"
                    id="timestampSwitch"
                    aria-label="Message timestamps"
                >
                    <span></span>
                </button>

            </div>

        </div>

    </div>

</div>


<!-- ================= ABOUT MODAL ================= -->

<div
    class="modal-backdrop"
    id="aboutModal"
    hidden
>

    <div
        class="modal about-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="aboutTitle"
    >

        <div class="modal-header">

            <div>
                <h2 id="aboutTitle">
                    About Ankul AI
                </h2>

                <p>
                    Your personal AI assistant.
                </p>
            </div>

            <button
                type="button"
                class="modal-close"
                data-close-modal="aboutModal"
            >
                ×
            </button>

        </div>


        <div class="about-content">

            <div class="about-logo">
                A
            </div>

            <h3>
                Ankul AI
            </h3>

            <p>
                A personal AI assistant created by Ankul.
            </p>

            <div class="version">
                Version <?= htmlspecialchars($appVersion) ?>
            </div>

        </div>

    </div>

</div>


<!-- ================= TOAST ================= -->

<div
    class="toast"
    id="toast"
    role="status"
    aria-live="polite"
></div>


<script src="/assets/app.js?v=10" defer></script>

</body>
</html>
