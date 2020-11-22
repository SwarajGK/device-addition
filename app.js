const express = require("express");
const fs = require("fs");
const path = require('path');
const bodyParser = require("body-parser");
const app = express();
const jsonParser = bodyParser.json();
const rubyTemplates = require("./resources/helper/RubyFile");
const {
  devicesJSTemplate
} = require("./resources/helper/Jsfiles");

app.use(express.static(path.join(__dirname, 'public')));

function updateRubyResult(rubyPath, constantRbCode, afterDeviceName) {
  fs.readFile(rubyPath, function(err, data) {
    if (err) throw err;
    const array = data.toString().split("\n");
    const newList = array.map((line) => {
      if (line.includes(`{:device => '${afterDeviceName}'`)) {
        if (line.includes('},')) {
          return `${line}
      ${constantRbCode},`;
        }
        return `${line},
      ${constantRbCode}`;
      } else {
        return line;
      }
    });
    fs.writeFile(rubyPath, newList.join('\n'), function(err) {
      if (err) {
        res.json({ result: "error" });
      }
    });
  });
}

function getDevicesJSResult(devicesJSPath, deviceJSCode) {
  return fs
    .readFileSync(devicesJSPath)
    .toString()
    .replace('const devices = {', `const devices = {
  ${deviceJSCode},`);
}

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/device-list', (req, res) => {
  let listOfDevices = [];
  const railsapp = req.query.railsapp;
  fs.readFile(`${railsapp}/config/initializers/constants.rb`, function(err, data) {
    if (err) throw err;
    data.toString().split("\n").forEach((line) => {
      if (line.includes('{:device => ')) {
        listOfDevices.push(line.split("'")[1]);
      }
    });
    res.json({ list: listOfDevices });
  });
});

app.post("/device-info", jsonParser, (request, respond) => {
  const data = request.body;
  respond.send(
    `${devicesJSTemplate(data)}wonder-boy:${rubyTemplates(data)}`
  );
});

app.post("/update-files", jsonParser, (req, res) => {
  // /Users/swarajgandhi/Desktop/work-repo/railsApp
  const {
    railsAppPath,
    constantRbCode,
    devicesJSCode,
    realMobileScssCode,
    afterDeviceName,
  } = req.body;

  const rubyPath = `${railsAppPath}/config/initializers/constants.rb`;
  
  const devicesPath = `${railsAppPath}/react/app/live_shared/_const/devices.js`;
  const realMobileScssPath = `${railsAppPath}/app/assets/stylesheets/sass/shared/_real-mobile.scss`;

  updateRubyResult(rubyPath, constantRbCode, afterDeviceName);
  const devicesResult = getDevicesJSResult(devicesPath, devicesJSCode);

  fs.writeFile(devicesPath, devicesResult, function(err) {
    if (err) {
      res.json({ result: "error" });
    } else {
      fs.appendFile(realMobileScssPath, realMobileScssCode, function (err) {
        if (err) {
          res.json({ result: "error" });
        } else {
          res.json({ result: "success" });
        }
      });
    }
  });
});

app.listen(8080, () => {
  console.log('Listening on port 8080');
});

module.exports = app;
