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
                        templateUrl: '/webapp/app/Admin/Taxonomy/Logs/Logs.html',
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
                        return LogService.getLog($transition$.params().types, $transition$.params().id, true);
                    },
                    logPrevious: function(LogService, $transition$) {
                        return LogService.getPreviousLog($transition$.params().types, $transition$.params().id, false);
                    }
                }
            })
            .state('transcript.admin.taxonomy.logs.list', {
                views: {
                    "page" : {
                        templateUrl: '/webapp/app/Admin/Taxonomy/Logs/Logs.html',
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
                        return LogService.getLogs($transition$.params().types);
                    },
                    log: function() {
                        return null;
                    },
                    logPrevious: function() {
                        return null;
                    }
                }
            })
    }])

    .controller('AdminTaxonomyLogsCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', '$filter', '$transition$', 'logs', 'log', 'logPrevious', function($log, $rootScope, $scope, $http, $sce, $state, $filter, $transition$, logs, log, logPrevious) {
        $scope.logContainers = logs;
        $scope.logContainer = log;
        $scope.logPreviousContainer = logPrevious;

        $scope.dataType = $transition$.params().types;

        if(log !== null) {
            $scope.entity = log.entity;

            if($scope.logContainer.type === 'Testator') {
                $scope.typeTaxo = 'testators';
            } else if($scope.logContainer.type === 'Place') {
                $scope.typeTaxo = 'places';
            } else if($scope.logContainer.type === 'MilitaryUnit') {
                $scope.typeTaxo = 'military-units';
            }
        }

        /* ---------------------------------------------------------------------------------------------------------- */
        /* Facets system */
        /* ---------------------------------------------------------------------------------------------------------- */
        $scope.$watch('search', function(newValue, oldValue){
            if($scope.search) {
                $scope.results = $filter('filter')($scope.logContainers, {title: $scope.search});
            } else {
                $scope.results = $scope.logContainers;
            }
            console.log($scope.results);
        });
        /* ---------------------------------------------------------------------------------------------------------- */

        /* ---------------------------------------------------------------------------------------------------------- */
        /* Pagination system */
        /* ---------------------------------------------------------------------------------------------------------- */
        $scope.itemsPerPage = 100;
        $scope.$watch('results', function() {
            $scope.totalItems = $scope.results.length;
            $scope.currentPage = 1;
        });

        $scope.setPage = function (pageNo) {
            $scope.currentPage = pageNo;
        };

        $scope.pageChanged = function() {
            $log.debug('Page changed to: ' + $scope.currentPage);
        };
        /* ---------------------------------------------------------------------------------------------------------- */
    }])
;