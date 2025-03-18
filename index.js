const express = require("express");
const fs = require("fs");
const app = express();
const PORT = 3000;

app.use(express.json());

const booksFile = "books.json";

const loadBooks = () => {
    try {
        if (!fs.existsSync(booksFile)) return [];
        const data = fs.readFileSync(booksFile, "utf8");
        return JSON.parse(data) || [];
    } catch (error) {
        console.error("Error loading books:", error);
        return [];
    }
};

const saveBooks = (books) => {
    try {
        fs.writeFileSync(booksFile, JSON.stringify(books, null, 2));
    } catch (error) {
        console.error("Error saving books:", error);
    }
};

app.post("/books", (req, res) => {
    let books = loadBooks();
    const { book_id, title, author, genre, year, copies } = req.body;

    if (!book_id || !title || !author || !genre || !year || !copies) {
        return res.status(400).json({ error: "All fields are required." });
    }
    if (isNaN(year) || isNaN(copies)) {
        return res.status(400).json({ error: "Year and copies must be numbers." });
    }
    if (books.some(book => String(book.book_id) === String(book_id))) {
        return res.status(400).json({ error: "Book ID already exists." });
    }

    const newBook = { book_id, title, author, genre, year, copies };
    books.push(newBook);
    saveBooks(books);
    res.status(201).json(newBook);
});

app.get("/books", (req, res) => {
    res.json(loadBooks());
});

app.get("/books/:id", (req, res) => {
    const book = loadBooks().find(b => String(b.book_id) === String(req.params.id));
    if (!book) return res.status(404).json({ error: "Book not found." });
    res.json(book);
});

app.put("/books/:id", (req, res) => {
    let books = loadBooks();
    const index = books.findIndex(b => String(b.book_id) === String(req.params.id));
    if (index === -1) return res.status(404).json({ error: "Book not found." });

    const { book_id, year, copies, ...otherUpdates } = req.body;
    if (book_id && String(book_id) !== String(req.params.id)) {
        return res.status(400).json({ error: "Cannot change book ID." });
    }
    if (year && isNaN(year)) return res.status(400).json({ error: "Year must be a number." });
    if (copies && isNaN(copies)) return res.status(400).json({ error: "Copies must be a number." });

    books[index] = { ...books[index], ...otherUpdates, year: year || books[index].year, copies: copies || books[index].copies };
    saveBooks(books);
    res.json(books[index]);
});

app.delete("/books/:id", (req, res) => {
    let books = loadBooks();
    const newBooks = books.filter(b => String(b.book_id) !== String(req.params.id));
    
    if (books.length === newBooks.length) {
        return res.status(404).json({ error: "Book not found." });
    }
    saveBooks(newBooks);
    res.json({ message: "Book deleted successfully." });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
