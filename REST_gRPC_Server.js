const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const express = require('express');
const axios = require('axios');
require('dotenv').config();

const PROTO_PATH = './openAI.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const openaiProto = grpc.loadPackageDefinition(packageDefinition).openai;

const API_KEY = process.env.OPENAI_API_KEY;


async function generateText(call, callback) {
    const prompt = call.request.prompt;
    const maxTokens = call.request.max_tokens || 100;

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4o-mini', 
                messages: [{ role: 'user', content: prompt }],
                max_tokens: maxTokens
            },
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const generatedText = response.data.choices[0].message.content.trim();
        callback(null, { text: generatedText });
    } catch (error) {
        console.error('Error communicating with OpenAI:', error.message || error);
        callback({
            code: grpc.status.INTERNAL,
            message: 'Failed to connect to OpenAI'
        });
    }
}


function startGrpcServer() {
    const server = new grpc.Server();
    server.addService(openaiProto.OpenAIService.service, { GenerateText: generateText });

    const port = '0.0.0.0:50051';

    server.bindAsync(port, grpc.ServerCredentials.createInsecure(), (error, port) => {
        if (error) {
            console.error('Failed to bind gRPC server:', error);
            return;
        }
        console.log(`gRPC server running on port ${port}`);
        // server.start(); 
    });
}


function startRestServer() {
    const app = express();
    const port = 3000;

    app.use(express.json());

  
    app.post('/generate-text', async (req, res) => {
        const prompt = req.body.prompt;
        const max_tokens = req.body.max_tokens || 100;

       
        const client = new openaiProto.OpenAIService('localhost:50051', grpc.credentials.createInsecure());

        client.GenerateText({ prompt, max_tokens }, (error, response) => {
            if (error) {
                return res.status(500).json({ error: 'Failed to generate text' });
            }
            res.json({ text: response.text });
        });
    });

    app.listen(port, () => {
        console.log(`REST server running on port ${port}`);
    });
}


startGrpcServer();
startRestServer();
