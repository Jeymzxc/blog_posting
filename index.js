import express from 'express'; // server
import bodyParser from 'body-parser'; // middleware
import mysql from 'mysql2'; // database
import bcrypt from 'bcrypt'; // password hasher
import jwt from 'jsonwebtoken'; // jwtToken
import rateLimit from 'express-rate-limit'; // rate limiter
import dotenv from 'dotenv'; // secret key

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiter 
const limiter = rateLimit({
    windowMs: 2 * 60 * 1000, // 2 minutes
    max: 100, // 100 requests
    message: { message: "Too many requests from this IP, please try again later." }
});
app.use(limiter);


// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pblog_db'
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL!');
});

// Middleware to verify JWT token 
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) return res.status(401).json({ message: 'Access token missing' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
}

// Register new users
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password)
        return res.status(400).json({ message: 'Username and password are required' });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ message: 'Username already exists' });
                }
                return res.status(500).json({ message: 'Database error', error: err.message });
            }
            res.status(201).json({ message: 'User registered successfully' });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Login users
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password)
        return res.status(400).json({ message: 'Username and password are required' });

    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err.message });

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const user = results[0];

        const match = await bcrypt.compare(password, user.password);

        if (!match) return res.status(401).json({ message: 'Invalid username or password' });

        const token = jwt.sign({ username: user.username, id: user.id }, SECRET_KEY, { expiresIn: '1h' });

        res.status(200).json({ message: 'Login success', token });
    });
});

// Retrieve all blog posts (protected)
app.get('/posts', authenticateToken, (req, res) => {
    db.query('SELECT * FROM posts', (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err.message });
        res.status(200).json({ message: "Success", blogs: results });
    });
});

// Retrieve a specific blog post (protected)
app.get('/posts/:id', authenticateToken, (req, res) => {
    const id = parseInt(req.params.id);
    db.query('SELECT * FROM posts WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err.message });
        if (results.length === 0) return res.status(404).json({ message: "Blog not found" });
        res.json(results[0]);
    });
});

// Create a new blog post (protected)
app.post('/posts', authenticateToken, (req, res) => {
    const { title, content, author } = req.body;
    db.query(
        'INSERT INTO posts (title, content, author) VALUES (?, ?, ?)',
        [title, content, author],
        (err, result) => {
            if (err) return res.status(500).json({ message: "Database error", error: err.message });
            res.status(200).json({ message: "Blog added successfully", id: result.insertId });
        }
    );
});

// Update an existing blog post (protected)
app.patch('/posts/:id', authenticateToken, (req, res) => {
    const id = parseInt(req.params.id);

    db.query('SELECT * FROM posts WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err.message });
        if (results.length === 0) return res.status(404).json({ message: "Blog not found" });

        const existing = results[0];
        const updatedTitle = req.body.title || existing.title;
        const updatedContent = req.body.content || existing.content;
        const updatedAuthor = req.body.author || existing.author;

        db.query(
            'UPDATE posts SET title = ?, content = ?, author = ? WHERE id = ?',
            [updatedTitle, updatedContent, updatedAuthor, id],
            (err2) => {
                if (err2) return res.status(500).json({ message: "Database error", error: err2.message });
                res.status(200).json({ message: "Blog updated successfully" });
            }
        );
    });
});

// Delete a blog post (protected)
app.delete('/posts/:id', authenticateToken, (req, res) => {
    const id = parseInt(req.params.id);
    db.query('DELETE FROM posts WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error", error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Blog not found" });
        res.status(200).json({ message: "Blog deleted successfully" });
    });
});

app.listen(port, () => {
    console.log("Running on port " + port);
    console.log("Server is running on http://localhost:3000");
});
