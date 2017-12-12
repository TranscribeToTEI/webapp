'use strict';

angular.module('transcript.app.taxonomy.ask', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.taxonomy.ask', {
            views: {
                "page" : {
                    templateUrl: 'App/Taxonomy/Ask/Ask.html',
                    controller: 'AppTaxonomyAskCtrl'
                }
            },
            url: '/access',
            ncyBreadcrumb: {
                parent: 'transcript.app.taxonomy.home',
                label: 'Demande d\'accès'
            },
            tfMetaTags: {
                title: 'Demande d\'accès | Notices d\'autorité',
            }
        })
    }])

    .controller('AppTaxonomyAskCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', '$filter', '$timeout', 'flash', 'AccessService', 'UserService', function($log, $rootScope, $scope, $http, $sce, $state, $filter, $timeout, flash, AccessService, UserService) {
        if($rootScope.user === undefined) {$state.go('transcript.error.403');}
        if($filter('contains')($rootScope.user.roles, "ROLE_TAXONOMY_EDIT") === true || $rootScope.preferences.taxonomyEditAccess === 'free' || $rootScope.preferences.taxonomyEditAccess === 'forbidden') {$state.go('transcript.app.taxonomy.home');}

        if($rootScope.user._embedded.accesses.taxonomyRequest !== null) {
            $scope.context = 'review';
        } else {
            $scope.context = 'ask';
        }

        $scope.form = {
            taxonomyRequest: null
        };
        $scope.submit = {
            loading: false,
            success: false
        };

        $scope.submit.action = function() {
            $scope.submit.loading = true;
            patchAccess();
        };

        $scope.refresh = function() {
            $state.reload();
        };

        function patchAccess() {
            let form = null;
            if($rootScope.preferences.taxonomyEditAccess === 'controlledAuthorization') {
                form = $scope.form;
            } else if($rootScope.preferences.taxonomyEditAccess === 'selfAuthorization') {
                form = {isTaxonomyAccess: true, taxonomyRequest: null};
            }

            $log.log(form);
            return AccessService.patchAccess(form, $rootScope.user._embedded.accesses.id).then(function(data) {
                if($rootScope.preferences.taxonomyEditAccess === 'controlledAuthorization') {
                    $scope.submit.loading = false;
                    $scope.submit.success = true;
                    $timeout(function() {
                        $scope.submit.success = false;
                    }, 5000);
                    $scope.context = "sent";
                    $state.reload();
                } else if($rootScope.preferences.taxonomyEditAccess === 'selfAuthorization') {
                    $rootScope.user._embedded.accesses = data;
                    setRole();
                }
            }, function errorCallback(response) {
                $scope.submit.loading = false;
                if(response.data.code === 400) {
                    flash.error = "<ul>";
                    for(let field of response.data.errors.children) {
                        for(let error of field) {
                            if(error === "errors") {
                                flash.error += "<li><strong>"+field+"</strong> : "+error+"</li>";
                            }
                        }
                    }
                    flash.error += "</ul>";
                }
                $log.log(response);
            });
        }
        function setRole() {
            return UserService.setRole($rootScope.user, ["ROLE_TAXONOMY_EDIT"], "promote").then(function(data) {
                $scope.submit.loading = false;
                $scope.context = "sent";
            });
        }
    }])
;