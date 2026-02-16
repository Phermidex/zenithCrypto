# Zenith Crypto Wallet

Zenith is a modern, secure, and user-friendly cryptocurrency wallet application built with Next.js and Firebase. It allows users to manage their crypto assets, buy and send cryptocurrencies, and handle their payment methods securely.

## Tech Stack

-   **Framework:** Next.js with App Router
-   **UI:** React, TypeScript, ShadCN UI, Tailwind CSS
-   **Backend & Database:** Firebase (Authentication, Firestore)
-   **Styling:** Tailwind CSS
-   **Form Management:** React Hook Form & Zod

---

## Local Development Setup

To run this project on your local machine, follow these steps:

### Prerequisites

-   Node.js (v18 or later recommended)
-   npm or yarn
-   A Firebase project. If you don't have one, create one at the [Firebase Console](https://console.firebase.google.com/).

### 1. Clone the Repository

Clone this repository to your local machine.

```bash
git clone <your-repository-url>
cd <repository-name>
```

### 2. Install Dependencies

Install the necessary packages using npm or yarn.

```bash
npm install
```

### 3. Configure Firebase

You need to connect the application to your Firebase project.

1.  Navigate to your project in the [Firebase Console](https://console.firebase.google.com/).
2.  Go to **Project Settings** > **General**.
3.  Under "Your apps", select the web app (or create a new one if it doesn't exist).
4.  Choose **Config** for the SDK setup and copy the `firebaseConfig` object.
5.  Paste this object into `src/firebase/config.ts`, replacing the existing placeholder.

### 4. Enable Firebase Services

1.  **Authentication:** In the Firebase Console, go to the **Authentication** section. Click "Get started" and enable the **Email/Password** sign-in provider.
2.  **Firestore:** Go to the **Firestore Database** section. Click "Create database" and start in **production mode**. You will need to update the security rules.

### 5. Update Firestore Security Rules

Copy the contents of the `firestore.rules` file from the project root and paste them into the **Rules** tab of your Firestore database in the Firebase Console. Click "Publish".

### 6. Run the Development Server

Start the Next.js development server.

```bash
npm run dev
```

The application will be available at `http://localhost:9002`.

---

## Production Deployment on Google Cloud (Firebase App Hosting)

This project is configured for easy deployment using [Firebase App Hosting](https://firebase.google.com/docs/app-hosting).

### Prerequisites

-   [Firebase CLI](https://firebase.google.com/docs/cli) installed and authenticated (`firebase login`).
-   Your local code is connected to your Firebase project (`firebase use <your-project-id>`).

### Deployment Steps

1.  **Build the Project:**
    Create a production-ready build of your Next.js application.
    ```bash
    npm run build
    ```

2.  **Deploy to Firebase:**
    Deploy the application using the Firebase CLI. The `apphosting.yaml` file in the root directory tells Firebase how to deploy and manage your app.
    ```bash
    firebase apphosting:backends:deploy
    ```
    Follow the prompts from the CLI. It will guide you through creating a backend resource if one doesn't exist and deploying your code.

After deployment, the CLI will provide you with the URL where your application is live.

---

## Usuario Administrador

Para que puedas probar, puedes registrar un nuevo usuario con las siguientes credenciales:
Email: admin@zenith.com
Contraseña: password123
