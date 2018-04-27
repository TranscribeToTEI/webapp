'use strict';

angular.module('transcript.filter.taxonomyEntityNameConstruct', ['ui.router'])

    .filter('taxonomyEntityNameConstruct', ['$log', function($log) {
        return function (entity, type, context) {
            let entityName = "";
            switch(type) {
                case "testators":
                    if(context === 'index') {
                        entityName = entity.indexName;
                    } else {
                        entityName = entity.surname + ", " + entity.firstnames;
                    }
                    break;
                case "places":
                    if(context === "city") {
                        entityName = entity.city;
                    } else if(context === "country") {
                        entityName = entity.country;
                    } else if(context === "frenchDepartement") {
                        entityName = entity.frenchDepartement;
                    } else if(context === "frenchRegion") {
                        entityName = entity.frenchRegion;
                    } else if(context === 'index') {
                        entityName = entity.indexName;
                    } else {
                        entityName = entity.name;
                    }
                    break;
                case "military-units":
                    entityName = entity.name;
                    break;
                default:
                    entityName = "Inconnu";
            }
            return entityName;
        }
    }])

;