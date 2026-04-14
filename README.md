# PulseTrade AI - Realtime Stock Price Prediction Platform

PulseTrade AI is a full-stack stock market dashboard built for realtime trend monitoring, stock prediction, historical analysis, investment planning, and bot-assisted recommendations.

## Features

- Login page with email and password authentication
- Sign up page that stores users in MySQL
- Dashboard with saved stocks, live trend cards, realtime predictions, gainers, losers, and alerts
- Stock discovery page to add symbols into a saved live watchlist
- History page with advanced charts for price, prediction, sentiment, support, and resistance
- Analysis page to estimate quantity to buy, invested capital, projected value, and profit
- Realtime bot for buy or sell notifications, market open-close alerts, long-term suggestions, next-day top 5 picks, and persistent chat history
- Socket.IO powered realtime feed that can use live market data from Twelve Data and safely falls back to simulation when no API key is configured

## Tech Stack

- Frontend: React, Vite, Recharts, Framer Motion, Socket.IO client
- Backend: Node.js, Express, Socket.IO, JWT authentication
- Database: MySQL
- Live market provider: Twelve Data API via server-side fetch

## Setup

1. Create the database using `database/schema.sql`.
2. Copy `backend/.env.example` to `backend/.env` and update MySQL credentials.
3. Optional but recommended: set `TWELVE_DATA_API_KEY` in `backend/.env` for real market quotes and historical candles.
4. Install dependencies:
   - `npm install`
   - or install each app separately with `cd backend && npm install` and `cd frontend && npm install`
5. Start the full project:
   - `npm run dev`
   - or run backend and frontend separately if preferred

## Notes

- If `TWELVE_DATA_API_KEY` is configured, the backend refreshes live quotes and time-series data and uses them to generate predictions.
- If no market API key is configured, the application still runs end to end using the simulation fallback engine.
- Chat questions are stored in MySQL table `bot_queries` for future bot improvement and auditing.
