$( document ).ready(function() {

var theColors = ['#cefbe4', '#81ec72', '#5cd646', '#54d13c', '#4ccc32', '#43c728'];
var transactions = [];
stripX = [];
stripY = [];
dY = [];

var c = document.getElementById("c");
var ctx = c.getContext("2d");
c.height = window.innerHeight;
c.width = window.innerWidth;

for (var i = 0; i < 10; i++) {
    stripX[i] = Math.floor(Math.random()*1265);
    stripY[i] = -100;
    dY[i] = Math.floor(Math.random()*7)+3;
}

function drawStrip(x, y, j) {
    var TxidChar = transactions[j].split("");
    for (var k = 0; k <= 63; k++) {
        if (ctx.fillText) {
            switch (k) {
            case 0:
                ctx.fillStyle = theColors[0]; break;
            case 1:
                ctx.fillStyle = theColors[1]; break;
            case 3:
                ctx.fillStyle = theColors[2]; break;
            case 7:
                ctx.fillStyle = theColors[3]; break;
            case 13:
                ctx.fillStyle = theColors[4]; break;
            case 17:
                ctx.fillStyle = theColors[5]; break;
            }
            ctx.fillText(TxidChar[k], x, y);
        }
        y -= 15;
    }
}

function draw() {
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.shadowOffsetX = ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#94f475';
    
    for (var j = 0; j < transactions.length; j++) {
        ctx.font = '15px courier';
        ctx.textBaseline = 'top';
        ctx.textAlign = 'center';
        
        if (stripY[j] > 1358) {
            transactions.shift();
            stripX[j] = Math.floor(Math.random()*c.width);
            stripY[j] = -100;
            dY[j] = Math.floor(Math.random()*7)+3;
            drawStrip(stripX[j], stripY[j]);
        } else drawStrip(stripX[j], stripY[j], j);
        
        stripY[j] += dY[j];
    }
}

/** @constructor */
function TransactionSocket() {

}

TransactionSocket.init = function() {
    if (TransactionSocket.connection)
        TransactionSocket.connection.close();

    if ('WebSocket' in window) {
        var connection = new ReconnectingWebSocket('wss://bitcoin.toshi.io');
        TransactionSocket.connection = connection;

        connection.onopen = function() {
            var newTransactions = {"subscribe" : "transactions"};
            connection.send(JSON.stringify(newTransactions));
            connection.send(JSON.stringify({"fetch" : "latest_transaction"}));
        };

        connection.onmessage = function(e) {
            var response = JSON.parse(e.data);
            var transacted = 0;

            for (var i = 0; i < response.data.outputs.length; i++) {
                transacted += response.data.outputs[i].amount;
            }

            var bitcoins = transacted / 100000000;
            var txid = response.data.hash;

            transactions.push(txid);
            return;
        };

    } else {
        console.log("No websocket support.");
    }
};

TransactionSocket.close = function() {
    if (TransactionSocket.connection)
        TransactionSocket.connection.close();
};

window.onbeforeunload = function(e) {
    TransactionSocket.close();
};

TransactionSocket.init();
setInterval(draw, 33);

});
