let mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true}, console.log("success in connecting to mongodb"));

let userSchema = new mongoose.Schema({
    username: {
        type:String, required: true
    },
    log: [{
            "description": {type: String, required:true},
            "duration": {type: Number, required: true},
            "date": {type: Date, required: false, default: new Date()}
        }]
}, {
    versionKey: false
})

exports.userSchema = userSchema;