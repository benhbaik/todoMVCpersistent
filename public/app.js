$(function() {
    'use-strict';

    const todoInterface = {
        getAllTodos: function() {
            return $.get('/todos/all');;
        },
        getActiveTodos: function() {
                return $.get('/todos/active').done(function(data) {
                    todosPool.activeTodos = data;
                });
        },
        getCompletedTodos: function() {
                return $.get('/todos/completed').done(function(data) {
                    todosPool.completedTodos = data;
                });
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
            todosPool.allTodos = data;
            $.each(todosPool.allTodos, function(index, todo) {
                todo.completed ? todosPool.completedTodos.push(todo) : todosPool.activeTodos.push(todo);
            });
        },
        getIndexOfTodo: function(array, todo) {
            return array.indexOf(todo);
        },
        compositeDelete: function(array, todo) {
            const todoIndex = this.getIndexOfTodo(array, todo);
            array.splice(todoIndex, 1);
            this.deleteFromAll(todo);
        },
        deleteFromAll: function(todo) {
            const allTodosIndex = this.getIndexOfTodo(todosPool.allTodos, todo);
            todosPool.allTodos.splice(allTodosIndex, 1);
        },
        compositeEdit: function(array, editedTodo) {
            const todoIndex = array.findIndex(function(todo) {
                return editedTodo._id === todo._id;
            });
            array.splice(todoIndex, 1, editedTodo);
            this.editForAll(editedTodo);
        },
        editForAll: function(todo) {
            const allTodosIndex = this.getIndexOfTodo(todosPool.allTodos, todo);
            todosPool.allTodos.splice(allTodosIndex, 1, todo);
        },
        compositeToggle: function(arrayToRemoveFrom, arrayToAddTo, todo) {
            const removeIndex = this.getIndexOfTodo(arrayToRemoveFrom, todo);
            arrayToAddTo.push(todo);
            arrayToRemoveFrom.splice(removeIndex, 1);
            console.log('active', todosPool.activeTodos);
            console.log('completed', todosPool.completedTodos);
        },
        compositeToggleAll: function(value) {
            $.each(todosPool.allTodos, function(index, todo) {
                todo.completed = value;
            });

            if (value) {
                todosPool.completedTodos = todosPool.allTodos;
                todosPool.activeTodos = [];

            } else {
                todosPool.activeTodos = todosPool.allTodos;
                todosPool.completedTodos = [];
            }
        },
        masterToggleTest: function() {
            const $masterToggle = $('#toggle-all');

            if (todosPool.completedTodos.length === todosPool.allTodos.length) {
                $masterToggle.prop('checked', true);
            } else {
                $masterToggle.prop('checked', false);
            }
        }
    }

    const todosPool = {
        allTodos: [],
        activeTodos: [],
        completedTodos: [],
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
                todosPool.allTodos.push(todo);
                todosPool.activeTodos.push(todo);
                view.render();
            });
            e.target.value = '';
        },
        deleteTodo: function(e) {
            const li = $(e.target).closest('li');
            const elId = li.data('id');
            const todoToDelete = todosPool.allTodos.find(compareId);

            todoInterface.deleteTodo(elId).done(function(todo) {
                const arrayToSplice = todo.completed ? todosPool.completedTodos : todosPool.activeTodos;
                todosToolbox.compositeDelete(arrayToSplice, todoToDelete);
                li.remove()
            });

            function compareId(todo) {
                return todo._id === elId;
            }
        },
        activateEdit: function(e) {
            const editInput = $(e.target).closest('li').find('.edit');

            editInput.removeClass('edit').addClass('editing');
            editInput.val(editInput.val()).focus();
        },
        editTodo: function(e) {
            const todoId = $(e.target).closest('li').data('id');
            const newTodo = e.target.value;

            todoInterface.editTodo(todoId, newTodo).done(function(todo) {
                const arrayToSplice = todo.completed ? todosPool.completedTodos : todosPool.activeTodos;

                todosToolbox.compositeEdit(arrayToSplice, todo);
                view.render();
            });
        },
        toggleTodo: function(e) {
            const $todo = $(e.target);
            const todoId = $todo.closest('li').data('id');
            const todoStatus = $todo.prop('checked');

            todoInterface.toggleTodo(todoId, todoStatus).done(function(todo) {
                const arrayToSplice = todo.completed ? todosPool.activeTodos : todosPool.completedTodos;
                const arrayToPush = todo.completed ? todosPool.completedTodos : todosPool.activeTodos;

                todosToolbox.compositeToggle(arrayToSplice, arrayToPush, todo);
                $todo.prop('checked', todo.completed);
                todosToolbox.masterToggleTest();
            });
        },
        toggleAll: function(e) {
            const $masterToggle = $(e.target);
            const value = $masterToggle.prop('checked');
            console.log(value);

            todoInterface.toggleAllTodos(value).done(function() {
                todosToolbox.compositeToggleAll(value);
                view.render();
            });
        }
    }

    const view = {
        init: function() {
            todosPool.init();
            this.todoListSource = $('#todoListPre').html();
            this.todoListTemplate = Handlebars.compile(this.todoListSource);

            this.footerSource = $('#footerPre').html();
            this.footerTemplate = Handlebars.compile(this.footerSource);

            this.bindEvents();
        },
        render: function() {
            $('#todo-list').html(this.todoListTemplate(todosPool.allTodos));
            $('#footer').html(this.footerTemplate(todosPool));
        },
        renderFooter: function() {

        },
        bindEvents: function() {
            $('#user-input').on('change', todosPool.addTodo);
            $('#toggle-all').on('click', todosPool.toggleAll);
            $('#todo-list')
                .on('click', '.delete', todosPool.deleteTodo)
                .on('click', '.toggle', todosPool.toggleTodo)
                .on('dblclick', 'li', todosPool.activateEdit)
                .on('change', '.editing', todosPool.editTodo);
        }
    }
    view.init();
});
