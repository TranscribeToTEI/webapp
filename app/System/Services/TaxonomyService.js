'use strict';

angular.module('transcript.service.taxonomy', ['ui.router'])

    .service('TaxonomyService', function($http, $rootScope) {
        return {
            getTaxonomyEntities: function(type) {
                return $http.get(
                    $rootScope.api+"/"+type
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            },

            getTaxonomyEntity: function(type, id) {
                return $http.get(
                    $rootScope.api+"/"+type+"/"+id
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            },

            postTaxonomyEntity: function(type, data) {
                return $http.post($rootScope.api+"/"+type, data,
                    {
                        headers: {
                            'Authorization': $rootScope.oauth.token_type + " " + $rootScope.oauth.access_token
                        }
                    }
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            },

            patchTaxonomyEntity: function(type, id, data) {
                return $http.patch($rootScope.api+"/"+type+"/"+id, data,
                    {
                        headers: {
                            'Authorization': $rootScope.oauth.token_type + " " + $rootScope.oauth.access_token
                        }
                    }
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            },

            removeTaxonomyEntity: function(type, id) {
                return $http.delete($rootScope.api+"/"+type+"/"+id,
                    {
                        headers: {
                            'Authorization': $rootScope.oauth.token_type + " " + $rootScope.oauth.access_token
                        }
                    }
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            },

            getFormType: function(entity, type) {
                let form;
                switch(type) {
                    case 'testators':
                        form = {
                            name: entity.name,
                            surname: entity.surname,
                            firstnames: entity.firstnames,
                            profession: entity.profession,
                            address: entity.address,
                            dateOfBirth: new Date(entity.date_of_birth),
                            placeOfBirth: entity.place_of_birth.id,
                            dateOfDeath: new Date(entity.date_of_death),
                            placeOfDeath: entity.place_of_death.id,
                            deathMention: entity.death_mention,
                            memoireDesHommes: entity.memoire_des_hommes,
                            regiment: entity.regiment.id,
                            rank: entity.rank,
                            description: entity.description,
                            updateComment: entity.update_comment
                        };
                        break;
                    case 'regiments':
                        form = {
                            name: entity.name,
                            description: entity.description,
                            updateComment: entity.update_comment
                        };
                        break;
                    case 'places':
                        form = {
                            name: entity.name,
                            frenchDepartement: entity.french_departement,
                            frenchRegion: entity.french_region,
                            country: entity.country,
                            geonamesId: entity.geonames_id,
                            geographicalCoordinates: entity.geographical_coordinates,
                            description: entity.description,
                            updateComment: entity.update_comment
                        };
                        break;
                    default:
                        form = {
                            name: entity.name,
                            description: entity.description
                        };
                }
                return form;
            }
        };
    })

;