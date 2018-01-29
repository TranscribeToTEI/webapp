'use strict';

angular.module('transcript.filter.stringToArray', ['ui.router'])

    .filter('stringToArray', ['$log', function($log) {
        return function (string) {
            let array = [];
            if(string.indexOf(',') !== -1) {
                array = string.split(',');
            } else if(string.indexOf('|') !== -1) {
                array = string.split('|');
            } else {
                array = [string];
            }
            return array;
        }
    }])

;