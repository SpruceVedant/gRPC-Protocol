const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');


const PROTO_PATH = path.join(__dirname, 'service.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const greeterProto = grpc.loadPackageDefinition(packageDefinition).greeter;

function main() {
  const client = new greeterProto.Greeter('localhost:50051', grpc.credentials.createInsecure());
  
  const userName = process.argv[2] || 'World';
  
  client.SayHello({ name: userName }, (err, response) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log('Greeting:', response.message);
  });
}

main();
