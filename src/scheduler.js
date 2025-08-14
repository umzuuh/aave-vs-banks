const cron = require('node-cron');
const FedReserveBankScraper = require('./scraper');

class WeeklyScheduler {
    constructor(config = {}) {
        this.scraper = new FedReserveBankScraper(config.scraper);
        this.cronExpression = config.cronExpression || '0 6 * * 1'; // Every Monday at 6 AM
        this.timezone = config.timezone || 'America/New_York';
        this.isRunning = false;
    }

    start() {
        console.log(`Starting weekly scheduler with cron: ${this.cronExpression} (${this.timezone})`);
        
        this.task = cron.schedule(this.cronExpression, async () => {
            if (this.isRunning) {
                console.log('Previous scrape still running, skipping this execution');
                return;
            }

            try {
                this.isRunning = true;
                console.log(`[${new Date().toISOString()}] Weekly scheduled scrape starting...`);
                
                const bankData = await this.scraper.scrapeTop40Banks();
                
                // Send success notification
                await this.sendNotification('success', {
                    bankCount: bankData.length,
                    timestamp: new Date().toISOString()
                });
                
            } catch (error) {
                console.error(`[${new Date().toISOString()}] Scheduled scrape failed:`, error);
                
                // Send failure notification
                await this.sendNotification('failure', {
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
                
            } finally {
                this.isRunning = false;
            }
        }, {
            scheduled: false,
            timezone: this.timezone
        });

        this.task.start();
        console.log('Weekly scheduler started successfully');
    }

    stop() {
        if (this.task) {
            this.task.destroy();
            console.log('Weekly scheduler stopped');
        }
    }

    async runNow() {
        console.log('Running manual scrape...');
        try {
            this.isRunning = true;
            const bankData = await this.scraper.scrapeTop40Banks();
            console.log('Manual scrape completed successfully');
            return bankData;
        } finally {
            this.isRunning = false;
        }
    }

    async sendNotification(type, data) {
        // Implement notification logic (email, Slack, webhook, etc.)
        const message = type === 'success' 
            ? `✅ Weekly bank data scrape completed successfully. Found ${data.bankCount} banks.`
            : `❌ Weekly bank data scrape failed: ${data.error}`;
            
        console.log(`NOTIFICATION: ${message}`);
        
        // TODO: Implement actual notification sending
        // Examples:
        // - Email via nodemailer
        // - Slack webhook
        // - Discord webhook
        // - Custom API endpoint
    }

    getStatus() {
        return {
            isRunning: this.isRunning,
            cronExpression: this.cronExpression,
            timezone: this.timezone,
            nextRun: this.task ? this.task.nextDate() : null,
            isScheduled: this.task ? this.task.scheduled : false
        };
    }
}

// CLI usage
if (require.main === module) {
    const scheduler = new WeeklyScheduler();
    
    // Handle command line arguments
    const args = process.argv.slice(2);
    
    if (args.includes('--run-now')) {
        scheduler.runNow()
            .then(() => process.exit(0))
            .catch(error => {
                console.error('Manual run failed:', error);
                process.exit(1);
            });
    } else if (args.includes('--status')) {
        console.log('Scheduler status:', scheduler.getStatus());
        process.exit(0);
    } else {
        // Start the scheduler
        scheduler.start();
        
        // Keep the process running
        process.on('SIGINT', () => {
            console.log('Received SIGINT, stopping scheduler...');
            scheduler.stop();
            process.exit(0);
        });
        
        console.log('Press Ctrl+C to stop the scheduler');
    }
}

module.exports = WeeklyScheduler;