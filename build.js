// build.js
const { build } = require('esbuild');
const fs = require('fs');
const path = require('path');

async function runBuild() {
    try {
        const distDir = 'dist';

        // Create dist directory if it doesn't exist
        if (!fs.existsSync(distDir)) {
            fs.mkdirSync(distDir);
        }

        // Check for API_KEY environment variable
        if (!process.env.API_KEY) {
            console.warn(`
****************************************************************
  WARNING: API_KEY environment variable is not set.
  The application will not be able to connect to the Gemini API.
  Run the command like this:
  API_KEY="your_actual_api_key" npm run deploy
****************************************************************
            `);
        }

        // ESBuild config
        await build({
            entryPoints: ['index.tsx'],
            bundle: true,
            outfile: path.join(distDir, 'index.js'),
            jsx: 'automatic',
            // This is the key part for the API key
            define: {
                'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
            },
            logLevel: 'info',
        });

        // Copy and modify index.html
        let html = fs.readFileSync('index.html', 'utf-8');
        html = html.replace('/index.tsx', '/index.js');
        fs.writeFileSync(path.join(distDir, 'index.html'), html);

        console.log('Build successful!');
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

runBuild();
