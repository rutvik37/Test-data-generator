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
A secure, full-stack authentication flow managed by a custom Node.js backend.
- **Sign Up with OTP**: Secure registration flow requiring a 6-digit OTP verification sent to the user's email.
- **Login Flexibility**: Users can securely sign in using either their **Email or Username**.
- **Data Validation & Constraints**: Strict backend enforcement of case-insensitive uniqueness for both emails and usernames.
- **Security Best Practices**: Passwords are cryptographically hashed using SHA-256 before storage.

## 👤 3. Profile & Account Management
Users have full control over their identity within the platform.
- **Edit Profile**: Update your username or email address at any time.
- **Global Uniqueness**: The system automatically prevents duplicate email or username registrations across all accounts (case-insensitive).
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
- **OTP Verification**: Users receive dynamic, HTML-formatted verification codes containing their registered username and email to verify their accounts.
- **Secure Configuration**: Backend verification ensures the email service is ready before any attempts are made.

---

## 🏗️ Technical Architecture
- **Frontend**: React 18, TypeScript, TailwindCSS (Styling), Lucide-React (Icons).
- **Backend**: Node.js, Express, TypeScript, custom SHA-256 cryptography.
- **Storage**: JSON File-based Data Store (`users.json`) on the backend.
- **Tooling**: Vite (Fast HMR), Axios (API Communication), Nodemailer (Emails), Faker.js (Mock Data).

---
*Created with ❤️ by Rutvik jasani for the Test data generator Team.*
