const express = require('express');
const routes = require('./routes');
const http = require('http');
const jade = require('jade');
const path = require ('path');
const urlencoded = require('url');
const bodyParser = require('body-parser');
const json = require('json');
const logger = require('logger');
const methodOverride = require('method-override');

const nano = require('nano')(`http://localhost:5984`);

var db = nano.use('address');
var app = express();

app.set('port', process.env.PORT || 5000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', jade);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', routes.index);

app.post('/createdb', (req, res)=> {
    nano.db.create(req.body.dbname, (err) =>{
        if(err){
            res.send('Error creating a database' + req.body.dbname);
            return;
        }
        res.send('Database' + req.body.dbname + ' created sucessfuly');
    });
});

app.post('/create_contact', (req, res)=>{
    var name = req.body.name;
    var phone = req.body.phone;

    db.insert({name: name, phone: phone, crazy: true}, phone, (err, body, header) => {
        if(err){
            res.send('Error creating contact');
            return;
        }
        res.send('Contact create sucessfuly')
    })
});

app.post('/view_contact', (req, res) => {
    var allDoc = "Following are the contacts";
    db.get(req.body.phone, {revs_info: true}, (err, body) => {
        if(!err){
            console.log(body);
        }
        if(body){
            allDoc += 'Name: '+ body.name + "<br/> Phone Nuber: " + body.phone;
        } 
        else {
            allDoc = 'No records found'
        }
        res.send(allDoc)
    });
});

app.post('/delete_contact', (req, res) =>{
    db.get(req.body.phone, {revs_info: true}, (err, body) =>{
        if(!err){
            db.destroy(req.body.phone, body._rev, (err, body) => {
                if(err){
                    res.send("Error deleting contact");
                }
                res.send('Contacts deleted sucessfuly');
            });
        };
    });
});

http.createServer(app).listen(app.get('port'), () => {
    console.log(`Express server listening on port: `, app.get('port'));
});