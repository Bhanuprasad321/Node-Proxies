const http = require("http");

const backends = [
  { hostname: "localhost", port: 4000 },
  { hostname: "localhost", port: 4001 },
];

let currentBackend = 0;

function getNextBackend() {
  const backend = backends[currentBackend];

  currentBackend = (currentBackend + 1) % backends.length;

  return backend;
}

function getOtherBackend(failedBackend) {
  return backends.find((backend) => backend.port !== failedBackend.port);
}

function forwardRequest(req, res, backend, isRetry, body) {
  const options = {
    ...backend,
    path: req.url,
    method: req.method,
    headers: req.headers,
  };

  const proxyReq = http.request(options, (proxyRes) => {
    // A response has started, so do not retry this request.
    res.writeHead(proxyRes.statusCode, proxyRes.headers);

    proxyRes.on("error", (error) => {
      console.error("Backend response error:", error.message);

      if (!res.destroyed) {
        res.destroy();
      }
    });

    proxyRes.pipe(res);
  });

  proxyReq.on("error", (error) => {
    console.error("Backend connection error:", error.message);

    if (res.headersSent || res.destroyed) {
      return;
    }

    if (!isRetry) {
      console.log("Trying the other backend...");

      const otherBackend = getOtherBackend(backend);

      forwardRequest(req, res, otherBackend, true, body);
    } else {
      res.writeHead(502, {
        "Content-Type": "text/plain",
      });

      res.end("Both backend servers are unavailable");
    }
  });

  // Send the stored request body.
  proxyReq.end(body);
}

const proxy = http.createServer((req, res) => {
  console.log("Incoming request:", req.method, req.url);

  const chunks = [];

  req.on("data", (chunk) => {
    chunks.push(chunk);
  });

  req.on("end", () => {
    const body = Buffer.concat(chunks);

    const selectedBackend = getNextBackend();

    forwardRequest(req, res, selectedBackend, false, body);
  });
});

proxy.listen(3000, () => {
  console.log("Reverse proxy running on port 3000");
});
