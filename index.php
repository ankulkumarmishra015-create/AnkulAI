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
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
    >

    <meta name="theme-color" content="#09090d">

    <title><?= htmlspecialchars($appName) ?></title>

    <link
        rel="stylesheet"
        href="/assets/style.css?v=20"
    >
</head>

<body>

<div class="app-shell" id="appShell">

    <!-- ================= SIDEBAR ================= -->

    <aside class="sidebar" id="sidebar">

        <div class="sidebar-header">

            <div class="brand">

                <div class="brand-icon">
                    A
                </div>

                <div class="brand-text">
                    <strong>Ankul AI</strong>
                    <small>Personal AI Assistant</small>
                </div>

            </div>

            <button
                class="mobile-close"
                id="closeSidebar"
                type="button"
            >
                ×
            </button>

        </div>


        <div class="sidebar-content">

            <button
                class="new-chat"
                id="newChatButton"
                type="button"
            >
                <span>+</span>
                <strong>New chat</strong>
            </button>


            <!-- SEARCH -->

            <div class="search-box">

                <span>⌕</span>

                <input
                    id="searchInput"
                    type="text"
                    placeholder="Search chats..."
                    autocomplete="off"
                >

            </div>


            <!-- NAVIGATION -->

            <nav class="sidebar-nav">

                <button
                    class="nav-item active"
                    data-page="home"
                    type="button"
                >
                    <span>⌂</span>
                    <span>Home</span>
                </button>

                <button
                    class="nav-item"
                    data-page="history"
                    type="button"
                >
                    <span>◷</span>
                    <span>History</span>
                </button>

                <button
                    class="nav-item"
                    data-page="saved"
                    type="button"
                >
                    <span>♡</span>
                    <span>Saved</span>
                </button>

                <button
                    class="nav-item"
                    id="settingsButton"
                    type="button"
                >
                    <span>⚙</span>
                    <span>Settings</span>
                </button>

            </nav>


            <!-- TODAY -->

            <div class="history-section">

                <div class="section-label">
                    TODAY
                </div>

                <div id="historyList">

                    <div class="history-empty">
                        No conversations yet
                    </div>

                </div>

            </div>

        </div>


        <!-- SIDEBAR BOTTOM -->

        <div class="sidebar-footer">

            <button
                class="clear-chats"
                id="clearChatsButton"
                type="button"
            >
                <span>▢</span>
                <span>Clear all chats</span>
            </button>

            <button
                class="about-button"
                id="aboutButton"
                type="button"
            >
                <span>ⓘ</span>
                <span>About Ankul AI</span>
            </button>

        </div>

    </aside>


    <div
        class="sidebar-overlay"
        id="sidebarOverlay"
    ></div>


    <!-- ================= MAIN ================= -->

    <main class="main">

        <!-- TOPBAR -->

        <header class="topbar">

            <div class="topbar-left">

                <button
                    class="menu-button"
                    id="menuButton"
                    type="button"
                >
                    ☰
                </button>

                <div class="topbar-brand">
                    <span class="mini-logo">A</span>
                    <strong>Ankul AI</strong>
                </div>

            </div>


            <div class="topbar-right">

                <!-- MODEL SELECTOR -->

                <div class="model-selector">

                    <button
                        class="model-button"
                        id="modelButton"
                        type="button"
                    >
                        <span id="selectedModel">
                            Gemini 3.8 Flash
                        </span>

                        <span class="arrow">
                            ▾
                        </span>
                    </button>


                    <div
                        class="model-menu"
                        id="modelMenu"
                    >

                        <button
                            type="button"
                            class="model-option active"
                            data-model="gemini-3.8-flash"
                        >
                            <span>Gemini 3.8 Flash</span>
                            <span>✓</span>
                        </button>

                        <button
                            type="button"
                            class="model-option"
                            data-model="gemini-3.6-flash"
                        >
                            <span>Gemini 3.6 Flash</span>
                        </button>

                        <button
                            type="button"
                            class="model-option"
                            data-model="auto"
                        >
                            <span>Auto</span>
                        </button>

                    </div>

                </div>


                <button
                    class="top-icon"
                    id="quickNewChat"
                    type="button"
                    title="New chat"
                >
                    +
                </button>


                <button
                    class="top-icon"
                    id="themeButton"
                    type="button"
                    title="Theme"
                >
                    ◐
                </button>


                <button
                    class="top-icon"
                    id="topMoreButton"
                    type="button"
                    title="More"
                >
                    ⋮
                </button>

            </div>

        </header>


        <!-- ================= CHAT ================= -->

        <section
            class="chat-area"
            id="chatArea"
        >

            <!-- WELCOME -->

            <div
                class="welcome"
                id="welcomeScreen"
            >

                <div class="welcome-logo">
                    A
                </div>

                <h1>
                    How can I help you today?
                </h1>

                <p>
                    Ask me anything, write code,
                    learn something new, or just chat.
                </p>

                <div class="welcome-cards">

                    <button
                        class="prompt-card"
                        data-prompt="Explain a difficult programming concept in simple words."
                        type="button"
                    >
                        <span class="card-icon">💡</span>

                        <div>
                            <strong>Explain something</strong>
                            <small>Learn a topic simply</small>
                        </div>
                    </button>


                    <button
                        class="prompt-card"
                        data-prompt="Help me build a modern website."
                        type="button"
                    >
                        <span class="card-icon">💻</span>

                        <div>
                            <strong>Build a website</strong>
                            <small>Get coding help</small>
                        </div>
                    </button>


                    <button
                        class="prompt-card"
                        data-prompt="Create a study plan for Computer Science."
                        type="button"
                    >
                        <span class="card-icon">📚</span>

                        <div>
                            <strong>Study plan</strong>
                            <small>Organize your learning</small>
                        </div>
                    </button>


                    <button
                        class="prompt-card"
                        data-prompt="Give me some useful project ideas for a CSE student."
                        type="button"
                    >
                        <span class="card-icon">🚀</span>

                        <div>
                            <strong>Project ideas</strong>
                            <small>Build something useful</small>
                        </div>
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
                class="typing"
                id="typingIndicator"
                hidden
            >

                <div class="assistant-avatar">
                    A
                </div>

                <div class="typing-bubble">

                    <span></span>
                    <span></span>
                    <span></span>

                </div>

            </div>

        </section>


        <!-- ================= COMPOSER ================= -->

        <div class="composer-area">

            <form
                class="composer"
                id="chatForm"
            >

                <button
                    class="composer-icon"
                    id="attachButton"
                    type="button"
                    title="Attach"
                >
                    +
                </button>


                <input
                    type="file"
                    id="fileInput"
                    hidden
                    multiple
                >


                <textarea
                    id="messageInput"
                    rows="1"
                    maxlength="12000"
                    placeholder="Ask Ankul AI anything..."
                ></textarea>


                <button
                    class="composer-icon microphone"
                    id="voiceButton"
                    type="button"
                    title="Voice input"
                >
                    🎙
                </button>


                <button
                    class="send-button"
                    id="sendButton"
                    type="submit"
                    title="Send"
                >
                    ➤
                </button>

            </form>


            <div class="composer-note">
                Ankul AI can make mistakes. Check important information.
            </div>

        </div>

    </main>

</div>


<!-- ================= SETTINGS ================= -->

<div
    class="modal-backdrop"
    id="settingsModal"
    hidden
>

    <div class="modal">

        <div class="modal-title">

            <div>
                <h2>Settings</h2>
                <p>Customize your Ankul AI experience.</p>
            </div>

            <button
                class="modal-close"
                data-close-modal="settingsModal"
                type="button"
            >
                ×
            </button>

        </div>


        <div class="settings-list">

            <div class="setting">

                <div>
                    <strong>Dark mode</strong>
                    <small>Use the dark interface.</small>
                </div>

                <button
                    class="switch"
                    id="darkModeSwitch"
                    type="button"
                >
                    <span></span>
                </button>

            </div>


            <div class="setting">

                <div>
                    <strong>Enter to send</strong>
                    <small>Press Enter to send a message.</small>
                </div>

                <button
                    class="switch"
                    id="enterSendSwitch"
                    type="button"
                >
                    <span></span>
                </button>

            </div>


            <div class="setting">

                <div>
                    <strong>Message timestamps</strong>
                    <small>Show time on messages.</small>
                </div>

                <button
                    class="switch"
                    id="timestampSwitch"
                    type="button"
                >
                    <span></span>
                </button>

            </div>

        </div>

    </div>

</div>


<!-- ================= ABOUT ================= -->

<div
    class="modal-backdrop"
    id="aboutModal"
    hidden
>

    <div class="modal about-modal">

        <div class="modal-title">

            <div>
                <h2>About Ankul AI</h2>
                <p>Your personal AI assistant.</p>
            </div>

            <button
                class="modal-close"
                data-close-modal="aboutModal"
                type="button"
            >
                ×
            </button>

        </div>


        <div class="about-body">

            <div class="about-logo">
                A
            </div>

            <h3>
                Ankul AI
            </h3>

            <p>
                A personal AI assistant created by Ankul.
            </p>

            <small>
                Version <?= htmlspecialchars($appVersion) ?>
            </small>

        </div>

    </div>

</div>


<!-- ================= TOAST ================= -->

<div
    class="toast"
    id="toast"
></div>


<script src="/assets/app.js?v=20" defer></script>

</body>
</html>
