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
        content="width=device-width, initial-scale=1.0"
    >

    <meta
        name="theme-color"
        content="#08090d"
    >

    <meta
        name="description"
        content="Ankul AI — intelligent personal AI assistant"
    >

    <title><?= htmlspecialchars($appName) ?></title>

    <link
        rel="stylesheet"
        href="assets/style.css"
    >

</head>

<body>

<div id="app" class="app">

    <!-- =====================================================
         SIDEBAR
         ===================================================== -->

    <aside
        id="sidebar"
        class="sidebar"
    >

        <div class="sidebar-top">

            <div class="brand">

                <div class="brand-mark">
                    A
                </div>

                <div class="brand-text">
                    <strong>Ankul AI</strong>
                    <span>Personal Assistant</span>
                </div>

            </div>

            <button
                id="closeSidebar"
                class="icon-button mobile-only"
                type="button"
                aria-label="Close sidebar"
            >
                ×
            </button>

        </div>


        <button
            id="newChatButton"
            class="new-chat-button"
            type="button"
        >

            <span class="new-chat-icon">＋</span>

            <span>
                New chat
            </span>

        </button>


        <div class="sidebar-section">

            <div class="sidebar-label">
                Recent
            </div>

            <div
                id="historyList"
                class="chat-history"
            >

                <div class="history-item">

                    <span class="history-icon">
                        💬
                    </span>

                    <span class="history-title">
                        Your conversations will appear here.
                    </span>

                </div>

            </div>

        </div>


        <div class="sidebar-bottom">

            <button
                class="sidebar-button"
                id="settingsButton"
                type="button"
            >

                <span>⚙</span>

                <span>
                    Settings
                </span>

            </button>


            <button
                class="sidebar-button"
                id="aboutButton"
                type="button"
            >

                <span>ⓘ</span>

                <span>
                    About Ankul AI
                </span>

            </button>

        </div>

    </aside>


    <!-- =====================================================
         MAIN
         ===================================================== -->

    <main class="main">


        <!-- =================================================
             TOPBAR
             ================================================= -->

        <header class="topbar">

            <div class="topbar-left">

                <button
                    id="menuButton"
                    class="icon-button mobile-menu-button"
                    type="button"
                    aria-label="Open menu"
                >
                    ☰
                </button>


                <button
                    class="model-selector"
                    type="button"
                    aria-label="Current AI model"
                >

                    <span class="model-dot"></span>

                    <span class="model-name">
                        Ankul AI
                    </span>

                    <span class="model-status">
                        AI Assistant
                    </span>

                </button>

            </div>


            <div class="topbar-right">

                <button
                    id="themeButton"
                    class="icon-button"
                    type="button"
                    aria-label="Toggle theme"
                    title="Toggle theme"
                >
                    ◐
                </button>

            </div>

        </header>


        <!-- =================================================
             CONTENT
             ================================================= -->

        <section
            id="chatContainer"
            class="content"
        >


            <!-- =============================================
                 WELCOME SCREEN
                 ============================================= -->

            <div
                id="welcomeScreen"
                class="welcome"
            >

                <div class="hero-logo">
                    A
                </div>


                <h1>
                    Hello, I'm Ankul AI
                </h1>


                <p class="welcome-subtitle">
                    Think. Create. Learn. Build.
                    <br>
                    Your personal AI assistant for ideas,
                    coding, learning and everyday tasks.
                </p>


                <!-- =========================================
                     SUGGESTION CARDS
                     ========================================= -->

                <div class="suggestions">


                    <button
                        class="suggestion-card"
                        type="button"
                        data-prompt="Explain artificial intelligence in simple words with examples."
                    >

                        <div class="suggestion-icon">
                            ✦
                        </div>

                        <strong>
                            Explain something
                        </strong>

                        <span>
                            Get a clear explanation
                        </span>

                    </button>


                    <button
                        class="suggestion-card"
                        type="button"
                        data-prompt="Help me write clean, professional code and explain it."
                    >

                        <div class="suggestion-icon">
                            &lt;/&gt;
                        </div>

                        <strong>
                            Write code
                        </strong>

                        <span>
                            Build, debug or improve code
                        </span>

                    </button>


                    <button
                        class="suggestion-card"
                        type="button"
                        data-prompt="Analyze this idea and show me different possibilities, benefits and risks."
                    >

                        <div class="suggestion-icon">
                            ◈
                        </div>

                        <strong>
                            Analyze an idea
                        </strong>

                        <span>
                            Explore possibilities
                        </span>

                    </button>


                    <button
                        class="suggestion-card"
                        type="button"
                        data-prompt="Create a structured learning plan for me."
                    >

                        <div class="suggestion-icon">
                            ◎
                        </div>

                        <strong>
                            Help me learn
                        </strong>

                        <span>
                            Learn step by step
                        </span>

                    </button>

                </div>

            </div>


            <!-- =============================================
                 MESSAGES
                 ============================================= -->

            <div
                id="messages"
                class="messages"
                aria-live="polite"
            >
            </div>


            <!-- =============================================
                 TYPING INDICATOR
                 ============================================= -->

            <div
                id="typingIndicator"
                class="typing-indicator"
            >

                <div class="typing-avatar">
                    A
                </div>

                <div class="typing-dots">

                    <span></span>
                    <span></span>
                    <span></span>

                </div>

            </div>


        </section>


        <!-- =================================================
             COMPOSER
             ================================================= -->

        <div class="composer-wrap">


            <form
                id="chatForm"
                class="composer"
                autocomplete="off"
            >


                <button
                    type="button"
                    id="attachButton"
                    class="composer-button"
                    title="Attach"
                    aria-label="Attach file"
                >
                    ＋
                </button>


                <textarea
                    id="messageInput"
                    name="message"
                    rows="1"
                    maxlength="12000"
                    placeholder="Ask Ankul AI..."
                    aria-label="Message"
                ></textarea>


                <button
                    type="button"
                    id="voiceButton"
                    class="composer-button voice-button"
                    title="Voice input"
                    aria-label="Voice input"
                >
                    🎙
                </button>


                <button
                    type="submit"
                    id="sendButton"
                    class="composer-button send-button"
                    disabled
                    title="Send"
                    aria-label="Send message"
                >
                    ↑
                </button>


            </form>


            <div class="composer-hint">

                Ankul AI may make mistakes.
                Verify important information.

                <br>

                Enter to send · Shift + Enter for new line

            </div>


        </div>


    </main>

</div>


<!-- =========================================================
     SIDEBAR MOBILE OVERLAY
     ========================================================= -->

<div
    id="sidebarOverlay"
    class="sidebar-overlay"
></div>


<!-- =========================================================
     SETTINGS MODAL
     ========================================================= -->

<div
    id="settingsModal"
    class="modal-backdrop"
>

    <div
        class="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settingsTitle"
    >

        <div class="modal-header">

            <h2 id="settingsTitle">
                Settings
            </h2>

            <button
                id="closeSettings"
                class="modal-close"
                type="button"
                aria-label="Close settings"
            >
                ×
            </button>

        </div>


        <!-- Appearance -->

        <div class="settings-group">

            <div class="settings-title">
                Appearance
            </div>


            <div class="theme-options">

                <button
                    type="button"
                    data-theme="dark"
                    class="theme-button active"
                >
                    🌙 Dark
                </button>


                <button
                    type="button"
                    data-theme="light"
                    class="theme-button"
                >
                    ☀️ Light
                </button>

            </div>

        </div>


        <!-- Chat Settings -->

        <div class="settings-group">

            <div class="settings-title">
                Chat
            </div>


            <div class="setting-row">

                <div class="setting-info">

                    <strong>
                        Enter to send
                    </strong>

                    <span>
                        Press Enter to send your message.
                    </span>

                </div>


                <button
                    id="enterToSend"
                    class="toggle active"
                    type="button"
                    aria-label="Enter to send"
                    aria-pressed="true"
                ></button>

            </div>


            <div class="setting-row">

                <div class="setting-info">

                    <strong>
                        Show timestamps
                    </strong>

                    <span>
                        Display time on messages.
                    </span>

                </div>


                <button
                    id="showTimestamps"
                    class="toggle"
                    type="button"
                    aria-label="Show timestamps"
                    aria-pressed="false"
                ></button>

            </div>

        </div>


    </div>

</div>


<!-- =========================================================
     ABOUT MODAL
     ========================================================= -->

<div
    id="aboutModal"
    class="modal-backdrop"
>

    <div
        class="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="aboutTitle"
    >

        <div class="modal-header">

            <h2 id="aboutTitle">
                About Ankul AI
            </h2>

            <button
                id="closeAbout"
                class="modal-close"
                type="button"
                aria-label="Close about"
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
                A modern personal AI assistant built for
                conversation, learning, coding and creation.
            </p>


            <div class="about-meta">

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

            </div>

        </div>

    </div>

</div>


<!-- =========================================================
     TOAST
     ========================================================= -->

<div
    id="toast"
    class="toast"
    role="status"
    aria-live="polite"
>
</div>


<!-- =========================================================
     JAVASCRIPT
     ========================================================= -->

<script src="assets/app.js"></script>

</body>
</html>
