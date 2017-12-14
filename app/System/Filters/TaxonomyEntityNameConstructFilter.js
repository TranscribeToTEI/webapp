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
                    if(context === "cities") {
                        entityName = entity.cities[0].name;
                    } else if(context === "countries") {
                        entityName = entity.countries[0].name;
                    } else if(context === "frenchDepartements") {
                        entityName = entity.frenchDepartements[0].name;
                    } else if(context === "frenchRegions") {
                        entityName = entity.frenchRegions[0].name;
                    } else if(context === 'index') {
                        entityName = entity.indexName;
                    } else {
                        entityName = entity.names[0].name;
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