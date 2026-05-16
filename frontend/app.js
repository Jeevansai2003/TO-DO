var app = angular.module("todoApp", []);

app.controller("TodoController", function ($scope, $http) {

    const API = "http://localhost:3000/tasks";

    // ✅ DEFAULT TASK (IMPORTANT FIX)
    $scope.newTask = {
        priority: "Medium"
    };

    // Load tasks
    function loadTasks() {
        $http.get(API).then(res => {
            $scope.tasks = res.data;
        });
    }

    loadTasks();

    // Add task (FIXED - ONLY ONE FUNCTION)
    $scope.addTask = function () {

        console.log("Sending task:", $scope.newTask);

        $http.post(API, $scope.newTask).then(() => {

            // ✅ reset properly (NOT empty object)
            $scope.newTask = {
                priority: "Medium"
            };

            loadTasks();
        });
    };

    // Update task
    $scope.updateTask = function (task) {
        $http.put(API + "/" + task.id, task).then(() => {
            loadTasks();
        });
    };

    // Delete task
    $scope.deleteTask = function (id) {
        $http.delete(API + "/" + id).then(() => {
            loadTasks();
        });
    };

    // Filter
    $scope.taskFilter = function (task) {

        if ($scope.filterStatus === "completed") {
            return task.status == 1;
        }

        if ($scope.filterStatus === "pending") {
            return task.status == 0;
        }

        return true;
    };

    

});