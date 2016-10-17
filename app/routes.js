var express = require('express');
var router = express.Router();
var pg = require('pg');
var database = require('config/database.js');
var path = require('path');

module.exports = function(app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });

    // process the login form
    // app.post('/login', do all our passport stuff here);
    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/tarefas', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    // app.post('/signup', do all our passport stuff here);
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/tarefas', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
        console.log(req.user);
    });

    app.get('/tarefas', isLoggedIn, function(req, res){
      res.render('tarefas.ejs',{
        user : req.user
      });
    });

    // =====================================
    // FACEBOOK ROUTES =====================
    // =====================================
    // route for facebook authentication and login
    app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect : '/profile',
            failureRedirect : '/'
        }));


// =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/api/tarefas',isLoggedIn, function(req, res, next){

      var results = [];

      pg.connect(database.url, function(err, client, done){
        if (err){
          done();
          console.log(err);
          return res.status(500).json({success: false, data: err});
        }

        console.log('username: ' + req.user.username);

        var query = client.query("select ta.id_tarefa, ta.descr_tarefa, coalesce(( "+
           "select sum(coalesce(cast(periodo as integer),0)) from tarefas_periodos tp where "+
           "ativo and cod_tarefa = ta.id_tarefa ),0) as periodo "+
           ", coalesce((select id_tarefa_periodo from tarefas_periodos where ativo and cod_tarefa = ta.id_tarefa and data_hora_tarefa_fim is null order by id_tarefa_periodo desc limit 1),0) as id_tarefa_periodo "+
           "from tarefas ta where not coalesce(encerrada,false) and cod_usuario = $1 order by id_tarefa desc",[req.user.id_usuario]);

        query.on('row', function(row){
          results.push(row);
        });

        query.on('end', function(){
          done();
          return res.json(results);
        });

      });

    });

    app.delete('/api/tarefas/:id_tarefa',isLoggedIn, function(req, res, next){

      var results = [];

      var id_tarefa = req.params.id_tarefa;

      pg.connect(database.url, function(err, client, done){
        if(err){
          done();
          console.log(err);
          return res.status(500).json({success: false, data:err});
        }

        client.query("update tarefas set encerrada = true where id_tarefa = $1",[id_tarefa]);

        var query = client.query("select * from tarefas where not coalesce(encerrada,false)");

        query.on('row', function(row){
          results.push(row);
        });

        query.on('end', function(){
          done();
          return res.json(results);
        });

      });
    });

    app.post('/api/tarefas', isLoggedIn,function (req, res, next){

      var results = [];

      var data = {descr_tarefa: req.body.descr_tarefa};

      pg.connect(database.url, function(err, client, done){
        if(err){
          done();
          console.log(err);
          return res.status(500).json({success: false, data: err});
        }

        //client.query("insert into tarefas(descr_tarefa, cod_usuario) values ($1, $2)",[data.descr_tarefa, 1]);
        client.query("select f_insere_tarefa($1,$2)",[data.descr_tarefa, req.user.id_usuario]);

        var query = client.query("select * from tarefas where not coalesce(encerrada,false) order by id_tarefa desc");

        query.on('row', function(row){
          results.push(row);
        });

        query.on('end',function(){
          done();
          return res.json(results);
        });

      });

    });

    app.put('/api/periodos/:id_periodo', function(req, res, next){
      var results = [];

      var id_periodo = req.params.id_periodo;

      pg.connect(database.url, function(err, client, done){
        if(err){
          done();
          console.log(err);
          return res.status(500).json({success: false, data: err});
        }

        client.query("update tarefas_periodos set data_hora_tarefa_fim = (cast(current_timestamp as timestamp without time zone)) where id_tarefa_periodo = $1",[id_periodo]);

        var query = client.query("select ta.id_tarefa, ta.descr_tarefa, coalesce(( "+
           "select sum(coalesce(periodo,0)) from tarefas_periodos tp where "+
           "ativo and cod_tarefa = ta.id_tarefa ),0) as periodo "+
           ", coalesce((select id_tarefa_periodo from tarefas_periodos where ativo and cod_tarefa = ta.id_tarefa and data_hora_tarefa_fim is null order by id_tarefa_periodo desc limit 1),0) as id_tarefa_periodo "+
           "from tarefas ta where not coalesce(encerrada,false) order by id_tarefa desc");

        query.on('row', function(row){
          results.push(row);
        });

        query.on('end', function(){
          done();
          return res.json(results);
        });

      });

    });

    app.post('/api/periodos/:id_tarefa', function(req, res, next){

      var results = [];

      var id_tarefa = req.params.id_tarefa;

      pg.connect(database.url, function(err, client, done){
        if (err){
          done();
          console.log(err);
          return res.status(500).json({success: false, data: err});
        }

        client.query("insert into tarefas_periodos(cod_tarefa, data_hora_tarefa_inicio) values ($1, cast(current_timestamp as timestamp without time zone))",[id_tarefa]);

        var query = client.query("select * from tarefas_periodos where ativo and cod_tarefa = $1 order by id_tarefa_periodo desc",[id_tarefa]);

        query.on('row', function(row){
          results.push(row);
        })

        query.on('end', function(){
          done();
          return res.json(results);
        })

      });

    });
    
   app.delete('/api/periodos/:id_tarefa', function(req, res, next){

      var results = [];

      var id_tarefa = req.params.id_tarefa;

      pg.connect(database.url, function(err, client, done){
        if (err){
          done();
          console.log(err);
          return res.status(500).json({success: false, data: err});
        }

        client.query("update tarefas_periodos set ativo = false where cod_tarefa = $1",[id_tarefa]);

        var query = client.query("select * from tarefas_periodos where ativo and cod_tarefa = $1 order by id_tarefa_periodo desc",[id_tarefa]);

        query.on('row', function(row){
          results.push(row);
        })

        query.on('end', function(){
          done();
          return res.json(results);
        })

      });

    });
    
};



// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) {
        console.log('isLoggedin');
        return next();
    }
    console.log('is not logged in');

    // if they aren't redirect them to the home page
    res.redirect('/');
}
