var path = require('path');

var express = require("express");
var bodyParser = require("body-parser");
var minimist = require('minimist');
var Geetest = require('geetest'); // gt-node-sdk

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('./demo'));
app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, '/demo/login.html'));
});

var captcha1 = new Geetest({
    geetest_id: '7c25da6fe21944cfe507d2f9876775a9',
    geetest_key: 'f5883f4ee3bd4fa8caec67941de1b903'
});

app.get("/api/gt-register", function (req, res) {

    // 向极验申请每次验证所需的challenge
    captcha1.register(function (err, data) {
        if (err) {
            console.error(err);
            return;
        }

        if (!data.success) {
            // 进入 failback，如果一直进入此模式，请检查服务器到极验服务器是否可访问
            // 可以通过修改 hosts 把极验服务器 api.geetest.com 指到不可访问的地址

            // 为以防万一，你可以选择以下两种方式之一：

            // 1. 继续使用极验提供的failback备用方案
            res.send(data);

            // 2. 使用自己提供的备用方案
            // todo

        } else {
            // 正常模式
            res.send(data);
        }
    });
});
app.post("/api/gt-validate", function (req, res) {

    // 对ajax提供的验证凭证进行二次验证
    captcha1.validate({
        challenge: req.body.geetest_challenge,
        validate: req.body.geetest_validate,
        seccode: req.body.geetest_seccode
    }, function (err, success) {

        if (err) {
            // 网络错误
            res.send({
                status: 'error',
                msg: err
            });

        } else if (!success) {

            // 二次验证失败
            res.send({
                status: 'fail'
            });
        } else {
            res.send({
                status: 'success'
            });
        }

    });
});

var args = minimist(process.argv.slice(2));

var port = args.port || 9991;
app.listen(port, function () {
    console.log('localhost: ' + port)
});