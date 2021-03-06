'use strict';

angular.module('transcript.filter.arrayRender', ['ui.router'])

    .filter('arrayRender', ['$log', function($log) {
        return function (array) {
            let string = "";

            for(let entry in array) {
                if(entry > 0) {string += ", ";}
                string += array[entry];
            }

            return string;
        }
    }])

;