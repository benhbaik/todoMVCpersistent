$(function() {
    'use-strict';

    const todoInterface = {
        // optimize this!
        getAllTodos: function() {
            return $.get('/todos/all').done(function(data) {
                util.setAllTodos(data);
                util.setCompletedTodos();
                util.setActiveTodos();
                util.triggerMasterToggle();
                view.render();
            });
        },
        getActiveTodos: function() {
                return $.get('/todos/active').done(function(data) {
                    util.activeTodos = data;
                });
        },
        getCompletedTodos: function() {
                return $.get('/todos/completed').done(function(data) {
                    util.completedTodos = data;
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
                    util.todos.push(data);
                    view.render();
                });
        },
        deleteTodo: function(id) {
            $.ajax({
                url: `/todos/delete/${id}`,
                method: 'DELETE'
            }).done(function(data) {
                todoInterface.getAllTodos();
            });
        },
        editTodo: function(id, todo) {
            return $.ajax({
                url: `/todos/edit/${id}`,
                method: 'PUT',
                data: { title: todo }
            }).done(function(data) {
                todoInterface.getAllTodos();
            });
        },
        toggleTodo: function(id, status) {
            return $.ajax({
                url: `/todos/toggle/${id}`,
                method: 'PUT',
                data: { completed: status }
            }).done(function(data) {
                todoInterface.getAllTodos();
            });
        },
        // toggles all todos to true or false
        toggleAllTodos: function(status) {
            return $.ajax({
                url: '/todos/toggle',
                method: 'PUT',
                data: { completed: status }
            }).done(function() {
                todoInterface.getAllTodos();
            });
        }
    }
    const util = {
        init: function() {
            todoInterface.getAllTodos();
            this.todoListSource = $('#todoListPre').html();
            this.todoListTemplate = Handlebars.compile(this.todoListSource);
            view.bindEvents();
        },
        setAllTodos: function(data) {
            util.todos = data;
        },
        setActiveTodos: function() {
            util.activeTodos = util.todos.filter(isItActive);
            function isItActive(todo) {
                if (todo.completed === false) return true;
            }
        },
        setCompletedTodos: function() {
            util.completedTodos = util.todos.filter(isItCompleted);
            function isItCompleted(todo) {
                if (todo.completed === true) return true;
            }
        },
        addTodo: function(e) {
            const input = e.target.value;
            todoInterface.addTodo(input);
            e.target.value = '';
        },
        deleteTodo: function(e) {
            const elId = $(e.target).closest('li').data('id');
            todoInterface.deleteTodo(elId);
        },
        activateEdit: function(e) {
            const editInput = $(e.target).closest('li').find('.edit');
            editInput.removeClass('edit').addClass('editing');
            editInput.val(editInput.val()).focus();
        },
        editTodo: function(e) {
            const todoId = $(e.target).closest('li').data('id');
            const newTodo = e.target.value;
            todoInterface.editTodo(todoId, newTodo);
        },
        toggleTodo: function(e) {
            const todoId = $(e.target).closest('li').data('id');
            const todoStatus = $(e.target).prop('checked');
            todoInterface.toggleTodo(todoId, todoStatus);
        },
        toggleAll: function(e) {
            if (util.activeTodos.length === util.todos.length) {
                todoInterface.toggleAllTodos(true);
            }
            if (util.completedTodos.length > 0) {
                todoInterface.toggleAllTodos(false);
            }
        },
        triggerMasterToggle: function() {
            if (util.todos.length === 0) return;
            if (util.completedTodos.length === util.todos.length) {
                $('#toggle-all').prop('checked', true);
            }
            if (util.completedTodos.length < util.todos.length) {
                $('#toggle-all').prop('checked', false);
            }
        }
    }

    const view = {
        render: function() {
            $('#todo-list').html(util.todoListTemplate(util.todos));
        },
        bindEvents: function() {
            $('#user-input').on('change', util.addTodo.bind(this));
            $('#toggle-all').on('click', util.toggleAll.bind(this));
            $('#todo-list').on('click', '.delete', util.deleteTodo.bind(this))
                .on('click', '.toggle', util.toggleTodo.bind(this))
                .on('dblclick', 'li', util.activateEdit.bind(this))
                .on('change', '.editing', util.editTodo.bind(this));
        }
    }
    util.init();
});
