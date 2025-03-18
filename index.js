const express = require("express");
const fs = require("fs");
const app = express();
const PORT = 3000;

app.use(express.json());

const booksFile = "books.json";


const loadBooks = () => {
    if (!fs.existsSync(booksFile)) return [];
    const data = fs.readFileSync(booksFile);
    return JSON.parse(data);
};


const saveBooks = (books) => {
    fs.writeFileSync(booksFile, JSON.stringify(books, null, 2));
};


app.post("/books", (req, res) => {
    let books = loadBooks();
    const { book_id, title, author, genre, year, copies } = req.body;

    if (!book_id || !title || !author || !genre || !year || !copies) {
        return res.status(400).json({ error: "All fields are required." });
    }

    if (books.find(book => book.book_id === book_id)) {
        return res.status(400).json({ error: "Book ID already exists." });
    }

    const newBook = { book_id, title, author, genre, year, copies };
    books.push(newBook);
    saveBooks(books);
    res.status(201).json(newBook);
});


app.get("/books", (req, res) => {
    const books = loadBooks();
    res.json(books);
});


app.get("/books/:id", (req, res) => {
    const books = loadBooks();
    const book = books.find(b => b.book_id.toString() === req.params.id);
    if (!book) return res.status(404).json({ error: "Book not found." });
    res.json(book);
});


app.put("/books/:id", (req, res) => {
    let books = loadBooks();
    const index = books.findIndex(b => b.book_id.toString() === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Book not found." });

    books[index] = { ...books[index], ...req.body };
    saveBooks(books);
    res.json(books[index]);
});


app.delete("/books/:id", (req, res) => {
    let books = loadBooks();
    const newBooks = books.filter(b => b.book_id.toString() !== req.params.id);

    if (books.length === newBooks.length) {
        return res.status(404).json({ error: "Book not found." });
    }

    saveBooks(newBooks);
    res.json({ message: "Book deleted successfully." });
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
