/**
 * Created by ylzheng on 4/15/14.
 */
angular.module('todo', ['ionic'])
    /**
     * The Projects factory handles saving and loading projects
     * from local storage, and also lets us save and load the
     * last active project index.
     */
    .factory('Projects', function() {
        return {
            all: function() {
                var projectString = window.localStorage['projects'];
                if(projectString) {
                    return angular.fromJson(projectString);
                }
                return [];
            },
            save: function(projects) {
                window.localStorage['projects'] = angular.toJson(projects);
            },
            newProject: function(projectTitle) {
                // Add a new project
                return {
                    title: projectTitle,
                    tasks: []
                };
            },
            getLastActiveIndex: function() {
                return parseInt(window.localStorage['lastActiveProject']) || 0;
            },
            setLastActiveIndex: function(index) {
                window.localStorage['lastActiveProject'] = index;
            }
        }
    })
    .controller('TodoCtrl', ["$scope", "$timeout" ,"$ionicModal", "$ionicSideMenuDelegate", "Projects", function($scope, $timeout, $ionicModal, $ionicSideMenuDelegate, Projects) {

        $scope.data = {
            showDelete: false
        };

        // A utility function for creating a new project
        // with the given projectTitle
        var createProject = function(projectTitle) {
            var newProject = Projects.newProject(projectTitle);
            $scope.projects.push(newProject);
            Projects.save($scope.projects);
            $scope.selectProject(newProject, $scope.projects.length-1);
        }

        // Load or initialize projects
        $scope.projects = Projects.all();

        // Grab the last active, or the first project
        $scope.activeProject = $scope.projects[Projects.getLastActiveIndex()];

        // Called to create a new project
        $scope.newProject = function() {
            var projectTitle = prompt('Project name');
            if(projectTitle) {
                createProject(projectTitle);
            }
        };

        // Called to select the given project
        $scope.selectProject = function(project, index) {
            $scope.activeProject = project;
            Projects.setLastActiveIndex(index);
            $ionicSideMenuDelegate.toggleLeft();
        };

        // Create and load the Modal
        $ionicModal.fromTemplateUrl('partials/new-task.html', function(modal) {
            $scope.taskModal = modal;
        }, {
            scope: $scope,
            animation: 'slide-in-up'
        });

        $scope.createTask = function(task) {
            if(!$scope.activeProject || !task) {
                return;
            }
            $scope.activeProject.tasks.push({
                title: task.title
            });
            $scope.taskModal.hide();

            // Inefficient, but save all the projects
            Projects.save($scope.projects);

            task.title = "";
        };

        $scope.newTask = function() {
            $scope.taskModal.show();
        };

        $scope.closeNewTask = function() {
            $scope.taskModal.hide();
        }

        $scope.toggleProjects = function() {
            $ionicSideMenuDelegate.toggleLeft();
        };

        // Try to create the first project, make sure to defer
        // this by using $timeout so everything is initialized
        // properly
        $timeout(function() {
            if($scope.projects.length == 0) {
                while(true) {
                    var projectTitle = prompt('Your first project title:');
                    if(projectTitle) {
                        createProject(projectTitle);
                        break;
                    }
                }
            }
        });

        $scope.optionButtons = [
            {
                text: 'Done',
                type: 'button-assertive ',
                onTap: function(task) {
                    CompletedTask(task);
                }
            },
            {
                text: 'Clean',
                type: 'Button',
                onTap: function(task) {
                    CleanTask(task);
                }
            }
        ];

        // Handler Task List Delete
        $scope.onTaskDelete = function(item) {
            $scope.activeProject.tasks.splice($scope.activeProject.tasks.indexOf(item), 1);
            // Inefficient, but save all the projects
            Projects.save($scope.projects);
        };

        function CompletedTask(task) {
            task.complete = !task.complete;
            Projects.save($scope.projects);
        };

        function CleanTask(task) {
            $scope.activeProject.tasks.splice($scope.activeProject.tasks.indexOf(task), 1);
            // Inefficient, but save all the projects
            Projects.save($scope.projects);
        };

        $scope.onMoveTask = function(item, fromIndex, toIndex) {
            $scope.activeProject.tasks.splice(fromIndex, 1);
            $scope.activeProject.tasks.splice(toIndex, 0, item);
        };


    }]);
