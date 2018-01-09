'use strict';

angular.module('transcript.filter.transcriptionStatusName', ['ui.router'])

    .filter('transcriptionStatusName', ['$log', function($log) {
        return function (transcriptionStatusID, isShown) {
            let transcriptionStatusName = "";
            if(isShown === true) {
                switch (transcriptionStatusID) {
                    case "todo":
                        transcriptionStatusName = "à faire";
                        break;
                    case "transcription":
                        transcriptionStatusName = "en cours";
                        break;
                    case "validation":
                        transcriptionStatusName = "en validation";
                        break;
                    case "validated":
                        transcriptionStatusName = "validé";
                        break;
                    default:
                        transcriptionStatusName = "inconnu";
                }
            } else {
                transcriptionStatusName = "non ouvert à la transcription"
            }
            return transcriptionStatusName;
        }
    }])

;