$(function() {
    'use-strict';

    const todoInterface = {
        // optimize this!
        getAllTodos: function() {
            return $.get('/todos/all').done(function(data) {
                todosPool.setAllTodos(data);
                // todosPool.setCompletedTodos();
                // todosPool.setActiveTodos();
                todosPool.triggerMasterToggle();
                view.render();
            });
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

    const todosToolbox = {
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
            this.editFromAll(editedTodo);
        },
        editFromAll: function(todo) {
            const allTodosIndex = this.getIndexOfTodo(todosPool.allTodos, todo);
            todosPool.allTodos.splice(allTodosIndex, 1, todo);
        }
        // function deleteFromActive() {
        //     const activeTodosIndex = todosPool.activeTodos.indexOf(todoToDelete);
        //     todosPool.activeTodos.splice(activeTodosIndex, 1);
        //     deleteFromAll();
        // }
        // function deleteFromCompleted() {
        //     const completedTodosIndex = todosPool.completedTodos.indexOf(todoToDelete);
        //     todosPool.completedTodos.splice(completedTodosIndex, 1);
        //     deleteFromAll();
        // }
        // function deleteFromAll() {
        //     const todosIndex = todosPool.allTodos.indexOf(todoToDelete);
        //     todosPool.allTodos.splice(todosIndex, 1);
        // }
    }

    const todosPool = {
        allTodos: [],
        activeTodos: [],
        completedTodos: [],
        // get all todos from ajax call
        // sort todos out into categories

        setAllTodos: function(data) {
            todosPool.allTodos = data;
            $.each(todosPool.allTodos, function(index, todo) {
                todo.completed ? todosPool.completedTodos.push(todo) : todosPool.activeTodos.push(todo);
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

            todoInterface.deleteTodo(elId).done(function (todo) {
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
            const todoId = $(e.target).closest('li').data('id');
            const todoStatus = $(e.target).prop('checked');
            todoInterface.toggleTodo(todoId, todoStatus);
        },
        toggleAll: function(e) {
            if (todosPool.activeTodos.length === todosPool.allTodos.length) {
                todoInterface.toggleAllTodos(true);
            }
            if (todosPool.completedTodos.length > 0) {
                todoInterface.toggleAllTodos(false);
            }
        },
        triggerMasterToggle: function() {
            if (todosPool.allTodos.length === 0) return;
            if (todosPool.completedTodos.length === todosPool.allTodos.length) {
                $('#toggle-all').prop('checked', true);
            }
            if (todosPool.completedTodos.length < todosPool.allTodos.length) {
                $('#toggle-all').prop('checked', false);
            }
        }
    }

    const view = {
        init: function() {
            todoInterface.getAllTodos();
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
            $('#user-input').on('change', todosPool.addTodo.bind(this));
            $('#toggle-all').on('click', todosPool.toggleAll.bind(this));
            $('#todo-list')
                .on('click', '.delete', todosPool.deleteTodo)
                .on('click', '.toggle', todosPool.toggleTodo.bind(this))
                .on('dblclick', 'li', todosPool.activateEdit.bind(this))
                .on('change', '.editing', todosPool.editTodo.bind(this));
        }
    }
    view.init();
});
