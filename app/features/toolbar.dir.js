(function () {
    
    'use strict';
    
    angular
    
        .module('shelfLifeApp')
    
        .directive('mainToolbar', function () {
        
            return {
                restrict: 'AE',
                templateUrl: 'features/toolbar/toolbar.tpl.html'
            };

        });
    
})();
