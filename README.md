**Resume entry:**

---

**IAmagochi – AI-Powered Virtual Pet Web App** | github.com/alfonsandrade/iamagochi

Built a generative AI-driven virtual pet web application using HTML, CSS, and JavaScript on the frontend, with a Python FastAPI backend serving a LLAMA 3.2 model via Ollama containerized in Docker. Engineered prompt architecture for context-aware, state-driven pet responses and implemented a calendar system to restrict interactions during user-defined busy periods.

---

**README:**

---

# IAmagochi

An AI-powered virtual pet web application that uses generative AI to deliver dynamic, context-aware interactions. Designed to encourage healthy screen habits by restricting engagement during user-defined study and sleep periods.

## Features

- Generative AI responses via LLAMA 3.2, adapting to the pet's emotional and physical state
- Interactive calendar to block pet interactions during busy hours
- Real-time status tracking: hunger, happiness, energy, and mood
- Pet customization: name, species, and personality attributes
- Simulated typing animation for chat responses
- Responsive layout supporting desktop and mobile browsers

## Tech Stack

| Layer | Stack |
|---|---|
| Frontend | HTML, CSS (Grid/Flexbox), JavaScript |
| Backend | Python, FastAPI, Uvicorn |
| AI Model | LLAMA 3.2 via Ollama |
| Infrastructure | Docker, ZeroTier, Apache |

## Architecture

The frontend communicates with a FastAPI service that proxies requests to an Ollama container running LLAMA 3.2. Services are orchestrated via Docker on a private network exposed through ZeroTier. API access is restricted by IP allowlist.

## Getting Started

### Prerequisites

- Docker and Docker Compose
- ZeroTier account (for remote access)
- Modern browser

### Setup

```bash
git clone https://github.com/alfonsandrade/iamagochi.git
cd iamagochi
docker compose up -d
```

Open `index.html` in your browser and connect to the configured API endpoint.

## Usage

1. Create your pet — define name, species, and personality
2. Interact via chat — the pet responds based on its current state
3. Feed and play using action buttons to update pet attributes
4. Configure the calendar to restrict interactions during study or sleep hours

## License

[Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/)
