import express from 'express';
import bodyParser from 'body-parser';

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

let blogs = [
    {
        id: 1,
        Title: "My First Blog Post",
        Content: "This is the content of the blog.",
        Author: "John Doe"
    },
    {
        id: 2,
        Title: "A Day in the Life",
        Content: "Today I want to share my daily routine.",
        Author: "Jane Smith"
    },
    {
        id: 3,
        Title: "Travel Tips",
        Content: "Here are some tips for traveling on a budget.",
        Author: "Emily Johnson"
    },
    {
        id: 4,
        Title: "Healthy Eating",
        Content: "How to maintain a balanced diet.",
        Author: "Michael Brown"
    },
    {
        id: 5,
        Title: "Tech Trends 2025",
        Content: "Latest trends in technology for the upcoming year.",
        Author: "Lisa Davis"
    }
];

// Retrieve all blog posts
app.get('/posts', (req, res) => {
    res.status(200).json({ message: "Success", blogs });
});

// Retrieve a specific blog post
app.get('/posts/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = blogs.findIndex((blog) => blog.id === id);

    if (index === -1) {
        return res.status(404).json({ message: "Blog not found" });
    }

    res.json(blogs[index]);
});

// Create a new blog post
app.post('/posts', (req, res) => {
    const { Title, Author, Content } = req.body;

    const newBlog = {
        id: blogs.length + 1,
        Title,
        Content,
        Author
    };

    blogs.push(newBlog);
    res.status(200).json({ message: "Blog added successfully" });
});

// Update an existing blog post
app.patch("/posts/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const index = blogs.findIndex((blog) => blog.id === id);

    const updatedBlog = {
        id: blogs[index].id,
        Title: req.body.Title || blogs[index].Title,
        Content: req.body.Content || blogs[index].Content,
        Author: req.body.Author || blogs[index].Author
    };

    blogs[index] = updatedBlog;
    res.status(200).json({ message: "Blog updated successfully", blog: updatedBlog });
});

// Delete a blog post
app.delete('/posts/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = blogs.findIndex((blog) => blog.id === id);

    if (index === -1) {
        return res.status(404).json({ message: "Blog not found" });
    }

    blogs.splice(index, 1);
    res.status(200).json({ message: "Blog deleted successfully" });
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
