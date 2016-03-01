angular.module('tarefas',[])

.controller('mainController', function($scope, $http){

  $scope.formData = {};
  $scope.todoData = {};

  $http.get('/api/tarefas')
        .success(function(data) {
            $scope.todoData = data;
            console.log(data);
        })
        .error(function(error) {
            console.log('Error: ' + error);
        });

  $scope.atualizar = function(){
    $http.get('/api/tarefas')
          .success(function(data) {
              $scope.todoData = data;
              console.log(data);
          })
          .error(function(error) {
              console.log('Error: ' + error);
          });
  };

  $scope.deleteTodo = function(todoID) {
        $http.delete('/api/tarefas/' + todoID)
            .success(function(data) {
                $scope.atualizar();
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };

    $scope.createTodo = function(todoID) {
      $http.post('/api/tarefas', $scope.formData)
        .success(function(data) {
            $scope.formData.descr_tarefa = '';
            $scope.atualizar();
        })
        .error(function(error) {
            $scope.formData.descr_tarefa = '';
            console.log('Error: ' + error);
        });
      };

      $scope.pauseTarefa = function(tarefaPeriodoID) {
        $http.put('/api/periodos/' + tarefaPeriodoID)
          .success(function(data) {
              $scope.atualizar();
          })
          .error(function(error) {
              console.log('Error: ' + error);
          });
        };

      $scope.iniciaTarefa = function(tarefaID){
        $http.post('/api/periodos/' + tarefaID)
          .success(function(data){
            $scope.atualizar();
          })
          .error(function(error){
            console.log('Error: ' + error);
          })
      };

});
