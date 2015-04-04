(function() {
	angular.module('goGress').controller('PortalEditController', PortalEditController);
	PortalEditController.$inject = ['$scope', '$stateParams', 'PortalService', 'PortalFactory'];

	function PortalEditController($scope, $stateParams, PortalService, PortalFactory) {
		console.log($stateParams.id, '----')
		$scope.portal = PortalService.getSelected($stateParams.id);
		$scope.savePortal = function() {
			PortalFactory.save($scope.portal).$promise
			.finally(function() {})
			.then(function() {
				$scope.openToast('El portal se ha guardado.');
				return false;
			})
			.catch(function(error) {
				var msje = 'No se puede guardar el portal';

				if (error.status === 403)
					msje += ': parece un problema de permisos. Intente saliendo y entrando nuevamente con su cuenta.';
				else
					msje += ' [' + error.data + ']';

				$scope.openToast(msje);
				return false;
			});
		};
		/**
		 * Create filter function for a query string
		 */
		function createFilterFor(objectiveType, query) {
			var lowercaseQuery = angular.lowercase(query);

			if (objectiveType === 'agent')
				return function filterFn(objective) {
					if (lowercaseQuery === '*') return true;
					return (objective.codeName.toLowerCase().indexOf(lowercaseQuery) === 0);
				};
			else if (objectiveType === 'label')
				return function filterFn(objective) {
					if (lowercaseQuery === '*') return true;
					return (objective.name.toLowerCase().indexOf(lowercaseQuery) === 0);
				};
			else
				return true;
		}

		$scope.searchPortalById = function(portalId) {
			$scope.loading = true;
			$scope.items = Portal.query({
				id: portalId
			});
			$scope.items.$promise.finally(function() {
				$scope.loading = false;
				$scope.showPortal($scope.items[0]);
			});
		};
		$scope.searchPortal = function(labels) {
			$scope.loading = true;
			$scope.items = Portal.query({
				labels: labels
			});
			$scope.items.$promise.finally(function() {
				$scope.loading = false;
			});
			$scope.labels = labels;
		};

		$scope.addLabel = function(label) {
			console.log(this);
			if (!$scope.portal) return;

			var cleanedLabel = $filter('sanitizelabel')(label);

			if (!$scope.portal.labels) $scope.portal.labels = [];
			if ($scope.portal.labels.indexOf(cleanedLabel) === -1)
				$scope.portal.labels.push(cleanedLabel);
		};
		$scope.deleteLabel = function(label) {
			if (!$scope.portal) return;
			if (!$scope.portal.labels) $scope.portal.labels = [];

			var pos = $scope.portal.labels.indexOf(label);
			if (pos >= 0)
				$scope.portal.labels.splice(pos, 1);
		};
		$scope.addKey = function(portal, agentData, amount) {
			var posibleNuevaAdicion = false;

			var agenteBuscado = this.agentcodenameQuery;
			if (!portal) {
				$scope.openToast('No hay portal seleccionado al cual agregar llaves. Esto no debería ocurrir.');
				return false;
			}
			if (!agenteBuscado) {
				$scope.openToast('No se ha ingresado agente. ¿Quién tiene estas llaves?');
				return false;
			}
			if (!amount) {
				$scope.openToast('No se ha ingresado cantidad de llaves. ¿Cuántas llaves tiene el agente ' + agenteBuscado + '?');
				return false;
			}

			if (agentData) {
				agentCodeName = agentData.codeName;
				if (agentCodeName.toLowerCase() === agenteBuscado.toLowerCase()) {
					/*
					se busco un agente (escrito segun 'agenteBuscado')
					y se acepto la sugerencia del autocomplete
					*/
					return $scope.addKeysToAgent(agentData, portal, amount);
				} else {
					// console.log('Vienen datos de agente y texto buscado...');
					// console.log( agentCodeName, agentData, agenteBuscado);
					// return alert('Calce no se ajusta a texto buscado');
					posibleNuevaAdicion = true;
				}
			} else
			/*
			no viene sugerencia seleccionada desde el auto-complete:
			revisar si viene texto. Si es así, entonces quiere agregar
			a un agente en forma directa
			*/
			if (agenteBuscado)
			//emitir warning:
				posibleNuevaAdicion = true;

			if (posibleNuevaAdicion) {
				var pregunta = confirm('Ud quiere agregar llaves para el agente ' + agenteBuscado + '... Vamos a tener que registrar al nuevo agente');
				if (pregunta)
					AgentService.agents.$promise.then(function(data) {
						var found = data.filter(function(item) {
							return item.codeName.toLowerCase() === agenteBuscado.toLowerCase();
						});
						if (found.length > 0)
						//ya estaba, no hay que agregarlo, usar sus datos no mas
							return $scope.addKeysToAgent(found[0], portal, amount);
						else {
							var newagent = Agent.save({
								codeName: agenteBuscado
							});
							newagent.$promise.then(function(newagentdata) {
								AgentService.agents.push(newagentdata);
								$scope.querySearchAgentes('*');
								return $scope.addKeysToAgent(newagentdata, portal, amount);
							}).catch(function() {
								$scope.openToast('Hubo un error al intentar agregar el agente ' + agenteBuscado);
								return false;
							});
						}
					});
				else {
					//no, no estaba, hay que crearlo: emitir warning
					$scope.openToast('Vuelva a seleccionar desde el listado');
					return false;
				}
			}
		};

		$scope.addKeysToAgent = function(agent, portal, amount) {
			if (!agent) {
				$scope.openToast('No vienen datos de agente (function addKeysToAgent)');
				return false;
			} else {
				if (!portal.keys) portal.keys = [];
				for (var i = 0; i < portal.keys.length; i++)
					if (portal.keys[i].agentId === agent.id) {
						$scope.openToast('El agente ya aparece en el listado de llaves... error!');
						$scope.openToast('Error agregando las ' + amount + ' llaves del agente ' + agent.codeName);
						return false;
					}

				portal.keys.push({
					agentId: agent.id,
					agent: agent,
					amount: amount
				});

				$scope.openToast(amount + ' llaves agregadas del agente ' + agent.codeName);
				return true;
			}
		};

		$scope.deleteKey = function(portal, key) {
			if (!$scope.portal) return;
			if (!portal.keys) portal.keys = [];

			if (typeof key === 'object')
				if (key.agentId) {
					var pos = -1;
					//busacr elemento a ser borrado
					//debo buscar asi pues el orden del listado
					//de llaves en la interfaz esta filtrado
					for (var i = 0; i < portal.keys.length; i++)
						if (portal.keys[i].agentId === key.agentId) {
							pos = i;
							break;
						}

					if (pos >= 0) portal.keys.splice(pos, 1);
				}
		};

		$scope.toggleLinkable = function(idx) {
			var pos = $scope.selectedPortalsToLink.indexOf(idx.title);
			if (pos === -1) {
				console.log($scope.selectedPortalsToLink);
				if ($scope.selectedPortalsToLink.length >= 3) {
					$scope.openToast('No puede elegir más de 3 portales para simular linkeo');
					return;
				}

				$scope.selectedPortalsToLink.push(idx.title);
				$scope.selectedPortalsToLinkData.push(idx);
			} else {
				$scope.selectedPortalsToLink.splice(pos, 1);
				$scope.selectedPortalsToLinkData.splice(pos, 1);
			}
			//regenerate intelPlsLinks array
			$scope.intelPlsLinks = [];
			$scope.intelPlsCentroid = {};
			$scope.intelPlsCentroid.lat = 0;
			$scope.intelPlsCentroid.lon = 0;
			$scope.ingressCentroidUrl = '';
			$scope.gmapPoints = [];

			for (var i = 0; i < $scope.selectedPortalsToLinkData.length; i++) {
				var startingPoint = $scope.selectedPortalsToLinkData[i];
				$scope.gmapPoints.push(
					new google.maps.LatLng(startingPoint.lat / 1000000, startingPoint.lon / 1000000)
				);

				for (var j = i + 1; j < $scope.selectedPortalsToLinkData.length; j++) {
					var endingPoint = $scope.selectedPortalsToLinkData[j];

					var link = startingPoint.lat / 1000000 + ',' + startingPoint.lon / 1000000 + ',' + endingPoint.lat / 1000000 + ',' + endingPoint.lon / 1000000;
					$scope.intelPlsLinks.push(link);
				}
				$scope.intelPlsCentroid.lat += startingPoint.lat;
				$scope.intelPlsCentroid.lon += startingPoint.lon;
			}
			$scope.intelPlsCentroid.lat = $scope.intelPlsCentroid.lat / i;
			$scope.intelPlsCentroid.lon = $scope.intelPlsCentroid.lon / i;

			$scope.gmapCf = new google.maps.Polygon({
				path: $scope.gmapPoints,
				strokeColor: '#02b902',
				strokeOpacity: 0.8,
				strokeWeight: 2,
				fillColor: '#0b560f',
				fillOpacity: 0.4
			});

			//initialize the bounds
			var bounds = new google.maps.LatLngBounds();

			//iterate over the points in the path
			$scope.gmapCf.getPath().getArray().forEach(function(point) {
				//extend the bounds
				bounds.extend(point);
			});

			//now use the bounds
			var correctedZoom = $scope.getBoundsZoomLevel(bounds);

			if ($scope.intelPlsLinks.length > 0) {
				$scope.intelPls = $scope.intelPlsLinks.join('_');

				$scope.ingressCentroidUrl = 'https://www.ingress.com/intel?z=' + correctedZoom + '&ll=' + ($scope.intelPlsCentroid.lat / 1000000) + ',' + ($scope.intelPlsCentroid.lon / 1000000) + ($scope.intelPls ? '&pls=' + $scope.intelPls : '');
			}
		};

		$scope.querySearchAgentes = function(query) {
			return AgentService.agents.$promise.then(function(data) {
				return data.filter(createFilterFor('agent', query));
			});
		};
		$scope.querySearchLabels = function(query) {
			return LabelService.labels.$promise.then(function(data) {
				return data.filter(createFilterFor('label', query));
			});
		};

	}
})();