            $(document).on("DOMNodeInserted",".system-msg.news",function(){
                var text = $(this).find("div").html();
                var m = parseInt(text.slice(text.indexOf("om/")+3,100));
                if(window.localStorage["id"]!=window.helper_id ){
                    close();
                    getSmallTV_close();
                    msg("在其他房间打开了","caution");
                    return;
                }//判断是否在其他房间打开了
                if(m>=0){
                    var delay = (parseInt(Math.random()*10)+1)*1000;//随机10秒以内延迟
                     setTimeout(function(){getlottery(m);},delay);//10秒延迟
                }
                else{
                }
            });
            
            
            
        function getlottery(room){
            getlottery_init(room);
        }



        function getlottery_init(roomid){
            $.ajax({
                    type: "get",
                    url: "//api.live.bilibili.com/room/v1/Room/room_init",
                    data: {
                        id:roomid
                    },
                    datatype: "jsonp",//"xml", "html", "script", "json", "json", "text".
                    crossDomain:true,
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function (data) {
                        //console.log(data);
                        if(data.code==0){
                            msg("正在帮你抢礼物啦~");
                            var room_id = data.data.room_id;
                            var short_id = data.data.short_id;
                            if(short_id==0){
                                short_id = room_id;
                            }
                            getlottery_check(room_id,short_id);
                        }else{
                            msg("在获取房间信息的时候出错！","caution",5000);
                        }
                    },
                    complete: function () {

                    },
                    //调用出错执行的函数
                    error: function () {
                    }
                });
        }
        function getlottery_check(roomid,short_id){
            $.ajax({
                    type: "get",
                    url: "//api.live.bilibili.com/activity/v1/Raffle/check",
                    data: {
                        roomid:roomid
                    },
                    datatype: "jsonp",//"xml", "html", "script", "json", "json", "text".
                    crossDomain:true,
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function (data) {
                        //console.log(data);
                        if(data.code==0){
                            var i=0;
                            for(i=0;i<data.data.length;i++){
                                var raffleId = data.data[i].raffleId;
                                if(data.data[i].status==1)
                                getlottery_join(roomid,raffleId,short_id);
                            }
                            if(i==0){
                                msg("在查找礼物的时候失败，是不是网速太慢了？","caution",5000);
                            }
                        }else{
                            msg("在查找礼物的时候出错","caution",5000);
                            console.log(data);
                        }
                    },
                    complete: function () {

                    },
                    //调用出错执行的函数
                    error: function () {
                    }
                });
        }
        function getlottery_join(roomid,raffleId,short_id){
            function timesec() {
              var tmp = Date.parse( new Date() ).toString();
              tmp = tmp.substr(0,10);
              return tmp;
            }
            //console.log(CurentTime()+"活动礼物："+roomid+"/"+raffleId+"/"+short_id);
            window.history.pushState({},0,'https://live.bilibili.com/'+roomid);
            $.ajax({
                    type: "get",
                    url: "//api.live.bilibili.com/activity/v1/Raffle/join",
                    data: {
                        roomid:roomid,
                        raffleId:raffleId
                    },
                    datatype: "jsonp",//"xml", "html", "script", "json", "json", "text".
                    crossDomain:true,
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function (data) {
                        //console.log(data);
                        if(data.code==0){
                            var restime = -(data.data.time-(-60)-timesec());//额外等一分钟
                            msg("成功参加了直播间【"+short_id+"】的活动抽奖，还有 "+restime+" 秒开奖","success",5000);
                            console.log(CurentTime()+"成功参加了直播间【"+short_id+"】的活动抽奖，还有 "+restime+" 秒开奖");
                            restime*=1000;
                            setTimeout(function(){
                                getlottery_notice(roomid,raffleId,short_id);
                            },restime);
                        }else{
                            if(data.code!=-400)
                            msg("参加活动抽奖失败了 (´･_･`)","caution",5000);
                            console.log(data);
                        }
                    },
                    complete: function () {
                    },
                    error: function () {
                    }
                });
        }
        function getlottery_notice(roomid,raffleId,short_id,steps){
            steps=steps||0;
            $.ajax({
                    type: "get",
                    url: "//api.live.bilibili.com/activity/v1/Raffle/notice",
                    data: {
                        roomid:roomid,
                        raffleId:raffleId
                    },
                    datatype: "jsonp",//"xml", "html", "script", "json", "json", "text".
                    crossDomain:true,
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function (data) {
                        //console.log(data);
                        if(data.code==0){
                            var gift_name = data.data.gift_name;
                            var gift_num = data.data.gift_num;
                            var gift_from = data.data.gift_from;
                            if(gift_num){
                                helper_gift_count(gift_name,gift_num);
                                msg("你从直播间【"+short_id+"】抽到了【"+gift_from+"】赠送的礼物： "+gift_name+" X "+gift_num+" !","success",5000);
                                console.log(CurentTime()+"你从直播间【"+short_id+"】抽到了【"+gift_from+"】赠送的活动礼物： "+gift_name+" X "+gift_num+" !");
                            }
                        }else{
                            if(steps<=3){
                                setTimeout(function(){
                                    getlottery_notice(roomid,raffleId,short_id,steps+1);
                                },60000);
                            }else{
                                msg("获取中奖信息时出错！","caution",5000);
                                console.log(data);
                            }

                        }
                    },
                    complete: function () {

                    },
                    //调用出错执行的函数
                    error: function () {
                    }
                });
        }