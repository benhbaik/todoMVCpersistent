$(function() {
    'use-strict';

    const todoInterface = {
        getAllTodos: function() {
            return $.get('/todos/all').done(function(data) {
                util.todos = data;
                util.setCompletedTodos();
                util.setActiveTodos();
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
                todoInterface.getAllTodosSynced(data.completed);
            });
        },
        getAllTodosSynced: function(lastTodoStatus) {
            return $.get('/todos/all').done(function(data) {
                util.todos = data;
                util.setCompletedTodos();
                if (lastTodoStatus && util.todos.length === util.completedTodos.length) {
                    util.triggerMasterToggle(lastTodoStatus);
                }
                util.triggerMasterToggle(lastTodoStatus);
                view.render();
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
        getAllTodos: function() {
            todoInterface.getAllTodos();
        },
        getActiveTodos: function() {
            todoInterface.getActiveTodos();
        },
        getCompletedTodos: function() {
            todoInterface.getCompletedTodos();
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
            // make a toggle all to completed and all to active api route???
            // master toggle not working
            // if todos are not all true make them all true
            // if todos are all true make them false
            if (util.completedTodos < util.todos) {

            }
            if (util.activeTodos === util.todos) {
                $(e.target).prop('checked', false);
            }
        },
        setCompletedTodos: function() {
            util.completedTodos = util.todos.filter(isItCompleted);
            function isItCompleted(todo) {
                if (todo.completed === true) return true;
            }
        },
        setActiveTodos: function() {
            util.activeTodos = util.todos.filter(isItActive);
            function isItActive(todo) {
                if (todo.completed === false) return true;
            }
        },
        triggerMasterToggle: function(lastTodoStatus) {
            $('#toggle-all').prop('checked', lastTodoStatus);
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
