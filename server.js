var http = require("http");
var express = require("express");
var app = express();
var logger = require("morgan")
var bodyParser = require('body-parser')
var cors = require("cors")
var mgrs = require('mgrs')
var server = http.createServer(app);
port = process.env.PORT || 8001;

var MongoClient = require('mongodb').MongoClient

var mongoSettings = require("./mongoConfig.json");


// var auth0Settings = require('./auth0.json')
// var jwt = require('express-jwt');
// var jwtCheck = jwt({
// secret: auth0Settings.secret,
// audience: auth0Settings.audience
// })




app.use(bodyParser.urlencoded({ extended: true })); //Parses urlencoded bodies
app.use(bodyParser.json()) //SendJSON response
app.use(logger('dev'))
app.use(cors());


app.get('/', (req, res) => {
    res.status(200).json('healthy')

})
app.post('/events', (req, res) => {

    console.log(req.body);
    if (!req.body)
        return res.status(400).json({ "status": "there is no body" });
    eventModel.addEvent(req.body, (err, result) => {

        if (err)
        {
            console.log(err);
            return res.status(500).json({ "status": "error while saving into database" });
        }
        return res.status(200).json({
            "status": "event created",
            "result": result
        });
    })



});

app.get('/events', (req, res) => {
    eventModel.fetchAll((err, results) => {
        if (err)
            res.status(400).json({ "status": "error while retrieving events from db" });
        res.status(200).json({ "events": results });
    })
})

app.put('/events',(req,res)=>{

    if(!req.body)
        return res.status(400).json({ "status": "there is no body" });
    eventModel.update()        

})

var EventMongo = require('./eventMongo');

var eventModel;
var linkToMongo = 'mongodb://mongoevents:4xEBhxCQtGsnckIXqS6aXYdvapHfpL9WyLdoGeZq1x6Lko2cxb2v9UJXoP0UsXcljEXd8EAs3gJcCFBbPJlD0A==@mongoevents.documents.azure.com:10255/?ssl=true&replicaSet=globaldb'
// var linkToMongo = `mongodb://${mongoSettings.dbuser}:${mongoSettings.dbpassword}@ds064799.mlab.com:64799/events`

MongoClient.connect(linkToMongo, (err, database) => {
    console.log("Successfuly connected");
    if (err) {
        console.log(err);
    }
    eventModel = new EventMongo(database);



    server.listen(port, () => {
        console.log(`event_api listening on port ${port}`);
    });

});

