var h = require('virtual-dom/h');
var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');
var createElement = require('virtual-dom/create-element');
var vDomVirtualize = require('vdom-virtualize');
var VirtualPatch = require('vtree/vpatch');
var _ = require('lodash');
var domIndex = require("vdom/dom-index");

angular.module('test-app', ['ngSanitize']);

angular.module('test-app').controller('Root', function($scope) {
  $scope.markup = '<div id="root">root<p>test</p></div>';

  $scope.addThing = function(){
    $scope.markup = $scope.markup.replace('</div>', '<thing></thing></div>');
  };
  
});

angular.module('test-app').directive('thing', [function(){
  return {
    restrict: 'E',
    template: ['<div><h5><i>THING</i></h5></div>'].join('\n')
  };
}]);

angular.module('test-app').directive('markupPreview', ['$sce', '$compile',
  function($sce, $compile) {

    var rootNode;
    var rootDom;
    var firstRun = true;

    var parser = new DOMParser();
    
    function stringToElement(s){
      var doc = parser.parseFromString(s, 'application/xml');
      var errors = doc.querySelectorAll('parsererror');

      if(errors.length === 0){
        return doc.children[0];
      } 
    }

    function Type(fn) {
        this.fn = fn;
    }

    Type.prototype.hook = function () {
        this.fn.apply(this, arguments);
    };

    function hook(fn) {
        return new Type(fn);
    }

    return {
      restrict: 'E',
      require: '?ngModel',
      link: function($scope, $element, $attrs, ngModel) {
        if (!ngModel) return;


        function compileHook(el, prop){
          $compile(el)($scope.$new());
        }

        function addHooks(patches){

          var out = {};
          for(var k in patches){
            if(k !== 'a'){
              var p = patches[k];


              if(p.type === VirtualPatch.INSERT && p.patch.tagName === 'thing'){
                console.log('found a patch that needs compile: ', p);
                
                p.patch.properties = { 
                  thingy: hook( compileHook ) 
                };

                out[k] = p;


              }

            }
          }
          return out;
        }

        /**
         * Update the dom using the latest $viewValue
         */
        ngModel.$render = function() {

          if (!ngModel.$viewValue) {
            return;
          }

          if (firstRun) {
            var el = stringToElement(ngModel.$viewValue);
            rootDom = vDomVirtualize(el);
            rootNode = createElement(rootDom);
            $element[0].appendChild(rootNode);
          }

          firstRun = false;

          var newEl = stringToElement(ngModel.$viewValue);

          if (newEl) {
            var newDom = vDomVirtualize(newEl);

            newDom.hooks = {
              "a" : {
                hook: function(){
                  console.log('.....');
                }
              }
            };
            var patches = diff(rootDom, newDom);
            var cPatches = addHooks(patches);
            console.log('cpatches:', cPatches);
            console.log(patches);
            rootNode = patch(rootNode, patches);
            rootDom = newDom;
          }
        };

      }
    };
  }
]);