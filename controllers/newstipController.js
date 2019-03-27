//back-end action

var express = require("express");
var router = express.Router();
var newsitem = require("../models/newsitem.js");

// Create all our routes and set up logic within those routes where required.
// router. Controller methods and model methods must match, but ORM must stay the same
router.get("/", function(req, res) {
    newsitem.find({})
    .then(function(data){
      var hbsObject = {
        newsitem: data
      };
      console.log(hbsObject);
      res.render("index", hbsObject);
    });
  });
  
  router.post("/api/newsitems", function(req, res) {
    newsitem.insertOne([
      "newsitem_name", "devoured"
    ], [
      req.body.newsitem_name, req.body.devoured
    ], function(result) {
      // Send back the ID of the new quote
      res.json({ id: result.insertId });
    });
  });


  router.put("/api/newsitems/:id", function(req, res) {
    var condition = "id = " + req.params.id;
  
    console.log("condition", condition);
  
    newsitem.updateOne({
      devoured: req.body.devoured
    }, condition, function(result) {
      if (result.changedRows == 0) {
        // If no rows were changed, then the ID must not exist, so 404
        return res.status(404).end();
      } else {
        res.status(200).end();
      }
    });
  });
  

// Export routes for server.js to use.
module.exports = router;
