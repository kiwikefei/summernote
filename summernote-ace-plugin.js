(function(factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('jquery'));
    } else {
        factory(window.jQuery);
    }
}(function($) {
    // Extends lang for code plugin.
    $.extend(true, $.summernote.lang, {
        'en-US': {
            aceCodeEditor: {
                aceCodeEditor: 'Insert Code'
            }
        },
        'zh-CN': {
            aceCodeEditor: {
                aceCodeEditor: '插入代码'
            }
        }
    });

    // Extends plugins for code plugin.
    $.extend($.summernote.plugins, {
        /**
         * @param {Object} context - context object has status of editor.
         */
        'aceCodeEditor': function(context) {
            var self = this;
            // ui has renders to build ui elements.
            //  - you can create a button with `ui.button`
            var ui = $.summernote.ui;
            var $editor = context.layoutInfo.editor;
            var options = context.options;
            var lang = options.langInfo;

            this.editor = '';

            this.getOpts = function() {
                console.log('getOpts');

                var opts = {
                    aceTheme: context.options.ace.aceTheme || 'ace/theme/twilight',
                    aceMode: context.options.ace.aceMode || 'php',
                    aceLineHeight: context.options.ace.aceLineHeight || '18px',
                    aceFontSize: context.options.ace.aceFontSize || '12px',
                    aceModeSelectorLabel: context.options.ace.aceModeSelectorLabel || 'select your language',
                    aceCodeInputAreaLabel: context.options.ace.aceCodeInputAreaLabel || 'input your code',
                    aceCodeSubmitBtnLabel: context.options.ace.aceCodeSubmitBtnLabel || 'Insert',
                    aceModalTitle: context.options.ace.aceModalTitle || 'Insert Code',
                    aceModes: context.options.ace.aceModes || [
                        'php', 'javascript', 'sql','sh',
                        'java','python', 'ruby', 'golang',
                        'coffee', 'typescript'
                    ],
                };
                return opts;
            };

            this.showInsertCodeDialog = function(opts) {
                console.log('showInsertCodeDialog');

                this.editor.focus();
                return $.Deferred(function(deferred) {
                    var $submitBtn = $('#aceInsertCode');
                    var $modeSelector = $('#modeSelector');
                    var mode = opts.aceMode;
                    var theme = opts.aceTheme;
                    var lineHeight = opts.aceLineHeight;
                    var fontSize = opts.aceFontSize;

                    ui.onDialogShown(self.$dialog, function() {
                        context.triggerEvent('dialog.shown');
                        $modeSelector.on('change', function(e) {
                            mode = e.target.value;
                            self.editor.session.setMode('ace/mode/' + mode);
                        });
                        $submitBtn.on('click', function(event) {
                            event.preventDefault();
                            deferred.resolve({
                                code: self.editor.getSession().getValue(),
                                aceMode: mode,
                                aceTheme: theme,
                                aceLineHeight: lineHeight,
                                aceFontSize: fontSize,
                            });
                            self.$dialog.modal('hide');
                        });
                    });

                    ui.onDialogHidden(self.$dialog, function() {
                        $submitBtn = null;
                        $modeSelector = null;
                        if (deferred.state() === 'pending') {
                            deferred.reject();
                        }
                    });
                    ui.showDialog(self.$dialog);
                }).promise();
            };

            this.createNode = function(code) {
                console.log('createNode');

                var $display = $('<pre />');
                $display.html(code);
                return $display[0];
            };

            this.show = function() {
                console.log('show');

                var opts = self.getOpts();
                context.invoke('editor.saveRange');
                this.showInsertCodeDialog(opts).then(function(result) {
                    context.invoke('editor.restoreRange');
                    var codeNode = self.createNode(result.code);
                    var display = ace.edit(codeNode);
                    display.setTheme(result.aceTheme);
                    display.session.setMode('ace/mode/' + result.aceMode);
                    display.getSession().setValue(result.code);
                    display.getSession().setUseWorker(false);
                    display.setReadOnly(true);
                    display.$blockScrolling = Infinity;
                    display.setShowPrintMargin(false);
                    display.setHighlightActiveLine(true);
                    display.renderer.$cursorLayer.element.style.display = "none";
                    display.renderer.$gutterLineHighlight.style.display = "none";
                    display.renderer.$gutterLayer.$showFoldWidgets = false;
                    var lineNumber = display.session.getLength();
                    codeNode.style.lineHeight = result.aceLineHeight;
                    codeNode.style.fontSize = result.aceFontSize;
                    codeNode.style.height = parseInt(codeNode.style.lineHeight) * lineNumber + 5 + 'px';
                    context.invoke('editor.insertNode', codeNode);
                });
            };

            // add code button
            context.memo('button.aceCodeEditor', function() {
                // create button
                console.log('context.memo');

                var button = ui.button({
                    contents: '<i class="fa fa-fw fa-lg fa-code"/>',// + lang.aceCodeEditor.aceCodeEditor,
                    tooltip: lang.aceCodeEditor.aceCodeEditor,
                    click: function() {
                        self.show();
                    }
                });
                // create jQuery object from button instance.
                var $code = button.render();
                return $code;
            });

            this.createCodeDialog = function() {
                console.log('createCodeDialog');

                var $box = $('<div />');
                var $selectGroup = $('<div class="form-group" />');
                var $textGroup = $('<div class="form-group" />');
                var $select = $('<select class="form-control ace-plugin-select" id="modeSelector" />');
                var _opts = this.getOpts();
                var modes = _opts.aceModes;

                for (var i = 0; i < modes.length; i++) {
                    $select.append('<option value="' + modes[i] + '">' + modes[i] + '</option>');
                }

                var $label = $('<label />');
                $label.html(_opts.aceModeSelectorLabel);
                $box.append($selectGroup.append($label));
                $box.append($selectGroup.append($select));

                var $label = $('<label />');
                $label.html(_opts.aceCodeInputAreaLabel);
                var $textarea = $('<div class="ace-plugin-code" id="aceCodeEditor" />');

                $box.append($textGroup.append($label));
                $box.append($textGroup.append($textarea));

                return $box.html();
            };

            this.initialize = function() {
                console.log('initialize');
                var opts = this.getOpts();
                var $container = options.dialogsInBody ? $(document.body) : $editor;
                var footer = '<button type="button" class="btn btn-primary" id="aceInsertCode">' +
                    opts.aceCodeSubmitBtnLabel + '</button>';
                this.$dialog = ui.dialog({
                    className: 'code-dialog',
                    title: opts.aceModalTitle,
                    fade: options.dialogsFade,
                    body: self.createCodeDialog(),
                    footer: footer
                }).render().appendTo($container);

                this.editor = ace.edit('aceCodeEditor');
                this.editor.setTheme(opts.aceTheme);
                this.editor.session.setMode('ace/mode/' + opts.aceMode);
                this.editor.$blockScrolling = Infinity;
                this.editor.setShowPrintMargin(false);
            };

            this.destroy = function() {
                ui.hideDialog(this.$dialog);
                this.$dialog.remove();
            };
        }
    });
}));