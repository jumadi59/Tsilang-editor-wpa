(function ($) {
    const rects = [];

    var constantX = (cursorX, target) => {
        return (cursorX > target.offsetLeft) && (cursorX < target.offsetLeft + target.offsetWidth)
    }
    var constantY = (cursorY, target) => {
        return (cursorY > target.offsetTop && cursorY < (target.offsetTop + target.offsetHeight))
    }

    $(document).mousedown((e) => {
        rects.forEach(value => {
            if (typeof value.noHideKeyKode === "number") {
                if (e.originalEvent.button === value.noHideKeyKode) {
                    return;
                }
            }
            var rectObject = $(value.rectObject);
            var isClose  = (typeof value.isAutoClose === "boolean")? value.isAutoClose : true;
            if (rectObject.hasClass('visible') && isClose) {
                var y = e.clientY + $(window).scrollTop();
                var x = e.clientX + $(window).scrollLeft();
                if (
                    (!(x > rectObject.offset().left) ||
                        !(x < rectObject.offset().left + rectObject.outerWidth())) ||
                    (!(y > rectObject.offset().top) ||
                        !(y < rectObject.offset().top + rectObject.outerHeight()))
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

    $(document).bind('contextmenu rightclick', function (e) {
        let filter = rects.filter(v => v.type === 'context_menu');
        var isShow = false;
        filter.forEach((value) => {
            let y = e.clientY + $(window).scrollTop();
            let x = e.clientX + $(window).scrollLeft();
            if (value.target) {
                $(value.target).each(function () {
                    let rect = {
                        offsetTop: $(this).position().top,
                        offsetLeft: $(this).position().left,
                        offsetHeight: this.offsetHeight,
                        offsetWidth: this.offsetWidth
                    }
                    if (constantX(x, rect) && constantY(y, rect)) {
                        $(value.rectObject)
                            .css('left', ($(this).offset().left + $(this).outerWidth() + 4))
                            .css('top', $(this).offset().top).visible();
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
        $(this).css('opacity', '0.0');
        if ($(this).hasClass('gone')) {
            $(this).removeClass('gone');
        } else {
            $(this).addClass('visible');
        }
        $(this).animate({
            opacity: 1.0
        }, 200);
        var find = rects.find(v => v.rectObject[0] === this[0]);
        if (find) {
            if (typeof find.show === "function" && find.type !== 'context_menu') {
                find.show.apply(this);
            }
        }
        return $(this);
    }

    $.fn.gone = function () {
        $(this).animate({
            opacity: 0.0
        }, 200, () => {
            if ($(this).hasClass('visible')) {
                $(this).removeClass('visible');
            } else {
                $(this).addClass('gone')
            }
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
            $(this).css('left', -($(this).width() - s.outerWidth() +4) + 'px');
        } else {
            $(this).css('right', -($(this).width() - s.outerWidth() +4) + 'px');
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
            noHideKeyKode: 2,
        });

        return $(this);
    }

    $.fn.dialog = function (ops) {
        var isMove = (typeof ops !== "undefined" && typeof ops.isMove === "boolean") ? ops.isMove : false;
        var isAutoClose = (typeof ops !== "undefined" && typeof ops.isAutoClose === "boolean") ? ops.isAutoClose : true;
        
        rects.push({
            type: 'dialog',
            rectObject: this,
            target: null,
            isAutoClose: isAutoClose,
            show: function() {
                let left = ($(window).width() - $(this).outerWidth()) / 2;
                let top = ($(window).height() - $(this).outerHeight()) / 2;
                $(this).css('left', left + 'px').css('top', top + 'px');
                if (typeof ops !== "undefined" && typeof ops.show === "function") {
                    ops.show.apply(this);
                }
            }
        });

        const root = $(this);
        const close = $(this).find('.dialog-close');
        close.animClick(function () {
            root.gone();
        });
        const header = $(this).find('.header');
        if (isMove) {
            header.css('cursor', 'move');
            var isDown = false;
            var positionStart = {
                x: 0,
                y: 0
            }
            header.mousedown(function (e) {
                isDown = true;
                root.css('z-index', (parseInt(root.css('z-index'))+2));
                positionStart = {
                    x: e.clientX,
                    y: e.clientY
                }
                
            });
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
                    isDown = false;
                    root.css('z-index', (parseInt()-1));
                }
            });
        }
        return $(this);
    }

    $.fn.initComponent = function (fn) {
        if (typeof fn === "function") {
            fn.apply(this);
        }
    }
})(jQuery);