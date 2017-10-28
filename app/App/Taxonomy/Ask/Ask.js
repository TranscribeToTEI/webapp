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
                title: 'Demande d\'accès',
            }
        })
    }])

    .controller('AppTaxonomyAskCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', '$filter', 'flash', 'AccessService', 'UserService', function($rootScope, $scope, $http, $sce, $state, $filter, flash, AccessService, UserService) {
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
            loading: false
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

            console.log(form);
            return AccessService.patchAccess(form, $rootScope.user._embedded.accesses.id).then(function(data) {
                if($rootScope.preferences.taxonomyEditAccess === 'controlledAuthorization') {
                    $scope.submit.loading = false;
                    $scope.context = "sent";
                    $rootScope.user._embedded.accesses = data;
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
                    flash.error = $sce.trustAsHtml(flash.error);
                }
                console.log(response);
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