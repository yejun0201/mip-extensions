/**
 * @file mip-mz-appdownload 木子的app下载切换效果
 * @author pifire
 */

define(function (require) {
    var $ = require('zepto');
    var util = require('util');
    var platform = util.platform;
    var customElement = require('customElement').create();
    var localhref = 'http://m.muzisoft.com/mz/';
    function initAD(ad, aid, addr, obj) {
        if (platform.isIos()) {
            var softid = aid.substring(0, aid.length - 5);
            if (inarray(obj.vnpids, softid)) {
                return '<a href="' + obj.ios[1].url + '" class="gsdbtn">' + obj.ios[0].btnvalue + '</a>';
            }
            return '<a href="' + checkurl(aid, addr) + '" class="gsdbtn confirmios">'
            + obj.ios[0].btnvalue + '</a>';
        }
        if (ad > 0) {
            $('.down').css('height', '90px');
            var presenti = 0;
            for (var i = 0; i < obj.android.length; ++i) {
                if (!getCookie(obj.android[i].id)) {
                    presenti = i;
                    break;
                }
            }
            return '<input type="checkbox" id="ckb" class="ckb" checked="checked">'
			+ '<span>' + obj.android[presenti].name + '</span>'
            + '<a href="' + obj.android[presenti].url + '" id="gsdbtn" presentid="'
            + obj.android[presenti].id + '" class="gsdbtn">' + obj.android[presenti].btnvalue + '</a>'
            + '<p id="yybtext" class="yybtext">' + obj.android[presenti].info + '</p>';
        }
        return '<a href="' + checkurl(aid, addr) + '" class="gsdbtn">' + obj.android[0].ubtnvalue + '</a>';
    }
	// 判断url下载还是id下载
    function checkurl(aid, addr) {
        return (addr.length === 0) ? localhref + aid : addr;
    }
	// 点击按钮切换下载
    function changeDown(aid, addr, androidAD) {
        var chk = document.getElementById('ckb');
        var yybtext = $('.yybtext');
        var gsdbtn = document.getElementById('gsdbtn');
        var presenti = 0;
        for (var i = 0; i < androidAD.length; ++i) {
            if (!getCookie(androidAD[i].id)) {
                presenti = i;
                break;
            }
        }
        if (chk.checked) {
            yybtext.css('color', 'black');
            document.querySelector('#down span').innerText = androidAD[presenti].name;
            gsdbtn.setAttribute('href', androidAD[presenti].url);
            gsdbtn.innerText = androidAD[presenti].btnvalue;
            yybtext.innerText = androidAD[presenti].info;
        }
        else {
            yybtext.css('color', 'red');
            document.querySelector('#down span').innerText = androidAD[presenti].name;
            gsdbtn.setAttribute('href', checkurl(aid, addr));
            gsdbtn.innerText = androidAD[presenti].ubtnvalue;
            yybtext.innerText = androidAD[presenti].uinfo;
        }
    }
	// 设置cookie
    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = 'expires=' + d.toGMTString();
        document.cookie = cname + '=' + cvalue + ';expires=' + expires;
    }
    // 获取cookie
    function getCookie(cname) {
        var name = cname + '=';
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i].trim();
            if (c.indexOf(name) === 0) {
                return c.substring(name.length);
            }
        }
    }
	// 数组中是否包含
    function inarray(arr, obj) {
        var i = arr.length;
        while (i--) {
            if (arr[i] === obj) {
                return true;
            }
        }
        return false;
    }

    /**
     *  createdCallback
     */
    customElement.prototype.createdCallback = function () {
        var element = this.element;
        var $element = $(element);
        var ad = $element.attr('ad');
        var aid = $element.attr('aid');
        var addr = $element.attr('addr');
        function callback(json) {
            var innerHTML = initAD(ad, aid, addr, json);
            $('.down ul li').append(innerHTML);
            $('.ckb').click(function () {
                changeDown(aid, addr, json.android);
            });
			// 安卓点击了高速按钮，写cookie
            $('.gsdbtn').click(function () {
                for (var i = 0; i < json.android.length; ++i) {
                    var j = (i === json.android.length - 1) ? 0 : i + 1;
                    if ($('.gsdbtn').attr('presentid') === json.android[i].id) {
                        setCookie(json.android[j].id, '', 1);
                    }
					else {
                        setCookie(json.android[j].id, 1, 1);
                    }
                }
            });
			// 苹果点击了下载
            $('.confirmios').click(function () {
                if (confirm(json.ios[0].name)) {
                    window.location.href = json.ios[0].url;
                    return false;
                }
            });
        }
        var myRequest = new Request('https://m.muzisoft.com/mipappdown.json');
        fetch(myRequest).then(function (response) {
            return response.json().then(callback);
        });
    };
    return customElement;
});
