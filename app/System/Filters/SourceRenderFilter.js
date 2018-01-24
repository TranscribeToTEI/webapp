'use strict';

angular.module('transcript.filter.sourceRender', ['ui.router'])

    .filter('sourceRender', ['$log', '$filter', function($log, $filter) {
        return function (sourceString, listSourceString, allList, prefixRender) {
            if(sourceString === undefined || sourceString === "" || sourceString === null) {
                return "";
            }

            let sourcesValues = sourceString.split('|'),
                sourcesType = listSourceString.split('|'),
                sourcesTrame = [],
                value = "",
                sourceTypeTitle = {
                    "TES": {name: "testateur", article: "le "},
                    "NOT": {name: "minute notariale", article: "la "},
                    "MDH": {name: "mémoire des Hommes", article: ""},
                    "EC": {name: "état civil", article: "l'"},
                    "AS": {name: "autre source", article: "une "}
                };

            for(let iSV in sourcesValues) {
                let source = sourcesValues[iSV];
                let sourceContainer = {
                    content: source.replace(/(.+?)(\s*)(\[(TES|NOT|MDH|EC|AS)\])/g, '$1').trim(),
                    sourceType: source.replace(/(.+?)(\s*)(\[(TES|NOT|MDH|EC|AS)\])/g, '$4').trim(),
                    sourceOrder: sourcesType.indexOf(source.replace(/(.+?)(\s*)(\[(TES|NOT|MDH|EC|AS)\])/g, '$4').trim())
                };

                if(sourceContainer.sourceOrder === -1 && sourcesValues.length > 1) {
                    sourceContainer.sourceType = null;
                    sourceContainer.sourceOrder = null;
                } else {
                    sourcesTrame.push(sourceContainer);
                }
            }

            $filter('orderBy')(sourcesTrame, 'sourceOrder');
            for(let iST in sourcesTrame) {
                if((allList === false && parseInt(iST) === 0) || allList === true || allList === undefined) {
                    let sourceContainer = sourcesTrame[iST];

                    if(parseInt(iST) > 0 && iST < sourcesTrame.length) {
                        value += ", ";
                    } else if(parseInt(iST) > 0 && iST === sourcesTrame.length) {
                        value += " ou "
                    }

                    if (prefixRender !== undefined) {
                        value += $filter('prefixRender')(sourceContainer.content, prefixRender);
                    } else {
                        value += sourceContainer.content;
                    }

                    if (sourceContainer.sourceType !== null && sourcesType.indexOf(sourceContainer.sourceType) !== -1) {
                        value += " selon " + sourceTypeTitle[sourceContainer.sourceType].article + sourceTypeTitle[sourceContainer.sourceType].name;
                    }
                }
            }

            return value;
        }
    }])

;