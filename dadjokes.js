const fs = require('fs');
const { parse } = require('csv-parse');
const { Client } = require('@opensearch-project/opensearch');

// Create OpenSearch client
// Note: Adjust these settings according to your local OpenSearch configuration
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

// Function to create the index if it doesn't exist
async function createIndexIfNotExists() {
    try {
        const indexExists = await client.indices.exists({
            index: 'dadjokes'
        });

        if (!indexExists.body) {
            await client.indices.create({
                index: 'dadjokes',
                body: {
                    settings: {
                        "index.knn": true,
                        "default_pipeline": "dad-joke-pipeline"
                    },
                    mappings: {
                        properties: {
                            id: {
                                type: 'text'
                            },
                            "joke-embedding": {
                                type: 'knn_vector',
                                dimension: 768,
                                space_type: 'l2'
                            },
                            joke: {
                                type: 'text'
                            }
                        }
                    }
                }
            });
            console.log('Index created successfully');
        }
    } catch (error) {
        console.error('Error creating index:', error);
        throw error;
    }
}
async function createPipelineIfNotExists() {
    try {
        // Check if pipeline exists
        const pipelineExists = await client.ingest.getPipeline({
            id: 'dad-joke-pipeline'
        }).catch(err => {
            if (err.meta.statusCode === 404) {
                return false;
            }
            throw err;
        });

        if (!pipelineExists) {
            await client.ingest.putPipeline({
                id: 'dad-joke-pipeline',
                body: {
                    description: "An NLP ingest pipeline",
                    processors: [
                        {
                            text_embedding: {
                                model_id: "aRoRN5cBnmOZFWB0spsS",
                                field_map: {
                                    joke: "joke-embedding"
                                }
                            }
                        }
                    ]
                }
            });
            console.log('Pipeline created successfully');
        } else {
            console.log('Pipeline already exists');
        }
    } catch (error) {
        console.error('Error handling pipeline:', error);
        throw error;
    }
}

async function initializeOpenSearch() {
    try {
        // First create the pipeline
        await createPipelineIfNotExists();

        // Then create the index
        await createIndexIfNotExists();

        console.log('OpenSearch initialization completed successfully');
    } catch (error) {
        console.error('Error during OpenSearch initialization:', error);
        throw error;
    }
}


// Function to index the jokes
async function indexJokes() {
    try {
        await initializeOpenSearch();


        const parser = fs
            .createReadStream('dad_jokes.csv')
            .pipe(parse({
                columns: true,
                skip_empty_lines: true
            }));

        for await (const record of parser) {
            await client.index({
                index: 'dadjokes',
                body: {
                    joke: record.joke
                }
            });
        }

        console.log('Finished indexing jokes');
    } catch (error) {
        console.error('Error indexing jokes:', error);
    }
}

// Run the indexing process
indexJokes().then(() => {
    console.log('Process completed');
    client.close();
}).catch(error => {
    console.error('Failed to complete the process:', error);
    client.close();
});
