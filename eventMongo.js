var ObjectId = require('mongodb').ObjectID;
class EventMongo {
    constructor(db) {
        this.db = db
    }

    addEvent(event, next) {
        this.db.collection('events').save(event, (err, result) => {
            if (err)
                return next(err);
            next(null, result);
        });
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
        console.log("get from db event with id:", id);
        var cursor = this.db.collection('events').find({ "_id": ObjectId(id) })
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
            { '_id': ObjectId(id) },
            (err, results) => {
                if (err)
                    return next(err)
                next(null, results);
            }
        )
    }

}

module.exports = EventMongo