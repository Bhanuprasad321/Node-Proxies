const http = require("http");

const server = http.createServer((req, res) => {
  console.log("Incoming request recieved!");
  try {
    const targetUrl = new URL(req.url);

    const hostname = targetUrl.hostname;
    const port = targetUrl.port || 80;
    const path = targetUrl.pathname + targetUrl.search;

    console.log("Hostname:", hostname);
    console.log("Port:", port);
    console.log("Path:", path);

    res.writeHead(200, {
      "Content-Type": "text/plain",
    });

    res.end("Destination URL extracted successfully!");
  } catch (err) {
    res.writeHead(400, {
      "content-type": "text/plain",
    });
    res.end("Invalid destination URL");
  }
});

server.listen(3000, () => {
  console.log("proxy server running on port 3000");
});
