## Frontend Template
Applicazione React di base per la gestione di veicoli con funzionalita di login e registrazione

### Stack Tecnologico
- React 19, Typescript
- Vite
- React Router 7
- Axios

### Requisiti
- Node.js
- Backend in esecuzione sulla 8000

### Installazione e avvio

1. npm install
2. npm run dev

#### Configurazione
In src/api.js e` scritto l'URL del backend, se necessario modificarlo.
#### Autenticazione
Flusso: Login, salvataggio del token in localstorage, aggiunta automatica dell'header Authorization: Bearer ... tramite interceptor axios.
