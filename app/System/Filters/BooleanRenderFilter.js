'use strict';

angular.module('transcript.filter.booleanRender', ['ui.router'])

    .filter('booleanRender', ['$log', function($log) {
        return function (boolean) {
            let string = "";

            if(boolean === true) {
                string = "Oui";
            } else if(boolean === false) {
                string = "Non";
            } else {
                string = "Inconnu";
            }

            return string;
        }
    }])

;