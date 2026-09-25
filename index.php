<?php
declare(strict_types=1);

$appName = 'Ankul AI';
$appVersion = '1.0.0';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, viewport-fit=cover"
    >

    <meta name="theme-color" content="#09090d">

    <title><?= htmlspecialchars($appName) ?></title>

    <link
        rel="stylesheet"
        href="/assets/style.css?v=20"
    >
</head>

<body>

<div class="app">

    <!-- ================= SIDEBAR ================= -->

    <aside class="sidebar" id="sidebar">

        <div class="sidebar-header">

            <div class="brand">

                <div class="brand-logo">
                    A
                </div>

                <div class="brand-text">
                    <strong>Ankul AI</strong>
                    <span>Personal AI Assistant</span>
                </div>

            </div>

            <button
                type="button"
                class="icon-button mobile-close"
                id="closeSidebar"
                aria-label="Close sidebar"
            >
                ×
            </button>

        </div>


        <div class="sidebar-actions">

            <button
                type="button"
                class="new-chat-button"
                id="newChatButton"
            >
                <span>+</span>
                <span>New chat</span>
            </button>

        </div>


        <!-- SEARCH -->

        <div class="search-box">

            <span class="search-icon">⌕</span>

            <input
                type="search"
                id="searchInput"
                placeholder="Search chats..."
                autocomplete="off"
            >

        </div>


        <!-- NAVIGATION -->

        <nav class="navigation">

            <button
                type="button"
                class="nav-item active"
                data-page="home"
            >
                <span class="nav-icon">⌂</span>
                <span>Home</span>
            </button>


            <button
                type="button"
                class="nav-item"
                data-page="history"
            >
                <span class="nav-icon">◷</span>
                <span>History</span>
            </button>


            <button
                type="button"
                class="nav-item"
                data-page="saved"
            >
                <span class="nav-icon">♡</span>
                <span>Saved</span>
            </button>


            <button
                type="button"
                class="nav-item"
                id="settingsButton"
                data-page="settings"
            >
                <span class="nav-icon">⚙</span>
                <span>Settings</span>
            </button>

        </nav>


        <!-- HISTORY -->

        <div class="history-section">

            <div class="section-title">
                TODAY
            </div>

            <div
                id="historyList"
                class="history-list"
            ></div>

        </div>


        <!-- SIDEBAR BOTTOM -->

        <div class="sidebar-bottom">

            <button
                type="button"
                class="sidebar-bottom-button"
                id="aboutButton"
            >
                <span>ⓘ</span>
                <span>About Ankul AI</span>
            </button>


            <button
                type="button"
                class="sidebar-bottom-button danger"
                id="clearChatsButton"
            >
                <span>♧</span>
                <span>Clear all chats</span>
            </button>

        </div>

    </aside>


    <!-- ================= MAIN ================= -->

    <main class="main">

        <!-- TOPBAR -->

        <header class="topbar">

            <div class="topbar-left">

                <button
                    type="button"
                    class="menu-button"
                    id="menuButton"
                    aria-label="Open menu"
                >
                    ☰
                </button>


                <div class="top-brand">

                    <div class="top-brand-logo">
                        A
                    </div>

                    <strong>
                        Ankul AI
                    </strong>

                </div>

            </div>


            <div class="topbar-right">

                <!-- MODEL SELECTOR -->

                <div class="model-selector">

                    <button
                        type="button"
                        class="model-button"
                        id="modelButton"
                    >

                        <span id="selectedModel">
                            gemini-3.8-flash
                        </span>

                        <span>
                            ▾
                        </span>

                    </button>


                    <div
                        class="model-menu"
                        id="modelMenu"
                        hidden
                    >

                        <button
                            type="button"
                            class="model-option active"
                            data-model="gemini-3.8-flash"
                        >
                            <span>
                                Gemini 3.8 Flash
                            </span>

                            <span>
                                ✓
                            </span>
                        </button>


                        <button
                            type="button"
                            class="model-option"
                            data-model="gemini-3.6-flash"
                        >
                            Gemini 3.6 Flash
                        </button>


                        <button
                            type="button"
                            class="model-option"
                            data-model="auto"
                        >
                            Auto
                        </button>

                    </div>

                </div>


                <!-- NEW CHAT -->

                <button
                    type="button"
                    class="top-icon-button"
                    id="quickNewChat"
                    aria-label="New chat"
                    title="New chat"
                >
                    +
                </button>


                <!-- THEME -->

                <button
                    type="button"
                    class="top-icon-button"
                    id="themeButton"
                    aria-label="Theme"
                    title="Theme"
                >
                    ☼
                </button>


                <!-- MORE -->

                <button
                    type="button"
                    class="top-icon-button"
                    id="topMoreButton"
                    aria-label="More"
                    title="More"
                >
                    ⋮
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
                class="welcome-screen"
                id="welcomeScreen"
            >

                <div class="welcome-logo">
                    A
                </div>


                <h1>
                    How can I help you today?
                </h1>


                <p>
                    Ask anything, write code, learn something new,
                    or just chat.
                </p>


                <!-- SUGGESTION CARDS -->

                <div class="prompt-grid">

                    <button
                        type="button"
                        class="prompt-card"
                        data-prompt="Explain something in simple words"
                    >

                        <div class="prompt-icon">
                            💡
                        </div>

                        <div class="prompt-content">

                            <strong>
                                Explain something
                            </strong>

                            <span>
                                Get clear, simple explanations
                            </span>

                        </div>

                    </button>


                    <button
                        type="button"
                        class="prompt-card"
                        data-prompt="Help me build a website"
                    >

                        <div class="prompt-icon">
                            💻
                        </div>

                        <div class="prompt-content">

                            <strong>
                                Build a website
                            </strong>

                            <span>
                                Get coding help
                            </span>

                        </div>

                    </button>


                    <button
                        type="button"
                        class="prompt-card"
                        data-prompt="Make a study plan for me"
                    >

                        <div class="prompt-icon">
                            📚
                        </div>

                        <div class="prompt-content">

                            <strong>
                                Study plan
                            </strong>

                            <span>
                                Organize your learning
                            </span>

                        </div>

                    </button>


                    <button
                        type="button"
                        class="prompt-card"
                        data-prompt="Give me some project ideas"
                    >

                        <div class="prompt-icon">
                            🚀
                        </div>

                        <div class="prompt-content">

                            <strong>
                                Project ideas
                            </strong>

                            <span>
                                Build something useful
                            </span>

                        </div>

                    </button>

                </div>

            </div>


            <!-- MESSAGES -->

            <div
                id="messages"
                class="messages"
                hidden
            ></div>


            <!-- TYPING INDICATOR -->

            <div
                id="typingIndicator"
                class="typing-indicator"
                hidden
            >

                <div class="message-avatar">
                    A
                </div>

                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>

            </div>

        </section>


        <!-- ================= COMPOSER ================= -->

        <div class="composer-area">

            <form
                id="chatForm"
                class="composer"
                autocomplete="off"
            >

                <!-- ATTACHMENT -->

                <button
                    type="button"
                    class="composer-icon"
                    id="attachButton"
                    title="Attach file"
                    aria-label="Attach file"
                >
                    +
                </button>


                <input
                    type="file"
                    id="fileInput"
                    hidden
                    multiple
                >


                <!-- TEXT -->

                <textarea
                    id="messageInput"
                    name="message"
                    rows="1"
                    placeholder="Ask Ankul AI anything..."
                    autocomplete="off"
                    spellcheck="true"
                ></textarea>


                <!-- VOICE -->

                <button
                    type="button"
                    class="composer-icon"
                    id="voiceButton"
                    title="Voice input"
                    aria-label="Voice input"
                >
                    ♫
                </button>


                <!-- SEND -->

                <button
                    type="submit"
                    class="send-button"
                    id="sendButton"
                    title="Send"
                    aria-label="Send"
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
    class="modal"
    id="settingsModal"
    hidden
>

    <div class="modal-card">

        <div class="modal-header">

            <h2>
                Settings
            </h2>

            <button
                type="button"
                class="modal-close"
                data-close-modal="settingsModal"
            >
                ×
            </button>

        </div>


        <div class="modal-body">

            <div class="settings-group">

                <div class="settings-label">
                    APPEARANCE
                </div>


                <div class="setting-row">

                    <div>

                        <strong>
                            Theme
                        </strong>

                        <span>
                            Choose your preferred color scheme
                        </span>

                    </div>


                    <div class="theme-options">

                        <button
                            type="button"
                            class="theme-option"
                            id="darkThemeButton"
                        >
                            Dark
                        </button>

                        <button
                            type="button"
                            class="theme-option"
                            id="lightThemeButton"
                        >
                            Light
                        </button>

                    </div>

                </div>

            </div>


            <div class="settings-group">

                <div class="settings-label">
                    CHAT
                </div>


                <div class="setting-row">

                    <div>

                        <strong>
                            Enter to send
                        </strong>

                        <span>
                            Use Shift + Enter for a new line
                        </span>

                    </div>


                    <label class="switch">

                        <input
                            type="checkbox"
                            id="enterSendSwitch"
                            checked
                        >

                        <span class="slider"></span>

                    </label>

                </div>


                <div class="setting-row">

                    <div>

                        <strong>
                            Show timestamps
                        </strong>

                        <span>
                            Display time next to messages
                        </span>

                    </div>


                    <label class="switch">

                        <input
                            type="checkbox"
                            id="timestampSwitch"
                        >

                        <span class="slider"></span>

                    </label>

                </div>

            </div>


            <div class="settings-group">

                <div class="settings-label">
                    ABOUT
                </div>

                <div class="about-small">

                    <strong>
                        Ankul AI
                    </strong>

                    <span>
                        Developer: Ankul Kumar Mishra
                    </span>

                    <span>
                        Version: <?= htmlspecialchars($appVersion) ?>
                    </span>

                    <span>
                        A Gemini-powered AI assistant interface.
                    </span>

                </div>

            </div>

        </div>

    </div>

</div>


<!-- ================= ABOUT ================= -->

<div
    class="modal"
    id="aboutModal"
    hidden
>

    <div class="modal-card about-card">

        <div class="modal-header">

            <h2>
                About Ankul AI
            </h2>

            <button
                type="button"
                class="modal-close"
                data-close-modal="aboutModal"
            >
                ×
            </button>

        </div>


        <div class="modal-body">

            <div class="about-logo">
                A
            </div>


            <h3>
                Ankul AI
            </h3>


            <p>
                Your personal AI assistant.
            </p>


            <div class="about-details">

                <div>
                    <strong>
                        Developer
                    </strong>

                    <span>
                        Ankul Kumar Mishra
                    </span>
                </div>


                <div>
                    <strong>
                        Version
                    </strong>

                    <span>
                        <?= htmlspecialchars($appVersion) ?>
                    </span>
                </div>


                <div>
                    <strong>
                        AI
                    </strong>

                    <span>
                        Gemini
                    </span>
                </div>

            </div>

        </div>

    </div>

</div>


<!-- ================= TOAST ================= -->

<div
    id="toast"
    class="toast"
    role="status"
    aria-live="polite"
></div>


<!-- ================= JS ================= -->

<script
    src="/assets/app.js?v=21"
    defer
></script>

</body>
</html>
