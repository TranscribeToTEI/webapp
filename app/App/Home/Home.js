'use strict';

angular.module('transcript.app.home', ['ui.router'])

    .config(['$stateProvider', function($stateProvider) {
        $stateProvider.state('transcript.app.home', {
            views: {
                "page" : {
                    templateUrl: '/webapp/app/App/Home/Home.html',
                    controller: 'AppHomeCtrl'
                }
            },
            ncyBreadcrumb: {
                label: 'Accueil'
            },
            tfMetaTags: {
                title: 'Accueil',
            },
            url: '/',
            resolve: {
                entities: function(EntityService) {
                    return EntityService.getEntities("search");
                },
                contents: function(ContentService) {
                    return ContentService.getContents("blogContent", "public", "DESC", 10, null, 'id,summary');
                },
                topContributors: function(ContributorService) {
                    return ContributorService.getContributors(10);
                },
            }
        })
    }])

    .controller('AppHomeCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', '$filter', 'SearchService', 'entities', 'contents', 'topContributors', function($log, $rootScope, $scope, $http, $sce, $state, $filter, SearchService, entities, contents, topContributors) {
        $scope.entities = entities; console.log($scope.entities);
        $scope.contents = contents;
        $scope.limitToResults = 50;
        $scope.topContributors = topContributors; console.log($scope.topContributors);

        $scope.count = {
            todo: 0,
            validation: 0,
            validated: 0
        };

        for(let iEntity in $scope.entities) {
            if($scope.entities[iEntity].will.testator.placeOfBirthNormalized === undefined) {
                $scope.entities[iEntity].will.testator.placeOfBirthNormalized = {name: null};
            }
            if($scope.entities[iEntity].will.testator.placeOfDeathNormalized === undefined || $scope.entities[iEntity].will.testator.placeOfDeathNormalized === null) {
                $scope.entities[iEntity].will.testator.placeOfDeathNormalized = {name: null};
            }

            if(($scope.entities[iEntity]._embedded.status === 'todo' || $scope.entities[iEntity]._embedded.status === 'transcription') && $scope.entities[iEntity].isShown === true) {
                $scope.count.todo = ++$scope.count.todo;
            } else if($scope.entities[iEntity]._embedded.status === 'validation') {
                $scope.count.validation = ++$scope.count.validation;
            } else if($scope.entities[iEntity]._embedded.status === 'validated') {
                $scope.count.validated = ++$scope.count.validated;
            }
        }

        /* -- Search interface ------------------------------------------------ */
        /* -- Definition of the fields --------------------------------------------------------------- */
        $scope.results = [];
        $scope.search = {
            form: {
                will: {
                    testator: {
                        name: null,
                        placeOfDeathNormalized: {
                            name: null
                        },
                        yearOfDeath: null,
                        placeOfBirthNormalized: {
                            name: null
                        }
                    }
                }
            },
            values: {
                will: {
                    testator: {
                        name: SearchService.dataset($scope.entities, "will.testator.name", "string"),
                        placeOfDeathNormalized: {
                            name: SearchService.dataset($scope.entities, "will.testator.placeOfDeathNormalized.name", "string")
                        },
                        yearOfDeath: SearchService.dataset($scope.entities, "will.testator.yearOfDeath", "string"),
                        placeOfBirthNormalized: {
                            name: SearchService.dataset($scope.entities, "will.testator.placeOfBirthNormalized.name", "string")
                        }
                    }
                }
            }
        };
        /* -- End : Definition of the fields --------------------------------------------------------- */

        /* -- Fields watching ------------------------------------------------------------------------ */
        $scope.$watch('search.form.will.testator.name', function() {
            if($scope.search.form.will.testator.name !== undefined) {
                if ($scope.search.form.will.testator.name !== null && $scope.search.form.will.testator.name !== ""&& $scope.search.form.will.testator.name.originalObject !== undefined) {
                    $scope.search.form.will.testator.name = $scope.search.form.will.testator.name.originalObject.value;
                    $log.debug($scope.search.form.will.testator.name);
                }
                refresh();
            }
        });

        $scope.$watch('search.form.will.testator.placeOfDeathNormalized.name', function() {
            if($scope.search.form.will.testator.placeOfDeathNormalized.name !== undefined) {
                if ($scope.search.form.will.testator.placeOfDeathNormalized.name !== null && $scope.search.form.will.testator.placeOfDeathNormalized.name !== "" && $scope.search.form.will.testator.placeOfDeathNormalized.name.originalObject !== undefined) {
                    $scope.search.form.will.testator.placeOfDeathNormalized.name = $scope.search.form.will.testator.placeOfDeathNormalized.name.originalObject.value;
                    $log.debug($scope.search.form.will.testator.placeOfDeathNormalized.name);
                }
                refresh();
            }
        });

        $scope.$watch('search.form.will.testator.yearOfDeath', function() {
            if($scope.search.form.will.testator.yearOfDeath !== undefined) {
                if ($scope.search.form.will.testator.yearOfDeath !== null && $scope.search.form.will.testator.yearOfDeath !== "" && $scope.search.form.will.testator.yearOfDeath.originalObject !== undefined) {
                    $scope.search.form.will.testator.yearOfDeath = $scope.search.form.will.testator.yearOfDeath.originalObject.value;
                    $log.debug($scope.search.form.will.testator.yearOfDeath);
                }
                refresh();
            }
        });

        $scope.$watch('search.form.will.testator.placeOfBirthNormalized.name', function() {
            if($scope.search.form.will.testator.placeOfBirthNormalized.name !== undefined) {
                if ($scope.search.form.will.testator.placeOfBirthNormalized.name !== null && $scope.search.form.will.testator.placeOfBirthNormalized.name !== "" && $scope.search.form.will.testator.placeOfBirthNormalized.name.originalObject !== undefined) {
                    $scope.search.form.will.testator.placeOfBirthNormalized.name = $scope.search.form.will.testator.placeOfBirthNormalized.name.originalObject.value;
                    $log.debug($scope.search.form.will.testator.placeOfBirthNormalized.name);
                }
                refresh();
            }
        });
        /* -- End : Fields watching ------------------------------------------------------------------ */

        function refresh() {
            let toEntities = $scope.entities;
            let toForm = $scope.search.form;
            $scope.results = SearchService.search(toEntities, toForm);

            if($scope.search.form.will.testator.placeOfBirthNormalized.name !== undefined || $scope.search.form.will.testator.yearOfDeath !== undefined || $scope.search.form.will.testator.placeOfDeathNormalized.name !== undefined || $scope.search.form.will.testator.name !== undefined) {
                $scope.limitToResults = 1000;
            } else {
                $scope.limitToResults = 50;
            }

            $scope.results = $filter('shuffle')($scope.results);

            setMarkers();
        }

        /* -- Setting up map ----------------------------------------------------------------- */
        // Doc is here: http://tombatossals.github.io/angular-leaflet-directive/#!/examples/center
        angular.extend($scope, {
            center: {
                lat: 49.9128,
                lng: 3.7587,
                zoom: 6
            },
            tiles: {
                url: "http://a.tile.openstreetmap.fr/{z}/{x}/{y}.png"
            },
            markers: {

            },
            defaults: {
                scrollWheelZoom: false
            },
            legend: {
                position: 'bottomleft',
                colors: [ '#000000' ],
                labels: [ 'Lieux de décès' ]
            }
        });

        function setMarkers() {
            let markers = {};
            for(let result in $scope.results) {
                let entity = $scope.results[result];

                if(entity.will.testator.placeOfDeathNormalized !== undefined && entity.will.testator.placeOfDeathNormalized.geographicalCoordinates !== undefined) {
                    let coord = entity.will.testator.placeOfDeathNormalized.geographicalCoordinates.split('+');
                    let id = "maker"+entity.will.testator.id;
                    let iconMarker = "marker-icon";

                    if(entity._embedded.status === "todo") {iconMarker = "marker-icon-danger";}
                    else if(entity._embedded.status === "transcription") {iconMarker = "marker-icon-warning";}
                    else if(entity._embedded.status === "validation") {iconMarker = "marker-icon-primary";}
                    else if(entity._embedded.status === "validated") {iconMarker = "marker-icon-success";}

                    let marker = {
                        lat: parseFloat(coord[0]),
                        lng: parseFloat(coord[1]),
                        message: '<a href="#!/entity/'+entity.id+'">'+entity.will.testator.name+' décédé à '+entity.will.testator.placeOfDeathNormalized.name+'</a>',
                        focus: false,
                        draggable: false,
                        icon: {
                            iconUrl: '/webapp/app/web/images/markers/'+iconMarker+'.png',
                            iconAnchor: [8, 23],
                            popupAnchor: [0, -22],
                        }
                    };
                    markers[id] = marker;
                }
            }
            $scope.markers = markers;
        }
        /* -- End : Setting up map ----------------------------------------------------------- */
        /* -- Search interface ------------------------------------------------ */
    }])
;