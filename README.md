# AI Software Engineer Agent

A full-stack AI-powered code analysis platform built with **Spring Boot** (backend) + **React + Vite** (frontend).

---

## 🚀 Features

- **Repository Scanner** — Clone any GitHub repo and auto-run AI analysis
- **AI Code Review** — General review, bug detection, security audit, documentation generation
- **AI Chat** — Chat with your codebase (RAG-style with code context)
- **Real-time Status** — WebSocket-powered live scan progress
- **JWT Authentication** — Secure login & signup
- **Analytics Dashboard** — Charts for repo status, report counts, activity over time

---

## ⚙️ Setup

### Prerequisites

| Tool        | Version  |
|-------------|----------|
| Java        | 21+      |
| Maven       | 3.9+     |
| PostgreSQL  | 14+      |
| Node.js     | 20+ (auto-downloaded by Maven build) |
| Git         | any      |

---

### 1. PostgreSQL

```sql
CREATE DATABASE ai_engineer_db;
```

---

### 2. Configure `application.properties`

Edit `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/ai_engineer_db
spring.datasource.username=postgres
spring.datasource.password=YOUR_DB_PASSWORD

openai.api.key=sk-YOUR_OPENAI_KEY_HERE
```

Get your OpenAI key at: https://platform.openai.com/api-keys

---

### 3. Run in IntelliJ IDEA

1. Open IntelliJ IDEA → **File → Open** → select the `ai-engineer-agent` folder
2. IntelliJ will auto-detect the Maven project
3. Wait for Maven to download dependencies
4. Run `AiEngineerAgentApplication` main class

The app will:
- Build the React frontend automatically (first run takes ~2 min to download Node)
- Start Spring Boot on **http://localhost:8080**
- Serve the React app at **http://localhost:8080**

---

### 4. Development Mode (Hot-reload frontend)

For frontend development with hot reload, open a terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend dev server: **http://localhost:5173**  
It proxies all `/api` calls to `http://localhost:8080`

---

## 📁 Project Structure

```
ai-engineer-agent/
├── src/main/java/com/aiagent/
│   ├── ai/                    # AIService, PromptManager
│   ├── config/                # SecurityConfig, AppConfig, SpaController
│   ├── controller/            # REST: Auth, Repository, AI
│   ├── dto/                   # Request/Response DTOs
│   ├── entity/                # JPA Entities
│   ├── repository/            # Spring Data repositories
│   ├── security/              # JWT filter & service
│   ├── service/               # AuthService, RepositoryService, GitCloneService, FileScannerService
│   └── websocket/             # WebSocket chat handler
├── src/main/resources/
│   └── application.properties
├── frontend/                  # React + Vite + Tailwind
│   ├── src/
│   │   ├── pages/             # LoginPage, SignupPage, Dashboard, Repositories, Chat, Analytics
│   │   ├── components/        # Layout, StatusBadge
│   │   ├── services/          # api.js (Axios)
│   │   └── store/             # Zustand auth store
│   ├── package.json
│   └── vite.config.js
└── pom.xml
```

---

## 🔌 API Endpoints

| Method | URL                         | Auth | Description              |
|--------|-----------------------------|------|--------------------------|
| POST   | /api/auth/register          | No   | Register new user        |
| POST   | /api/auth/login             | No   | Login, returns JWT       |
| POST   | /api/repositories/scan      | Yes  | Clone + scan a repo      |
| GET    | /api/repositories           | Yes  | List user's repos        |
| GET    | /api/repositories/{id}      | Yes  | Repo detail + reports    |
| DELETE | /api/repositories/{id}      | Yes  | Delete repo              |
| POST   | /api/ai/review              | Yes  | Run AI analysis          |
| GET    | /api/ai/reports/{repoId}    | Yes  | Get AI reports           |
| POST   | /api/ai/chat                | Yes  | Chat with AI             |
| GET    | /api/ai/chat/history        | Yes  | Get chat history         |
| WS     | /ws/chat                    | JWT  | WebSocket chat           |

---

## 🛠️ Tech Stack

**Backend:** Spring Boot 3.2, Spring Security, JWT, JPA/Hibernate, PostgreSQL, OkHttp, WebSocket  
**Frontend:** React 18, Vite, Tailwind CSS, React Query, Zustand, Recharts, Framer Motion  
**AI:** OpenAI GPT-4o via REST API
