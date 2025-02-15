const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';

let editMode = false;
let currentBookId = null;

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year: parseInt(year),
    isComplete: Boolean(isComplete),
  };
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function makeBook(bookObject, showActions = true) {
  const { id, title, author, year, isComplete } = bookObject;

  const div = document.createElement('div');

  const bookTitle = document.createElement('h3');
  bookTitle.innerText = title;
  bookTitle.classList.add('font-semibold', 'text-lg');
  bookTitle.setAttribute('data-testid', 'bookItemTitle');

  const bookAuthor = document.createElement('p');
  bookAuthor.innerText = `Penulis: ${author}`;
  bookAuthor.setAttribute('data-testid', 'bookItemAuthor');

  const bookYear = document.createElement('p');
  bookYear.innerText = `Tahun: ${year}`;
  bookYear.setAttribute('data-testid', 'bookItemYear');

  div.append(bookTitle, bookAuthor, bookYear);

  const container = document.createElement('div');
  container.classList.add('flex', 'justify-between');
  container.setAttribute('data-bookid', id);
  container.setAttribute('data-testid', 'bookItem');

  if (showActions) {
    const actionContainer = document.createElement('div');
    actionContainer.classList.add('flex', 'space-x-5', 'items-center');

    const deleteButton = document.createElement('button');
    deleteButton.innerText = '❌';
    deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
    deleteButton.classList.add('cursor-pointer', 'max-h-fit');
    deleteButton.addEventListener('click', function () {
      removeBookFromShelf(id);
    });

    const editButton = document.createElement('button');
    editButton.innerText = '🖍️';
    editButton.setAttribute('data-testid', 'bookItemEditButton');
    editButton.setAttribute('id', 'btnEdit');
    editButton.classList.add('cursor-pointer', 'max-h-fit');

    const moveButton = document.createElement('button');
    moveButton.innerText = isComplete ? '⏪' : '✅';
    moveButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
    moveButton.classList.add('cursor-pointer', 'max-h-fit');
    moveButton.addEventListener('click', function () {
      toggleBookCompletion(id);
    });

    actionContainer.append(deleteButton, editButton, moveButton);
    container.append(div, actionContainer);
  } else {
    container.append(div);
  }

  return container;
}


function addBook() {
  const id = generateId();
  const title = document.getElementById('bookFormTitle').value;
  const author = document.getElementById('bookFormAuthor').value;
  const year = document.getElementById('bookFormYear').value;
  const isComplete = document.getElementById('bookFormIsComplete').checked;

  const bookObject = generateBookObject(id, title, author, year, isComplete);

  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();

  document.getElementById('bookForm').reset();
  document.getElementById('bookModal').setAttribute('hidden', true);
}

function removeBookFromShelf(bookId) {
  const bookIndex = findBookIndex(bookId);
  if (bookIndex === -1) return;

  books.splice(bookIndex, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function toggleBookCompletion(bookId) {
  const book = findBook(bookId);
  if (book === null) return;

  book.isComplete = !book.isComplete;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function editBook(bookId) {
  const book = findBook(bookId);
  if (book === null) return;

  const newTitle = document.getElementById('bookFormTitle').value;
  const newAuthor = document.getElementById('bookFormAuthor').value;
  const newYear = document.getElementById('bookFormYear').value;
  const isComplete = document.getElementById('bookFormIsComplete').checked;

  book.title = newTitle;
  book.author = newAuthor;
  book.year = parseInt(newYear);
  book.isComplete = Boolean(isComplete);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();

  document.getElementById('bookForm').reset();
  bookModal.setAttribute('hidden', true);
}

function searchBook() {
  const inputSearchBookTitle = document.getElementById("searchBookTitle").value.toLowerCase();
  const searchCountResults = document.getElementById("searchCountResults");
  const searchResultsList = document.getElementById("searchResultsList");
  const searchResults = document.getElementById('searchResults')
  searchResults.removeAttribute('hidden')

  searchResultsList.innerHTML = '';

  if (inputSearchBookTitle === "") {
    searchResultsList.innerHTML = '<p class="text-center text-red-400">Masukkan judul buku untuk mencari.</p>';
    return;
  }

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(inputSearchBookTitle)
  );

  if (filteredBooks.length === 0) {
    searchResultsList.innerHTML = '<p class="text-center text-red-400">Tidak ada buku yang ditemukan.</p>';
  } else {
    searchCountResults.textContent = `Hasil Pencarian: ${filteredBooks.length} item`
    filteredBooks.forEach(book => {
      const bookElement = makeBook(book, false);
      searchResultsList.classList.add('space-y-3')
      searchResultsList.append(bookElement);
    });
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const bookModal = document.getElementById('bookModal');
  const addBookButton = document.getElementById('btnPlus');
  const searchBookButton = document.getElementById('btnSearch');
  const searchBookModal = document.getElementById('searchBookModal');
  const closeModalButton = document.getElementById('closeModal');
  const checkbox = document.getElementById('bookFormIsComplete');
  const bookShelf = document.getElementById('bookShelf');

  checkbox.addEventListener('change', function () {
    if (checkbox.checked) {
      bookShelf.textContent = 'Selesai dibaca';
    } else {
      bookShelf.textContent = 'Belum selesai dibaca';
    }
  })

  addBookButton.addEventListener('click', () => {
    editMode = false;
    bookModal.querySelector('h2').textContent = 'Tambah Buku Baru';
    bookModal.removeAttribute('hidden');
  });

  searchBookButton.addEventListener('click', () => {
    searchBookModal.removeAttribute('hidden')
  })

  closeModalButton.addEventListener('click', () => {
    bookModal.setAttribute('hidden', true);
  });

  window.addEventListener('click', (event) => {
    switch(event.target) {
      case bookModal:
        bookModal.setAttribute('hidden', true)
      case searchBookModal:
        searchBookModal.setAttribute('hidden', true)
      default:
        null
    }
  });

  document.addEventListener('click', (event) => {
    if (event.target && event.target.id === 'btnEdit') {
      editMode = true;
      currentBookId = Number(event.target.closest('[data-bookid]').getAttribute('data-bookid'));

      const book = findBook(currentBookId);
      if (book === null) return;

      document.getElementById('bookFormTitle').value = book.title;
      document.getElementById('bookFormAuthor').value = book.author;
      document.getElementById('bookFormYear').value = book.year;
      document.getElementById('bookFormIsComplete').checked = book.isComplete;

      bookModal.querySelector('h2').textContent = 'Edit Buku';
      bookModal.removeAttribute('hidden');
    }
  });

  const searchBookForm = document.getElementById('searchBook');
  searchBookForm.addEventListener('submit', function (event) {
    event.preventDefault();
    searchBook();
  });

  const submitForm = document.getElementById('bookForm');
  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    console.log(editMode)
    console.log(currentBookId)
    editMode ? editBook(currentBookId) : addBook();

    editMode = false
    currentBookId = null
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(SAVED_EVENT, () => {
  console.log('Data berhasil di simpan.');
});

document.addEventListener(RENDER_EVENT, function () {
  const sectionIncompleteBookList = document.getElementById('sectionIncompleteBookList');
  const sectionCompleteBookList = document.getElementById('sectionCompleteBookList');
  const incompleteBookList = document.getElementById('incompleteBookList');
  const completeBookList = document.getElementById('completeBookList');
  const countBook = document.getElementById('countBook');

  const count = books.length;
  countBook.textContent = count;

  incompleteBookList.innerHTML = '';
  completeBookList.innerHTML = '';

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (bookItem.isComplete) {
      completeBookList.append(bookElement);
    } else {
      incompleteBookList.append(bookElement);
    }
  }

  if (!incompleteBookList.childElementCount || !sectionIncompleteBookList.childElementCount) {
    incompleteBookList.classList.remove('border', 'border-gray-400', 'p-5', 'text-sm', 'rounded-lg', 'space-y-3');
    sectionIncompleteBookList.classList.add('h-[180px]');
    sectionIncompleteBookList.classList.remove('max-h-fit');
  } else {
    incompleteBookList.classList.add('border', 'border-gray-400', 'p-5', 'text-sm', 'rounded-lg', 'space-y-3');
    sectionIncompleteBookList.classList.remove('h-[180px]');
    sectionIncompleteBookList.classList.add('max-h-fit');
  }

  if (!completeBookList.childElementCount || !sectionCompleteBookList.childElementCount) {
    completeBookList.classList.remove('border', 'border-gray-400', 'p-5', 'text-sm', 'rounded-lg', 'space-y-3');
    sectionCompleteBookList.classList.add('h-[180px]');
    sectionCompleteBookList.classList.remove('max-h-fit');
  } else {
    completeBookList.classList.add('border', 'border-gray-400', 'p-5', 'text-sm', 'rounded-lg', 'space-y-3');
    sectionCompleteBookList.classList.remove('h-[180px]');
    sectionCompleteBookList.classList.add('max-h-fit');
  }
});
