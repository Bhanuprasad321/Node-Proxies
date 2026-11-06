const http = require("http");

const server = http.createServer((req, res) => {
  console.log("Incoming request recieved!");

  console.log("Method:", req.method);
  console.log("URL:", req.url);
  console.log("Headers:", req.headers);

  res.writeHead(200, {
    "Content-Type": "text/plain",
  });

  res.end("Hello from our forward proxy!");
});

server.listen(3000, () => {
  console.log("proxy server running on port 3000");
});
