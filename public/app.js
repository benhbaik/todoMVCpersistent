$(function() {
    'use-strict';

    const todoInterface = {
        getAllTodos: function() {
            return $.get('/todos/all');;
        },
        createTodoObject: function(todo) {
            return {
                title: todo,
                completed: false
            }
        },
        addTodo: function(todo) {
            return $.post('/todos/all', this.createTodoObject(todo));
        },
        deleteTodo: function(id) {
            return $.ajax({
                url: `/todos/delete/${id}`,
                method: 'DELETE'
            });
        },
        deleteCompleted: function() {
            return $.ajax({
                url: '/todos/delete-completed',
                method: 'DELETE'
            });
        },
        editTodo: function(id, todo) {
            return $.ajax({
                url: `/todos/edit/${id}`,
                method: 'PUT',
                data: { title: todo }
            });
        },
        toggleTodo: function(id, status) {
            return $.ajax({
                url: `/todos/toggle/${id}`,
                method: 'PUT',
                data: { completed: status }
            });
        },
        toggleAllTodos: function(status) {
            return $.ajax({
                url: '/todos/toggle',
                method: 'PUT',
                data: { completed: status }
            });
        }
    }

    const todosToolbox = {
        sortAndSetAllTodos: function(data) {
            const tempCompletedTodos = [];
            const tempActiveTodos = [];
            view.allTodos = data;
            $.each(view.allTodos, function(index, todo) {
                todo.completed ? tempCompletedTodos.push(todo) : tempActiveTodos.push(todo);
            });
            view.completedTodos = tempCompletedTodos;
            view.activeTodos = tempActiveTodos;
        },
        masterToggleTest: function() {
            const $masterToggle = $('#toggle-all');

            if (view.completedTodos.length === view.allTodos.length) {
                $masterToggle.prop('checked', true);
            } else {
                $masterToggle.prop('checked', false);
            }
        },
        getTodoIndex: function(id) {
            return view.allTodos.findIndex(compareId);

            function compareId(todo) {
                return todo._id === id;
            }
        },
        getFooterData: function() {
            view.completeCount = view.completedTodos.length;
            if (view.completeCount !== 1) {
                view.todoWord = 's';
            } else {
                view.todoWord = '';
            }
        }
    }

    const todosPool = {
        init: function() {
            todoInterface.getAllTodos().done(function(data) {
                todosToolbox.sortAndSetAllTodos(data);
                todosToolbox.masterToggleTest();
                view.render();
            });
        },
        addTodo: function(e) {
            const input = e.target.value;
            todoInterface.addTodo(input).done(function(todo) {
                view.allTodos.push(todo);
                view.render();
            });
            e.target.value = '';
        },
        deleteTodo: function(e) {
            const li = $(e.target).closest('li');
            const todoId = li.data('id');
            const indexToSplice = todosToolbox.getTodoIndex(todoId);

            todoInterface.deleteTodo(todoId).done(function(todo) {
                view.allTodos.splice(indexToSplice, 1);
                view.render();
            });
        },
        deleteCompleted: function(e) {
            todoInterface.deleteCompleted().done(function() {
                view.allTodos = view.activeTodos;
                view.render();
            });
        },
        activateEdit: function(e) {
            const editInput = $(e.target).closest('li').find('.edit');
            editInput.removeClass('edit').addClass('editing');
            editInput.val(editInput.val()).focus();
        },
        editTodo: function(e) {
            const todoId = $(e.target).closest('li').data('id');
            const newTodo = e.target.value;
            const index = todosToolbox.getTodoIndex();

            todoInterface.editTodo(todoId, newTodo).done(function(todo) {
                view.allTodos[index] = todo;
                view.render();
            });
        },
        toggleTodo: function(e) {
            const $todo = $(e.target);
            const todoId = $todo.closest('li').data('id');
            const todoStatus = $todo.prop('checked');
            const index = todosToolbox.getTodoIndex();

            todoInterface.toggleTodo(todoId, todoStatus).done(function(todo) {
                view.allTodos[index].completed = todo.completed;
                view.render();
            });
        },
        toggleAll: function(e) {
            const $masterToggle = $(e.target);
            const value = $masterToggle.prop('checked');

            todoInterface.toggleAllTodos(value).done(function() {
                $.each(view.allTodos, function(index, todo) {
                    todo.completed = value;
                });
                view.render();
            });
        }
    }

    const view = {
        allTodos: [],
        activeTodos: [],
        completedTodos: [],
        completeCount: 0,
        todoWord: '',
        init: function() {
            todosPool.init();
            this.todoListSource = $('#todoListPre').html();
            this.todoListTemplate = Handlebars.compile(this.todoListSource);
            this.footerSource = $('#footerPre').html();
            this.footerTemplate = Handlebars.compile(this.footerSource);
            this.bindEvents();
        },
        render: function() {
            todosToolbox.sortAndSetAllTodos(this.allTodos);
            todosToolbox.masterToggleTest();
            $('#todo-list').html(this.todoListTemplate(this.allTodos));
            todosToolbox.getFooterData();
            this.renderFooter();
        },
        renderFooter: function() {
            $('#footer').html(this.footerTemplate(this));
        },
        bindEvents: function() {
            $('#user-input').on('change', todosPool.addTodo.bind(this));
            $('#toggle-all').on('click', todosPool.toggleAll.bind(this));
            $('#footer').on('click', '#delete-completed', todosPool.deleteCompleted.bind(this));
            $('#todo-list')
                .on('click', '.delete', todosPool.deleteTodo.bind(this))
                .on('click', '.toggle', todosPool.toggleTodo.bind(this))
                .on('dblclick', 'li', todosPool.activateEdit.bind(this))
                .on('change', '.editing', todosPool.editTodo.bind(this));
        }
    }
    view.init();
});
