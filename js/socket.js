

export default class Socket {
    constructor() {
        this.server="wss://l-su16.iterator-traits.com:12306/game/socket";
        this.initSocket();
    }

    initSocket(){

        wx.connectSocket({
            url: this.server,
            header:{
                'content-type': 'application/json'
            },
            protocols: ['protocol1'],
            method:"GET",
        });

    }

    sendMsg(msg) {
            wx.sendSocketMessage({
                data:msg
            });
    }
}
