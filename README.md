# SkillBridge

Bridging the Gap Between Talent and Opportunity.

SkillBridge is a modern, full-stack freelance marketplace designed to connect clients with talented freelancers in a seamless and real-time environment. From project posting and bidding to a dedicated project workspace with live chat, SkillBridge provides a complete ecosystem for managing freelance work from start to finish.

*<p align="center">Replace this with a screenshot of your application's dashboard.</p>*

---

## ✨ Key Features

* **Role-Based Authentication:** Secure JWT-based authentication with separate dashboards and permissions for **Clients**, **Freelancers**, and **Admins**.
* **Project Posting & Browse:** Clients can post detailed project listings, and freelancers can browse, search, and filter available projects.
* **Bidding System:** Freelancers can submit detailed proposals and bids on projects that match their skills.
* **Real-time Chat Workspace:** Once a bid is accepted, a dedicated project workspace is created, featuring a live chat built with **Socket.IO** for seamless client-freelancer communication.
* **Complete Project Workflow:** A robust status system (`Open` -> `Active` -> `Pending Approval` -> `Completed`/`Active`) manages the entire project lifecycle, including submission, approval, and rejection flows.
* **Comprehensive Admin Panel:** An admin dashboard to oversee and manage all users, projects, and applications on the platform.
* **Modern, Responsive UI:** A stunning, fully responsive user interface built with **Tailwind CSS**, featuring a cinematic dark mode theme and smooth transitions.

---

## 🛠️ Built With

This project is built on the MERN stack with modern tools for a real-time, high-performance experience.

**Frontend:**
* [React.js](https://reactjs.org/)
* [Tailwind CSS](https://tailwindcss.com/)
* [React Router](https://reactrouter.com/)
* [Socket.IO Client](https://socket.io/docs/v4/client-api/)
* [Axios](https://axios-http.com/)

**Backend:**
* [Node.js](https://nodejs.org/)
* [Express.js](https://expressjs.com/)
* [MongoDB](https://www.mongodb.com/) (with Mongoose)
* [Socket.IO](https://socket.io/)
* [JSON Web Token (JWT)](https://jwt.io/)
* [bcrypt.js](https://github.com/kelektiv/bcrypt.js) for password hashing

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have the following installed on your machine:
* Node.js (v18.x or higher)
* npm (or yarn)
* MongoDB (local instance or a URI from MongoDB Atlas)

### Installation

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/your-username/skillbridge.git](https://github.com/your-username/skillbridge.git)
    cd skillbridge
    ```

2.  **Backend Setup:**
    ```sh
    cd server
    npm install
    ```
    Create a `.env` file in the `server` directory and add the following variables:
    ```env
    PORT=4000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_super_secret_jwt_key
    FRONTEND_URL=http://localhost:5173
    ```
    Start the backend server:
    ```sh
    npm run dev
    ```

3.  **Frontend Setup:**
    ```sh
    # From the root directory
    cd client
    npm install
    ```
    Create a `.env.local` file in the `client` directory and add the API URL:
    ```env
    VITE_API_URL=http://localhost:4000
    ```
    Start the frontend development server:
    ```sh
    npm run dev
    ```

Your application should now be running, with the frontend at `http://localhost:5173` and the backend at `http://localhost:4000`.
---
