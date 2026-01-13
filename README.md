# Credibility Checker RAG

A Flask-based application that uses Retrieval-Augmented Generation (RAG) to detect misinformation and assess the credibility of articles. The system retrieves similar news snippets from a vector database and uses the Mistral API to provide credibility scoring and analysis.

## Features

- **Vector-based Retrieval**: Uses ChromaDB with embeddings from Sentence-Transformers to find similar articles
- **Credibility Scoring**: Analyzes articles using the Mistral API to provide scores (0-100) and detailed reasoning
- **Web Scraping**: Extracts article content from URLs using Goose3
- **REST API**: FastAPI-style endpoint for credibility checking
- **Web Interface**: Simple frontend for testing credibility checks

## Project Structure

```
.
├── transformer/           # Main Flask application
│   └── app.py            # Core application logic
├── frontend/             # Web interface
│   └── index.html        # Frontend UI
├── web_crawler/          # Web scraping utilities
│   └── web_crawler.py
├── embedding/            # Embedding utilities
│   └── embedding.py
├── data/                 # Data storage
│   ├── chromadb/         # ChromaDB persistent storage
│   └── mongo_db/         # MongoDB exports
├── chroma_db/            # Additional ChromaDB storage
└── requirements.txt      # Python dependencies
```

## Prerequisites

- Python 3.8+
- Mistral API key
- Optional: MongoDB for data export

## Installation

1. Clone the repository and navigate to the project directory
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   Create a `.env` file in the project root:
   ```
   MISTRAL_API_KEY=your_api_key_here
   MISTRAL_MODEL=mistral-small-latest
   FLASK_DEBUG=false
   PORT=5000
   ```

## Configuration

Key configuration variables in `transformer/app.py`:

- `EMBEDDING_MODEL`: Sentence-Transformers model (default: `all-MiniLM-L6-v2`)
- `COLLECTION_NAME`: ChromaDB collection name (default: `news`)
- `COSINE_THRESHOLD`: Similarity threshold for retrieval (default: 0.57)
- `DEFAULT_MODEL`: Default Mistral model
- `DEFAULT_TRUNCATION`: Maximum text length for responses (default: 1000)

## Usage

### Running the Application

```bash
python transformer/app.py
```

The Flask app will start on `http://0.0.0.0:5000`

### API Endpoint

**POST** `/api/check`

Request body:
```json
{
  "text": "Article text or URL to check",
  "top_n": 3
}
```

Response:
```json
{
  "article": "Checked article text",
  "snippets": "Retrieved similar snippets",
  "score": 75,
  "reason": "Credibility assessment reason",
  "documents": ["reference_url_1", "reference_url_2"]
}
```

## How It Works

1. **Input Processing**: User provides article text or URL
2. **Embedding & Retrieval**: Article is embedded and similar articles are retrieved from ChromaDB
3. **Credibility Analysis**: Retrieved snippets are sent to Mistral API with a prompt to detect misinformation
4. **Scoring**: Model returns a credibility score (0-100) and reasoning
5. **Response**: Results are returned with original article, retrieved snippets, and credibility assessment

## Dependencies

Key packages (see requirements.txt for full list):

- **Flask**: Web framework
- **chromadb**: Vector database
- **sentence-transformers**: Text embeddings
- **goose3**: Web scraping
- **requests**: HTTP client
- **mistral-ai**: Mistral API client (if available)
- **python-dotenv**: Environment variable management

## Environment Variables

- `MISTRAL_API_KEY`: Your Mistral API key (required)
- `MISTRAL_MODEL`: Model to use (default: `mistral-small-latest`)
- `MISTRAL_API_URL`: API endpoint (default: `https://api.mistral.ai/v1/chat/completions`)
- `FLASK_DEBUG`: Enable debug mode (default: `false`)
- `PORT`: Server port (default: `5000`)

## Future Improvements

- Add support for multiple LLM providers
- Implement caching for embeddings
- Add database migration tools
- Enhance web scraping capabilities
- Add user authentication
- Implement rate limiting

## License

[Add your license here]

## Support

For issues or questions, please open an issue in the repository.
