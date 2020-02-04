/**
 *Created by Jumadi Janjaya
 *2, Desember, 2019
 *Cumacoding.com,
 *Bengkulu, Indonesia.
 */

const HORIZONTAL = 'horizontal';
const VERTICAL = 'vertical';

const TtsEditor = function (options) {

    var tableGrid = $('.__tts-grid');
    var tablequestions = $('.__table-tts-questions tbody');
    var horizontal = $('#horizontal');
    var vertical = $('#vertical');
    var inputRow = $('#row');
    var inputColumn = $('#column');
    var inputAnswer = $('#answer');
    var inputQuestion = $('#question');
    var btnSave = $('#save');
    var btnDone = $('#done');

    var tts = {
        rowCount: (options.rowCount != undefined) ? options.rowCount : 10,
        columnCount: (options.columnCount != undefined) ? options.columnCount : 10,
        startRow: 1,
        startColumn: 1,
        orientation: HORIZONTAL,
        answer: '',
        question: '',
        answerOld: '',
        start: 1,
        answers: [],
        answersOld: [],

        editIndex: -1,
        questions: [],
        callbackDone: options.callbackDone,
        level: -1,

        create: function (columnCount, rowCount) {
            tts.rowCount = rowCount;
            tts.columnCount = columnCount;
            tts.createView();
        },
        createView: function () {
            tableGrid.html("");
            tableGrid.removeAttr('style');
            var html = '<thead><tr><th>#</th>';
            for (let i = 1; i <= this.columnCount; i++) {
                html += '<th class="box-num">' + i + '</th>';
            }
            html += '</tr></thead><tbody>';

            for (let i = 1; i <= this.rowCount; i++) {
                html += '<tr><td class="box-num">' + i + '</td>';
                for (let j = 1; j <= this.columnCount; j++) {
                    html += '<td class="item" id="' + j + 'l' + i + '"></td>';
                }
                html += '</tr>';
            }
            html += '</tbody>'
            tableGrid.append(html);
            horizontal.prop("checked", true);

            let width = tableGrid.width();
            let height = tableGrid.height();
            if (width > height) {
                tableGrid.width(height + 42);
            }
            if (height > width) {
                //tableGrid.height(width);
            }
        },

        alert: function (message, type) {
            console.log(message);
        },

        setAnswer: function (answers, answersOld) {
            answersOld.forEach((element, i) => {
                if (this.orientation == HORIZONTAL) {
                    var n = (this.startColumn + i);
                    var s = n + 'l' + this.startRow;
                    if (i < answers.length) {
                        if ($('#' + s).hasClass('item-box') && $('#' + s).text() != element) {
                            $('#' + s).attr('data-double', $('#' + s).text());
                        }
                        $('#' + s).text(element);
                        $('#' + s).addClass('item-select');

                        if (n > this.columnCount) {
                            this.alert('Kata melewati batas', 'error');
                        }
                    } else {
                        if (!$('#' + s).hasClass('item-box')) {
                            if (typeof $('#' + s).attr('data-double') === "undefined") {
                                $('#' + s).text('');
                            }
                        }
                        if (i != 0) {
                            $('#' + s).removeClass('item-select');
                        }
                    }
                } else {
                    var n = (this.startRow + i);
                    var s = this.startColumn + 'l' + n;
                    if (i < answers.length) {
                        if ($('#' + s).hasClass('item-box') && $('#' + s).text() != element) {
                            $('#' + s).attr('data-double', $('#' + s).text());
                        }
                        $('#' + s).text(element);
                        $('#' + s).addClass('item-select');

                        if (n > this.rowCount) {
                            this.alert('Kata melewati batas', 'error');
                        }
                    } else {
                        if (!$('#' + s).hasClass('item-box')) {
                            if (typeof $('#' + s).attr('data-double') === "undefined") {
                                $('#' + s).text('');
                            }
                        }
                        if (i != 0) {
                            $('#' + s).removeClass('item-select');
                        }
                    }
                }
            });
        },

        resetState: function () {
            if (this.answer === '') {
                return;
            }
            tableGrid.find('td').each(function () {
                if (parseInt($(this).attr('data-double')) !== 1 && $(this).attr('data-double') !== undefined) {
                    var dt = $(this).attr('data-double');
                    $(this).text(dt);
                    $(this).removeAttr('data-double');
                }

                if (!$(this).hasClass('item-box') && !$(this).hasClass('box-num')) {
                    if (parseInt($(this).attr('data-double')) !== 1) {
                        $(this).text('');
                    } else {
                        $(this).addClass('item-box');
                    }
                    $(this).removeClass('item-select');
                } else if ($(this).hasClass('item-box') && $(this).hasClass('item-select')) {
                    $(this).removeClass('item-select');
                }
            });
        },

        resetForm: function () {
            horizontal.prop("checked", true);
            vertical.prop("checked", false);
            inputRow.val('');
            inputColumn.val('');
            inputAnswer.val('');
            inputQuestion.val('');

            inputRow.parent().find('label').removeClass('active');
            inputColumn.parent().find('label').removeClass('active');
            inputAnswer.parent().find('label').removeClass('active');
            inputQuestion.parent().find('label').removeClass('active');

            this.answer = '';
            this.question = '';
            this.startColumn = 1;
            this.startRow = 1;
            this.orientation = HORIZONTAL;

            this.answerOld = '';
            this.start = 1;

            this.answers = [];
            this.answersOld = [];

            tableGrid.find('td').each(function () {
                if ($(this).hasClass('item-select')) {
                    if ($(this).hasClass('item-box')) {
                        $(this).attr('data-double', 1);
                    } else if ($(this).text() !== '') {
                        $(this).addClass('item-box');
                    }
                }
                $(this).removeClass('item-select');
            });
        },

        saved: function (answer, question, column, row, orientation) {

            if (answer.length === 0) {
                this.alert('Kotak input harus di isi!', 'error');
                return;
            }

            //var id = tablequestions.find('tr:last-child').attr('data-id');
            var arr = {
                'answer': answer,
                'question': question,
                'column': column,
                'row': row,
                'orientation': orientation
            };

            if (this.editIndex !== -1) {
                this.questions[this.editIndex] = arr;

                var item = [this.editIndex + 1, question, answer];
                var editIndex = this.editIndex;
                
                tablequestions.find('tr[data-id="'+(editIndex+1)+'"]').each(function (index) {
                    if (index === 0) {
                        $(this).find('td').each(function (i) {
                            $(this).text(item[i]);
                            var t = $(this).attr('title');
                            if (typeof t !== "undefined") {
                                $(this).attr('title', item[i]);
                            }
                        });
                    }
                });

                this.editIndex = -1;
            } else {
                this.questions.push(arr);

                var text = '<tr class="question-item" data-id="' + this.questions.length + '" >';
                text += '<td>' + this.questions.length + '</td>';
                text += '<td title="' + question + '" class="truncate">' + question + '</td>';
                text += '<td title="' + answer + '">' + answer + '</td>';
                text += `<td>
                <div id="edit-soal" class="button icon mini primary" title="Edit">
                <i class="fa fa-edit"></i></div>
                <div id="hapus-soal" class="button icon mini red" title="Hapus">
                <i class="fa fa-trash"></i></div>
                </td>`;
                text += '</tr>';

                tablequestions.append(text);
            }
        },

        questionHover: function (params) {
            var id = params.getAttribute('data-id');
            var question = this.questions[id - 1];
            var answer = question['answer'];
            var x = question['column'];
            var y = question['row'];
            var o = question['orientation'];

            if (o === HORIZONTAL) {
                for (let i = 0; i < answer.length; i++) {
                    var n = (parseInt(x) + i);
                    var s = n + 'l' + y;
                    $('#' + s).addClass('item-select-hover');
                }
            } else {
                for (let i = 0; i < answer.length; i++) {
                    var n = (parseInt(y) + i);
                    var s = x + 'l' + n;
                    $('#' + s).addClass('item-select-hover');
                }
            }


        },

        questioOutHover: function (params) {
            var id = params.getAttribute('data-id');
            var question = this.questions[id - 1];
            var answer = question['answer'];
            var x = question['column'];
            var y = question['row'];
            var o = question['orientation'];

            if (o === HORIZONTAL) {
                for (let i = 0; i < answer.length; i++) {
                    var n = (parseInt(x) + i);
                    var s = n + 'l' + y;
                    $('#' + s).removeClass('item-select-hover');
                }
            } else {
                for (let i = 0; i < answer.length; i++) {
                    var n = (parseInt(y) + i);
                    var s = x + 'l' + n;
                    $('#' + s).removeClass('item-select-hover');
                }
            }

        },

        questioEdit: function (params) {

            var id = params.getAttribute('data-id');

            var question = this.questions[id - 1];
            if (this.editIndex != -1) {
                var q = this.questions[this.editIndex];
                this.setAnswer(q['answer'].split(''), q['answer'].split(''));
            }

            this.resetForm();
            this.resetState();
            this.answer = question['answer'];
            this.question = question['question'];
            this.startColumn = question['column'];
            this.startRow = question['row'];
            this.editIndex = id - 1;
            this.orientation = question['orientation'];

            this.answerOld = this.answer;
            this.start = this.startColumn + 'l' + this.startRow;

            this.answers = this.answer.split('');
            this.answersOld = this.answers;

            inputRow.val(this.startRow);
            inputColumn.val(this.startColumn);
            inputAnswer.val(this.answer);
            inputQuestion.val(this.question);

            inputRow.parent().find('label').addClass('active');
            inputColumn.parent().find('label').addClass('active');
            inputAnswer.parent().find('label').addClass('active');
            inputQuestion.parent().find('label').addClass('active');

            if (this.orientation === HORIZONTAL) {
                horizontal.attr("checked", true);
                vertical.attr("checked", false);

                for (let i = 0; i < this.answer.length; i++) {
                    var n = (parseInt(this.startColumn) + i);
                    var s = n + 'l' + this.startRow;
                    $('#' + s).removeClass('item-box');
                    $('#' + s).addClass('item-select');

                }
            } else {
                horizontal.attr("checked", false);
                vertical.attr("checked", true);
                for (let i = 0; i < this.answer.length; i++) {
                    var n = (parseInt(this.startRow) + i);
                    var s = this.startColumn + 'l' + n;
                    $('#' + s).removeClass('item-box');
                    $('#' + s).addClass('item-select');
                }
            }
        },

        questioDelete: function (params) {
            var id = params.getAttribute('data-id');
            var question = this.questions[id - 1];
            var jw = question['answer'];
            var x = question['column'];
            var y = question['row'];
            var o = question['orientation'];

            this.questions.splice(id - 1, 1);

            if (o === HORIZONTAL) {
                for (let i = 0; i < jw.length; i++) {
                    var n = (parseInt(x) + i);
                    var s = n + 'l' + y;
                    var isDouble = $('#' + s)[0].getAttribute('data-double');

                    if (parseInt(isDouble) === 1) {
                        $('#' + s).removeAttr('data-double');
                    } else {
                        $('#' + s).removeClass('item-box');
                        $('#' + s).text('');
                    }

                    $('#' + s).removeClass('item-select-hover');
                    if ((id - 1) === this.editIndex) {
                        $('#' + s).removeClass('item-select');
                    }
                }
            } else if (o === VERTICAL) {
                for (let i = 0; i < jw.length; i++) {
                    var n = (parseInt(y) + i);
                    var s = x + 'l' + n;
                    var isDouble = $('#' + s)[0].getAttribute('data-double');

                    if (parseInt(isDouble) === 1) {
                        $('#' + s).removeAttr('data-double');
                    } else {
                        $('#' + s).removeClass('item-box');
                        $('#' + s).text('');
                    }

                    $('#' + s).removeClass('item-select-hover');
                    if ((id - 1) === this.editIndex) {
                        $('#' + s).removeClass('item-select');
                    }
                }
            }

            tablequestions.find('tr[data-id="'+(id)+'"]').each(function (index) {
                if (index === 0) {
                    $(this).remove();
                }
            });
            tablequestions.find('tr').each(function (index) {
                $(this).attr("data-id", (index + 1));
                $(this).find("td").each(function (p) {
                    if (p === 0) {
                        $(this).text(index + 1);
                    }
                    $(this).find("a").each(function () {
                        $(this).attr("data-id", (index + 1));
                    });
                });
            });

            if ((id - 1) === this.editIndex) {
                this.resetForm();
            }
        },

        done: function () {
            var result = {
                'level': this.level,
                'row_count': this.rowCount,
                'column_count': this.columnCount,
                'tsilang': this.questions
            }

            if (typeof this.callbackDone === 'function') {
                this.callbackDone(result);
            }
        },

        loads(tsilang) {

            this.level = tsilang.level;
            this.rowCount = tsilang.row_count;
            this.columnCount = tsilang.column_count;

            tablequestions.html('');
            this.questions = []
            this.createView();

            tsilang.tsilang.forEach(value => {
                this.start = value['column'] + 'l' + value['row'];
                this.startColumn = value['column'];
                this.startRow = value['row'];
                this.orientation = value['orientation'];
                this.setAnswer(value['answer'].split(''), value['answer'].split(''));
                this.saved(
                    value['answer'],
                    value['question'],
                    value['column'],
                    value['row'],
                    value['orientation']);
                this.resetForm();
            });
        }

    }

    horizontal.click(function () {
        tts.orientation = HORIZONTAL;
        tts.resetState();
        tts.setAnswer(tts.answers, tts.answersOld);
    });

    vertical.click(function () {
        tts.orientation = VERTICAL;
        tts.resetState();
        tts.setAnswer(tts.answers, tts.answersOld);
    });

    inputRow.change(function () {
        tts.startRow = parseInt($(this).val());

        if (tts.startRow > tts.rowCount) {
            tts.alert('Nomor kotak harus dibawah ', 'error');
            return;
        }

        var s = tts.startColumn + 'l' + tts.startRow;
        var row = tableGrid.find('#' + s);
        $('#' + tts.start).removeClass('item-select');
        row.addClass('item-select');

        tts.resetState();
        tts.setAnswer(tts.answers, tts.answersOld);

        tts.start = s;

        inputColumn.focus();
    });

    inputColumn.keydown(function (evt) {
        if (evt.keyCode === 8 && $(this).val() === '') {
            inputRow.focus();
        }
    });
    inputColumn.change(function () {
        tts.startColumn = parseInt($(this).val());

        if (tts.startColumn > tts.columnCount) {
            tts.alert('Nomor kotak harus dibawah' + tts.columnCount, 'error');
            return;
        }

        var s = tts.startColumn + 'l' + tts.startRow;
        var col = tableGrid.find('#' + s);
        $('#' + tts.start).removeClass('item-select');
        col.addClass('item-select');

        tts.resetState();
        tts.setAnswer(tts.answers, tts.answersOld);

        tts.start = s;

        inputAnswer.focus();
    });

    inputAnswer.keyup(function (evt) {
        tts.answer = $(this).val();
        tts.answers = tts.answer.split('');
        tts.answersOld = tts.answerOld.split('');

        if (evt.keyCode !== 8) {
            tts.answersOld = tts.answers;
        }

        tts.setAnswer(tts.answers, tts.answersOld);

        tts.answerOld = tts.answer;
    });
    inputAnswer.keypress(function (evt) {
        if (evt.keyCode === 13) {
            inputQuestion.focus();
        }
    });

    inputAnswer.keydown(function(evt) {
        if (evt.keyCode === 8 && $(this).val() === '') {
            inputColumn.focus();
        }
    });

    inputQuestion.keydown(function (evt) {
        if (evt.keyCode === 8 && $(this).val() === '') {
            inputAnswer.focus();
        }
    });
    inputQuestion.keypress(function (evt) {
        tts.question = $(this).val();

        if (evt.keyCode === 13) {
            tts.saved(tts.answer, tts.question, tts.startColumn, tts.startRow, tts.orientation);
            tts.resetForm();
            inputRow.focus();
        }
        
    });

    btnSave.animClick(function () {
        tts.question = inputQuestion.val();
        tts.saved(tts.answer, tts.question, tts.startColumn, tts.startRow, tts.orientation);
        tts.resetForm();
    });

    btnDone.animClick(function () {
        tts.done();
    });

    tablequestions.delegate('tr.question-item', 'mouseover', function () {
        tts.questionHover(this);
    });

    tablequestions.delegate('tr.question-item', 'mouseout', function () {
        tts.questioOutHover(this);
    });

    tablequestions.delegateClick('tr #edit-soal', function () {
        tts.questioEdit($(this).parent().parent()[0]);
    });
    tablequestions.delegateClick('tr #hapus-soal', function () {

        tts.questioDelete($(this).parent().parent()[0]);
    });

    return tts;
}