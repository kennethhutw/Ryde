require('./config/config');

const _= require('lodash');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {trafficimg} = require('./models/trafficImg');
var schedule = require('node-schedule');

var app = express();

app.use(express.static(__dirname +'/../'));
app.set('view engine', 'ejs');
var itemRouter = express.Router();

const port = process.env.PORT || 3000;


var options = {
    host:'datamall2.mytransport.sg',
    path:'/ltaodataservice/Traffic-Images',
     headers: {
    'accept': 'application/json',
    'AccountKey': 'AccountKey'
  }
}

app.use(bodyParser.json());

app.post('/trafficImage',(req, res) => {
     var trafficImg = new trafficimg({
         CameraID : req.body.CameraID,
         Latitude : req.body.Latitude,
         Longitude : req.body.Longitude,
         ImageLink : req.body.ImageLink
     });

     console.log(trafficImg);
    

     trafficImg.save().then((doc) => {
         console.log('_id : ' + doc._id);
         if (ObjectID.isValid(doc._id)) {
         res.send(doc);
         }
     }, (e) =>{
         res.status(400).send(e);
     });
});

app.get('/trafficImage', (req, res) =>{
    trafficimg.find().then((trafficeimgs) =>{
        res.send({trafficeimgs});
    }, (e) =>{
        res.status(400).send(e);
    });
});

app.get('/trafficImage/:id',(req, res) =>{
    var id = req.params.id;

    trafficimg.findOne({"CameraID": id}).then((img) =>{
        if(!img){
            return res.status(404).send();
        }

        res.send({img});
    }).catch((e) =>{
        res.status(400).send();
    })

});



app.get('/Image',(req1, res1) =>{
    
    var req = http.get(options, function(res) {
        var bodyChunks = [];
        var respBody = [];
        res.on('data', function(chunk) {
            bodyChunks.push(chunk);    
        })
        .on('end', function() {
            var body = Buffer.concat(bodyChunks);
            var obj = JSON.parse(body);
            obj.value.forEach(function(entry) {
                console.log(entry);
                  var trafficImg = new trafficimg({
                    CameraID : entry.CameraID,
                    Latitude : entry.Latitude,
                    Longitude : entry.Longitude,
                    ImageLink : entry.ImageLink
                });
                    
                respBody.push(trafficImg);

                trafficImg.save().then((res) => {
                   
                }, (e) =>{
                    res.status(400).send(e);
                });
            });
             
         res1.send(respBody);
        });
       
    });

    req.on('error', function(e) {
        console.log('ERROR: ' + e.message);
    });

    return req;

});
var rule = new schedule.RecurrenceRule();

rule.minute = new schedule.Range(0, 59, 5);
var j = schedule.scheduleJob(rule, function(){
     var currdatetime = new Date();
     console.log(currdatetime);
     console.log(currdatetime +': Get Data from datamall!');
     var req = http.get(options, function(res) {
        var bodyChunks = [];
        var respBody = [];
        res.on('data', function(chunk) {
            bodyChunks.push(chunk);
           
        })
        .on('end', function() {
            var body = Buffer.concat(bodyChunks);
            var obj = JSON.parse(body);
            obj.value.forEach(function(entry) {
               // console.log(entry);
                  var trafficImg = new trafficimg({
                    CameraID : entry.CameraID,
                    Latitude : entry.Latitude,
                    Longitude : entry.Longitude,
                    ImageLink : entry.ImageLink
                });
                    
                respBody.push(trafficImg);

                trafficImg.save().then((res) => {
                   
                }, (e) =>{
                    res.status(400).send(e);
                });
            });

        });
    });

    req.on('error', function(e) {
        console.log('ERROR: ' + e.message);
    });
});



app.get('/', function(req1, res1){
      var req = http.get(options, function(res) {
        var bodyChunks = [];
        var respBody = [];
        res.on('data', function(chunk) {
            bodyChunks.push(chunk);
           
        })
        .on('end', function() {
            var body = Buffer.concat(bodyChunks);

            var obj = JSON.parse(body);
            obj.value.forEach(function(entry) {
                  var trafficImg = new trafficimg({
                    CameraID : entry.CameraID,
                    Latitude : entry.Latitude,
                    Longitude : entry.Longitude,
                    ImageLink : entry.ImageLink
                });
                respBody.push(trafficImg);
            });
            res1.render('index', {data: respBody});
        });
    });

    req.on('error', function(e) {
        console.log('ERROR: ' + e.message);
    });
  
});


 app.get('/list', function(req, res) {
    
     trafficimg.find().limit(50).then((data) => {
         console.log("length" + data.length);
        res.render('list', {data: data});
    }, (e) => {
        res.status(400).send(e);
    });
 });

  app.get('/search', function(req, res) {
    
     trafficimg.find().limit(50).then((data) => {
         console.log("length" + data.length);
        res.render('search', {data: data});
    }, (e) => {
        res.status(400).send(e);
    });
 });




app.listen(port, () =>{
    var currdatetime = new Date();
    console.log(currdatetime);
    console.log(`Started up at port ${port}`);
});

module.exports = {app};