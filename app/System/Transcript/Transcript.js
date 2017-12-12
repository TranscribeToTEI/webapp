'use strict';

angular.module('transcript.system.transcript', ['ui.router'])

    .controller('SystemTranscriptCtrl', ['$log', '$rootScope','$scope', '$http', '$sce', '$state', '$timeout', '$filter', '$transitions', '$window', 'TranscriptService', 'TranscriptLogService', 'ContentService', 'SearchService', 'BibliographyService', 'NoteService', 'TaxonomyService', 'transcript', 'entity', 'resource', 'teiInfo', 'config', function($log, $rootScope, $scope, $http, $sce, $state, $timeout, $filter, $transitions, $window, TranscriptService, TranscriptLogService, ContentService, SearchService, BibliographyService, NoteService, TaxonomyService, transcript, entity, resource, teiInfo, config) {
        if($rootScope.user === undefined) {$state.go('transcript.app.security.login');}
        else if(transcript._embedded.isCurrentlyEdited === true && $filter('filter')(transcript._embedded.logs, {isCurrentlyEdited: true})[0].createUser.id !== $rootScope.user.id) {
            $log.log('Redirection to edition -> Already in edition');
            $state.go('transcript.app.edition', {'idEntity': entity.id, 'idResource': resource.id});
        } else {
            /* ---------------------------------------------------------------------------------------------------------- */
            /* $scope & variables */
            /* ---------------------------------------------------------------------------------------------------------- */
            $scope.transcript = transcript; $log.log(transcript);
            $scope.resource = resource;
            $scope.entity = entity;
            $scope.teiInfo = teiInfo.data; $log.log($scope.teiInfo);
            $scope.config = config;
            $scope.taxonomy = {
                testators: null,
                places: null,
                militaryUnits: null
            };
            $scope.functions = {};
            $scope.smartTEI = $rootScope.user._embedded.preferences.smartTEI;
            $scope.complexEntry = $rootScope.user._embedded.preferences.showComplexEntry;

            $scope.page = {
                fullscreen: {
                    status: false
                }
            };
            $scope.transcriptArea = {
                interaction: {
                    status: "live",
                    live: {
                        content: "",
                        microObjects: {
                            active: true,
                            activeClass: 'active bg-danger'
                        }
                    },
                    content: {
                        title: "",
                        text: "",
                        history: []
                    },
                    doc: {
                        title: null,
                        element: null,
                        structure: null
                    },
                    info: {
                        title: null,
                        element: null,
                        structure: null
                    },
                    bibliography: {
                        elements: null,
                        addForm: {
                            submit: {
                                loading: false
                            },
                            type: null,
                            printedReference: {
                                authors: null,
                                referenceTitle: null,
                                containerTitle: null,
                                containerType: null,
                                url: null,
                                otherInformation: null
                            },
                            manuscriptReference: {
                                documentName: null,
                                institutionName: null,
                                collectionName: null,
                                documentNumber: null,
                                url: null
                            }
                        }
                    },
                    historicalNotes: {
                        elements: null,
                        addForm: {
                            submit: {
                                loading: false
                            },
                            form: {
                                content: null
                            }
                        }
                    },
                    taxonomy: {
                        result: null,
                        dataType: null,
                        entities: null,
                        string: null,
                        taxonomySelected: null
                    },
                    version: {
                        id: null,
                        content: null
                    },
                    complexEntry: {
                        available: false,
                        name: null,
                        arrayListTags: [],
                        extendAvailabilityList: [],
                        referenceTEIElement: null
                    },
                    alertZone: {
                        show: true,
                        alerts: []
                    }
                },
                ace: {
                    currentTag: null,
                    area: $scope.transcript.content,
                    lines: [],
                    modal: {
                        content: "",
                        variables: {}
                    },
                    rightMenu: {}
                },
                toolbar: {
                    tags: $scope.config.tags,
                    groups: $scope.config.groups,
                    level2: [],
                    mouseOverLvl1: null,
                    mouseOverLvl2: null,
                    mouseOverLvl3: null,
                    attributes: []
                }
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
                    isEncoded: "a4"
                },
                state: {
                    icon: "fa-thumbs-o-up",
                    bg: "bg-success",
                    btn: "btn-success"
                }
            };
            $scope.admin = {
                status: {
                    loading: false
                },
                validation: {
                    accept: {
                        loading: false
                    },
                    refuse: {
                        loading: false
                    }
                }
            };
            $scope.role = TranscriptService.getTranscriptRights($rootScope.user);

            if ($scope.transcript.content === null) {
                $scope.transcriptArea.ace.area = "";
            }

            $scope.submit.form.continueBefore = $scope.transcript.continueBefore;
            $scope.submit.form.continueAfter = $scope.transcript.continueAfter;
            $scope.TranscriptService = TranscriptService;
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
                if ($scope.transcriptArea.toolbar.tags[iT].order !== undefined && $scope.transcriptArea.toolbar.tags[iT].order !== false) {
                    $scope.transcriptArea.toolbar.tags[iT].lType = "btn";
                    $scope.transcriptArea.toolbar.level2.push($scope.transcriptArea.toolbar.tags[iT]);
                }
            }
            $log.log($scope.transcriptArea.toolbar.level2);
            /* Computing Level2 ----------------------------------------------------------------------------------------- */

            /* ---------------------------------------------------------------------------------------------------------- */
            /* Updating Transcript Log */
            /* ---------------------------------------------------------------------------------------------------------- */
            if ($scope.transcript._embedded.isCurrentlyEdited === false) {
                $log.log('creation of transcript log -> Transcript is now closed');
                TranscriptLogService.postTranscriptLog({
                    'isCurrentlyEdited': true,
                    'transcript': $scope.transcript.id
                }).then(function (data) {
                    $log.log(data);
                    $scope.currentLog = data;
                });
            } else {
                $scope.currentLog = $filter('filter')($scope.transcript._embedded.logs, {isCurrentlyEdited: true})[0];
            }
            /* End: Updating Transcript Log ----------------------------------------------------------------------------- */

            /* ---------------------------------------------------------------------------------------------------------- */
            /* Toolbar */
            /* ---------------------------------------------------------------------------------------------------------- */
            $scope.functions.updateToolbar = function () {
                // Reset every enabled buttons
                for (let btn in $scope.transcriptArea.toolbar.tags) {
                    $scope.transcriptArea.toolbar.tags[btn].btn.enabled = false;
                }

                if ($scope.transcriptArea.ace.currentTag === null) {
                    // If the caret is at the root of the doc, we allow root items == true
                    for (let btn in $scope.transcriptArea.toolbar.tags) {
                        if ($scope.transcriptArea.toolbar.tags[btn].btn.allow_root === true && $scope.transcriptArea.toolbar.tags[btn].btn.level === 1) {
                            $scope.transcriptArea.toolbar.tags[btn].btn.enabled = true;
                        }
                    }
                } else {
                    // Else, we allow items according to the parent tag
                    if ($scope.teiInfo[$scope.transcriptArea.ace.currentTag.name] !== undefined && $scope.teiInfo[$scope.transcriptArea.ace.currentTag.name].content !== undefined) {
                        for (let elemId in $scope.teiInfo[$scope.transcriptArea.ace.currentTag.name].content) {
                            let elem = $scope.teiInfo[$scope.transcriptArea.ace.currentTag.name].content[elemId];
                            //$log.log(elem);
                            if ($scope.transcriptArea.toolbar.tags[elem] !== undefined &&
                                $scope.transcriptArea.toolbar.tags[elem].xml.name === elem) {
                                $scope.transcriptArea.toolbar.tags[elem].btn.enabled = true;
                            }
                        }
                    }
                }
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
                    name: 'enter',
                    bindKey: {win: 'Enter', mac: 'Enter'},
                    exec: function (editor) {
                        let line = $scope.aceEditor.getCursorPosition().row,
                            column = $scope.aceEditor.getCursorPosition().column;

                        /* replicateOnCtrlEnter Management :
                         * Conditions: if the tag has replicateOnCtrlEnter: true in the config, and the tag is empty and smartTEI is available
                         * Result: remove the tag and jump to the end of the parent tag
                         */
                        if ($scope.transcriptArea.toolbar.tags[$scope.transcriptArea.ace.currentTag.name].xml.replicateOnCtrlEnter === true && /^\s*$/.test($scope.transcriptArea.ace.currentTag.content) && $scope.smartTEI === true) {
                            $scope.aceSession.getDocument().remove(new AceRange($scope.transcriptArea.ace.currentTag.startTag.start.row, $scope.transcriptArea.ace.currentTag.startTag.start.column - 1, $scope.transcriptArea.ace.currentTag.endTag.end.row, $scope.transcriptArea.ace.currentTag.endTag.end.column + 1));
                            $scope.$apply(function () {
                                $scope.transcriptArea.ace.currentTag = TranscriptService.getTEIElementInformation($scope.functions.getLeftOfCursor(), $scope.functions.getRightOfCursor(), $scope.aceSession.getLines(0, $scope.aceSession.getLength() - 1), $scope.transcriptArea.toolbar.tags, $scope.teiInfo, true);
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
                            $scope.transcriptArea.ace.currentTag = TranscriptService.getTEIElementInformation($scope.functions.getLeftOfCursor(), $scope.functions.getRightOfCursor(), $scope.aceSession.getLines(0, $scope.aceSession.getLength() - 1), $scope.transcriptArea.toolbar.tags, $scope.teiInfo, true);
                        });
                    }
                });
                $scope.aceEditor.commands.addCommand({
                    name: 'ctrlEnter',
                    bindKey: {win: 'Ctrl-Enter', mac: 'Command-Enter'},
                    exec: function (editor) {
                        $scope.$apply(function () {
                            /* Computing of current tag value */
                            $scope.transcriptArea.ace.currentTag = TranscriptService.getTEIElementInformation($scope.functions.getLeftOfCursor(), $scope.functions.getRightOfCursor(), $scope.aceSession.getLines(0, $scope.aceSession.getLength() - 1), $scope.transcriptArea.toolbar.tags, $scope.teiInfo, true);
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
                                "\n" + $scope.functions.constructTag($scope.transcriptArea.toolbar.tags[$scope.transcriptArea.ace.currentTag.name], "default")
                            );
                            $scope.aceEditor.getSelection().moveCursorTo(row + 1, 2 + $scope.transcriptArea.ace.currentTag.name.length);
                            $scope.aceEditor.focus();
                            $scope.$apply(function () {
                                /* Computing of current tag value */
                                $scope.transcriptArea.ace.currentTag = TranscriptService.getTEIElementInformation($scope.functions.getLeftOfCursor(), $scope.functions.getRightOfCursor(), $scope.aceSession.getLines(0, $scope.aceSession.getLength() - 1), $scope.transcriptArea.toolbar.tags, $scope.teiInfo, true);
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
                            $scope.transcriptArea.ace.currentTag = TranscriptService.getTEIElementInformation($scope.functions.getLeftOfCursor(), $scope.functions.getRightOfCursor(), $scope.aceSession.getLines(0, $scope.aceSession.getLength() - 1), $scope.transcriptArea.toolbar.tags, $scope.teiInfo, true);
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
                            $scope.transcriptArea.ace.currentTag = TranscriptService.getTEIElementInformation($scope.functions.getLeftOfCursor(), $scope.functions.getRightOfCursor(), $scope.aceSession.getLines(0, $scope.aceSession.getLength() - 1), $scope.transcriptArea.toolbar.tags, $scope.teiInfo, true);
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
                            $scope.transcriptArea.ace.currentTag = TranscriptService.getTEIElementInformation($scope.functions.getLeftOfCursor(), $scope.functions.getRightOfCursor(), $scope.aceSession.getLines(0, $scope.aceSession.getLength() - 1), $scope.transcriptArea.toolbar.tags, $scope.teiInfo, true);
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
                            $scope.transcriptArea.ace.currentTag = TranscriptService.getTEIElementInformation($scope.functions.getLeftOfCursor(), $scope.functions.getRightOfCursor(), $scope.aceSession.getLines(0, $scope.aceSession.getLength() - 1), $scope.transcriptArea.toolbar.tags, $scope.teiInfo, true);
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

                    // -- Right click management:
                    // If the clicked element is not the menu
                    if (!$(e.target).parents("#transcript-edit-editor-ace-area-rmenu").length > 0) {
                        // Hide it
                        $("#transcript-edit-editor-ace-area-rmenu").hide(100);
                    }

                    $scope.$apply(function () {
                        /* Computing of current tag value */
                        $scope.transcriptArea.ace.currentTag = TranscriptService.getTEIElementInformation($scope.functions.getLeftOfCursor(), $scope.functions.getRightOfCursor(), $scope.aceSession.getLines(0, $scope.aceSession.getLength() - 1), $scope.transcriptArea.toolbar.tags, $scope.teiInfo, true);
                    });
                    return false;
                }, false);
                $scope.aceEditor.container.addEventListener("contextmenu", function (e) {
                    e.preventDefault();

                    // -- Right click management:
                    $("#transcript-edit-editor-ace-area-rmenu").finish().toggle(100).css({
                        top: e.pageY + "px",
                        left: e.pageX + "px"
                    });

                }, false);
                /* Click events ----------------------------------------------------------------------------------------- */
            };

            $scope.aceChanged = function () {
                /* *Refresh toolbar content:*
                 * Conditions: if currentTag value changes
                 * Result: Reload the toolbar content
                 */
                let AceRange = $scope.aceEditor.getSelectionRange().constructor; //Doc -> https://stackoverflow.com/questions/28893954/how-to-get-range-when-using-angular-ui-ace#28894262

                $scope.$watch('transcriptArea.ace.currentTag', function () {
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
                });

                /**
                 * This function watches the transcription (ace area), encodes it and displays it in the live
                 */
                $scope.$watch('transcriptArea.ace.area', function () {
                    $scope.transcriptArea.interaction.live.encode();
                    $scope.transcriptArea.ace.currentTag = TranscriptService.getTEIElementInformation($scope.functions.getLeftOfCursor(), $scope.functions.getRightOfCursor(), $scope.aceSession.getLines(0, $scope.aceSession.getLength() - 1), $scope.transcriptArea.toolbar.tags, $scope.teiInfo, true);
                    $scope.transcriptArea.ace.lines = $scope.aceSession.getLines(0, $scope.aceSession.getLength() - 1);
                    $scope.functions.updateAlerts();
                });
            };

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
                $scope.transcriptArea.ace.currentTag = TranscriptService.getTEIElementInformation($scope.functions.getLeftOfCursor(), $scope.functions.getRightOfCursor(), $scope.aceSession.getLines(0, $scope.aceSession.getLength() - 1), $scope.transcriptArea.toolbar.tags, $scope.teiInfo, true);
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
            $scope.functions.constructTag = function (tag, action, parent, attributes) {
                let tagInsert = "",
                    requiredAttributes = "";

                /* Required attributes management ------------------------------------------------------------------- */
                for (let iAttribute in $scope.teiInfo[tag.btn.id].attributes) {
                    let attribute = $scope.teiInfo[tag.btn.id].attributes[iAttribute];
                    if (attribute.usage === "req") {
                        requiredAttributes += $scope.functions.constructAttribute(attribute.id, null);
                    }
                }

                if(attributes !== null) {
                    $log.log(attributes);
                    for(let iAttribute in attributes) {
                        $log.log(attributes[iAttribute]);
                        requiredAttributes += $scope.functions.constructAttribute(attributes[iAttribute].id, attributes[iAttribute].value);
                    }
                }

                //Special cases:
                if (tag.btn.id === "note" && parent !== undefined && parent.btn.id === "app") {
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
                            tagInsert += $scope.functions.constructTag($scope.transcriptArea.toolbar.tags[subTag], tag.xml.contains[subTag], tag);
                        }
                        tagInsert += "</" + tag.xml.name + ">";
                    }
                }
                /* End: Tag construction management ----------------------------------------------------------------- */

                return tagInsert;
            };

            $scope.transcriptArea.ace.addTag = function(tagName, attributes) {
                let tag = $scope.transcriptArea.toolbar.tags[tagName],
                    defaultAddChar = 2;

                let tagInsert = $scope.functions.constructTag(tag, "default", null, attributes),
                    lineNumber = $scope.aceEditor.getCursorPosition().row,
                    column = $scope.aceEditor.getCursorPosition().column + tag.xml.name.length + defaultAddChar;

                $scope.aceEditor.insert(tagInsert);
                $scope.aceEditor.getSelection().moveCursorTo(lineNumber, column);
                $scope.aceEditor.focus();
                $scope.transcriptArea.ace.currentTag = TranscriptService.getTEIElementInformation($scope.functions.getLeftOfCursor(), $scope.functions.getRightOfCursor(), $scope.aceSession.getLines(0, $scope.aceSession.getLength() - 1), $scope.transcriptArea.toolbar.tags, $scope.teiInfo, true);

                // If this is a level 1 tag, we split the line to indent the code
                if ($scope.transcriptArea.toolbar.tags[$scope.transcriptArea.ace.currentTag.name].btn.level === 1) {
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
                    $scope.transcriptArea.ace.currentTag = TranscriptService.getTEIElementInformation($scope.functions.getLeftOfCursor(), $scope.functions.getRightOfCursor(), $scope.aceSession.getLines(0, $scope.aceSession.getLength() - 1), $scope.transcriptArea.toolbar.tags, $scope.teiInfo, true);
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
                $scope.transcriptArea.interaction.content.text = '<p class="text-center" style="margin-top: 20px;"><i class="fa fa-5x fa-spin fa-circle-o-notch"></i></p>';
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
            /**
             * This function loads documentation about a TEI element
             */
            $scope.transcriptArea.interaction.live.microObjects.action = function () {
                if($scope.transcriptArea.interaction.live.microObjects.active === true) {
                    $scope.transcriptArea.interaction.live.microObjects.active = false;
                    $scope.transcriptArea.interaction.live.microObjects.activeClass = '';
                } else {
                    $scope.transcriptArea.interaction.live.microObjects.active = true;
                    $scope.transcriptArea.interaction.live.microObjects.activeClass = 'active bg-danger';
                }
                $scope.transcriptArea.interaction.live.encode();
                $scope.transcriptArea.ace.currentTag = TranscriptService.getTEIElementInformation($scope.functions.getLeftOfCursor(), $scope.functions.getRightOfCursor(), $scope.aceSession.getLines(0, $scope.aceSession.getLength() - 1), $scope.transcriptArea.toolbar.tags, $scope.teiInfo, true);
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
                //$log.log($scope.transcriptArea.interaction.complexEntry.referenceTEIElement);
            };

            /**
             * This function loads documentation about a TEI element
             */
            $scope.transcriptArea.interaction.complexEntry.action = function () {
                for(let iA in $scope.transcriptArea.interaction.complexEntry.arrayListTags) {
                    if($scope.transcriptArea.interaction.complexEntry.arrayListTags[iA].list.indexOf($scope.transcriptArea.ace.currentTag.name) !== -1) {
                        $scope.transcriptArea.interaction.complexEntry.name = $scope.transcriptArea.interaction.complexEntry.arrayListTags[iA].element.btn.id;
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
            /**
             * Help management
             * @param element string|object
             * @param context
             * @param resetBreadcrumb
             */
            $scope.transcriptArea.interaction.help = function (element, context, resetBreadcrumb) {
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

            /**
             * Loading contents of type helpContent
             * @param file
             * @param resetBreadcrumb boolean
             */
            $scope.functions.loadHelpData = function (file, resetBreadcrumb) {
                return ContentService.getContent(file).then(function (data) {
                    let doc = document.createElement('div');
                    doc.innerHTML = data.content;

                    // -- Encoding internal links to be clickable
                    let links = doc.getElementsByTagName("a");
                    for (let oldLink of links) {
                        if (oldLink.getAttribute("class").indexOf("internalHelpLink") !== -1) {
                            let newLink = document.createElement("a");
                            newLink.setAttribute('data-ng-click', 'transcriptArea.interaction.help(\'' + oldLink.getAttribute('href') + '\', \'helpContent\', false)');
                            newLink.innerHTML = oldLink.innerHTML;
                            oldLink.parentNode.insertBefore(newLink, oldLink);
                            oldLink.parentNode.removeChild(oldLink);
                        }
                    }

                    $scope.transcriptArea.interaction.content.text = doc.innerHTML;
                    $scope.transcriptArea.interaction.content.title = data.title;
                    $scope.functions.breadcrumbManagement(data, resetBreadcrumb);
                });
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

                for (let versionId in $scope.transcript._embedded.version) {
                    let version = $scope.transcript._embedded.version[versionId];
                    if (version.id === id) {
                        $scope.transcriptArea.interaction.version.content = version.data.content;
                    }
                }
            };
            /* Versions Management -------------------------------------------------------------------------------------- */

            /* ---------------------------------------------------------------------------------------------------------- */
            /* Bibliography Management */
            /* ---------------------------------------------------------------------------------------------------------- */
            $scope.transcriptArea.interaction.bibliography.loadElements = function() {
                return BibliographyService.getBibliographiesBy('entity', $scope.entity.id).then(function(response) {
                    $scope.transcriptArea.interaction.bibliography.elements = response;
                });
            };

            $scope.transcriptArea.interaction.bibliography.action = function () {
                if($scope.transcriptArea.interaction.bibliography.elements === null) {
                    $scope.transcriptArea.interaction.bibliography.loadElements();
                }

                if ($scope.transcriptArea.interaction.bibliography.addForm.type !== null) {
                    $scope.transcriptArea.interaction.bibliography.addForm.type = null;
                } else {
                    $scope.transcriptArea.interaction.status = 'bibliography';
                }
            };

            $scope.transcriptArea.interaction.bibliography.addForm.action = function (id) {
                // If an id is defined > this is an edition of existent element
                $scope.transcriptArea.interaction.bibliography.addForm.id = null;
                if (id !== undefined && id !== null) {
                    let elementToEdit = $scope.transcriptArea.interaction.bibliography.elements.filter(function (element) {
                        return (element.id === id);
                    });
                    if (elementToEdit !== null) {
                        elementToEdit = elementToEdit[0];
                    }

                    $scope.transcriptArea.interaction.bibliography.addForm.id = id;
                    if (elementToEdit.printedReference !== null) {
                        $scope.transcriptArea.interaction.bibliography.addForm.type = 'printedReference';
                        $scope.transcriptArea.interaction.bibliography.addForm.printedReference = elementToEdit.printedReference;
                        $scope.transcriptArea.interaction.bibliography.addForm.printedReference.authors = $scope.transcriptArea.interaction.bibliography.addForm.printedReference.authors.join(', ');
                    } else if (elementToEdit.manuscriptReference !== null) {
                        $scope.transcriptArea.interaction.bibliography.addForm.type = 'manuscriptReference';
                        $scope.transcriptArea.interaction.bibliography.addForm.manuscriptReference = elementToEdit.manuscriptReference;
                    }
                }
                $scope.transcriptArea.interaction.status = 'bibliographyForm';
            };

            // This methods posts a new bibliographic element
            $scope.transcriptArea.interaction.bibliography.addForm.submit.action = function (method, id) {
                $scope.transcriptArea.interaction.bibliography.addForm.submit.loading = true;
                let elementToEdit = $scope.transcriptArea.interaction.bibliography.elements.filter(function (element) {
                    return (element.id === id);
                });
                if (elementToEdit !== null) {
                    elementToEdit = elementToEdit[0];
                }

                // According to the type of the element
                let reference = {};
                if ($scope.transcriptArea.interaction.bibliography.addForm.type === "printedReference") {
                    reference = $scope.transcriptArea.interaction.bibliography.addForm.printedReference;
                    if (typeof reference.authors === 'string' && reference.authors.indexOf(',') !== -1) {
                        reference.authors = reference.authors.split(",");
                    } else {
                        reference.authors = [reference.authors];
                    }
                } else if ($scope.transcriptArea.interaction.bibliography.addForm.type === "manuscriptReference") {
                    reference = $scope.transcriptArea.interaction.bibliography.addForm.manuscriptReference;
                }

                if (method === 'post') {
                    reference.updateComment = 'Creation of the reference';

                    return BibliographyService.postBibliography('entity', $scope.entity, reference, $scope.transcriptArea.interaction.bibliography.addForm.type)
                        .then(function (response) {
                            return BibliographyService.getBibliographiesBy('entity', $scope.entity.id).then(function (data) {
                                $scope.transcriptArea.interaction.bibliography.elements = data;
                                $scope.transcriptArea.interaction.bibliography.addForm.submit.loading = false;
                                $scope.transcriptArea.interaction.status = 'bibliography';
                            });
                        });
                } else if (method === 'patch') {
                    let idToPatch = reference.id;
                    delete reference._links;
                    delete reference.createDate;
                    delete reference.createUser;
                    delete reference.id;
                    delete reference.updateDate;
                    delete reference.updateUser;
                    reference.updateComment = "Update bibliography element";

                    return BibliographyService.patchBibliography(reference, $scope.transcriptArea.interaction.bibliography.addForm.type, idToPatch)
                        .then(function (response) {
                            return BibliographyService.getBibliographiesBy('entity', $scope.entity.id).then(function (data) {
                                $scope.transcriptArea.interaction.bibliography.elements = data;
                                $scope.transcriptArea.interaction.bibliography.addForm.submit.loading = false;
                                $scope.transcriptArea.interaction.status = 'bibliography';
                            });
                        });
                }
            };
            /* Bibliography Management ---------------------------------------------------------------------------------- */

            /* ---------------------------------------------------------------------------------------------------------- */
            /* Historical Notes Management */
            /* ---------------------------------------------------------------------------------------------------------- */
            $scope.transcriptArea.interaction.historicalNotes.loadElements = function() {
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
                    noteData.updateComment = 'Creation of the note';

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
            };
            /* Historical notes Management ------------------------------------------------------------------------------ */

            /* ---------------------------------------------------------------------------------------------------------- */
            /* Taxonomy Search Management */
            /* ---------------------------------------------------------------------------------------------------------- */
            $scope.transcriptArea.interaction.taxonomy.loadEntities = function() {
                TaxonomyService.getTaxonomyEntities("testators").then(function(response) {
                    $scope.taxonomy.testators = response;
                });
                TaxonomyService.getTaxonomyEntities("places").then(function(response) {
                    $scope.taxonomy.places = response;
                });
                TaxonomyService.getTaxonomyEntities("military-units").then(function(response) {
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
                            $log.log("testators");
                            $scope.transcriptArea.interaction.taxonomy.entities = $scope.taxonomy.testators;
                            $scope.transcriptArea.interaction.taxonomy.values = SearchService.dataset($scope.taxonomy.testators, "name", "string");
                            $scope.transcriptArea.interaction.taxonomy.dataType = "testators";
                            break;
                        case "places":
                            $log.log("places");
                            for (let iEntity in $scope.taxonomy.places) {
                                if ($scope.taxonomy.places[iEntity].names.length > 0) {
                                    $scope.taxonomy.places[iEntity].name = $scope.taxonomy.places[iEntity].names[0].name;
                                }
                            }
                            $scope.transcriptArea.interaction.taxonomy.entities = $scope.taxonomy.places;
                            $scope.transcriptArea.interaction.taxonomy.values = SearchService.dataset($scope.taxonomy.places, "name", "string");
                            $scope.transcriptArea.interaction.taxonomy.dataType = "places";
                            break;
                        case "militaryUnits":
                            $log.log("militaryUnits");
                            $scope.transcriptArea.interaction.taxonomy.entities = $scope.taxonomy.militaryUnits;
                            $scope.transcriptArea.interaction.taxonomy.values = SearchService.dataset($scope.taxonomy.militaryUnits, "name", "string");
                            $scope.transcriptArea.interaction.taxonomy.dataType = "military-units";
                            break;
                        default:
                            $log.log("default");
                    }
                });
                $scope.$watch('transcriptArea.interaction.taxonomy.string', function () {
                    if ($scope.transcriptArea.interaction.taxonomy.string !== undefined) {
                        if ($scope.transcriptArea.interaction.taxonomy.string !== null && $scope.transcriptArea.interaction.taxonomy.string !== "" && $scope.transcriptArea.interaction.taxonomy.string.originalObject !== undefined) {
                            $scope.transcriptArea.interaction.taxonomy.string = $scope.transcriptArea.interaction.taxonomy.string.originalObject.value;
                            $log.log($scope.transcriptArea.interaction.taxonomy.string);
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
            $scope.$watch('transcriptArea.interaction.alertZone.alerts', function () {
                $log.log($scope.transcriptArea.interaction.alertZone.alerts);
            });

            $scope.functions.updateAlerts = function () {
                for (let kLine in $scope.transcriptArea.ace.lines) {
                    kLine = parseInt(kLine);
                    let line = $scope.transcriptArea.ace.lines[kLine];
                    if (line.length > 250) {
                        $scope.transcriptArea.interaction.alertZone.alerts.push({content: $sce.trustAsHtml("La ligne " + (kLine + 1) + " semble longue. N'auriez-vous pas oublié un saut de ligne ?")});
                    }
                }
            };
            /* Alert Zone Management ------------------------------------------------------------------------------------ */

            /* ---------------------------------------------------------------------------------------------------------- */
            /* Viewer Management */
            /* ---------------------------------------------------------------------------------------------------------- */
            /*
                https://github.com/nfabre/deepzoom.php
                https://openseadragon.github.io/docs/
                $scope.openseadragon = {

                prefixUrl: $rootScope.webapp.resources+"libraries/js/openseadragon/images/",
                tileSources: {
                    Image: {
                        xmlns:    "http://schemas.microsoft.com/deepzoom/2008",
                        Url:      $rootScope.api_web+"/images/data/testament_"+$scope.entity.will_number+"/JPEG/FRAN_Poilus_t-"+$scope.entity.will_number+"_"+$scope.resource.images[0],
                        Format:   "jpg",
                        Overlap:  "2",
                        TileSize: "256",
                        Size: {
                            Height: "9221",
                            Width:  "7026"
                        }
                    }
                }
            };*/
            /* Viewer Management ---------------------------------------------------------------------------------------- */

            /* ---------------------------------------------------------------------------------------------------------- */
            /* Submit Management */
            /* ---------------------------------------------------------------------------------------------------------- */
            $scope.submit.action = function (action) {
                if ($scope.transcript.status === "todo" && $scope.transcriptArea.ace.area !== "") {
                    // Updating status value in case of first edition
                    $scope.transcript.status = "transcription";
                }
                if ($scope.transcript.content !== $scope.transcriptArea.ace.area) {
                    $scope.submit.loading = true;
                    if ($scope.submit.form.isEnded === true) {
                        $scope.transcript.status = "validation";
                    }
                    $http.patch($rootScope.api + '/transcripts/' + $scope.transcript.id,
                        {
                            "content": $scope.transcriptArea.ace.area,
                            "updateComment": $scope.submit.form.comment,
                            "status": $scope.transcript.status,
                            "continueBefore": $scope.submit.form.continueBefore,
                            "continueAfter": $scope.submit.form.continueAfter
                        }
                    ).then(function (response) {
                        $log.log(response.data);
                        $scope.transcript = response.data;
                        $scope.submit.loading = false;
                        $scope.submit.form.isEnded = false;
                        $scope.submit.form.comment = "";

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
                    alert('It seems you didn\'t edit anything.')
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
                if (($scope.transcript.content === null && ($scope.transcriptArea.ace.area === null || $scope.transcriptArea.ace.area === '')) || $scope.transcript.content === $scope.transcriptArea.ace.area) {
                    $log.log('get through onBefore');
                    TranscriptLogService.patchTranscriptLog({isCurrentlyEdited: false}, $scope.currentLog.id);
                } else {
                    $log.log('ask for leave');
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
                    updateComment: "Changing status to " + state
                }, $scope.transcript.id).then(function (data) {
                    $scope.transcript = data;
                    $scope.admin.status.loading = false;
                });
            };

            /**
             * Validation accept management
             */
            $scope.admin.validation.accept.action = function () {
                $scope.admin.validation.accept.loading = true;
                return TranscriptService.patchTranscript(
                    {
                        "content": $scope.transcriptArea.ace.area,
                        "updateComment": "Accept validation",
                        "status": "validated"
                    }, $scope.transcript.id
                ).then(function (response) {
                    $log.log(response);
                    $scope.transcript = response;
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
                        "updateComment": "Refuse validation",
                        "status": "transcription"
                    }, $scope.transcript.id
                ).then(function (response) {
                    $log.log(response);
                    $scope.transcript = response;
                    $scope.admin.validation.refuse.loading = false;
                });
            };
            /* Admin Management ----------------------------------------------------------------------------------------- */

            /* ---------------------------------------------------------------------------------------------------------- */
            /* Full screen Management */
            /* ---------------------------------------------------------------------------------------------------------- */
            let fullscreenDiv = document.getElementById("transcriptContainerFullScreen");
            let fullscreenFunc = fullscreenDiv.requestFullscreen;
            if (!fullscreenFunc) {
                ['mozRequestFullScreen',
                    'msRequestFullscreen',
                    'webkitRequestFullScreen'].forEach(function (req) {
                    fullscreenFunc = fullscreenFunc || fullscreenDiv[req];
                });
            }

            $scope.page.fullscreen.open = function () {
                $log.log('fullscreen');
                fullscreenFunc.call(fullscreenDiv);
                $scope.page.fullscreen.status = true;
            };

            // Doc here > https://stackoverflow.com/questions/7836204/chrome-fullscreen-api#7934009
            $scope.page.fullscreen.close = function () {
                if (document.exitFullscreen)
                    document.exitFullscreen();
                else if (document.msExitFullscreen)
                    document.msExitFullscreen();
                else if (document.mozCancelFullScreen)
                    document.mozCancelFullScreen();
                else if (document.webkitExitFullscreen)
                    document.webkitExitFullscreen();
                $scope.page.fullscreen.status = false;
            };
            /* Full screen Management ----------------------------------------------------------------------------------- */

            /* ---------------------------------------------------------------------------------------------------------- */
            /* Right menu Management */
            /* ---------------------------------------------------------------------------------------------------------- */
            $scope.transcriptArea.ace.rightMenu.loadDocumentation = function () {
                $scope.transcriptArea.ace.currentTag = TranscriptService.getTEIElementInformation($scope.functions.getLeftOfCursor(), $scope.functions.getRightOfCursor(), $scope.aceSession.getLines(0, $scope.aceSession.getLength() - 1), $scope.transcriptArea.toolbar.tags, $scope.teiInfo, true);
                $scope.transcriptArea.interaction.help($scope.transcriptArea.ace.currentTag.name, "modelDoc", true);

                $("#transcript-edit-editor-ace-area-rmenu").hide(100);
            };

            $scope.transcriptArea.ace.rightMenu.loadInformation = function () {
                $scope.transcriptArea.ace.currentTag = TranscriptService.getTEIElementInformation($scope.functions.getLeftOfCursor(), $scope.functions.getRightOfCursor(), $scope.aceSession.getLines(0, $scope.aceSession.getLength() - 1), $scope.transcriptArea.toolbar.tags, $scope.teiInfo, true);
                $scope.transcriptArea.interaction.help($scope.transcriptArea.ace.currentTag, "modelInfo", true);

                $("#transcript-edit-editor-ace-area-rmenu").hide(100);
            };
            /* Right menu Management ------------------------------------------------------------------------------------ */
        }
    }])
;