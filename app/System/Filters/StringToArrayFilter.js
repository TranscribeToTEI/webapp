'use strict';

angular.module('transcript.filter.stringToArray', ['ui.router'])

    .filter('stringToArray', ['$log', function($log) {
        return function (string) {
            let array = string.split(',');
            if(string.indexOf(',') === -1) {
                array = [string];
            }
            return array;
        }
    }])

;