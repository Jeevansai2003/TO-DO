var app = angular.module("todoApp", []);

app.controller("TodoController", function ($scope, $http) {

    const API = "http://localhost:3000/tasks";

    // =======================
    // INITIAL STATE
    // =======================
    $scope.view = "active";

    $scope.tasks = [];
    $scope.filtered = [];

    $scope.newTask = {
        title: "",
        description: "",
        priority: "Medium",
        due_date: null
    };


    // =======================
    // LOAD ACTIVE TASKS
    // =======================
    function loadTasks() {

        $http.get(API).then(function (res) {

            $scope.tasks = res.data;
            $scope.filtered = res.data;

        }).catch(function (err) {

            console.error("Error loading tasks:", err);

        });
    }


    // =======================
    // LOAD RECYCLE BIN
    // =======================
    function loadRecycleBin() {

        $http.get(API + "/recycle-bin").then(function (res) {

            $scope.tasks = res.data;
            $scope.filtered = res.data;

        }).catch(function (err) {

            console.error("Error loading recycle bin:", err);

        });
    }


    // =======================
    // DEFAULT LOAD
    // =======================
    loadTasks();


    // =======================
    // SWITCH VIEW
    // =======================
    $scope.showActive = function () {

        $scope.view = "active";
        loadTasks();
    };

    $scope.showRecycleBin = function () {

        $scope.view = "recycle";
        loadRecycleBin();
    };


    // =======================
    // FILTER BUTTONS
    // =======================
    $scope.showAll = function () {

        $scope.filtered = $scope.tasks;
    };

    $scope.showPending = function () {

        $scope.filtered = $scope.tasks.filter(function(task) {

            return task.status == 0 || task.status == "0";

        });
    };

    $scope.showCompleted = function () {

        $scope.filtered = $scope.tasks.filter(function(task) {

            return task.status == 1 || task.status == "1";

        });
    };

    $scope.showCancelled = function () {

        $scope.filtered = $scope.tasks.filter(function(task) {

            return task.status == 2 || task.status == "2";

        });
    };


    // =======================
    // ADD TASK
    // =======================
    $scope.addTask = function () {

        if (!$scope.newTask.title) {

            alert("Please enter task title");
            return;
        }

        $http.post(API, $scope.newTask).then(function () {

            $scope.newTask = {
                title: "",
                description: "",
                priority: "Medium",
                due_date: null
            };

            loadTasks();

        }).catch(function (err) {

            console.error("Error adding task:", err);

        });
    };


    // =======================
    // UPDATE TASK
    // =======================
    $scope.updateTask = function (task) {

        $http.put(API + "/" + task.id, task).then(function () {

            task.editing = false;

            if ($scope.view === "active") {

                loadTasks();

            } else {

                loadRecycleBin();
            }

        }).catch(function (err) {

            console.error("Error updating task:", err);

        });
    };


    // =======================
    // DELETE TASK
    // =======================
    $scope.deleteTask = function (id) {

        $http.delete(API + "/" + id).then(function () {

            loadTasks();

        }).catch(function (err) {

            console.error("Error deleting task:", err);

        });
    };


    // =======================
    // RESTORE TASK
    // =======================
    $scope.restoreTask = function (id) {

        $http.put(API + "/restore/" + id).then(function () {

            loadRecycleBin();

        }).catch(function (err) {

            console.error("Error restoring task:", err);

        });
    };


    // =======================
    // CANCEL TASK
    // =======================
    $scope.markCancelled = function (task) {

        task.status = 2;

        $http.put(API + "/" + task.id, task).then(function () {

            loadTasks();

        }).catch(function (err) {

            console.error("Error cancelling task:", err);

        });
    };


    // =======================
    // TOGGLE COMPLETE
    // =======================
    $scope.toggleComplete = function (task) {

        // Cannot complete cancelled task
        if (Number(task.status) === 2) {
            return;
        }

        task.status = Number(task.status) === 1 ? 0 : 1;

        $http.put(API + "/" + task.id, task).then(function () {

            loadTasks();

        }).catch(function (err) {

            console.error("Error toggling task:", err);

        });
    };

});