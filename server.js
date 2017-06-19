// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var cors = require('cors')
var morgan = require('morgan');

// configure app
app.use(morgan('dev')); // log requests to the console

// configure body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
var port = process.env.PORT || 8080; // set our port 8080
var MongoClient = require('mongodb').MongoClient;
var mongoSettings = require("./mongoConfig.json");

// var linkToMongo = `mongodb://${mongoSettings.dbuser}:${mongoSettings.dbpassword}@ds064799.mlab.com:64799/events`
var linkToMongo = 'mongodb://mongobd-events:l5tvXDPTfAAyT1ajuxWQiLleF6W0Tq4QK3fPIPNYtfx5T23QxaXvybLfpXfRSyeFsjMe7dPzUJH87hKZ8sRDzw==@mongobd-events.documents.azure.com:10255/?ssl=true'
// mongoose.connect(linkToMongo,(err)=>{
//     if(err)
//         console.log("HERE",err);
// }); // connect to our database
var EventMongo = require('./eventMongo');
var eventModel;


// ROUTES FOR OUR API
// =============================================================================

// create our router
var router = express.Router();

// middleware to use for all requests
router.use((req, res, next) => {
	decodeURI(req);
	next()
})

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function (req, res) {
	res.json({ message: 'hooray! welcome to our api!' });
});

// on routes that end in /
// ----------------------------------------------------
router.route('/events')

	// create a event (accessed at POST http://localhost:8080/events)
	.post(function (req, res) {
		if (!req.body)
			return res.status(400).json({ "status": "there is no body" });
		console.log("events from", req.body.source);
		eventModel.addEvent(req.body.source, req.body.events, (err, result) => {
			if (err) {
				console.log(err);
				return res.status(500).json({ "status": "error while saving into database" });
			}

			return res.status(200).json({
				"status": "events created",
				"result": result
			});
		});
	})

	// get all the events (accessed at GET http://localhost:8080/api/events)
	.get(function (req, res) {
		console.log("get events with query", req.query)

		eventModel.fetchAll(req.query, (err, results) => {
			if (err) {
				console.log(err);
				return res.status(400).json({ "status": "error while retrieving events from db" });
			}
			results.sort((a, b) => { return (a.startTime > b.startTime) ? 1 : ((b.startTime > a.startTime) ? -1 : 0); });

			return res.status(200).json({ "events": results });
		})
	});

// on routes that end in /events/:event_id
// ----------------------------------------------------
router.route('/events/:event_id')

	// get the event with that id
	.get(function (req, res) {
		// console.log("HERE", req.params.event_id)
		eventModel.findOne(req.params.event_id, (err, results) => {
			if (err)
				res.status(400).json({ "status": "error while searching event from db" });
			res.status(200).json({ "events": results });
		})
	})

	// update the event with this id
	.put(function (req, res) {


		eventModel.updateOne(req.params.event_id, req.body, (err, result) => {
			if (err)
				return res.status(400).json({ "status": "error while updating event" });
			return res.status(200).json({ "status": "event updated" });
		});
	})
	//post on event/id user add own event;
	.post((req, res) => {
		console.log(req.body)
		eventModel.addEvent('user', [req.body.event], (err, result) => {
			if (err) {
				console.log(err);
				return res.status(500).json({ "status": "error while saving into database" });
			}

			return res.status(200).json({
				"status": "events created",
				"result": result
			});
		})

	})


	// delete the event with this id
	.delete(function (req, res) {
		console.log(req.query);
		eventModel.deleteOne(req.params.event_id, (err, result) => {
			if (err)
				return res.status(400).json({ "status": "error while removing event from db" });
			return res.status(200).json({ "status": "event deleted" })
		})

	});


// REGISTER OUR ROUTES -------------------------------
app.use('/api', router);


// CONNECTO TO DB and start Server

MongoClient.connect(linkToMongo, (err, database) => {
	if (!err) {
		console.log('Successfuly connceted');
		eventModel = new EventMongo(database);
		app.listen(port, () => {
			console.log(`event_api Listening on port: ${port}`);
		})
		return;
	}
	console.log("error on connecting to db");
	console.log(err);
})