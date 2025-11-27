🎓 Student Registration Form – React + Tailwind

A modern, responsive, feature-rich Student Registration Form UI built using React, TailwindCSS, and Vite.
This project includes advanced UI enhancements such as profile photo upload, PDF export, toast notifications, and dark mode.


---

🌐 Live Demo

🔗 View Application:
https://student-registration-form-umber-zeta.vercel.app/

📦 GitHub Repository:
https://github.com/poojakalukhe2003/student-registration-form


---

✨ Features

🖼️ Profile Photo Upload + Preview

Live circular preview

Remove photo option

Supports JPG/PNG/WebP

Validates file type & size (max 2MB)


🎨 Premium UI (React + TailwindCSS)

Beautiful, clean, responsive design

Smooth animations & transitions

Warm Marathi-friendly color theme

Required field * indicators



🔔 Toast Notifications

Success & error toasts

Slide-in animations

Auto-dismiss + manual close


📄 Export Student Record as PDF

Capture submitted form using html2canvas

Generate PDF using jsPDF

Includes uploaded profile photo

High-resolution output


✔️ Form Validation

Email format validation

Phone number validation

Required field checks

Real-time error messages


🎯 Success Panel

Animated slide-down section

Shows submitted info + photo

PDF download button



---

🛠️ Tech Stack

Technology	Purpose

React	UI Framework
Vite	Fast Dev Server
TailwindCSS	Styling
JavaScript (ES6)	Logic
html2canvas	DOM → Image
jsPDF	PDF generation



---

📦 Installation

1. Clone the repository

git clone https://github.com/poojakalukhe2003/student-registration-form
cd student-registration-form

2. Install dependencies

npm install

3. Install PDF dependencies

npm install jspdf html2canvas

4. Start development server

npm run dev

App runs at:

http://localhost:5173


---

⚙️ Tailwind Configuration

Ensure your tailwind.config.js includes:

module.exports = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: { extend: {} },
  plugins: [],
};


---

📁 Folder Structure

student-registration-form/
│
├── src/
│   ├── components/
│   │   └── StudentRegistrationForm.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── public/
│
├── package.json
├── tailwind.config.js
└── README.md


---

🚀 How to Use

1️⃣ Fill the student details
2️⃣ Upload a profile photo
3️⃣ Click Register
4️⃣ View animated success panel
5️⃣ Download student PDF
6️⃣ Toggle between light & dark modes