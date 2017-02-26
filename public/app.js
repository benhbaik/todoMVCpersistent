$(function() {
    'use-strict';

    const todoInterface = {
        getAllTodos: function() {
            return $.get('/todos/all').done(function(data) {
                util.todoList = data;
                util.init();
            });
        },
        getActiveTodos: function() {
                return $.get('/todos/active').done(function(data) {
                    console.log(data);
                });
        },
        getCompletedTodos: function() {
                return $.get('/todos/completed').done(function(data) {
                    console.log(data);
                });
        },
        createTodoObject: function(todo) {
            return {
                title: todo,
                completed: false
            }
        },
        addTodo: function(todo) {
            return $.post('/todos/all', this.createTodoObject(todo))
                .done(function(data) {
                    console.log(data);
                });
        },
        deleteTodo: function(id) {
            $.ajax({
                url: `/todos/delete/${id}`,
                method: 'DELETE'
            }).done(function(data) {
                console.log(data);
            });
        },
        // edit OR toggle todos
        editTodo: function(id, todo, status) {
            $.ajax({
                url: `/todos/edit/${id}`,
                method: 'PUT',
                data: { title: todo, completed: status }
            }).done(function(data) {
                console.log(data);
            });
        }
    }
    const util = {
        init: function() {
            this.todoListSource = $('#todoListPre').html();
            this.todoListTemplate = Handlebars.compile(this.todoListSource);
            view.render();
        }
    }

    const view = {
        render: function() {
            $('#todo-list').html(util.todoListTemplate(util.todoList));
        }
    }
    todoInterface.getAllTodos();
});
