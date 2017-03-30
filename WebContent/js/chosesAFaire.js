/**
 * @name chosesAFaire.js : Contrôleur permettant l'affichage des choses à faire
 * Contrôleur angularJS, donc à faire comprendre au framework
 */

// Définir l'application en tant que module AngularJS
var listingApp = angular.module("listingApp", [
	// Dépendances du module listingApp
	'ngRoute',
	'ngStorage', // Instance de gestion du localstorage
	'ngToast',
	'ngAnimate',
	'todoList'
]);

// Définition des routes de notre application
listingApp.config(['$routeProvider', function($routeProvider){
		// On va déterminer ce qui doit se passer en fonction des URIs
		$routeProvider
		.when('/home',{
			templateUrl: 'templates/listing.html',
			controller: 'listingCtrl'
		})
		.when("/task/:id",{ // :id est un paramètre => /task/1 | /task/2
			templateUrl: "templates/task.html", // Vue à charger
			controller: "taskCtrl" // Contrôleur à appeler
		})
		.otherwise({
			redirectTo: '/home'
		});
	}
]);

// Définition du module todoList
var todoList = angular.module("todoList",[])
	.config([
		'ngToastProvider', function(ngToast){
			ngToast.configure({
				verticalPosition: 'top',
				horizontalPosition: 'center',
				animation: 'fade'
			})
		}
	]);

/**
* Définition du contrôleur qui sera utilisé pour la vue listing.html
* $scope => définit la relation entre le contrôleur et la vue
**/
todoList.controller("listingCtrl", ["$scope","$localStorage","ngToast","$http", "$q", function($scope, $localStorage, ngToast, $http, $q){
	var listeAFaire = {}; // Joindre la variable listeAFaire de la vue avec le contrôleur
	
	$scope.listeAFaire = {};
	
	var completedTasks = {}; // Un objet vide, pour comptabiliser le nombre de tâches complètes
	var currentTasks = {}; // Un objet vide, pour compter le nombre de tâches en cours
	
	// Récupérer les données du stockage local
	//listeAFaire = $localStorage.todoList;
	/**
	 * L'appel à la méthode get de l'objet $http est fait en asynchrone
	 * Les données seront transmises après que le serveur ait répondu
	 * AngularJS continue à exécuter le code...
	 */
	ngToast.create("Chargement de la liste");
	
	$http.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
	$http.get(
			"http://phptest.dev" // Que doit on demander...
		).then(function(serverResponse){ // Flux JSON se trouve dans l'attribut "data" de serverResponse
			console.log("Données : " + JSON.stringify(serverResponse));
			$scope.listeAFaire = serverResponse.data; // On récupère la liste des choses à faire...
			
			// Injecter la liste dans la vue...
			// A ne faire que lorsque les données ont été récupérées...
			if($scope.listeAFaire != null){
				//console.log("Liste à faire : " + JSON.stringify($scope.listeAFaire));
				
				listeAFaire = $scope.listeAFaire; // Injecter le tableau à la vue 'listing.html'
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
		}
	);
	
	
	 // Méthode pour ajouter "automatiquement" une nouvelle entrée
	// @update 28-03 => persistence dans la base de données distante...
	 $scope.addToList = function(){
		 // Récupération de la saisie utilisateur
		 var newTodo = $scope.newTodo.trim(); // Référence à ng-model="newTodo"
		 console.log("Saisie utilisateur : " + newTodo);
		 if(newTodo.length){ // On vérifie qu'il y a bien quelque chose dans le champ de saisie
			 // Objet JSON contenant les données saisies dans le formulaire
			 var todo = {
					 "libelle": newTodo,
					 "completed": false
			 };
			 
			 // Ajout direct dans la liste des tâches à réaliser...
			 //$scope.listeAFaire.push(
			//		 todo
			//);
			
			 // Stocke la donnée dans le localstorage
			//$localStorage.todoList = $scope.listeAFaire;
			
			 /**
			  * Appeler une méthode pour mettre à jour la base de données mySQL (ou autre)...
			  * En utilisant la méthode post() du service $http
			  */
			var config = {
				headers: {
					"Content-Type": "application/x-www-form-urlencode; charset=utf-8;" 	
				}
			};
			// On peut déclencher un appel vers la ressource côté serveur...
			$http.post(
				"http://phptest.dev", // Ressource à appeler côté serveur
				todo, // Données à transmettre au serveur - JSON
				config
			).then(function(serverResponse){
				console.log("Insertion demandée : " + JSON.stringify(serverResponse));
				$scope.listeAFaire = serverResponse.data; // Nouvelle liste mise à jour
			});
			
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
		 
		 //$localStorage.todoList = $scope.listeAFaire; // On met à jour le localstorage
		 
		 /**
		  * On appelle la méthode côté serveur pour supprimer
		  */
		 $http.get(
				 "http://phptest.dev?id=" + afaire.id + "&do=delete"
		 ).then(function(serverResponse){
			 // Pour mettre à jour les compteurs, on refait le calcul
			 listeAFaire = $scope.listeAFaire;
			 completedTasks = calculCompleteTasks(listeAFaire); 
			 currentTasks = (listeAFaire.length) - completedTasks;
				
			 $scope.completedTasks = completedTasks;
			 $scope.currentTasks = currentTasks;			 
		 });
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
		 
		 // Pour mettre à jour les compteurs, on refait le calcul
		listeAFaire = $scope.listeAFaire;
		completedTasks = calculCompleteTasks(listeAFaire); 
		currentTasks = (listeAFaire.length) - completedTasks;
			
		$scope.completedTasks = completedTasks;
		$scope.currentTasks = currentTasks;
		 
	 }
	 
	 /**
	  * watcher $watch
	  * Paramètre 1 : la variable du scope à surveiller
	  * Paramètre 2 : la fonction à déclencher quand cette variable change
	  * Surveiller un élément dans une vue et agir en conséquence
	 **/
	 
	 
	 /**
	  * Définition de la fonction satisfaction :
	  * Si le nombre de tâches complètes et égal au nombre de tâches
	 **/
	 function satisfaction(newValue, oldValue, $scope){
		 console.log("completedTasks a changé : " + newValue);
		 // Effectuons un calcul de pourcentage...
		 var completed = (newValue / ($scope.listeAFaire.length)) * 100;
		 
		 // Afficher un toast quand on a accompli toutes les tâches
		 if(completed >= 100){
			 var completeToast = ngToast.success(
					 {
						 content: "Bravo, on est arrivé au bout !",
						 dismissOnTimeout: true, // Disparition automatique
						 timeout: 3000, // Disparaît au bout de 3s
						 horizontalPosition: "center"
					 }
			 );
		 }
		 
		 $scope.alertMsg = completed;
	 }
	 
	 /**
	  * Méthode pour le calcule des tâches complètées
	  */
	 $scope.calcule = function(){
		 return calculCompleteTasks($scope.listeAFaire);
	 }
	 
	 /**
	  * Méthode permettant de compter le nombre de tâches "complètes"
	  */
	 function calculCompleteTasks(liste){
		 var total = 0; // Compteur à l'origine
		 
		 liste.forEach(function(tache){
			 if(tache.completed == 1){
				 total++;
			 }
		 });
		 
		 return total;
	 }
	 
	 /**
	  * On surveille l'état de la variable "calcule"
	  */
	 $scope.$watch($scope.calcule, satisfaction);
}]);

/**
 * Contrôleur pour l'affichage et la gestion d'une tâche
 * Attention on traite le contrôleur pour une tâche donnée...
 * On doit récupérer son identifiant transmis dans la route par l'intermédiaire du service $routeParams
 */
todoList.controller("taskCtrl",["$scope","$http", "$routeParams", "$location", function($scope, $http, $routeParams, $location){
	$scope.taskId = $routeParams.id;
	
	// On peut appeler la ressource sur le serveur...
	$http.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
	$http.get(
			"http://phptest.dev?id=" + $scope.taskId // Transmission du paramètre id avec la valeur concernée "$scope.taskId
		).then(function(serverResponse){
			console.log("Réponse du serveur : " + JSON.stringify(serverResponse.data));
			// Définition des données de la vue...
			$scope.update.libelle = serverResponse.data[0].libelle;
			$scope.update.description = serverResponse.data[0].description;
			$scope.update.completed = (serverResponse.data[0].completed == 0) ? false : true;
			// Parsing des dates... car ben oui, en Javascript les dates sont étranges
			var parsedDate = serverResponse.data[0].debut.split("-");
			console.log("Année : "  + parsedDate[0] + " Mois : " + parsedDate[1]);
			$scope.update.debut = new Date(parsedDate[0], (parsedDate[1]-1), parsedDate[2]);
			
			parsedDate = serverResponse.data[0].fin.split("-");
			$scope.update.fin = new Date(parsedDate[0], (parsedDate[1]-1), parsedDate[2]);
			
			$scope.update.priorite = serverResponse.data[0].priorite;
			$scope.update.id = $scope.taskId;
		}
	);
	
	// Définition de la méthode qui sera appelée lors de la validation du formulaire
	$scope.updateTask = function(id){
		console.log("Mise à jour de la tâche : " + id + " avec les informations : " + JSON.stringify($scope.update)); // $scope.update contient la totalité des champs du formulaire
		
		var config = {
				headers: {
					"Content-Type": "application/x-www-form-urlencode; charset=utf-8;" 	
				}
		};
		
		// On appelle la ressource sur le serveur
		$http.post(
			"http://phptest.dev", // Ressource index.php sur le serveur
			$scope.update, // Les données à traiter ($scope.update => 
			config
		).then(function(serverResponse){
			// Qui devrait rediriger vers la page d'accueil
			$location.path("/home");
		});
	}
}])
.directive( // Permet d'ajouter ou modifier le comportement d'un ou plusieurs champs dans les vues
	"dateInput", // Nom de la directive
	function(dateFilter){ // Fonction qui retourne le champ tel qu'on le souhaite à la fin
		return { // JSON qui sera retourné pour indiquer à Angular comment gérer le champ
			require: "ngModel", // Requiert la directive ng-model
			template: "<input type=\"date\" data-rel=\"date\" />", // Modèle de remplacement pour le champ de type "dateInput"
			replace: true, // Remplace le champ tel qu'il a été défini dans la vue
			link: function(scope, element, attrs, ngModelCtrl){
				console.log("Elémént : "  + JSON.stringify(element));
				// Définit ce qui vient du modèle
				ngModelCtrl.$formatters.unshift(function(modelValue){
					console.log("Valeur à récupérer : " + modelValue);
					return dateFilter(modelValue, "yyyy-MM-dd");
				});
				// Définit ce qui doit être affiché dans le modèle
				ngModelCtrl.$parsers.unshift(function(viewValue){
					console.log("Valeur à afficher : " + viewValue);
					return new Date(viewValue);
				});
			}
		}
	}
);