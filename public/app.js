$(function() {
    'use-strict';

    const todoInterface = {
        getAllTodos: function() {
            return $.get('/todos/all').done(function(data) {
                util.todoList = data;
                view.render();
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
                    util.todoList.push(data);
                    view.render();
                });
        },
        deleteTodo: function(id) {
            $.ajax({
                url: `/todos/delete/${id}`,
                method: 'DELETE'
            }).done(function(data) {
                console.log(data);
                view.render();
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
            todoInterface.getAllTodos();
            this.todoListSource = $('#todoListPre').html();
            this.todoListTemplate = Handlebars.compile(this.todoListSource);
            view.bindEvents();
            view.render();
        },
        getAllTodos: function() {
            todoInterface.getAllTodos();
        },
        addTodo: function(e) {
            const input = e.target.value;
            todoInterface.addTodo(input);
            e.target.value = '';
        },
        deleteTodo: function(e) {
            const elId = $(e.target).closest('li').data('id');
            let index = util.getIndexFromEl(elId);
            console.log(index);
            //
            // util.todoList.splice(index, 1);
            // todoInterface.deleteTodo(elId);
        },
        getIndexFromEl: function(id) {
            let i = this.todoList.length;
            console.log(i);

            while (i--) {
                if (id === this.todoList[i].id) return i;
            }
        }
    }

    const view = {
        render: function() {
            $('#todo-list').html(util.todoListTemplate(util.todoList));
        },
        bindEvents: function() {
            $('#user-input').on('change', util.addTodo.bind(this));
            $('#todo-list').on('click', '.delete', util.deleteTodo.bind(this));
        }
    }
    util.init();
});
