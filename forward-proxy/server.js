const http = require("http");

const server = http.createServer((req, res) => {
  console.log("Incoming request: ", req.url);
  let targetUrl;
  try {
    targetUrl = new URL(req.url);

    if (targetUrl.protocol !== "http:") {
      res.writeHead(400);
      return res.end("Only HTTP is supported in this step");
    }

    if (targetUrl.username || targetUrl.password) {
      res.writeHead(400);
      return res.end("URL credentials are not allowed");
    }
  } catch (err) {
    res.writeHead(400);
    return res.end("Invalid destination URL");
  }

  const options = {
    hostname: targetUrl.hostname,
    port: targetUrl.port || 80,
    path: targetUrl.pathname + targetUrl.search,
    method: req.method,
    headers: { ...req.headers },
  };

  options.headers.host = targetUrl.host;

  for (const header of ["connection", "proxy-connection"]) {
    delete options.headers[header];
  }

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on("error", (error) => {
    console.error("Destination error:", error.message);

    if (!res.headersSent) {
      res.writeHead(502);
    }

    res.end("Bad Gateway");
  });

  req.pipe(proxyReq);
});

server.listen(3000, () => {
  console.log("proxy server running on port 3000");
});
