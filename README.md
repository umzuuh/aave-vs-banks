# Federal Reserve Bank Data Scraper

Automated weekly scraper for Federal Reserve top 40 U.S. commercial banks data.

## Features

- 🕒 **Weekly Scheduling**: Automated scraping every Monday at 6 AM
- 📊 **Top 40 Banks**: Extracts ranking, name, assets, and location data
- 🔍 **Change Detection**: Identifies ranking and asset changes week-over-week
- 📁 **Data Versioning**: Stores historical snapshots with timestamps
- 🔄 **Retry Logic**: Robust error handling with automatic retries
- 📧 **Notifications**: Configurable alerts for success/failure (console, email, Slack)

## Installation

```bash
npm install
```

## Usage

### Start Weekly Scheduler
```bash
npm run schedule
```

### Run Manual Scrape
```bash
node src/scheduler.js --run-now
```

### Run Tests
```bash
npm test
```

## Configuration

Edit `config.json` to customize:

- **Source URL**: Federal Reserve data endpoint
- **Schedule**: Cron expression for timing (default: Monday 6 AM)
- **Notifications**: Email, Slack, or console alerts
- **Data Retention**: How long to keep historical data
- **Validation**: Data quality checks

## Data Structure

Scraped data is saved as JSON with this structure:

```json
{
  "scrapedAt": "2025-08-14T22:55:00.000Z",
  "source": "https://www.federalreserve.gov/releases/lbr/current/",
  "bankCount": 40,
  "banks": [
    {
      "rank": 1,
      "bankName": "JPMorgan Chase Bank",
      "holdingCompany": "JPMorgan Chase & Co.",
      "location": "New York",
      "assets": 3640000,
      "scrapedAt": "2025-08-14T22:55:00.000Z"
    }
  ]
}
```

## File Structure

```
├── src/
│   ├── scraper.js      # Core scraping logic
│   ├── scheduler.js    # Weekly scheduling system
│   └── test.js         # Test suite
├── data/              # Scraped data storage
├── config.json        # Configuration settings
└── package.json       # Node.js dependencies
```

## Monitoring

- Check `data/latest.json` for most recent data
- Review `data/changes_YYYY-MM-DD.json` for detected changes
- Monitor console output or configured notifications for status

## Error Handling

The scraper includes:
- Automatic retries with exponential backoff
- Network timeout handling
- Data validation checks
- Graceful failure with notifications

## Customization

To adapt for different data sources:

1. Update `sourceUrl` in config.json
2. Modify `parseHTML()` method in scraper.js
3. Adjust validation rules as needed
4. Test with `npm test`

## Contributing

1. Add new features in separate modules
2. Update tests for new functionality
3. Update configuration schema as needed
4. Document changes in README