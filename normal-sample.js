var h = require('virtual-dom/h');
var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');
var createElement = require('virtual-dom/create-element');
//var htmlVirtualize = require('html-virtualize');
var vDomVirtualize = require('vdom-virtualize');

// 1: Create a function that declares what the DOM should look like
function render(count) {
  var parser = new DOMParser();
  var doc = parser.parseFromString('<div><p>' + count + '</p></div>', 'application/xml');
  console.log(doc);
  var vvDom = vDomVirtualize(doc.children[0]);
  console.log(vvDom);
  var virtDom = htmlVirtualize('<div><p>' + count + '</p></div>');
  var hDom = h('div', {}, [h('p', {}, [String(count)])]);
  return vvDom;
}

document.addEventListener('DOMContentLoaded', function() {
  // 2: Initialise the document
  var count = 0; // We need some app data. Here we just store a count.

  var tree = render(count); // We need an initial tree
  var rootNode = createElement(tree); // Create an initial root DOM node ...
  document.body.appendChild(rootNode); // ... and it should be in the document

  // 3: Wire up the update logic
  setInterval(function() {
    count++;

    var newTree = render(count);
    var patches = diff(tree, newTree);
    rootNode = patch(rootNode, patches);
    tree = newTree;
  }, 1000);
});
