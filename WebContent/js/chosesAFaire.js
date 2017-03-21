/**
 * @name chosesAFaire.js : Contrôleur permettant l'affichage des choses à faire
 * Contrôleur angularJS, donc à faire comprendre au framework
 */

// Définir l'application en tant que module AngularJS
var listingApp = angular.module("listingApp", [
	// Dépendances du module listingApp
	"ngStorage", // Instance de gestion du localstorage
	"todoList"
]);

// Définition du module todoList
var todoList = angular.module("todoList",[]);

/**
* Définition du contrôleur qui sera utilisé pour la vue listing.html
* $scope => définit la relation entre le contrôleur et la vue
**/
todoList.controller("listingCtrl", ["$scope","$localStorage", function($scope, $localStorage){
	var listeAFaire = {}; // Joindre la variable listeAFaire de la vue avec le contrôleur
	
	var completedTasks = {}; // Un objet vide, pour comptabiliser le nombre de tâches complètes
	var currentTasks = {}; // Un objet vide, pour compter le nombre de tâches en cours
	
	// Récupérer les données du stockage local
	listeAFaire = $localStorage.todoList;
	
	// Injecter la liste dans la vue...
	if(listeAFaire != null){
		$scope.listeAFaire = listeAFaire; // Injecter le tableau à la vue 'listing.html'
		// Il faut compter la répartition des tâches
		completedTasks = calculCompleteTasks(listeAFaire); // Appelle un fonction pour calculer le nombre de tâches complètes
		// On peut facilement compter le nombre de tâches "incomplètes"
		currentTasks = (listeAFaire.length) - completedTasks;
	} else  {
		$scope.listeAFaire = []; // Définir un tableau vide...
		completedTasks = 0; // Aucune tâche... donc, aucune complète
		currentTasks = 0; // Idem...
	}
	
	// On peut maintenant "exposer" les deux variables : completedTasks et currentTasks
	$scope.completedTasks = completedTasks;
	$scope.currentTasks = currentTasks;
	
	 // Méthode pour ajouter "automatiquement" une nouvelle entrée
	 $scope.addToList = function(){
		 // Récupération de la saisie utilisateur
		 var newTodo = $scope.newTodo.trim();
		 console.log("Saisie utilisateur : " + newTodo);
		 if(newTodo.length){ // On vérifie qu'il y a bien quelque chose dans le champ de saisie
			 var todo = {
					 "titre": newTodo,
					 "completed": false
			 };
			 $scope.listeAFaire.push(
					 todo
			);
			
			 // Stocke la donnée dans le localstorage
			$localStorage.todoList = $scope.listeAFaire;
			
			// Efface la zone de saisie
			$scope.newTodo = "";
			
			// Une tâche de plus, on recalcule
			$scope.currentTasks++;
		 }
		 return;
	 }
	 
	 /**
	  * Définit la méthode pour supprimer une ligne dans ma liste de choses à faire
	  */
	 $scope.removeTodo = function(afaire){
		 console.log(JSON.stringify(afaire));
		 $scope.listeAFaire.splice($scope.listeAFaire.indexOf(afaire), 1);
		 
		 $localStorage.todoList = $scope.listeAFaire; // On met à jour le localstorage
		 
		 // Pour mettre à jour les compteurs, on refait le calcul
		 	listeAFaire = $scope.listeAFaire;
			completedTasks = calculCompleteTasks(listeAFaire); 
			currentTasks = (listeAFaire.length) - completedTasks;
			
			$scope.completedTasks = completedTasks;
			$scope.currentTasks = currentTasks;
	 }
	 
	 /**
	  * Définition de la méthode checkAll() pour basculer l'état des boîtes à cocher
	  */
	 $scope.checkAll = function(check){
		 // On applique sur tous les éléments de la liste
		 $scope.listeAFaire.forEach(function(afaire){
			 afaire.completed = !check; // Coche ou décoche la boîte
		 });
		 // Pour mettre à jour les compteurs, on refait le calcul
		 listeAFaire = $scope.listeAFaire;
		completedTasks = calculCompleteTasks(listeAFaire); 
		currentTasks = (listeAFaire.length) - completedTasks;
			
		$scope.completedTasks = completedTasks;
		$scope.currentTasks = currentTasks;
	 }
	 
	 $scope.ventilation = function(check){
		 if(check){
			 // Tâche complète
			 $scope.completedTasks++;
			 $scope.currentTasks--;
		 } else {
			 $scope.completedTasks--;
			 $scope.currentTasks++;			 
		 }
	 }
	 
	 /**
	  * Effacer les tâches réalisées
	  * 
	  */
	 $scope.clearCheckedTasks = function(){
		 
		 // La variable du modèle $scope.listeAFaire = un tableau listeAFaire = ce tableau filtré
		 $scope.listeAFaire = listeAFaire = listeAFaire.filter(function(afaire){
			 if(afaire.completed == true){
				 return false; // La tâche est terminée, j'élimine du tableau
			 }
			 return true; // La tâche n'est pas terminée, je garde dans le tableau
			 //return !afaire.completed; // Retourne un booléen... Ca retourne vrai... si completed est faux
		 });
		 
		 $localStorage.todoList = $scope.listeAFaire; // On met à jour le localstorage
	 }
	 
	 /**
	  * Méthode permettant de compter le nombre de tâches "complètes"
	  */
	 function calculCompleteTasks(liste){
		 var total = 0; // Compteur à l'origine
		 
		 liste.forEach(function(tache){
			 if(tache.completed){
				 total++;
			 }
		 });
		 
		 return total;
	 }
}])