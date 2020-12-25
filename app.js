var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const sequelize = require('./models').sequelize;

try{
  sequelize.authenticate().then(()=>{
      console.log("Connected to DB")
    }
  );
  
}catch(e){
  console.log('Could not connect to DB');
}

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error();
  err.status = 404;
  err.message= 'Book Not Found';
    
    res.status(404).render('page-not-found', {err});
  //next(createError(404, "Page not found. Try looking for another book from the Home Page"));
});

// error handler
app.use(function(err, req, res, next) { 
  // render the error page

  if(err.status === 404){
    res.status(404).render('page-not-found', {err});
  }
  else{
    err.status = err.status || 500;
    err.message = err.message || 'Something went wrong. Maybe we can find a book to help us out.';
    res.status(err.status).render('error', {err});
  }
});

module.exports = app;
