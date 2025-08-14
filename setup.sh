#!/bin/bash

# Federal Reserve Bank Scraper Setup Script

echo "🏦 Setting up Federal Reserve Bank Data Scraper..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create data directory
echo "📁 Creating data directory..."
mkdir -p data

# Run tests
echo "🧪 Running tests..."
npm test

if [ $? -eq 0 ]; then
    echo "✅ Tests passed!"
else
    echo "❌ Tests failed! Please check the configuration."
    exit 1
fi

# Test manual run
echo "🔍 Testing manual scrape..."
node src/scheduler.js --run-now

if [ $? -eq 0 ]; then
    echo "✅ Manual scrape successful!"
else
    echo "⚠️ Manual scrape failed - this is expected if the HTML structure needs adjustment."
fi

echo "
🎉 Setup complete!

Next steps:
1. Add your HTML file with the top 40 banks table
2. Adjust the parseHTML() method in src/scraper.js if needed
3. Configure notifications in config.json
4. Start the weekly scheduler: npm run schedule

Commands:
- Manual scrape: node src/scheduler.js --run-now  
- Start scheduler: npm run schedule
- Run tests: npm test
- Check status: node src/scheduler.js --status
"