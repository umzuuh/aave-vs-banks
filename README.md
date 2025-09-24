# Aave vs Banks - Enhanced Database System

A comprehensive system that scrapes Federal Reserve bank data and AAVE TVL data, stores it in a SQLite database, and provides an API for data access. The system runs automatically every hour to keep data fresh.

## Features

- **Automated Data Collection**: Scrapes top 40 U.S. banks from Federal Reserve and AAVE TVL from DeFiLlama
- **Hourly Updates**: Runs every 60 minutes to ensure data freshness
- **SQLite Database**: Stores all historical data with proper indexing
- **REST API**: Provides easy access to all collected data
- **Data Analysis**: Built-in analysis tools for growth tracking and trends
- **Automatic Cleanup**: Manages database size by removing old data
- **Comprehensive Logging**: Detailed logs for monitoring and debugging

## Database Schema

The system uses SQLite with the following tables:

- **`banks`**: Federal Reserve bank data (rank, name, assets, location, etc.)
- **`aave_tvl`**: AAVE protocol TVL data across multiple chains
- **`rankings`**: Combined rankings of banks + AAVE by total assets/TVL
- **`scrapes`**: Metadata about each scraping session

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

```bash
npm run db:setup
```

This creates the SQLite database and all necessary tables in the `data/` directory.

### 3. Run Initial Scrape

```bash
npm run scrape:now
```

This performs the first data collection to populate the database.

### 4. Start Hourly Scheduler

```bash
npm run schedule:hourly
```

This starts the automated system that runs every hour.

### 5. Start API Server (Optional)

```bash
npm run api:start
```

This starts a REST API server on port 3000 for data access.

## Usage

### Command Line Tools

#### Database Setup
```bash
npm run db:setup          # Create database and tables
npm run db:migrate        # Run database migrations (future use)
```

#### Data Collection
```bash
npm run scrape:now        # Run one-time scrape
npm run schedule:hourly   # Start hourly automated scraping
```

#### API Server
```bash
npm run api:start         # Start production API server
npm run dev               # Start development server with auto-reload
```

### API Endpoints

Once the API server is running, you can access:

- **`GET /health`** - Health check
- **`GET /api/rankings/latest`** - Latest combined rankings
- **`GET /api/rankings/:date`** - Rankings for specific date
- **`GET /api/banks/latest`** - Latest bank data
- **`GET /api/aave/latest`** - Latest AAVE TVL data
- **`GET /api/aave/history`** - AAVE TVL history
- **`GET /api/stats`** - Scraping statistics
- **`GET /api/analysis/growth`** - Top banks by growth
- **`GET /api/analysis/trend`** - AAVE TVL trend analysis

### Example API Usage

```bash
# Get latest rankings
curl http://localhost:3000/api/rankings/latest

# Get AAVE TVL history (last 50 entries)
curl http://localhost:3000/api/aave/history?limit=50

# Get growth analysis for last 7 days
curl http://localhost:3000/api/analysis/growth?days=7&limit=10
```

## Configuration

Edit `config.json` to customize:

```json
{
  "scraper": {
    "retryAttempts": 3,
    "retryDelay": 5000,
    "timeout": 30000
  },
  "scheduler": {
    "cronExpression": "0 * * * *",  // Every hour
    "timezone": "America/New_York",
    "cleanupOldData": true,
    "cleanupDaysToKeep": 30
  },
  "database": {
    "path": "./data/aave_vs_banks.db",
    "backupEnabled": true
  }
}
```

### Cron Expression

The default cron expression `0 * * * *` means:
- `0` - At minute 0
- `*` - Every hour
- `*` - Every day of month
- `*` - Every month
- `*` - Every day of week

To change frequency:
- **Every 30 minutes**: `*/30 * * * *`
- **Every 2 hours**: `0 */2 * * *`
- **Every 15 minutes**: `*/15 * * * *`

## Monitoring

### Check Scheduler Status
```bash
node src/hourly-scheduler.js --status
```

### Check Database Info
```bash
node src/hourly-scheduler.js --db-info
```

### View Logs
The system provides detailed console logging for:
- Scraping progress and results
- Database operations
- Error handling and retries
- Performance metrics

## Data Structure

### Bank Data
```json
{
  "rank": 1,
  "bankName": "JPMORGAN CHASE BK NA",
  "holdingCompany": "JPMORGAN CHASE & CO",
  "location": "NEW YORK, NY",
  "assets": 3643099000000,
  "scrapedAt": "2024-01-15T10:00:00.000Z"
}
```

### AAVE TVL Data
```json
{
  "tvl_usd": 1234567890000,
  "tvl_ethereum": 1000000000000,
  "tvl_polygon": 234567890000,
  "scrapedAt": "2024-01-15T10:00:00.000Z"
}
```

### Combined Rankings
```json
{
  "rank": 1,
  "name": "JPMORGAN CHASE BK NA",
  "type": "bank",
  "assetsTVL": 3643099000000,
  "scrapedAt": "2024-01-15T10:00:00.000Z"
}
```

## Maintenance

### Database Cleanup
The system automatically cleans up old data (default: 30 days). You can adjust this in `config.json`.

### Manual Cleanup
```bash
# Connect to database and run cleanup
node -e "
const Database = require('./src/database/db');
const db = new Database();
db.connect().then(() => {
  return db.cleanupOldData(7); // Keep only 7 days
}).then(deleted => {
  console.log('Deleted', deleted, 'records');
  return db.disconnect();
});
"
```

### Backup
The database file is located at `data/aave_vs_banks.db`. You can:
- Copy this file for backup
- Use SQLite tools for advanced operations
- Implement automated backup scripts

## Troubleshooting

### Common Issues

1. **Database locked**: Ensure no other processes are using the database
2. **Scraping fails**: Check network connectivity and API rate limits
3. **Memory issues**: Monitor database size and adjust cleanup settings

### Debug Mode
Enable verbose logging by setting environment variables:
```bash
DEBUG=* npm run schedule:hourly
```

### Check Database Integrity
```bash
sqlite3 data/aave_vs_banks.db "PRAGMA integrity_check;"
```

## Development

### Project Structure
```
src/
├── database/
│   ├── setup.js      # Database initialization
│   └── db.js         # Database utilities
├── enhanced-scraper.js    # Main scraper
├── hourly-scheduler.js    # Automated scheduler
└── api-server.js          # REST API server
```

### Adding New Data Sources
1. Extend the `EnhancedScraper` class
2. Add new database methods in `Database` class
3. Update API endpoints in `APIServer`

### Testing
```bash
# Test scraper
npm run scrape:now

# Test API
npm run api:start
# Then visit http://localhost:3000/health
```

## Performance

- **Scraping**: Typically completes in 10-30 seconds
- **Database**: SQLite with proper indexing for fast queries
- **API**: Express.js with async/await for concurrent requests
- **Storage**: Automatic cleanup prevents unlimited growth

## Security

- CORS enabled for API access
- Input validation on API endpoints
- No authentication (add if needed for production)
- Database file permissions should be restricted

## Production Deployment

### Process Management
Use PM2 or similar for production:
```bash
npm install -g pm2
pm2 start src/hourly-scheduler.js --name "aave-scraper"
pm2 start src/api-server.js --name "aave-api"
pm2 save
pm2 startup
```

### Monitoring
- Monitor database size
- Check scraping success rates
- Set up alerts for failures
- Log rotation for console output

### Scaling
- Multiple scheduler instances (adjust `maxConcurrentScrapes`)
- Database connection pooling
- Load balancing for API
- Separate read/write databases

## License

This project is open source. Please check the license file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the logs
3. Open an issue on GitHub
4. Check the API health endpoint