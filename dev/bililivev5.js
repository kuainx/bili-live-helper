// ==UserScript==
// @name         Bilibili直播间自动领便当
// @namespace    ekuai
// @version      5.30
// @description  bilibili直播间自动领低保，妈妈再也不用担心我忘记领瓜子啦
// @author       kuai
// @include        /^https?:\/\/live\.bilibili\.com\/\d/
// @include        /^https?:\/\/api\.live\.bilibili\.com\/link_group\/v1\/member\/my_groups/
// @include        /^https?:\/\/api\.live\.bilibili\.com\/lottery\/v1\/SilverBox\/getCaptcha.*?/
// @include        /^https?:\/\/api\.live\.bilibili\.com\/mobile\/userOnlineHeart.*?/
// @grant        none
// @license            MIT License
// ==/UserScript==

(function() {
    'use strict';

    function CurentTime() {
        var now = new Date();
        var hh = now.getHours(); //时
        var mm = now.getMinutes(); //分
        var ss = now.getSeconds(); //秒
        var clock = '';
        if (hh < 10) clock += "0";
        clock += hh + ":";
        if (mm < 10) clock += '0';
        clock += mm + ":";
        if (ss < 10) clock += '0';
        clock += ss;
        clock += '|';
        return (clock);
    }

    if ((window.location.href + "").indexOf("getCaptcha") > 10) {
        window.draw = function() {
            var img = document.querySelector("img");
            var ctx = document.querySelector("#a");
            ctx = ctx.getContext("2d");
            ctx.drawImage(img, 0, 0);
            var pixels = ctx.getImageData(0, 0, 120, 40).data;
            var pix = [];
            var j = 0;
            for (var i = 1; i <= 40; i++) {
                pix[i] = [];
                for (var n = 1; n <= 120; n++) {
                    let c = 0;
                    pixels[j] - (-pixels[j + 1]) - (-pixels[j + 2]) < 600 && c++;
                    j = j + 4;
                    pix[i][n] = c;
                }
            }
            ctx.fillStyle = `rgb(255, 255, 255)`;
            ctx.fillRect(0, 0, 120, 40);
            ctx.fillStyle = `rgb(0, 0, 0)`;

            function gp(i, n) {
                if (i < 1 || n < 1 || n > 120 || i > 40) {
                    return 0;
                } else {
                    return pix[i][n];
                }
            }
            var count;
            for (var i = 1; i <= 40; i++) {
                for (var n = 1; n <= 120; n++) {
                    count = 0;
                    gp(i - 1, n - 1) == 1 && count++;
                    gp(i - 1, n) == 1 && count++;
                    gp(i - 1, n + 1) == 1 && count++;
                    gp(i, n - 1) == 1 && count++;
                    gp(i, n) == 1 && count++;
                    gp(i, n + 1) == 1 && count++;
                    gp(i + 1, n - 1) == 1 && count++;
                    gp(i + 1, n) == 1 && count++;
                    gp(i + 1, n + 1) == 1 && count++;
                    count == 9 && ctx.fillRect(n - 1, i - 1, 1, 1);
                }
            }
            var result = window.parent.recognize(ctx.getImageData(0, 0, 120, 40));
            var origin = result;
            var correctStr = {
                'g': 9,
                'z': 2,
                'Z': 2,
                'o': 0,
                'l': 1,
                'B': 8,
                'O': 0,
                'S': 6,
                's': 6,
                'i': 1,
                'I': 1,
                '[\.]': '-',
                '_': 4,
                'b': 6,
                'R': 8,
                '[\|]': 1,
                'D': 0,
                '>': 7,
                'C': 4,
                'T': 3,
                'r': '+',
                'q': 9,
                'L': 2,
                'G': 4,
                'c': 4,
                't': 1,
                'a': 8
            };
            Object.keys(correctStr).forEach(key => {
                let reg = new RegExp(key, "g");
                result = result.replace(reg, correctStr[key]);
                console.log("OCRAD", result);
            });
            console.log("OCRAD", origin, result);
            return result;
        };
        window.ls = function() {
            document.domain = 'bilibili.com';
            document.body.style = "background-color:#66ccff";
            var canvas = document.createElement("canvas");
            canvas.id = "a";
            document.body.insertBefore(canvas, document.body.firstChild);
            var div = document.createElement("div");
            div.id = "b";
            document.body.insertBefore(div, document.body.firstChild);
            var image = document.createElement("img");
            var ret = JSON.parse(document.querySelector("pre").innerHTML);
            image.src = ret.data.img;
            image.onload = function() {
                setTimeout(function() {
                    var result = draw();
                    document.getElementById("b").innerHTML = '<input id="input" value="' + result + '" onkeypress="if(event.keyCode==13){try{if(window.parent.valid && typeof(window.parent.valid)==\'function\'){window.parent.valid(eval(document.getElementById(\'input\').value));}else{console.log(CurentTime()+\'回调失败，请反馈\');}}catch(e){};return false;}"/>';
                }, 2000);
            };
            document.body.insertBefore(image, document.body.firstChild);
        };
        window.addEventListener('message', function(e) {
            ls();
        });
    } else if ((window.location.href + "").indexOf("my_groups") > 10) {
        var js = document.createElement("script");
        js.src = "https://static.hdslb.com/live-static/libs/jquery/jquery-1.11.3.min.js";
        document.body.insertBefore(js, document.body.firstChild);
        window.GroupSignGet = function(data) {
            document.domain = 'bilibili.com';
            if (data.code === 0) {
                var Grouplist = data.data.list;
                var all = data.data.list.length;
                Grouplist.forEach(function(val, index) {
                    var delay = (parseInt(Math.random() * 10) + 1) * 1000;
                    setTimeout(function() {
                        window.parent.GroupSign(val.group_id, val.owner_uid, val.fans_medal_name, (index + 1) + "/" + all);
                    }, delay * (index + 1));
                });
                parent.localStorage.livejs_GroupSign = new Date().toLocaleDateString();
            } else {
                console.log("ERROR", 'Grouplist', data);
            }
        };
        var data = JSON.parse(document.querySelector("pre").innerHTML);
        window.ls = function() {
            window.GroupSignGet(data);
        };
        ls();
    } else if ((window.location.href + "").indexOf("mobile") > 10) {
        var js = document.createElement("script");
        js.src = "https://static.hdslb.com/live-static/libs/jquery/jquery-1.11.3.min.js";
        document.body.insertBefore(js, document.body.firstChild);

        function getCookie(name) {
            var strcookie = document.cookie; //获取cookie字符串
            var arrcookie = strcookie.split("; "); //分割
            //遍历匹配
            for (var i = 0; i < arrcookie.length; i++) {
                var arr = arrcookie[i].split("=");
                if (arr[0] == name) {
                    return arr[1];
                }
            }
            return "";
        }
        window.mobileHeartBeat = function() {
            document.domain = 'bilibili.com';
            window.history.pushState({}, 0, 'https://live.bilibili.com/14047');
            $.ajax({
                type: "post",
                url: "//api.live.bilibili.com/mobile/userOnlineHeart",
                data: {
                    csrf: getCookie("bili_jct"),
                    csrf_token: getCookie("bili_jct"),
                    visit_id: ''
                },
                datatype: "jsonp", //"xml", "html", "script", "json", "json", "text".
                crossDomain: true,
                xhrFields: {
                    withCredentials: true
                },
                success: function(data) {
                    console.log('mobileHeartBeat', data);
                    setTimeout(function() {
                        window.parent.doubleWatchTaskCheck();
                    }, 5000);
                }
            });
        };
        window.ls = function() {
            setTimeout(window.mobileHeartBeat, 2000);
        };
        ls();
    } else {
        /***********新直播间************/
        (function($) {
            $.fn.dragDiv = function(options) {
                return this.each(function() {
                    var _moveDiv = $(this); //需要拖动的Div
                    var _moveArea = options ? $(options) : $(document); //限定拖动区域，默认为整个文档内
                    var isDown = false; //mousedown标记
                    //ie的事件监听，拖拽div时禁止选中内容，firefox与chrome已在css中设置过-moz-user-select: none; -webkit-user-select: none;
                    if (document.attachEvent) {
                        _moveDiv[0].attachEvent('onselectstart', function() {
                            return false;
                        });
                    }
                    _moveDiv.mousedown(function(event) {
                        var e = event || window.event;
                        //拖动时鼠标样式
                        _moveDiv.css("cursor", "move");
                        //获得鼠标指针离DIV元素左边界的距离
                        var x = e.pageX - _moveDiv.offset().left;
                        //获得鼠标指针离DIV元素上边界的距离
                        var y = e.pageY - _moveDiv.offset().top;
                        _moveArea.on('mousemove', function(event) {
                            var ev = event || window.event;
                            //获得X轴方向移动的值
                            var abs_x = ev.pageX - x;
                            //获得Y轴方向移动的值
                            var abs_y = ev.pageY - y;
                            //div动态位置赋值
                            _moveDiv.css({
                                'left': abs_x,
                                'top': abs_y
                            });

                            window.localStorage["helper_msg_left"] = abs_x + "px";
                            window.localStorage["helper_msg_top"] = abs_y + "px";

                        });
                    });
                    _moveDiv.mouseup(function() {
                        _moveDiv.css('cursor', 'default');
                        //解绑拖动事件
                        _moveArea.off('mousemove');

                    });

                });
            };
        })(jQuery);

        function getCookie(name) {
            var strcookie = document.cookie; //获取cookie字符串
            var arrcookie = strcookie.split("; "); //分割
            //遍历匹配
            for (var i = 0; i < arrcookie.length; i++) {
                var arr = arrcookie[i].split("=");
                if (arr[0] == name) {
                    return arr[1];
                }
            }
            return "";
        }
        window.clo = ""; //计时器
        window.lotteryList = [];
        $().ready(function() {
            /****************************************************************/
            /*----------------------小电视-------------------------------------*/
            window.throttle = function throttle(fn, threshhold) {
                var last, timer;
                threshhold || (threshhold = 1000);
                return function() {
                    var context = this;
                    var args = arguments;
                    var now = +new Date();
                    if (last && now < last + threshhold) {
                        clearTimeout(timer);
                        timer = setTimeout(function() {
                            last = now;
                            fn.apply(context, args);
                        }, threshhold);
                    } else {
                        last = now;
                        fn.apply(context, args);
                    }
                };
            };

            function Listener_smalltv() {
                msg("自动领低保已启动");
                console.log("smallTvListener", "监听启动");
                window.smallTvRoom = [];
                $(document).on("DOMNodeInserted", ".system-msg", function() {
                    if (window.localStorage.id != window.helper_id) {
                        close();
                        getSmallTV_close();
                        msg("在其他房间打开了", "caution");
                        return;
                    } //判断是否在其他房间打开了
                    var text = $(this).context.childNodes[3].children[0].href;
                    console.log(text);
                    var m = text.match('m/([0-9]*)');
                    var delay = (parseInt(Math.random() * 5)) * 1000 + 5; //随机5-10秒以内延迟
                    setTimeout(function() {
                        getSmallTV(m[1]);
                    }, delay);
                });

            }

            function getSmallTV(room) {
                if (Math.random() > 0.2) {
                    window.throttle(getSmallTV_init)(room);
                } else {
                    console.log("SmallTv", "战略性释放" + room);
                }
            }

            function getSmallTV_init(roomid) {
                window.history.pushState({}, 0, 'https://live.bilibili.com/' + roomid);
                $.ajax({
                    type: "get",
                    url: "//api.live.bilibili.com/room/v1/Room/room_init",
                    data: {
                        id: roomid
                    },
                    datatype: "jsonp", //"xml", "html", "script", "json", "json", "text".
                    crossDomain: true,
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function(data) {
                        //console.log(data);
                        if (data.code === 0) {
                            msg("正在帮你抢小电视啦~");
                            var room_id = data.data.room_id;
                            var short_id = data.data.short_id;
                            if (short_id === 0) {
                                short_id = room_id;
                            }
                            setTimeout(function() {
                                getSmallTV_check(room_id, short_id);
                            }, 1000);

                        } else {
                            msg("在获取房间信息的时候出错！", "caution", 5000);
                            console.error("ERROR", "smallTvInit", data);
                        }
                    }
                });
            }

            function getSmallTV_check(roomid, short_id) {
                window.history.pushState({}, 0, 'https://live.bilibili.com/' + short_id);
                $.ajax({
                    type: "get",
                    url: "//api.live.bilibili.com/xlive/lottery-interface/v1/lottery/Check",
                    data: {
                        roomid: roomid
                    },
                    datatype: "jsonp", //"xml", "html", "script", "json", "json", "text".
                    crossDomain: true,
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function(data) {
                        if (data.code == 0) {
                            var i = 0;
                            console.log(data.data);
                            for (i = 0; i < data.data.gift.length; i++) {
                                if (window.lotteryList.includes(data.data.gift[i].raffleId)) {
                                    console.log(CurentTime() + "(Check)直播间【" + short_id + "】的" + data.data.gift[i].raffleId + "号" + data.data.gift[i].type + "抽奖已经参加过了");
                                } else {
                                    if (data.data.gift[i].status == 1) {
                                        setTimeout(getSmallTV_join, (data.data.gift[i].time_wait * 1000) + 1000, roomid, short_id, data.data.gift[i]);
                                        msg("等待参加直播间【" + short_id + "】的" + data.data.gift[i].raffleId + "号" + data.data.gift[i].type + "抽奖，还有 " + data.data.gift[i].time_wait + " 秒开奖", "success", 5000);
                                        console.log(CurentTime() + "等待参加直播间【" + short_id + "】的" + data.data.gift[i].raffleId + "号" + data.data.gift[i].type + "抽奖，还有 " + data.data.gift[i].time_wait + " 秒开奖");
                                    }
                                }

                            }
                            for (i = 0; i < data.data.guard.length; i++) {
                                if (data.data.guard[i].status == 1) {
                                    setTimeout(getGuard_join, (data.data.guard[i].time_wait * 1000), roomid, short_id, data.data.guard[i]);
                                    // console.error("Guard",data.data.guard);
                                }
                            }
                        } else {
                            msg("在查找礼物的时候出错", "caution", 5000);
                            console.error("ERROR", CurentTime(), "smallTvCheck", data);
                        }
                    }
                });
            }

            function getSmallTV_join(roomid, short_id, data_g) {
                if (window.lotteryList.includes(data_g.raffleId)) {
                    console.log(CurentTime() + "(join)已经参加直播间【" + short_id + "】中【" + data_g.raffleId + "】的抽奖 ");
                } else {
                    console.log(data_g);
                    window.history.pushState({}, 0, 'https://live.bilibili.com/' + short_id);
                    $.ajax({
                        type: "post",
                        url: "//api.live.bilibili.com/xlive/lottery-interface/v5/smalltv/join",
                        data: {
                            roomid: roomid,
                            id: data_g.raffleId,
                            type: data_g.type,
                            csrf_token: getCookie("bili_jct"),
                            csrf: getCookie("bili_jct"),
                            visit_id: ""
                        },
                        datatype: "jsonp", //"xml", "html", "script", "json", "json", "text".
                        crossDomain: true,
                        xhrFields: {
                            withCredentials: true
                        },
                        success: function(data) {
                            if (data.code === 0) {
                                window.lotteryList.push(data_g.raffleId);
                                msg("你从直播间【" + short_id + "】抽到了【" + data_g.from_user.uname + "】赠送的礼物(" + data_g.raffleId + ")： " + data.data.award_name + " X " + data.data.award_num + " !", "success", 5000);
                                console.log(CurentTime() + "你从直播间【" + short_id + "】抽到了【" + data_g.from_user.uname + "】赠送的礼物(" + data_g.raffleId + ")： " + data.data.award_name + " X " + data.data.award_num + " !");
                            } else if (data.code === 400) {
                                close();
                                getSmallTV_close();
                                msg("被禁止访问", "caution", 5000);
                                console.error("ERRROR", "关闭脚本", CurentTime(), "smallTvJoin", data);
                            } else {
                                msg("参加小电视抽奖失败了 (´･_･`)", "caution", 5000);
                                console.error("ERRROR", CurentTime(), "smallTvJoin", data);
                            }
                        }
                    });
                }

            }

            function getGuard_join(roomid, short_id, data_g) {
                console.log(data_g);
                window.history.pushState({}, 0, 'https://live.bilibili.com/' + short_id);
                $.ajax({
                    type: "post",
                    url: "//api.live.bilibili.com/xlive/lottery-interface/v3/guard/join",
                    data: {
                        roomid: roomid,
                        type: data_g.keyword,
                        id: data_g.id,
                        csrf_token: getCookie("bili_jct"),
                        csrf: getCookie("bili_jct"),
                        visit_id: ""
                    },
                    datatype: "jsonp", //"xml", "html", "script", "json", "json", "text".
                    crossDomain: true,
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function(data) {
                        if (data.code === 0) {
                            msg("你从直播间【" + short_id + "】抽到了【" + data_g.sender.uname + "】赠送的礼物： " + data.data.award_text + " !", "success", 5000);
                            console.log(CurentTime() + "你从直播间【" + short_id + "】抽到了【" + data_g.sender.uname + "】赠送的礼物： " + data.data.award_text + " !");
                        } else if (data.code === 400) {
                            close();
                            getSmallTV_close();
                            msg("被禁止访问", "caution", 5000);
                            console.error("ERRROR", "关闭脚本", CurentTime(), "smallTvJoin", data);
                        } else {
                            msg("参加小电视抽奖失败了 (´･_･`)", "caution", 5000);
                            console.error("ERRROR", CurentTime(), "smallTvJoin", data);
                        }
                    }
                });
            }


            Listener_smalltv();
            /****************************************************************/
            var pr = $("#gift-control-vm"); //礼物栏
            pr.append("<div id='helper_probar'><span id='helper_progress'></span></div>");
            $("body").append("<style>.helper_msg{pointer-events: auto !important;}#helper_probar{position:absolute;top:0px;width:100%;height:3px;border-radius:1.5px;background-color:#666;z-index:0}#helper_progress{position:absolute;height:3px;width:0;border-radius:3px;background-color:#fff;transition:all 1s linear}#helper_canvas,#helper_img{display:block}.blue-shadow{box-shadow:0 0 10px 1px #3B8CF8,0 0 1px #3B8CF8,0 0 1px #3B8CF8,0 0 1px #3B8CF8,0 0 1px #3B8CF8,0 0 1px #3B8CF8,0 0 1px #3B8CF8}.green-shadow{box-shadow:0 0 10px 1px #68B37A,0 0 1px #68B37A,0 0 1px #68B37A,0 0 1px #68B37A,0 0 1px #68B37A,0 0 1px #68B37A,0 0 1px #68B37A}.pink-shadow{box-shadow:0 0 10px 1px #FD4275,0 0 1px #FD4275,0 0 1px #FD4275,0 0 1px #FD4275,0 0 1px #FD4275,0 0 1px #FD4275,0 0 1px #FD4275}.helper_hide{visibility:hidden}.helper_none,.helper_group{position: fixed;left: 0;top: 0;width:70%;height:70%;z-index: 10000;background: white;}</style>");
            var progress = $("span#helper_progress");

            function getSmallTV_close() {
                $(document).off("DOMNodeInserted");
                $("#helper_probar").css("background-color", "rgb(227, 98, 9)");
            }

            function close() {
                clearInterval(window.clo);
                $("#helper_progress").remove();
            }

            function showHelp() {
                $("body").append('<style>#helper_help{width:100%;height:100%;top:0;left:0;position:fixed;z-index:999999;background-color:rgba(0,0,0,.4);overflow:hidden;word-break:break-all}.helper_lisences{background-color:#555;box-shadow:0 0 15px #111;margin-left:20%;margin-top:10px;width:60%;font-size:18px;color:#fff;border-radius:5px;border:1px solid #fff;padding:5px 10px}</style><div id="helper_help"><div class="helper_lisences"><p><em>当你看到该提示，说明你的脚本是第一次启动或在最近发生了更新，请阅读以下说明 (5秒后可点击空白处关闭)</em></p><h4>使用须知：</h4><ul><li>请勿宣传，闷声发财</li><li>使用本脚本而导致的一切后果由你本人承担</li><li>MIT协议，在任何情况下对本脚本进行二次开发均需在UI中注明版权</li></ul><h4>功能简介：</h4><ul><li>单击进度条白色部分：查看宝箱领取进度</li><li>双击进度条灰色部分：查看低保领取情况</li><li>右键单击进度条，拖动绿色提示：更改脚本提示信息的位置</li></ul><h4>注意事项：（重要）</h4><ul><li>兼容：FireFox/Chrome + Tampermonkey 。其他兼容性问题概不负责</li><li>已知与助手不兼容</li><li>仅保留最后一个直播间的脚本生效，回到原直播间的话，请刷新</li><li>进度条显示在视频下方，自动领瓜子开始时将自动隐藏宝箱</li><li>领低保功能存在延迟（20秒），有失败的可能性，非脚本问题</li><li>长时间挂机有可能导致网站检测离线，脚本工作不正常，非脚本问题</li><li>本脚本由mscststs的bililive脚本二开而成</li><li>showHelp可再次打开本帮助</li></ul></div></div>');
                setTimeout(function() {
                    window.localStorage["helper_help"] = "3.00";
                    $("#helper_help").css("background-color", "none");
                    $("#helper_help").click(function() {
                        $("#helper_help").fadeOut(function() {
                            $(this).remove();
                        });
                    });
                }, 5000);
            }
            window.box = function() {
                if (isExist()) {
                    msg("自动领瓜子已启动");
                    start();
                } else {
                    msg("没有瓜子哦", "caution");
                }
            }

            function init() {
                if (window.localStorage["helper_help"] != "3.00") {
                    showHelp();
                }
                $(document).on("contextmenu", "#helper_probar", function() {
                    return false;
                });
                $(document).on("click", ".helper_msg", function() {
                    $(".helper_msg").fadeOut().remove();
                });
                $(document).on("mousedown", "#helper_probar", function(e) {
                    //右键为3
                    if (3 == e.which) {
                        var text = "拖动这个来移动通知的位置";
                        var level = "success";
                        window.localStorage["helper_msg_left"] = "400px";
                        window.localStorage["helper_msg_top"] = "500px";
                        var left = window.localStorage["helper_msg_left"];
                        var top = window.localStorage["helper_msg_top"];
                        $("body").append('<div class="link-toast helper_msg ' + level + '" style="left: ' + left + '; top: ' + top + ';"><span class="toast-text">' + text + '</span></div>');
                        $(".helper_msg").slideDown(function() {
                            $(this).dragDiv();
                        });
                    }
                });
                document.domain = "bilibili.com";
                window.helper_errcount = 0;
                window.ontask = 0;
                window.helper_id = getMiliSeconds(); //脚本序列号
                window.localStorage.id = window.helper_id;
                setTimeout(window.box, 20000);
                var date = new Date().toLocaleDateString();
                if (localStorage.livejs_Sign != date) {
                    setTimeout(function() {
                        signGet();
                    }, 10000);
                } else {
                    console.log('Sign', date + "用户已经签到过");
                }
                if (localStorage.livejs_mainTask != date) {
                    setTimeout(function() {
                        mainTask();
                    }, 12000);
                } else {
                    console.log('mainTask', date + "用户已经完成主站任务");
                }
                var yestoday = new Date(new Date().setDate(new Date().getDate() - 1)).toLocaleDateString();
                if (localStorage.livejs_GroupSign != date && (localStorage.livejs_GroupSign != yestoday || new Date().getHours() > 6)) { //6点前不得签到
                    setTimeout(function() {
                        groupListGet();
                    }, 15000);
                } else {
                    console.log('Grouplist', date + "勋章已经签到过");
                }
                if (localStorage.livejs_WatchTask != date) {
                    setTimeout(function() {
                        doubleWatchTaskCheck();
                    }, 25000);
                } else {
                    console.log('DoubleWatch', date + "DoubleWatch任务完成");
                }
                var js = document.createElement("script");
                js.src = "https://cdn-1251935573.cos.ap-chengdu.myqcloud.com/ocrad.js";
                document.body.insertBefore(js, document.body.firstChild);
                var audio = document.createElement("audio");
                audio.id = "msg";
                audio.src = "https://wx.qq.com/zh_CN/htmledition/v2/sound/msg.mp3";
                document.body.insertBefore(audio, document.body.firstChild);
            }
            init();

            function mobileHeartBeat() {
                $("body").append("<iframe class='helper_group' style='display:none' src='https://api.live.bilibili.com/mobile/userOnlineHeart'></iframe>");
            }
            window.doubleWatchTaskCheck = function doubleWatchTaskCheck() {
                $.ajax({
                    type: "get",
                    url: "//api.live.bilibili.com/i/api/taskInfo",
                    datatype: "jsonp", //"xml", "html", "script", "json", "json", "text".
                    crossDomain: true,
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function(data) {
                        if (data.data.double_watch_info.status === 0 || data.data.double_watch_info.status === 1) {
                            if (data.data.double_watch_info.progress.now == 2) {
                                setTimeout(function() {
                                    dobuleWatchTaskDo();
                                }, 5000);
                            } else {
                                setTimeout(function() {
                                    mobileHeartBeat();
                                }, 5 * 60 * 1000 - 5000);
                            }
                        } else {
                            console.log("doubleWatchTaskCheck", "status:" + data.data.double_watch_info.status);
                            localStorage.livejs_WatchTask = new Date().toLocaleDateString();
                        }
                    }
                });
            }

            function dobuleWatchTaskDo() {
                $.ajax({
                    type: "post",
                    url: "//api.live.bilibili.com/activity/v1/task/receive_award",
                    data: {
                        task_id: 'double_watch_task',
                        csrf_token: getCookie("bili_jct"),
                    },
                    datatype: "jsonp", //"xml", "html", "script", "json", "json", "text".
                    crossDomain: true,
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function(data) {
                        //console.log('sign',data);
                        if (data.code === 0) {
                            console.log("doubleWatchTaskDo", "成功");
                            localStorage.livejs_WatchTask = new Date().toLocaleDateString();
                        } else {
                            console.error("Error", "doubleWatchTaskDo", data);
                        }
                    }
                });
            }

            function mainTask() {
                $.ajax({
                    type: "POST",
                    url: "//api.bilibili.com/x/web-interface/share/add",
                    datatype: "jsonp", //"xml", "html", "script", "json", "json", "text".
                    data: {
                        aid: 93820656,
                        csrf: getCookie("bili_jct")
                    },
                    crossDomain: true,
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function(data) {
                        console.log('share', data);
                    }
                });
                $.ajax({
                    type: "POST",
                    url: "//api.bilibili.com/x/report/web/heartbeat",
                    datatype: "jsonp", //"xml", "html", "script", "json", "json", "text".
                    data: {
                        aid: 93820656,
                        cid: 160183216,
                        mid: 6677354, // uid
                        start_ts: Math.round(Date.now() / 1000),
                        played_time: 0,
                        realtime: 0,
                        type: 3,
                        play_type: 1, // 1:播放开始，2:播放中
                        dt: 2,
                        csrf: getCookie("bili_jct")
                    },
                    crossDomain: true,
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function(data) {
                        console.log('watch', data);
                    }
                });
                console.log('MainTask','完成');
                localStorage.livejs_mainTask = new Date().toLocaleDateString();
            }

            function signGet() {
                $.ajax({
                    type: "get",
                    url: "//api.live.bilibili.com/sign/GetSignInfo",
                    datatype: "jsonp", //"xml", "html", "script", "json", "json", "text".
                    crossDomain: true,
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function(data) {
                        //console.log('sign',data);
                        if (data.code === 0) {
                            if (data.data.status === 0) {
                                setTimeout(function() {
                                    signDo();
                                }, 2000);
                            } else {
                                console.log("SignGet", "签到过了，status:" + data.data.status + "获得" + data.data.text + data.data.specialText);
                                localStorage.livejs_Sign = new Date().toLocaleDateString();
                            }
                        } else {
                            console.error("ERROR", "Sign", "获取签到信息失败");
                        }
                    }
                });
            }

            function signDo() {
                $.ajax({
                    type: "get",
                    url: "//api.live.bilibili.com/sign/doSign",
                    datatype: "jsonp", //"xml", "html", "script", "json", "json", "text".
                    crossDomain: true,
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function(data) {
                        //console.log('sign',data);
                        if (data.code === 0) {
                            console.log("SignDo", "签到成功，" + data.data.text);
                            localStorage.livejs_Sign = new Date().toLocaleDateString();
                        } else if (data.code === -500) {
                            console.log("SignDo", "今天已签到过了");
                            localStorage.livejs_Sign = new Date().toLocaleDateString();
                        } else {
                            console.error("ERROR", "SignDo", data);
                        }
                    }
                });
            }

            function groupListGet() {
                $("body").append("<iframe class='helper_group' style='display:none' src='https://api.live.bilibili.com/link_group/v1/member/my_groups'></iframe>");
            }
            window.start = function start() {
                $("#helper_progress").click(function() {
                    msg("第" + window.round + "轮，第" + window.rank + "个宝箱", "caution", 5000);
                });
                window.round = parseInt($("#gift-control-vm  div.round-count.t-center > span").text().slice(2, 3));
                window.rank = $("div.in-countdown span").text().slice(0, 1) / 3;
                switch_color(window.rank);
                window.localStorage["helper_time"] = getSeconds();
                $("div.treasure-box").fadeOut();
                window.clo = setInterval(function() {
                    var per = (getSeconds() - window.localStorage["helper_time"]) / (window.rank * 180) * 100;
                    if (per > 100) {
                        per = 100;
                    }
                    setProgress(per + "%");
                    if (window.localStorage["id"] != window.helper_id) {
                        close();
                        getSmallTV_close();
                        msg("在其他房间打开了", "caution");
                    } //判断是否在其他房间打开了
                    if ((getSeconds() - window.localStorage["helper_time"]) / (window.rank * 180) > 1) {
                        //可以领取瓜子时
                        if (window.ontask == 0) { //判断是否已经在执行领取过程
                            ontask = 1;
                            console.log(CurentTime() + "进入验证码识别回调过程");
                            $("body").append("<iframe class='helper_none' src='//api.live.bilibili.com/lottery/v1/SilverBox/getCaptcha?ts=" + getMiliSeconds() + "'></iframe>");
                            setTimeout(function() {
                                document.querySelector(".helper_none").contentWindow.postMessage("", "*");
                            }, 2000);
                            setTimeout(function() {
                                window.parent.h5alert("");
                            }, 4000);
                        }
                    }
                }, 1000);
            }

            function turn() {
                window.localStorage["helper_time"] = getSeconds();
                if (window.rank == 3 && window.round >= parseInt($("#gift-control-vm  div.round-count.t-center > span").text().slice(6, 7))) {
                    close();
                    msg("瓜子领取完毕啦");
                } else if (window.rank == 3) {
                    window.round++;
                    window.rank = 1;
                } else {
                    window.rank++;
                }
                switch_color(window.rank);
            }

            function setProgress(percent) {
                var progress = $("span#helper_progress");
                progress.css("width", percent);
            }

            function switch_color(rank) {
                var progress = $("span#helper_progress");
                $("span#helper_progress").removeClass();
                if (rank == 1) {
                    $("span#helper_progress").addClass("green-shadow"); //第一个箱子
                } else
                if (rank == 2) {
                    $("span#helper_progress").addClass("blue-shadow"); //第二个箱子
                } else
                if (rank == 3) {
                    $("span#helper_progress").addClass("pink-shadow"); //第三个箱子
                }
            }

            function isExist() {
                var time = $("#gift-control-vm  div.count-down").text() || "00:00";
                if (time != "00:00") {
                    return true;
                }
                return false;
            }

            function getSeconds() { //取得秒数时间戳
                return Date.parse(new Date()) / 1000;
            }

            function getMiliSeconds() { //取得毫秒数时间戳
                return (new Date()).valueOf();
            }

            function msg(text, level, time) {
                text = text || "这是一个提示";
                level = level || "success";
                time = time || 2000;
                if (level != "success") {
                    console.log(text);
                }
                var id = (new Date()).valueOf();
                if (window.localStorage["helper_msg_left"]) {} else {
                    window.localStorage["helper_msg_left"] = "400px";
                }
                if (window.localStorage["helper_msg_top"]) {} else {
                    window.localStorage["helper_msg_top"] = "500px";
                }

                var left = window.localStorage["helper_msg_left"];
                var top = window.localStorage["helper_msg_top"];
                $("body").append('<div class="link-toast ' + level + '"data-id="' + id + '" style="left: ' + left + '; top: ' + top + ';"><span class="toast-text">' + text + '</span></div>');
                $("div.link-toast[data-id='" + id + "']").slideDown("normal", function() {
                    setTimeout(function() {
                        $("div.link-toast[data-id='" + id + "']").fadeOut("normal", function() {
                            $("div.link-toast[data-id='" + id + "']").remove();
                        });
                    }, time);
                });
            }

            function refreshSilver(val) {
                document.querySelector(".item.seeds.pointer .svg-icon.silver-seed.v-middle").nextSibling.innerHTML = val;
            }

            function ticket(data) { //对ajax数据进行判断
                $("iframe.helper_none").remove();
                if (data.code != "0") {
                    console.log(data);
                    if (window.helper_errcount++ == 3) {
                        close();
                        msg("出错过多，已关闭脚本，详情见控制台Log");
                    }
                } else {
                    //console.log(data);
                    msg("成功领取" + data.data.awardSilver + "个瓜子，目前瓜子总数：" + data.data.silver, "success", 3000);
                    console.log(CurentTime() + "成功领取" + data.data.awardSilver + "个瓜子，目前瓜子总数：" + data.data.silver);
                    window.helper_errcount = 0;
                    turn();
                    currentTask();
                    refreshSilver(data.data.silver);
                }
                ontask = 0;
            }

            function currentTask() {
                console.log(CurentTime() + "获取新一轮宝箱");
                $.ajax({
                    type: "get",
                    url: "//api.live.bilibili.com/lottery/v1/SilverBox/getCurrentTask",
                    datatype: "jsonp", //"xml", "html", "script", "json", "json", "text".
                    crossDomain: true,
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function(data) {
                        console.log("silverCurrentTask", "code:" + data.code + "message:" + data.message);
                    },
                    error: function(data) {
                        msg("自动领瓜子出错啦！！", "caution");
                        console.error("ERROR", "silverCurrentTask", data);
                    }
                });
            }
            window.valid = function(valid) {
                console.log(CurentTime() + "尝试回调成功，可以获取" + valid);
                var ntime = getSeconds();
                $.ajax({
                    type: "get",
                    url: "//api.live.bilibili.com/lottery/v1/SilverBox/getAward",
                    data: {
                        time_start: ntime - window.rank * 180,
                        end_time: ntime,
                        captcha: valid
                    },
                    datatype: "jsonp", //"xml", "html", "script", "json", "json", "text".
                    crossDomain: true,
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function(data) {
                        ticket(data);
                    },
                    error: function(data) {
                        msg("自动领瓜子出错啦！！", "caution");
                        console.error("ERROR", "silverCurrentTask", data);
                    }
                });
            };
            window.h5alert = function() {
                if (window.Notification) {
                    if (window.Notification.permission == "granted") {
                        var noti = new Notification('FreeSilverGET', {
                            body: "Input Captcha",
                            icon: "//www.bilibili.com/favicon.ico"
                        });
                        noti.onclick = function() {
                            window.focus();
                            noti.close();
                        };
                    } else {
                        window.Notification.requestPermission();
                    }
                }
                document.getElementById("msg").play();
            };
            window.recognize = function(ctx) {
                return OCRAD(ctx);
            };
            window.GroupSign = function(group_id, owner_id, medal, ext) {
                $.ajax({
                    type: "get",
                    url: "//api.live.bilibili.com/link_setting/v1/link_setting/sign_in",
                    data: {
                        group_id: group_id,
                        owner_id: owner_id
                    },
                    datatype: "jsonp", //"xml", "html", "script", "json", "json", "text".
                    crossDomain: true,
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function(data) {
                        if (data.code === 0) {
                            if (data.data.status === 0) {
                                console.log('GroupSign', ext, "勋章【" + medal + "】签到成功，亲密度+" + data.data.add_num);
                            } else {
                                console.log('GroupSign', ext, "勋章【" + medal + "】签到失败，亲密度+" + data.data.add_num + ",status:" + data.data.status);
                            }
                        } else {
                            console.error("ERROR", 'GroupSign', data);
                        }
                    }
                });
            };
            window.silver2coin = function() {
                $.ajax({
                    type: "get",
                    url: "//api.live.bilibili.com/pay/v1/Exchange/silver2coin",
                    datatype: "jsonp", //"xml", "html", "script", "json", "json", "text".
                    crossDomain: true,
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function(data) {
                        if (data.code === 0) {
                            console.log('silver2coin', data);
                        } else {
                            console.error("ERROR", 'silver2coin', data);
                            msg(data.msg);
                        }
                    }
                });
            };
        });
    }
})();
