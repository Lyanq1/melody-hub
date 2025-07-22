# Product Scraping System

This system provides automated and manual scraping of product data from various sources, with the ability to save data to both CSV files and MongoDB.

## Features

- **Automated Scraping**: Scheduled scraping using cron expressions
- **Manual Scraping**: Trigger scraping on-demand via API
- **Data Comparison**: Compare old and new data to identify changes
- **Configuration Management**: Easily configure scraping sources and schedules
- **CSV Export**: Export scraped data to CSV files
- **Database Integration**: Save scraped data directly to MongoDB

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/scrape/config` | GET | Get current scraper configuration |
| `/api/scrape/config` | PUT | Update scraper configuration |
| `/api/scrape/run` | POST | Trigger manual scraping |
| `/api/scrape/history` | GET | Get scraping history |
| `/api/scrape/download-csv` | GET | Download latest CSV file |
| `/api/scrape/compare` | GET | Compare old and new data |

## Configuration

The scraper configuration is stored in `scrape-config.json` and includes:

```json
{
  "schedule": {
    "enabled": true,
    "cronExpression": "0 0 * * *"  // Daily at midnight
  },
  "lastRun": "2023-06-15T12:34:56.789Z",
  "sources": [
    {
      "name": "hangDiaThoiDai",
      "enabled": true,
      "url": "https://store.hangdiathoidai.com/collections/available-now"
    }
  ]
}
```

## Cron Expression Examples

- `0 0 * * *`: Daily at midnight
- `0 */6 * * *`: Every 6 hours
- `0 9 * * 1-5`: Weekdays at 9 AM
- `0 0 1 * *`: Monthly on the 1st at midnight
- `*/30 * * * *`: Every 30 minutes

## Usage

### Running the Scraper Manually

```javascript
import { runScraping } from './scrape/scheduler.js';

// Run all enabled scrapers
const results = await runScraping();
console.log(results);
```

### Updating Schedule

```javascript
import { updateSchedule } from './scrape/scheduler.js';

// Enable scraper to run daily at 3 AM
updateSchedule(true, '0 3 * * *');
```

## File Structure

- `hangDiaThoiDaiScraper.js`: Implementation of the Hang Dia Thoi Dai scraper
- `scheduler.js`: Scheduling and configuration management
- `scrape-config.json`: Configuration file (auto-generated)
- `products.csv`: Latest scraped data in CSV format
- `test.js`: Test script for verifying functionality

## Adding New Scrapers

To add a new scraper:

1. Create a new scraper file (e.g., `newSourceScraper.js`)
2. Implement the scraper function
3. Update `scheduler.js` to include the new scraper
4. Add the new source to the configuration 