# WebApp Simple Template

Una web app **volutamente semplice** che mette insieme, in un unico progetto, tutti i pezzi di una web app moderna:

| Pezzo | Tecnologia | Cosa fa qui |
|---|---|---|
| Frontend | **React** + TypeScript + Vite | L'interfaccia che si apre nel browser |
| Backend | **Python** + FastAPI | Le API: registrazione, login, veicoli |
| Database | **PostgreSQL** | Dove vengono salvati utenti e veicoli |
| Infrastruttura | **Docker** + Docker Compose | Avvia tutto con un solo comando |

## Perché esiste questo progetto

Nasce per **vedere il "giro completo"**: cosa succede da quando clicchi un bottone nel browser a quando il dato finisce in un database, e ritorna indietro. L'app fa poco di proposito (ti registri, fai login, gestisci una lista di veicoli), così si riesce a leggere e capire tutto.

L'idea è usarla come **base da far crescere**: `main` resta la versione semplice e funzionante, e ogni nuovo argomento da imparare viene aggiunto su un **branch dedicato** (vedi [Come estendere il progetto](#come-estendere-il-progetto)).

---

## Indice

1. [Avvio rapido (Docker)](#avvio-rapido-docker)
2. [Come funziona](#come-funziona)
3. [Struttura del progetto](#struttura-del-progetto)
4. [Sviluppo senza Docker](#sviluppo-senza-docker)
5. [Comandi utili](#comandi-utili)
6. [Cosa è semplificato di proposito](#cosa-è-semplificato-di-proposito)
7. [Come estendere il progetto](#come-estendere-il-progetto)
8. [Problemi comuni](#problemi-comuni)

---

## Avvio rapido (Docker)

**Requisiti:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) (include Docker Compose). Nient'altro: Python, Node e Postgres girano nei container.

**1. Crea il file `.env`** copiando l'esempio:

```bash
# Linux / macOS / Git Bash
cp .env.example .env
```
```powershell
# Windows PowerShell
Copy-Item .env.example .env
```

**2. Genera una chiave segreta** e incollala in `.env` al posto di `<incolla qui la key>`:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

La chiave serve a firmare i token di login (JWT). Se manca, Docker Compose si ferma e te lo dice.

**3. Avvia tutto (dalla root del progetto):**

```bash
docker compose up -d --build
```

La prima volta scarica le immagini e costruisce frontend e backend, quindi ci vuole qualche minuto.

**4. Apri l'app:** <http://localhost:8080>

Registra un utente, fai login, aggiungi qualche veicolo. Ricarica la pagina: i dati restano, perché sono nel database.

| Cosa | Indirizzo |
|---|---|
| App (frontend) | <http://localhost:8080> |
| API (backend) | <http://localhost:8000> |
| Documentazione API interattiva (Swagger) | <http://localhost:8000/docs> |
| Database PostgreSQL | `localhost:5432` (utente, password e db: `app`) |

**Per spegnere:** `docker compose down` (i dati restano nel volume `pgdata`).

---

## Come funziona

### I tre container

```
                  ┌───────────────────────────────┐
   Browser ─────► │ frontend (nginx)   :8080      │  file statici di React
      │           └───────────────────────────────┘
      │
      │  richieste HTTP/JSON
      ▼
┌──────────────────┐   rete interna   ┌──────────────────┐
│ backend (FastAPI)│ ───────────────► │ db (PostgreSQL)  │
│ :8000            │   host: "db"     │ :5432            │
└──────────────────┘                  └──────────────────┘
```

Un dettaglio che confonde spesso: **il frontend non "parla" con il backend**. nginx si limita a consegnare al browser i file di React. È poi il **browser** a chiamare direttamente l'API su `localhost:8000`. Per questo servono i **CORS** (vedi sotto) e per questo l'URL dell'API è `localhost` e non il nome del container.

I container si trovano tra loro per **nome**: il backend raggiunge il database con host `db`, non con `localhost`. Dentro un container, `localhost` è il container stesso.

### Il giro completo: aggiungere un veicolo

Seguire una singola azione dall'inizio alla fine è il modo migliore per capire come si incastra tutto:

1. **Click su "Aggiungi"** → il componente `AddVehicleForm` chiama `addVehicle` di `Vehicles.tsx`.
2. **axios** (`Frontend/src/api.ts`) invia `POST /vehicles` con `{"name": "..."}`. Un *interceptor* aggiunge in automatico l'header `Authorization: Bearer <token>`, preso dal `localStorage`.
3. **Il browser controlla i CORS.** Prima della POST manda una richiesta `OPTIONS` ("preflight") per chiedere al backend se l'origine `localhost:8080` è autorizzata. Il backend risponde sì perché è nella lista `CORS_ORIGINS`.
4. **FastAPI** riceve la richiesta in `routers/vehicles.py`. La route dichiara `Depends(get_current_active_user)`: prima di eseguire il codice, FastAPI decodifica il token JWT e carica l'utente. Se il token manca o è scaduto risponde `401` e la route non viene nemmeno eseguita.
5. **SQLAlchemy** crea un oggetto `Vehicle` legato all'utente (`owner_id`) e fa `INSERT` su PostgreSQL.
6. La risposta torna al browser. Il frontend **ricarica la lista** con `GET /vehicles` e React ridisegna la pagina.

### Autenticazione

1. **Registrazione** (`POST /auth/register`): la password viene trasformata in hash con **bcrypt**. La password in chiaro non viene mai salvata.
2. **Login** (`POST /auth/token`): il backend confronta la password con l'hash. Se è giusta crea un **JWT** firmato con `SECRET_KEY`, valido 30 minuti.
3. **Il frontend salva il token** nel `localStorage` e lo allega a ogni richiesta.
4. **Rotte protette:** il backend le protegge con `Depends(get_current_active_user)`; il frontend con il componente `RequireAuth`, che rimanda al login chi non ha un token. **La protezione vera è quella del backend**: quella del frontend serve solo a non mostrare pagine inutili, perché chiunque può modificare il codice che gira nel proprio browser.

### API

| Metodo | Percorso | Auth | Descrizione |
|---|---|---|---|
| `POST` | `/auth/register` | no | Crea un utente (`username`, `email`, `password`) |
| `POST` | `/auth/token` | no | Login (form `username` + `password`), restituisce il JWT |
| `GET` | `/users/me` | sì | Dati dell'utente loggato |
| `GET` | `/vehicles` | sì | Veicoli dell'utente loggato |
| `POST` | `/vehicles` | sì | Aggiunge un veicolo (`{"name": "..."}`) |

Puoi provarle senza il frontend da <http://localhost:8000/docs> (clicca "Authorize" dopo il login) oppure importando in Postman la collection in `docs/`.

### Il database

Le tabelle (`users`, `vehicles`) sono definite in `Backend/src/models.py` come classi Python (ORM con SQLAlchemy) e vengono create automaticamente all'avvio. I dati stanno nel volume Docker `pgdata`, quindi sopravvivono a `docker compose down`.

---

## Struttura del progetto

```
.
├── docker-compose.yml        # definisce i 3 servizi: db, backend, frontend
├── .env.example              # modello delle variabili d'ambiente (si copia in .env)
├── docs/                     # collection Postman per provare le API
│
├── Backend/                  # Python + FastAPI
│   ├── Dockerfile
│   ├── main.py               # crea l'app, configura i CORS, registra i router
│   ├── pyproject.toml        # dipendenze (gestite con uv)
│   └── src/
│       ├── database.py       # connessione al DB e sessione SQLAlchemy
│       ├── models.py         # tabelle (User, Vehicle)
│       ├── schemas.py        # forma dei dati in ingresso/uscita (Pydantic)
│       ├── auth/             # hash password, creazione e verifica JWT
│       └── routers/          # le rotte: auth.py, user.py, vehicles.py
│
└── Frontend/                 # React + TypeScript + Vite
    ├── Dockerfile            # build di Vite, poi servito da nginx
    ├── nginx.conf
    └── src/
        ├── App.tsx           # rotte, header, RequireAuth
        ├── api.ts            # client axios + chiamate al backend
        ├── contexts/         # AuthContext: token, utente, login, logout
        └── components/       # Login, Register, UserProfile, Vehicles...
```

**Un buon ordine per leggere il codice:** `Backend/main.py` → `routers/auth.py` → `auth/auth_handler.py` → `Frontend/src/api.ts` → `contexts/AuthContext.tsx` → `components/Login.tsx`.

---

## Sviluppo senza Docker

Utile quando modifichi il codice e vuoi il ricaricamento immediato. Il database può restare in Docker.

**Requisiti:** Python 3.12+, [uv](https://docs.astral.sh/uv/), Node 22+.

**1. Database** (solo il container `db`):

```bash
docker compose up -d db
```

**2. Backend** (porta 8000). In `Backend/`:

```powershell
uv sync
$env:PYTHONPATH = "src"
$env:DATABASE_URL = "postgresql+psycopg://app:app@localhost:5432/app"
uv run python main.py
```
```bash
# Linux / macOS
uv sync
PYTHONPATH=src DATABASE_URL=postgresql+psycopg://app:app@localhost:5432/app uv run python main.py
```

`PYTHONPATH=src` serve perché il codice importa i moduli come `from routers import user`. In PyCharm basta marcare la cartella `Backend/src` come *Sources Root* e impostare `DATABASE_URL` nella configurazione di esecuzione.

Se non imposti `DATABASE_URL`, il backend usa un file **SQLite** (`test.db`): comodo per provare, ma diverso dall'ambiente reale.

**3. Frontend** (porta 5173). In `Frontend/`:

```bash
npm install
npm run dev
```

Apri <http://localhost:5173>. Per i CORS questa origine è già autorizzata di default. Se avvii anche i container, ricorda che il backend in Docker occupa già la porta 8000: ferma quello (`docker compose stop backend`) prima di lanciare il tuo.

---

## Comandi utili

```bash
docker compose up -d --build     # costruisce e avvia tutto
docker compose ps                # stato dei container
docker compose logs -f backend   # log del backend in tempo reale
docker compose restart backend   # riavvia un servizio
docker compose down              # spegne tutto (i dati restano)
docker compose down -v           # spegne e CANCELLA il database

# guardare dentro il database
docker compose exec db psql -U app -d app -c "\dt"
docker compose exec db psql -U app -d app -c "select * from vehicles;"
```

Dopo aver modificato il **codice** di backend o frontend serve `--build`. Dopo aver modificato solo **variabili d'ambiente** basta `docker compose up -d`.

---

## Cosa è semplificato di proposito

Per tenere il progetto leggibile, alcune cose sono fatte nel modo più semplice. Sono tutte **occasioni di studio**:

- **Nessuna migrazione del database.** Le tabelle si creano con `create_all`, che non modifica quelle esistenti: se cambi un modello devi cancellare il volume (`down -v`). Nella pratica si usano le migrazioni (es. Alembic).
- **Il token è nel `localStorage`.** È comodo, ma leggibile da qualsiasi JavaScript della pagina (rischio XSS). Le alternative sono cookie `httpOnly` e refresh token.
- **Il token dura 30 minuti e non si rinnova.** Scaduto, devi rifare il login.
- **Nessun test automatico.**
- **Nessuna regola sulla password** e nessuna verifica dell'email.
- **La porta del database è esposta** sul tuo PC (`5432`) per comodità. In produzione non lo si fa.
- **Le tabelle si creano all'import dei moduli.** Funziona, ma di solito si fa in una fase di avvio esplicita.
- **Docker Compose solo per sviluppo.** Per la produzione servirebbero HTTPS, segreti gestiti a parte e altre accortezze.

---

## Come estendere il progetto

Il flusso di lavoro pensato per imparare:

- **`main`** resta sempre la versione semplice e funzionante.
- Per ogni argomento nuovo si crea un **branch** (`git checkout -b feature/nome`), si implementa, si prova.
- Si apre una **Pull Request** su GitHub anche se si lavora da soli: è un ottimo esercizio per leggersi il proprio diff e descrivere cosa si è fatto.

Qualche idea, più o meno in ordine di difficoltà:

| Branch suggerito | Cosa si impara |
|---|---|
| `feature/vehicles-crud` | Completare il CRUD: modifica e cancellazione (`PUT`/`DELETE`), e controllare che un utente non tocchi i veicoli di un altro |
| `feature/validation` | Validazione dei dati in ingresso (Pydantic) e nei form, messaggi d'errore chiari |
| `feature/tests-backend` | Test delle API con `pytest` e il client di test di FastAPI |
| `feature/alembic-migrations` | Migrazioni del database con Alembic al posto di `create_all` |
| `feature/vehicle-fields` | Aggiungere campi (marca, anno, targa): tocca modello, migrazione, schema, API e form |
| `feature/ci-github-actions` | Pipeline che lancia lint, build e test a ogni push |
| `feature/nginx-reverse-proxy` | Far passare le API da nginx (`/api`) così frontend e backend stanno sulla stessa origine e i CORS non servono più |
| `feature/refresh-token` | Cookie `httpOnly` e rinnovo del token |
| `feature/react-query` | Gestire le chiamate al server con TanStack Query invece di `useEffect` |
| `feature/pagination-search` | Paginazione, ricerca e ordinamento lato server |
| `feature/roles` | Ruoli (utente/admin) e permessi |
| `feature/prod-compose` | Configurazione di produzione: HTTPS, niente porte esposte, segreti, backup del DB |

---

## Problemi comuni

**"Server non raggiungibile" al login**
Quasi sempre è un problema di CORS: il browser blocca la risposta. Apri gli strumenti del browser (F12 → scheda *Rete*) e guarda la richiesta a `/auth/token`. Controlla che l'indirizzo da cui hai aperto l'app (es. `http://localhost:8080`) sia nella variabile `CORS_ORIGINS`, **senza spazi** tra gli elementi separati da virgola.

**`docker compose up` si ferma con "Imposta SECRET_KEY nel file .env"**
Non hai creato il file `.env` o la chiave è vuota. Vedi [Avvio rapido](#avvio-rapido-docker).

**`port is already allocated` / porta occupata**
Un altro programma usa la 8000, la 8080 o la 5432 (spesso un backend avviato in locale o un Postgres già installato). Fermalo, oppure cambia la mappatura nel `docker-compose.yml` (es. `"5433:5432"`).

**Ho modificato il codice ma non cambia nulla**
Nei container serve ricostruire: `docker compose up -d --build`.

**Ho cambiato `VITE_API_URL` e il frontend usa ancora il vecchio indirizzo**
L'URL viene inserito nel codice durante la *build*, non all'avvio: ricostruisci con `--build`.

**Errore sulle tabelle dopo aver cambiato un modello**
`create_all` non aggiorna le tabelle esistenti. In sviluppo: `docker compose down -v` e riparti (cancella i dati). In futuro: migrazioni.

**Dopo il riavvio devo rifare il login**
Se cambi `SECRET_KEY`, tutti i token già emessi diventano non validi.
