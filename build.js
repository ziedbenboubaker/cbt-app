// build.js
const { build, context } = require('esbuild');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local if it exists
if (fs.existsSync('.env.local')) {
    require('dotenv').config({ path: '.env.local' });
}

const distDir = 'dist';
const outfilePath = path.join(distDir, 'index.js');

// Common esbuild configuration for both dev and prod
const esbuildOptions = {
    entryPoints: ['index.tsx'],
    bundle: true,
    outfile: outfilePath, // Explicitly set the output path
    jsx: 'automatic',
    define: {
        'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ''),
    },
    logLevel: 'info',
};

/**
 * Prepares the dist directory by creating it if it doesn't exist,
 * and copying/modifying the index.html file.
 */
function prepareDistDirectory() {
    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir);
    }
    // Copy index.html to dist and update script path
    let html = fs.readFileSync('index.html', 'utf-8');
    // Change the script from .tsx to the output .js file
    html = html.replace('/index.tsx', '/index.js'); 
    fs.writeFileSync(path.join(distDir, 'index.html'), html);
}


/**
 * Main function to decide whether to build for production 
 * or run the development server.
 */
async function main() {
    const isDev = process.argv.includes('--dev');

    // Prepare the 'dist' directory for both modes
    prepareDistDirectory();

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

        const ctx = await context({
            ...esbuildOptions,
            sourcemap: true, // Enable sourcemaps for better debugging
        });
        
        await ctx.watch();

        const { port } = await ctx.serve({
            servedir: distDir, // Serve from the 'dist' directory
            port: 3000,
        });

        console.log(`\n🚀 Development server is live at http://localhost:${port}\n`);

    } else {
        // --- PRODUCTION BUILD MODE ---
        // Creates optimized files in the 'dist' directory for deployment
        console.log('Starting production build...');
        
        await build({
            ...esbuildOptions,
            minify: true, // Minify code for production
        });

        console.log('✅ Production build successful! Files are ready in the dist/ directory.');
    }
}

main().catch((e) => {
    console.error('Build script failed:', e);
    process.exit(1);
});
