'use strict';

angular.module('transcript.service.bibliography', ['ui.router'])

    .service('BibliographyService', function($http, $rootScope, $filter) {
        let BS = this;

        let postManuscriptReference = function(data) {
            return $http.post($rootScope.api+"/manuscript-references", data).
            then(function(response) {
                return response.data;
            }, function errorCallback(response) {
                console.log(response);
                return response;
            });
        },
        postPrintedReference = function(data) {
            return $http.post($rootScope.api+"/printed-references", data).
            then(function(response) {
                return response.data;
            }, function errorCallback(response) {
                console.log(response);
                return response;
            });
        },
        postReferenceItem = function(data) {
            return $http.post($rootScope.api+"/reference-items", data).
            then(function(response) {
                return response.data;
            }, function errorCallback(response) {
                console.log(response);
                return response;
            });
        },
        patchManuscriptReference = function(data, id) {
            return $http.patch($rootScope.api+"/manuscript-references/"+id, data).
            then(function(response) {
                return response.data;
            }, function errorCallback(response) {
                console.log(response);
                return response;
            });
        },
        patchPrintedReference = function(data, id) {
            return $http.patch($rootScope.api+"/printed-references/"+id, data).
            then(function(response) {
                return response.data;
            }, function errorCallback(response) {
                console.log(response);
                return response;
            });
        };

        return {
            getBibliographies: function() {
                return $http.get($rootScope.api+"/reference-items"
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            },

            getBibliographiesByEntity: function(id_entity) {
                return $http.get($rootScope.api+"/reference-items?entity="+id_entity
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            },

            getBibliography: function(id_reference) {
                return $http.get($rootScope.api+"/reference-items/"+id_reference
                ).then(function(response) {
                    return response.data;
                }, function errorCallback(response) {
                    console.log(response);
                    return response;
                });
            },

            postBibliography: function(entity, reference, type) {
                if(type === "manuscriptReference") {
                    return postManuscriptReference(reference).then(function(data) {
                        let item = {
                            entity: entity.id,
                            manuscriptReference: data.id,
                            updateComment: 'Creation of the item'
                        };
                        return postReferenceItem(item).then(function(RData) {
                            return RData;
                        });
                    });
                } else if(type === "printedReference") {
                    return postPrintedReference(reference).then(function(data) {
                        let item = {
                            entity: entity.id,
                            printedReference: data.id,
                            updateComment: 'Creation of the item'
                        };
                        return postReferenceItem(item).then(function(RData) {
                            return RData;
                        });
                    });
                }
            },

            patchBibliography: function(entity, reference, type, id) {
                if(type === "manuscriptReference") {
                    return patchManuscriptReference(reference, id).then(function(data) {
                        return data;
                    });
                } else if(type === "printedReference") {
                    return patchPrintedReference(reference, id).then(function(data) {
                        return data;
                    });
                }
            },
        };
    })
;