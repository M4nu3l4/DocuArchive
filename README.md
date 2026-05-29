# DocuArchive

## Descrizione

DocuArchive è un sistema di gestione documentale sviluppato con ASP.NET Core Web API e React.

L'applicazione consente di archiviare, classificare, assegnare e tracciare documenti aziendali attraverso un sistema multiutente basato su ruoli.

Le principali funzionalità includono:

* gestione documenti e allegati;
* gestione aziende/clienti;
* gestione categorie;
* gestione workflow documentali;
* assegnazione pratiche;
* presa in carico e rilascio pratiche;
* notifiche operative;
* audit log completo;
* gestione utenti e ruoli;
* autenticazione JWT;
* supporto multilingua italiano/inglese;
* tema chiaro/scuro.
* spinner per caricamento dati, modali di conferma all'utente, responsive.

---

# Tecnologie Utilizzate

## Backend

* ASP.NET Core 8 Web API
* Entity Framework Core 8.0.7
* SQL Server
* ASP.NET Core Identity
* JWT Bearer Authentication
* Swagger / OpenAPI

## Frontend

* React
* Vite
* React Router
* Axios
* Bootstrap 5
* React Toastify

---

# Struttura del Progetto

Frontend e Backend sono inclusi nella stessa cartella di progetto.

```text
DocuArchive
│
├── Backend
│   ├── Controllers
│   ├── Data
│   ├── DTOs
│   ├── Models
│   ├── Migrations
│   ├── Services
│   ├── wwwroot
│   ├── Program.cs
│   └── appsettings.json
│
└── Frontend
    ├── src
    ├── public
    ├── package.json
    └── vite.config.js
```

---

# Requisiti

Per eseguire il progetto sono necessari:

* Visual Studio 2022
* .NET SDK 8
* SQL Server oppure SQL Server Express / LocalDB
* SQL Server Management Studio (consigliato)
* Node.js
* npm
* Visual Studio Code (opzionale)

---

# Configurazione Database

Configurare la connection string all'interno del file:

```text
appsettings.json
```

Esempio LocalDB:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=(localdb)\\MSSQLLocalDB;Database=DocuArchiveDb;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

Esempio SQL Server:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=DocuArchiveDb;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

---

# Creazione del Database

Le migration Entity Framework sono già incluse nel progetto.

Aprire la Package Manager Console di Visual Studio:

```powershell
Update-Database
```

oppure utilizzare il terminale:

```bash
dotnet ef database update
```

Il comando creerà automaticamente:

* tabelle ASP.NET Identity
* ruoli
* utenti
* documenti
* categorie
* aziende/clienti
* workflow documentali
* notifiche
* audit log

---

# Ambiente di Sviluppo

Il progetto è stato sviluppato utilizzando:

* .NET 8
* ASP.NET Core 8
* Entity Framework Core 8.0.7
* SQL Server
* React
* Vite

Le migration e gli aggiornamenti del database sono stati gestiti tramite la Package Manager Console (NuGet Package Manager Console) di Visual Studio utilizzando Entity Framework Core 8.0.7.

---

# Credenziali Demo

Per facilitare la valutazione del progetto sono stati predisposti utenti con ruoli differenti.

## SuperAdmin Principale

Email:

```text
admin@docuarchive.local
```

Password:

```text
Admin123!
```

Permessi:

* gestione utenti
* creazione utenti
* modifica ruoli
* attivazione/disattivazione utenti
* assegnazione pratiche
* audit globale
* gestione documenti
* gestione categorie
* gestione aziende/clienti
* gestione workflow
* notifiche

---

## SuperAdmin Secondario

Email:

```text
aldo.baglio@docuarchive.local
```

Password:

```text
Prova.123
```

Permessi:

* gestione utenti
* modifica ruoli
* attivazione/disattivazione utenti
* assegnazione pratiche
* audit globale
* notifiche

---

## Admin

Email:

```text
mario.rossi@docuarchive.local
```

Password:

```text
Prova.123
```

Permessi:

* gestione documenti
* assegnazione pratiche
* presa in carico pratiche
* rilascio pratiche
* visualizzazione utenti per assegnazione
* audit personale
* notifiche

---

## Operatore 1

Email:

```text
sabrina.bianchi@docuarchive.local
```

Password:

```text
Prova.123
```

Permessi:

* visualizzazione pratiche assegnate
* presa in carico pratica
* rilascio pratica
* visualizzazione notifiche
* audit personale

---

## Operatore 2

Email:

```text
giovanna.darco@docuarchive.local
```

Password:

```text
Prova.123
```

Permessi:

* visualizzazione pratiche assegnate
* presa in carico pratica
* rilascio pratica
* visualizzazione notifiche
* audit personale

---

# Avvio Backend

Aprire la cartella del backend ed eseguire:

```bash
dotnet restore
dotnet run
```

Swagger sarà disponibile all'indirizzo:

```text
https://localhost:7292/swagger
```

---

# Avvio Frontend

Aprire la cartella frontend ed eseguire:

```bash
npm install
npm run dev
```

L'applicazione sarà disponibile all'indirizzo:

```text
http://localhost:5173
```

---

# Configurazione Frontend

Verificare che il file Axios utilizzi correttamente l'indirizzo del backend:

```javascript
baseURL: "https://localhost:7292/api"
```

---

# Funzionalità Implementate

## Gestione Utenti

* autenticazione JWT
* gestione ruoli
* attivazione/disattivazione utenti
* gestione preferenze utente
* supporto multilingua

## Gestione Documenti

* creazione documento
* modifica documento
* eliminazione documento
* upload allegati
* download allegati
* ricerca e filtri

## Workflow Documentale

* assegnazione pratiche
* cambio assegnatario
* presa in carico pratica
* rilascio pratica
* gestione stati workflow

## Audit Log

Tracciamento delle principali attività:

* creazione documento
* modifica documento
* eliminazione documento
* assegnazione pratica
* presa in carico
* rilascio
* download documento

## Notifiche

* notifica assegnazione pratica
* elenco notifiche utente
* marcatura notifiche come lette

## Dashboard Operativa

* pratiche assegnate
* pratiche in lavorazione
* audit personale
* audit globale (SuperAdmin)
* notifiche operative

---

# Flusso di Test Consigliato

Per verificare rapidamente tutte le funzionalità:

1. Accedere come SuperAdmin.
2. Creare o selezionare una pratica esistente.
3. Assegnare la pratica a Mario Rossi oppure Sabrina Bianchi.
4. Effettuare il logout.
5. Accedere con l'utente assegnatario.
6. Aprire la sezione "Le mie pratiche".
7. Prendere in carico la pratica.
8. Verificare la registrazione dell'attività nell'audit log.
9. Tornare con il SuperAdmin.
10. Verificare audit globale e notifiche.

Funzionalità testate:

* autenticazione JWT;
* gestione ruoli;
* assegnazione pratiche;
* presa in carico;
* rilascio;
* notifiche;
* audit log;
* controllo permessi.

---

# Scelte Tecniche

Il backend è stato sviluppato utilizzando ASP.NET Core Web API con Entity Framework Core e SQL Server.

Per la gestione degli utenti è stato utilizzato ASP.NET Core Identity con autenticazione JWT.

La struttura del backend segue una separazione tra:

* Controllers
* DTOs
* Models
* DbContext

Il frontend React utilizza:

* componenti riutilizzabili;
* servizi Axios dedicati;
* React Router;
* Bootstrap;
* gestione centralizzata dell'autenticazione.

Particolare attenzione è stata dedicata a:

* sicurezza;
* autorizzazioni basate sui ruoli;
* tracciabilità delle operazioni;
* gestione del workflow documentale;
* separazione delle responsabilità.

---

# Possibili Evoluzioni Future

Il progetto può essere esteso con:

* notifiche realtime tramite SignalR;
* esportazione PDF/Excel dei log;
* dashboard statistiche avanzate;
* upload multiplo documenti;
* ricerca avanzata audit log;
* storico versioni documento;
* reset password;
* cambio password utente.

---

# Stato del Progetto

La versione attuale implementa tutte le funzionalità richieste per un sistema di gestione documentale multiutente con:

* ruoli;
* workflow;
* assegnazione pratiche;
* audit log;
* notifiche;
* gestione utenti;
* autenticazione JWT.

Il progetto è pronto per essere eseguito, testato e valutato seguendo le istruzioni riportate in questo documento.
