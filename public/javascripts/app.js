angular.module('tarefas',[])

.controller('mainController', function($scope, $interval, $http){

  $scope.formData = {};
  $scope.todoData = {};
  $scope.loading = true;
  $scope.notificacaoApresentada = false;
  $scope.notificacaoCafeApresentada = false;
  $scope.notificacaoPontoApresentada = false;

  $http.get('/api/tarefas')
        .success(function(data) {
            $scope.todoData = data;
            console.log(data);
            $scope.loading = false;
        })
        .error(function(error) {
            console.log('Error: ' + error);
            $scope.loading = true;
        });

  function Notifique(){
    if ($scope.notificacaoApresentada == false){
      var options = {
        body: "Atualize os horários de suas FOs.",
        dir : "ltr"
      };
      if (!("Notification" in window)) {
        alert("This browser does not support desktop notification");
      }
      else if (Notification.permission === "granted") {

        var notification = new Notification("Atenção",options);
        $scope.notificacaoApresentada = true;
      }
    }
  };

  function controlePonto(){
    if ($scope.notificacaoPontoApresentada == false){
      var options = {
        body: "Está na hora de bater o ponto.",
        dir : "ltr"
      };
      if (!("Notification" in window)) {
        alert("This browser does not support desktop notification");
      }
      else if (Notification.permission === "granted") {

        var notification = new Notification("Atenção",options);
        $scope.notificacaoPontoApresentada = true;
      }
    }
  };

  function requisitaPermissaoNotificacao(){
    if (Notification.permission !== 'denied') {
      Notification.requestPermission(function (permission) {
        if (!('permission' in Notification)) {
          Notification.permission = permission;
        }
      });
    }
  };

  function horaDeNotificar(){
    var date = new Date();
    var h = date.getHours();
    var m = date.getMinutes();
    var dia = date.getDay();

    if (h == 11 && m > 50 && m < 59) {
      return true;
    }
    else if (h == 13 && m > 5 && m < 20) {
      return true;
    }
    else if ( ((h == 17 && dia != 5) || (h == 16 && dia == 5)) && m > 50 && m < 59 ) {
      return true;
    }
    else{
      return false;
    }
  };

  function horaDeNotificarPonto(){
    var date = new Date();
    var h = date.getHours();
    var m = date.getMinutes();
    var dia = date.getDay();

    if (h == 07 && m > 58 && m < 59) {
      return true;
    }
    else if (h == 12 && m > 58 && m < 59) {
      return true;
    }
    else{
      return false;
    }
  };

  var timer = $interval(function(){
    if (horaDeNotificar()){
      requisitaPermissaoNotificacao();
      Notifique();
    }
    else{
      $scope.notificacaoApresentada = false;
    }
  },1000);

  var timer = $interval(function(){
    if (horaDeNotificarPonto()){
      requisitaPermissaoNotificacao();
	  controlePonto();
    }
    else{
      $scope.notificacaoPontoApresentada = false;
    }
  },1000);

  $scope.atualizar = function(){
    $scope.loading = true;
    $http.get('/api/tarefas')
          .success(function(data) {
              $scope.todoData = data;
              console.log(data);
              $scope.loading = false;
          })
          .error(function(error) {
              console.log('Error: ' + error);
              $scope.loading = true;
          });
  };

//   var timerAtualizar = $interval(function(){
//     $scope.atualizar();
//   },60000 * 25);

  $scope.deleteTodo = function(todoID) {
    $scope.loading = true;
        $http.delete('/api/tarefas/' + todoID)
            .success(function(data) {
                $scope.atualizar();
            })
            .error(function(data) {
                console.log('Error: ' + data);
                $scope.loading = true;
            });
    };

    $scope.createTodo = function(todoID) {
      $scope.loading = true;
      $http.post('/api/tarefas', $scope.formData)
        .success(function(data) {
            $scope.formData.descr_tarefa = '';
            $scope.atualizar();
        })
        .error(function(error) {
            $scope.formData.descr_tarefa = '';
            console.log('Error: ' + error);
            $scope.loading = true;
        });
      };

      $scope.pauseTarefa = function(tarefaPeriodoID) {
        $scope.loading = true;
        $http.put('/api/periodos/' + tarefaPeriodoID)
          .success(function(data) {
              $scope.atualizar();
          })
          .error(function(error) {
              console.log('Error: ' + error);
              $scope.loading = true;
          });
        };

      $scope.iniciaTarefa = function(tarefaID){
        $scope.loading = true;
        $http.post('/api/periodos/' + tarefaID)
          .success(function(data){
            $scope.atualizar();
          })
          .error(function(error){
            console.log('Error: ' + error);
            $scope.loading = true;
          })
      };
      
      $scope.resetaTarefa = function(tarefaID){
        if(tarefaID > 0){
          $scope.loading = true;
          $http.delete('/api/periodos/' + tarefaID)
            .success(function(data){
              $scope.atualizar();
            })
            .error(function(error){
              console.log('Error: ' + error);
              $scope.loading = true;
            })
         }
      };

});
