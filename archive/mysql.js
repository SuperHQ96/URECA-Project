var mysql = require('mysql');

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "practice"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});
var results;
var q = 'SELECT * FROM cats'
connection.query(q, function(error, results, fields){
	if(error) throw error;
	//console.log(results[1]);
	results = results[1];
	console.log(results);
})
