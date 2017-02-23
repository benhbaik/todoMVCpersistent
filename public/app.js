$(function() {
    'use-strict';
    var ENTER_KEY = 13;
    var ESCAPE_KEY = 27;

    var util = {
        uuid: function () {
            /*jshint bitwise:false */
            var i, random;
            var uuid = '';

            for (i = 0; i < 32; i++) {
                random = Math.random() * 16 | 0;
                if (i === 8 || i === 12 || i === 16 || i === 20) {
                    uuid += '-';
                }
            uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
            }

            return uuid;
        },
        pluralize: function(count) {
            if (count === 1) return;
            else return 's';
        },
        store: function(namespace, data) {
            if (arguments.length > 1) {
                return localStorage.setItem(namespace, JSON.stringify(data));
            } else {
                return JSON.parse(localStorage.getItem(namespace)) || [];
            }
        }
    }

    var app = {
        init: function () {
            this.todos = util.store('todoMVC');

            this.todoListSource = $('#todoListPre').html();
            this.todoListTemplate = Handlebars.compile(this.todoListSource);

            this.footerSource = $('#footerPre').html();
            this.footerTemplate = Handlebars.compile(this.footerSource);

            new Router({
                '/:filter': function(filter) {
                    this.filter = filter;
                    this.render();
                }.bind(this)
            }).init('#/all');

            this.render();
            this.bindEvents();
        },
        render: function () {
            var todos = this.getFilteredTodos();
            $('#todo-list').html(this.todoListTemplate(todos));
            util.store('todoMVC', todos);
            this.renderFooter();
        },
        renderFooter: function() {
            var completeCount = this.getCompletedTodos().length;
            var footerContext = {
                completeCount: completeCount,
                filter: this.filter,
                todoWord: util.pluralize(completeCount)
            }
            $('#footer').html(this.footerTemplate(footerContext));
        },
        bindEvents: function() {
            $('#user-input').on('keydown', this.addTodo.bind(this));
            $('#toggle-all').on('click', this.toggleAll.bind(this));
            $('#footer').on('click', '#delete-completed', this.deleteCompleted.bind(this));
            $('#todo-list').on('click', '.delete', this.deleteTodo.bind(this))
                .on('dblclick', 'li', this.activateEdit.bind(this))
                .on('keyup', this.editTodo.bind(this))
                .on('click', '.toggle', this.toggleTodo.bind(this));
        },
        createTodoObject: function (title) {
            return {
                title: title,
                completed: false,
                id: util.uuid()
            }
        },
        addTodo: function (e) {
            if (e.which === ENTER_KEY) {
                var todo = this.createTodoObject(e.target.value);
                this.todos.push(todo);
                e.target.value = '';
                this.render();
            }
        },
        deleteTodo: function (e) {
            var $elId = $(e.target).closest('li').data('id');
            var index = this.getIndexFromEl($elId);

            this.todos.splice(index, 1);
            this.render();
        },
        deleteCompleted: function() {
            var incomplete = this.getIncompleteTodos();

            this.todos = incomplete;
            this.render();
        },
        getIndexFromEl: function (elId) {
            var i = this.todos.length;

            while (i--) {
                if (elId === this.todos[i].id) {
                    return i;
                }
            }
        },
        activateEdit: function (e) {
            $input = $(e.target).closest('li').find('.edit');
            $input.removeClass('edit').addClass('editing');
            $input.val($input.val()).focus();
        },
        editTodo: function (e) {
            var $elId = $(e.target).closest('li').data('id');
            var index = this.getIndexFromEl($elId);

            if (e.which === ENTER_KEY) {
                var $inputVal = $(e.target).val().trim();

                this.todos[index].title = $inputVal;
                this.render();
            } else if (e.which === ESCAPE_KEY) {
                this.todos[index] = this.todos[index];
                this.render();
            }
        },
        toggleTodo: function(e) {
            var $elId = $(e.target).closest('li').data('id');
            var elIndex = this.getIndexFromEl($elId);
            var checkVal = $(e.target).prop('checked');

            this.todos[elIndex].completed = checkVal;
            $('#toggle-all').prop('checked', this.getCompletedTodos().length === this.todos.length);
            this.render();
        },
        toggleAll: function(e) {
            var checkVal = $(e.target).prop('checked');

            this.todos.forEach(function(todo) {
                todo.completed = checkVal;
            });
            this.render();
        },
        getCompletedTodos: function() {
            var completed = this.todos.filter(getCompleted);

            function getCompleted(todo) {
                return todo.completed === true;
            }
            return completed;
        },
        getIncompleteTodos: function() {
            var incomplete = this.todos.filter(getIncomplete);

            function getIncomplete(todo) {
                return todo.completed === false;
            }
            return incomplete;
        },
        getFilteredTodos: function() {
            if (this.filter === 'all') {
                return this.todos;
            } else if (this.filter === 'completed') {
                return this.getCompletedTodos();
            } else if (this.filter === 'active') {
                return this.getIncompleteTodos();
            }
        }
    };
    app.init();
});
