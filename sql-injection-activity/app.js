const http = require('http');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

// Create an instance of express
const app = express();

// Middleware to serve static files from the current directory
app.use(express.static('.'));

// Middleware to parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// SQLite setup
const db = new sqlite3.Database(':memory:');

db.serialize(function () {
    db.run("CREATE TABLE user (username TEXT, password TEXT, title TEXT)");
    db.run("INSERT INTO user VALUES ('privilegedUser', 'privilegedUser1', 'Administrator')");
});

// GET route to send the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// POST route to handle login form submission
app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Purposefully vulnerable SQL query
    const query = `SELECT title FROM user WHERE username = '${username}' AND password = '${password}'`;

    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    console.log(`Query: ${query}`);

    db.get(query, (err, row) => {
        if (err) {
            res.redirect('/#error');
        } else if (row) {
            res.send(`<h1>Welcome, ${row.title}</h1>`);
        } else {
            res.redirect('/#unauthorized');
        }
    });
});

// Start the server on port 3000
const server = http.createServer(app);
const PORT = 3000;

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
