const http = require("http");

const backend = http.createServer((req, res) => {
  console.log("Backend received:", req.method, req.url);

  res.writeHead(200, {
    "Content-Type": "application/json",
  });

  res.end(
    JSON.stringify({
      message: "Response from Backend Server 1",
      method: req.method,
      path: req.url,
      server: "Backend 1",
    }),
  );
});

backend.listen(4000, () => {
  console.log("Backend server 1 running on port 4000");
});
