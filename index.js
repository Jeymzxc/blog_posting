import express from 'express';
import bodyParser from 'body-parser';
import mysql from 'mysql2';

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pBlog_db'
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL!');
});

// Retrieve all blog posts
app.get('/posts', (req, res) => {
    db.query('SELECT * FROM posts', (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err.message });
        res.status(200).json({ message: "Success", blogs: results });
    });
});

// Retrieve a specific blog post
app.get('/posts/:id', (req, res) => {
    const id = parseInt(req.params.id);
    db.query('SELECT * FROM posts WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err.message });
        if (results.length === 0) return res.status(404).json({ message: "Blog not found" });
        res.json(results[0]);
    });
});

// Create a new blog post
app.post('/posts', (req, res) => {
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

// Update an existing blog post
app.patch('/posts/:id', (req, res) => {
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

// Delete a blog post
app.delete('/posts/:id', (req, res) => {
    const id = parseInt(req.params.id);
    db.query('DELETE FROM posts WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error", error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: "Blog not found" });
        res.status(200).json({ message: "Blog deleted successfully" });
    });
});

// Login Credentials
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username === "admin" && password === "admin123") {
        return res.status(200).json({ message: "Login success" });
    } else {
        return res.status(401).json({ message: "Invalid username or password" });
    }
});

app.listen(port, () => {
    console.log("Running on port " + port);
    console.log("Server is running on http://localhost:3000");
});
