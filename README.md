# JalnaCare

JalnaCare is a Jalna-first healthcare discovery and appointment platform designed to help patients connect with trusted providers across the city. The project keeps the working MERN architecture of the original app while transforming it into an original local healthcare marketplace for Jalna, Maharashtra.

## 🛠️ Tech Stack

- Frontend: React.js
- Backend: Node.js, Express.js
- Database: MongoDB
- Payments: Stripe and Razorpay (optional for MVP setup)
- Authentication: JWT

## 🔑 Product Focus

JalnaCare helps people in Jalna find and book appointments with:

- General physicians
- Physiotherapists
- Dentists
- Orthopedic specialists
- Dermatologists
- Pediatricians
- Gynecologists
- ENT specialists
- Clinics and healthcare providers

## 🏠 Jalna-first Homepage

This app is being adapted into a healthcare discovery platform for local users in Jalna, rather than a generic builder-style doctor app. The homepage is being redesigned to highlight:

- trusted care in Jalna
- local specialist categories
- provider discovery
- easy appointment booking
- clinic and healthcare provider visibility

## 🌐 Project Setup

1. Clone the repository
   ```bash
   git clone https://github.com/your-username/jalnacare.git
   cd jalnacare
   ```

2. Install dependencies
   ```bash
   npm install
   cd frontend && npm install
   cd ../admin && npm install
   cd ../backend && npm install
   ```

3. Add environment variables
   - Copy backend/.env.example to backend/.env
   - Add your actual local configuration values

4. Run the application
   ```bash
   cd backend
   npm start
   cd ../frontend
   npm run dev
   cd ../admin
   npm run dev
   ```

## 📦 Project Structure

```plaintext
jalnacare-healthcare-platform/
├── frontend/       # Patient frontend
├── admin/          # Admin dashboard
├── backend/        # Express API + MongoDB logic
├── README.md
├── .gitignore
└── package-lock.json
```

## 🤝 Notes

This project is being evolved from a generic appointment starter into an original JalnaCare healthcare brand. The existing workflow is retained where useful, but the branding and user-facing experience is being rewritten for a local healthcare marketplace.

---

