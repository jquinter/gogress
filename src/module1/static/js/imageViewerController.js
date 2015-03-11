angular.module('goGress')
    .controller('ImageViewerController', ImageViewerController);

ImageViewerController.$inject = ['$mdDialog', 'portal', 'imageMode'];

function ImageViewerController($mdDialog, portal, imageMode) {
    var vm = this;
    vm.ok = ok;
    vm.portal = portal;
    vm.imageMode = imageMode;

    console.log(vm);
    function ok() {
        // Easily hides most recent dialog shown...
        // no specific instance reference is needed.
        $mdDialog.hide();
    }
}

