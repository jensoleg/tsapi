var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var DeviceSchema = new Schema(

    {
        realm: String,
        name: String,
        id: String,
        location: {lat: Number, lng: Number},
        controls: [
            {
                id: String,
                name: String,
                //type: {
                //    type: { type: String }
                //},
                minValue: Number,
                maxValue: Number,
                minCritical: Number,
                maxCritical: Number
            }
        ]
    }

);

module.exports = mongoose.model('Device', DeviceSchema);
