var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TodoSchema = new Schema({
    title: {
        type: String,
        maxLength: 25
    },
    completed: {
        type: Boolean,
        required: true
    }
});

module.exports = mongoose.model('Todo', TodoSchema);
