const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const axios = require('axios');
require('dotenv').config();


const PROTO_PATH = './openAI.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const openaiProto = grpc.loadPackageDefinition(packageDefinition).openai;


// const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
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


function startServer() {
    const server = new grpc.Server();
    server.addService(openaiProto.OpenAIService.service, { GenerateText: generateText });
    
    const port = '50051';
    server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), () => {
        console.log(`gRPC server running on port ${port}`);
        // server.start();
    });
}

startServer();
