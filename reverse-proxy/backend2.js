const http = require("http");

const backend = http.createServer((req, res) => {
  console.log("Backend received:", req.method, req.url);

  res.writeHead(200, {
    "Content-Type": "application/json",
  });

  res.end(
    JSON.stringify({
      message: "Response from Backend Server 2",
      method: req.method,
      path: req.url,
      server: "Backend 2",
    }),
  );
});

backend.listen(4001, () => {
  console.log("Backend server 2 running on port 4001");
});
