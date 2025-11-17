// build.js
const { build, context } = require('esbuild');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local if it exists
if (fs.existsSync('.env.local')) {
    require('dotenv').config({ path: '.env.local' });
}

// Common esbuild configuration for both dev and prod
const esbuildOptions = {
    entryPoints: ['index.tsx'],
    bundle: true,
    jsx: 'automatic',
    define: {
        'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
    },
    logLevel: 'info',
};


/**
 * Main function to decide whether to build for production 
 * or run the development server.
 */
async function main() {
    const isDev = process.argv.includes('--dev');

    if (isDev) {
        // --- DEVELOPMENT MODE ---
        // Provides a local server with hot-reloading
        console.log('Starting development server...');
        if (!process.env.API_KEY) {
            console.warn(`
****************************************************************
  WARNING: API_KEY not found in .env.local or environment.
  The application may not be able to connect to the Gemini API.
  Please create a .env.local file with:
  API_KEY="your_actual_api_key_here"
****************************************************************
            `);
        }

        const ctx = await context(esbuildOptions);
        
        await ctx.watch();

        const { port } = await ctx.serve({
            servedir: '.', // Serves files from the root, including index.html
            port: 3000,
        });

        console.log(`\n🚀 Development server is live at http://localhost:${port}\n`);

    } else {
        // --- PRODUCTION BUILD MODE ---
        // Creates optimized files in the 'dist' directory for deployment
        console.log('Starting production build...');
        
        const distDir = 'dist';
        if (!fs.existsSync(distDir)) {
            fs.mkdirSync(distDir);
        }

        await build({
            ...esbuildOptions,
            outfile: path.join(distDir, 'index.js'),
            minify: true, // Minify code for production
        });

        // Copy index.html to dist and update script path
        let html = fs.readFileSync('index.html', 'utf-8');
        html = html.replace('/index.tsx', '/index.js');
        fs.writeFileSync(path.join(distDir, 'index.html'), html);

        console.log('✅ Production build successful! Files are ready in the dist/ directory.');
    }
}

main().catch((e) => {
    console.error('Build script failed:', e);
    process.exit(1);
});