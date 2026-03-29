<?php
/**
 * Template Name: Live Results Page
 *
 * This is the template that displays the live lottery results.
 */

// --- FIX 2: Check if the current user is an administrator ---
$is_admin = current_user_can('manage_options');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Live Lottery Results</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        /* Your CSS styles remain unchanged */
        body { font-family: 'Inter', sans-serif; background-color: #f1f5f9; }
        .result-card { border: 1px solid #e2e8f0; box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.05); transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out; display: flex; flex-direction: column; height: 100%; }
        .result-card:hover { transform: translateY(-4px); box-shadow: 0 4px 10px 0 rgb(0 0 0 / 0.07); }
        .chart-image { width: 100%; height: auto; border-radius: 0.5rem; border: 1px solid #e2e8f0; background-color: #f8fafc; }
        .spinner { border: 4px solid rgba(0, 0, 0, 0.1); width: 36px; height: 36px; border-radius: 50%; border-left-color: #0ea5e9; animation: spin 1s ease infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
</head>
<body class="bg-slate-100">

    <main class="container mx-auto p-4">
        <div id="results-container" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <div id="loading-spinner" class="col-span-full flex flex-col items-center justify-center pt-16">
                <div class="spinner mb-4"></div>
                <p class="text-slate-600">Fetching latest results...</p>
            </div>
            </div>
    </main>

    <script>
        // --- FIX 2: Pass the PHP admin status to JavaScript ---
        const IS_ADMIN = <?php echo $is_admin ? 'true' : 'false'; ?>;

        document.addEventListener('DOMContentLoaded', () => {
            const resultsContainer = document.getElementById('results-container');
            const loadingSpinner = document.getElementById('loading-spinner');

            async function fetchAndDisplayResults() {
                try {
                    const response = await fetch('/api/get_live_results.php');
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const result = await response.json();

                    if(loadingSpinner) loadingSpinner.style.display = 'none';
                    resultsContainer.innerHTML = '';

                    if (result.success && result.data.length > 0) {
                        result.data.forEach(item => {
                            let contentHtml = '';
                            const itemNameLower = item.name.toLowerCase();
                            
                            if (itemNameLower.includes('chart') || itemNameLower.includes('full winners')) {
                                // Logic for images (unchanged)
                                try {
                                    const imageUrls = JSON.parse(item.results_json);
                                    if (Array.isArray(imageUrls) && imageUrls.length > 0 && imageUrls[0]) {
                                        contentHtml = `<img src="${imageUrls[0]}" alt="${item.name}" class="chart-image">`;
                                    } else {
                                        contentHtml = '<p class="text-slate-500">Image not available.</p>';
                                    }
                                } catch (e) {
                                    contentHtml = '<p class="text-slate-500">Error loading image.</p>';
                                    console.error(`Could not parse image data for ${item.name}:`, item.results_json);
                                }
                            } else {
                                // Logic for numbers
                                try {
                                    const numbers = JSON.parse(item.results_json);
                                    if (Array.isArray(numbers) && numbers.length > 0) {
                                        const allPlaceholders = numbers.every(num => {
                                            const trimmedNum = num.trim().replace(/=/g, '');
                                            return trimmedNum === '' || trimmedNum === '-';
                                        });
                                        
                                        if (allPlaceholders) {
                                            contentHtml = `<span class="text-2xl font-bold text-slate-700 tracking-wider">-</span>`;
                                        } else {
                                            // --- FIX 1 START: Filter out empty spans before creating them ---
                                            contentHtml = numbers
                                                .filter(num => num && num.trim() !== '' && num.trim() !== '-') // Keep only non-empty values
                                                .map(num => `<span class="text-2xl font-bold text-slate-700 tracking-wider">${num.trim()}</span>`) // Create spans
                                                .join(' '); // Join them with a space
                                            // --- FIX 1 END ---
                                        }
                                    } else {
                                        contentHtml = '<p class="text-slate-500">No numbers found.</p>';
                                    }
                                } catch (e) {
                                    contentHtml = '<p class="text-slate-500">Error loading numbers.</p>';
                                    console.error(`Could not parse results for ${item.name}:`, item.results_json);
                                }
                            }

                            // --- FIX 2 START: Conditionally create the timestamp HTML ---
                            let timestampHtml = '';
                            if (IS_ADMIN) {
                                timestampHtml = `
                                <div class="text-xs text-slate-400 mt-4 border-t pt-2 text-center">
                                    Updated: ${new Date(item.created_at).toLocaleString()}
                                </div>`;
                            }
                            // --- FIX 2 END ---

                            const card = `
                                <div class="result-card bg-white p-5 rounded-lg">
                                    <div class="flex-grow">
                                        <h2 class="text-lg font-bold text-slate-800 mb-4 text-center">${item.name}</h2>
                                        <div class="flex flex-wrap gap-4 justify-center items-center min-h-[60px]">
                                            ${contentHtml}
                                        </div>
                                    </div>
                                    ${timestampHtml}
                                </div>
                            `;
                            resultsContainer.insertAdjacentHTML('beforeend', card);
                        });
                    } else {
                        resultsContainer.innerHTML = `<div class="col-span-full text-center pt-16"><i data-lucide="inbox" class="w-16 h-16 mx-auto text-slate-300"></i><h3 class="mt-4 text-xl font-semibold text-slate-700">No Live Results Available</h3><p class="text-slate-500 mt-2">Please check back later.</p></div>`;
                    }
                    lucide.createIcons();

                } catch (error) {
                    console.error("Failed to fetch live results:", error);
                    if(loadingSpinner) loadingSpinner.style.display = 'none';
                    resultsContainer.innerHTML = `<div class="col-span-full text-center pt-16"><i data-lucide="server-crash" class="w-16 h-16 mx-auto text-red-400"></i><h3 class="mt-4 text-xl font-semibold text-red-600">Could Not Load Results</h3><p class="text-slate-500 mt-2">There was an error connecting to the server.</p></div>`;
                    lucide.createIcons();
                }
            }

            fetchAndDisplayResults();
            setInterval(fetchAndDisplayResults, 60000);
        });
    </script>
</body>
</html>