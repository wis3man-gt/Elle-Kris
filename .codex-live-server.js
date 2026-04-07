const http = require("http");
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const host = "0.0.0.0";
const port = Number(process.env.PORT || process.argv[2] || 5500);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function isInsideRoot(filePath) {
  return filePath === root || filePath.startsWith(root + path.sep);
}

function send(res, statusCode, body, contentType = "text/plain; charset=utf-8") {
  res.writeHead(statusCode, { "Content-Type": contentType });
  res.end(body);
}

function resolveRequestPath(urlPath) {
  const decodedPath = decodeURIComponent(urlPath);
  if (decodedPath === "/") {
    return path.join(root, "index.html");
  }

  return path.resolve(root, "." + decodedPath);
}

http
  .createServer((req, res) => {
    let filePath;

    try {
      filePath = resolveRequestPath(new URL(req.url, "http://localhost").pathname);
    } catch {
      send(res, 400, "Bad Request");
      return;
    }

    if (!isInsideRoot(filePath)) {
      send(res, 403, "Forbidden");
      return;
    }

    fs.stat(filePath, (statError, stats) => {
      if (!statError && stats.isDirectory()) {
        filePath = path.join(filePath, "index.html");
      }

      fs.readFile(filePath, (readError, data) => {
        if (readError) {
          send(res, 404, "Not Found");
          return;
        }

        const contentType = mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream";
        send(res, 200, data, contentType);
      });
    });
  })
  .listen(port, host, () => {
    console.log(`Live server running at http://localhost:${port}`);
  });
