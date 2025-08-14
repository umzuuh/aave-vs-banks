const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const path = require('path');

class FedReserveBankScraper {
    constructor(config = {}) {
        this.sourceUrl = config.sourceUrl || 'https://www.federalreserve.gov/releases/lbr/current/';
        this.dataDir = config.dataDir || path.join(__dirname, '../data');
        this.retryAttempts = config.retryAttempts || 3;
        this.retryDelay = config.retryDelay || 5000;
    }

    async scrapeTop40Banks() {
        console.log(`[${new Date().toISOString()}] Starting weekly bank data scrape...`);
        
        try {
            await fs.ensureDir(this.dataDir);
            const htmlContent = await this.fetchWithRetry();
            const bankData = this.parseHTML(htmlContent);
            await this.saveData(bankData);
            await this.detectChanges(bankData);
            
            console.log(`[${new Date().toISOString()}] Scrape completed successfully. Found ${bankData.length} banks.`);
            return bankData;
            
        } catch (error) {
            console.error(`[${new Date().toISOString()}] Scrape failed:`, error.message);
            throw error;
        }
    }

    async fetchWithRetry() {
        let lastError;
        
        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                console.log(`Fetch attempt ${attempt}/${this.retryAttempts}`);
                const response = await axios.get(this.sourceUrl, {
                    timeout: 30000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (compatible; FedReserveScraper/1.0)'
                    }
                });
                
                if (response.status === 200 && response.data) {
                    console.log('Successfully fetched HTML content');
                    return response.data;
                }
                
            } catch (error) {
                lastError = error;
                console.log(`Attempt ${attempt} failed: ${error.message}`);
                
                if (attempt < this.retryAttempts) {
                    console.log(`Waiting ${this.retryDelay}ms before retry...`);
                    await this.sleep(this.retryDelay);
                }
            }
        }
        
        throw lastError;
    }

    parseHTML(htmlContent) {
        const $ = cheerio.load(htmlContent);
        const banks = [];
        
        // Find the main data table (look for table with bank data)
        $('table').each((tableIndex, table) => {
            const headers = $(table).find('tr:first th, tr:first td').map((i, th) => $(th).text().trim()).get();
            
            // Check if this table has the expected bank data columns
            if (headers.some(h => h.includes('Bank Name')) && headers.some(h => h.includes('Assets'))) {
                console.log(`Found bank data table with ${headers.length} columns`);
                
                // Skip the header row and get data rows
                const dataRows = $(table).find('tr').slice(1);
                let bankCount = 0;
                
                dataRows.each((rowIndex, row) => {
                    if (bankCount >= 40) return false; // Stop after top 40
                    
                    const cells = $(row).find('td');
                    if (cells.length >= 6) { // Need at least 6 columns for complete data
                        const bankNameCell = $(cells[0]).text().trim();
                        const rankCell = $(cells[1]).text().trim();
                        const locationCell = $(cells[3]).text().trim();
                        const assetsCell = $(cells[5]).text().trim();
                        
                        // Skip rows that don't look like bank data
                        if (!bankNameCell || bankNameCell === 'Summary:' || !assetsCell) return;
                        
                        const parts = bankNameCell.split('/');
                        const bankName = parts[0].trim();
                        const holdingCompany = parts.length > 1 ? parts[1].trim() : '';
                        
                        const bankData = {
                            rank: parseInt(rankCell) || (bankCount + 1),
                            bankName: bankName,
                            holdingCompany: holdingCompany,
                            location: locationCell,
                            assets: this.parseAssets(assetsCell),
                            scrapedAt: new Date().toISOString()
                        };
                        
                        if (bankName && bankData.assets > 0) {
                            banks.push(bankData);
                            bankCount++;
                        }
                    }
                });
                
                return false; // Stop after processing the first valid table
            }
        });
        
        return banks;
    }

    parseTextTable(textContent) {
        const banks = [];
        const lines = textContent.split('\n');
        
        // Find the start of the data (after headers)
        let dataStartIndex = -1;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            // Look for the first data row (starts with a bank name)
            if (line && !line.includes('Bank Name') && !line.includes('---') && !line.includes('Rank')) {
                // Check if this looks like a data row (has multiple columns)
                const columns = this.splitTableRow(line);
                if (columns.length >= 6) {
                    dataStartIndex = i;
                    break;
                }
            }
        }
        
        if (dataStartIndex === -1) return banks;
        
        // Parse the top 40 banks
        for (let i = dataStartIndex; i < Math.min(dataStartIndex + 40, lines.length); i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const columns = this.splitTableRow(line);
            if (columns.length >= 6) {
                const bankData = {
                    rank: banks.length + 1,
                    bankName: this.extractBankName(columns[0]),
                    holdingCompany: this.extractHoldingCompany(columns[0]),
                    location: columns[3] || '',
                    assets: this.parseAssets(columns[5] || '0'),
                    scrapedAt: new Date().toISOString()
                };
                banks.push(bankData);
            }
        }
        
        return banks;
    }

    splitTableRow(line) {
        // Split by multiple spaces while preserving single spaces within bank names
        return line.split(/\s{2,}/).map(col => col.trim()).filter(col => col.length > 0);
    }

    extractBankName(firstColumn) {
        // The first column often contains both bank name and holding company
        // Try to extract just the bank name (usually before " / " or before holding company)
        const parts = firstColumn.split(/\s*\/\s*/);
        return parts[0].trim();
    }

    extractHoldingCompany(firstColumn) {
        // Extract holding company name if present
        const parts = firstColumn.split(/\s*\/\s*/);
        return parts.length > 1 ? parts[1].trim() : '';
    }

    parseAssets(assetText) {
        // Convert asset text like "$3,640,000" to number
        const cleanText = assetText.replace(/[$,]/g, '');
        return parseFloat(cleanText) || 0;
    }

    async saveData(bankData) {
        await fs.ensureDir(this.dataDir);
        
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `banks_${timestamp}.json`;
        const filepath = path.join(this.dataDir, filename);
        
        const dataWithMetadata = {
            scrapedAt: new Date().toISOString(),
            source: this.sourceUrl,
            bankCount: bankData.length,
            banks: bankData
        };
        
        await fs.writeJson(filepath, dataWithMetadata, { spaces: 2 });
        console.log(`Data saved to ${filepath}`);
        
        // Also save as latest.json
        await fs.writeJson(path.join(this.dataDir, 'latest.json'), dataWithMetadata, { spaces: 2 });
    }

    async detectChanges(currentData) {
        const latestFile = path.join(this.dataDir, 'latest.json');
        
        if (await fs.pathExists(latestFile)) {
            const previousData = await fs.readJson(latestFile);
            const changes = this.compareData(previousData.banks, currentData);
            
            if (changes.length > 0) {
                console.log(`Detected ${changes.length} changes:`);
                changes.forEach(change => console.log(`- ${change}`));
                
                await fs.writeJson(
                    path.join(this.dataDir, `changes_${new Date().toISOString().split('T')[0]}.json`),
                    changes,
                    { spaces: 2 }
                );
            }
        }
    }

    compareData(previousBanks, currentBanks) {
        const changes = [];
        
        // Compare rankings and assets
        currentBanks.forEach((currentBank, index) => {
            const previousBank = previousBanks.find(p => p.bankName === currentBank.bankName);
            
            if (!previousBank) {
                changes.push(`New bank in top 40: ${currentBank.bankName} at rank ${currentBank.rank}`);
            } else if (previousBank.rank !== currentBank.rank) {
                changes.push(`${currentBank.bankName}: rank changed from ${previousBank.rank} to ${currentBank.rank}`);
            } else if (Math.abs(previousBank.assets - currentBank.assets) > previousBank.assets * 0.05) {
                const change = ((currentBank.assets - previousBank.assets) / previousBank.assets * 100).toFixed(2);
                changes.push(`${currentBank.bankName}: assets changed by ${change}%`);
            }
        });
        
        return changes;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = FedReserveBankScraper;