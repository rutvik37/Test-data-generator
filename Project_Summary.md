# 🚀 Test data generator - Project Summary

This document provides a comprehensive overview of all features and functionalities implemented in the **Test data generator** application.

---

## 🛠️ 1. Core Feature: AI Data Engine
The heart of the application is a dynamic data generator that helps developers create realistic mock data for testing.
- **Custom Schema Builder**: Define your own data structure by adding fields and choosing from over 20+ data types (UUID, Full Name, Job Title, Product Category, etc.).
- **Quick Templates**: One-click templates for common scenarios like *User Profile*, *E-commerce*, and *Location Data*.
- **Bulk Generation**: Generate up to 100+ records at once with a single click.
- **Instant Preview**: A clean, paginated table to view your generated data before exporting.
- **Multi-Format Export**: Download your data as **JSON** or **CSV** for immediate use in your projects.

## 🔐 2. Custom Authentication System
A complete client-side authentication flow that ensures persistence without complex database overhead.
- **Sign In & Sign Up**: Secure flows for user registration and login.
- **Field Validation**: Robust checks for valid email formats and password matching.
- **Username Integration**: Personalized accounts with custom usernames.
- **Persistent Sessions**: Your login status is remembered across page refreshes using `localStorage`.

## 👤 3. Profile & Account Management
Users have full control over their identity within the platform.
- **Edit Profile**: Update your username or email address at any time.
- **Email Uniqueness**: The system automatically prevents duplicate email registrations across all accounts.
- **Dynamic Avatars**: Beautiful, color-coded profile images generated automatically based on your username.

## 🎨 4. Premium UI/UX Experience
A modern, responsive interface designed to feel fast and fluid.
- **Dark Mode**: A sleek dark theme restricted to logged-in users to encourage account creation.
- **Top-Side Toaster**: Real-time notifications for every action (success/error) appearing at the top of the screen with smooth animations.
- **Confirmation Modals**: Safety first! Important actions like **Logout** require a quick confirmation to prevent accidents.
- **Automatic Reset**: Logging out automatically reverts the UI to light mode for the next session.

## 📧 5. Automated Email Notifications
Real-world communication integrated directly into the workflow.
- **Nodemailer Integration**: A production-ready backend setup using SMTP (Gmail) to send real emails.
- **Welcome Emails**: Every new user automatically receives a professionally formatted **HTML welcome email** upon successful registration.
- **Secure Configuration**: Backend verification ensures the email service is ready before any attempts are made.

---

## 🏗️ Technical Architecture
- **Frontend**: React 18, TypeScript, TailwindCSS (Styling), Lucide-React (Icons).
- **Backend**: Node.js, Express, TypeScript (Faker.js for data, Nodemailer for emails).
- **Storage**: `localStorage` (Client-side persistence).
- **Tooling**: Vite (Fast HMR), Axios (API Communication).

---
*Created with ❤️ by Antigravity for the Test data generator Team.*
