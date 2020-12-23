const express = require('express');
const router = express.Router();
const Book = require('../models').Book;
const { Op } = require("sequelize");


/* Handler function to wrap each route. */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      // Forward error to the global error handler
      next(error);
    }
  }
}

/* GET root directory.  Redirects to /books */
router.get('/', asyncHandler(async (req, res) => {
    res.redirect('/books');
}));

/* GET /books. home page*/
router.get('/books', asyncHandler(async (req, res) => {
  let currentPage;

  //get current page from url if it's provided, otherwise set to 0 for first page
  if(req.query.page){
    currentPage = req.query.page;
  }
  else{
    currentPage = 0;
  }

  const path = req.route.path;
  //create baseURL to be used for pagination links
  const baseURL = path + '?';

  //get all books
  const books = await Book.findAll();


  
  const booksPerPage = 10;
  //get start index for pagination
  const n = currentPage * booksPerPage;
  //check if remaining books for extra page
  const extraPage = books.length % booksPerPage;
  //total num of pages
  const numPages = Math.floor(books.length / booksPerPage) + (extraPage > 0? 1 : 0);
  //get last index for that page
  const maxIndex = currentPage * booksPerPage + booksPerPage;
    
  res.render('index', { title: 'Books', books, currentPage, baseURL, n, maxIndex, numPages });

  // res.render('index', { title: 'Books', books, currentPage, baseURL});
}));

/* GET /books/new. for new book form*/
router.get('/books/new', asyncHandler(async (req, res) => {
  res.render('new-book', { title: 'New Book'});
}));

/* POST /books/new. to create to book*/
router.post('/books/new', asyncHandler(async (req, res) => {
  let book; 
  try{
    book = await Book.create(req.body);
    res.redirect(`/books`);
  } catch(error){
    if(error.name === "SequelizeValidationError"){
      //validation error, show errors and allow for correction
      book = await Book.build(req.body);
      console.dir(error.errors);
      res.render('new-book', {book, errors: error.errors, title: 'New Book'})
    }
    else{
      throw error;
    }

  }
}));

/* GET individual book. */
router.get("/books/:id", asyncHandler(async (req, res) => {
  //get the book by ID
  const book = await Book.findByPk(req.params.id);
  if(book){
    res.render("update-book", { book, title: book.title }); 
  }
  else{
    let err = new Error('Not Found');
    err.status = 404;
    res.render('page-not-found', {title: 'Book Not Found', err});
  }
}));

/* Update a Book. */
router.post('/books/:id', asyncHandler(async (req, res) => {
  let book;
  try{
    //get the book by ID
    book = await Book.findByPk(req.params.id);
    if(book){
      //if book exists, update the bookwith info provided by user
      await book.update(req.body);
      res.redirect(`/books/`);
    } else{
      res.sendStatus(404);
    }
  } catch (error){
    if(error.name === "SequelizeValidationError") {
      //validation error with data entered, save that data and allow user to edit
      book = await Book.build(req.body);
      book.id = req.params.id;
      //render the book detail page with errors and details entered
      res.render('update-book', {book, errors: error.errors, title: 'Edit Book'});
    } else{
      throw error;
    }

  }

}));

/* Delete a book */
router.post('/books/:id/delete', asyncHandler(async (req ,res) => {
  //get the book by ID
  const book = await Book.findByPk(req.params.id);
  if(book){
    //destroy the book
    await book.destroy();
    res.redirect("/books");
  } else{
    //book doesn't exist, so show page not found
    res.sendStatus(404);
  }
}));

/* Search Books */
router.get('/search', asyncHandler(async (req, res) => {
  const query = req.query.query;

  //if user got to just /search without query, show all books
  if(!query || query=== undefined){
    res.redirect('/books');
  }
  //else show them the results of their query
  else{
    const path = req.route.path;
    //url for pagination links to be able to append page number
    const baseURL = path + '?' + (query? `query=${query}&`: '');

    //current page that user is on for pagination. 0 by default
    let currentPage;
    if(req.query.page){
      currentPage = req.query.page;
      console.log('Logging current Page: ' + currentPage);
    }
    else{
      currentPage = 0;
    }

    //get all books with any field LIKE the query
    const books = await Book.findAll({
      where: {
        [Op.or]: [
          {
            title: {
              [Op.like]: `%${query}%`
            }
          },
          {
            author: {
              [Op.like]: `%${query}%`
            }
          },
          {
            genre: {
              [Op.like]: `%${query}%`
            }
          },
          {
            year: {
              [Op.like]: `%${query}%`
            }
          }
        ]
      }
    });
    
    const booksPerPage = 10;
  //get start index for pagination
  const n = currentPage * booksPerPage;
  //check if remaining books for extra page
  const extraPage = books.length % booksPerPage;
  //total num of pages
  const numPages = Math.floor(books.length / booksPerPage) + (extraPage > 0? 1 : 0);
  //get last index for that page
  const maxIndex = currentPage * booksPerPage + booksPerPage;

    res.render('index', { title: 'Books', books, query, currentPage, baseURL, n, maxIndex, numPages });
  }
}));


module.exports = router;
