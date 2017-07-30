var mongoose = require('mongoose');

var trafficimg = mongoose.model('trafficimg',{
    CameraID: Number,
    Latitude: String,
    Longitude: String,
    ImageLink: String
});

module.exports = {trafficimg};