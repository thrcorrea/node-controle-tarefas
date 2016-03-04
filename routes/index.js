var express = require('express');
var router = express.Router();
var pg = require('pg');
var connectionString = 'postgres://postgres:postgres@localhost:5432/tarefas';
//var connectionString = process.env.DATABASE_URL || 'postgres://postgr:fat2013@201.22.212.163:5432/tarefas';
var path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  //res.render('index', { title: 'Express' });
  res.sendFile(path.join(__dirname, '../views', 'index.html'));
});

router.get('/login', function(req, res){
  //res.render('login.ejs', { message: req.flash('loginMessage') });
  res.render('login.ejs');
  //res.sendFile(path.join(__dirname, '../views', 'index.html'));
});

router.post('/tarefas', function (req, res, next){

  var results = [];

  var data = {descr_tarefa: req.body.descr_tarefa};

  pg.connect(connectionString, function(err, client, done){
    if(err){
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }

    //client.query("insert into tarefas(descr_tarefa, cod_usuario) values ($1, $2)",[data.descr_tarefa, 1]);
    client.query("select f_insere_tarefa($1,$2)",[data.descr_tarefa, 1]);

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

router.post('/periodos/:id_tarefa', function(req, res, next){

  var results = [];

  var id_tarefa = req.params.id_tarefa;

  pg.connect(connectionString, function(err, client, done){
    if (err){
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }

    client.query("insert into tarefas_periodos(cod_tarefa, data_hora_tarefa_inicio) values ($1, cast(current_timestamp as timestamp without time zone))",[id_tarefa]);

    var query = client.query("select * from tarefas_periodos where cod_tarefa = $1 order by id_tarefa_periodo desc",[id_tarefa]);

    query.on('row', function(row){
      results.push(row);
    })

    query.on('end', function(){
      done();
      return res.json(results);
    })

  });

});

router.get('/tarefas', function(req, res, next){

  var results = [];

  pg.connect(connectionString, function(err, client, done){
    if (err){
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }

    var query = client.query("select ta.id_tarefa, ta.descr_tarefa, coalesce(( "+
       "select sum(coalesce(periodo,0)) from tarefas_periodos tp where "+
       "cod_tarefa = ta.id_tarefa ),0) as periodo "+
       ", coalesce((select id_tarefa_periodo from tarefas_periodos where cod_tarefa = ta.id_tarefa and data_hora_tarefa_fim is null order by id_tarefa_periodo desc limit 1),0) as id_tarefa_periodo "+
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

router.get('/periodos/:id_tarefa', function(req, res, next){
  var results = [];

  var id_tarefa = res.params.id_tarefa;

  pg.connect(connectionString, function(err, client, done){
    if (err){
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }

    var query = client.query("select * from tarefas_periodos where cod_tarefa = $1",[id_tarefa]);

    query.on('row', function(row){
      results.push(row);
    });

    query.on('end', function(){
      done();
      return res.json(results);
    });

  });

});

router.put('/periodos/:id_periodo', function(req, res, next){
  var results = [];

  var id_periodo = req.params.id_periodo;

  pg.connect(connectionString, function(err, client, done){
    if(err){
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }

    client.query("update tarefas_periodos set data_hora_tarefa_fim = (cast(current_timestamp as timestamp without time zone)) where id_tarefa_periodo = $1",[id_periodo]);

    var query = client.query("select ta.id_tarefa, ta.descr_tarefa, coalesce(( "+
       "select sum(coalesce(periodo,0)) from tarefas_periodos tp where "+
       "cod_tarefa = ta.id_tarefa ),0) as periodo "+
       ", coalesce((select id_tarefa_periodo from tarefas_periodos where cod_tarefa = ta.id_tarefa and data_hora_tarefa_fim is null order by id_tarefa_periodo desc limit 1),0) as id_tarefa_periodo "+
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

router.delete('/tarefas/:id_tarefa', function(req, res, next){

  var results = [];

  var id_tarefa = req.params.id_tarefa;

  pg.connect(connectionString, function(err, client, done){
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

module.exports = router;
