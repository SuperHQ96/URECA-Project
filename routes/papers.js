var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var mongo = require('mongodb');

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "ureca"
});

var MongoClient = mongo.MongoClient;
var url = "mongodb://localhost:27017/test";

router.get('/papers', isLoggedIn, function(req, res){
  let years;
  let users;
  var promise1 = new Promise(function(resolve, reject){
    MongoClient.connect(url, function(err, db) {
      if (err) return reject(err);
      var dbo = db.db("ureca");
      dbo.collection("users").find({}, {fields: {username: 1, _id: 0}}).toArray(function(err, results) {
        if (err) throw err;
        users = results;
        db.close();
        resolve();
      });
    });
  })
  promise1.then(function(){
    connection.query('SELECT DISTINCT paperYear FROM papers;', function(error, results, fields){
      years = results;
    })
    connection.query('SELECT * FROM papers', function(error, results, fields){
      if(error) throw error;
      res.render("papers_management/papers/papers_records", {papers: results, years: years, users: users});
    })
  })
})

router.get('/papers/new', isLoggedIn, function(req, res){
  let users;
  var promise1 = new Promise(function(resolve, reject){
    MongoClient.connect(url, function(err, db) {
      if (err) return reject(err);
      var dbo = db.db("ureca");
      dbo.collection("users").find({}, {fields: {username: 1, _id: 0}}).toArray(function(err, results) {
        if (err) throw err;
        users = results;
        db.close();
        resolve();
      });
    });
  })
  promise1.then(function(){
    connection.query('SELECT course_code FROM courses', function(error, results, fields){
      res.render("papers_management/papers/paper_new", {course_codes: results, users: users});
    })
  })

})

router.post('/paper/update', isLoggedIn, function(req, res){
  let users;
  let course_codes;
  var promise1 = new Promise(function(resolve, reject){
    MongoClient.connect(url, function(err, db) {
      if (err) return reject(err);
      var dbo = db.db("ureca");
      dbo.collection("users").find({}, {fields: {username: 1, _id: 0}}).toArray(function(err, results) {
        if (err) throw err;
        users = results;
        db.close();
        resolve();
      });
    });
  })
  promise1.then(function(){
    connection.query('SELECT course_code FROM courses', function(error, results, fields){
      if(error) throw(error);
      course_codes = results;
    })
    connection.query(`SELECT * FROM papers WHERE paperID = ${mysql.escape(req.body.paper_id)}`, function(error, results, fields){
      if(error) throw error;
      res.render("papers_management/papers/paper_update", {paper: results[0], course_codes: course_codes, users: users});
    })
  })
})

router.get('/due_dates', isLoggedIn, function(req, res){
  let years;
  connection.query('SELECT DISTINCT YEAR(dueDate) FROM due_dates;', function(error, results, fields){
    if(error) throw error;
    years = results
  })
  connection.query('SELECT dueDateCode, DATE_FORMAT(dueDate, "%d %M %Y") AS dueDate, dueDateDescription FROM due_dates;', function(error, results, fields){
    if(error) throw error;
    res.render('papers_management/due_dates/due_date_records', {due_dates: results, years: years});
  })
})

router.post('/due_date/add', isLoggedIn, function(req, res){
  connection.query(`SELECT paperID, course_code, paperSem, paperYear FROM papers WHERE paperID NOT IN (SELECT paperID FROM paperSubmission WHERE dueDateCode = ${mysql.escape(req.body.dueDateCode)}) ORDER BY paperID;`, function(error, results, fields){
    if(error) throw error;
    res.render('papers_management/due_dates/due_date_add_paper', {papers: results, date: req.body.due_date});
  })
})

router.get('/due_date/new', isLoggedIn, function(req, res){
  res.render('papers_management/due_dates/due_date_new');
})

router.get('/history', isLoggedIn, function(req, res){
  connection.query('SELECT * FROM papers', function (error, results, fields){
    res.render('papers_management/history', {papers: results});
  })
})

router.post('/paper_log', isLoggedIn, function(req, res){
  let next_due_date;
  let paper_info;
  let PaperID;
  if(req.body.paperID) {
    PaperID = req.body.paperID
  } else if (req.query.paperID) {
    PaperID = req.query.paperID
  } else {
    res.redirect('/');
  }
  connection.query(`SELECT course_code, paperYear, paperSem FROM papers where paperID = ${PaperID};`, function(error, results, fields){
    paper_info = results[0];
  })
  connection.query(`SELECT DATE_FORMAT(dueDate, "%d %M %Y") AS dueDate, dueDateDescription, dueDateCode, paperID FROM due_dates NATURAL JOIN (SELECT * FROM paperSubmission WHERE submitted IS FALSE AND paperID = ${PaperID}) AS SUBQUERY ORDER BY dueDate LIMIT 1;`, function(error, results, fields){
    next_due_date = results[0];
  })
  connection.query(`SELECT DATE_FORMAT(trackingDateTime, "%d %M %Y") AS paperDate, DATE_FORMAT(trackingDateTime, "%I:%i %p") AS paperTime, paperStatus, remarks FROM paper_history WHERE paperID = ${PaperID} ORDER BY trackingDateTime;`, function(error, results, fields){
    res.render('papers_management/paper_log', {next_due_date: next_due_date, paper_logs: results, paper: paper_info});
  })
})

router.post('/paper/update_status', isLoggedIn, function(req, res){
  connection.query(`SELECT course_code, paperYear, paperSem FROM papers where paperID = ${req.body.paperID};`, function(error, results, fields){
    res.render('papers_management/paper_update_status', {paper: results[0], paperID: req.body.paperID});
  })
})

router.post('/paper_updating_status', isLoggedIn, function(req, res){
  const new_log = {paperID: req.body.paperID, paperStatus: req.body.status, remarks: req.body.remarks};
	connection.query('INSERT INTO paper_history SET ?', new_log, (error, res) => {
		if(error) throw error;
	})
  var string = encodeURIComponent(req.body.paperID);
  res.redirect('/paper_log?paperID=' + string);
})

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

module.exports = router;
