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
                    return ContentService.getContents("blogContent", "public", "DESC", 10, 0);
                },
                staticContents: function(ContentService) {
                    return ContentService.getContents("staticContent", "public", "DESC", 10, 1);
                },
            }
        })
    }])

    .controller('AppHomeCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', '$filter', 'entities', 'contents', 'staticContents', 'SearchService', 'EntityService', function($log, $rootScope, $scope, $http, $sce, $state, $filter, entities, contents, staticContents, SearchService, EntityService) {
        $scope.entities = entities; //$log.debug($scope.entities);
        $scope.contents = contents;
        $scope.staticContents = staticContents;
        $scope.limitToResults = 50;

        for(let iEntity in $scope.entities) {
            if($scope.entities[iEntity].will.testator.placeOfBirthNormalized !== undefined && $scope.entities[iEntity].will.testator.placeOfBirthNormalized.names.length > 0) {
                $scope.entities[iEntity].will.testator.placeOfBirthNormalized.name = $scope.entities[iEntity].will.testator.placeOfBirthNormalized.names[0].name;
            }
            else if($scope.entities[iEntity].will.testator.placeOfBirthNormalized === undefined) {
                $scope.entities[iEntity].will.testator.placeOfBirthNormalized = {name: null};
            }
            $log.debug($scope.entities[iEntity].will.testator);
            if($scope.entities[iEntity].will.testator.placeOfDeathNormalized !== undefined && $scope.entities[iEntity].will.testator.placeOfDeathNormalized !== null && $scope.entities[iEntity].will.testator.placeOfDeathNormalized.names.length > 0) {
                $scope.entities[iEntity].will.testator.placeOfDeathNormalized.name = $scope.entities[iEntity].will.testator.placeOfDeathNormalized.names[0].name;
            } else if($scope.entities[iEntity].will.testator.placeOfDeathNormalized === undefined || $scope.entities[iEntity].will.testator.placeOfDeathNormalized === null) {
                $scope.entities[iEntity].will.testator.placeOfDeathNormalized = {name: null};
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
                            names: null
                        },
                        yearOfDeath: null,
                        placeOfBirthNormalized: {
                            names: null
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