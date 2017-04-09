var express = require('express');
var app = express();
var jade = require('jade');
var path = require('path');
var viewPath = path.join(__dirname, 'app/views');
var validurl = require('valid-url');

var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var assert = require('assert');
//var url = 'mongodb://localhost:27017/erichoog-db';
var url = process.env.MONGOLAB_URI;

app.locals.pretty = true;
app.set('port', (process.env.PORT || 8080));

app.set('view engine', 'jade');
app.set('views', viewPath);

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

var db;

MongoClient.connect(url, function (err, database) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
      res.json({error: "Unable to connect to the mongoDB server. Error:" + err})
    } 
    else {
      console.log('Connection established to', url);
      db = database;
    }
});

app.get('/', function (req, res) {
  res.render('index', { title: 'URL Shortener microservice', mainHeader: 'API Basejump: URL Shortener microservice' });
});

// app.get('/new', function (req, res) {
//   res.render('index', { title: 'URL Shortener microservice', mainHeader: 'API Basejump: URL Shortener microservice' });
// });

app.get('/new/:longurl(*)', function (req, res) {
  //get the long url and check if valid, else return error
  var urlParam = req.params.longurl;
  if (!validurl.isWebUri(urlParam)) {
    res.json({error: "URL invalid"})
  }
  else {
    // if valid store in MongoDB and create a number for that url
    MongoClient.connect(url, function (err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
      res.json({error: "Unable to connect to the mongoDB server. Error:" + err})
    } 
    else {
      console.log('Connection established to', url);
      
      var shorturls = db.collection( 'shorturls' );
      shorturls.find({original_url: urlParam}).toArray(
        function( err, docs ) {
          if ( err ) {
            console.log( 'Error: Find operation failed' );
            res.json({error: "Error: Find operation failed " + err})
          } else {
            if (docs.length == 1) {
              console.log('Found existing shorturl.' + docs[0]);
              // return original_url and short_url
              var shortUrl = req.protocol + '://' + req.get('host') + '/' + docs[0].short_urlID;
              res.json({original_url: urlParam, short_url: shortUrl});
            }
            else if (docs.length == 0) {
                console.log("TEST1");
                // Perform a total count command
                shorturls.find({}).count(function(err, count) {
                  if (err) {console.log("Error: ", err);}
                  else {
                    console.log("Success Count = ", count);
                    console.log("TEST2");
                  }
                });
                
                var doc = {
                  "original_url": urlParam, 
                  "short_urlID": 2
                };
                
                
                console.log("TEST3");
                shorturls.insertOne(doc, 
                  function (err, result){
                    if (err) {
                      console.log("TEST4 - error");
                      console.log( 'Error: Inserting document' );
                      res.json({error: "Error: Insert operation failed " + err})
                    }
                    else {
                      console.log("TEST5 -good");
                      var shortUrl = req.protocol + '://' + req.get('host') + '/' + doc.short_urlID;
                      res.json({original_url: urlParam, short_url: shortUrl});
                    }
                  })
                // }
              // })
            }
            else {
              res.json({error: "There was an error creating short url"});
            }
          }
        });

      //Close connection
      db.close();
    }
  });
    
    
    
    
  }
}); 

app.get('/:id', function (req, res) {
  // get the mongo document that matches the id passed in.
  // redirect to that website
      var reqParam = req.params.id.toString();
      var doc = findDocuments(reqParam, db, function(docs) {
        console.log(docs);
      });
      
      //console.log(doc);
      // var shorturls = db.collection( 'shorturls' );
      // var reqParam = req.params.id.toString();
      // shorturls.find({'short_urlID': reqParam})
      //   .toArray(function( err, docs ) {
      //     //assert.equal(err, null);
      //       //console.log("Found the following records");
      //       //console.log(docs);
      //       callbackFunc(docs);
          // if ( err ) {
          //   console.log( 'Error: Find operation failed' );
          // } 
          // else {
          //   if (docs.length == 1) {
          //     console.log('Found url.  Redirecting to: ' + docs[0].original_url );
          //     res.redirect(docs[0].original_url);
          //   }
          //   else if (docs.length == 0) {
          //     res.json({error: "There was an error finding the original_url.  Param: " + req.params.id.toString() + ' Doc Count: ' + docs.length});
          //   }
          //   else { 
          //     res.json({error: "There was an error finding the original_url - too many"});
          //     console.log(docs);
          //   }
          // }
        // });

      //Close connection
      //db.close();
    }
});

var findDocuments = function(short_urlID, db, callback) {
  // Get the documents collection
  var collection = db.collection('documents');
  // Find some documents
  collection.find({"short_urlID": short_urlID})
    .toArray(function(err, docs) {
      assert.equal(err, null);
      console.log("Found the following records");
      console.log(docs);
      callback(docs);
  });      
}

      

  




