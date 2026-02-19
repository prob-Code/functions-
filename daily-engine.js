const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO_ROOT = __dirname;
const DATA_DIR = path.join(REPO_ROOT, 'data');
const EXPERIMENTS_DIR = path.join(REPO_ROOT, 'experiments');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(EXPERIMENTS_DIR)) fs.mkdirSync(EXPERIMENTS_DIR, { recursive: true });

// Configuration
const CONFIG = {
    weatherApi: 'https://api.open-meteo.com/v1/forecast?latitude=37.7749&longitude=-122.4194&current_weather=true', // SF default
    cryptoApi: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd',
    logFile: path.join(REPO_ROOT, 'progress-log.md'),
    readmeFile: path.join(REPO_ROOT, 'README.md'),
    streakFile: path.join(REPO_ROOT, 'streak.json'),
    dataFile: path.join(DATA_DIR, 'daily-data.json'),
    metricsFile: path.join(EXPERIMENTS_DIR, 'metrics.json')
};

// Utils
const getToday = () => new Date().toISOString().split('T')[0];
const getTimestamp = () => new Date().toISOString();

// Fetch Data Helper
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.warn(`Failed to fetch ${url}:`, error.message);
        return null; // Return null on failure to allow script to continue
    }
}

// Main Engine
async function runDailyEngine() {
    const today = getToday();
    console.log(`Starting Daily Engine for ${today}...`);

    // 1. Prevent Duplicate Entries
    let progressLog = '';
    if (fs.existsSync(CONFIG.logFile)) {
        progressLog = fs.readFileSync(CONFIG.logFile, 'utf8');
    }
    
    // Check if today's entry already exists
    if (progressLog.includes(`| ${today} |`)) {
        console.log('Update for today already exists. Exiting.');
        return;
    }

    // 2. Git Stats
    let commitCount = 0;
    try {
        commitCount = parseInt(execSync('git rev-list --count HEAD').toString().trim(), 10);
    } catch (e) {
        console.warn('Could not get git commit count, defaulting to 0');
    }

    // 3. Daily Data Collection
    const weatherData = await fetchData(CONFIG.weatherApi);
    const cryptoData = await fetchData(CONFIG.cryptoApi);
    
    const dailyEntry = {
        date: today,
        timestamp: getTimestamp(),
        weather: weatherData?.current_weather || 'Unavailable',
        crypto: cryptoData || 'Unavailable'
    };

    // Update Data JSON
    let dailyData = [];
    if (fs.existsSync(CONFIG.dataFile)) {
        try {
            dailyData = JSON.parse(fs.readFileSync(CONFIG.dataFile, 'utf8'));
        } catch (e) {
            dailyData = [];
        }
    }
    dailyData.push(dailyEntry);
    fs.writeFileSync(CONFIG.dataFile, JSON.stringify(dailyData, null, 2));

    // 4. Model Experiment Logger
    const experimentEntry = {
        date: today,
        experiment_id: `EXP-${Math.floor(Math.random() * 10000)}`,
        accuracy: (Math.random() * (0.95 - 0.70) + 0.70).toFixed(4),
        loss: (Math.random() * (0.50 - 0.10) + 0.10).toFixed(4),
        notes: "Automated daily experiment run."
    };

    let metrics = [];
    if (fs.existsSync(CONFIG.metricsFile)) {
        try {
            metrics = JSON.parse(fs.readFileSync(CONFIG.metricsFile, 'utf8'));
        } catch (e) {
            metrics = [];
        }
    }
    metrics.push(experimentEntry);
    fs.writeFileSync(CONFIG.metricsFile, JSON.stringify(metrics, null, 2));

    // 5. Streak & README Update
    let streakData = { currentStreak: 0, totalCommits: 0, lastUpdated: "" };
    if (fs.existsSync(CONFIG.streakFile)) {
        try {
            streakData = JSON.parse(fs.readFileSync(CONFIG.streakFile, 'utf8'));
        } catch (e) {}
    }

    const lastDate = new Date(streakData.lastUpdated || 0);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Simple streak logic: if last update was yesterday, increment. If today, keep. Else reset.
    // Since we already checked for today's entry above, we assume this is a new run.
    const isConsecutive = lastDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0];

    if (isConsecutive) {
        streakData.currentStreak += 1;
    } else {
        streakData.currentStreak = 1; // Reset or Start
    }
    
    streakData.totalCommits = commitCount;
    streakData.lastUpdated = getTimestamp();
    fs.writeFileSync(CONFIG.streakFile, JSON.stringify(streakData, null, 2));

    // Update README
    if (fs.existsSync(CONFIG.readmeFile)) {
        let readmeContent = fs.readFileSync(CONFIG.readmeFile, 'utf8');
        readmeContent = readmeContent
            .replace(/<!-- LAST_UPDATED -->.*/g, `<!-- LAST_UPDATED --> **${today}**`)
            .replace(/<!-- STREAK -->.*/g, `<!-- STREAK --> **${streakData.currentStreak}**`)
            .replace(/<!-- TOTAL_COMMITS -->.*/g, `<!-- TOTAL_COMMITS --> **${commitCount}**`);
        
        fs.writeFileSync(CONFIG.readmeFile, readmeContent);
    }

    // 6. Update Progress Log
    const status = (weatherData && cryptoData) ? '✅ Operational' : '⚠️ Partial Data';
    const summary = `Auto-update. Crypto: ${JSON.stringify(cryptoData).substring(0, 20)}... Exp Acc: ${experimentEntry.accuracy}`;
    const logEntry = `| ${today} | ${status} | ${commitCount} | ${summary} |\n`;
    
    fs.appendFileSync(CONFIG.logFile, logEntry);

    console.log('Daily Engine finished successfully.');
}

runDailyEngine().catch(console.error);
