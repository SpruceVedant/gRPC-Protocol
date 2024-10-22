const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');


const PROTO_PATH = path.join(__dirname, 'service.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const greeterProto = grpc.loadPackageDefinition(packageDefinition).greeter;

function sayHello(call, callback) {
  const name = call.request.name;
  callback(null, { message: `Hello, ${name}!` });
}

function main() {
  const server = new grpc.Server();
  
  server.addService(greeterProto.Greeter.service, { SayHello: sayHello });
  
  const serverAddress = '0.0.0.0:50051';
  server.bindAsync(serverAddress, grpc.ServerCredentials.createInsecure(), (err, port) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(`Server is running on ${serverAddress}`);
    server.start();
  });
}

main();
