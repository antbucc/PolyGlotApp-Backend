var util= require('util');
var encoder = new util.TextEncoder('utf-8');
var cor_st= require('core-js/stable');
var MongoClient = require('mongodb').MongoClient;
var config = require('./local_config.js');
const demo= require('./demorow.json');
//riga di esempio
var row1= require('./quiz1.json');
var multirow= require('./multiquiz.json');


// Connection URI
//  "mongodb://admin:password@localhost:27017/?maxPoolSize=20&w=majority";
//var url="mongodb://"+config.connection.user+":"+config.connection.password+"@"+config.connection.host+":"+config.port+"/"+config.connection.database;
var url="mongodb://"+config.connection.host+":"+config.port+"/"+config.connection.database;
console.log("mi connetto a "+ url);


MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log("connesso");

  var dbo = db.db(config.connection.database);
  //Example  row = { name: "Giuseppe", address: "Corso Como 1" };
  dbo.collection("quiz").insertOne(row1, function(err, res) {
    if (err) throw err;

    console.log("1 document inserted");
    //importFromMoodle(multirow);
    db.close();
  });
  
});
function importFromMoodle(dump){
  let newFile ;
  let demoo= Object.keys(demo);
  dump.forEach(element => {
    
    Object.keys(element).forEach(single => {
      //console.log(single);
      for (let index = 0; index < demoo.length; index++) {
        //console.log(demoo[index]);
        //console.log("/t/t/t"+element.keys);    
      }       
    });
    //console.log(Object.keys(element));
});

}





//sudo systemctl start mongod

//sudo systemctl status mongod
