
    // Data and State
    const library = {
        books: JSON.parse(localStorage.getItem('books')) || [],
        currentFilter: 'all',
        currentSearch: '',
        selectedBookId: null
    };

    // Sample books if empty
    if (library.books.length === 0) {
        addSampleBooks();
    }

    function addBook(book) {
        const newBook = {
            ...book,
            id: Date.now().toString(),
            addedDate: new Date().toLocaleDateString()
        };
        library.books.unshift(newBook);
        saveToLocalStorage();
        updateStats();
        renderBooks();
        showToast('Book added successfully!');
    }

    function deleteBook(id) {
        library.books = library.books.filter(book => book.id !== id);
        saveToLocalStorage();
        updateStats();
        renderBooks();
        showToast('Book deleted successfully!');
    }

    function toggleBookStatus(id) {
        library.books = library.books.map(book => {
            if (book.id === id) {
                book.status = book.status === 'available' ? 'borrowed' : 'available';
            }
            return book;
        });
        saveToLocalStorage();
        updateStats();
        renderBooks();
        showToast('Book status updated!');
    }

    function filterBooks(filter) {
        library.currentFilter = filter;
        renderBooks();
    }

    function searchBooks(query) {
        library.currentSearch = query.toLowerCase();
        renderBooks();
    }

    function getFilteredBooks() {
        let filtered = library.books;

        if (library.currentSearch) {
            filtered = filtered.filter(book =>
                book.title.toLowerCase().includes(library.currentSearch) ||
                book.author.toLowerCase().includes(library.currentSearch) ||
                book.isbn.toLowerCase().includes(library.currentSearch)
            );
        }

        if (library.currentFilter !== 'all') {
            filtered = filtered.filter(book => book.status === library.currentFilter);
        }

        return filtered;
    }

    function saveToLocalStorage() {
        localStorage.setItem('books', JSON.stringify(library.books));
    }

    function updateStats() {
        document.getElementById('totalBooks').textContent = library.books.length;
        document.getElementById('availableBooks').textContent =
            library.books.filter(book => book.status === 'available').length;
        document.getElementById('borrowedBooks').textContent =
            library.books.filter(book => book.status === 'borrowed').length;
    }

    function renderBooks() {
        const booksContainer = document.getElementById('booksContainer');
        const noBooksMessage = document.getElementById('noBooksMessage');
        const filteredBooks = getFilteredBooks();

        if (filteredBooks.length === 0) {
            booksContainer.style.display = 'none';
            noBooksMessage.style.display = 'block';
        } else {
            booksContainer.style.display = 'grid';
            noBooksMessage.style.display = 'none';

            booksContainer.innerHTML = filteredBooks.map(book => `
                <div class="book-card" data-id="${book.id}">
                    <div class="book-content">
                        <div class="book-header">
                            <h3 class="book-title">${book.title}</h3>
                            <span class="book-status ${book.status === 'available' ? 'status-available' : 'status-borrowed'}">
                                ${book.status === 'available' ? 'Available' : 'Borrowed'}
                            </span>
                        </div>
                        <p class="book-author">by ${book.author}</p>
                        <div class="book-meta">
                            <span>${book.pages} pages</span>
                            <span>${book.addedDate}</span>
                        </div>
                    </div>
                    <div class="book-actions">
                        <button class="action-btn view-details" data-id="${book.id}">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }

    function showToast(message) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toastMessage');
        toastMessage.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    function addSampleBooks() {
        const sampleBooks = [
            {
                title: "The Great Gatsby",
                author: "F. Scott Fitzgerald",
                isbn: "9780743273565",
                pages: 180,
                status: "available",
            },
            {
                title: "To Kill a Mockingbird",
                author: "Harper Lee",
                isbn: "9780061120084",
                pages: 281,
                status: "borrowed",
            },
            {
                title: "1984",
                author: "George Orwell",
                isbn: "9780451524935",
                pages: 328,
                status: "available",
            }
        ];

        sampleBooks.forEach(book => {
            book.id = Date.now().toString() + Math.floor(Math.random() * 1000);
            book.addedDate = new Date().toLocaleDateString();
            library.books.push(book);
        });

        saveToLocalStorage();
    }

    // DOM Events
    document.addEventListener('DOMContentLoaded', () => {
        updateStats();
        renderBooks();
        updateFilterButtons('all');
    });

    document.getElementById('addBookBtn').addEventListener('click', () => {
        document.getElementById('addBookModal').classList.add('active');
    });

    document.getElementById('closeModalBtn').addEventListener('click', () => {
        document.getElementById('addBookModal').classList.remove('active');
    });

    document.getElementById('cancelAddBook').addEventListener('click', () => {
        document.getElementById('addBookModal').classList.remove('active');
    });

    document.getElementById('submitBook').addEventListener('click', (e) => {
        e.preventDefault();
        const title = document.getElementById('title').value;
        const author = document.getElementById('author').value;
        const isbn = document.getElementById('isbn').value;
        const pages = document.getElementById('pages').value;
        const status = document.getElementById('status').value;

        if (!title || !author || !isbn || !pages) {
            showToast('Please fill all fields');
            return;
        }

        addBook({ title, author, isbn, pages: parseInt(pages), status });

        document.getElementById('addBookForm').reset();
        document.getElementById('addBookModal').classList.remove('active');
    });

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('view-details') || e.target.closest('.view-details')) {
            const bookId = e.target.closest('.view-details').dataset.id;
            showBookDetails(bookId);
        }

        if (e.target.closest('.book-card') && !e.target.classList.contains('view-details') && !e.target.closest('.view-details')) {
            const bookId = e.target.closest('.book-card').dataset.id;
            showBookDetails(bookId);
        }
    });

    function showBookDetails(bookId) {
        const book = library.books.find(b => b.id === bookId);
        if (!book) return;

        library.selectedBookId = bookId;

        document.getElementById('bookDetailsTitle').textContent = book.title;
        document.getElementById('detailBookTitle').textContent = book.title;
        document.getElementById('detailBookAuthor').textContent = "by " + book.author;
        document.getElementById('detailBookIsbn').textContent = book.isbn;
        document.getElementById('detailBookPages').textContent = book.pages + " pages";
        document.getElementById('detailBookAdded').textContent = book.addedDate;

        const statusElement = document.getElementById('detailBookStatus');
        statusElement.textContent = book.status === 'available' ? 'Available' : 'Borrowed';
        statusElement.className = 'book-status ' + (book.status === 'available' ? 'status-available' : 'status-borrowed');

        document.getElementById('bookDetailsModal').classList.add('active');
    }

    document.getElementById('closeDetailsModalBtn').addEventListener('click', () => {
        document.getElementById('bookDetailsModal').classList.remove('active');
    });

    document.getElementById('toggleStatusBtn').addEventListener('click', () => {
        if (library.selectedBookId) {
            toggleBookStatus(library.selectedBookId);
            document.getElementById('bookDetailsModal').classList.remove('active');
        }
    });

    document.getElementById('deleteBookBtn').addEventListener('click', () => {
        if (library.selectedBookId) {
            if (confirm('Are you sure you want to delete this book?')) {
                deleteBook(library.selectedBookId);
                document.getElementById('bookDetailsModal').classList.remove('active');
            }
        }
    });

    document.getElementById('searchInput').addEventListener('input', (e) => {
        searchBooks(e.target.value);
    });

    document.getElementById('filterAll').addEventListener('click', () => {
        filterBooks('all');
        updateFilterButtons('all');
    });

    document.getElementById('filterAvailable').addEventListener('click', () => {
        filterBooks('available');
        updateFilterButtons('available');
    });

    document.getElementById('filterBorrowed').addEventListener('click', () => {
        filterBooks('borrowed');
        updateFilterButtons('borrowed');
    });

    function updateFilterButtons(activeFilter) {
        const buttons = ['filterAll', 'filterAvailable', 'filterBorrowed'];
        buttons.forEach(id => {
            const btn = document.getElementById(id);
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-secondary');
        });

        const activeId = {
            all: 'filterAll',
            available: 'filterAvailable',
            borrowed: 'filterBorrowed'
        }[activeFilter];

        const activeBtn = document.getElementById(activeId);
        activeBtn.classList.remove('btn-secondary');
        activeBtn.classList.add('btn-primary');
    }
