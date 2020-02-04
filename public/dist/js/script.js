'use strict';
(function ($) {
    const rects = [];

    var constantX = (cursorX, target) => {
        return (cursorX > target.getBoundingClientRect().left) && (cursorX < target.getBoundingClientRect().left + target.offsetWidth)
    }
    var constantY = (cursorY, target) => {
        return (cursorY > target.getBoundingClientRect().top && cursorY < (target.getBoundingClientRect().top + target.offsetHeight))
    }

    var constantRect = (target, target2) => {
        if (target.getBoundingClientRect().left >= target2.getBoundingClientRect().left && (target.getBoundingClientRect().left + target.offsetWidth) <= (target2.getBoundingClientRect().left + target2.offsetWidth)) {
            if (target.getBoundingClientRect().top >= target2.getBoundingClientRect().top && (target.getBoundingClientRect().top + target.offsetHeight) <= (target2.getBoundingClientRect().top + target2.offsetHeight)) {
                return true;
            }
        }
        return false;
    }

    $(document).mousedown((e) => {
        rects.forEach(value => {
            if (typeof value.noHideKeyKode === "number") {
                if (e.originalEvent.button === value.noHideKeyKode) {
                    return;
                }
            }
            var rectObject = $(value.rectObject);
            var isClose = (typeof value.isAutoClose === "boolean") ? value.isAutoClose : true;
            if (rectObject.hasClass('visible') && isClose) {
                if (
                    (!(e.clientX > rectObject[0].getBoundingClientRect().left) ||
                        !(e.clientX < rectObject[0].getBoundingClientRect().left + rectObject.outerWidth())) ||
                    (!(e.clientY > rectObject[0].getBoundingClientRect().top) ||
                        !(e.clientY < rectObject[0].getBoundingClientRect().top + rectObject.outerHeight()))
                ) {
                    rectObject.gone();
                }
            }
        });
    });

    $(window).resize(function () {
        rects.forEach(value => {
            if (typeof value.show === "function" && value.type !== 'context_menu') {
                value.show.apply(value.rectObject);
            }
        });
    });
    $(document).scrollTop(function () {
        let filter = rects.filter(v => v.type === 'context_menu');
        filter.forEach(value => {
            $(value.rectObject).gone();
        });
    });

    $(document).bind('contextmenu rightclick', function (e) {
        let filter = rects.filter(v => v.type === 'context_menu');
        var isShow = false;

        filter.forEach((value) => {
            var y = e.clientY;
            var x = e.clientX;
            if (value.target) {
                $(value.target).each(function () {
                    if (constantRect(e.target, this)) {

                        if (value.positionCurcor) {
                            if (x > (window.innerWidth - value.rectObject[0].offsetWidth - 4)) {
                                x = x - value.rectObject[0].offsetWidth - 4;
                            }

                            $(value.rectObject)
                                .css('left', x)
                                .css('top', y).visible();
                        } else {
                            var left = (this.getBoundingClientRect().left + $(this).outerWidth() + 4);
                            var top = this.getBoundingClientRect().top;
                            if (left + $(value.rectObject).outerWidth() > window.innerWidth) {
                                left = left - $(value.rectObject).outerWidth();
                            }
                            if ((top + $(value.rectObject).outerHeight()) > window.innerHeight) {
                                top = top - $(value.rectObject).outerHeight();
                            }
                            $(value.rectObject).css('left', left).css('top', top).visible();
                        }
                        if (typeof value.show === "function") {
                            value.show.apply(value.rectObject, $(this));
                        }
                        isShow = true;
                    }
                });
            }
        });
        if (isShow) {
            e.preventDefault();
        }

        return !isShow;
    });

    $.fn.visible = function () {
        if ($(this).hasClass('visible')) {
            return $(this);
        }
        $(this).css('opacity', '0.0');
        $(this).removeClass('gone');
        $(this).addClass('visible');
        $(this).animate({
            opacity: 1.0
        }, 200);
        var find = rects.find(v => v.rectObject[0] === this[0]);
        if (find) {
            if (typeof find.show === "function" && find.type !== 'context_menu') {
                var z = rects.find(v => $(v.rectObject).hasClass('visible') && v !== find);
                if (z) {
                    $(this).css('z-index', (parseInt($(z.rectObject).css('z-index')) + 1));
                }
                find.show.apply(this);
            }
        }
        return $(this);
    }

    $.fn.gone = function () {
        $(this).animate({
            opacity: 0.0
        }, 200, () => {
            $(this).removeClass('visible');
            $(this).addClass('gone');
            $(this).css('opacity', '1.0');
        });
        var find = rects.find(v => v.rectObject[0] === this[0]);
        if (find) {
            if (typeof find.hide === "function" && find.type !== 'context_menu') {
                find.hide.apply(this);
            }
        }
        return $(this);
    }

    $.fn.animClick = function (method) {
        var isClickDown = false;
        $(this).on('pointerdown', function (e) {
            if (e.originalEvent.button === 0) {
                isClickDown = true;
                $(this).css('transform', 'scaleX(0.8) scaleY(0.8)');
            }
        });
        $(this).on('pointerup', function (e) {
            isClickDown = false;
            if (typeof method === "function") {
                method.apply(this, e);
            }
            $(this).css('transform', 'scaleX(1) scaleY(1)');
        });
        $(this).on('pointerout', function () {
            if (isClickDown) {
                isClickDown = false;
                $(this).css('transform', 'scaleX(1) scaleY(1)');
            }
        });

        return $(this);
    }
    $.fn.delegateClick = function (target, method) {
        var isClickDown = false;
        $(this).delegate(target, 'pointerdown', function (e) {
            if (e.originalEvent.button === 0) {
                isClickDown = true;
                $(this).css('transform', 'scaleX(0.8) scaleY(0.8)');
            }
        });
        $(this).delegate(target, 'pointerup', function (e) {
            if (isClickDown) {
                if (typeof method === "function") {
                    method.apply(this, e);
                }
                isClickDown = false;
                $(this).css('transform', 'scaleX(1) scaleY(1)');
            }
        });
        $(this).delegate(target, 'pointerout', function () {
            if (isClickDown) {
                isClickDown = false;
                $(this).css('transform', 'scaleX(1) scaleY(1)');
            }
        });
    }

    $.fn.menu = function () {
        let s = $(this).find('.switch');
        if ($(this).hasClass('left')) {
            $(this).css('left', -($(this).width() - s.outerWidth() + 4) + 'px');
        } else {
            $(this).css('right', -($(this).width() - s.outerWidth() + 4) + 'px');
        }
        s.click(function () {
            $(this).parent().toggleClass('open');
        });
    }

    $.fn.contextMenu = function (params) {
        rects.push({
            type: 'context_menu',
            rectObject: this,
            target: (typeof params.target === "undefined") ? null : params.target,
            show: (typeof params.show === "function") ? params.show : null,
            positionCurcor: (typeof params.positionCurcor === "boolean") ? params.positionCurcor : false,
            noHideKeyKode: 2,
        });

        return $(this);
    }

    $.fn.dialog = function (ops) {
        let defaultOps = {
            isMove: (typeof ops !== "undefined") ? ops.isMove : false,
            isAutoClose: (typeof ops !== "undefined") ? ops.isAutoClose : true,
            show: (typeof ops !== "undefined") ? ops.show : null,
            close: (typeof ops !== "undefined") ? ops.close : null,
        }
        rects.push({
            type: 'dialog',
            rectObject: this,
            target: null,
            isAutoClose: defaultOps.isAutoClose,
            hide: (typeof ops !== "undefined") ? ops.hide : null,
            show: function () {
                let left = ($(window).width() - $(this).outerWidth()) / 2;
                let top = ($(window).height() - $(this).outerHeight()) / 2;
                $(this).css('left', left + 'px').css('top', top + 'px');

                const header = $(this).find('.header');
                const content = $(this).find('.content');
                const footer = $(this).find('.footer');
                if ((content.outerHeight() + header.outerHeight() + footer.outerHeight()) > $(window).height()) {
                    content.outerHeight($(window).height() - (header.outerHeight() + footer.outerHeight() + 8));
                }
                if (defaultOps.show) {
                    ops.show.apply(this);
                }
            }
        });

        const root = $(this);
        const close = $(this).find('.dialog-close');
        close.animClick(function () {
            if (defaultOps.close) {
                defaultOps.close.apply(root);
            }
            root.gone();
        });
        const header = $(this).find('.header');

        header.mousedown(function (e) {
            if (defaultOps.isMove) {
                isDown = true;
                header.css('cursor', 'move');
                positionStart = {
                    x: e.clientX,
                    y: e.clientY
                }
            }
            var z = rects.find(v => $(v.rectObject).hasClass('visible') && !$(v.rectObject).is(root));
            if (z) {
                root.css('z-index', (parseInt($(z.rectObject).css('z-index')) + 1));
            }

        });
        if (defaultOps.isMove) {
            var isDown = false;
            var positionStart = {
                x: 0,
                y: 0
            }
            header.mousemove(function (e) {
                if (isDown) {
                    let left = root.offset().left + (e.clientX - positionStart.x);
                    let top = root.offset().top + (e.clientY - positionStart.y);
                    root.css('left', left + 'px').css('top', top + 'px');
                    positionStart = {
                        x: e.clientX,
                        y: e.clientY
                    }
                }
            });
            $(document).mouseup(function () {
                if (isDown) {
                    header.css('cursor', 'default');
                    isDown = false;
                }
            });
        }
        return $(this);
    }

    $.fn.initComponent = function (fn) {
        if (typeof fn === "function") {
            fn.apply(this);
        }

        return $(this);
    }

    $.fn.matchHeight = function () {
        let $this = $(this);
        let top = $(this).position().top;
        let height = $(window).innerHeight() - top - 22;
        $(this).outerHeight(height);
        $(window).resize(function () {
            top = $this.position().top;
            height = $(window).innerHeight() - top - 22;
            $this.outerHeight(height);
        });
    }

})(jQuery);

const createId = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

const Alert = {
    message: function (message, durationLenght) {
        let id = this.loading(message);
        this.finish(message, id, durationLenght);
    },
    loading: function (message) {
        var id = createId();
        let html = $('<div class="alert" id="' + id + '"><span>' + message + '</span></div>');
        $(document.body).append(html);
        html.css('left', -html.width() + 'px');
        html.animate({
            opacity: 1.0,
            left: 0
        }, 200);
        return id;
    },
    update: function (message, id) {
        $('#' + id).find('span').text(message);
    },
    finish: function (message, id, durationLenght) {
        $('#' + id).find('span').text(message);
        setInterval(function () {
            $('#' + id).animate({
                opacity: 0,
                left: -$('#' + id).width()
            }, 300, () => {
                $('#' + id).remove();
                clearInterval(this);
            });
        }, (typeof durationLenght === "number") ? durationLenght : 6000);
    },
    clear: function (id) {
        $('#' + id).animate({
            opacity: 0,
            left: -$('#' + id).width()
        }, 300, () => {
            $('#' + id).remove();
        });
    }
}

const getUrlSearch = function (id) {
    let urlParams = new URLSearchParams(window.location.search);
    if (typeof id === "string") {
        return urlParams.get(id);
    } else {
        let data = {};
        id.forEach((value) => {
            data[value] = urlParams.get(value);
        });
        return data;
    }
}