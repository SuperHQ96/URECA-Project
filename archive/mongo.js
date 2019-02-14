var mongo = require('mongodb');

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/test";

//Create Database
// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   console.log("Database created!");
//   db.close();
// });
//
// //Create collection
// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   var dbo = db.db("test");
//   dbo.createCollection("customers", function(err, res) {
//     if (err) throw err;
//     console.log("Collection created!");
//     db.close();
//   });
// });
//
// //INSERT
// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   var dbo = db.db("test");
//   var myobj = { name: "Company Inc", address: "Highway 37" };
//   dbo.collection("customers").insertOne(myobj, function(err, res) {
//     if (err) throw err;
//     console.log("1 document inserted");
//     db.close();
//   });
// });
//
// //FindOne
// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   var dbo = db.db("test");
//   dbo.collection("customers").findOne({}, function(err, result) {
//     if (err) throw err;
//     console.log(result.name);
//     db.close();
//   });
// });
//
// //FindAll
// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   var dbo = db.db("test");
//   dbo.collection("customers").find({}).toArray(function(err, result) {
//     if (err) throw err;
//     console.log(result);
//     db.close();
//   });
// });
//
// //Query
// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   var dbo = db.db("test");
//   var query = { address: "Highway 37" };
//   dbo.collection("customers").find(query).toArray(function(err, result) {
//     if (err) throw err;
//     console.log(result);
//     db.close();
//   });
// });
//
// //Query with Regular Expression
// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   var dbo = db.db("test");
//   var query = { address: /^S/ }; //Address starts with S
//   dbo.collection("customers").find(query).toArray(function(err, result) {
//     if (err) throw err;
//     console.log(result);
//     db.close();
//   });
// });
//
// //Sort
// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   var dbo = db.db("test");
//   var mysort = { name: 1 }; //Use -1 for descending
//   dbo.collection("customers").find().sort(mysort).toArray(function(err, result) {
//     if (err) throw err;
//     console.log(result);
//     db.close();
//   });
// });
//
// //DELETE
// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   var dbo = db.db("test");
//   var myquery = { address: 'Mountain 21' };
//   dbo.collection("customers").deleteOne(myquery, function(err, obj) {
//     if (err) throw err;
//     console.log("1 document deleted");
//     db.close();
//   });
// });
//
// //Delete many
// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   var dbo = db.db("test");
//   var myquery = { address: /^O/ };
//   dbo.collection("customers").deleteMany(myquery, function(err, obj) {
//     if (err) throw err;
//     console.log(obj.result.n + " document(s) deleted");
//     db.close();
//   });
// });
//
// //Drop collection
// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   var dbo = db.db("test");
//   dbo.collection("customers").drop(function(err, delOK) {
//     if (err) throw err;
//     if (delOK) console.log("Collection deleted");
//     db.close();
//   });
// });
// //OR
// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   var dbo = db.db("test");
//   dbo.dropCollection("customers", function(err, delOK) {
//     if (err) throw err;
//     if (delOK) console.log("Collection deleted");
//     db.close();
//   });
// });
//
// //UPDATE
// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   var dbo = db.db("test");
//   var myquery = { address: "Valley 345" };
//   var newvalues = { $set: {name: "Mickey", address: "Canyon 123" } };
//   dbo.collection("customers").updateOne(myquery, newvalues, function(err, res) {
//     if (err) throw err;
//     console.log("1 document updated");
//     db.close();
//   });
// });
//
// //Update many
// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   var dbo = db.db("test");
//   var myquery = { address: /^S/ };
//   var newvalues = {$set: {name: "Minnie"} };
//   dbo.collection("customers").updateMany(myquery, newvalues, function(err, res) {
//     if (err) throw err;
//     console.log(res.result.nModified + " document(s) updated");
//     db.close();
//   });
// });
//
// //Limit
// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   var dbo = db.db("test");
//   dbo.collection("customers").find().limit(5).toArray(function(err, result) {
//     if (err) throw err;
//     console.log(result);
//     db.close();
//   });
// });

//Projection
// MongoClient.connect(url, function(err, db) {
//   if (err) throw err;
//   var dbo = db.db("test");
//   dbo.collection("customers").find({}, {fields: {name: 1, _id: 0}}).toArray(function(err, results) {
//     if (err) throw err;
//     results.forEach(function(result){
//       console.log(result.username);
//     })
//     db.close();
//   });
// });

//Insert into an Array
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("test");
  dbo.collection("customers").update({_id: 1}, {$push: {scores:"Hey"}}, function(err, res) {
    if (err) throw err;
    console.log("1 document updated");
    db.close();
  });
});

//Insert multiple values into Array
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("test");
  dbo.collection("customers").update({_id: 1}, {$push: {scores:{$each: [true, false, 0.99]}}}, function(err, res) {
    if (err) throw err;
    console.log("1 document updated");
    db.close();
  });
});
