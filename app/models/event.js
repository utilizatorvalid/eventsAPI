var mongoose    = require('mongoose')
var Schema      = mongoose.Schema

var EventSchema = new Schema({
    name:String,
    body:Object
})

module.exports = mongoose.model("Event",EventSchema);