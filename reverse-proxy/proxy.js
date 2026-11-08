const http = require("http");

const backends = [
  { hostname: "localhost", port: 4000 },
  { hostname: "localhost", port: 4001 },
];

function getNextBackend() {
  //Round-Robin Load Balancer
  const backend = backends[currentBackend];

  currentBackend = (currentBackend + 1) % backends.length;

  return backend;
}

let currentBackend = 0;

const proxy = http.createServer((req, res) => {
  console.log("Incoming request:", req.method, req.url);

  const options = {
    ...getNextBackend(),
    path: req.url,
    method: req.method,
    headers: req.headers,
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);

    proxyRes.pipe(res);
  });

  proxyReq.on("error", (error) => {
    console.error("Backend error:", error.message);

    res.writeHead(502);
    res.end("Bad Gateway");
  });

  req.pipe(proxyReq);
});

proxy.listen(3000, () => {
  console.log("Reverse proxy running on port 3000");
});
