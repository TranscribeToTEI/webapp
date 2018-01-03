'use strict';

angular.module('transcript.filter.prefixRender', ['ui.router'])

    .filter('prefixRender', ['$log', '$filter', function($log, $filter) {
        return function (string, prefixArray) {
            if(string.indexOf(':') !== -1) {
                if(string.indexOf(',') !== -1) {
                    let arrayPrefix = string.split(',');
                    let stringToReturn = "";
                    for (let iPF in arrayPrefix) {
                        let prefixContainer = arrayPrefix[iPF].split(':');
                        if(prefixArray[prefixContainer[0]] !== undefined) {
                            stringToReturn += prefixContainer[1]+" ("+prefixArray[prefixContainer[0]]+")";
                        } else {
                            stringToReturn += prefixContainer[1];
                        }
                    }
                    return stringToReturn;
                } else {
                    let prefixContainer = string.split(':');
                    if(prefixArray[prefixContainer[0]] !== undefined) {
                        return prefixContainer[1]+" ("+prefixArray[prefixContainer[0]]+")";
                    } else {
                        return prefixContainer[1];
                    }
                }
            } else {
                return string;
            }
        }
    }])

;