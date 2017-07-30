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
const port = process.env.PORT || 3000;

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
    TrafficImg.find().then((trafficeimgs) =>{
        res.send({trafficeimgs});
    }, (e) =>{
        res.status(400).send(e);
    });
});

app.get('/trafficImage/:id',(req, res) =>{
    var id = req.params.id;

    TrafficImg.findById(id).then((img) =>{
        if(!img){
            return res.status(404).send();
        }

        res.send({img});
    }).catch((e) =>{
        res.status(400).send();
    })

});

var options = {
    host:'datamall2.mytransport.sg',
    path:'/ltaodataservice/Traffic-Images',
     headers: {
    'accept': 'application/json',
    'AccountKey': 'TKpt3178RxCAX5/k/Tmg3w=='
  }
}

app.get('/Image',(req1, res1) =>{
    
    var req = http.get(options, function(res) {
       // console.log('HEADERS: ' + JSON.stringify(res));

        // Buffer the body entirely for processing as a whole.
        var bodyChunks = [];
        var respBody = [];
        res.on('data', function(chunk) {
            // You can process streamed parts here...
            bodyChunks.push(chunk);
           
        })
        .on('end', function() {
            var body = Buffer.concat(bodyChunks);
            console.log('BODY value: ' + body);

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
           
            // ...and/or process the entire body here.
            // for(var i = 0; i < body.value.length;i++){
            //     var entry = body.value[i];
            //      console.log('entry : ' + entry);

            // }
             
         res1.send(respBody);
        });
       
    });

    req.on('error', function(e) {
        console.log('ERROR: ' + e.message);
    });

    return req;

});
var rule = new schedule.RecurrenceRule();

rule.second = new schedule.Range(0, 59, 5);
var j = schedule.scheduleJob(rule, function(){
     var currdatetime = new Date();
     console.log(currdatetime);
     console.log('Get Data from datamall2!');
     var req = http.get(options, function(res) {
        var bodyChunks = [];
        var respBody = [];
        res.on('data', function(chunk) {
            bodyChunks.push(chunk);
           
        })
        .on('end', function() {
            var body = Buffer.concat(bodyChunks);
           // console.log('BODY value: ' + body);

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

app.listen(port, () =>{
    var currdatetime = new Date();
console.log(currdatetime);
    console.log(`Started up at port ${port}`);
});

module.exports = {app};