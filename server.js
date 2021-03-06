//Dotenv is a zero-dependency module that loads environment variables from a .env file into process.env.
require("dotenv").config();

var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));


// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// // Import routes and give the server access to them.
var routes = require("./controllers/newstipController.js");

app.use(routes);


// Connect to the Mongo DB
// mongoose.connect("mongodb://localhost/newstipsdb", { useNewUrlParser: true });

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/newstipsdb";

mongoose.connect(MONGODB_URI);



// Routes
// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with axios
  // axios.get("http://www.echojs.com/").then(function(response) {

  axios.get("https://www.natureworldnews.com/environment/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);
    // console.log(response.data);

// Now, we grab every h2 within an article tag, and do the following:
    $("div.bk-con").each(function(i, element) {
// Save an empty result object
      var result = {};

// Add the text and href of every link, and save them as properties of the result object
      result.headline = $(this)
        .find("h2.art-ttl")
        .text();
      result.summary = $(this)
        .find("p.art-sum")
        .text().replace('\n', '').trim();
      result.url = $(this)
        .children("a")
        .attr("href");
// console.log(result);
//   });
// });
// });

      // Create a new Article using the `result` object built from scraping
      db.Newsitem.create(result)
        .then(function(dbNewsitem) {
          // View the added result in the console
          console.log(dbNewsitem);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

    // Send a message to the client
    res.send("Scrape Complete");
  });
});

// Route for getting all Articles from the db
app.get("/newsitems", function(req, res) {
  // Grab every document in the Articles collection
  db.Newsitem.find({})
    .then(function(dbNewsitem) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbNewsitem);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/newsitem/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Newsitem.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("comment")
    .then(function(dbNewsitem) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbNewsitem);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/newsitems/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbComment) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Newsitem.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbNewsitem) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbNewsitem);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
