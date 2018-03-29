'use strict';

angular.module('transcript.system.transcript', ['ui.router'])

    .controller('SystemTranscriptCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', '$timeout', '$filter', '$transitions', '$window', '$cookies', 'Fullscreen', 'ContentService', 'NoteService', 'SearchService', 'TaxonomyService', 'TrainingContentService', 'TranscriptService', 'TranscriptLogService', 'transcript', 'teiInfo', 'config', 'transcriptConfig', function($log, $rootScope, $scope, $http, $sce, $state, $timeout, $filter, $transitions, $window, $cookies, Fullscreen, ContentService, NoteService, SearchService, TaxonomyService, TrainingContentService, TranscriptService, TranscriptLogService, transcript, teiInfo, config, transcriptConfig) {
        if($rootScope.user === undefined) {$state.go('transcript.app.security.login');}
        else if(transcriptConfig.isExercise === false && transcript._embedded.isCurrentlyEdited === true && $filter('filter')(transcript._embedded.logs, {isCurrentlyEdited: true}).length > 0) {
            $log.debug('Redirection to edition -> Already in edition');
            $state.go('transcript.app.edition', {'idEntity': transcript._embedded.resource.entity.id, 'idResource': transcript._embedded.resource.id});
        } else {
            /* ---------------------------------------------------------------------------------------------------------- */
            /* $scope & variables */
            /* ---------------------------------------------------------------------------------------------------------- */
            $scope.transcript = transcript; $log.debug(transcript);
            $scope.resource = transcript._embedded.resource;
            $scope.entity = $scope.resource.entity;
            $scope.teiInfo = teiInfo.data; $log.debug($scope.teiInfo);
            $scope.config = config;
            $scope.transcriptConfig = transcriptConfig; console.debug($scope.transcriptConfig);
            $scope.taxonomy = { testators: null, places: null, militaryUnits: null };
            $scope.functions = {};
            $scope.smartTEI = (transcriptConfig.isExercise === false) ? $rootScope.user._embedded.preferences.smartTEI : $scope.transcriptConfig.isSmartTEI;
            $scope.complexEntry = $rootScope.user._embedded.preferences.showComplexEntry;
            $scope.transcriptArea = {
                interaction: {
                    documentation: {},
                    status: "live",
                    live: { content: "", microObjects: { active: true, activeClass: 'active bg-danger'} },
                    content: { title: "", text: "", history: []},
                    doc: { title: null, element: null, structure: null },
                    info: { title: null, element: null, structure: null},
                    historicalNotes: { elements: null, addForm: { submit: { loading: false }, form: { content: null } } },
                    taxonomy: { result: null, dataType: null, entities: null, string: null, taxonomySelected: null},
                    version: { id: null, content: null },
                    complexEntry: { available: false, name: null, arrayListTags: [], extendAvailabilityList: [], referenceTEIElement: null},
                    alertZone: { show: true, alerts: []}
                },
                ace: {
                    currentTag: null,
                    area: $scope.transcript.content,
                    lines: [],
                    modal: { content: "", variables: {} },
                    selection: null
                },
                toolbar: { tags: $scope.config.tags, groups: $scope.config.groups, level2: [], mouseOverLvl1: null, mouseOverLvl2: null, mouseOverLvl3: null, attributes: [] }
            };
            $scope.submit = {
                loading: false,
                success: false,
                form: {},
                checkList: {
                    /**
                     * a1 = ok
                     * a2 = non ok
                     * a3 = don't know
                     * a4 = no info
                     */
                    isTranscribed: "a4",
                    isStructured: "a4",
                    isLayouted: "a4",
                    isChoice: "a4",
                    isEntity: "a4"
                },
                state: { alert: "alert-success", btnClass: "btn-success", btnValue: "sauvegarder", message: "Pour sauvegarder votre travail, cliquer sur le bouton ci-dessous",}
            };
            $scope.admin = { status: { loading: false }, validation: { accept: { loading: false }, refuse: { loading: false }, content: ""}};
            $scope.role = TranscriptService.getTranscriptRights($rootScope.user);

            if ($scope.transcript.content === null) {$scope.transcriptArea.ace.area = "";}

            $scope.submit.form.continueBefore = $scope.transcript.continueBefore;
            $scope.submit.form.continueAfter = $scope.transcript.continueAfter;
            $scope.submit.form.submitUser = $scope.transcript.submitUser;
            $scope.TranscriptService = TranscriptService;
            $scope.updateTEIElementInformation = function(context) {
                // console.log(context);
                let transcriptServiceReturn = TranscriptService.getTEIElementInformation($scope.functions.getLeftOfCursor(), $scope.functions.getRightOfCursor(), $scope.aceSession.getLines(0, $scope.aceSession.getLength() - 1), $scope.transcriptArea.toolbar.tags, $scope.teiInfo, true);

                if(transcriptServiceReturn === null) {
                    $scope.transcriptArea.ace.currentTag = null;
                } else if(transcriptServiceReturn.type !== "comment") {
                    $scope.transcriptArea.ace.currentTag = transcriptServiceReturn;
                } else if(transcriptServiceReturn.type === "comment" && transcriptServiceReturn.parent !== null) {
                    $scope.transcriptArea.ace.currentTag = transcriptServiceReturn.parent;
                } else {
                    $scope.transcriptArea.ace.currentTag = null;
                }
                $scope.functions.updateToolbar();
                $scope.functions.updateAttributes();

                if ($scope.transcriptArea.ace.currentTag !== null && $scope.transcriptArea.interaction.complexEntry.extendAvailabilityList[$scope.transcriptArea.ace.currentTag.name] !== -1) {
                    $scope.transcriptArea.interaction.complexEntry.available = true;
                    $scope.transcriptArea.interaction.complexEntry.computeFieldAnalyzed();
                } else if(
                    ($scope.transcriptArea.ace.currentTag === null || $scope.transcriptArea.interaction.complexEntry.extendAvailabilityList[$scope.transcriptArea.ace.currentTag.name] === -1) &&
                    $scope.transcriptArea.interaction.complexEntry.available === true
                ) {
                    $scope.transcriptArea.interaction.complexEntry.available = false;
                    if($scope.transcriptArea.interaction.status === 'complexEntry') {
                        $scope.transcriptArea.interaction.status = 'live';
                    }
                }
            };
            $scope.decodeAttributes = function(attributes) {
                let array = [];

                if(attributes !== null) {
                    let attr = attributes.split(';');
                    for(let iA in attr) {
                        let attributeContainer = attr[iA].split(':');
                        array.push({id: attributeContainer[0], value: {value:attributeContainer[1]}});
                    }
                }

                return array;
            };
            /* $scope & variables --------------------------------------------------------------------------------------- */

            /* ---------------------------------------------------------------------------------------------------------- */
            /* Encoding function */
            /* ---------------------------------------------------------------------------------------------------------- */
            $scope.transcriptArea.interaction.live.encode = function() {
                let encodeLiveRender = "";
                for (let r = 0; r < $scope.aceSession.getLength(); r++) {
                    encodeLiveRender += $scope.aceSession.getLine(r);
                }
                $scope.transcriptArea.interaction.live.content = TranscriptService.encodeHTML(encodeLiveRender, $scope.transcriptArea.toolbar.tags, $scope.transcriptArea.interaction.live.microObjects.active, $scope.teiInfo);
            };
            /* End: Encoding function ----------------------------------------------------------------------------------- */

            /* ---------------------------------------------------------------------------------------------------------- */
            /* Computing Level2 */
            /* ---------------------------------------------------------------------------------------------------------- */
            for (let iG in $scope.transcriptArea.toolbar.groups) {
                if ($scope.transcriptArea.toolbar.groups[iG].order !== false) {
                    $scope.transcriptArea.toolbar.groups[iG].lType = "group";
                    $scope.transcriptArea.toolbar.level2.push($scope.transcriptArea.toolbar.groups[iG]);
                }
            }
            for (let iT in $scope.transcriptArea.toolbar.tags) {
                if ($scope.transcriptArea.toolbar.tags[iT].order !== undefined && $scope.transcriptArea.toolbar.tags[iT].order !== false && $scope.transcriptArea.toolbar.tags[iT].btn.level === 2) {
                    $scope.transcriptArea.toolbar.tags[iT].lType = "btn";
                    $scope.transcriptArea.toolbar.level2.push($scope.transcriptArea.toolbar.tags[iT]);
                }
            }
            /* Computing Level2 ----------------------------------------------------------------------------------------- */

            /* ---------------------------------------------------------------------------------------------------------- */
            /* Updating Transcript Log */
            /* ---------------------------------------------------------------------------------------------------------- */
            if($scope.transcriptConfig.isExercise === false) {
                if ($scope.transcript._embedded.isCurrentlyEdited === false) {
                    console.log('creation of transcript log -> Transcript is now closed');
                    TranscriptLogService.postTranscriptLog({
                        'isCurrentlyEdited': true,
                        'transcript': $scope.transcript.id
                    }).then(function (data) {
                        $scope.currentLog = data;
                    });
                } else {
                    $scope.currentLog = $filter('filter')($scope.transcript._embedded.logs, {isCurrentlyEdited: true})[0];
                }
            } else {
                $scope.currentLog = null;
            }

            // In case of closing window:
            $scope.exitOAuth = JSON.parse($cookies.get('transcript_security_token_access'))['access_token'];
            $scope.onExit = function() {
                if ($scope.transcriptConfig.isExercise === false) {
                    let data = angular.toJson({isCurrentlyEdited: false});
                    // We use an XMLHttpRequest to override the asynchronous request of $http, in order to patch before closing tab
                    let xmlhttp = new XMLHttpRequest();
                    xmlhttp.open("PATCH", $rootScope.api+"/transcript-logs/"+$scope.currentLog.id, false);//the false is for making the call synchronous
                    xmlhttp.setRequestHeader("Content-type", "application/json");
                    xmlhttp.setRequestHeader("Authorization", "Bearer "+$scope.exitOAuth);
                    xmlhttp.send(data);
                }
            };
            $window.onbeforeunload =  $scope.onExit;
            /* End: Updating Transcript Log ----------------------------------------------------------------------------- */

            /* ---------------------------------------------------------------------------------------------------------- */
            /* Toolbar */
            /* ---------------------------------------------------------------------------------------------------------- */
            $scope.functions.updateToolbar = function () {
                // -----------------------------------------------------------------------------------------------------
                //Starting by cleaning the different arrays of the temporary groups and tags:
                $scope.transcriptArea.toolbar.level2.forEach(function(item, index, level2) {
                    if(item.lType === "group" && item.proviGroup === true) {
                        level2.splice(index, 1);
                    } else if(item.lType === "btn" && item.btn.proviTag === true) {
                        //console.log(item);
                        level2.splice(index, 1);
                    }
                });
                for (let grp in $scope.transcriptArea.toolbar.groups) {
                    if($scope.transcriptArea.toolbar.groups[grp].proviGroup !== undefined) {
                        delete $scope.transcriptArea.toolbar.groups[grp];
                    }
                }
                // -----------------------------------------------------------------------------------------------------

                let toUnIndex = [];
                for (let btn in $scope.transcriptArea.toolbar.tags) {
                    if($scope.transcriptArea.toolbar.tags[btn].btn !== undefined) {
                        if($scope.transcriptArea.toolbar.tags[btn].proviTag !== undefined) {
                            // If this is a temporary btn, we remove it
                            delete $scope.transcriptArea.toolbar.tags[btn];
                        } else {
                            let tag = $scope.transcriptArea.toolbar.tags[btn];
                            tag.btn.enabled = false; // Default state, especially for level1 btn
                            tag.btn.view = true; // Default state, especially for level2 btn

                            if (($scope.transcriptArea.ace.currentTag === undefined || $scope.transcriptArea.ace.currentTag === null) && tag.btn.allow_root === true && tag.btn.level === 1) {
                                // If the caret is at the root of the doc, we allow root items == true
                                tag.btn.view = true;
                                tag.btn.enabled = true;
                            } else if ($scope.transcriptArea.ace.currentTag !== undefined && $scope.transcriptArea.ace.currentTag !== null &&
                                $scope.teiInfo[$scope.transcriptArea.ace.currentTag.name] !== undefined && $scope.teiInfo[$scope.transcriptArea.ace.currentTag.name].content !== undefined &&
                                $scope.teiInfo[$scope.transcriptArea.ace.currentTag.name].content.indexOf(tag.xml.name) !== -1) {
                                // Else, we allow items according to the parent tag
                                tag.btn.view = true;
                                tag.btn.enabled = true;
                            }

                            if ($scope.transcriptArea.ace.selection !== null &&
                                tag.btn.enabled === true &&
                                tag.btn.choicesByAttr !== undefined &&
                                $scope.teiInfo[tag.xml.name].attributes !== undefined &&
                                $scope.teiInfo[tag.xml.name].attributes[tag.btn.choicesByAttr] !== undefined &&
                                $scope.teiInfo[tag.xml.name].attributes[tag.btn.choicesByAttr].values !== undefined &&
                                $scope.transcriptArea.toolbar.groups[tag.id] === undefined &&
                                $filter('filter')($scope.transcriptArea.toolbar.level2, {
                                    lType: "group",
                                    id: tag.id
                                }).length === 0)
                            {
                                toUnIndex.push(tag.id);
                                tag.btn.view = false;

                                /* Creation of a virtual group ------------------------------------------------------ */
                                $scope.transcriptArea.toolbar.groups[tag.id] = {
                                    name: tag.btn.label,
                                    id: tag.id,
                                    icon: tag.btn.icon,
                                    parent: false,
                                    order: tag.order,
                                    lType: "group",
                                    proviGroup: true
                                };
                                $scope.transcriptArea.toolbar.level2.push($scope.transcriptArea.toolbar.groups[tag.id]);
                                /* End: Creation of a virtual group ------------------------------------------------- */

                                /* Creation of the attribute buttons ------------------------------------------------ */
                                let countNewButtons = 1;
                                for (let iPB in $scope.teiInfo[tag.xml.name].attributes[tag.btn.choicesByAttr].values) {
                                    let value = $scope.teiInfo[tag.xml.name].attributes[tag.btn.choicesByAttr].values[iPB];

                                    $scope.transcriptArea.toolbar.tags[tag.id + "-" + value.value] = {
                                        btn: {
                                            id: btn + "-" + value.value,
                                            label: $filter('ucFirstStrict')(value.label),
                                            label_forced: true,
                                            title: $filter('ucFirstStrict')(value.label),
                                            icon: "",
                                            btn_class: "",
                                            btn_group: tag.id,
                                            btn_is_group: false,
                                            allow_root: false,
                                            restrict_to_root: false,
                                            enabled: true,
                                            level: 2,
                                            separator_before: false,
                                            proviTag: true
                                        },
                                        order: countNewButtons,
                                        lType: "btn",
                                        caret: {
                                            position: "prepend"
                                        },
                                        html: {
                                            name: "span",
                                            unique: false,
                                            attributes: {
                                                class: "hi"
                                            }
                                        },
                                        xml: {
                                            name: "hi",
                                            attributes: {
                                                rend: value.value
                                            },
                                            unique: false,
                                            replicateOnEnter: false,
                                            replicateOnCtrlEnter: false
                                        },
                                        complex_entry: {
                                            enable: true,
                                            children: ""
                                        }
                                    };
                                    $scope.transcriptArea.toolbar.level2.push($scope.transcriptArea.toolbar.tags[tag.id + "-" + value.value]);
                                    countNewButtons += 1;
                                    /* End: Creation of the attribute buttons --------------------------------------- */
                                }
                            }
                        }
                    }
                }

                toUnIndex.forEach(function(id) {
                    $scope.transcriptArea.toolbar.level2.forEach(function(item) {
                        if(item.btn !== undefined && item.id === id) {
                            item.btn.view = false;
                        }
                    });
                    $filter('filter')($scope.transcriptArea.toolbar.tags, {id: id}, true)[0].btn.view = false;
                });

                // We update the enable status of groups of level2
                $scope.transcriptArea.toolbar.level2.forEach(function(item) {
                    if(item.lType === 'group') {
                        item.enable = false;
                    }
                });
                $scope.transcriptArea.toolbar.level2.forEach(function(item) {
                    if(item.lType === 'btn' && item.btn.enabled === true) {
                        $scope.transcriptArea.toolbar.level2.forEach(function(group) {
                            if(group.lType === 'group' && group.id === item.btn.btn_group) {
                                group.enable = true;
                            }
                        });
                    }
                });
            };
            /* Toolbar -------------------------------------------------------------------------------------------------- */

            /* ---------------------------------------------------------------------------------------------------------- */
            /* Complex Entry Management */
            /* ---------------------------------------------------------------------------------------------------------- */

            for(let iTag in $scope.transcriptArea.toolbar.tags) {
                let tag = $scope.transcriptArea.toolbar.tags[iTag];
                if(tag.complex_entry.enable === true) {
                    let listTagsComplexEntry = [];
                    listTagsComplexEntry = tag.complex_entry.children.split(/\(|&&|\)|\)\|\|\(|\|\|/);
                    listTagsComplexEntry.push(iTag);
                    listTagsComplexEntry = listTagsComplexEntry.filter(function(n){ return n !== "" });
                    $scope.transcriptArea.interaction.complexEntry.arrayListTags.push({element: tag, list: listTagsComplexEntry});
                    $scope.transcriptArea.interaction.complexEntry.extendAvailabilityList = $scope.transcriptArea.interaction.complexEntry.extendAvailabilityList.concat(listTagsComplexEntry);
                }
            }
            /* Complex Entry Management --------------------------------------------------------------------------------- */

            /* ---------------------------------------------------------------------------------------------------------- */
            /* Ace Editor */
            /* ---------------------------------------------------------------------------------------------------------- */
            /**
             * On loading the Ace interface
             *
             * @param _editor
             */
            $scope.aceLoaded = function (_editor) {
                /* ------------------------------------------------------------------------------------------------------ */
                /* Variables */
                /* ------------------------------------------------------------------------------------------------------ */
                $scope.aceEditor = _editor; // Doc -> https://ace.c9.io/#nav=api&api=editor
                $scope.aceSession = _editor.getSession(); // Doc -> https://ace.c9.io/#nav=api&api=edit_session
                let AceRange = $scope.aceEditor.getSelectionRange().constructor; //Doc -> https://stackoverflow.com/questions/28893954/how-to-get-range-when-using-angular-ui-ace#28894262
                $scope.aceUndoManager = $scope.aceSession.setUndoManager(new ace.UndoManager());
                $scope.aceEditor.focus();
                $scope.aceEditor.navigateFileEnd();
                $scope.transcriptArea.ace.lines = $scope.aceSession.getLines(0, $scope.aceSession.getLength() - 1);
                /* Variables -------------------------------------------------------------------------------------------- */

                /* ------------------------------------------------------------------------------------------------------ *
                 * Commands
                 * Important notes :
                 * - > "return false;" is the command to maintain the default behaviour of the command
                 * - > See default commands at https://github.com/ajaxorg/ace/wiki/Default-Keyboard-Shortcuts
                 * ------------------------------------------------------------------------------------------------------ */
                $scope.aceEditor.commands.addCommand({
                    name: '<',
                    bindKey: {win: '<', mac: '<'},
                    exec: function (editor) {
                        $scope.$apply(function () {
                            /* Computing of current tag value */
                            $scope.updateTEIElementInformation('<');
                        });
                        return false;
                    }
                });
                $scope.aceEditor.commands.addCommand({
                    name: '>',
                    bindKey: {win: '>', mac: '>'},
                    exec: function (editor) {
                        $scope.$apply(function () {
                            /* Computing of current tag value */
                            $scope.updateTEIElementInformation('>');
                        });
                        return false;
                    }
                });
                $scope.aceEditor.commands.addCommand({
                    name: 'space',
                    bindKey: {win: 'space', mac: 'space'},
                    exec: function (editor) {
                        $scope.$apply(function () {
                            /* Computing of current tag value */
                            $scope.updateTEIElementInformation('space');
                        });
                        return false;
                    }
                });
                $scope.aceEditor.commands.addCommand({
                    name: 'enter',
                    bindKey: {win: 'Enter', mac: 'Enter'},
                    exec: function (editor) {
                        let line = $scope.aceEditor.getCursorPosition().row,
                            column = $scope.aceEditor.getCursorPosition().column;

                        /* replicateOnCtrlEnter Management :
                         * Conditions: if the tag has replicateOnCtrlEnter: true in the config, and the tag is empty and smartTEI is available
                         * Result: remove the tag and jump to the end of the parent tag
                         */
                        if ($scope.transcriptArea.toolbar.tags[$scope.transcriptArea.ace.currentTag.name].xml.replicateOnCtrlEnter === true && $scope.transcriptArea.ace.currentTag !== null && /^\s*$/.test($scope.transcriptArea.ace.currentTag.content) && $scope.smartTEI === true) {
                            $scope.aceSession.getDocument().remove(new AceRange($scope.transcriptArea.ace.currentTag.startTag.start.row, $scope.transcriptArea.ace.currentTag.startTag.start.column - 1, $scope.transcriptArea.ace.currentTag.endTag.end.row, $scope.transcriptArea.ace.currentTag.endTag.end.column + 1));
                            $scope.$apply(function () {
                                $scope.updateTEIElementInformation('Enter');
                            });
                            $scope.aceEditor.getSelection().moveCursorTo($scope.transcriptArea.ace.currentTag.endTag.end.row, $scope.transcriptArea.ace.currentTag.endTag.end.column + 1);
                            $scope.aceEditor.focus();
                        }
                        /* *Line break:*
                         * Conditions: if "lb" tag is available in the toolbar and smartTEI is available
                         * Result: insert a "lb" tag at the end of a line and jump to a new line
                         */
                        else if ($scope.transcriptArea.toolbar.tags.lb.btn.enabled === true && $scope.smartTEI === true) {
                            editor.insert("<lb/>\n");
                        }
                        else {
                            return false;
                        }

                        $scope.$apply(function () {
                            /* Computing of current tag value */
                            $scope.updateTEIElementInformation('EnterBis');
                        });
                    }
                });
                $scope.aceEditor.commands.addCommand({
                    name: 'ctrlEnter',
                    bindKey: {win: 'Ctrl-Enter', mac: 'Command-Enter'},
                    exec: function (editor) {
                        $scope.$apply(function () {
                            /* Computing of current tag value */
                            $scope.updateTEIElementInformation("Ctrl-Enter");
                        });

                        /* *replicateOnCtrlEnter insert:*
                         * Conditions: if current tag has replicateOnCtrlEnter: true on the config file and smartTEI is available
                         * Result: insert the same new tag after the current one and jump into
                         */
                        if ($scope.transcriptArea.toolbar.tags[$scope.transcriptArea.ace.currentTag.name].xml.replicateOnCtrlEnter === true && $scope.smartTEI === true) {
                            let row = $scope.transcriptArea.ace.currentTag.endTag.end.row,
                                column = $scope.transcriptArea.ace.currentTag.endTag.end.column;

                            $scope.aceSession.insert(
                                {row: row, column: column + 1},
                                "\n" + $scope.functions.constructTag($filter('filter')($scope.transcriptArea.toolbar.tags, {id: $scope.transcriptArea.ace.currentTag.name}, true)[0], "default")
                            );
                            $scope.aceEditor.getSelection().moveCursorTo(row + 1, 2 + $scope.transcriptArea.ace.currentTag.name.length);
                            $scope.aceEditor.focus();
                            $scope.$apply(function () {
                                /* Computing of current tag value */
                                $scope.updateTEIElementInformation("Ctrl-EnterBis");
                            });
                        } else {
                            return false;
                        }

                    }
                });
                $scope.aceEditor.commands.addCommand({
                    name: 'leftAction',
                    bindKey:
                        {
                            win: 'Left', mac: 'Left'
                        },
                    exec: function () {
                        $scope.$apply(function () {
                            /* Computing of current tag value */
                            $scope.updateTEIElementInformation("Left");
                        });
                        return false;
                    }
                });
                $scope.aceEditor.commands.addCommand({
                    name: 'rightAction',
                    bindKey:
                        {
                            win: 'Right', mac: 'Right'
                        },
                    exec: function () {
                        $scope.$apply(function () {
                            /* Computing of current tag value */
                            $scope.updateTEIElementInformation("Right");
                        });
                        return false;
                    }
                });
                $scope.aceEditor.commands.addCommand({
                    name: 'upAction',
                    bindKey:
                        {
                            win: 'Up', mac: 'Up'
                        },
                    exec: function () {
                        $scope.$apply(function () {
                            /* Computing of current tag value */
                            $scope.updateTEIElementInformation("Up");
                        });
                        return false;
                    }
                });
                $scope.aceEditor.commands.addCommand({
                    name: 'downAction',
                    bindKey:
                        {
                            win: 'Down', mac: 'Down'
                        },
                    exec: function () {
                        $scope.$apply(function () {
                            /* Computing of current tag value */
                            $scope.updateTEIElementInformation("Down");
                        });
                        return false;
                    }
                });
                /* Commands --------------------------------------------------------------------------------------------- */

                /* ------------------------------------------------------------------------------------------------------ */
                /* Click events */
                /* ------------------------------------------------------------------------------------------------------ */
                $scope.aceEditor.container.addEventListener("dblclick", function (e) {
                    e.preventDefault();

                    /* *Loading documentation for tags:*
                     * Conditions: if the user double-click one a tag name
                     * Result: load the interaction interface with the doc about this tag
                     * To know: We detect tag by looking at the previous character. We assume if the character is < or /, this is a tag.
                     */
                    let previousCharacter = $scope.aceSession.getDocument().getTextRange(new AceRange($scope.aceEditor.getSelectionRange().start.row, $scope.aceEditor.getSelectionRange().start.column - 1, $scope.aceEditor.getSelectionRange().start.row, $scope.aceEditor.getSelectionRange().start.column));
                    if (previousCharacter === '<' || previousCharacter === '/') {
                        $scope.transcriptArea.interaction.help($scope.aceSession.getTextRange($scope.aceEditor.getSelectionRange()), "modelDoc", true);
                    }
                    return false;
                }, false);
                $scope.aceEditor.container.addEventListener("click", function (e) {
                    e.preventDefault();

                    if($scope.aceEditor.getSelectedText() !== '') {
                        $scope.transcriptArea.ace.selection = $scope.aceEditor.getSelectedText();
                    } else {
                        $scope.transcriptArea.ace.selection = null;
                    }

                    $scope.$apply(function () {
                        // Computing of current tag value
                        $scope.updateTEIElementInformation("click");
                    });
                    return false;
                }, false);
                /* Click events ----------------------------------------------------------------------------------------- */
            };

            $scope.aceChanged = function () {
                /* *Refresh toolbar content:*
                 * Conditions: if currentTag value changes
                 * Result: Reload the toolbar content
                 */
                let AceRange = $scope.aceEditor.getSelectionRange().constructor; //Doc -> https://stackoverflow.com/questions/28893954/how-to-get-range-when-using-angular-ui-ace#28894262

                /**
                 * This function watches the transcription (ace area), encodes it and displays it in the live
                 */
                $scope.$watch('transcriptArea.ace.area', function () {
                    if($scope.aceEditor.getSelectedText() !== '') {
                        $scope.transcriptArea.ace.selection = $scope.aceEditor.getSelectedText()
                    } else {
                        $scope.transcriptArea.ace.selection = null;
                    }

                    $scope.transcriptArea.interaction.live.encode();
                    $scope.transcriptArea.ace.lines = $scope.aceSession.getLines(0, $scope.aceSession.getLength() - 1);
                    //$scope.functions.updateAlerts();

                    /* Exercise Management -------------------------------------------------------------------------- */
                    if($scope.transcriptConfig.isExercise === true) {
                        if($filter('filter')(TrainingContentService.resultsOfExercises, {id: $scope.transcriptConfig.exerciseId}).length > 0) {
                            $filter('filter')(TrainingContentService.resultsOfExercises, {id: $scope.transcriptConfig.exerciseId})[0].content = $scope.transcriptArea.ace.area;
                        } else {
                            TrainingContentService.resultsOfExercises.push({
                                id: $scope.transcriptConfig.exerciseId,
                                content: $scope.transcriptArea.ace.area
                            });
                        }
                    }
                    /* Exercise Management -------------------------------------------------------------------------- */
                });
            };

            $scope.$watch('aceEditor.getSelectedText', function () {
                if($scope.aceEditor.getSelectedText() !== null && $scope.aceEditor.getSelectedText() !== '') {
                    $scope.updateTEIElementInformation("selection");
                }
                /* Exercise Management -------------------------------------------------------------------------- */
            });

            /**
             * Undo management
             * @param direction
             */
            $scope.undo = function (direction) {
                if (direction === "prev") {
                    $scope.aceEditor.undo();
                } else if (direction === "next" === true) {
                    $scope.aceEditor.redo();
                }
                $scope.updateTEIElementInformation("undo");
            };
            /* Ace editor ----------------------------------------------------------------------------------------------- */

            /* ---------------------------------------------------------------------------------------------------------- */
            /* XML Parser :
             * Find the current tag in AceEditor */
            /* ---------------------------------------------------------------------------------------------------------- */
            $scope.functions.getLeftOfCursor = function () {
                let partOfCode = "";

                for (let r = 0; r <= $scope.aceEditor.getCursorPosition().row; r++) {
                    if (r < $scope.aceEditor.getCursorPosition().row) {
                        partOfCode += $scope.aceSession.getLine(r);
                    } else if (r === $scope.aceEditor.getCursorPosition().row) {
                        let line = $scope.aceSession.getLine(r);
                        partOfCode += line.substring(0, $scope.aceEditor.getCursorPosition().column);
                    }
                }

                return (partOfCode !== "") ? partOfCode : null;
            };

            $scope.functions.getRightOfCursor = function () {
                let partOfCode = "";

                for (let r = $scope.aceEditor.getCursorPosition().row; r < $scope.aceSession.getLength(); r++) {
                    if (r > $scope.aceEditor.getCursorPosition().row) {
                        partOfCode += $scope.aceSession.getLine(r);
                    } else if (r === $scope.aceEditor.getCursorPosition().row) {
                        let line = $scope.aceSession.getLine(r);
                        partOfCode += line.substring($scope.aceEditor.getCursorPosition().column, $scope.aceSession.getLine(r).length);
                    }
                }

                return (partOfCode !== "") ? partOfCode : null;
            };
            /* End : XmlTagInterpreter ---------------------------------------------------------------------------------- */

            /* ---------------------------------------------------------------------------------------------------------- */
            /* XML TEI breadcrumb Management */
            /* ---------------------------------------------------------------------------------------------------------- */
            $scope.transcriptArea.ace.goToParent = function (index) {
                $scope.aceEditor.getSelection().moveCursorToPosition({
                    row: $scope.transcriptArea.ace.currentTag.parents[index].startTag.end.row,
                    column: $scope.transcriptArea.ace.currentTag.parents[index].startTag.end.column
                });
                $scope.aceEditor.clearSelection();
                $scope.aceEditor.focus();
                $scope.updateTEIElementInformation("goToParent");
            };
            /* XML TEI breadcrumb Management ---------------------------------------------------------------------------- */

            /* ---------------------------------------------------------------------------------------------------------- */
            /* Tags Management */
            /* ---------------------------------------------------------------------------------------------------------- */
            /**
             * Generate the tag
             *
             * @param tag (From the config)
             * @param action
             * @param parent
             * @param attributes
             * @returns {string}
             */
            $scope.functions.constructTag = function(tag, action, parent, attributes) {
                let tagInsert = "",
                    requiredAttributes = "";
                if(attributes === undefined) {attributes = {};}

                /* Required attributes management ------------------------------------------------------------------- */
                /*for (let iAttribute in $scope.teiInfo[tag.xml.name].attributes) {
                    let attribute = $scope.teiInfo[tag.xml.name].attributes[iAttribute];
                    if (attribute.usage === "req" && $filter('filter')(attributes, {id: attribute.id}).length === 0) {
                        requiredAttributes += $scope.functions.constructAttribute(attribute.id, null);
                    }
                }*/
                if(attributes !== undefined && attributes !== null && attributes.length > 0) {
                    for(let iAttribute in attributes) {
                        requiredAttributes += $scope.functions.constructAttribute(attributes[iAttribute].id, attributes[iAttribute].value);
                    }
                }

                //Special cases:
                if (tag.xml.name === "note" && parent !== undefined && parent.xml.name === "app") {
                    //In case of note from app context, we add the resp attribute
                    requiredAttributes += $scope.functions.constructAttribute("resp", null);
                }
                /* End: Required attributes management -------------------------------------------------------------- */

                /* Tag construction management ---------------------------------------------------------------------- */
                if (tag.xml.unique === true) {
                    tagInsert = "<" + tag.xml.name + requiredAttributes + "/>";
                } else if (tag.xml.unique === false) {
                    if (tag.xml.contains === undefined) {
                        if (action === "default") {
                            tagInsert = "<" + tag.xml.name + requiredAttributes + ">" + $scope.aceSession.getTextRange($scope.aceEditor.getSelectionRange()) + "</" + tag.xml.name + ">";
                        } else if (action === "emptyContent") {
                            tagInsert = "<" + tag.xml.name + requiredAttributes + "></" + tag.xml.name + ">";
                        }
                    } else {
                        tagInsert = "<" + tag.xml.name + requiredAttributes + ">";
                        for (let subTag in tag.xml.contains) {
                            tagInsert += $scope.functions.constructTag($filter('filter')($scope.transcriptArea.toolbar.tags, {id: subTag}, true)[0], tag.xml.contains[subTag], tag, null);
                        }
                        tagInsert += "</" + tag.xml.name + ">";
                    }
                }
                /* End: Tag construction management ----------------------------------------------------------------- */

                return tagInsert;
            };

            $scope.transcriptArea.ace.addTag = function(tagName, attributes) {
                if(attributes === "null") {attributes = null;}
                attributes = $scope.decodeAttributes(attributes);
                let tag = $filter('filter')($scope.transcriptArea.toolbar.tags, {id: tagName}, true)[0],
                    defaultAddChar = 2;

                let tagInsert = $scope.functions.constructTag(tag, "default", null, attributes),
                    lineNumber = $scope.aceEditor.getCursorPosition().row,
                    column = $scope.aceEditor.getCursorPosition().column + tag.xml.name.length + defaultAddChar;

                $scope.aceEditor.insert(tagInsert);
                $scope.aceEditor.getSelection().moveCursorTo(lineNumber, column);
                $scope.aceEditor.focus();
                $scope.updateTEIElementInformation("addTag");

                // If this is a level 1 tag, we split the line to indent the code
                let currentTagToolbar = $filter('filter')($scope.transcriptArea.toolbar.tags, {id: $scope.transcriptArea.ace.currentTag.name}, true)[0];
                if (currentTagToolbar !== undefined && currentTagToolbar.btn !== undefined && currentTagToolbar.btn.level === 1 && currentTagToolbar.xml.unique === false) {
                    $scope.aceEditor.splitLine();
                    $scope.aceEditor.getSelection().moveCursorTo(lineNumber + 1, 4);
                    $scope.aceEditor.focus();
                }
            };
            /* Tags Management ------------------------------------------------------------------------------------------ */

            /* ---------------------------------------------------------------------------------------------------------- */
            /* Attributes Management */
            /* ---------------------------------------------------------------------------------------------------------- */
            $scope.functions.updateAttributes = function () {
                $scope.transcriptArea.toolbar.attributes = [];

                if ($scope.transcriptArea.ace.currentTag !== null && $scope.teiInfo[$scope.transcriptArea.ace.currentTag.name] !== undefined && $scope.teiInfo[$scope.transcriptArea.ace.currentTag.name].attributes !== undefined) {
                    $scope.transcriptArea.toolbar.attributes = $scope.teiInfo[$scope.transcriptArea.ace.currentTag.name].attributes;

                    if ($scope.smartTEI === true) {
                        // This part computes if an attribute has been already used for a tag
                        for (let iAttr in $scope.transcriptArea.toolbar.attributes) {
                            $scope.transcriptArea.toolbar.attributes[iAttr].alreadyUsed = false;
                            for (let iAttribute in $scope.transcriptArea.ace.currentTag.attributes) {
                                if ($scope.transcriptArea.ace.currentTag.attributes[iAttribute].name === $scope.transcriptArea.toolbar.attributes[iAttr].id) {
                                    $scope.transcriptArea.toolbar.attributes[iAttr].alreadyUsed = true;
                                }
                            }
                        }
                    }

                }
            };

            $scope.functions.constructAttribute = function (attribute, value) {
                let attributeInsert = " " + attribute + "=\"\"";
                if (value !== null) {
                    attributeInsert = " " + attribute + "=\"" + value.value + "\"";
                } else if (attribute === "resp") {
                    attributeInsert = " " + attribute + "=\"" + $filter('userIDFromName')($rootScope.user.name) + "\"";
                }
                return attributeInsert;
            };

            $scope.transcriptArea.ace.addAttribute = function (attribute, value) {
                let alreadyHaveAttribute = false;
                for (let iAttribute in $scope.transcriptArea.ace.currentTag.attributes) {
                    if ($scope.transcriptArea.ace.currentTag.attributes[iAttribute].name === attribute.id) {
                        alreadyHaveAttribute = true;
                    }
                }

                if ((alreadyHaveAttribute === false && $scope.smartTEI === true) || $scope.smartTEI === false) {
                    let attributeInsert = $scope.functions.constructAttribute(attribute.id, value);
                    if (attribute.id === "ref") {
                        $scope.transcriptArea.interaction.taxonomy.action();
                    }

                    $scope.aceSession.insert({
                        row: $scope.transcriptArea.ace.currentTag.startTag.end.row,
                        column: $scope.transcriptArea.ace.currentTag.startTag.end.column - 1
                    }, attributeInsert);
                    $scope.aceEditor.focus();
                    $scope.updateTEIElementInformation("addAttribute");
                }
            };
            /* End : Attributes Management ------------------------------------------------------------------------------ */

            /* ---------------------------------------------------------------------------------------------------------- */
            /* Interaction Management */
            /* ---------------------------------------------------------------------------------------------------------- */
            $scope.transcriptArea.interaction.gotoLive = function () {
                $scope.transcriptArea.interaction.status = 'live';
                $scope.functions.resetVersionZone();
                $scope.functions.resetContentZone();
                $scope.functions.resetTaxonomySearchZone();
                $scope.functions.resetDocZone();
                $scope.functions.resetInfoZone();
            };

            $scope.functions.resetVersionZone = function () {
                $scope.transcriptArea.interaction.version.content = null;
                $scope.transcriptArea.interaction.version.id = null;
            };

            $scope.functions.resetContentZone = function () {
                $scope.transcriptArea.interaction.content.text = '<p class="text-center text-primary" style="margin-top: 20px;"><i class="fa fa-5x fa-spin fa-circle-o-notch"></i></p>';
            };

            $scope.functions.resetTaxonomySearchZone = function () {
                $scope.transcriptArea.interaction.taxonomy.dataType = null;
                $scope.transcriptArea.interaction.taxonomy.result = null;
                $scope.transcriptArea.interaction.taxonomy.string = null;
                $scope.transcriptArea.interaction.taxonomy.entities = null;
                $scope.transcriptArea.interaction.taxonomy.taxonomySelected = null;
            };

            $scope.functions.resetDocZone = function () {
                $scope.transcriptArea.interaction.doc.structure = null;
                $scope.transcriptArea.interaction.doc.title = null;
                $scope.transcriptArea.interaction.doc.element = null;
            };

            $scope.functions.resetInfoZone = function () {
                $scope.transcriptArea.interaction.info.structure = null;
                $scope.transcriptArea.interaction.info.title = null;
                $scope.transcriptArea.interaction.info.element = null;
            };

            /* Interaction Management ----------------------------------------------------------------------------------- */

            /* ---------------------------------------------------------------------------------------------------------- */
            /* Live management */
            /* ---------------------------------------------------------------------------------------------------------- */
            $scope.transcriptArea.interaction.live.microObjects.action = function () {
                if($scope.transcriptArea.interaction.live.microObjects.active === true) {
                    $scope.transcriptArea.interaction.live.microObjects.active = false;
                    $scope.transcriptArea.interaction.live.microObjects.activeClass = '';
                } else {
                    $scope.transcriptArea.interaction.live.microObjects.active = true;
                    $scope.transcriptArea.interaction.live.microObjects.activeClass = 'active bg-danger';
                }
                $scope.transcriptArea.interaction.live.encode();
            };
            /* Live Management ------------------------------------------------------------------------------------------ */

            /* ---------------------------------------------------------------------------------------------------------- */
            /* Complex Entry Management */
            /* ---------------------------------------------------------------------------------------------------------- */
            $scope.transcriptArea.interaction.complexEntry.computeFieldAnalyzed = function() {
                if($scope.transcriptArea.interaction.complexEntry.name === $scope.transcriptArea.ace.currentTag.name) {
                    $scope.transcriptArea.interaction.complexEntry.referenceTEIElement = $scope.transcriptArea.ace.currentTag;
                } else {
                    for(let iP in $scope.transcriptArea.ace.currentTag.parents.reverse()) {
                        if($scope.transcriptArea.ace.currentTag.parents[iP].name === $scope.transcriptArea.interaction.complexEntry.name) {
                            $scope.transcriptArea.interaction.complexEntry.referenceTEIElement = $scope.transcriptArea.ace.currentTag.parents[iP];
                            break;
                        }
                    }
                }
                //$log.debug($scope.transcriptArea.interaction.complexEntry.referenceTEIElement);
            };

            /**
             * This function loads documentation about a TEI element
             */
            $scope.transcriptArea.interaction.complexEntry.action = function () {
                for(let iA in $scope.transcriptArea.interaction.complexEntry.arrayListTags) {
                    if($scope.transcriptArea.interaction.complexEntry.arrayListTags[iA].list.indexOf($scope.transcriptArea.ace.currentTag.name) !== -1) {
                        $scope.transcriptArea.interaction.complexEntry.name = $scope.transcriptArea.interaction.complexEntry.arrayListTags[iA].element.xml.name;
                        $scope.transcriptArea.interaction.complexEntry.computeFieldAnalyzed();
                    }
                }
                $scope.transcriptArea.interaction.status = 'complexEntry';
            };
            /* Complex Entry Management --------------------------------------------------------------------------------- */

            /* ---------------------------------------------------------------------------------------------------------- */
            /* Documentation Management */
            /* ---------------------------------------------------------------------------------------------------------- */
            $scope.functions.defineDocumentation = function (element) {
                $scope.transcriptArea.interaction.doc.title = element;
                $scope.transcriptArea.interaction.doc.element = element;
                if ($scope.teiInfo[element] !== undefined && $scope.teiInfo[element].doc !== undefined) {
                    if ($scope.teiInfo[element].doc.gloss.length === 1) {
                        $scope.transcriptArea.interaction.doc.title = $scope.teiInfo[element].doc.gloss[0].content;
                    }

                    $scope.transcriptArea.interaction.doc.structure = $scope.teiInfo[element].doc;

                    if ($scope.transcriptArea.interaction.doc.structure.exemplum !== undefined) {
                        /*for (let idExample in $scope.transcriptArea.interaction.doc.structure.exemplum) {
                            $scope.transcriptArea.interaction.doc.structure.exemplum[idExample] = $scope.transcriptArea.interaction.doc.structure.exemplum[idExample].replace('<egXML xmlns="http://www.tei-c.org/ns/Examples">', '').replace('</egXML>', '').replace(/\s+/g, " ");
                        }*/
                    } else {
                        $scope.transcriptArea.interaction.doc.structure.exemplum = [];
                    }

                    if ($scope.transcriptArea.interaction.doc.structure.descriptions === undefined) {
                        $scope.transcriptArea.interaction.doc.structure.descriptions = [];
                    }
                }
            };

            /**
             * This function loads documentation about a TEI element
             */
            $scope.transcriptArea.interaction.doc.action = function (element) {
                $scope.functions.defineDocumentation(element);
                $scope.transcriptArea.interaction.status = 'doc';
            };
            /* Documentation Management --------------------------------------------------------------------------------- */

            /* ---------------------------------------------------------------------------------------------------------- */
            /* Information Management */
            /* ---------------------------------------------------------------------------------------------------------- */
            /**
             * This function loads information about a TEI element
             */
            $scope.transcriptArea.interaction.info.action = function (element) {
                $scope.transcriptArea.interaction.status = 'info';
            };
            /* Information Management ----------------------------------------------------------------------------------- */

            /* ---------------------------------------------------------------------------------------------------------- */
            /* Help Management */
            /* ---------------------------------------------------------------------------------------------------------- */
            // This function roots to the correct function to load help contents, according to the help content's type
            $scope.transcriptArea.interaction.help = function (element, context, resetBreadcrumb) {
                $scope.transcriptArea.interaction.content.title = null;
                $scope.transcriptArea.interaction.content.text = null;
                $scope.functions.resetContentZone();

                if (context === "helpContent") {
                    if (resetBreadcrumb === true) {
                        $scope.functions.resetContentZone();
                    }
                    $scope.functions.loadHelpData(element, resetBreadcrumb);
                    $scope.transcriptArea.interaction.status = 'content';
                } else if (context === "modelDoc") {
                    $scope.transcriptArea.interaction.doc.action(element);
                } else if (context === "modelInfo") {
                    $scope.transcriptArea.interaction.info.action(element);
                }
            };

            // This function loads a help content
            $scope.functions.loadHelpData = function (id, resetBreadcrumb) {
                if(id === true) {
                    // In case of true, the system asks for the ToC
                    return ContentService.getContents('helpContent', 'public', null, 'ASC', null, 'id,summary').then(function (contents) {
                        $scope.transcriptArea.interaction.content.title = "Guides de Testaments de Poilus";
                        if($rootScope.preferences.helpInsideHomeContent !== undefined && $rootScope.preferences.helpInsideHomeContent !== null) {
                            $scope.transcriptArea.interaction.content.text = $filter('internalLinksRender')($rootScope.preferences.helpInsideHomeContent).innerHTML;
                        }

                        if(contents.length > 0) {
                            $scope.transcriptArea.interaction.content.text += '<strong>Pages d\'aide</strong>';
                            $scope.transcriptArea.interaction.content.text += '<ul>';
                            for(let iC in contents) {
                                let content = contents[iC];
                                $scope.transcriptArea.interaction.content.text += '<li><a ng-click="transcriptArea.interaction.help('+content.id+', \'helpContent\', false)">'+content.title+'</a></li>';
                            }
                            $scope.transcriptArea.interaction.content.text += '</ul>';
                        }
                        $scope.functions.breadcrumbManagement({title: "Aide", id: true}, resetBreadcrumb);
                    });
                } else {
                    // Else, we ask for a specific content
                    return ContentService.getContent(id, 'id,content').then(function (content) {
                        $scope.transcriptArea.interaction.content.text = $filter('internalLinksRender')(content.content).innerHTML;
                        $scope.transcriptArea.interaction.content.title = content.title;
                        console.log($scope.transcriptArea.interaction.content.text);
                        $scope.functions.breadcrumbManagement(content, resetBreadcrumb);
                    });
                }
            };

            /**
             * Building breadcrumb for the interaction area
             * @param content
             * @param reset
             */
            $scope.functions.breadcrumbManagement = function (content, reset) {
                let elementToBreadcrumb = {
                    title: content.title,
                    id: content.id
                };

                if (reset === true) {
                    // If reset === true -> we clean the history
                    $scope.transcriptArea.interaction.content.history = [];
                } else {
                    // Else -> we keep the history and we remove the previous items from history which are no longer relevant
                    let toSplice = [];
                    for (let elementOfHistory of $scope.transcriptArea.interaction.content.history) {
                        if (elementOfHistory.id === elementToBreadcrumb.id) {
                            toSplice.push($scope.transcriptArea.interaction.content.history.indexOf(elementOfHistory));
                        } else {
                            for (let parent of elementOfHistory.parents) {
                                if (parent === elementToBreadcrumb.id) {
                                    toSplice.push($scope.transcriptArea.interaction.content.history.indexOf(elementOfHistory));
                                }
                            }
                        }
                    }
                    for (let id of toSplice.sort(function (a, b) {
                        return b - a
                    })) {
                        $scope.transcriptArea.interaction.content.history.splice(id, 1);
                    }
                }

                /* -- Building parents of current item -- */
                let parents = [];
                for (let elementOfHistory of $scope.transcriptArea.interaction.content.history) {
                    parents.push(elementOfHistory.id);
                }
                elementToBreadcrumb.parents = parents;

                $scope.transcriptArea.interaction.content.history.push(elementToBreadcrumb);
            };
            /* Help Management ------------------------------------------------------------------------------------------ */

            /* ---------------------------------------------------------------------------------------------------------- */
            /* Versions Management */
            /* ---------------------------------------------------------------------------------------------------------- */
            $scope.transcriptArea.interaction.version.action = function (id) {
                $scope.transcriptArea.interaction.version.id = id;
                $scope.transcriptArea.interaction.status = 'version';

                for (let versionId in $scope.transcript._embedded.versions) {
                    let version = $scope.transcript._embedded.versions[versionId];
                    if (version.id === id) {
                        $scope.transcriptArea.interaction.version.content = version.data.content;
                    }
                }
            };
            /* Versions Management -------------------------------------------------------------------------------------- */

            /* ---------------------------------------------------------------------------------------------------------- */
            /* Historical Notes Management */
            /* ---------------------------------------------------------------------------------------------------------- */
            /*$scope.transcriptArea.interaction.historicalNotes.loadElements = function() {
                return NoteService.getNotesByTranscript($scope.transcript.id).then(function(response) {
                    $scope.transcriptArea.interaction.historicalNotes.elements = response;
                });
            };

            $scope.transcriptArea.interaction.historicalNotes.action = function () {
                if($scope.transcriptArea.interaction.historicalNotes.elements === null) {
                    $scope.transcriptArea.interaction.historicalNotes.loadElements();
                }
                $scope.transcriptArea.interaction.status = 'historicalNotes';
            };

            $scope.transcriptArea.interaction.historicalNotes.addForm.action = function (id) {
                // If an id is defined > this is an edition of existent element
                $scope.transcriptArea.interaction.historicalNotes.addForm.id = null;
                if (id !== undefined && id !== null) {
                    let elementToEdit = $scope.transcriptArea.interaction.historicalNotes.elements.filter(function (element) {
                        return (element.id === id);
                    });
                    if (elementToEdit !== null) {
                        elementToEdit = elementToEdit[0];
                    }

                    $scope.transcriptArea.interaction.historicalNotes.addForm.form.id = id;
                    $scope.transcriptArea.interaction.historicalNotes.addForm.form.content = elementToEdit.content;
                }
                $scope.transcriptArea.interaction.status = 'historicalNotesForm';
            };

            // This methods posts a new note
            $scope.transcriptArea.interaction.historicalNotes.addForm.submit.action = function (method, id) {
                $scope.transcriptArea.interaction.historicalNotes.addForm.submit.loading = true;
                let elementToEdit = $scope.transcriptArea.interaction.historicalNotes.elements.filter(function (element) {
                    return (element.id === id);
                });
                if (elementToEdit !== null) {
                    elementToEdit = elementToEdit[0];
                }

                let noteData = $scope.transcriptArea.interaction.historicalNotes.addForm.form;
                if (method === 'post') {
                    noteData.transcript = $scope.transcript.id;
                    noteData.updateComment = 'Création de la note';

                    return NoteService.postNote(noteData)
                        .then(function (response) {
                            return NoteService.getNotesByTranscript($scope.transcript.id).then(function (data) {
                                $scope.transcriptArea.interaction.historicalNotes.elements = data;
                                $scope.transcriptArea.interaction.historicalNotes.addForm.submit.loading = false;
                                $scope.transcriptArea.interaction.status = 'historicalNotes';
                            });
                        });
                } else if (method === 'patch') {
                    let idToPatch = noteData.id;
                    delete noteData._links;
                    delete noteData.createDate;
                    delete noteData.createUser;
                    delete noteData.id;
                    delete noteData.updateDate;
                    delete noteData.updateUser;
                    noteData.updateComment = "Updating note";

                    return NoteService.patchNote(idToPatch, noteData)
                        .then(function (response) {
                            return NoteService.getNotesByTranscript($scope.transcript.id).then(function (data) {
                                $scope.transcriptArea.interaction.historicalNotes.elements = data;
                                $scope.transcriptArea.interaction.historicalNotes.addForm.submit.loading = false;
                                $scope.transcriptArea.interaction.status = 'historicalNotes';
                            });
                        });
                }
            };

            $scope.transcriptArea.interaction.historicalNotes.quote = function(id) {
                if($scope.transcriptArea.ace.currentTag.name === "ref") {
                    $scope.transcriptArea.ace.addAttribute({id:"xml:id"}, {value:"note-"+id});
                } else if($scope.transcriptArea.ace.currentTag.name !== "ref" && $scope.transcriptArea.toolbar.tags["ref"].btn.enabled === true) {
                    $scope.transcriptArea.ace.addTag("ref", [{id:"xml:id", value:{value:"note-"+id}}]);
                }
            };*/
            /* Historical notes Management ------------------------------------------------------------------------------ */

            /* ---------------------------------------------------------------------------------------------------------- */
            /* Taxonomy Search Management */
            /* ---------------------------------------------------------------------------------------------------------- */
            $scope.transcriptArea.interaction.taxonomy.loadEntities = function() {
                TaxonomyService.getTaxonomyEntities("testators", "index").then(function(response) {
                    $scope.taxonomy.testators = response;

                    for(let iT in $scope.taxonomy.testators) {
                        $scope.taxonomy.testators[iT]['name'] = $scope.taxonomy.testators[iT]['indexName'];
                    }
                });
                TaxonomyService.getTaxonomyEntities("places", "index").then(function(response) {
                    $scope.taxonomy.places = response;

                    for(let iT in $scope.taxonomy.places) {
                        $scope.taxonomy.places[iT]['name'] = $scope.taxonomy.places[iT]['indexName'];
                    }
                });
                TaxonomyService.getTaxonomyEntities("military-units", "index").then(function(response) {
                    $scope.taxonomy.militaryUnits = response;
                });
            };

            $scope.transcriptArea.interaction.taxonomy.action = function () {
                if($scope.taxonomy.testators === null || $scope.taxonomy.places === null || $scope.taxonomy.militaryUnits === null) {
                    $scope.transcriptArea.interaction.taxonomy.loadEntities();
                }
                $scope.functions.resetTaxonomySearchZone();
                $scope.transcriptArea.interaction.status = 'taxonomySearch';

                $scope.$watch('transcriptArea.interaction.taxonomy.taxonomySelected', function () {
                    $scope.transcriptArea.interaction.taxonomy.string = null;
                    switch ($scope.transcriptArea.interaction.taxonomy.taxonomySelected) {
                        case "testators":
                            $log.debug("testators");
                            $scope.transcriptArea.interaction.taxonomy.entities = $scope.taxonomy.testators;
                            $scope.transcriptArea.interaction.taxonomy.values = SearchService.dataset($scope.taxonomy.testators, "name", "string");
                            $scope.transcriptArea.interaction.taxonomy.dataType = "testators";
                            break;
                        case "places":
                            $log.debug("places");
                            $scope.transcriptArea.interaction.taxonomy.entities = $scope.taxonomy.places;
                            $scope.transcriptArea.interaction.taxonomy.values = SearchService.dataset($scope.taxonomy.places, "name", "string");
                            $scope.transcriptArea.interaction.taxonomy.dataType = "places";
                            break;
                        case "militaryUnits":
                            $log.debug("militaryUnits");
                            $scope.transcriptArea.interaction.taxonomy.entities = $scope.taxonomy.militaryUnits;
                            $scope.transcriptArea.interaction.taxonomy.values = SearchService.dataset($scope.taxonomy.militaryUnits, "name", "string");
                            $scope.transcriptArea.interaction.taxonomy.dataType = "military-units";
                            break;
                        default:
                            $log.debug("default");
                    }
                });
                $scope.$watch('transcriptArea.interaction.taxonomy.string', function () {
                    if ($scope.transcriptArea.interaction.taxonomy.string !== undefined) {
                        if ($scope.transcriptArea.interaction.taxonomy.string !== null && $scope.transcriptArea.interaction.taxonomy.string !== "" && $scope.transcriptArea.interaction.taxonomy.string.originalObject !== undefined) {
                            $scope.transcriptArea.interaction.taxonomy.string = $scope.transcriptArea.interaction.taxonomy.string.originalObject.value;
                            $log.debug($scope.transcriptArea.interaction.taxonomy.string);
                        }
                        $scope.functions.refresh();
                    }
                });

                $scope.functions.refresh = function () {
                    let toEntities = $scope.transcriptArea.interaction.taxonomy.entities;
                    let toForm = {name: $scope.transcriptArea.interaction.taxonomy.string};
                    $scope.transcriptArea.interaction.taxonomy.result = SearchService.search(toEntities, toForm);
                };
            };
            /* Taxonomy Search Management ------------------------------------------------------------------------------- */

            /* ---------------------------------------------------------------------------------------------------------- */
            /* Alert Zone Management */
            /* ---------------------------------------------------------------------------------------------------------- */
            /*$scope.$watch('transcriptArea.interaction.alertZone.alerts', function () {
                $log.debug($scope.transcriptArea.interaction.alertZone.alerts);
            });

            $scope.functions.updateAlerts = function () {
                for (let kLine in $scope.transcriptArea.ace.lines) {
                    kLine = parseInt(kLine);
                    let line = $scope.transcriptArea.ace.lines[kLine];
                    if (line.length > 250) {
                        $scope.transcriptArea.interaction.alertZone.alerts.push({content: $sce.trustAsHtml("La ligne " + (kLine + 1) + " semble longue. N'auriez-vous pas oublié un saut de ligne ?")});
                    }
                }
            };*/
            /* Alert Zone Management ------------------------------------------------------------------------------------ */

            /* ---------------------------------------------------------------------------------------------------------- */
            /* Viewer Management */
            /* ---------------------------------------------------------------------------------------------------------- */
            let imageSource = [];
            if($scope.transcriptConfig.isExercise === false) {
                imageSource.push($rootScope.iiif.server + "/testament_" + $scope.entity.will.hostingOrganization.code + "_" + $filter('willNumberFormat')($scope.entity.willNumber, 4) + $rootScope.iiif.separator + "JPEG" + $rootScope.iiif.separator + $scope.resource.images[0] + $rootScope.iiif.extension + ".jpg");
            } else {
                imageSource.push($rootScope.iiif.server + "/exercise" + $rootScope.iiif.separator + $scope.transcriptConfig.exerciseImageToTranscribe);
            }

            $scope.openseadragon = {
                prefixUrl: "/webapp/app/web/libraries/js/openseadragon/images/",
                tileSources: imageSource,
                showRotationControl: true
            };
            /* Viewer Management ---------------------------------------------------------------------------------------- */

            /* ---------------------------------------------------------------------------------------------------------- */
            /* Validation status */
            /* ---------------------------------------------------------------------------------------------------------- */
            $scope.$watchGroup(["transcriptArea.ace.area", "submit.form.isEnded", "submit.form.comment"], function(newValues, oldValues){
                if(!(!!$scope.transcriptArea.ace.area)) {
                    $scope.submit.state.alert = "alert-danger";
                    $scope.submit.state.btnClass = "btn-danger disabled";
                    $scope.submit.state.message = "Votre transcription est vide";
                } else if($scope.submit.form.isEnded === true && !!$scope.transcriptArea.ace.area) {
                    if(!(!!$scope.submit.form.comment)) {
                        $scope.submit.state.btnClass = "btn-warning";
                        $scope.submit.state.alert = "alert-warning";
                        $scope.submit.state.message = "Pensez à décrire votre contribution avant de la soumettre";
                    } else {
                        $scope.submit.state.btnClass = "btn-primary";
                        $scope.submit.state.alert = "alert-primary";
                        $scope.submit.state.message = "Pour soumettre à validation votre transcription, cliquez sur le bouton ci-dessous";
                    }
                    $scope.submit.state.btnValue = "soumettre";
                } else {
                    if(!(!!$scope.submit.form.comment)) {
                        $scope.submit.state.btnClass = "btn-warning";
                        $scope.submit.state.alert = "alert-warning";
                        $scope.submit.state.message = "Pensez à décrire votre contribution avant de la sauvegarder";
                    } else {
                        $scope.submit.state.btnClass = "btn-success";
                        $scope.submit.state.alert = "alert-success";
                        $scope.submit.state.message = "Pour sauvegarder votre travail, cliquez sur le bouton ci-dessous";
                    }
                    $scope.submit.state.btnValue = "sauvegarder";
                }
            });
            /* Validation status ---------------------------------------------------------------------------------------- */

            /* ---------------------------------------------------------------------------------------------------------- */
            /* Submit Management */
            /* ---------------------------------------------------------------------------------------------------------- */
            $scope.submit.action = function (action) {
                if ($scope.transcript.status === "todo" && $scope.transcriptArea.ace.area !== "") {
                    // Updating status value in case of first edition
                    $scope.transcript.status = "transcription";
                }

                if ($scope.transcript.content !== $scope.transcriptArea.ace.area || ($scope.submit.form.isEnded === true && !!$scope.transcriptArea.ace.area)) {
                    $scope.submit.loading = true;
                    //console.log($scope.aceEditor);
                    //$scope.aceEditor.setReadonly = true;
                    if ($scope.submit.form.isEnded === true) {
                        $scope.transcript.status = "validation";
                        console.log($rootScope.user.id);
                        $scope.submit.form.submitUser = $rootScope.user.id;
                    }
                    $http.patch($rootScope.api + '/transcripts/' + $scope.transcript.id + '?profile=id,pageTranscript,versioning',
                        {
                            "content": $scope.transcriptArea.ace.area,
                            "updateComment": $scope.submit.form.comment,
                            "status": $scope.transcript.status,
                            "continueBefore": $scope.submit.form.continueBefore,
                            "continueAfter": $scope.submit.form.continueAfter,
                            "submitUser": $scope.submit.form.submitUser
                        }
                    ).then(function (response) {
                        $log.debug(response.data);
                        $scope.transcript = response.data;
                        $scope.transcriptArea.ace.area = $scope.transcript.content;
                        $scope.submit.loading = false;
                        $scope.submit.form.isEnded = false;
                        $scope.submit.form.comment = "";
                        //$scope.aceEditor.setReadonly = false;

                        if (action === 'load-read' || $scope.transcript.status === "validation") {
                            $('#transcript-edit-modal').modal('hide');
                            $state.go('transcript.app.edition', {
                                idEntity: $scope.entity.id,
                                idResource: $scope.resource.id
                            });
                        } else {
                            $scope.submit.success = true;
                            $timeout(function () {
                                $scope.submit.success = false;
                            }, 3000);
                        }
                    });
                } else {
                    alert('Impossible de sauvegarder : aucune nouvelle modification.');
                }
            };

            /**
             * Go back management
             */
            $scope.submit.goBack = function () {
                $('#transcript-edit-modal').modal('hide');
                if (($scope.transcript.content === null && $scope.transcriptArea.ace.area === null) || $scope.transcript.content === $scope.transcriptArea.ace.area) {
                    $state.go('transcript.app.edition', {idEntity: $scope.entity.id, idResource: $scope.resource.id});
                } else {
                    $scope.transcriptArea.ace.modal.action('goBack');
                }
            };

            /**
             * Safe go back management
             */
            $scope.submit.safeGoBack = function () {
                $('#transcript-edit-modal').modal('hide');
                $scope.transcriptArea.ace.area = $scope.transcript.content;
                $state.go('transcript.app.edition', {idEntity: $scope.entity.id, idResource: $scope.resource.id});
            };

            /**
             * Change page alert management & transcript log management
             */
            $transitions.onBefore({}, (trans) => {
                if ((($scope.transcript.content === null || $scope.transcript.content === '') && ($scope.transcriptArea.ace.area === null || $scope.transcriptArea.ace.area === '')) || $scope.transcript.content === $scope.transcriptArea.ace.area || $scope.transcriptConfig.isExercise === true) {
                    if ($scope.transcriptConfig.isExercise === false) {
                        console.log('get through onBefore');
                        TranscriptLogService.patchTranscriptLog({isCurrentlyEdited: false}, $scope.currentLog.id);
                    }
                } else {
                    $log.debug('ask for leave');
                    $window.history.back();
                    $('#transcript-edit-modal').modal('show');
                    return false;
                }
            });
            /* Submit Management ---------------------------------------------------------------------------------------- */

            /* ---------------------------------------------------------------------------------------------------------- */
            /* Admin Management */
            /* ---------------------------------------------------------------------------------------------------------- */
            $scope.admin.status.action = function (state) {
                $scope.admin.status.loading = true;

                return TranscriptService.patchTranscript({
                    status: state,
                    updateComment: "Changement de statut pour : " + state
                }, $scope.transcript.id, "id,pageTranscript,versioning").then(function (data) {
                    $scope.transcript.status = state;
                    $scope.admin.status.loading = false;
                });
            };

            /**
             * Validation accept management
             */
            $scope.admin.validation.accept.action = function () {
                $scope.admin.validation.accept.loading = true;
                $scope.transcript.content = $scope.transcriptArea.ace.area;
                return TranscriptService.patchTranscript(
                    {
                        "content": $scope.transcriptArea.ace.area,
                        "updateComment": "Validation de la transcription",
                        "status": "validated",
                        "validationText": $scope.admin.validation.content,
                        "sendNotification": true
                    }, $scope.transcript.id, "id,pageTranscript,versioning"
                ).then(function (response) {
                    $log.debug(response);
                    $scope.transcript.status = "validated";
                    $scope.admin.validation.accept.loading = false;
                    $state.go('transcript.app.edition', {idEntity: $scope.entity.id, idResource: $scope.resource.id});
                });
            };

            /**
             * Validation refuse management
             */
            $scope.admin.validation.refuse.action = function () {
                $scope.admin.validation.refuse.loading = true;
                return TranscriptService.patchTranscript(
                    {
                        "content": $scope.transcriptArea.ace.area,
                        "updateComment": "Validation refusée: transcription rouverte à contribution",
                        "status": "transcription",
                        "validationText": $scope.admin.validation.content,
                        "sendNotification": true
                    }, $scope.transcript.id, "id,pageTranscript,versioning",
                ).then(function (response) {
                    $log.debug(response);
                    $scope.transcript.status = "transcription";
                    $scope.admin.validation.refuse.loading = false;
                    $state.go('transcript.app.edition', {idEntity: $scope.entity.id, idResource: $scope.resource.id});
                });
            };

            $scope.options = {
                language: 'fr',
                allowedContent: true,
                entities: false,
                height: '140px',
                removePlugins: 'elementspath',
                resize_enabled: false,
                toolbar: [
                    ['Bold','Italic','Underline','StrikeThrough','-','JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock','-','NumberedList','BulletedList','-','Link','-','Undo','Redo']
                ]
            };
            /* Admin Management ----------------------------------------------------------------------------------------- */

            /* ---------------------------------------------------------------------------------------------------------- */
            /* Full screen Management */
            /* ---------------------------------------------------------------------------------------------------------- */
            $scope.isFullscreen = false;
            $scope.toggleFullScreen = function() {
                $scope.isFullscreen = !$scope.isFullscreen;
            };
            /* Full screen Management ----------------------------------------------------------------------------------- */

            /* ---------------------------------------------------------------------------------------------------------- */
            /* Documentation Management */
            /* ---------------------------------------------------------------------------------------------------------- */
            $scope.transcriptArea.interaction.documentation.loadDocumentation = function () {
                if($scope.transcriptArea.ace.currentTag !== null) {
                    $scope.transcriptArea.interaction.help($scope.transcriptArea.ace.currentTag.name, "modelDoc", true);
                    $("#transcript-edit-editor-ace-area-rmenu").hide(100);
                }
            };

            $scope.transcriptArea.interaction.documentation.loadInformation = function () {
                if($scope.transcriptArea.ace.currentTag !== null) {
                    $scope.transcriptArea.interaction.help($scope.transcriptArea.ace.currentTag, "modelInfo", true);
                    $("#transcript-edit-editor-ace-area-rmenu").hide(100);
                }
            };
            /* Right menu Management ------------------------------------------------------------------------------------ */
        }
    }])
;