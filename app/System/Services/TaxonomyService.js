'use strict';

angular.module('transcript.service.taxonomy', ['ui.router'])

    .service('TaxonomyService', function($log, $http, $rootScope, $filter) {
        return {
            getTaxonomyEntities: function(type, profile) {
                let profileStr = "";
                if(profile !== undefined) {
                    profileStr = "?profile="+profile;
                }

                return $http.get(
                    $rootScope.api+"/"+type+profileStr
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    $log.debug(response);
                    return response;
                });
            },

            getTaxonomyEntity: function(type, id, profile) {
                let profileStr = "";
                if(profile !== undefined) {
                    profileStr = "?profile="+profile;
                }

                return $http.get(
                    $rootScope.api+"/"+type+"/"+id+profileStr
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    $log.debug(response);
                    return response;
                });
            },

            postTaxonomyEntity: function(type, data) {
                return $http.post($rootScope.api+"/"+type, data).
                then(function(response) {
                    return response;
                }, function errorCallback(response) {
                    $log.debug(response);
                    return response;
                });
            },

            patchTaxonomyEntity: function(type, id, data) {
                return $http.patch($rootScope.api+"/"+type+"/"+id, data).
                then(function(response) {
                    return response;
                }, function errorCallback(response) {
                    $log.debug(response);
                    return response;
                });
            },

            removeTaxonomyEntity: function(type, id) {
                return $http.delete($rootScope.api+"/"+type+"/"+id).
                then(function(response) {
                    return response;
                }, function errorCallback(response) {
                    $log.debug(response);
                    return response;
                });
            },

            getFormType: function(entity, type) {
                let form;
                switch(type) {
                    case 'testators':
                        let updateComment = null;
                        if(entity.updateComment !== null && entity.updateComment !== "") {
                            updateComment = entity.updateComment;
                        }

                        form = {
                            name: entity.name,
                            surname: entity.surname,
                            firstnames: entity.firstnames,
                            indexName: entity.indexName,
                            otherNames: entity.otherNames,
                            profession: entity.profession,
                            addressNumber: entity.addressNumber,
                            addressStreet: entity.addressStreet,
                            addressDistrict: entity.addressDistrict,
                            addressCity: entity.addressCity,
                            addressString: entity.addressString,
                            dateOfBirthString: entity.dateOfBirthString,
                            dateOfBirthNormalized: $filter('stringToDate')(entity.dateOfBirthNormalized),
                            dateOfBirthEndNormalized: $filter('stringToDate')(entity.dateOfBirthEndNormalized),
                            yearOfBirth: entity.yearOfBirth,
                            placeOfBirthString: entity.placeOfBirthString,
                            placeOfBirthNormalized: entity.placeOfBirthNormalized,
                            dateOfDeathString: entity.dateOfDeathString,
                            dateOfDeathNormalized: $filter('stringToDate')(entity.dateOfDeathNormalized),
                            dateOfDeathEndNormalized: $filter('stringToDate')(entity.dateOfDeathEndNormalized),
                            yearOfDeath: entity.yearOfDeath,
                            placeOfDeathString: entity.placeOfDeathString,
                            placeOfDeathNormalized: entity.placeOfDeathNormalized,
                            deathMention: entity.deathMention,
                            memoireDesHommes: $filter('stringToArray')(entity.memoireDesHommes),
                            militaryUnitString: entity.militaryUnitString,
                            militaryUnitNormalized: entity.militaryUnitNormalized,
                            militaryUnitDeploymentString: entity.militaryUnitDeploymentString,
                            rank: entity.rank,
                            description: entity.description,
                            updateComment: updateComment,
                            isOfficialVersion: false
                        };
                        break;
                    case 'military-units':
                        form = {
                            name: entity.name,
                            country: entity.country,
                            armyCorps: entity.armyCorps,
                            regimentNumber: entity.regimentNumber,
                            description: entity.description,
                            updateComment: entity.updateComment
                        };
                        break;
                    case 'places':
                        form = {
                            indexName: entity.indexName,
                            name: entity.name,
                            frenchDepartement: entity.frenchDepartement,
                            frenchRegion: entity.frenchRegion,
                            country: entity.country,
                            city: entity.city,
                            geonamesId: entity.geonamesId,
                            geographicalCoordinates: entity.geographicalCoordinates,
                            description: entity.description,
                            updateComment: entity.updateComment
                        };
                        break;
                    default:
                        form = {
                            name: entity.name,
                            description: entity.description
                        };
                }
                return form;
            },

            getNameFromPlaceName(names) {
                if (names.length > 0) {
                    return names[0]['name']
                } else {
                    return null;
                }
            }
        };
    })

;