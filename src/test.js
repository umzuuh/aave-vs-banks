const FedReserveBankScraper = require('./scraper');
const WeeklyScheduler = require('./scheduler');
const fs = require('fs-extra');
const path = require('path');

class TestSuite {
    constructor() {
        this.testDataDir = path.join(__dirname, '../test-data');
        this.scraper = new FedReserveBankScraper({
            dataDir: this.testDataDir,
            retryAttempts: 1
        });
    }

    async runAllTests() {
        console.log('🧪 Starting test suite...\n');
        
        const tests = [
            this.testScraperInitialization,
            this.testDataParsing,
            this.testDataStorage,
            this.testChangeDetection,
            this.testSchedulerCreation
        ];

        let passed = 0;
        let failed = 0;

        for (const test of tests) {
            try {
                await test.call(this);
                console.log(`✅ ${test.name} passed`);
                passed++;
            } catch (error) {
                console.log(`❌ ${test.name} failed: ${error.message}`);
                failed++;
            }
        }

        console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
        
        // Cleanup
        await this.cleanup();
        
        return failed === 0;
    }

    async testScraperInitialization() {
        if (!this.scraper.sourceUrl) {
            throw new Error('Source URL not initialized');
        }
        if (!this.scraper.dataDir) {
            throw new Error('Data directory not initialized');
        }
    }

    async testDataParsing() {
        // Create mock HTML content
        const mockHTML = `
            <html>
                <body>
                    <table>
                        <tr><th>Rank</th><th>Name</th><th>Holding Company</th><th>Location</th><th>Assets</th></tr>
                        <tr><td>1</td><td>JPMorgan Chase Bank</td><td>JPMorgan Chase & Co.</td><td>New York</td><td>$3,640,000</td></tr>
                        <tr><td>2</td><td>Bank of America</td><td>Bank of America Corp.</td><td>Charlotte</td><td>$2,540,000</td></tr>
                    </table>
                </body>
            </html>
        `;

        const banks = this.scraper.parseHTML(mockHTML);
        
        if (banks.length === 0) {
            throw new Error('No banks parsed from mock HTML');
        }
        
        if (!banks[0].bankName || !banks[0].assets) {
            throw new Error('Required fields missing from parsed data');
        }
    }

    async testDataStorage() {
        const mockBanks = [
            {
                rank: 1,
                bankName: 'Test Bank',
                holdingCompany: 'Test Corp',
                location: 'Test City',
                assets: 1000000,
                scrapedAt: new Date().toISOString()
            }
        ];

        await this.scraper.saveData(mockBanks);
        
        const savedFile = path.join(this.testDataDir, 'latest.json');
        const exists = await fs.pathExists(savedFile);
        
        if (!exists) {
            throw new Error('Data file was not saved');
        }
        
        const savedData = await fs.readJson(savedFile);
        if (savedData.banks.length !== 1) {
            throw new Error('Saved data does not match input');
        }
    }

    async testChangeDetection() {
        const oldBanks = [
            { rank: 1, bankName: 'Bank A', assets: 1000000 },
            { rank: 2, bankName: 'Bank B', assets: 500000 }
        ];
        
        const newBanks = [
            { rank: 1, bankName: 'Bank A', assets: 1100000 }, // Asset change
            { rank: 2, bankName: 'Bank C', assets: 600000 }   // New bank
        ];

        const changes = this.scraper.compareData(oldBanks, newBanks);
        
        if (changes.length === 0) {
            throw new Error('Changes not detected');
        }
    }

    async testSchedulerCreation() {
        const scheduler = new WeeklyScheduler({
            scraper: { dataDir: this.testDataDir }
        });
        
        const status = scheduler.getStatus();
        
        if (!status.cronExpression) {
            throw new Error('Scheduler not properly initialized');
        }
    }

    async cleanup() {
        try {
            await fs.remove(this.testDataDir);
            console.log('🧹 Test cleanup completed');
        } catch (error) {
            console.log('⚠️ Test cleanup failed:', error.message);
        }
    }
}

// Run tests if called directly
if (require.main === module) {
    const testSuite = new TestSuite();
    testSuite.runAllTests()
        .then(success => {
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('Test suite failed:', error);
            process.exit(1);
        });
}

module.exports = TestSuite;