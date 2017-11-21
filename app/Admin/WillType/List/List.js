'use strict';

angular.module('transcript.admin.will-type.list', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.admin.will-type.list', {
            views: {
                "page" : {
                    templateUrl: 'Admin/WillType/List/List.html',
                    controller: 'AdminWillTypeListCtrl'
                }
            },
            url: '/list',
            ncyBreadcrumb: {
                parent: 'transcript.admin.home',
                label: 'Liste des types de testaments'
            },
            tfMetaTags: {
                title: 'Liste | Types de Testaments | Administration',
            },
            resolve: {
                willTypes: function(WillTypeService) {
                    return WillTypeService.getTypes();
                }
            }
        })
    }])

    .controller('AdminWillTypeListCtrl', ['$rootScope','$scope', '$http', '$sce', '$state', 'willTypes', function($rootScope, $scope, $http, $sce, $state, willTypes) {
        $scope.willTypes = willTypes;
        console.log($scope.willTypes);
    }])
;