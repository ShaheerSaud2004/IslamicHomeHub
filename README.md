# Muslim News Aggregator

A comprehensive web application that collects, categorizes, and summarizes Islamic news from multiple sources worldwide using Firecrawl and AI.

## Features

🌍 **Multi-Source News Collection**: Automatically scrapes news from major Islamic news websites
📊 **AI-Powered Categorization**: Automatically categorizes news into sections (Religious, Politics, Community, Education, etc.)
📝 **Smart Summarization**: AI-generated summaries for quick reading
🗺️ **Country-Based Organization**: News organized by country and region
🔍 **Advanced Search**: Search and filter by category, country, date, and keywords
⚡ **Real-Time Updates**: Automated news collection with configurable intervals
📱 **Responsive Design**: Modern, mobile-friendly interface

## News Sources

- Al Jazeera (Religion Section)
- IslamOnline
- Islamic Society of North America (ISNA)
- Middle East Eye
- Arab News
- And more...

## Technology Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Node.js, Express API Routes
- **Database**: MongoDB
- **Web Scraping**: Firecrawl
- **AI Services**: OpenAI GPT for categorization and summarization
- **Scheduling**: Node-cron for automated scraping

## Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd muslim-news-aggregator
npm install
```

### 2. Environment Configuration

```bash
cp .env.example .env
```

Edit `.env` with your API keys:
- Get Firecrawl API key from: https://firecrawl.dev
- Get OpenAI API key from: https://platform.openai.com
- Set up MongoDB (local or cloud)

### 3. Database Setup

```bash
npm run setup-db
```

### 4. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

### 5. Run News Scraper

```bash
npm run scrape
```

## Usage

### Manual Scraping
Run the scraper manually to collect latest news:
```bash
npm run scrape
```

### Automated Scraping
The system automatically scrapes news every hour (configurable in .env)

### API Endpoints

- `GET /api/news` - Get all news articles
- `GET /api/news/category/:category` - Get news by category
- `GET /api/news/country/:country` - Get news by country
- `GET /api/scrape` - Trigger manual scraping
- `GET /api/categories` - Get all categories
- `GET /api/countries` - Get all countries

## Categories

- **Religious**: Islamic teachings, jurisprudence, spirituality
- **Politics**: Political news affecting Muslim communities
- **Community**: Local Muslim community news and events
- **Education**: Islamic education and academic news
- **Culture**: Islamic culture and heritage
- **Economics**: Islamic finance and economics
- **Health**: Health from Islamic perspective
- **Technology**: Technology in Islamic context

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details 