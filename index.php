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

    <!-- Main CSS -->
    <link
        rel="stylesheet"
        href="/assets/style.css?v=3"
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
            <span>New chat</span>
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
                <span>Settings</span>
            </button>


            <button
                class="sidebar-button"
                id="aboutButton"
                type="button"
            >
                <span>ⓘ</span>
                <span>About Ankul AI</span>
            </button>

        </div>

    </aside>


    <!-- MOBILE SIDEBAR OVERLAY -->

    <div
        id="sidebarOverlay"
        class="sidebar-overlay"
    ></div>


    <!-- =====================================================
         MAIN
         ===================================================== -->

    <main class="main">


        <!-- TOP BAR -->

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
             CHAT CONTENT
             ================================================= -->

        <section
           
