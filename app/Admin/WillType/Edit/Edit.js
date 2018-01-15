'use strict';

angular.module('transcript.admin.will-type.edit', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider
            .state('transcript.admin.will-type.edit', {
                views: {
                    "page" : {
                        templateUrl: '/webapp/app/Admin/WillType/Edit/Edit.html',
                        controller: 'AdminWillTypeEditCtrl'
                    }
                },
                url: '/edit/:id',
                ncyBreadcrumb: {
                    parent: 'transcript.admin.will-type.list',
                    label: 'Modification'
                },
                tfMetaTags: {
                    title: 'Modification | Types de testaments | Administration',
                },
                resolve: {
                    willType: function(WillTypeService, $transition$) {
                        return WillTypeService.getType($transition$.params().id);
                    }
                }
            })
            .state('transcript.admin.will-type.new', {
                views: {
                    "page" : {
                        templateUrl: '/webapp/app/Admin/WillType/Edit/Edit.html',
                        controller: 'AdminWillTypeEditCtrl'
                    }
                },
                url: '/new',
                ncyBreadcrumb: {
                    parent: 'transcript.admin.will-type.list',
                    label: 'Nouveau type de testaments'
                },
                tfMetaTags: {
                    title: 'Nouveau | Types de testaments | Administration',
                },
                resolve: {
                    willType: function() {
                        return null;
                    }
                }
            })
    }])

    .controller('AdminWillTypeEditCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', 'flash', 'willType', function($log, $rootScope, $scope, $http, $sce, $state, flash, willType) {
        if(willType === null) {
            $scope.willType = {
                name: null,
                description: null
            };
        } else {
            $scope.willType = willType;
        }
        $log.debug($scope.willType);

        $scope.submit = {
            loading: false,
            success: false
        };
        $scope.remove = {
            loading: false
        };
        $scope.form = {};

        /**
         * Submit management
         */
        $scope.submit.action = function() {
            $scope.submit.loading = true;
            let formEntity = {
                name: $scope.willType.name,
                description: $scope.willType.description,
            };

            $log.debug(formEntity);
            if(willType === null) {
                $http.post($rootScope.api + '/will-types', formEntity).
                then(function (response) {
                    $log.debug(response.data);
                    $scope.submit.loading = false;
                    $scope.submit.success = true;
                    flash.success = "Vous allez être redirigé dans quelques instants...";
                    $state.go('transcript.admin.will-type.list');
                }, function errorCallback(response) {
                    $log.debug(response);
                    $scope.submit.loading = false;
                    flash.error = "<ul>";
                    for (let field in response.data.errors.children) {
                        $log.debug(response.data.errors.children);
                        $log.debug(field);
                        for (let error in response.data.errors.children[field]) {
                            if (error === "errors") {
                                flash.error += "<li><strong>" + field + "</strong> : " + response.data.errors.children[field][error] + "</li>";
                            }
                        }
                    }
                    flash.error += "</ul>";
                });
            } else {
                $http.patch($rootScope.api + '/will-types/' + $scope.willType.id, formEntity).
                then(function (response) {
                    $log.debug(response.data);
                    $scope.submit.loading = false;
                    $scope.submit.success = true;
                    flash.success = "Vous allez être redirigé dans quelques instants...";
                    $state.go('transcript.admin.will-type.list');
                }, function errorCallback(response) {
                    $log.debug(response);
                    $scope.submit.loading = false;
                    flash.error = "<ul>";
                    for (let field in response.data.errors.children) {
                        $log.debug(response.data.errors.children);
                        $log.debug(field);
                        for (let error in response.data.errors.children[field]) {
                            if (error === "errors") {
                                flash.error += "<li><strong>" + field + "</strong> : " + response.data.errors.children[field][error] + "</li>";
                            }
                        }
                    }
                    flash.error += "</ul>";
                });
            }
        };

        /**
         * Remove entity
         * */
        $scope.remove.action = function() {
            $scope.remove.loading = true;
            removeWillType();

            function removeWillType() {
                $http.delete($rootScope.api + '/will-types/' + $scope.willType.id).
                then(function (response) {
                    $log.debug(response.data);
                    $scope.submit.loading = false;
                    $scope.submit.success = true;
                    flash.success = "Vous allez être redirigé dans quelques instants...";
                    $state.go('transcript.admin.will-type.list');
                }, function errorCallback(response) {
                    $log.debug(response);
                    $scope.submit.loading = false;
                    flash.error = "<ul>";
                    for (let field in response.data.errors.children) {
                        $log.debug(response.data.errors.children);
                        $log.debug(field);
                        for (let error in response.data.errors.children[field]) {
                            if (error === "errors") {
                                flash.error += "<li><strong>" + field + "</strong> : " + response.data.errors.children[field][error] + "</li>";
                            }
                        }
                    }
                    flash.error += "</ul>";
                });
            }
        };
    }])
;