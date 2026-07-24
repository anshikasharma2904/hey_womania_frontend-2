const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
// Check if we are in production
const dev = process.env.NODE_ENV !== "production";
// Create the Next.js app instance
const app = next({ dev });
const handle = app.getRequestHandler();
// Use the PORT provided by cPanel Passenger, or default to 3000
const port = process.env.PORT || 3000;
app.prepare().then(() => {
  createServer((req, res) => {
    // Be sure to pass `true` as the second argument to `url.parse`.
    // This tells it to parse the query portion of the URL.
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
