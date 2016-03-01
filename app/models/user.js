var pg           = require('pg');

//var conString = "postgres://postgres:postgres@localhost:5432/tarefas";
var conString = process.env.DATABASE_URL || 'postgres://hd_faturamento:fat2013@192.168.232.17:5432/tarefas';

var client = new pg.Client(conString);


function User(){
    this.id_usuario = 0;
    //this.name ='';
    //this.photo ='';
    this.username = "";
    this.senha= ""; //need to declare the things that i want to be remembered for each user in the database

    this.validPassword = function(senha){
      console.log(senha);
      console.log(this.senha);
      return (senha == this.senha);
    };

    this.save = function(callback) {
        //var conString = "postgres://postgres:postgres@localhost:5432/auth";

        var client = new pg.Client(conString);
        client.connect();

        console.log(this.username +' will be saved');

            client.query('INSERT INTO usuarios(username, senha) VALUES($1, $2)', [this.username, this.senha], function (err, result) {
                if(err){
                    console.log(err);
                    return console.error('error running query', err);
                }
                //console.log(result.rows);
                //console.log(this.email);
            });
            client.query('SELECT * FROM usuarios ORDER BY id_usuario desc limit 1', null, function(err, result){

                if(err){
                    return callback(null);
                }
                //if no rows were returned from query, then new user
                if (result.rows.length > 0){
                    console.log(result.rows[0] + ' is found!');
                    var user = new User();
                    user.username= result.rows[0]['username'];
                    user.senha = result.rows[0]['senha'];
                    user.id_usuario = result.rows[0]['id_usuario'];
                    console.log(user.username);
                    client.end();
                    return callback(user);
                }
            });



            //whenever we call 'save function' to object USER we call the insert query which will save it into the database.
    };


}


User.findOne = function(username, callback){
    //var conString = "postgres://postgres:postgres@localhost:5432/auth";
    var client = new pg.Client(conString);

    var isNotAvailable = false; //we are assuming the email is taking
    //var email = this.email;
    //var rowresult = false;
    console.log(username + ' is in the findOne function test');
    //check if there is a user available for this email;
    client.connect();
    //client.connect(function(err) {
    ////    //console.log(this.photo);
    //    console.log(email);
    //    if (err) {
    //        return console.error('could not connect to postgres', err);
    //    }

    client.query("SELECT * from usuarios where username=$1", [username], function(err, result){
        var user;

        if(err){
            return callback(err, isNotAvailable, null);
        }
        //if no rows were returned from query, then new user
        if (result.rows.length > 0){
            user = new User();
            isNotAvailable = true; // update the user for return in callback
            user.id_usuario = result.rows[0].id_usuario;
            user.username = username;
            user.senha = result.rows[0].senha;
            console.log(username + ' is am not available!');
        }
        else{
            isNotAvailable = false;
            //email = email;
            console.log(username + ' is available');
        }
        //the callback has 3 parameters:
        // parameter err: false if there is no error
        //parameter isNotAvailable: whether the email is available or not
        // parameter this: the User object;

        client.end();
        return callback(false, isNotAvailable, user);


    });
//});
};

User.findById = function(id, callback){
    console.log("we are in findbyid");
    //var conString = "postgres://postgres:postgres@localhost:5432/auth";
    var client = new pg.Client(conString);

    client.connect();
    client.query("SELECT * from usuarios where id_usuario=$1", [id], function(err, result){

        if(err){
            return callback(err, null);
        }
        //if no rows were returned from query, then new user
        if (result.rows.length > 0){
            console.log(result.rows[0] + ' is found!');
            var user = new User();
            user.username= result.rows[0]['username'];
            user.senha = result.rows[0]['senha'];
            user.id_usuario = result.rows[0]['id_usuario'];
            console.log(user.username);
            client.end();
            return callback(null, user);
        }
        else{
          client.end();
        }
    });


};

//User.connect = function(callback){
//    return callback (false);
//};

//User.save = function(callback){
//    return callback (false);
//};

module.exports = User;
