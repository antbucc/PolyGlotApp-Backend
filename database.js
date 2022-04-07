var util= require('util');
//var encoder = new util.TextEncoder('utf-8');
var cor_st= require('core-js/stable');
var MongoClient = require('mongodb').MongoClient;
var config = require('./local_config.js');

//riga di esempio
var row1= require('./quiz1.json');


// Connection URL
//var url="mongodb://localhost:27017/db_quiz";
var url="mongodb://"+config.connection.host+":"+config.port+"/"+config.connection.database;


console.log("mi connetto a "+ url);


MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log("connesso");

  var dbo = db.db(config.connection.database);
  dbo.collection("quiz").insertOne(row1, function(err, res) {
    if (err) throw err;

    console.log("1 document inserted");
    db.close();
  });
  
});