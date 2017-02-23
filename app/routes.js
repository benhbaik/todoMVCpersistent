var express = require('express');
var app = express();
var Todo = require('./todoModel.js');
var router = express.Router();

router.route('/all')
    .post(function(req, res) {
        Todo.create({
            title: req.body.title,
            completed: req.body.completed
        }, function(err, todo) {
            if (err) res.status(400).json(err);
            else if (todo) res.status(200).json(todo);
        });
    })
    .get(function(req, res) {
        Todo.find({}, function(err, todos) {
            if (err) res.status(500).json(err);
            else if (todos) res.status(200).json(todos);
        });
    });
router.route('/completed')
    .get(function(req, res) {
        var query = Todo.where({ completed: true });
        query.find(function(err, todos) {
            if (err) res.status(500).json(err);
            else if (todos) res.status(200).json(todos);
        });
    });
router.route('/active')
    .get(function(req, res) {
        var query = Todo.where({ completed: false });
        query.find(function(err, todos) {
            if (err) res.status(500).json(err);
            else if (todos) res.status(200).json(todos);
        });
    });
router.route('/:id')
    .put(function(req, res) {
        var query = { _id: req.params.id };
        var update = { title: req.body.title };
        var options = { 'new': true };
        Todo.findOneAndUpdate(query, update, options, function(err, todo) {
            if (err) res.status(500).json(err);
            else if (todo) res.status(200).json(todo);
        });
    })
    .delete(function(req, res) {
        var query = { _id: req.params.id };
        Todo.findOneAndRemove(query, function(err, todo) {
            if (err) res.status(500).json(err);
            else if (todo) res.status(200).json(todo);
        });
    });

module.exports = router;