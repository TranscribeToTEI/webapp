'use strict';

angular.module('transcript.app.contact', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.contact', {
            views: {
                "page" : {
                    templateUrl: '/webapp/app/App/Contact/Contact.html',
                    controller: 'AppContactCtrl'
                }
            },
            url: '/contact',
            ncyBreadcrumb: {
                parent: 'transcript.app.home',
                label: 'Contact'
            },
            tfMetaTags: {
                title: 'Contact',
            },
        })
    }])

    .controller('AppContactCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', 'ContactService', 'flash', '$timeout', function($log, $rootScope, $scope, $http, $sce, $state, ContactService, flash, $timeout) {
        $scope.contact = {
            name: null,
            email: null,
            object: null,
            message: null
        };
        $scope.submit = {
            loading: false,
            success: false
        };

        $scope.submit.action = function() {
            $scope.submit.loading = true;

            contact();

            function contact() {
                return ContactService.send($scope.contact).
                then(function(response) {
                    $scope.submit.loading = false;
                    if(response.status === 200 || response.status === 201) {
                        $scope.submit.success = true;
                        flash.success = "Votre message a bien été envoyé.";
                        $timeout(function() {
                            $scope.submit.success = false;
                        }, 5000);
                    } else if(response.data.code === 400) {
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
                }, function errorCallback(response) {
                    $scope.submit.loading = false;
                    $log.debug(response);
                });
            }
        };
    }])
;