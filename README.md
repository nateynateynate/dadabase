# The DADabase

Please find here an introductory method for implementing semantic search for a particular set of documents in OpenSearch. In this example I'm using a set of dad jokes. 

These jokes have been sourced from a dad joke dataset on Kaggle (https://www.kaggle.com/datasets/usamabuttar/dad-jokes) - I have done my best to remove any jokes that might be considered offensive, but I can't read them all. Please use your best judgement if you decide to implement the same data set as me for the purposes of creating a demo. 

## Usage

* Firstly, register and deploy an embedding model into your OpenSearch cluster. Take note of the model ID.
* Then, run dadjokes.js after providing OPENSEARCH_HOST, OPENSEARCH_USERNAME, OPENSEARCH_PASSWORD via your environment. 
* After all is uploaded and embedded, run `node ./server.js`, and then visit http://localhost:3000/





