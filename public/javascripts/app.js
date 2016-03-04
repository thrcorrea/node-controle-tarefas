angular.module('tarefas',[])

.controller('mainController', function($scope, $http){

  $scope.formData = {};
  $scope.todoData = {};
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

  $scope.atualizar = function(){
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

  $scope.deleteTodo = function(todoID) {
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
        $http.post('/api/periodos/' + tarefaID)
          .success(function(data){
            $scope.atualizar();
          })
          .error(function(error){
            console.log('Error: ' + error);
            $scope.loading = true;
          })
      };

});
