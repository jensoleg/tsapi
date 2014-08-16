var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var DeviceSchema = new Schema(
    {
        updatedAt: {
            date: {type: Date},
            user: {type: String}
        },
        comment: String,
        name: String,
        location: String,
        id: String,
        controls: [
            {
                id: String,
                name: String,
                comment: String,
                ctrlType: String,
                minValue: Number,
                maxValue: Number,
                minCritical: Number,
                maxCritical: Number,
                unit: {
                    symbol: String,
                    units: String,
                    conversion_exp: String
                }
            }
        ],
        triggers: [
            {
                request: [
                    {request_options: Schema.Types.Mixed}
                ],
                trigger_type: { type: String, enum: ['lt', 'lte', 'gt', 'gte', 'eq'] },
                threshold_value: String,
                stream_id: String,
                triggered_value: String,
                resolution: { type: String, enum: ['sec', 'min', 'hour', 'day'] }
            }
        ]
    }
);

/*
var InstallationSchema = new Schema(
    {
        name: String,
        place: String,
        location: {lat: Number, lng: Number},
        comment: String,
        devices: [ DeviceSchema ]
    }
);
*/

module.exports = mongoose.model('Device', DeviceSchema);