<p align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/9/94/Jata_MalaysiaV2.svg" 
       alt="MyPelantikan Logo" 
       width="60" style="vertical-align:middle;" />
</p>

# <p align="center">MyPelantikan - Frontend</p>

The frontend UI for the MyPelantikan application, built with **Vue 3** and **Skote**. It provides a modern, responsive interface for profile management and service history.

## ✨ Features

- **Vue 3 & Vite**: Fast development and optimized production builds.
- **Skote Dashboard Template**: Professional and clean UI components.
- **Dynamic Form Builder**: Easily create and manage forms.
- **Editable Data Tables**: Built-in support for filtering, sorting, and grouping.
- **State Management**: Using Pinia for reliable state handling.
- **Auth Integration**: Supports both fake backend and real API authentication.

## 📁 Project Structure

```bash
front-end/
├── src/
│   ├── assets/       # Styles, images, and fonts
│   ├── components/   # Reusable UI components
│   ├── views/        # Page components
│   ├── router/       # Navigation configuration
│   ├── state/        # Pinia stores
│   ├── layouts/      # Main application layouts
│   └── services/     # API interaction layers
├── public/           # Static assets
└── package.json
```

## ⚙️ Installation

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (Recommended version: 16.x or higher)
- [npm](https://www.npmjs.com/)

### 1. Install Dependencies
Navigate to the frontend directory and install the necessary packages:
```bash
cd front-end
npm install --peer legacy
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory. You can copy the contents from `.env.production` as a starting point:
```bash
cp .env.production .env
```

Open the `.env` file and adjust the following variables:

#### Authentication Modes
The project supports different authentication modes via `VUE_APP_DEFAULT_AUTH`:
- **Fake Backend (Default)**: Set `VUE_APP_DEFAULT_AUTH=fakebackend`. This allows you to log in without a real API using:
  - **Email**: `admin@themesbrand.com`
  - **Password**: `123456`
- **Real Backend**: Set `VUE_APP_DEFAULT_AUTH=authservice` (or as configured in your services) and provide the `VUE_APP_APIKEY`.

#### API Configuration
- `VUE_APP_APIKEY`: The base URL of your API (e.g., `http://127.0.0.1:8000/api/v1/`)
- `VUE_GAMBAR_URL`: The storage URL for images (e.g., `http://127.0.0.1:8000/storage`)

### 3. Run the Development Server
Start the local development server with:
```bash
npm run serve
```
Once the process is complete, you can access the application at `http://localhost:8080/`.

## 🚀 Available Scripts

### `npm run serve`
Runs the app in development mode.

### `npm run build`
Builds the app for production to the `dist` folder.

### `npm run lint`
Lints and fixes files in the `src` and `tests` directories.

## 👨‍💻 Author
Luqman Hafiz  
Full Stack Developer (Vue + Laravel)
