var qsProxy = {};
function FrameBuilder(formId, appendTo, initialHeight, iframeCode, title, embedStyleJSON) {
    this.formId = formId;
    this.initialHeight = initialHeight;
    this.iframeCode = iframeCode;
    this.frame = null;
    this.timeInterval = 200;
    this.appendTo = appendTo || false;
    this.formSubmitted = 0;
    this.frameMinWidth = '100%';
    this.defaultHeight = '';
    this.init = function() {
        this.embedURLHash = this.getMD5(window.location.href);
        if (embedStyleJSON && (embedStyleJSON[this.embedURLHash] && embedStyleJSON[this.embedURLHash]['inlineStyle']['embedWidth'])) {
            this.frameMinWidth = embedStyleJSON[this.embedURLHash]['inlineStyle']['embedWidth'] + 'px';
        }
        if (embedStyleJSON && (embedStyleJSON[this.embedURLHash])) {
            if (embedStyleJSON[this.embedURLHash]['inlineStyle'] && embedStyleJSON[this.embedURLHash]['inlineStyle']['embedHeight']) {
                this.defaultHeight = 'data-frameHeight="' + embedStyleJSON[this.embedURLHash]['inlineStyle']['embedHeight'] + '"';
            }
        }
        this.createFrame();
        this.addFrameContent(this.iframeCode);
    };
    this.createFrame = function() {
        var tmp_is_ie = !!window.ActiveXObject;
        this.iframeDomId = document.getElementById(this.formId) ? this.formId + '_' + new Date().getTime() : this.formId;
        if (typeof $jot !== 'undefined') {
            var iframe = document.getElementById("80183972521154");
            var parent = $jot(iframe).closest('.jt-feedback.u-responsive-lightbox');
            if (parent) {
                this.iframeDomId = 'lightbox-' + this.iframeDomId;
            }
        }
        var htmlCode = "<" + "iframe title=\"" + title.replace(/[\\"']/g, '\\$&').replace(/&amp;/g, '&') + "\" src=\"\" allowtransparency=\"true\" allow=\"geolocation; microphone; camera\" allowfullscreen=\"true\" name=\"" + this.formId + "\" id=\"" + this.iframeDomId + "\" style=\"width: 10px; min-width:" + this.frameMinWidth + "; display: block; overflow: hidden; height:" + this.initialHeight + "px; border: none;\" scrolling=\"no\"" + this.defaultHeight + "></if" + "rame>";
        if (this.appendTo === false) {
            document.write(htmlCode);
        } else {
            var tmp = document.createElement('div');
            tmp.innerHTML = htmlCode;
            var a = this.appendTo;
            document.getElementById(a).appendChild(tmp.firstChild);
        }
        this.frame = document.getElementById(this.iframeDomId);
        if (tmp_is_ie === true) {
            try {
                var iframe = this.frame;
                var doc = iframe.contentDocument ? iframe.contentDocument : (iframe.contentWindow.document || iframe.document);
                doc.open();
                doc.write("");
            }
            catch (err) {
                this.frame.src = "javascript:void((function(){document.open();document.domain=\'" + this.getBaseDomain() + "\';document.close();})())";
            }
        }
        this.addEvent(this.frame, 'load', this.bindMethod(this.setTimer, this));
        var self = this;
        if (window.chrome !== undefined) {
            this.frame.onload = function() {
                try {
                    var doc = this.contentWindow.document;
                    var _jotform = this.contentWindow.JotForm;
                    if (doc !== undefined) {
                        var form = doc.getElementById("" + self.iframeDomId);
                        self.addEvent(form, "submit", function() {
                            if (_jotform.validateAll()) {
                                self.formSubmitted = 1;
                            }
                        });
                    }
                } catch (e) {}
            }
        }
    };
    this.addEvent = function(obj, type, fn) {
        if (obj.attachEvent) {
            obj["e" + type + fn] = fn;
            obj[type + fn] = function() {
                obj["e" + type + fn](window.event);
            };
            obj.attachEvent("on" + type, obj[type + fn]);
        }
        else {
            obj.addEventListener(type, fn, false);
        }
    };
    this.addFrameContent = function(string) {
        if (window.location.search && window.location.search.indexOf('disableSmartEmbed') > -1) {
            string = string.replace(new RegExp('smartEmbed=1(?:&amp;|&)'), '');
            string = string.replace(new RegExp('isSmartEmbed'), '');
        } else {
            var cssLink = 'stylebuilder/' + this.formId + '.css';
            var cssPlace = string.indexOf(cssLink);
            var prepend = string[cssPlace + cssLink.length] === '?' ? '&amp;' : '?';
            var embedUrl = prepend + 'embedUrl=' + window.location.href;
            if (cssPlace > -1) {
                var positionLastRequestElement = string.indexOf('\"/>', cssPlace);
                if (positionLastRequestElement > -1) {
                    string = string.substr(0, positionLastRequestElement) + embedUrl + string.substr(positionLastRequestElement);
                    string = string.replace(cssLink, 'stylebuilder/' + this.formId + '/' + this.embedURLHash + '.css');
                }
            }
        }
        string = string.replace(new RegExp('src\\=\\"[^"]*captcha.php\"><\/scr' + 'ipt>', 'gim'), 'src="http://api.recaptcha.net/js/recaptcha_ajax.js"></scr' + 'ipt><' + 'div id="recaptcha_div"><' + '/div>' + '<' + 'style>#recaptcha_logo{ display:none;} #recaptcha_tagline{display:none;} #recaptcha_table{border:none !important;} .recaptchatable .recaptcha_image_cell, #recaptcha_table{ background-color:transparent !important; } <' + '/style>' + '<' + 'script defer="defer"> window.onload = function(){ Recaptcha.create("6Ld9UAgAAAAAAMon8zjt30tEZiGQZ4IIuWXLt1ky", "recaptcha_div", {theme: "clean",tabindex: 0,callback: function (){' + 'if (document.getElementById("uword")) { document.getElementById("uword").parentNode.removeChild(document.getElementById("uword")); } if (window["validate"] !== undefined) { if (document.getElementById("recaptcha_response_field")){ document.getElementById("recaptcha_response_field").onblur = function(){ validate(document.getElementById("recaptcha_response_field"), "Required"); } } } if (document.getElementById("recaptcha_response_field")){ document.getElementsByName("recaptcha_challenge_field")[0].setAttribute("name", "anum"); } if (document.getElementById("recaptcha_response_field")){ document.getElementsByName("recaptcha_response_field")[0].setAttribute("name", "qCap"); }}})' + ' }<' + '/script>');
        string = string.replace(/(type="text\/javascript">)\s+(validate\(\"[^"]*"\);)/, '$1 jTime = setInterval(function(){if("validate" in window){$2clearTimeout(jTime);}}, 1000);');
        if (string.match('#sublabel_litemode')) {
            string = string.replace('class="form-all"', 'class="form-all" style="margin-top:0;"');
        }
        var iframe = this.frame;
        var doc = iframe.contentDocument ? iframe.contentDocument : (iframe.contentWindow.document || iframe.document);
        doc.open();
        doc.write(string);
        setTimeout(function() {
            doc.close();
            try {
                if ('JotFormFrameLoaded' in window) {
                    JotFormFrameLoaded();
                }
            } catch (e) {}
        }, 200);
    };
    this.setTimer = function() {
        var self = this;
        this.interval = setTimeout(this.changeHeight.bind(this), this.timeInterval);
    };
    this.getBaseDomain = function() {
        var thn = window.location.hostname;
        var cc = 0;
        var buff = "";
        for (var i = 0; i < thn.length; i++) {
            var chr = thn.charAt(i);
            if (chr == ".") {
                cc++;
            }
            if (cc == 0) {
                buff += chr;
            }
        }
        if (cc == 2) {
            thn = thn.replace(buff + ".", "");
        }
        return thn;
    }
    this.changeHeight = function() {
        var actualHeight = this.getBodyHeight();
        var currentHeight = this.getViewPortHeight();
        var skipAutoHeight = (this.frame.contentWindow) ? this.frame.contentWindow.document.querySelector('[data-welcome-view="true"]') : null;
        if (actualHeight === undefined) {
            this.frame.style.height = this.frameHeight;
            if (!this.frame.style.minHeight) {
                this.frame.style.minHeight = "100vh";
                if (!('nojump' in this.frame.contentWindow.document.get)) {
                    window.parent.scrollTo(0, 0);
                }
            } else if (!this.frame.dataset.parentScrolled) {
                this.frame.dataset.parentScrolled = true;
                var container = window.parent.document && window.parent.document.querySelector('.jt-content');
                if (container && !('nojump' in window.parent.document.get)) {
                    container.scrollTo(0, 0);
                }
            }
        } else if (Math.abs(actualHeight - currentHeight) > 18 && !skipAutoHeight) {
            this.frame.style.height = (actualHeight) + "px";
        }
        this.setTimer();
    };
    this.bindMethod = function(method, scope) {
        return function() {
            method.apply(scope, arguments);
        };
    };
    this.frameHeight = 0;
    this.getBodyHeight = function() {
        if (this.formSubmitted === 1) {
            return;
        }
        var height;
        var scrollHeight;
        var offsetHeight;
        try {
            if (this.frame.contentWindow.document.height) {
                height = this.frame.contentWindow.document.height;
                if (this.frame.contentWindow.document.body.scrollHeight) {
                    height = scrollHeight = this.frame.contentWindow.document.body.scrollHeight;
                }
                if (this.frame.contentWindow.document.body.offsetHeight) {
                    height = offsetHeight = this.frame.contentWindow.document.body.offsetHeight;
                }
            } else if (this.frame.contentWindow.document.body) {
                if (this.frame.contentWindow.document.body.offsetHeight) {
                    height = offsetHeight = this.frame.contentWindow.document.body.offsetHeight;
                }
                var formWrapper = this.frame.contentWindow.document.querySelector('.form-all');
                var margin = parseInt(getComputedStyle(formWrapper).marginTop, 10);
                if (!isNaN(margin)) {
                    height += margin;
                }
            }
        } catch (e) {}
        this.frameHeight = height;
        return height;
    };
    this.getViewPortHeight = function() {
        if (this.formSubmitted === 1) {
            return;
        }
        var height = 0;
        try {
            if (this.frame.contentWindow.window.innerHeight) {
                height = this.frame.contentWindow.window.innerHeight - 18;
            } else if ((this.frame.contentWindow.document.documentElement) && (this.frame.contentWindow.document.documentElement.clientHeight)) {
                height = this.frame.contentWindow.document.documentElement.clientHeight;
            } else if ((this.frame.contentWindow.document.body) && (this.frame.contentWindow.document.body.clientHeight)) {
                height = this.frame.contentWindow.document.body.clientHeight;
            }
        } catch (e) {}
        return height;
    };
    this.getMD5 = function(s) {
        function L(k, d) {
            return (k << d) | (k >>> (32 - d))
        }
        function K(G, k) {
            var I,
                d,
                F,
                H,
                x;
            F = (G & 2147483648);
            H = (k & 2147483648);
            I = (G & 1073741824);
            d = (k & 1073741824);
            x = (G & 1073741823) + (k & 1073741823);
            if (I & d) {
                return ( x ^ 2147483648 ^ F ^ H)
            }
            if (I | d) {
                if (x & 1073741824) {
                    return ( x ^ 3221225472 ^ F ^ H)
                } else {
                    return ( x ^ 1073741824 ^ F ^ H)
                }
            } else {
                return ( x ^ F ^ H)
            }
        }
        function r(d, F, k) {
            return (d & F) | ((~d) & k)
        }
        function q(d, F, k) {
            return (d & k) | (F & (~k))
        }
        function p(d, F, k) {
            return ( d ^ F ^ k)
        }
        function n(d, F, k) {
            return ( F ^ (d | (~k)))
        }
        function u(G, F, aa, Z, k, H, I) {
            G = K(G, K(K(r(F, aa, Z), k), I));
            return K(L(G, H), F)
        }
        function f(G, F, aa, Z, k, H, I) {
            G = K(G, K(K(q(F, aa, Z), k), I));
            return K(L(G, H), F)
        }
        function D(G, F, aa, Z, k, H, I) {
            G = K(G, K(K(p(F, aa, Z), k), I));
            return K(L(G, H), F)
        }
        function t(G, F, aa, Z, k, H, I) {
            G = K(G, K(K(n(F, aa, Z), k), I));
            return K(L(G, H), F)
        }
        function e(G) {
            var Z;
            var F = G.length;
            var x = F + 8;
            var k = (x - (x % 64)) / 64;
            var I = (k + 1) * 16;
            var aa = Array(I - 1);
            var d = 0;
            var H = 0;
            while (H < F) {
                Z = (H - (H % 4)) / 4;
                d = (H % 4) * 8;
                aa[Z] = (aa[Z] | (G.charCodeAt(H) << d));
                H++
            }
            Z = (H - (H % 4)) / 4;
            d = (H % 4) * 8;
            aa[Z] = aa[Z] | (128 << d);
            aa[I - 2] = F << 3;
            aa[I - 1] = F >>> 29;
            return aa
        }
        function B(x) {
            var k = "",
                F = "",
                G,
                d;
            for (d = 0; d <= 3; d++) {
                G = (x >>> (d * 8)) & 255;
                F = "0" + G.toString(16);
                k = k + F.substr(F.length - 2, 2)
            }
            return k
        }
        function J(k) {
            k = k.replace(/rn/g, "n");
            var d = "";
            for (var F = 0; F < k.length; F++) {
                var x = k.charCodeAt(F);
                if (x < 128) {
                    d += String.fromCharCode(x)
                } else {
                    if ((x > 127) && (x < 2048)) {
                        d += String.fromCharCode((x >> 6) | 192);
                        d += String.fromCharCode((x & 63) | 128)
                    } else {
                        d += String.fromCharCode((x >> 12) | 224);
                        d += String.fromCharCode(((x >> 6) & 63) | 128);
                        d += String.fromCharCode((x & 63) | 128)
                    }
                }
            }
            return d
        }
        var C = Array();
        var P,
            h,
            E,
            v,
            g,
            Y,
            X,
            W,
            V;
        var S = 7,
            Q = 12,
            N = 17,
            M = 22;
        var A = 5,
            z = 9,
            y = 14,
            w = 20;
        var o = 4,
            m = 11,
            l = 16,
            j = 23;
        var U = 6,
            T = 10,
            R = 15,
            O = 21;
        s = J(s);
        C = e(s);
        Y = 1732584193;
        X = 4023233417;
        W = 2562383102;
        V = 271733878;
        for (P = 0; P < C.length; P += 16) {
            h = Y;
            E = X;
            v = W;
            g = V;
            Y = u(Y, X, W, V, C[P + 0], S, 3614090360);
            V = u(V, Y, X, W, C[P + 1], Q, 3905402710);
            W = u(W, V, Y, X, C[P + 2], N, 606105819);
            X = u(X, W, V, Y, C[P + 3], M, 3250441966);
            Y = u(Y, X, W, V, C[P + 4], S, 4118548399);
            V = u(V, Y, X, W, C[P + 5], Q, 1200080426);
            W = u(W, V, Y, X, C[P + 6], N, 2821735955);
            X = u(X, W, V, Y, C[P + 7], M, 4249261313);
            Y = u(Y, X, W, V, C[P + 8], S, 1770035416);
            V = u(V, Y, X, W, C[P + 9], Q, 2336552879);
            W = u(W, V, Y, X, C[P + 10], N, 4294925233);
            X = u(X, W, V, Y, C[P + 11], M, 2304563134);
            Y = u(Y, X, W, V, C[P + 12], S, 1804603682);
            V = u(V, Y, X, W, C[P + 13], Q, 4254626195);
            W = u(W, V, Y, X, C[P + 14], N, 2792965006);
            X = u(X, W, V, Y, C[P + 15], M, 1236535329);
            Y = f(Y, X, W, V, C[P + 1], A, 4129170786);
            V = f(V, Y, X, W, C[P + 6], z, 3225465664);
            W = f(W, V, Y, X, C[P + 11], y, 643717713);
            X = f(X, W, V, Y, C[P + 0], w, 3921069994);
            Y = f(Y, X, W, V, C[P + 5], A, 3593408605);
            V = f(V, Y, X, W, C[P + 10], z, 38016083);
            W = f(W, V, Y, X, C[P + 15], y, 3634488961);
            X = f(X, W, V, Y, C[P + 4], w, 3889429448);
            Y = f(Y, X, W, V, C[P + 9], A, 568446438);
            V = f(V, Y, X, W, C[P + 14], z, 3275163606);
            W = f(W, V, Y, X, C[P + 3], y, 4107603335);
            X = f(X, W, V, Y, C[P + 8], w, 1163531501);
            Y = f(Y, X, W, V, C[P + 13], A, 2850285829);
            V = f(V, Y, X, W, C[P + 2], z, 4243563512);
            W = f(W, V, Y, X, C[P + 7], y, 1735328473);
            X = f(X, W, V, Y, C[P + 12], w, 2368359562);
            Y = D(Y, X, W, V, C[P + 5], o, 4294588738);
            V = D(V, Y, X, W, C[P + 8], m, 2272392833);
            W = D(W, V, Y, X, C[P + 11], l, 1839030562);
            X = D(X, W, V, Y, C[P + 14], j, 4259657740);
            Y = D(Y, X, W, V, C[P + 1], o, 2763975236);
            V = D(V, Y, X, W, C[P + 4], m, 1272893353);
            W = D(W, V, Y, X, C[P + 7], l, 4139469664);
            X = D(X, W, V, Y, C[P + 10], j, 3200236656);
            Y = D(Y, X, W, V, C[P + 13], o, 681279174);
            V = D(V, Y, X, W, C[P + 0], m, 3936430074);
            W = D(W, V, Y, X, C[P + 3], l, 3572445317);
            X = D(X, W, V, Y, C[P + 6], j, 76029189);
            Y = D(Y, X, W, V, C[P + 9], o, 3654602809);
            V = D(V, Y, X, W, C[P + 12], m, 3873151461);
            W = D(W, V, Y, X, C[P + 15], l, 530742520);
            X = D(X, W, V, Y, C[P + 2], j, 3299628645);
            Y = t(Y, X, W, V, C[P + 0], U, 4096336452);
            V = t(V, Y, X, W, C[P + 7], T, 1126891415);
            W = t(W, V, Y, X, C[P + 14], R, 2878612391);
            X = t(X, W, V, Y, C[P + 5], O, 4237533241);
            Y = t(Y, X, W, V, C[P + 12], U, 1700485571);
            V = t(V, Y, X, W, C[P + 3], T, 2399980690);
            W = t(W, V, Y, X, C[P + 10], R, 4293915773);
            X = t(X, W, V, Y, C[P + 1], O, 2240044497);
            Y = t(Y, X, W, V, C[P + 8], U, 1873313359);
            V = t(V, Y, X, W, C[P + 15], T, 4264355552);
            W = t(W, V, Y, X, C[P + 6], R, 2734768916);
            X = t(X, W, V, Y, C[P + 13], O, 1309151649);
            Y = t(Y, X, W, V, C[P + 4], U, 4149444226);
            V = t(V, Y, X, W, C[P + 11], T, 3174756917);
            W = t(W, V, Y, X, C[P + 2], R, 718787259);
            X = t(X, W, V, Y, C[P + 9], O, 3951481745);
            Y = K(Y, h);
            X = K(X, E);
            W = K(W, v);
            V = K(V, g)
        }
        var i = B(Y) + B(X) + B(W) + B(V);
        return i.toLowerCase()
    };
    this.init();
}
FrameBuilder.get = qsProxy || [];
var i80183972521154 = new FrameBuilder("80183972521154", false, "", "<!DOCTYPE HTML PUBLIC \"-\/\/W3C\/\/DTD HTML 4.01\/\/EN\" \"http:\/\/www.w3.org\/TR\/html4\/strict.dtd\">\n<html class=\"supernova\"><head><script>console.warn(\"Server Side Rendering => render-from: frontend\");<\/script>\n<meta http-equiv=\"Content-Type\" content=\"text\/html; charset=utf-8\" \/>\n<link rel=\"alternate\" type=\"application\/json+oembed\" href=\"https:\/\/www.jotform.com\/oembed\/?format=json&amp;url=https%3A%2F%2Fform.jotform.com%2F80183972521154\" title=\"oEmbed Form\">\n<link rel=\"alternate\" type=\"text\/xml+oembed\" href=\"https:\/\/www.jotform.com\/oembed\/?format=xml&amp;url=https%3A%2F%2Fform.jotform.com%2F80183972521154\" title=\"oEmbed Form\">\n<meta property=\"og:title\" content=\"Law Day 5K Contact Form\" >\n<meta property=\"og:url\" content=\"https:\/\/form.jotform.us\/80183972521154\" >\n<meta property=\"og:description\" content=\"Please click the link to complete this form.\" >\n<meta name=\"slack-app-id\" content=\"AHNMASS8M\">\n<link rel=\"shortcut icon\" href=\"https:\/\/cdn.jotfor.ms\/assets\/img\/favicons\/favicon-2021.svg\">\n<meta property=\"og:image\" content=\"https:\/\/cdn.jotfor.ms\/assets\/img\/favicons\/favicon-2021.svg\" \/>\n<link rel=\"canonical\" href=\"https:\/\/form.jotform.us\/80183972521154\" \/>\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, maximum-scale=2.0, user-scalable=1\" \/>\n<meta name=\"HandheldFriendly\" content=\"true\" \/>\n<title>Law Day 5K Contact Form<\/title>\n<link href=\"https:\/\/cdn01.jotfor.ms\/static\/formCss.css?3.3.36479\" rel=\"stylesheet\" type=\"text\/css\" \/>\n<style type=\"text\/css\">@media print{.form-section{display:inline!important}.form-pagebreak{display:none!important}.form-section-closed{height:auto!important}.page-section{position:initial!important}}<\/style>\n<link type=\"text\/css\" rel=\"stylesheet\" href=\"https:\/\/cdn02.jotfor.ms\/css\/styles\/nova.css?3.3.36479\" \/>\n<link type=\"text\/css\" rel=\"stylesheet\" href=\"https:\/\/cdn03.jotfor.ms\/themes\/CSS\/566a91c2977cdfcd478b4567.css?themeRevisionID=58c6459d9a11c7136a8b4567\"\/>\n<link type=\"text\/css\" rel=\"stylesheet\" href=\"https:\/\/cdn01.jotfor.ms\/css\/styles\/payment\/payment_feature.css?3.3.36479\" \/>\n<style type=\"text\/css\">\n    .form-label-left{\n        width:150px;\n    }\n    .form-line{\n        padding-top:12px;\n        padding-bottom:12px;\n    }\n    .form-label-right{\n        width:150px;\n    }\n    body, html{\n        margin:0;\n        padding:0;\n        background:#fa6f6f;\n    }\n\n    .form-all{\n        margin:0px auto;\n        padding-top:0px;\n        width:480px;\n        color:#fcfcfc !important;\n        font-family:'Roboto';\n        font-size:14px;\n    }\n    .form-radio-item label, .form-checkbox-item label, .form-grading-label, .form-header{\n        color: #0070B5;\n    }\n\n<\/style>\n\n<style type=\"text\/css\" id=\"form-designer-style\">\n    \/* Injected CSS Code *\/\n@import \"https:\/\/fonts.googleapis.com\/css?family=Roboto:light,lightitalic,normal,italic,bold,bolditalic\";\n@import \"\/\/www.jotform.com\/themes\/css\/buttons\/form-submit-button-simple_red.css\";\n.form-all:after {\n  content: \"\";\n  display: table;\n  clear: both;\n}\n.form-all {\n  font-family: \"Roboto\", sans-serif;\n}\n.form-all {\n  width: 480px;\n}\n.form-label-left,\n.form-label-right {\n  width: 150px;\n}\n.form-label {\n  white-space: normal;\n}\n.form-label.form-label-auto {\n  display: inline-block;\n  float: left;\n  text-align: left;\n  width: 150px;\n}\n.form-label-left {\n  display: inline-block;\n  white-space: normal;\n  float: left;\n  text-align: left;\n}\n.form-label-right {\n  display: inline-block;\n  white-space: normal;\n  float: left;\n  text-align: right;\n}\n.form-label-top {\n  white-space: normal;\n  display: block;\n  float: none;\n  text-align: left;\n}\n.form-radio-item label:before {\n  top: 0;\n}\n.form-all {\n  font-size: 14px;\n}\n.form-label {\n  font-weight: normal;\n  font-size: 0.95em;\n}\n.supernova {\n  background-color: #fa6f6f;\n  background-color: #d1f2a5;\n}\n.supernova body {\n  background-color: transparent;\n}\n\/*\n@width30: (unit(@formWidth, px) + 60px);\n@width60: (unit(@formWidth, px)+ 120px);\n@width90: (unit(@formWidth, px)+ 180px);\n*\/\n\/* | *\/\n@media screen and (min-width: 480px) {\n  .supernova .form-all {\n    border: 1px solid #baec78;\n    -webkit-box-shadow: 0 3px 9px rgba(0, 0, 0, 0.1);\n    -moz-box-shadow: 0 3px 9px rgba(0, 0, 0, 0.1);\n    box-shadow: 0 3px 9px rgba(0, 0, 0, 0.1);\n  }\n}\n\/* | *\/\n\/* | *\/\n@media screen and (max-width: 480px) {\n  .jotform-form .form-all {\n    margin: 0;\n    width: 100%;\n  }\n}\n\/* | *\/\n\/* | *\/\n@media screen and (min-width: 480px) and (max-width: 767px) {\n  .jotform-form .form-all {\n    margin: 0;\n    width: 100%;\n  }\n}\n\/* | *\/\n\/* | *\/\n@media screen and (min-width: 480px) and (max-width: 479px) {\n  .jotform-form .form-all {\n    margin: 0;\n    width: 100%;\n  }\n}\n\/* | *\/\n\/* | *\/\n@media screen and (min-width: 768px) {\n  .jotform-form {\n    padding: 60px 0;\n  }\n}\n\/* | *\/\n\/* | *\/\n@media screen and (max-width: 479px) {\n  .jotform-form .form-all {\n    margin: 0;\n    width: 100%;\n  }\n}\n\/* | *\/\n.supernova .form-all,\n.form-all {\n  background-color: #fa6f6f;\n  border: 1px solid transparent;\n}\n.form-header-group {\n  border-color: #f83e3e;\n}\n.form-matrix-table tr {\n  border-color: #f83e3e;\n}\n.form-matrix-table tr:nth-child(2n) {\n  background-color: #f95656;\n}\n.form-all {\n  color: #fcfcfc;\n}\n.form-header-group .form-header {\n  color: #fcfcfc;\n}\n.form-header-group .form-subHeader {\n  color: #ffffff;\n}\n.form-sub-label {\n  color: #ffffff;\n}\n.form-label-top,\n.form-label-left,\n.form-label-right,\n.form-html {\n  color: #ffffff;\n}\n.form-checkbox-item label,\n.form-radio-item label {\n  color: #fcfcfc;\n}\n.form-line.form-line-active {\n  -webkit-transition-property: all;\n  -moz-transition-property: all;\n  -ms-transition-property: all;\n  -o-transition-property: all;\n  transition-property: all;\n  -webkit-transition-duration: 0.3s;\n  -moz-transition-duration: 0.3s;\n  -ms-transition-duration: 0.3s;\n  -o-transition-duration: 0.3s;\n  transition-duration: 0.3s;\n  -webkit-transition-timing-function: ease;\n  -moz-transition-timing-function: ease;\n  -ms-transition-timing-function: ease;\n  -o-transition-timing-function: ease;\n  transition-timing-function: ease;\n  background-color: rgba(255, 255, 224, 0);\n}\n\/* omer *\/\n.form-radio-item,\n.form-checkbox-item {\n  padding-bottom: 4px !important;\n}\n.form-radio-item:last-child,\n.form-checkbox-item:last-child {\n  padding-bottom: 0;\n}\n\/* omer *\/\n.form-single-column .form-checkbox-item,\n.form-single-column .form-radio-item {\n  width: 100%;\n}\n.form-radio-item:not(#foo) {\n  margin-bottom: 0;\n  position: relative;\n}\n.form-radio-item:not(#foo) input[type=\"checkbox\"],\n.form-radio-item:not(#foo) input[type=\"radio\"] {\n  display: none;\n}\n.form-radio-item:not(#foo) .form-radio-other,\n.form-radio-item:not(#foo) .form-checkbox-other {\n  display: inline-block !important;\n  margin-left: 7px;\n  margin-right: 3px;\n  margin-top: 4px;\n}\n.form-radio-item:not(#foo) .form-checkbox-other-input,\n.form-radio-item:not(#foo) .form-radio-other-input {\n  margin: 0;\n}\n.form-radio-item:not(#foo) label {\n  line-height: 18px;\n  margin-left: 0;\n  float: left;\n  text-indent: 27px;\n}\n.form-radio-item:not(#foo) label:before {\n  content: '';\n  position: absolute;\n  display: inline-block;\n  vertical-align: baseline;\n  margin-right: 4px;\n  -moz-box-sizing: border-box;\n  -webkit-box-sizing: border-box;\n  box-sizing: border-box;\n  -webkit-border-radius: 50%;\n  -moz-border-radius: 50%;\n  border-radius: 50%;\n  left: 4px;\n  width: 18px;\n  height: 18px;\n  cursor: pointer;\n}\n.form-radio-item:not(#foo) label:after {\n  content: '';\n  position: absolute;\n  z-index: 10;\n  display: inline-block;\n  opacity: 0;\n  top: 5px;\n  left: 9px;\n  width: 8px;\n  height: 8px;\n}\n.form-radio-item:not(#foo) input:checked + label:after {\n  opacity: 1;\n}\n.form-radio-item:not(#foo) input[type=\"checkbox\"],\n.form-radio-item:not(#foo) input[type=\"radio\"] {\n  display: none;\n}\n.form-radio-item:not(#foo) .form-radio-other,\n.form-radio-item:not(#foo) .form-checkbox-other {\n  display: inline-block !important;\n  margin-left: 7px;\n  margin-right: 3px;\n  margin-top: 4px;\n}\n.form-radio-item:not(#foo) .form-checkbox-other-input,\n.form-radio-item:not(#foo) .form-radio-other-input {\n  margin: 0;\n}\n.form-radio-item:not(#foo) label {\n  line-height: 24px;\n  margin-left: 0;\n  float: left;\n  text-indent: 33px;\n}\n.form-radio-item:not(#foo) label:before {\n  content: '';\n  position: absolute;\n  display: inline-block;\n  vertical-align: baseline;\n  margin-right: 4px;\n  -moz-box-sizing: border-box;\n  -webkit-box-sizing: border-box;\n  box-sizing: border-box;\n  -webkit-border-radius: 50%;\n  -moz-border-radius: 50%;\n  border-radius: 50%;\n  left: 4px;\n  width: 24px;\n  height: 24px;\n  cursor: pointer;\n}\n.form-radio-item:not(#foo) label:after {\n  content: '';\n  position: absolute;\n  z-index: 10;\n  display: inline-block;\n  opacity: 0;\n  top: 7px;\n  left: 11px;\n  width: 10px;\n  height: 10px;\n}\n.form-radio-item:not(#foo) input:checked + label:after {\n  opacity: 1;\n}\n.form-radio-item:not(#foo) label:before {\n  border: 2px solid #0070b5;\n}\n.form-radio-item:not(#foo) label:after {\n  background-color: #0070b5;\n  -webkit-border-radius: 50%;\n  -moz-border-radius: 50%;\n  border-radius: 50%;\n  cursor: pointer;\n}\n.form-checkbox-item:not(#foo) {\n  margin-bottom: 0;\n  position: relative;\n}\n.form-checkbox-item:not(#foo) input[type=\"checkbox\"],\n.form-checkbox-item:not(#foo) input[type=\"radio\"] {\n  display: none;\n}\n.form-checkbox-item:not(#foo) .form-radio-other,\n.form-checkbox-item:not(#foo) .form-checkbox-other {\n  display: inline-block !important;\n  margin-left: 7px;\n  margin-right: 3px;\n  margin-top: 4px;\n}\n.form-checkbox-item:not(#foo) .form-checkbox-other-input,\n.form-checkbox-item:not(#foo) .form-radio-other-input {\n  margin: 0;\n}\n.form-checkbox-item:not(#foo) label {\n  line-height: 18px;\n  margin-left: 0;\n  float: left;\n  text-indent: 27px;\n}\n.form-checkbox-item:not(#foo) label:before {\n  content: '';\n  position: absolute;\n  display: inline-block;\n  vertical-align: baseline;\n  margin-right: 4px;\n  -moz-box-sizing: border-box;\n  -webkit-box-sizing: border-box;\n  box-sizing: border-box;\n  -webkit-border-radius: 50%;\n  -moz-border-radius: 50%;\n  border-radius: 50%;\n  left: 4px;\n  width: 18px;\n  height: 18px;\n  cursor: pointer;\n}\n.form-checkbox-item:not(#foo) label:after {\n  content: '';\n  position: absolute;\n  z-index: 10;\n  display: inline-block;\n  opacity: 0;\n  top: 8px;\n  left: 9px;\n  width: 3px;\n  height: 3px;\n}\n.form-checkbox-item:not(#foo) input:checked + label:after {\n  opacity: 1;\n}\n.form-checkbox-item:not(#foo) label:before {\n  border: 2px solid #0070b5;\n}\n.form-checkbox-item:not(#foo) label:after {\n  background-color: #0070b5;\n  box-shadow: 0 2px 0 0 #0070b5, 2px 2px 0 0 #0070b5, 4px 2px 0 0 #0070b5, 6px 2px 0 0 #0070b5;\n  -moz-transform: rotate(-45deg);\n  -webkit-transform: rotate(-45deg);\n  -o-transform: rotate(-45deg);\n  -ms-transform: rotate(-45deg);\n  transform: rotate(-45deg);\n}\n.form-checkbox-item:not(#foo) input[type=\"checkbox\"],\n.form-checkbox-item:not(#foo) input[type=\"radio\"] {\n  display: none;\n}\n.form-checkbox-item:not(#foo) .form-radio-other,\n.form-checkbox-item:not(#foo) .form-checkbox-other {\n  display: inline-block !important;\n  margin-left: 7px;\n  margin-right: 3px;\n  margin-top: 4px;\n}\n.form-checkbox-item:not(#foo) .form-checkbox-other-input,\n.form-checkbox-item:not(#foo) .form-radio-other-input {\n  margin: 0;\n}\n.form-checkbox-item:not(#foo) label {\n  line-height: 24px;\n  margin-left: 0;\n  float: left;\n  text-indent: 33px;\n}\n.form-checkbox-item:not(#foo) label:before {\n  content: '';\n  position: absolute;\n  display: inline-block;\n  vertical-align: baseline;\n  margin-right: 4px;\n  -moz-box-sizing: border-box;\n  -webkit-box-sizing: border-box;\n  box-sizing: border-box;\n  -webkit-border-radius: 50%;\n  -moz-border-radius: 50%;\n  border-radius: 50%;\n  left: 4px;\n  width: 24px;\n  height: 24px;\n  cursor: pointer;\n}\n.form-checkbox-item:not(#foo) label:after {\n  content: '';\n  position: absolute;\n  z-index: 10;\n  display: inline-block;\n  opacity: 0;\n  top: 11px;\n  left: 10px;\n  width: 4px;\n  height: 4px;\n}\n.form-checkbox-item:not(#foo) input:checked + label:after {\n  opacity: 1;\n}\n.form-checkbox-item:not(#foo) label:after {\n  background-color: #0070b5;\n  box-shadow: 0 3px 0 0 #0070b5, 3px 3px 0 0 #0070b5, 6px 3px 0 0 #0070b5, 8px 3px 0 0 #0070b5;\n  -moz-transform: rotate(-45deg);\n  -webkit-transform: rotate(-45deg);\n  -o-transform: rotate(-45deg);\n  -ms-transform: rotate(-45deg);\n  transform: rotate(-45deg);\n}\n.supernova {\n  height: 100%;\n  background-repeat: no-repeat;\n  background-attachment: scroll;\n  background-position: center top;\n  background-repeat: repeat;\n}\n.supernova {\n  background-image: none;\n}\n#stage {\n  background-image: none;\n}\n\/* | *\/\n.form-all {\n  background-repeat: no-repeat;\n  background-attachment: scroll;\n  background-position: center top;\n  background-size: cover;\n}\n.form-header-group {\n  background-repeat: no-repeat;\n  background-attachment: scroll;\n  background-position: center top;\n}\n.form-line {\n  margin-top: 12px;\n  margin-bottom: 12px;\n}\n.form-line {\n  padding: 12px 36px;\n}\n.form-all .form-submit-button,\n.form-all .form-submit-reset,\n.form-all .form-submit-print {\n  -webkit-border-radius: 100px;\n  -moz-border-radius: 100px;\n  border-radius: 100px;\n}\n.form-all .form-sub-label {\n  margin-left: 3px;\n}\n.form-all {\n  -webkit-border-radius: 6px;\n  -moz-border-radius: 6px;\n  border-radius: 6px;\n}\n.form-section:first-child {\n  -webkit-border-radius: 6px 6px 0 0;\n  -moz-border-radius: 6px 6px 0 0;\n  border-radius: 6px 6px 0 0;\n}\n.form-section:last-child {\n  -webkit-border-radius: 0 0 6px 6px;\n  -moz-border-radius: 0 0 6px 6px;\n  border-radius: 0 0 6px 6px;\n}\n.form-all .qq-upload-button,\n.form-all .form-submit-button,\n.form-all .form-submit-reset,\n.form-all .form-submit-print {\n  font-size: 1em;\n  padding: 9px 15px;\n  font-family: \"Roboto\", sans-serif;\n  font-size: 16px;\n  font-weight: normal;\n}\n.form-all .form-pagebreak-back,\n.form-all .form-pagebreak-next {\n  font-size: 1em;\n  padding: 9px 15px;\n  font-family: \"Roboto\", sans-serif;\n  font-size: 14px;\n  font-weight: normal;\n}\n\/*\n& when ( @buttonFontType = google ) {\n\t@import (css) \"@{buttonFontLink}\";\n}\n*\/\nh2.form-header {\n  line-height: 1.618em;\n  font-size: 1.714em;\n}\nh2 ~ .form-subHeader {\n  line-height: 1.5em;\n  font-size: 1.071em;\n}\n.form-header-group {\n  text-align: center;\n}\n\/*.form-dropdown,\n.form-radio-item,\n.form-checkbox-item,\n.form-radio-other-input,\n.form-checkbox-other-input,*\/\n.form-captcha input,\n.form-spinner input,\n.form-error-message {\n  padding: 4px 3px 2px 3px;\n}\n.form-header-group {\n  font-family: \"Roboto\", sans-serif;\n}\n.form-section {\n  padding: 0px 0px 0px 0px;\n}\n.form-header-group {\n  margin: 12px 0px 12px 0px;\n}\n.form-header-group {\n  padding: 24px 36px 24px 36px;\n}\n.form-header-group .form-header,\n.form-header-group .form-subHeader {\n  color: #ffffff;\n}\n.form-textbox,\n.form-textarea {\n  border-color: #ffffff;\n  padding: 4px 3px 2px 3px;\n}\n.form-textbox,\n.form-textarea,\n.form-radio-other-input,\n.form-checkbox-other-input,\n.form-captcha input,\n.form-spinner input {\n  background-color: #ffffff;\n}\n.form-dropdown {\n  border-color: #ffffff;\n  -webkit-appearance: menulist-button;\n  background-color: rgba(248, 248, 248, 0);\n}\n[data-type=\"control_dropdown\"] .form-input,\n[data-type=\"control_dropdown\"] .form-input-wide {\n  width: 150px;\n}\n.form-buttons-wrapper {\n  margin-left: 0 !important;\n  text-align: center;\n}\n.form-header-group {\n  border-bottom: none;\n}\n.form-label {\n  font-family: \"Roboto\", sans-serif;\n}\nli[data-type=\"control_image\"] div {\n  text-align: left;\n}\nli[data-type=\"control_image\"] img {\n  border: none;\n  border-width: 0px !important;\n  border-style: solid !important;\n  border-color: false !important;\n}\n.form-line-column {\n  width: auto;\n}\n.form-line-error {\n  background-color: #fa6f6f;\n  -webkit-box-shadow: inset 0px 3px 11px -7px #ff3200;\n  -moz-box-shadow: inset 0px 3px 11px -7px #ff3200;\n  box-shadow: inset 0px 3px 11px -7px #ff3200;\n}\n.form-line-error input:not(#coupon-input),\n.form-line-error textarea,\n.form-line-error .form-validation-error {\n  -webkit-transition-property: none;\n  -moz-transition-property: none;\n  -ms-transition-property: none;\n  -o-transition-property: none;\n  transition-property: none;\n  -webkit-transition-duration: 0.3s;\n  -moz-transition-duration: 0.3s;\n  -ms-transition-duration: 0.3s;\n  -o-transition-duration: 0.3s;\n  transition-duration: 0.3s;\n  -webkit-transition-timing-function: ease;\n  -moz-transition-timing-function: ease;\n  -ms-transition-timing-function: ease;\n  -o-transition-timing-function: ease;\n  transition-timing-function: ease;\n  border: 1px solid #fff4f4;\n  -moz-box-shadow: 0 0 3px #fff4f4;\n  -webkit-box-shadow: 0 0 3px #fff4f4;\n  box-shadow: 0 0 3px #fff4f4;\n}\n.form-line-error .form-error-message {\n  margin: 0;\n  position: absolute;\n  color: #fff;\n  display: inline-block;\n  right: 0;\n  font-size: 10px;\n  position: absolute!important;\n  box-shadow: none;\n  top: 0px;\n  line-height: 20px;\n  color: #FFF;\n  background: #ff3200;\n  padding: 0px 5px;\n  bottom: auto;\n  min-width: 105px;\n  -webkit-border-radius: 0;\n  -moz-border-radius: 0;\n  border-radius: 0;\n}\n.form-line-error .form-error-message img,\n.form-line-error .form-error-message .form-error-arrow {\n  display: none;\n}\n.ie-8 .form-all {\n  margin-top: auto;\n  margin-top: initial;\n}\n.ie-8 .form-all:before {\n  display: none;\n}\n[data-type=\"control_clear\"] {\n  display: none;\n}\n\/* | *\/\n@media screen and (max-width: 480px), screen and (max-device-width: 767px) and (orientation: portrait), screen and (max-device-width: 415px) and (orientation: landscape) {\n  .testOne {\n    letter-spacing: 0;\n  }\n  .form-all {\n    border: 0;\n    max-width: initial;\n  }\n  .form-sub-label-container {\n    width: 100%;\n    margin: 0;\n    margin-right: 0;\n    float: left;\n    -moz-box-sizing: border-box;\n    -webkit-box-sizing: border-box;\n    box-sizing: border-box;\n  }\n  span.form-sub-label-container + span.form-sub-label-container {\n    margin-right: 0;\n  }\n  .form-sub-label {\n    white-space: normal;\n  }\n  .form-address-table td,\n  .form-address-table th {\n    padding: 0 1px 10px;\n  }\n  .form-submit-button,\n  .form-submit-print,\n  .form-submit-reset {\n    width: 100%;\n    margin-left: 0!important;\n  }\n  div[id*=at_] {\n    font-size: 14px;\n    font-weight: 700;\n    height: 8px;\n    margin-top: 6px;\n  }\n  .showAutoCalendar {\n    width: 20px;\n  }\n  img.form-image {\n    max-width: 100%;\n    height: auto;\n  }\n  .form-matrix-row-headers {\n    width: 100%;\n    word-break: break-all;\n    min-width: 40px;\n  }\n  .form-collapse-table,\n  .form-header-group {\n    margin: 0;\n  }\n  .form-collapse-table {\n    height: 100%;\n    display: inline-block;\n    width: 100%;\n  }\n  .form-collapse-hidden {\n    display: none !important;\n  }\n  .form-input {\n    width: 100%;\n  }\n  .form-label {\n    width: 100% !important;\n  }\n  .form-label-left,\n  .form-label-right {\n    display: block;\n    float: none;\n    text-align: left;\n    width: auto!important;\n  }\n  .form-line,\n  .form-line.form-line-column {\n    padding: 2% 5%;\n    -moz-box-sizing: border-box;\n    -webkit-box-sizing: border-box;\n    box-sizing: border-box;\n  }\n  input[type=text],\n  input[type=email],\n  input[type=tel],\n  textarea {\n    width: 100%;\n    -moz-box-sizing: border-box;\n    -webkit-box-sizing: border-box;\n    box-sizing: border-box;\n    max-width: initial !important;\n  }\n  .form-dropdown,\n  .form-textarea,\n  .form-textbox {\n    width: 100%!important;\n    -moz-box-sizing: border-box;\n    -webkit-box-sizing: border-box;\n    box-sizing: border-box;\n  }\n  .form-input,\n  .form-input-wide,\n  .form-textarea,\n  .form-textbox,\n  .form-dropdown {\n    max-width: initial!important;\n  }\n  .form-address-city,\n  .form-address-line,\n  .form-address-postal,\n  .form-address-state,\n  .form-address-table,\n  .form-address-table .form-sub-label-container,\n  .form-address-table select,\n  .form-input {\n    width: 100%;\n  }\n  div.form-header-group {\n    padding: 24px 36px !important;\n    padding-left: 5%!important;\n    padding-right: 5%!important;\n    margin: 0 12px 2% !important;\n    -moz-box-sizing: border-box;\n    -webkit-box-sizing: border-box;\n    box-sizing: border-box;\n  }\n  div.form-header-group.hasImage img {\n    max-width: 100%;\n  }\n  [data-type=\"control_button\"] {\n    margin-bottom: 0 !important;\n  }\n  [data-type=control_fullname] .form-sub-label-container {\n    width: 48%;\n  }\n  [data-type=control_fullname] .form-sub-label-container:first-child {\n    margin-right: 4%;\n  }\n  [data-type=control_phone] .form-sub-label-container {\n    width: 65%;\n  }\n  [data-type=control_phone] .form-sub-label-container:first-child {\n    width: 31%;\n    margin-right: 4%;\n  }\n  [data-type=control_datetime] .form-sub-label-container + .form-sub-label-container,\n  [data-type=control_datetime] .form-sub-label-container:first-child {\n    width: 27.3%;\n    margin-right: 6%;\n  }\n  [data-type=control_datetime] .form-sub-label-container + .form-sub-label-container + .form-sub-label-container {\n    width: 33.3%;\n    margin-right: 0;\n  }\n  [data-type=control_datetime] span + span + span > span:first-child {\n    display: block;\n    width: 100% !important;\n  }\n  [data-type=control_birthdate] .form-sub-label-container,\n  [data-type=control_datetime] span + span + span > span:first-child + span + span,\n  [data-type=control_time] .form-sub-label-container {\n    width: 27.3%!important;\n    margin-right: 6% !important;\n  }\n  [data-type=control_birthdate] .form-sub-label-container:last-child,\n  [data-type=control_time] .form-sub-label-container:last-child {\n    width: 33.3%!important;\n    margin-right: 0 !important;\n  }\n  .form-pagebreak-back-container,\n  .form-pagebreak-next-container {\n    min-height: 1px;\n    width: 50% !important;\n  }\n  .form-pagebreak-back,\n  .form-pagebreak-next,\n  .form-product-item.hover-product-item {\n    width: 100%;\n  }\n  .form-pagebreak-back-container {\n    padding: 0;\n    text-align: right;\n  }\n  .form-pagebreak-next-container {\n    padding: 0;\n    text-align: left;\n  }\n  .form-pagebreak {\n    margin: 0 auto;\n  }\n  .form-buttons-wrapper {\n    margin: 0!important;\n    margin-left: 0!important;\n  }\n  .form-buttons-wrapper button {\n    width: 100%;\n  }\n  .form-buttons-wrapper .form-submit-print {\n    margin: 0 !important;\n  }\n  table {\n    width: 100%!important;\n    max-width: initial!important;\n  }\n  table td + td {\n    padding-left: 3%;\n  }\n  .form-checkbox-item,\n  .form-radio-item {\n    white-space: normal!important;\n  }\n  .form-checkbox-item input,\n  .form-radio-item input {\n    width: auto;\n  }\n  .form-collapse-table {\n    margin: 0 5%;\n    display: block;\n    zoom: 1;\n    width: auto;\n  }\n  .form-collapse-table:before,\n  .form-collapse-table:after {\n    display: table;\n    content: '';\n    line-height: 0;\n  }\n  .form-collapse-table:after {\n    clear: both;\n  }\n  .fb-like-box {\n    width: 98% !important;\n  }\n  .form-error-message {\n    clear: both;\n    bottom: -10px;\n  }\n  .date-separate,\n  .phone-separate {\n    display: none;\n  }\n  .custom-field-frame,\n  .direct-embed-widgets,\n  .signature-pad-wrapper {\n    width: 100% !important;\n  }\n}\n\/* | *\/\n\n\/*__INSPECT_SEPERATOR__*\/\n\/*---------------------\nTheme: Generic Theme\nAuthor: Elton Cris - idarktech@jotform.com\nwww.jotform.com\n----------------------*\/\n.form-all {\n    -moz-box-sizing : border-box;\n    -webkit-box-sizing : border-box;\n    box-sizing : border-box;\n}\n\n[data-type=\"control_head\"] {\n    padding-bottom : 20px;\n}\n\n\/*responsive fields*\/\n[data-type=\"control_textbox\"] .form-textbox, \n[data-type=\"control_fullname\"] .form-textbox,\n[data-type=\"control_email\"] .form-textbox,\n[data-type=\"control_textarea\"] .form-textarea, \n[data-type=\"control_dropdown\"] .form-dropdown {\n    width : 100% !important;\n    max-width : none !important;\n}\n\n.form-textbox, .form-textarea, .form-dropdown {\n    max-width : none !important;\n    box-shadow : none;\n    outline : none;\n    box-sizing : border-box;\n    -webkit-box-sizing : border-box;\n    -moz-box-sizing : border-box;\n    font-family : inherit;\n    box-shadow : 1px 1px 2px #ccc;\n    padding : 7px 5px !important;\n}\n\n.form-textarea-limit>span {\n    display : block;\n}\n\n[data-type=\"control_dropdown\"] .form-input, \n[data-type=\"control_dropdown\"] .form-input-wide {\n    width : 100%;\n}\n\n\/*input focus*\/\n.form-line-active input:focus, .form-line-active textarea:focus, .form-line-active select:focus {\n    box-shadow : none;\n}\n\n\/*reset error*\/\n.form-line-error {\n    box-shadow : none;\n}\n\n\/*input error*\/\n.form-line-error input:not(#coupon-input), .form-line-error textarea, .form-line-error select, .form-line-error .form-validation-error {\n    border : 1px solid #e15353 !important;\n    box-shadow : none !important;\n}\n\n.form-line-active {\n    color : inherit !important;\n}\n\n\/*responsive content -wide or shrink*\/\n.form-label {\n    width : 35% !important;\n    box-sizing : border-box;\n    -webkit-box-sizing : border-box;\n    -moz-box-sizing : border-box;\n}\n\n.form-label-top {\n    width : 100% !important;\n}\n\n.form-line {\n    box-sizing : border-box;\n    -webkit-box-sizing : border-box;\n    -moz-box-sizing : border-box;\n    width : 100%;\n}\n\n.form-checkbox-other-input {\n    width : 80% !important;\n}\n\n.form-input {\n    width : 65% !important;\n    max-width : none !important;\n}\n\n.form-input-wide {\n    max-width : none !important;\n    display : inline-block;\n    width : 100%;\n}\n\n\/*single fields with sublabels*\/\n[data-type=\"control_textbox\"] .form-input-wide .form-sub-label-container, \n[data-type=\"control_fullname\"] .form-input-wide .form-sub-label-container,\n[data-type=\"control_email\"] .form-input-wide .form-sub-label-container,\n[data-type=\"control_textarea\"] .form-input-wide .form-sub-label-container, \n[data-type=\"control_dropdown\"] .form-input-wide .form-sub-label-container,\n[data-type=\"control_textbox\"] .form-input .form-sub-label-container, \n[data-type=\"control_fullname\"] .form-input .form-sub-label-container,\n[data-type=\"control_email\"] .form-input .form-sub-label-container,\n[data-type=\"control_textarea\"] .form-input .form-sub-label-container, \n[data-type=\"control_dropdown\"] .form-input .form-sub-label-container {\n    width : 100%;\n    max-width : none !important;\n}\n\n[data-type=\"control_dropdown\"] .form-input-wide {\n    width : 100%;\n}\n\n\/*responsive full name*\/\n[data-type=\"control_fullname\"] .form-sub-label-container {\n    width : 50% !important;\n    margin : 0;\n    float : left;\n    box-sizing : border-box;\n}\n\n[data-type=\"control_fullname\"] .form-label + div .form-sub-label-container {\n    display : inline-block;\n    padding-right : 5px;\n}\n\n[data-type=\"control_fullname\"] .form-label + div .form-sub-label-container + .form-sub-label-container {\n    margin-right : 0;\n    padding-right : 0;\n    padding-left : 5px;\n}\n\n[data-type=\"control_fullname\"] .form-label + div .form-sub-label-container + .form-sub-label-container {\n    margin-right : 0;\n    padding-right : 0;\n    padding-left : 5px;\n}\n\n[data-type=\"control_fullname\"] .form-label + div .form-sub-label-container + .form-sub-label-container + .form-sub-label-container {\n    padding-left : 0;\n    padding-right : 5px;\n}\n\n[data-type=\"control_fullname\"] .form-label + div .form-sub-label-container + .form-sub-label-container + .form-sub-label-container + .form-sub-label-container {\n    padding-left : 5px;\n    padding-right : 0;\n}\n\n[data-type=\"control_fullname\"] .form-label + div .form-sub-label-container + .form-sub-label-container  + .form-sub-label-container + .form-sub-label-container + .form-sub-label-container {\n    padding-right : 5px;\n    padding-left : 0;\n}\n\n#sublabel_prefix, #sublabel_first, #sublabel_middle {\n    \/*margin-bottom : 10px;\n    *\/;\n}\n\n\/*remove sepatators on date and phone*\/\n.phone-separate, .date-separate {\n    display : none;\n}\n\n\/*responsive phone fields*\/\n[data-type=\"control_phone\"] input[name$=\"[area]\"] {\n    width : 100%;\n}\n\n[data-type=\"control_phone\"] input[name$=\"[phone]\"] {\n    width : 100%;\n}\n\n[data-type=\"control_phone\"] input[name$=\"[full]\"] {\n    width : 100%;\n}\n\n[data-type=\"control_phone\"] .form-sub-label-container {\n    width : 40%;\n    float : left;\n    box-sizing : border-box;\n    margin-right : 0;\n    padding-right : 12px;\n}\n\n\/* responsive date time field *\/\n[data-type=\"control_datetime\"] .form-textbox,\n[data-type=\"control_datetime\"] .form-dropdown {\n    width : 100%;\n}\n\n[data-type=\"control_datetime\"] .form-sub-label-container {\n    width : 28%;\n    padding-left : 4px;\n    box-sizing : border-box;\n    margin-right : 0;\n}\n\n[data-type=\"control_datetime\"] .form-sub-label-container:first-child {\n    padding-left : 0;\n}\n\n[data-type=\"control_datetime\"] .form-sub-label-container:first-child + .form-sub-label-container + .form-sub-label-container {\n    padding-right : 0;\n}\n\n[data-type=\"control_datetime\"] .form-sub-label-container:last-child {\n    width : auto !important;\n}\n\n.allowTime-container .form-sub-label-container:last-child {\n    width : 20% !important;\n}\n\nspan.allowTime-container {\n    width : 80%;\n    padding-top : 14px;\n}\n\n.allowTime-container span.form-sub-label-container {\n    width : 35%;\n}\n\nspan.allowTime-container .form-dropdown {\n    width : 100%;\n}\n\nspan.allowTime-container > span:first-child {\n    display : none;\n}\n\nspan.allowTime-container > span:first-child + span {\n    padding-left : 0;\n}\n\n.showAutoCalendar + label {\n    display : none;\n}\n\nspan.allowTime-container + span {\n    padding-top : 14px;\n}\n\n\/*calendar lite mode*\/\n[data-type=\"control_datetime\"] div[style*=\"none\"] + .form-sub-label-container {\n    width : 84%;\n    padding-left : 0;\n}\n\n\/*responsive phone field*\/\n[data-type=\"control_phone\"] .form-sub-label-container + .form-sub-label-container {\n    width : 60%;\n    margin-right : 0;\n    padding-right : 0;\n    padding-left : 12px;\n}\n\n\/*responsive full address fields*\/\n.form-address-city, .form-address-line, .form-address-postal, \n.form-address-state, .form-address-table, \n.form-address-table .form-sub-label-container, .form-address-table select {\n    width : 100%;\n    max-width : 100%;\n}\n\n[data-type=\"control_address\"] input[name$=\"[city]\"],\n[data-type=\"control_address\"] input[name$=\"[postal]\"] {\n    width : 90% !important;\n}\n\n[data-type=\"control_address\"] input[name$=\"[area]\"] {\n    width : 60%;\n}\n\n\/*reset submit button*\/\n[data-type=\"control_button\"] {\n    background : transparent !important;\n}\n\n.form-submit-button,\n.form-submit-reset,\n.form-submit-print {\n    outline : none;\n}\n\n\/*remove other checkbox*\/\n.form-checkbox-other, \n.form-radio-other {\n    visibility : hidden !important;\n}\n\n\/*shruken fields*\/\n.form-line-column {\n    width : 50%;\n}\n\n.form-line-column .form-label-top {\n    width : 100% !important;\n}\n\n\/*fix form builder display*\/\ndiv#stage.form-all {\n    max-width : none !important;\n    margin-right : 0;\n}\n\ndiv#stage .form-input {\n    width : 64% !important;\n}\n\n\/*remove first pagebreak back button*\/\n.form-all .page-section:first-child .form-pagebreak .form-pagebreak-back-container {\n    display : none !important;\n}\n\n\/* responsive pagebreak *\/\n.form-pagebreak-back-container {\n    width : 50% !important;\n    text-align : left;\n    box-sizing : border-box;\n    -webkit-box-sizing : border-box;\n    float : left;\n}\n\n.form-pagebreak-next-container {\n    width : 50% !important;\n    text-align : right;\n    box-sizing : border-box;\n    -webkit-box-sizing : border-box;\n    float : left;\n}\n\n\/* radio-checkbox button make border 1px *\/\n.form-radio-item:not(#foo) label:after,\n.form-radio-item:not(#foo) label:before {\n    border-radius : 50%;\n}\n\n.form-checkbox-item:not(#foo) label:after,\n.form-checkbox-item:not(#foo) label:before {\n    border-radius : 0;\n}\n\n.form-radio-item:not(#foo) label:before,\n.form-checkbox-item:not(#foo) label:before {\n    border-width : 1px;\n}\n\n\/*responsive credit card on payment fields*\/\ntable td + td {\n    padding-left : 0;\n}\n\n.form-address-table {\n    width : 100%;\n}\n\n[data-type=\"control_stripe\"] .form-address-table,\n[data-type=\"control_stripe\"] .form-address-table .form-textbox,\n[data-type=\"control_authnet\"] .form-address-table,\n[data-type=\"control_authnet\"] .form-address-table .form-textbox,\n#creditCardTable.form-address-table,\n#creditCardTable.form-address-table .form-textbox {\n    max-width : none;\n}\n\n[data-type=\"control_stripe\"] .form-address-table td:last-child .form-sub-label-container,\n[data-type=\"control_authnet\"] .form-address-table td:last-child .form-sub-label-container,\n#creditCardTable.form-address-table td:last-child .form-sub-label-container {\n    margin-left : 0;\n    white-space : normal;\n}\n\n[data-type=\"control_stripe\"] .form-address-table td .form-sub-label-container,\n[data-type=\"control_authnet\"] .form-address-table td .form-sub-label-container,\n#creditCardTable.form-address-table td .form-sub-label-container {\n    width : 100%;\n}\n\n[data-type=\"control_stripe\"] .form-address-table .form-textbox,\n[data-type=\"control_stripe\"] .form-address-table .form-dropdown,\n[data-type=\"control_authnet\"] .form-address-table .form-textbox,\n[data-type=\"control_authnet\"] .form-address-table .form-dropdown,\n#creditCardTable.form-address-table .form-textbox,\n#creditCardTable.form-address-table .form-dropdown {\n    width : 100%;\n    visibility : visible;\n}\n\n[data-type=\"control_stripe\"] .form-address-table tbody > tr:first-child + tr td:first-child span,\n[data-type=\"control_authnet\"] .form-address-table tbody > tr:first-child + tr td:first-child span,\n#creditCardTable.form-address-table tbody > tr:first-child + tr td:first-child span {\n    margin : 0;\n    padding-right : 6px;\n    box-sizing : border-box;\n    -webkit-box-sizing : border-box;\n}\n\n[data-type=\"control_stripe\"] .form-address-table tbody > tr:first-child + tr td:first-child + td span,\n[data-type=\"control_authnet\"] .form-address-table tbody > tr:first-child + tr td:first-child + td span,\n#creditCardTable.form-address-table tbody > tr:first-child + tr td:first-child + td span {\n    margin : 0;\n    padding-left : 6px;\n    box-sizing : border-box;\n    -webkit-box-sizing : border-box;\n}\n\n[data-type=\"control_stripe\"] .form-address-table tbody > tr:first-child + tr +tr td:first-child span,\n[data-type=\"control_stripe\"] .form-address-table tbody > tr:first-child + tr +tr+tr td:first-child span,\n[data-type=\"control_authnet\"] .form-address-table tbody > tr:first-child + tr +tr td:first-child span,\n[data-type=\"control_authnet\"] .form-address-table tbody > tr:first-child + tr +tr+tr td:first-child span,\n#creditCardTable.form-address-table tbody > tr:first-child + tr +tr td:first-child span,\n#creditCardTable.form-address-table tbody > tr:first-child + tr +tr+tr td:first-child span {\n    margin : 0;\n    padding-right : 6px;\n    width : 50% !important;\n    visibility : hidden;\n    float : left;\n    box-sizing : border-box;\n    -webkit-box-sizing : border-box;\n}\n\n[data-type=\"control_stripe\"] .form-address-table tbody > tr:first-child + tr +tr td:first-child span + span,\n[data-type=\"control_stripe\"] .form-address-table tbody > tr:first-child + tr +tr+tr td:first-child span + span,\n[data-type=\"control_authnet\"] .form-address-table tbody > tr:first-child + tr +tr td:first-child span + span,\n[data-type=\"control_authnet\"] .form-address-table tbody > tr:first-child + tr +tr+tr td:first-child span + span,\n#creditCardTable.form-address-table tbody > tr:first-child + tr +tr td:first-child span + span,\n#creditCardTable.form-address-table tbody > tr:first-child + tr +tr+tr td:first-child span + span {\n    margin : 0;\n    padding-top : 0 !important;\n    padding-right : 0;\n    padding-left : 6px;\n    width : 50% !important;\n    box-sizing : border-box;\n    -webkit-box-sizing : border-box;\n}\n\n.cc_ccv {\n    width : 100% !important;\n}\n\n[data-type=\"control_stripe\"] .form-address-table .form-sub-label,\n[data-type=\"control_authnet\"] .form-address-table .form-sub-label,\n#creditCardTable.form-address-table .form-sub-label {\n    visibility : visible;\n}\n\n\/*cc fix city state, country *\/\n[data-type=\"control_stripe\"] .form-address-table td[width=\"50%\"]>span:first-child,\n[data-type=\"control_authnet\"] .form-address-table td[width=\"50%\"]>span:first-child,\n#creditCardTable.form-address-table td[width=\"50%\"]>span:first-child {\n    box-sizing : border-box;\n    padding-right : 7px;\n}\n\n[data-type=\"control_stripe\"] .form-address-table td[width=\"50%\"] + td >span:first-child,\n[data-type=\"control_authnet\"] .form-address-table td[width=\"50%\"] + td >span:first-child,\n#creditCardTable.form-address-table td[width=\"50%\"] + td >span:first-child {\n    box-sizing : border-box;\n    padding-left : 7px;\n}\n\n[data-type=\"control_stripe\"] .form-address-table td[width=\"50%\"] + td[width=\"50%\"] >span:first-child,\n[data-type=\"control_authnet\"] .form-address-table td[width=\"50%\"] + td[width=\"50%\"] >span:first-child,\n#creditCardTable.form-address-table td[width=\"50%\"] + td[width=\"50%\"] >span:first-child {\n    box-sizing : border-box;\n    padding-right : 0;\n}\n\n.hover-product-item:hover {\n    color : inherit;\n}\n\n\/*fix for braintree cc styling*\/\n[data-type=\"control_braintree\"] .form-sub-label-container {\n    width : 100% !important;\n    padding : 4px;\n    box-sizing : border-box;\n}\n\n[data-type=\"control_braintree\"] .form-textbox {\n    width : 100%;\n}\n\n.braintree-hosted-fields {\n    width : 100% !important;\n    box-sizing : border-box;\n    min-height : 28px;\n}\n\n\/*remove bottom spacing on CC section*\/\n#creditCardTable.form-address-table tbody tr + tr + tr td,\n[data-type=\"control_stripe\"] .form-address-table tbody tr + tr + tr td,\n[data-type=\"control_authnet\"] .form-address-table tbody tr + tr + tr td {\n    padding-bottom : 0;\n}\n\n@media screen and (max-width:768px){\n    .form-all {\n        margin : 0 auto !important;\n    }\n\n    [data-type=control_fullname] .form-sub-label-container:first-child {\n        margin-right : 0;\n    }\n\n}\n\n@media screen and (max-width:480px){\n    .jotform-form {\n        padding : 0;\n    }\n\n    .form-input {\n        width : 100% !important;\n    }\n\n    .form-label {\n        width : 100% !important;\n        float : none !important;\n    }\n\n    .form-line-column {\n        width : 100% !important;\n    }\n\n    div.form-header-group {\n        margin : 0 !important;\n        padding : 24px 20px !important;\n    }\n\n    [data-type=\"control_datetime\"] .form-sub-label-container {\n        float : left;\n    }\n\n    [data-type=control_fullname] .form-sub-label-container:first-child {\n        margin-right : 0;\n    }\n\n}\n\n\n    \/* Injected CSS Code *\/\n<\/style>\n\n<script src=\"https:\/\/cdn02.jotfor.ms\/static\/prototype.forms.js?3.3.36479\" type=\"text\/javascript\"><\/script>\n<script src=\"https:\/\/cdn03.jotfor.ms\/static\/jotform.forms.js?3.3.36479\" type=\"text\/javascript\"><\/script>\n<script type=\"text\/javascript\">\tJotForm.newDefaultTheme = false;\n\tJotForm.extendsNewTheme = false;\n\tJotForm.singleProduct = false;\n\tJotForm.newPaymentUIForNewCreatedForms = false;\n\tJotForm.highlightInputs = false;\n\n var jsTime = setInterval(function(){try{\n   JotForm.jsForm = true;\n\tJotForm.clearFieldOnHide=\"disable\";\n\n\tJotForm.init(function(){\n\t\/*INIT-START*\/\nif (window.JotForm && JotForm.accessible) $('input_3').setAttribute('tabindex',0);\nif (window.JotForm && JotForm.accessible) $('input_4').setAttribute('tabindex',0);\nif (window.JotForm && JotForm.accessible) $('input_5').setAttribute('tabindex',0);\nif (window.JotForm && JotForm.accessible) $('input_6').setAttribute('tabindex',0);\n\t\/*INIT-END*\/\n\t});\n\n   clearInterval(jsTime);\n }catch(e){}}, 1000);\n\n   JotForm.prepareCalculationsOnTheFly([null,null,null,{\"name\":\"name\",\"qid\":\"3\",\"text\":\"Name\",\"type\":\"control_textbox\"},{\"name\":\"email\",\"qid\":\"4\",\"text\":\"E-mail\",\"type\":\"control_textbox\"},{\"name\":\"contactNumber5\",\"qid\":\"5\",\"text\":\"Contact Number\",\"type\":\"control_textbox\"},{\"name\":\"message\",\"qid\":\"6\",\"text\":\"Message\",\"type\":\"control_textarea\"},{\"name\":\"submit\",\"qid\":\"7\",\"text\":\"Submit\",\"type\":\"control_button\"},{\"name\":\"clickTo\",\"qid\":\"8\",\"text\":\"Contact Us\",\"type\":\"control_head\"}]);\n   setTimeout(function() {\nJotForm.paymentExtrasOnTheFly([null,null,null,{\"name\":\"name\",\"qid\":\"3\",\"text\":\"Name\",\"type\":\"control_textbox\"},{\"name\":\"email\",\"qid\":\"4\",\"text\":\"E-mail\",\"type\":\"control_textbox\"},{\"name\":\"contactNumber5\",\"qid\":\"5\",\"text\":\"Contact Number\",\"type\":\"control_textbox\"},{\"name\":\"message\",\"qid\":\"6\",\"text\":\"Message\",\"type\":\"control_textarea\"},{\"name\":\"submit\",\"qid\":\"7\",\"text\":\"Submit\",\"type\":\"control_button\"},{\"name\":\"clickTo\",\"qid\":\"8\",\"text\":\"Contact Us\",\"type\":\"control_head\"}]);}, 20); \n<\/script>\n<\/head>\n<body>\n<form class=\"jotform-form\" action=\"https:\/\/submit.jotform.us\/submit\/80183972521154\/\" method=\"post\" name=\"form_80183972521154\" id=\"80183972521154\" accept-charset=\"utf-8\" autocomplete=\"on\">\n  <input type=\"hidden\" name=\"formID\" value=\"80183972521154\" \/>\n  <input type=\"hidden\" id=\"JWTContainer\" value=\"\" \/>\n  <input type=\"hidden\" id=\"cardinalOrderNumber\" value=\"\" \/>\n  <div role=\"main\" class=\"form-all\">\n    <ul class=\"form-section page-section\">\n      <li id=\"cid_8\" class=\"form-input-wide\" data-type=\"control_head\">\n        <div class=\"form-header-group  header-default\">\n          <div class=\"header-text httac htvam\">\n            <h2 id=\"header_8\" class=\"form-header\" data-component=\"header\">\n              Contact Us\n            <\/h2>\n          <\/div>\n        <\/div>\n      <\/li>\n      <li class=\"form-line jf-required\" data-type=\"control_textbox\" id=\"id_3\">\n        <label class=\"form-label form-label-left form-label-auto\" id=\"label_3\" for=\"input_3\">\n          Name\n          <span class=\"form-required\">\n            *\n          <\/span>\n        <\/label>\n        <div id=\"cid_3\" class=\"form-input jf-required\">\n          <input type=\"text\" id=\"input_3\" name=\"q3_name\" data-type=\"input-textbox\" class=\"form-textbox validate[required]\" data-defaultvalue=\"\" size=\"30\" value=\"\" placeholder=\" \" data-component=\"textbox\" aria-labelledby=\"label_3\" required=\"\" \/>\n        <\/div>\n      <\/li>\n      <li class=\"form-line jf-required\" data-type=\"control_textbox\" id=\"id_4\">\n        <label class=\"form-label form-label-left form-label-auto\" id=\"label_4\" for=\"input_4\">\n          E-mail\n          <span class=\"form-required\">\n            *\n          <\/span>\n        <\/label>\n        <div id=\"cid_4\" class=\"form-input jf-required\">\n          <input type=\"text\" id=\"input_4\" name=\"q4_email\" data-type=\"input-textbox\" class=\"form-textbox validate[required]\" data-defaultvalue=\"\" size=\"30\" value=\"\" placeholder=\" \" data-component=\"textbox\" aria-labelledby=\"label_4\" required=\"\" \/>\n        <\/div>\n      <\/li>\n      <li class=\"form-line jf-required\" data-type=\"control_textbox\" id=\"id_5\">\n        <label class=\"form-label form-label-left form-label-auto\" id=\"label_5\" for=\"input_5\">\n          Contact Number\n          <span class=\"form-required\">\n            *\n          <\/span>\n        <\/label>\n        <div id=\"cid_5\" class=\"form-input jf-required\">\n          <input type=\"text\" id=\"input_5\" name=\"q5_contactNumber5\" data-type=\"input-textbox\" class=\"form-textbox validate[required]\" data-defaultvalue=\"\" size=\"30\" value=\"\" placeholder=\" \" data-component=\"textbox\" aria-labelledby=\"label_5\" required=\"\" \/>\n        <\/div>\n      <\/li>\n      <li class=\"form-line jf-required\" data-type=\"control_textarea\" id=\"id_6\">\n        <label class=\"form-label form-label-left form-label-auto\" id=\"label_6\" for=\"input_6\">\n          Message\n          <span class=\"form-required\">\n            *\n          <\/span>\n        <\/label>\n        <div id=\"cid_6\" class=\"form-input jf-required\">\n          <textarea id=\"input_6\" class=\"form-textarea validate[required]\" name=\"q6_message\" cols=\"30\" rows=\"8\" data-component=\"textarea\" required=\"\" aria-labelledby=\"label_6\"><\/textarea>\n        <\/div>\n      <\/li>\n      <li class=\"form-line\" data-type=\"control_button\" id=\"id_7\">\n        <div id=\"cid_7\" class=\"form-input-wide\">\n          <div style=\"margin-left:156px\" data-align=\"auto\" class=\"form-buttons-wrapper form-buttons-auto   jsTest-button-wrapperField\">\n            <button id=\"input_7\" type=\"submit\" class=\"form-submit-button submit-button jf-form-buttons jsTest-submitField\" data-component=\"button\" data-content=\"\">\n              Submit\n            <\/button>\n          <\/div>\n        <\/div>\n      <\/li>\n      <li style=\"display:none\">\n        Should be Empty:\n        <input type=\"text\" name=\"website\" value=\"\" \/>\n      <\/li>\n    <\/ul>\n  <\/div>\n  <script>\n  JotForm.showJotFormPowered = \"new_footer\";\n  <\/script>\n  <script>\n  JotForm.poweredByText = \"Powered by Jotform\";\n  <\/script>\n  <input type=\"hidden\" class=\"simple_spc\" id=\"simple_spc\" name=\"simple_spc\" value=\"80183972521154\" \/>\n  <script type=\"text\/javascript\">\n  var all_spc = document.querySelectorAll(\"form[id='80183972521154'] .si\" + \"mple\" + \"_spc\");\nfor (var i = 0; i < all_spc.length; i++)\n{\n  all_spc[i].value = \"80183972521154-80183972521154\";\n}\n  <\/script>\n  <div class=\"formFooter-heightMask\">\n  <\/div>\n  <div class=\"formFooter f6 branding21\">\n    <div class=\"formFooter-wrapper formFooter-leftSide\">\n      <a href=\"https:\/\/www.jotform.com\/?utm_source=formfooter&utm_medium=banner&utm_term=80183972521154&utm_content=jotform_logo&utm_campaign=powered_by_jotform_le\" target=\"_blank\" class=\"formFooter-logoLink\"><img class=\"formFooter-logo\" src=\"https:\/\/cdn.jotfor.ms\/assets\/img\/logo2021\/jotform-logo-white.svg\" alt=\"Jotform Logo\" style=\"height: 44px;\"><\/a>\n    <\/div>\n    <div class=\"formFooter-wrapper formFooter-rightSide\">\n      <span class=\"formFooter-text\">\n        Now create your own Jotform - It's free!\n      <\/span>\n      <a class=\"formFooter-button\" href=\"https:\/\/www.jotform.com\/?utm_source=formfooter&utm_medium=banner&utm_term=80183972521154&utm_content=jotform_button&utm_campaign=powered_by_jotform_le\" target=\"_blank\">Create your own Jotform<\/a>\n    <\/div>\n  <\/div>\n<\/form><\/body>\n<\/html>\n", "Law Day 5K Contact Form", Array);
(function() {
    window.handleIFrameMessage = function(e) {
        if (!e.data || !e.data.split)
            return;
        var args = e.data.split(":");
        if (args[2] != "80183972521154") {
            return;
        }
        var iframe = document.getElementById("80183972521154");
        if (!iframe) {
            return
        }
        ;
        switch (args[0]) {
        case "scrollIntoView":
            if (!("nojump" in FrameBuilder.get)) {
                iframe.scrollIntoView();
            }
            break;
        case "setHeight":
            var height = args[1] + "px";
            if (window.jfDeviceType === 'mobile' && typeof $jot !== 'undefined') {
                var parent = $jot(iframe).closest('.jt-feedback.u-responsive-lightbox');
                if (parent) {
                    height = '100%';
                }
            }
            iframe.style.height = height
            break;
        case "setMinHeight":
            iframe.style.minHeight = args[1] + "px";
            break;
        case "collapseErrorPage":
            if (iframe.clientHeight > window.innerHeight) {
                iframe.style.height = window.innerHeight + "px";
            }
            break;
        case "reloadPage":
            if (iframe) {
                location.reload();
            }
            break;
        case "removeIframeOnloadAttr":
            iframe.removeAttribute("onload");
            break;
        case "loadScript":
            if (!window.isPermitted(e.origin, ['jotform.com', 'jotform.pro'])) {
                break;
            }
            var src = args[1];
            if (args.length > 3) {
                src = args[1] + ':' + args[2];
            }
            var script = document.createElement('script');
            script.src = src;
            script.type = 'text/javascript';
            document.body.appendChild(script);
            break;
        case "exitFullscreen":
            if (window.document.exitFullscreen)
                window.document.exitFullscreen();
            else if (window.document.mozCancelFullScreen)
                window.document.mozCancelFullScreen();
            else if (window.document.mozCancelFullscreen)
                window.document.mozCancelFullScreen();
            else if (window.document.webkitExitFullscreen)
                window.document.webkitExitFullscreen();
            else if (window.document.msExitFullscreen)
                window.document.msExitFullscreen();
            break;
        case 'setDeviceType':
            window.jfDeviceType = args[1];
            break;
        }
    };
    window.isPermitted = function(originUrl, whitelisted_domains) {
        var url = document.createElement('a');
        url.href = originUrl;
        var hostname = url.hostname;
        var result = false;
        if (typeof hostname !== 'undefined') {
            whitelisted_domains.forEach(function(element) {
                if (hostname.slice((-1 * element.length - 1)) === '.'.concat(element) || hostname === element) {
                    result = true;
                }
            });
            return result;
        }
    };
    if (window.addEventListener) {
        window.addEventListener("message", handleIFrameMessage, false);
    } else if (window.attachEvent) {
        window.attachEvent("onmessage", handleIFrameMessage);
    }
})();

