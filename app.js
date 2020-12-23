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
  let err = new Error('Not Found');
    err.status = 404;
    res.render('page-not-found', {title: 'Page Not Found', err});
  //next(createError(404, "Page not found. Try looking for another book from the Home Page"));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  if(!err.message){
    err.message = 'Something went wrong. Maybe we can find a book to help us out.';
  }
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);

  if(err.status === 404){
    res.render('page-not-found', {title:"Page Not Found"});
  }
  else{
    res.render('error', {title:"Server Error"});
  }
});

module.exports = app;
