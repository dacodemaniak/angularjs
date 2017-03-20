/**
 * @name chosesAFaire.js : Contrôleur permettant l'affichage des choses à faire
 * Contrôleur angularJS, donc à faire comprendre au framework
 */

// Définir l'application en tant que module AngularJS
var listingApp = angular.module("listingApp", [
	// Dépendances du module listingApp
	"todoList"
]);

// Définition du module todoList
var todoList = angular.module("todoList",[]);

/**
* Définition du contrôleur qui sera utilisé pour la vue listing.html
* $scope => définit la relation entre le contrôleur et la vue
**/
todoList.controller("listingCtrl", ["$scope", function($scope){
	var listeAFaire; // Joindre la variable listeAFaire de la vue avec le contrôleur
	
	// On va alimenter quelques données... tableau d'objets JSON
	listeAFaire = [
		{
			"titre": "Apprendre AngularJS",
			"completed": true
		},
		{
			"titre": "Reprendre les concepts MVC",
			"completed": true
		},
		{
			"titre": "Comprendre les directives AngularJS",
			"completed": true
		}
	];
	
	 $scope.listeAFaire = listeAFaire;
	 
	 // Méthode pour ajouter "automatiquement" une nouvelle entrée
	 $scope.addToList = function(){
		 // Récupération de la saisie utilisateur
		 var newTodo = $scope.newTodo.trim();
		 console.log("Saisie utilisateur : " + newTodo);
		 if(newTodo.length){ // On vérifie qu'il y a bien quelque chose dans le champ de saisie
			 $scope.listeAFaire.push(
					 {
						 "titre": newTodo,
						 "completed": false
					 }
				);
		 }
		 return;
	 }
	 
	 /**
	  * Définit la méthode pour supprimer une ligne dans ma liste de choses à faire
	  */
	 $scope.removeTodo = function(afaire){
		 console.log(JSON.stringify(afaire));
		 $scope.listeAFaire.splice($scope.listeAFaire.indexOf(afaire), 1);
	 }
}])