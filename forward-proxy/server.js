const http = require("http");
const net = require("net");
const server = http.createServer((req, res) => {
  if (req.method === "CONNECT") {
    const [hostname, port] = req.url.split(":");

    const serverSocket = net.connect(Number(port), hostname, () => {
      // Tell the browser that the tunnel is ready
      res.writeHead(200, "Connection Established");
      res.flushHeaders();

      // Forward data in both directions
      clientSocket.pipe(serverSocket);
      serverSocket.pipe(clientSocket);
    });

    const clientSocket = req.socket;

    serverSocket.on("error", (error) => {
      console.error("TCP connection error:", error.message);

      if (!res.headersSent) {
        res.writeHead(502);
      }

      res.end();
    });

    serverSocket.on("close", () => {
      clientSocket.destroy();
    });

    clientSocket.on("error", () => {
      serverSocket.destroy();
    });

    return;
  }
});
server.on("connect", (req, clientSocket, head) => {
  const target = new URL(`http://${req.url}`);

  const hostname = target.hostname;
  const port = Number(target.port || 443);

  console.log(`HTTPS tunnel requested: ${hostname}:${port}`);

  const serverSocket = net.connect(port, hostname);

  let tunnelEstablished = false;

  serverSocket.on("connect", () => {
    tunnelEstablished = true;

    // Tell the browser that the tunnel is ready
    clientSocket.write("HTTP/1.1 200 Connection Established\r\n\r\n");

    // Forward any data already received
    if (head.length > 0) {
      serverSocket.write(head);
    }

    // Two-way communication
    clientSocket.pipe(serverSocket);
    serverSocket.pipe(clientSocket);

    console.log("HTTPS tunnel established");
  });

  serverSocket.on("error", (error) => {
    console.error("Destination connection error:", error.message);

    if (!tunnelEstablished) {
      clientSocket.end("HTTP/1.1 502 Bad Gateway\r\nConnection: close\r\n\r\n");
    } else {
      clientSocket.destroy();
    }
  });

  clientSocket.on("error", () => {
    serverSocket.destroy();
  });

  clientSocket.on("close", () => {
    serverSocket.destroy();
  });
});
server.listen(3000, () => {
  console.log("proxy server running on port 3000");
});
