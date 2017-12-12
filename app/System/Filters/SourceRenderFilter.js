'use strict';

angular.module('transcript.filter.sourceRender', ['ui.router'])

    .filter('sourceRender', ['$log', '$filter', function($log, $filter) {
        return function (sourceString, listSourceString) {
            let sourcesValues = sourceString.split('|'),
                sourcesType = listSourceString.split('|'),
                sourcesTrame = [],
                value = "",
                sourceTypeTitle = {
                    "TES": {name: "testateur", article: "le "},
                    "NOT": {name: "notaire", article: "le "},
                    "MDH": {name: "mémoire des Hommes", article: ""},
                    "EC": {name: "état civil", article: "l'"},
                    "AS": {name: "autre source", article: "une "}
                };

            for(let iSV in sourcesValues) {
                let source = sourcesValues[iSV];
                let sourceContainer = {
                    content: source.replace('/([^\[\]\|]+?)\s*\[(.+?)\]/', '$1'),
                    sourceType: source.replace('/([^\[\]\|]+?)\s*\[(.+?)\]/', '$2'),
                    sourceOrder: sourcesType.indexOf(sourcesType)
                };

                if(sourceContainer.sourceOrder === -1) {
                    sourceContainer.sourceType = null;
                    sourceContainer.sourceOrder = null;
                }

                if(sourcesType.indexOf(sourceContainer.sourceType) !== -1 || (sourcesValues.length === 1 && sourceContainer.sourceType === null)) {
                    sourcesTrame.push(sourceContainer);
                }
            }

            $filter('orderBy')(sourcesTrame, 'sourceOrder');

            for(let iST in sourcesTrame) {
                let sourceContainer = sourcesTrame[iST];
                value += sourceContainer.content;
                if(sourceContainer.sourceType !== null) {
                    value += " selon "+sourceTypeTitle[sourceContainer.sourceType].article+sourceTypeTitle[sourceContainer.sourceType].name;
                }
            }

            return value;
        }
    }])

;