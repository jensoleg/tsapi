var mongoose = require('mongoose'),
    uriUtil = require('mongodb-uri'),
    Schema = mongoose.Schema,
    config = require('../../config.json');


var options = {
    server: {
        socketOptions: {
            keepAlive: 1,
            connectTimeoutMS: 30000
        }
    }
};

var mongodbUri = config.bobby.dbURI + config.bobby.db,
    mongooseUri = uriUtil.formatMongoose(mongodbUri),
    conn = mongoose.createConnection(mongooseUri, options);

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

module.exports = conn.model('Device', DeviceSchema);
