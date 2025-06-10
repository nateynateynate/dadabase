// server.js
const express = require('express');
const { Client } = require('@opensearch-project/opensearch');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

const client = new Client({
    node: 'https://localhost:9200',
    auth: {
        username: process.env.OPENSEARCH_USERNAME,
        password: process.env.OPENSEARCH_PASSWORD
    },
    ssl: {
        verify_certs: false,
        rejectUnauthorized: false
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/search', async (req, res) => {
    try {
        const { searchText } = req.body;
        const response = await client.search({
            index: 'dadjokes',
            body: {
                size: 5,
                query: {
                    neural: {
                        "joke-embedding": {
                            model_id: "aRoRN5cBnmOZFWB0spsS",
                            query_text: searchText,
                            k: 5
                        }
                    }
                }
            }
        });

        const hits = response.body.hits.hits.map(hit => ({
            joke: hit._source.joke,
            score: hit._score
        }));

        res.json(hits);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
