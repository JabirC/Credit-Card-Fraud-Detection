# Credit-Card-Fraud-Detection

End to end credit card fraud detection system


# Next.js + React Frontend: How to run it on your own machine

This project is a **Next.js** + **React** frontend application. Follow the instructions below to get it up and running locally.

cd to frontend/credit-card-transaction-dashboard

## Prerequisites

Before running the project locally, ensure that you have the following installed:

1. **Node.js** (LTS version recommended)  
   [Download Node.js](https://nodejs.org/)  
   Ensure `npm` (Node Package Manager) is also installed with Node.js.

2. **Git**  
   [Download Git](https://git-scm.com/)

3. **Text Editor/IDE**  
   You can use any text editor or IDE such as **Visual Studio Code**, **Atom**, or **WebStorm**.

## Getting Started

Follow these steps to set up the project locally.

### 1. Install npm packagages

Open your terminal and run the following command to clone the repository:

```bash
npm install
```

This command installs all dependencies listed in the package.json file.

### 2. Set Up Environment Variables

A Groq api will be required. Create a .env file in the root directory of the NextJS project and define the required environment variable.

Example:

```
NEXT_PUBLIC_GROQ_API_KEY=your-groq-api-key
```

### 3. Running the Development Server

Start the development server by running:

```
npm run dev
```

This will start the Next.js development server at http://localhost:3000/. Open your browser and visit this URL to view the application.

The server will automatically reload when changes are made to the code.
