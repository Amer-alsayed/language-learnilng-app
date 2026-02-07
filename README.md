# 🇩🇪 German Mastery: Visualize Your Path to Fluency

![Project Banner](/public/screenshots/banner.png)

> _Note: Place a banner image at `public/screenshots/banner.png`_

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_&_DB-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-purple?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps/)

## 🚀 Overview

**German Mastery** is a next-generation language learning platform designed to make mastering German engaging, interactive, and visually stunning. Built with a focus on user experience, it combines gamification principles with a robust curriculum to keep users motivated.

Unlike traditional learning apps, German Mastery focuses on:

- **Immediate Feedback**: Real-time validation of answers with satisfying micro-interactions.
- **Visual Progression**: A dynamic "Candy Land" style map that visualizes the learning journey.
- **Immersion**: Native audio pronunciation and context-rich exercises.
- **Accessibility**: A responsive, PWA-enabled design that works seamlessly across all devices.

## ✨ Key Features

### 🎮 Interactive Game Engine

At the core of the application is a custom-built game engine that supports various exercise types:

- **Multiple Choice**: Fast-paced vocabulary recognition.
- **Listen & Select**: Audio-focused challenges to improve listening comprehension.
- **Sentence Building**: Drag-and-drop or tap-to-order sentence construction.
- **Fill in the Blanks**: Contextual grammar practice.

### 🗺️ Visual Learning Path

Users navigate through a beautifully animated roadmap. Each node represents a lesson, unlocking sequentially as the user progresses. The path is dynamically generated and state-aware, showing completed (gold), active (pulsing), and locked (gray) states.

### 🏆 Progress & Rewards

- **Hearts System**: A lives-based system to encourage careful thought.
- **XP & Streaks**: Daily engagement tracking to build learning habits.
- **Confetti & Haptics**: Delightful rewards upon lesson completion aimed at maximizing dopamine release.

### 🔒 Admin Dashboard

A comprehensive admin interface allowing content creators to:

- Manage courses, units, and lessons.
- Create and edit exercises with a WYSIWYG-like experience.
- Track user statistics and engagement metrics.

## 🛠️ Technology Stack

This project leverages the latest in modern web development to deliver a high-performance experience.

| Category       | Technology                  | Reason for Choice                                           |
| :------------- | :-------------------------- | :---------------------------------------------------------- |
| **Framework**  | **Next.js 16 (App Router)** | Server Components for performance, SEO, and robust routing. |
| **Language**   | **TypeScript**              | Strict type safety for maintainable and bug-free code.      |
| **Styling**    | **Tailwind CSS v4**         | Rapid UI development with a custom design system.           |
| **Animations** | **Framer Motion**           | Complex, physics-based animations for a "premium" feel.     |
| **State**      | **Zustand**                 | Lightweight, predictable global state management.           |
| **Backend**    | **Supabase**                | Scalable PostgreSQL database and secure authentication.     |
| **Testing**    | **Vitest & Playwright**     | Comprehensive unit and end-to-end testing reliability.      |
| **Components** | **Radix UI / Lucide**       | Accessible primitives and crisp iconography.                |

## 📸 Gallery

<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
  <img src="/public/screenshots/image-1.png" alt="Lesson Interface - Picking the correct word" style="border-radius: 10px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
  <img src="/public/screenshots/image-2.png" alt="Lesson Interface - Correct Answer Feedback" style="border-radius: 10px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
  <img src="/public/screenshots/image-3.png" alt="Lesson Map - Learning Journey" style="border-radius: 10px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
  <img src="/public/screenshots/image-4.png" alt="Lesson Completed - Success Screen" style="border-radius: 10px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
</div>

> _Images showcase the vibrant UI and interactive elements of the learning experience._

## 🏁 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/your-username/german-mastery.git
    cd german-mastery
    ```

2.  **Install dependencies**

    ```bash
    npm install
    # or
    pnpm install
    ```

3.  **Set up Environment Variables**
    Create a `.env.local` file in the root directory and add your Supabase credentials:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run the development server**

    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🤝 Contributing

Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

Made with ❤️ by [Your Name]
