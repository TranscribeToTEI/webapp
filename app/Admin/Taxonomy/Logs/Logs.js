'use strict';

angular.module('transcript.admin.taxonomy.logs', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider
            .state('transcript.admin.taxonomy.logs', {
                abstract: true,
                views: {
                    "page" : {
                        template: '<div ui-view="page"></div>'
                    }
                },
                url: '/logs'
            })
            .state('transcript.admin.taxonomy.logs.view', {
                views: {
                    "page" : {
                        templateUrl: 'Admin/Taxonomy/Logs/Logs.html',
                        controller: 'AdminTaxonomyLogsCtrl'
                    }
                },
                url: '/:types/:id',
                ncyBreadcrumb: {
                    parent: 'transcript.admin.taxonomy.logs.list',
                    label: 'Log {{ log.id }}'
                },
                tfMetaTags: {
                    title: 'Historique des modifications | Notices d\'autorité | Administration',
                },
                resolve: {
                    logs: function(LogService, $transition$) {
                        return LogService.getLogs($transition$.params().types);
                    },
                    log: function(LogService, $transition$) {
                        return LogService.getLog($transition$.params().types, $transition$.params().id);
                    }
                }
            })
            .state('transcript.admin.taxonomy.logs.list', {
                views: {
                    "page" : {
                        templateUrl: 'Admin/Taxonomy/Logs/Logs.html',
                        controller: 'AdminTaxonomyLogsCtrl'
                    }
                },
                url: '/:types',
                ncyBreadcrumb: {
                    parent: 'transcript.admin.home',
                    label: 'Historique des modifications'
                },
                tfMetaTags: {
                    title: 'Historique des modifications | Notices d\'autorité | Administration',
                },
                resolve: {
                    logs: function(LogService, $transition$) {
                        return LogService.getLogs($transition$.params().types).then(function(repo,se){
                            return data;
                        });
                    },
                    log: function() {
                        return null;
                    }
                }
            })
    }])

    .controller('AdminTaxonomyLogsCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', '$transition$', 'logs', 'log', function($rootScope, $scope, $http, $sce, $state, $transition$, logs, log) {
        $scope.logContainers = logs;
        $scope.logContainer = log;
        $scope.dataType = $transition$.params().types;

        /* Place names management ----------------------------------------------------------------------------------- */
        if($scope.logContainer !== null && $scope.logContainer.log !== null && $scope.logContainer.log.objectClass === 'AppBundle\\Entity\\Place') {
            if($scope.logContainer.entity.names.length > 0) {
                $scope.logContainer.entity.name = $scope.logContainer.entity.names[0].name;
            }
        }
        for(let iContainer in $scope.logContainers) {
            console.log(iContainer);
            if((iContainer.log !== null && iContainer.log !== undefined) && iContainer.log.objectClass === 'AppBundle\\Entity\\Place' && iContainer.entity.names.length > 0) {
                iContainer.entity.name = iContainer.entity.names[0].name;
            }
        }
        /* End: Place names management ------------------------------------------------------------------------------ */

        console.log($scope.logContainers);
        console.log($scope.logContainer);
    }])
;