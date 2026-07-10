const mongoose = require("mongoose");


const vehicleSchema = new mongoose.Schema({

    vehicleId:{
        type:String,
        required:true,
        unique:true
    },

    driverName:{
        type:String,
        required:true
    },

    status:{
        type:String,
        default:"Active"
    },

    location:{
        latitude:Number,
        longitude:Number
    },

    speed:{
        type:Number,
        default:0
    },

    fuel:{
        type:Number,
        default:100
    }

},
{
    timestamps:true
});


module.exports = mongoose.model(
    "Vehicle",
    vehicleSchema
);