var express = require("express");
var router = express.Router();
var Note = require("../models/notes.js");
var Article = require("../models/article.js");
//scraping tools
var request = require("request");
var cheerio = require("cheerio");
var bodyParser = require("body-parser");



// Create all our routes and set up logic within those routes where required.
router.get("/", function(req, res) {
    Article.find({},function(err,data){
    console.log("This is the query of data")
    console.log("=======================================")
    var hbsObject = {
          articles: data
    };
    res.render("index", hbsObject);
  })
});

router.get("/saved", function(req, res) {

    Article.find({}).populate("note").exec(function(err,data){
    console.log("This is the query of Article data")
    console.log("=======================================")

    var hbsObject = {
          articles: data
    };

    res.render("saved", hbsObject);
  })
});


// scrape site data
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
  }).then(function(){
    res.redirect("/")

  })
 
  // Article.find({}, function(err,data){
  //   console.log("This is the query of data")
  //   console.log("=======================================")
  //   var hbsObject = {
  //         articles: doc
  //   };
  //   res.render("index", hbsObject);
  // })
  
  // Tell the browser that we finished scraping the text


});

// Adding card to saved list

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

// removing card from saved list
router.put("/api/remove/:id", function(req, res) {
 
  Article.update({
      _id: req.params.id
    }, 
    {
      $set:{
        saved: false,
        note:[]
      }
  }).then(function(){
     res.redirect("/saved");
     console.log("put success")
  })
});


// Adding Note

router.post("/api/add/note/:id", function(req, res) {
  console.log("Note Body:");
  console.log(req.body);

  
  var newNote = new Note(req.body);
  
  newNote.save(function(error, doc) {
    
    if (error) {
       res.redirect("/saved");
    }
    else {
      Article.findOneAndUpdate({_id: req.params.id}, { $push: { "note": doc._id } }, { new: true }, function(err, newdoc) {
        // Send any errors to the browser
        if (err) {
          res.send(err);

        }
        // Or send the newdoc to the browser
        else {
          res.redirect("/saved");
        }
      });
    }
  });
});


router.get("/api/delete/scrape", function(req, res) {
 
  Article.remove({ saved: false }, function (err) {
  if (err) return handleError(err);
  // removed!
  });
  res.redirect("/");
 
});





// Export routes for server.js to use.
module.exports = router;