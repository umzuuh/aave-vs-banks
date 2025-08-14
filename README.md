# Aave vs Banks

A real-time comparison tool that shows how DeFi protocol Aave's Total Value Locked (TVL) stacks up against the top 40 US commercial banks by assets.

## 🌐 Live Demo

**[https://aave.umzuuh.com](https://aave.umzuuh.com)**

## 🎯 What This Project Does

This tool provides a live comparison between:
- **Aave Protocol**: A leading DeFi lending protocol's Total Value Locked
- **Traditional Banks**: The top 40 US commercial banks ranked by total assets

The comparison helps visualize the scale of DeFi adoption relative to traditional banking institutions, making it easy to see where Aave would rank among traditional banks.

## ✨ Features

- 📊 **Real-time Aave TVL**: Fetches live data from DeFi protocols
- 🏦 **Top 40 Bank Rankings**: Displays Federal Reserve bank data with rankings, names, and assets
- 🔄 **Interactive Table**: Sortable and responsive data table with sticky Aave row
- 📱 **Mobile Responsive**: Works seamlessly on all device sizes
- 🚀 **Fallback Data**: Graceful degradation when API calls fail
- 🎨 **Modern UI**: Clean, intuitive interface with smooth animations

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd aave-vs-banks

# Install dependencies
npm install
```

### Running the Project

```bash
# Start the scraper (fetches latest bank data)
npm run start

# Run the scheduler (for automated weekly updates)
npm run schedule

# Run tests
npm run test
```

### Available Scripts

- `npm start` - Run the main scraper to fetch bank data
- `npm run schedule` - Start the automated weekly scheduler
- `npm test` - Run test suite

## 🏗️ Project Structure

```
aave-vs-banks/
├── index.html          # Main web interface
├── src/
│   ├── scraper.js      # Bank data scraper
│   ├── scheduler.js    # Weekly automation
│   └── test.js         # Test suite
├── data/               # Stored bank data
├── config.json         # Configuration settings
└── package.json        # Dependencies and scripts
```

## 📊 Data Sources

- **Aave TVL**: Real-time data from DeFi protocol APIs
- **Bank Rankings**: Federal Reserve Bank data (updated weekly)
- **Fallback Data**: Local JSON files when APIs are unavailable

## 🔧 Configuration

The project uses `config.json` for customizable settings including:
- Data source URLs
- Update frequencies
- Retry attempts and delays
- Data storage paths

## 🛠️ Built With

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js with Express-like structure
- **Data Parsing**: Cheerio for HTML parsing
- **HTTP Requests**: Axios for API calls
- **Scheduling**: node-cron for automated tasks
- **File Operations**: fs-extra for enhanced file handling

## 📈 How It Works

1. **Data Collection**: Scrapes Federal Reserve bank rankings weekly
2. **Real-time Updates**: Fetches current Aave TVL from DeFi APIs
3. **Comparison Display**: Shows Aave's position relative to traditional banks
4. **Interactive Interface**: Users can explore and sort the data
5. **Fallback Handling**: Gracefully handles API failures with cached data

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Links

- **Live Demo**: [https://aave.umzuuh.com](https://aave.umzuuh.com)
- **Aave Protocol**: [https://aave.com](https://aave.com)
- **Federal Reserve**: [https://www.federalreserve.gov](https://www.federalreserve.gov)