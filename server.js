var express = require('express');
var app = express();
var jade = require('jade');
var path = require('path');
var viewPath = path.join(__dirname, 'app/views');
var validurl = require('valid-url');

app.locals.pretty = true;
app.set('port', (process.env.PORT || 8080));

app.set('view engine', 'jade');
app.set('views', viewPath);

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

app.get('/', function (req, res) {
  res.render('index', { title: 'URL Shortener microservice', mainHeader: 'API Basejump: URL Shortener microservice' });
});

app.get('/new/:longurl', function (req, res) {

  //get the long url and check if valid, else return error
  var urlParam = req.params.longurl;
  if (!validurl.isWebUri(urlParam)) {
    res.json({error: "URL invalid"})
  }
  else {
    // if valid store in MongoDB and create a number for that urlnodemond
    // return original_url and short_url
    res.json({error: "URL valid " + urlParam});
  }
  
});

app.get('/:id', function (req, res) {

  // get the mongo document that matches the id passed in.
  
  // redirect to that website
  
   var url = "https://google.ca";
  res.redirect(url);
});




