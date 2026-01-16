const form = document.getElementById('checkForm');
const textInput = document.getElementById('text');
const topNInput = document.getElementById('topN');
const loading = document.getElementById('loading');
const results = document.getElementById('results');
const errorMessage = document.getElementById('errorMessage');
const scoreCard = document.getElementById('scoreCard');
const scoreValue = document.getElementById('scoreValue');
const reasonText = document.getElementById('reasonText');
const articleExcerpt = document.getElementById('articleExcerpt');
const snippetsSection = document.getElementById('snippetsSection');
const snippetsList = document.getElementById('snippetsList');
const documentsSection = document.getElementById('documentsSection');
const documentsList = document.getElementById('documentsList');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await checkCredibility();
});

async function checkCredibility() {
    const text = textInput.value.trim();
    const topN = parseInt(topNInput.value) || 3;

    if (!text) {
        showError('Please enter article text');
        return;
    }

    loading.style.display = 'block';
    results.style.display = 'none';
    errorMessage.style.display = 'none';

    try {
        const response = await fetch('/api/check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text, top_n: topN }),
        });

        const data = await response.json();

        if (!response.ok) {
            showError(data.message || 'An error occurred while checking credibility');
            loading.style.display = 'none';
            return;
        }

        displayResults(data);
    } catch (error) {
        showError('Failed to connect to server: ' + error.message);
    } finally {
        loading.style.display = 'none';
    }
}

function displayResults(data) {
    const score = data.score ?? 0;
    const reason = data.reason || 'Unable to determine credibility';
    const article = data.article || '';
    const documents = data.documents || [];

    // Update score card
    scoreValue.textContent = score;
    scoreCard.className = 'score-card';

    if (score < 40) {
        scoreCard.classList.add('low');
    } else if (score < 70) {
        scoreCard.classList.add('medium');
    } else {
        scoreCard.classList.add('high');
    }

    // Update Referenced Articles (only links)
    if (documents && documents.length > 0) {
        snippetsList.innerHTML = '';
        documents.forEach((link, index) => {
            const linkElement = document.createElement('a');
            linkElement.href = link;
            linkElement.target = '_blank';
            linkElement.rel = 'noopener noreferrer';
            linkElement.className = 'document-link';

            // Format the display text
            const displayText = link.length > 80 ? link.substring(0, 80) + '...' : link;

            linkElement.innerHTML = `
                <span class="link-icon">🔗</span>
                <span>${displayText}</span>
            `;
            snippetsList.appendChild(linkElement);
        });
        snippetsSection.style.display = 'block';
    } else {
        snippetsSection.style.display = 'none';
    }

    // Update reason
    reasonText.textContent = reason;

    // Update article excerpt
    articleExcerpt.textContent = article || 'No text provided';

    results.style.display = 'block';
    results.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    results.style.display = 'none';
}
