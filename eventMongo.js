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
            event["_id"] = `${source}${event.id}`;
            event.venue.location['mgrs'] = mgrs.forward([event.venue.location.longitude, event.venue.location.latitude], 3);

            this.db.collection('events').insertOne(
                event,
                (err, result) => {
                    if (!err)
                        totalInserted++;
                    itemsProcessed++;
                    if (itemsProcessed === events.length) {
                        next(null, {"inserted":`${totalInserted}`} );
                    }
                });

        }, this);
        // for(var event of events){
        //     console.log(event.name);
        //     event["_id"] = `${source}${event.id}`;
        //     event.venue.location['mgrs'] = mgrs.forward([event.venue.location.longitude,event.venue.location.latitude],3);
        // }


        // // console.log(events);
        // this.db.collection('events').insertMany(
        //     events
        //     , (err, result) => {
        //         if (err)
        //             return next(err);
        //         next(null, result);
        //     });
    }
    fetchAll(next) {
        var cursor = this.db.collection('events').find();
        cursor.toArray((err, results) => {
            if (err)
                return next(err);
            next(null, results);
        });
    }
    findOne(id, next) {
        console.log(`get from db event with id:${id} ${typeof id}`);
        var cursor = this.db.collection('events').find({ "_id": id.trim() })
        cursor.toArray((err, results) => {
            console.log(results);
            if (err)
                return next(err)
            next(null, results);
        })

    }
    updateOne(id, event, next) {
        this.db.collection('events').updateOne(
            { '_id': ObjectId(id) },
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
            { '_id': id },
            (err, results) => {
                if (err)
                    return next(err)
                next(null, results);
            }
        )
    }

}

module.exports = EventMongo