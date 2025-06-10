// public/script.js
async function searchJokes() {
    const searchInput = document.getElementById('searchInput');
    const resultsDiv = document.getElementById('results');
    const loadingDiv = document.getElementById('loading');

    if (!searchInput.value.trim()) {
        return;
    }

    try {
        loadingDiv.style.display = 'block';
        resultsDiv.innerHTML = '';

        const response = await fetch('/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ searchText: searchInput.value }),
        });

        if (!response.ok) {
            throw new Error('Search failed');
        }

        const jokes = await response.json();

        if (jokes.length === 0) {
            resultsDiv.innerHTML = '<p>No jokes found</p>';
            return;
        }

        resultsDiv.innerHTML = jokes.map(joke => `
            <div class="joke-card">
                <div class="joke-text">${escapeHtml(joke.joke)}</div>
                <div class="score">Similarity Score: ${joke.score.toFixed(2)}</div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error:', error);
        resultsDiv.innerHTML = '<p>An error occurred while searching</p>';
    } finally {
        loadingDiv.style.display = 'none';
    }
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Add event listener for Enter key
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchJokes();
    }
});
