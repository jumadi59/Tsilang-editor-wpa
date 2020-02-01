(function ($) {
    const rects = [];

    var constantX = (cursorX, target) => {
        return (cursorX > $(target).position().left) && (cursorX < $(target).position().left + target.offsetWidth)
    }
    var constantY = (cursorY, target) => {
        return (cursorY > $(target).position().top && cursorY < ($(target).position().top + target.offsetHeight))
    }

    var constantRect = (target, target2) => {
        if ($(target).position().left >= $(target2).position().left && ($(target).position().left + target.offsetWidth) <= ($(target2).position().left + target2.offsetWidth)) {
            if ($(target).position().top >= $(target2).position().top && ($(target).position().top + target.offsetHeight) <= ($(target2).position().top + target2.offsetHeight)) {
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
            var y = e.clientY + $(window).scrollTop();
            var x = e.clientX + $(window).scrollLeft();
            if (value.target) {
                $(value.target).each(function () {
                    if (constantRect(e.target, this)) {

                        if (value.positionCurcor) {
                            if ((x + $(value.rectObject).outerWidth() + 4) > window.innerWidth) {
                                x = x - $(value.rectObject).outerWidth() - 4;
                            }
                            if (y + $(value.rectObject).outerHeight() > window.innerHeight) {
                                y = y - $(value.rectObject).outerHeight();
                            }
                            
                            $(value.rectObject)
                                .css('left', x)
                                .css('top', y).visible();
                        } else {
                            var left = ($(this).offset().left + $(this).outerWidth() + 4);
                            var top = $(this).offset().top;
                            if (left + $(value.rectObject).outerWidth() > window.innerWidth) {
                                left = left - $(value.rectObject).outerWidth();
                            }
                            if ((top + $(value.rectObject).outerHeight()) >window.innerHeight) {
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
        $(this).css('opacity', '0.0');
        $(this).removeClass('gone');
        $(this).addClass('visible');
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
        var isMove = (typeof ops !== "undefined" && typeof ops.isMove === "boolean") ? ops.isMove : false;
        var isAutoClose = (typeof ops !== "undefined" && typeof ops.isAutoClose === "boolean") ? ops.isAutoClose : true;

        rects.push({
            type: 'dialog',
            rectObject: this,
            target: null,
            isAutoClose: isAutoClose,
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
        header.mousedown(function (e) {
            isDown = true;
            if (isMove) {
                header.css('cursor', 'move');
            }
            root.css('z-index', (parseInt(root.css('z-index')) + 2));
            positionStart = {
                x: e.clientX,
                y: e.clientY
            }

        });
        if (isMove) {
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
                    root.css('z-index', (parseInt() - 1));
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
})(jQuery);

const Alert = {
    message: function(message) {
        var $toastContent = $('<span>'+message+'</span>')
        .add($('<button class="btn-flat toast-action red-text" onClick="Materialize.Toast.removeAll();">Remove</button>'));
        Materialize.toast($toastContent, 6000);
    }
}

var Base64 = {
    // private property
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    // public method for encoding
    encode: function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = Base64._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
                Base64._keyStr.charAt(enc1) + Base64._keyStr.charAt(enc2) +
                Base64._keyStr.charAt(enc3) + Base64._keyStr.charAt(enc4);

        }

        return output;
    },

    // public method for decoding
    decode: function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = Base64._keyStr.indexOf(input.charAt(i++));
            enc2 = Base64._keyStr.indexOf(input.charAt(i++));
            enc3 = Base64._keyStr.indexOf(input.charAt(i++));
            enc4 = Base64._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

        }

        output = Base64._utf8_decode(output);

        return output;

    },

    // private method for UTF-8 encoding
    _utf8_encode: function (string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    },

    // private method for UTF-8 decoding
    _utf8_decode: function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;

        while (i < utftext.length) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            } else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            } else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }
        return string;
    }
}