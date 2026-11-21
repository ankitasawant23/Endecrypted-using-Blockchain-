# CipherChain Web

Modern React frontend for the CipherChain encryption platform.

## Run locally

Initialize MariaDB and create the application database:

```bash
cd database
chmod +x setup.sh
./setup.sh
```

Start the backend first:

```bash
cd backend
npm install
npm start
```

The backend must listen on port `5000` and require working MySQL environment variables.

Then start the frontend:

```bash
cd web
npm install
npm run dev
```

Open `http://localhost:5173`.
