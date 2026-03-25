# mypelantikan-ui

Frontend UI for the Pelantikan application, built with Vue 3 and Skote.

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:

- [Node.js](https://nodejs.org/) (Recommended version: 16.x or higher)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- [Git](https://git-scm.com/)

## Installation Steps (Localhost)

Follow these steps to set up and run the project locally:

### 1. Clone the Repository
Open your terminal/command prompt and clone this repository:
```bash
git clone <repository-url>
cd mypelantikan-ui
```

### 2. Install Dependencies
Run the following command to install all necessary Node.js packages:
```bash
npm install
```

### 3. Configure Environment Variables
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

### 4. Run the Development Server
Start the local development server with:
```bash
npm run serve
```
Once the process is complete, you can access the application at `http://localhost:8080/`.

## Available Scripts

### `npm run serve`
Runs the app in development mode. Open [http://localhost:8080](http://localhost:8080) to view it in the browser. The page will reload if you make edits.

### `npm run build`
Builds the app for production to the `dist` folder. It correctly bundles Vue in production mode and optimizes the build for the best performance.

### `npm run lint`
Lints and fixes files in the `src` and `tests` directories.

## Project Structure
- `src/components`: Reusable UI components.
- `src/views`: Page components for different routes.
- `src/services`: API service layers for communicating with the backend.
- `src/router`: Navigation and routing configuration.
- `src/state`: Pinia store for state management.
