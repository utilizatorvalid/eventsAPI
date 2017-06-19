var ObjectId = require('mongodb').ObjectID;
var mgrs = require("mgrs")
class EventMongo {
    constructor(db) {
        this.db = db
    }

    addEvent(source, events, next) {

        var itemsProcessed = 0;
        var totalInserted = 0;
        events.forEach(function (event) {
            //console.log(event.name);
            if(!event['_id'])
                event["_id"] = `${source}${event.id}`;
            
            if(!event.venue.location.mgrs)
                event.venue.location['mgrs'] = mgrs.forward([event.venue.location.longitude, event.venue.location.latitude], 3);

            this.db.collection('events').insertOne(
                event,
                (err, result) => {
                    if (!err)
                        totalInserted++;
                    itemsProcessed++;
                    if (itemsProcessed === events.length) {
                        next(null, { "inserted": `${totalInserted}` });
                    }
                });

        }, this);
    }
    fetchAll(params, next) {
        console.log(params);
        var query = {}
        var mgrs_pattern;
        if (params.hasOwnProperty("startTime") && params.hasOwnProperty("endTime")) {

            query["startTime"] = { $gt: params.startTime, $lt: params.endTime };
        }
        if (params.hasOwnProperty("mgrs") && params.hasOwnProperty("nP")) {
            mgrs_pattern = params.mgrs.split('');
            mgrs_pattern[4 + parseInt( params.nP)] = '.'
            mgrs_pattern[4 + 2 *parseInt(params.nP)] = '.'
            // query['venue.location.mgrs'] = "35TNN437242"
            // query['venue.location.mgrs'] = { $regex: / ${mgrs_pattern.join('')} / , $options: 'si'  };
            
            query['venue.location.mgrs'] = { $regex: new RegExp(mgrs_pattern.join('')) , $options: 'si'  };
        }
        query['user'] = { $exists: false}
        
        if(params.hasOwnProperty('user')){
            query['user'] = { $exists: true, $eq: params.user};
        }
        console.log(query);
        var cursor = this.db.collection('events').find(
            query
        );
        cursor.toArray((err, results) => {
            if (err)
                return next(err);
            next(null, results);
        });
    }

    findOne(id, next) {
        // console.log(`get from db event with id:${id} ${typeof id}`);

        var cursor = this.db.collection('events').find({ "_id": id.trim() })
        cursor.toArray((err, results) => {
            // console.log(results);
            if (err)
                return next(err)
            next(null, results);
        })

    }
    updateOne(id, event, next) {
        this.db.collection('events').updateOne(
            { '_id': id.trim() },
            { $set: event },
            (err, results) => {
                if (err)
                    return next(err)
                next(null, results);
            }
        )
    }

    deleteOne(id, next) {
        this.db.collection('events').deleteOne(
            { '_id': id.trim() },
            (err, results) => {
                if (err)
                    return next(err)
                next(null, results);
            }
        )
    }

}

module.exports = EventMongo