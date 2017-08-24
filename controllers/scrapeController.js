var express = require("express");
var router = express.Router();
// var Note = require("./models/Note.js");
var Article = require("../models/article.js");
//scraping tools
var request = require("request");
var cheerio = require("cheerio");



// Create all our routes and set up logic within those routes where required.
router.get("/", function(req, res) {
    Article.find({}, function(err,data){
    console.log("This is the query of data")
    console.log("=======================================")
    var hbsObject = {
          articles: data
    };
    res.render("index", hbsObject);
  })
});

router.get("/saved", function(req, res) {
    Article.find({}, function(err,data){
    console.log("This is the query of data")
    console.log("=======================================")
    var hbsObject = {
          articles: data
    };
    res.render("saved", hbsObject);
  })
});


router.get("/scrape", function(req, res) {
  console.log("scrape")
  request("http://www.travelandleisure.com/travel-guide", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // Now, we grab every h2 within an article tag, and do the following:
    $("li").each(function(i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).find(".grid__item__title").text();
      result.con = $(this).find(".grid__item__cat").text();
      result.pic = $(this).find("source").first().attr("data-srcset");
      // Using our Article model, create a new entry
      // This effectively passes the result object to the entry (and the title and link)
      if(result.title != ""){
        var entry = new Article(result);
        console.log(entry)
        

        Article.findOne({title: result.title}, function (err, success) {
          if (err) {
              console.log(err);
              res.send(err);
          }
          else{
            console.log(success)
            if(success==null){
              entry.save(function(err, doc) {
                // Log any errors
                if (err) {
                  console.log(err);
                }
                // Or log the doc
                else {
                  console.log(doc);
                  
                }
              });
            } 
          }
        })
      }

    });
  });
 
  Article.find({}, function(err,data){
    console.log("This is the query of data")
    console.log("=======================================")
    var hbsObject = {
          articles: data
    };
    res.render("index", hbsObject);
  })
  
  // Tell the browser that we finished scraping the text


});



router.put("/api/add/:id", function(req, res) {
 
  Article.update({
      _id: req.params.id
    }, 
    {
      $set:{
        saved: true
      }
  }).then(function(){
     res.redirect("/");
     console.log("put success")
  })
});

// DELETE ENTRY
  router.delete("/:id", function(req, res) {
    db.burgers.destroy({
      where: {
        id: req.params.id
      }
    })
    .then(function() {
      res.redirect("/");
    });
  });

// Export routes for server.js to use.
module.exports = router;