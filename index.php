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

    <!-- ================= SIDEBAR ================= -->

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
                aria-label="Close sidebar"
            >
                ×
            </button>

        </div>


        <button
            id="newChatButton"
            class="new-chat-button"
        >
            <span class="new-chat-icon">＋</span>
            <span>New chat</span>
        </button>


        <div class="sidebar-section">

            <div class="sidebar-label">
                Recent
            </div>

            <div id="historyList" class="history-list">

                <div class="history-empty">
                    Your conversations will appear here.
                </div>

            </div>

        </div>


        <div class="sidebar-footer">

            <button
                class="sidebar-action"
                id="settingsButton"
            >
                <span>⚙</span>
                <span>Settings</span>
            </button>

            <button
                class="sidebar-action"
                id="aboutButton"
            >
                <span>ⓘ</span>
                <span>About Ankul AI</span>
            </button>

        </div>

    </aside>


    <!-- ================= MAIN ================= -->

    <main class="main">

        <!-- TOP NAVIGATION -->

        <header class="topbar">

            <div class="topbar-left">

                <button
                    id="menuButton"
                    class="icon-button"
                    aria-label="Open menu"
                >
                    ☰
                </button>


                <div class="model-selector">

                    <div class="model-name">
                        Ankul AI
                    </div>

                    <div class="model-status">
                        AI Assistant
                    </div>

                </div>

            </div>


            <div class="topbar-actions">

                <button
                    id="themeButton"
                    class="icon-button"
                    aria-label="Toggle theme"
                    title="Toggle theme"
                >
                    ◐
                </button>

            </div>

        </header>


        <!-- ================= CHAT ================= -->

        <section
            id="chatContainer"
            class="chat-container"
        >

            <!-- WELCOME SCREEN -->

            <div
                id="welcomeScreen"
                class="welcome-screen"
            >

                <div class="hero-logo">
                    <span>A</span>
                </div>


                <div class="hero-content">

                    <div class="eyebrow">
                        PERSONAL AI ASSISTANT
                    </div>

                    <h1>
                        Hello, I'm
                        <span>Ankul AI</span>
                    </h1>

                    <p>
                        Think. Create. Learn. Build.
                        <br>
                        Ask me anything.
                    </p>

                </div>


                <!-- SUGGESTIONS -->

                <div class="suggestions-grid">

                    <button
                        class="suggestion-card"
                        data-prompt="Explain artificial intelligence in simple words with examples."
                    >

                        <div class="suggestion-icon">
                            ✦
                        </div>

                        <div class="suggestion-content">

                            <strong>
                                Explain something
                            </strong>

                            <span>
                                Get a clear explanation
                            </span>

                        </div>

                    </button>


                    <button
                        class="suggestion-card"
                        data-prompt="Help me write clean, professional code and explain it."
                    >

                        <div class="suggestion-icon">
                            &lt;/&gt;
                        </div>

                        <div class="suggestion-content">

                            <strong>
                                Write code
                            </strong>

                            <span>
                                Build, debug or improve code
                            </span>

                        </div>

                    </button>


                    <button
                        class="suggestion-card"
                        data-prompt="Analyze this idea and show me different possibilities, benefits and risks."
                    >

                        <div class="suggestion-icon">
                            ◈
                        </div>

                        <div class="suggestion-content">

                            <strong>
                                Analyze an idea
                            </strong>

                            <span>
                                Explore possibilities
                            </span>

                        </div>

                    </button>


                    <button
                        class="suggestion-card"
                        data-prompt="Create a structured learning plan for me."
                    >

                        <div class="suggestion-icon">
                            ◎
                        </div>

                        <div class="suggestion-content">

                            <strong>
                                Help me learn
                            </strong>

                            <span>
                                Learn step by step
                            </span>

                        </div>

                    </button>

                </div>

            </div>


            <!-- MESSAGES -->

            <div
                id="messages"
                class="messages"
                aria-live="polite"
            >
            </div>


            <!-- TYPING -->

            <div
                id="typingIndicator"
                class="typing-indicator hidden"
            >

                <div class="ai-avatar">
                    A
                </div>

                <div class="typing-content">

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

                <button
                    type="button"
                    id="attachButton"
                    class="composer-button"
                    title="Attach"
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
                >
                    🎙
                </button>


                <button
                    type="submit"
                    id="sendButton"
                    class="send-button"
                    disabled
                    title="Send"
                >
                    ↑
                </button>

            </form>


            <div class="composer-footer">

                <span>
                    Ankul AI may make mistakes. Verify important information.
                </span>

                <span>
                    Enter to send · Shift + Enter for new line
                </span>

            </div>

        </div>

    </main>

</div>


<!-- ================= SETTINGS MODAL ================= -->

<div
    id="settingsModal"
    class="modal hidden"
>

    <div class="modal-backdrop"></div>

    <div class="modal-card">

        <div class="modal-header">

            <div>
                <h2>Settings</h2>
                <p>Customize your Ankul AI experience.</p>
            </div>

            <button
                id="closeSettings"
                class="icon-button"
            >
                ×
            </button>

        </div>


        <div class="settings-group">

            <label>
                Appearance
            </label>

            <div class="theme-options">

                <button
                    data-theme="dark"
                    class="theme-option active"
                >
                    Dark
                </button>

                <button
                    data-theme="light"
                    class="theme-option"
                >
                    Light
                </button>

            </div>

        </div>


        <div class="settings-group">

            <label class="switch-row">

                <span>
                    Enter to send
                </span>

                <input
                    type="checkbox"
                    id="enterToSend"
                    checked
                >

            </label>

        </div>


        <div class="settings-group">

            <label class="switch-row">

                <span>
                    Show timestamps
                </span>

                <input
                    type="checkbox"
                    id="showTimestamps"
                >

            </label>

        </div>

    </div>

</div>


<!-- ================= ABOUT MODAL ================= -->

<div
    id="aboutModal"
    class="modal hidden"
>

    <div class="modal-backdrop"></div>

    <div class="modal-card about-card">

        <div class="hero-logo small">
            A
        </div>

        <h2>
            Ankul AI
        </h2>

        <p>
            A personal AI assistant built for
            conversation, learning and creation.
        </p>

        <div class="version">
            Version <?= htmlspecialchars($appVersion) ?>
        </div>

        <button
            id="closeAbout"
            class="primary-button"
        >
            Close
        </button>

    </div>

</div>


<!-- TOAST -->

<div
    id="toast"
    class="toast"
    role="status"
>
</div>


<script src="assets/app.js"></script>

</body>
</html>
