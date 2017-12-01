/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    path = require('path'),
    fs = require('fs'),
    os = require('os'),
    VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3')
    uuid = require('uuid');

var app = express();
 
var visual_recognition = new VisualRecognitionV3({
  api_key: 'INSIRA A API KEY AQUI',
  version_date: VisualRecognitionV3.VERSION_DATE_2016_05_20
  });


var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var logger = require('morgan');
var errorHandler = require('errorhandler');
// var multipart = require('connect-multiparty')
// var multipartMiddleware = multipart();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(logger('dev'));

app.use(bodyParser.urlencoded({
    extended: true,
    limit: '50mb'
}));
app.use(bodyParser.json({
  extended: true,
  limit: '50mb'
}));

app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(errorHandler());
}

var parseBase64Image = function(imageString) {
  var matches = imageString.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
  var resource = {};
  // console.log('matches', matches);

  if (matches.length !== 3) {
    return null;
  }

  resource.type = matches[1] === 'jpeg' ? 'jpg' : matches[1];
  resource.data = new Buffer(matches[2], 'base64');
  return resource;
};

app.get('/', routes.index);

app.post('/api', function (req, res) {
    var images_file = req.body.images_file
    images_file = images_file.replace(/\n/g, "");
    var params = {};
    var resource = parseBase64Image(images_file);
    var temp = path.join(os.tmpdir(), `${uuid.v4()}.${resource.type}`);
    
    fs.writeFileSync(temp, resource.data);
    params.images_file = fs.createReadStream(temp);
 
    var data = {}
    var data = {"faces":[], "timestamp": new Date(), "male":0, "female":0, "classes":[]}
    var male= 0;
    var female = 0;
    
    visual_recognition.classify(params, function(err, resp) {
      if (err){
        console.log(err);
      }else{
        var classifiers = resp.images[0].classifiers[0].classes;
        console.log(JSON.stringify(classifiers, null, 2))
        if(classifiers != null){
          classifiers.forEach(function (item, idx){
            if(data.classes.length<3){
              data.classes.push(item.class);
            }
          });
        }

        params = {};
        params.images_file = fs.createReadStream(temp);
        visual_recognition.detectFaces(params, function(err, response) {
          if (err){
            console.log(err);
          } else {
              if(response.images[0].faces != null){
               response.images[0].faces.forEach(function(item, idx){
                  console.log(item)
                  data.faces.push(item.face_location);
                  if(item.gender.gender=='MALE'){
                    male+=1;
                  }else{
                    if(item.gender.gender=='FEMALE'){
                      female+=1;
                    }
                  } 
                });
                data.male=male;
                data.female=female;
              }
            console.log(JSON.stringify(data.faces, null, 2));
          }
          
          res.send(data);
        });    
      }
    });
});


http.createServer(app).listen(app.get('port'), '0.0.0.0', function() {
    console.log('Express server listening on port ' + app.get('port'));
});
