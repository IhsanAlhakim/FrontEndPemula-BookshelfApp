document.addEventListener('DOMContentLoaded', function() {
    let books = [];
    const RENDER_EVENT = 'render-book';
    const SAVED_EVENT = 'saved-book';
    const STORAGE_KEY = 'BOOKSHELF';    


    const inputCheckBox = document.getElementById('inputBookIsComplete');
    inputCheckBox.addEventListener('change', function() {
        const submitButton = document.getElementById('bookSubmit');

        if(this.checked) {
            submitButton.innerHTML = 'Masukkan Buku ke rak <span>selesai dibaca</span>';
        } else {
            submitButton.innerHTML = 'Masukkan Buku ke rak <span>Belum selesai dibaca</span>';
        }
    })

    const submitForm = document.getElementById('inputBook');
    submitForm.addEventListener('submit', function(event) {
        event.preventDefault();
        addBook();
        defaultInput();
    });

    const searchButton = document.getElementById('searchSubmit');
    searchButton.addEventListener('click', function(event) {
        event.preventDefault();

        const bookTitleSearched = document.getElementById('searchBookTitle').value.toLowerCase();

        let tempBooks = [];

        for(const book of books) {
            const lowerCaseBook = book['title'].toLowerCase();

            if(lowerCaseBook.includes(bookTitleSearched)) {
                tempBooks.push(book);
            }
        }

        if(tempBooks.length === 0) {
            alert('Data yang dicari tidak ditemukan');
        } else {
            books = tempBooks;
        }

        document.dispatchEvent(new Event(RENDER_EVENT));
    });

    const searchTitleInput = document.getElementById('searchBookTitle');
    searchTitleInput.addEventListener('input', function() {
        if(searchTitleInput.value == '') {
            books = [];
            loadBookDataFromStorage();
        }
    })

    document.addEventListener(RENDER_EVENT, function() {
        const incompleteBooks = document.getElementById('incompleteBookshelfList');
        incompleteBooks.innerHTML = '';
        
        const completedBooks = document.getElementById('completeBookshelfList');
        completedBooks.innerHTML = '';

        for(const bookItem of books) {
            const bookElement = makeBook(bookItem);
            if(!bookItem.isCompleted) {
                incompleteBooks.append(bookElement);
            } else {
                completedBooks.append(bookElement);
            }
        }
    });

    document.addEventListener(SAVED_EVENT, function() {
        console.log(localStorage.getItem(STORAGE_KEY));
    });


    function isStorageExist() {
        if(typeof (Storage) === undefined) {
            alert('Browser anda tidak mendukung local storage');
            return false;
        }
        return true;
    }

    function addBook() {
        const bookTitle = document.getElementById('inputBookTitle').value;
        const bookAuthor = document.getElementById('inputBookAuthor').value;
        const bookYear = document.getElementById('inputBookYear').value;
        const isCompleted = document.getElementById('inputBookIsComplete').checked;

        const generatedID = generateId();
        const bookObject = generateBookObject(generatedID, bookTitle, bookAuthor, bookYear, isCompleted);
        books.push(bookObject);

        document.dispatchEvent(new Event(RENDER_EVENT));
        saveBookDataToStorage();

        alert('Data buku berhasil disimpan');
    }

    function generateId() {
        return +new Date();
    }

    function generateBookObject(id, title, author, year, isCompleted) {
        return {
            id,
            title,
            author,
            year,
            isCompleted
        }
    }

    function makeBook(bookObject) {
        const textTitle = document.createElement('h3');
        textTitle.innerText = bookObject.title;

        const textAuthor = document.createElement('p');
        textAuthor.innerText = `Penulis: ${bookObject.author}`;

        const textYear = document.createElement('p');
        textYear.innerText = `Tahun: ${bookObject.year}`;

        const articleElement =  document.createElement('article');
        articleElement.classList.add('book_item');
        articleElement.append(textTitle, textAuthor, textYear);

        const actionElement = document.createElement('div');
        actionElement.classList.add('action');

        if(bookObject.isCompleted) {
            const undoButton = document.createElement('button');
            undoButton.innerText = 'Belum selesai dibaca'
            undoButton.classList.add('green');

            undoButton.addEventListener('click', function() {
                undoBookFromCompleted(bookObject.id);
            });

            actionElement.append(undoButton);
        } else {
            const completeButton = document.createElement('button');
            completeButton.innerText = 'Selesai dibaca'
            completeButton.classList.add('green');

            completeButton.addEventListener('click', function() {
                addBooktoCompleted(bookObject.id);
            });

            actionElement.append(completeButton);
        }

        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'Hapus buku';
        deleteButton.classList.add('red');

        deleteButton.addEventListener('click', function() {
            removeBook(bookObject.id);
        })

        actionElement.append(deleteButton);

        articleElement.append(actionElement);

        return articleElement;
    }

    function addBooktoCompleted(bookId) {
        const bookTarget = findBook(bookId);

        if(bookTarget == null) return;

        bookTarget.isCompleted = true;
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveBookDataToStorage();
    }

    function undoBookFromCompleted(bookId) {
        const bookTarget = findBook(bookId);

        if(bookTarget == null) return;

        bookTarget.isCompleted = false;
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveBookDataToStorage();
    }

    function findBook(bookId) {
        for(const bookItem of books) {
            if(bookItem.id === bookId) {
                return bookItem;
            }
        }
        return null;
    }

    function removeBook(bookId){
        const bookTarget = findBookIndex(bookId);

        if(bookTarget === -1) return;

        books.splice(bookTarget, 1);
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveBookDataToStorage();

        alert('Data buku dihapus')
    }

    function findBookIndex(bookId) {
        for(const index in books) {
            if(books[index].id === bookId) {
                return index;
            }
        }

        return -1;
    }

    function saveBookDataToStorage() {
        if(isStorageExist()) {
            const parsed = JSON.stringify(books);
            localStorage.setItem(STORAGE_KEY, parsed);
            document.dispatchEvent(new Event(SAVED_EVENT));
        }
    }

    function loadBookDataFromStorage() {
        const serializedData = localStorage.getItem(STORAGE_KEY);
        let data = JSON.parse(serializedData);

        if(data !== null) {
            for(const book of data) {
                books.push(book);
            }
        }

        document.dispatchEvent(new Event(RENDER_EVENT));
    }

    function defaultInput() {
        document.getElementById('inputBookTitle').value = '';
        document.getElementById('inputBookAuthor').value = '';
        document.getElementById('inputBookYear').value = '';
        document.getElementById('inputBookIsComplete').checked = false;

        const submitButton = document.getElementById('bookSubmit');
        submitButton.innerHTML = 'Masukkan Buku ke rak <span>Belum selesai dibaca</span>';
    }


    if(isStorageExist()) {
        loadBookDataFromStorage();
    } 
});