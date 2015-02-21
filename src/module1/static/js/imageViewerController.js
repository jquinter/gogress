angular.module('goGress')
    .controller('ImageViewerController', ImageViewerController);

ImageViewerController.$inject = ['$mdDialog', 'portal'];

function ImageViewerController($mdDialog, portal) {
    var vm = this;
    vm.ok = ok;
    vm.portal = portal;

    console.log(vm);
    function ok() {
        // Easily hides most recent dialog shown...
        // no specific instance reference is needed.
        $mdDialog.hide();
    }
}

