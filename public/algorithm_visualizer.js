/**
 * algorithm-visualizer - Algorithm Visualizer
 * @version v0.1.0
 * @author Jason Park & contributors
 * @link https://github.com/parkjs814/AlgorithmVisualizer#readme
 * @license MIT
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _$ = $;
var extend = _$.extend;


var cache = {
  lastFileUsed: '',
  files: {}
};

var assertFileName = function assertFileName(name) {
  if (!name) {
    throw 'Missing file name';
  }
};

/**
 * Global application cache
 */
module.exports = {
  getCachedFile: function getCachedFile(name) {
    assertFileName(name);
    return cache.files[name];
  },
  updateCachedFile: function updateCachedFile(name, updates) {
    assertFileName(name);
    if (!cache.files[name]) {
      cache.files[name] = {};
    }
    extend(cache.files[name], updates);
  },
  getLastFileUsed: function getLastFileUsed() {
    return cache.lastFileUsed;
  },
  setLastFileUsed: function setLastFileUsed(file) {
    cache.lastFileUsed = file;
  }
};

},{}],2:[function(require,module,exports){
'use strict';

var Editor = require('../editor');
var TracerManager = require('../tracer_manager');
var DOM = require('../dom/setup');

var _require = require('../dom/loading_slider');

var showLoadingSlider = _require.showLoadingSlider;
var hideLoadingSlider = _require.hideLoadingSlider;


var Cache = require('./cache');

var state = {
  isLoading: null,
  editor: null,
  tracerManager: null,
  categories: null,
  loadedScratch: null
};

var initState = function initState(tracerManager) {
  state.isLoading = false;
  state.editor = new Editor(tracerManager);
  state.tracerManager = tracerManager;
  state.categories = {};
  state.loadedScratch = null;
};

/**
 * Global application singleton.
 */
var App = function App() {

  this.getIsLoading = function () {
    return state.isLoading;
  };

  this.setIsLoading = function (loading) {
    state.isLoading = loading;
    if (loading) {
      showLoadingSlider();
    } else {
      hideLoadingSlider();
    }
  };

  this.getEditor = function () {
    return state.editor;
  };

  this.getCategories = function () {
    return state.categories;
  };

  this.getCategory = function (name) {
    return state.categories[name];
  };

  this.setCategories = function (categories) {
    state.categories = categories;
  };

  this.updateCategory = function (name, updates) {
    $.extend(state.categories[name], updates);
  };

  this.getTracerManager = function () {
    return state.tracerManager;
  };

  this.getLoadedScratch = function () {
    return state.loadedScratch;
  };

  this.setLoadedScratch = function (loadedScratch) {
    state.loadedScratch = loadedScratch;
  };

  var tracerManager = TracerManager.init();

  initState(tracerManager);
  DOM.setup(tracerManager);
};

App.prototype = Cache;

module.exports = App;

},{"../dom/loading_slider":7,"../dom/setup":8,"../editor":26,"../tracer_manager":59,"./cache":1}],3:[function(require,module,exports){
'use strict';

/**
 * This is the main application instance.
 * Gets populated on page load. 
 */

module.exports = {};

},{}],4:[function(require,module,exports){
'use strict';

var app = require('../app');
var Server = require('../server');
var showAlgorithm = require('./show_algorithm');

var _$ = $;
var each = _$.each;


var addAlgorithmToCategoryDOM = function addAlgorithmToCategoryDOM(category, subList, algorithm) {
  var $algorithm = $('<button class="indent collapse">').append(subList[algorithm]).attr('data-algorithm', algorithm).attr('data-category', category).click(function () {
    Server.loadAlgorithm(category, algorithm).then(function (data) {
      showAlgorithm(category, algorithm, data);
    });
  });

  $('#list').append($algorithm);
};

var addCategoryToDOM = function addCategoryToDOM(category) {
  var _app$getCategory = app.getCategory(category);

  var categoryName = _app$getCategory.name;
  var categorySubList = _app$getCategory.list;


  var $category = $('<button class="category">').append('<i class="fa fa-fw fa-caret-right">').append(categoryName).attr('data-category', category);

  $category.click(function () {
    $('.indent[data-category="' + category + '"]').toggleClass('collapse');
    $(this).find('i.fa').toggleClass('fa-caret-right fa-caret-down');
  });

  $('#list').append($category);

  each(categorySubList, function (algorithm) {
    addAlgorithmToCategoryDOM(category, categorySubList, algorithm);
  });
};

module.exports = function () {
  each(app.getCategories(), addCategoryToDOM);
};

},{"../app":3,"../server":53,"./show_algorithm":19}],5:[function(require,module,exports){
'use strict';

var Server = require('../server');

var _$ = $;
var each = _$.each;


var addFileToDOM = function addFileToDOM(category, algorithm, file, explanation) {
  var $file = $('<button>').append(file).attr('data-file', file).click(function () {
    Server.loadFile(category, algorithm, file, explanation);
    $('.files_bar > .wrapper > button').removeClass('active');
    $(this).addClass('active');
  });
  $('.files_bar > .wrapper').append($file);
  return $file;
};

module.exports = function (category, algorithm, files, requestedFile) {
  $('.files_bar > .wrapper').empty();

  each(files, function (file, explanation) {
    var $file = addFileToDOM(category, algorithm, file, explanation);
    if (requestedFile && requestedFile == file) $file.click();
  });

  if (!requestedFile) $('.files_bar > .wrapper > button').first().click();
  $('.files_bar > .wrapper').scroll();
};

},{"../server":53}],6:[function(require,module,exports){
'use strict';

var showAlgorithm = require('./show_algorithm');
var addCategories = require('./add_categories');
var showDescription = require('./show_description');
var addFiles = require('./add_files');
var showFirstAlgorithm = require('./show_first_algorithm');
var showRequestedAlgorithm = require('./show_requested_algorithm');

module.exports = {
  showAlgorithm: showAlgorithm,
  addCategories: addCategories,
  showDescription: showDescription,
  addFiles: addFiles,
  showFirstAlgorithm: showFirstAlgorithm,
  showRequestedAlgorithm: showRequestedAlgorithm
};

},{"./add_categories":4,"./add_files":5,"./show_algorithm":19,"./show_description":20,"./show_first_algorithm":21,"./show_requested_algorithm":22}],7:[function(require,module,exports){
'use strict';

var showLoadingSlider = function showLoadingSlider() {
  $('#loading-slider').removeClass('loaded');
};

var hideLoadingSlider = function hideLoadingSlider() {
  $('#loading-slider').addClass('loaded');
};

module.exports = {
  showLoadingSlider: showLoadingSlider,
  hideLoadingSlider: hideLoadingSlider
};

},{}],8:[function(require,module,exports){
'use strict';

var setupDividers = require('./setup_dividers');
var setupDocument = require('./setup_document');
var setupFilesBar = require('./setup_files_bar');
var setupInterval = require('./setup_interval');
var setupModuleContainer = require('./setup_module_container');
var setupPoweredBy = require('./setup_powered_by');
var setupScratchPaper = require('./setup_scratch_paper');
var setupSideMenu = require('./setup_side_menu');
var setupTopMenu = require('./setup_top_menu');
var setupWindow = require('./setup_window');

/**
 * Initializes elements once the app loads in the DOM. 
 */
var setup = function setup() {

  $('.btn input').click(function (e) {
    e.stopPropagation();
  });

  // dividers
  setupDividers();

  // document
  setupDocument();

  // files bar
  setupFilesBar();

  // interval
  setupInterval();

  // module container
  setupModuleContainer();

  // powered by
  setupPoweredBy();

  // scratch paper
  setupScratchPaper();

  // side menu
  setupSideMenu();

  // top menu
  setupTopMenu();

  // window
  setupWindow();
};

module.exports = {
  setup: setup
};

},{"./setup_dividers":9,"./setup_document":10,"./setup_files_bar":11,"./setup_interval":12,"./setup_module_container":13,"./setup_powered_by":14,"./setup_scratch_paper":15,"./setup_side_menu":16,"./setup_top_menu":17,"./setup_window":18}],9:[function(require,module,exports){
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var app = require('../../app');

var addDividerToDom = function addDividerToDom(divider) {
  var _divider = _slicedToArray(divider, 3);

  var vertical = _divider[0];
  var $first = _divider[1];
  var $second = _divider[2];

  var $parent = $first.parent();
  var thickness = 5;

  var $divider = $('<div class="divider">');

  var dragging = false;
  if (vertical) {
    (function () {
      $divider.addClass('vertical');

      var _left = -thickness / 2;
      $divider.css({
        top: 0,
        bottom: 0,
        left: _left,
        width: thickness
      });

      var x = void 0;
      $divider.mousedown(function (_ref) {
        var pageX = _ref.pageX;

        x = pageX;
        dragging = true;
      });

      $(document).mousemove(function (_ref2) {
        var pageX = _ref2.pageX;

        if (dragging) {
          var new_left = $second.position().left + pageX - x;
          var percent = new_left / $parent.width() * 100;
          percent = Math.min(90, Math.max(10, percent));
          $first.css('right', 100 - percent + '%');
          $second.css('left', percent + '%');
          x = pageX;
          app.getTracerManager().resize();
          $('.files_bar > .wrapper').scroll();
        }
      });

      $(document).mouseup(function (e) {
        dragging = false;
      });
    })();
  } else {
    (function () {

      $divider.addClass('horizontal');
      var _top = -thickness / 2;
      $divider.css({
        top: _top,
        height: thickness,
        left: 0,
        right: 0
      });

      var y = void 0;
      $divider.mousedown(function (_ref3) {
        var pageY = _ref3.pageY;

        y = pageY;
        dragging = true;
      });

      $(document).mousemove(function (_ref4) {
        var pageY = _ref4.pageY;

        if (dragging) {
          var new_top = $second.position().top + pageY - y;
          var percent = new_top / $parent.height() * 100;
          percent = Math.min(90, Math.max(10, percent));
          $first.css('bottom', 100 - percent + '%');
          $second.css('top', percent + '%');
          y = pageY;
          app.getTracerManager().resize();
        }
      });

      $(document).mouseup(function (e) {
        dragging = false;
      });
    })();
  }

  $second.append($divider);
};

module.exports = function () {
  var dividers = [['v', $('.sidemenu'), $('.workspace')], ['v', $('.viewer_container'), $('.editor_container')], ['h', $('.data_container'), $('.code_container')]];
  for (var i = 0; i < dividers.length; i++) {
    addDividerToDom(dividers[i]);
  }
};

},{"../../app":3}],10:[function(require,module,exports){
'use strict';

var app = require('../../app');

module.exports = function () {
  $(document).on('click', 'a', function (e) {
    console.log(e);
    e.preventDefault();
    if (!window.open($(this).attr('href'), '_blank')) {
      alert('Please allow popups for this site');
    }
  });

  $(document).mouseup(function (e) {
    app.getTracerManager().command('mouseup', e);
  });
};

},{"../../app":3}],11:[function(require,module,exports){
'use strict';

var definitelyBigger = function definitelyBigger(x, y) {
  return x > y + 2;
};

module.exports = function () {

  $('.files_bar > .btn-left').click(function () {
    var $wrapper = $('.files_bar > .wrapper');
    var clipWidth = $wrapper.width();
    var scrollLeft = $wrapper.scrollLeft();

    $($wrapper.children('button').get().reverse()).each(function () {
      var left = $(this).position().left;
      var right = left + $(this).outerWidth();
      if (0 > left) {
        $wrapper.scrollLeft(scrollLeft + right - clipWidth);
        return false;
      }
    });
  });

  $('.files_bar > .btn-right').click(function () {
    var $wrapper = $('.files_bar > .wrapper');
    var clipWidth = $wrapper.width();
    var scrollLeft = $wrapper.scrollLeft();

    $wrapper.children('button').each(function () {
      var left = $(this).position().left;
      var right = left + $(this).outerWidth();
      if (clipWidth < right) {
        $wrapper.scrollLeft(scrollLeft + left);
        return false;
      }
    });
  });

  $('.files_bar > .wrapper').scroll(function () {

    var $wrapper = $('.files_bar > .wrapper');
    var clipWidth = $wrapper.width();
    var $left = $wrapper.children('button:first-child');
    var $right = $wrapper.children('button:last-child');
    var left = $left.position().left;
    var right = $right.position().left + $right.outerWidth();

    if (definitelyBigger(0, left) && definitelyBigger(clipWidth, right)) {
      var scrollLeft = $wrapper.scrollLeft();
      $wrapper.scrollLeft(scrollLeft + clipWidth - right);
      return;
    }

    var lefter = definitelyBigger(0, left);
    var righter = definitelyBigger(right, clipWidth);
    $wrapper.toggleClass('shadow-left', lefter);
    $wrapper.toggleClass('shadow-right', righter);
    $('.files_bar > .btn-left').attr('disabled', !lefter);
    $('.files_bar > .btn-right').attr('disabled', !righter);
  });
};

},{}],12:[function(require,module,exports){
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var app = require('../../app');
var Toast = require('../toast');

var parseFloat = Number.parseFloat;


var minInterval = 0.1;
var maxInterval = 10;
var startInterval = 0.5;
var stepInterval = 0.1;

var normalize = function normalize(sec) {

  var interval = void 0;
  var message = void 0;
  if (sec < minInterval) {
    interval = minInterval;
    message = 'Interval of ' + sec + ' seconds is too low. Setting to min allowed interval of ' + minInterval + ' second(s).';
  } else if (sec > maxInterval) {
    interval = maxInterval;
    message = 'Interval of ' + sec + ' seconds is too high. Setting to max allowed interval of ' + maxInterval + ' second(s).';
  } else {
    interval = sec;
    message = 'Interval has been set to ' + sec + ' second(s).';
  }

  return [interval, message];
};

module.exports = function () {

  var $interval = $('#interval');
  $interval.val(startInterval);
  $interval.attr({
    max: maxInterval,
    min: minInterval,
    step: stepInterval
  });

  $('#interval').on('change', function () {
    var tracerManager = app.getTracerManager();

    var _normalize = normalize(parseFloat($(this).val()));

    var _normalize2 = _slicedToArray(_normalize, 2);

    var seconds = _normalize2[0];
    var message = _normalize2[1];


    $(this).val(seconds);
    tracerManager.interval = seconds * 1000;
    Toast.showInfoToast(message);
  });
};

},{"../../app":3,"../toast":23}],13:[function(require,module,exports){
'use strict';

var app = require('../../app');

module.exports = function () {

  var $module_container = $('.module_container');

  $module_container.on('mousedown', '.module_wrapper', function (e) {
    app.getTracerManager().findOwner(this).mousedown(e);
  });

  $module_container.on('mousemove', '.module_wrapper', function (e) {
    app.getTracerManager().findOwner(this).mousemove(e);
  });

  $module_container.on('DOMMouseScroll mousewheel', '.module_wrapper', function (e) {
    app.getTracerManager().findOwner(this).mousewheel(e);
  });
};

},{"../../app":3}],14:[function(require,module,exports){
'use strict';

module.exports = function () {
  $('#powered-by').click(function () {
    $('#powered-by-list button').toggleClass('collapse');
  });
};

},{}],15:[function(require,module,exports){
'use strict';

var app = require('../../app');
var Server = require('../../server');
var showAlgorithm = require('../show_algorithm');

module.exports = function () {
  $('#scratch-paper').click(function () {
    var category = 'scratch';
    var algorithm = app.getLoadedScratch();
    Server.loadAlgorithm(category, algorithm).then(function (data) {
      showAlgorithm(category, algorithm, data);
    });
  });
};

},{"../../app":3,"../../server":53,"../show_algorithm":19}],16:[function(require,module,exports){
'use strict';

var app = require('../../app');

var sidemenu_percent = void 0;

module.exports = function () {
  $('#navigation').click(function () {
    var $sidemenu = $('.sidemenu');
    var $workspace = $('.workspace');

    $sidemenu.toggleClass('active');
    $('.nav-dropdown').toggleClass('fa-caret-down fa-caret-up');

    if ($sidemenu.hasClass('active')) {
      $sidemenu.css('right', 100 - sidemenu_percent + '%');
      $workspace.css('left', sidemenu_percent + '%');
    } else {
      sidemenu_percent = $workspace.position().left / $('body').width() * 100;
      $sidemenu.css('right', 0);
      $workspace.css('left', 0);
    }

    app.getTracerManager().resize();
  });
};

},{"../../app":3}],17:[function(require,module,exports){
'use strict';

var app = require('../../app');
var Server = require('../../server');
var Toast = require('../toast');

module.exports = function () {

  // shared
  $('#shared').mouseup(function () {
    $(this).select();
  });

  $('#btn_share').click(function () {

    var $icon = $(this).find('.fa-share');
    $icon.addClass('fa-spin fa-spin-faster');

    Server.shareScratchPaper().then(function (url) {
      $icon.removeClass('fa-spin fa-spin-faster');
      $('#shared').removeClass('collapse');
      $('#shared').val(url);
      Toast.showInfoToast('Shareable link is created.');
    });
  });

  // control

  $('#btn_run').click(function () {
    $('#btn_trace').click();
    var err = app.getEditor().execute();
    if (err) {
      console.error(err);
      Toast.showErrorToast(err);
    }
  });
  $('#btn_pause').click(function () {
    if (app.getTracerManager().isPause()) {
      app.getTracerManager().resumeStep();
    } else {
      app.getTracerManager().pauseStep();
    }
  });
  $('#btn_prev').click(function () {
    app.getTracerManager().pauseStep();
    app.getTracerManager().prevStep();
  });
  $('#btn_next').click(function () {
    app.getTracerManager().pauseStep();
    app.getTracerManager().nextStep();
  });

  // description & trace

  $('#btn_desc').click(function () {
    $('.tab_container > .tab').removeClass('active');
    $('#tab_desc').addClass('active');
    $('.tab_bar > button').removeClass('active');
    $(this).addClass('active');
  });

  $('#btn_trace').click(function () {
    $('.tab_container > .tab').removeClass('active');
    $('#tab_module').addClass('active');
    $('.tab_bar > button').removeClass('active');
    $(this).addClass('active');
  });
};

},{"../../app":3,"../../server":53,"../toast":23}],18:[function(require,module,exports){
'use strict';

var app = require('../../app');

module.exports = function () {
  $(window).resize(function () {
    app.getTracerManager().resize();
  });
};

},{"../../app":3}],19:[function(require,module,exports){
'use strict';

var app = require('../app');

var _require = require('../utils');

var isScratchPaper = _require.isScratchPaper;


var showDescription = require('./show_description');
var addFiles = require('./add_files');

module.exports = function (category, algorithm, data, requestedFile) {
  var $menu = void 0;
  var category_name = void 0;
  var algorithm_name = void 0;

  if (isScratchPaper(category)) {
    $menu = $('#scratch-paper');
    category_name = 'Scratch Paper';
    algorithm_name = algorithm ? 'Shared' : 'Temporary';
  } else {
    $menu = $('[data-category="' + category + '"][data-algorithm="' + algorithm + '"]');
    var categoryObj = app.getCategory(category);
    category_name = categoryObj.name;
    algorithm_name = categoryObj.list[algorithm];
  }

  $('.sidemenu button').removeClass('active');
  $menu.addClass('active');

  $('#category').html(category_name);
  $('#algorithm').html(algorithm_name);
  $('#tab_desc > .wrapper').empty();
  $('.files_bar > .wrapper').empty();
  $('#explanation').html('');

  app.setLastFileUsed(null);
  app.getEditor().clearContent();

  var files = data.files;


  delete data.files;

  showDescription(data);
  addFiles(category, algorithm, files, requestedFile);
};

},{"../app":3,"../utils":65,"./add_files":5,"./show_description":20}],20:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var isArray = Array.isArray;
var _$ = $;
var each = _$.each;


module.exports = function (data) {
  var $container = $('#tab_desc > .wrapper');
  $container.empty();

  each(data, function (key, value) {

    if (key) {
      $container.append($('<h3>').html(key));
    }

    if (typeof value === 'string') {
      $container.append($('<p>').html(value));
    } else if (isArray(value)) {
      (function () {

        var $ul = $('<ul>');
        $container.append($ul);

        value.forEach(function (li) {
          $ul.append($('<li>').html(li));
        });
      })();
    } else if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
      (function () {

        var $ul = $('<ul>');
        $container.append($ul);

        each(value, function (prop) {
          $ul.append($('<li>').append($('<strong>').html(prop)).append(' ' + value[prop]));
        });
      })();
    }
  });
};

},{}],21:[function(require,module,exports){
'use strict';

// click the first algorithm in the first category

module.exports = function () {
  $('#list button.category').first().click();
  $('#list button.category + .indent').first().click();
};

},{}],22:[function(require,module,exports){
'use strict';

var Server = require('../server');
var showAlgorithm = require('./show_algorithm');

module.exports = function (category, algorithm, file) {
  $('.category[data-category="' + category + '"]').click();
  Server.loadAlgorithm(category, algorithm).then(function (data) {
    showAlgorithm(category, algorithm, data, file);
  });
};

},{"../server":53,"./show_algorithm":19}],23:[function(require,module,exports){
'use strict';

var showToast = function showToast(data, type) {
  var $toast = $('<div class="toast ' + type + '">').append(data);

  $('.toast_container').append($toast);
  setTimeout(function () {
    $toast.fadeOut(function () {
      $toast.remove();
    });
  }, 3000);
};

var showErrorToast = function showErrorToast(err) {
  showToast(err, 'error');
};

var showInfoToast = function showInfoToast(err) {
  showToast(err, 'info');
};

module.exports = {
  showErrorToast: showErrorToast,
  showInfoToast: showInfoToast
};

},{}],24:[function(require,module,exports){
'use strict';

module.exports = function (id) {
  var editor = ace.edit(id);

  editor.setOptions({
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: true
  });

  editor.setTheme('ace/theme/tomorrow_night_eighties');
  editor.session.setMode('ace/mode/javascript');
  editor.$blockScrolling = Infinity;

  return editor;
};

},{}],25:[function(require,module,exports){
'use strict';

var execute = function execute(tracerManager, code) {
  // all modules available to eval are obtained from window
  try {
    tracerManager.deallocateAll();
    eval(code);
    tracerManager.visualize();
  } catch (err) {
    return err;
  } finally {
    tracerManager.removeUnallocated();
  }
};

var executeData = function executeData(tracerManager, algoData) {
  return execute(tracerManager, algoData);
};

var executeDataAndCode = function executeDataAndCode(tracerManager, algoData, algoCode) {
  return execute(tracerManager, algoData + ';' + algoCode);
};

module.exports = {
  executeData: executeData,
  executeDataAndCode: executeDataAndCode
};

},{}],26:[function(require,module,exports){
'use strict';

var app = require('../app');
var createEditor = require('./create');
var Executor = require('./executor');

function Editor(tracerManager) {
  var _this = this;

  if (!tracerManager) {
    throw 'Cannot create Editor. Missing the tracerManager';
  }

  ace.require('ace/ext/language_tools');

  this.dataEditor = createEditor('data');
  this.codeEditor = createEditor('code');

  // Setting data

  this.setData = function (data) {
    _this.dataEditor.setValue(data, -1);
  };

  this.setCode = function (code) {
    _this.codeEditor.setValue(code, -1);
  };

  this.setContent = function (_ref) {
    var data = _ref.data;
    var code = _ref.code;

    _this.setData(data);
    _this.setCode(code);
  };

  // Clearing data

  this.clearData = function () {
    _this.dataEditor.setValue('');
  };

  this.clearCode = function () {
    _this.codeEditor.setValue('');
  };

  this.clearContent = function () {
    _this.clearData();
    _this.clearCode();
  };

  this.execute = function () {
    var data = _this.dataEditor.getValue();
    var code = _this.codeEditor.getValue();
    return Executor.executeDataAndCode(tracerManager, data, code);
  };

  // listeners

  this.dataEditor.on('change', function () {
    var data = _this.dataEditor.getValue();
    var lastFileUsed = app.getLastFileUsed();
    if (lastFileUsed) {
      app.updateCachedFile(lastFileUsed, {
        data: data
      });
    }
    Executor.executeData(tracerManager, data);
  });

  this.codeEditor.on('change', function () {
    var code = _this.codeEditor.getValue();
    var lastFileUsed = app.getLastFileUsed();
    if (lastFileUsed) {
      app.updateCachedFile(lastFileUsed, {
        code: code
      });
    }
  });
};

module.exports = Editor;

},{"../app":3,"./create":24,"./executor":25}],27:[function(require,module,exports){
'use strict';

var RSVP = require('rsvp');
var app = require('./app');
var AppConstructor = require('./app/constructor');
var DOM = require('./dom');
var Server = require('./server');

var modules = require('./module');

var _$ = $;
var extend = _$.extend;


$.ajaxSetup({
  cache: false,
  dataType: 'text'
});

var _require = require('./utils');

var isScratchPaper = _require.isScratchPaper;

var _require2 = require('./server/helpers');

var getPath = _require2.getPath;

// set global promise error handler

RSVP.on('error', function (reason) {
  console.assert(false, reason);
});

$(function () {

  // initialize the application and attach in to the instance module
  var appConstructor = new AppConstructor();
  extend(true, app, appConstructor);

  // load modules to the global scope so they can be evaled
  extend(true, window, modules);

  Server.loadCategories().then(function (data) {
    app.setCategories(data);
    DOM.addCategories();

    // determine if the app is loading a pre-existing scratch-pad
    // or the home page

    var _getPath = getPath();

    var category = _getPath.category;
    var algorithm = _getPath.algorithm;
    var file = _getPath.file;

    if (isScratchPaper(category)) {
      if (algorithm) {
        Server.loadScratchPaper(algorithm).then(function (_ref) {
          var category = _ref.category;
          var algorithm = _ref.algorithm;
          var data = _ref.data;

          DOM.showAlgorithm(category, algorithm, data);
        });
      } else {
        Server.loadAlgorithm(category).then(function (data) {
          DOM.showAlgorithm(category, null, data);
        });
      }
    } else if (category && algorithm) {
      DOM.showRequestedAlgorithm(category, algorithm, file);
    } else {
      DOM.showFirstAlgorithm();
    }
  });
});

},{"./app":3,"./app/constructor":2,"./dom":6,"./module":36,"./server":53,"./server/helpers":52,"./utils":65,"rsvp":67}],28:[function(require,module,exports){
'use strict';

var Array2D = require('./array2d');

var random = function random(N, min, max) {
  return Array2D.random(1, N, min, max)[0];
};

var randomSorted = function randomSorted(N, min, max) {
  return Array2D.randomSorted(1, N, min, max)[0];
};

module.exports = {
  random: random,
  randomSorted: randomSorted
};

},{"./array2d":29}],29:[function(require,module,exports){
"use strict";

var random = function random(N, M, min, max) {
  if (!N) N = 10;
  if (!M) M = 10;
  if (min === undefined) min = 1;
  if (max === undefined) max = 9;
  var D = [];
  for (var i = 0; i < N; i++) {
    D.push([]);
    for (var j = 0; j < M; j++) {
      D[i].push((Math.random() * (max - min + 1) | 0) + min);
    }
  }
  return D;
};

var randomSorted = function randomSorted(N, M, min, max) {
  return random(N, M, min, max).map(function (arr) {
    return arr.sort(function (a, b) {
      return a - b;
    });
  });
};

module.exports = {
  random: random,
  randomSorted: randomSorted
};

},{}],30:[function(require,module,exports){
"use strict";

var random = function random(N, min, max) {
  if (!N) N = 7;
  if (!min) min = 1;
  if (!max) max = 10;
  var C = new Array(N);
  for (var i = 0; i < N; i++) {
    C[i] = new Array(2);
  }for (var i = 0; i < N; i++) {
    for (var j = 0; j < C[i].length; j++) {
      C[i][j] = (Math.random() * (max - min + 1) | 0) + min;
    }
  }return C;
};

module.exports = {
  random: random
};

},{}],31:[function(require,module,exports){
"use strict";

var random = function random(N, ratio) {
  if (!N) N = 5;
  if (!ratio) ratio = .3;
  var G = new Array(N);
  for (var i = 0; i < N; i++) {
    G[i] = new Array(N);
    for (var j = 0; j < N; j++) {
      if (i != j) {
        G[i][j] = (Math.random() * (1 / ratio) | 0) == 0 ? 1 : 0;
      }
    }
  }
  return G;
};

module.exports = {
  random: random
};

},{}],32:[function(require,module,exports){
'use strict';

var Array1D = require('./array1d');
var Array2D = require('./array2d');
var CoordinateSystem = require('./coordinate_system');
var DirectedGraph = require('./directed_graph');
var UndirectedGraph = require('./undirected_graph');
var WeightedDirectedGraph = require('./weighted_directed_graph');
var WeightedUndirectedGraph = require('./weighted_undirected_graph');

module.exports = {
  Array1D: Array1D,
  Array2D: Array2D,
  CoordinateSystem: CoordinateSystem,
  DirectedGraph: DirectedGraph,
  UndirectedGraph: UndirectedGraph,
  WeightedDirectedGraph: WeightedDirectedGraph,
  WeightedUndirectedGraph: WeightedUndirectedGraph
};

},{"./array1d":28,"./array2d":29,"./coordinate_system":30,"./directed_graph":31,"./undirected_graph":33,"./weighted_directed_graph":34,"./weighted_undirected_graph":35}],33:[function(require,module,exports){
"use strict";

var random = function random(N, ratio) {
  if (!N) N = 5;
  if (!ratio) ratio = .3;
  var G = new Array(N);
  for (var i = 0; i < N; i++) {
    G[i] = new Array(N);
  }for (var i = 0; i < N; i++) {
    for (var j = 0; j < N; j++) {
      if (i > j) {
        G[i][j] = G[j][i] = (Math.random() * (1 / ratio) | 0) == 0 ? 1 : 0;
      }
    }
  }
  return G;
};

module.exports = {
  random: random
};

},{}],34:[function(require,module,exports){
"use strict";

var random = function random(N, ratio, min, max) {
  if (!N) N = 5;
  if (!ratio) ratio = .3;
  if (!min) min = 1;
  if (!max) max = 5;
  var G = new Array(N);
  for (var i = 0; i < N; i++) {
    G[i] = new Array(N);
    for (var j = 0; j < N; j++) {
      if (i != j && (Math.random() * (1 / ratio) | 0) == 0) {
        G[i][j] = (Math.random() * (max - min + 1) | 0) + min;
      }
    }
  }
  return G;
};

module.exports = {
  random: random
};

},{}],35:[function(require,module,exports){
"use strict";

var random = function random(N, ratio, min, max) {
  if (!N) N = 5;
  if (!ratio) ratio = .3;
  if (!min) min = 1;
  if (!max) max = 5;
  var G = new Array(N);
  for (var i = 0; i < N; i++) {
    G[i] = new Array(N);
  }for (var i = 0; i < N; i++) {
    for (var j = 0; j < N; j++) {
      if (i > j && (Math.random() * (1 / ratio) | 0) == 0) {
        G[i][j] = G[j][i] = (Math.random() * (max - min + 1) | 0) + min;
      }
    }
  }
  return G;
};

module.exports = {
  random: random
};

},{}],36:[function(require,module,exports){
'use strict';

var tracers = require('./tracer');
var datas = require('./data');

var _$ = $;
var extend = _$.extend;


module.exports = extend(true, {}, tracers, datas);

},{"./data":32,"./tracer":42}],37:[function(require,module,exports){
'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Array2DTracer = require('./array2d');

var Array1DTracer = function (_Array2DTracer) {
  _inherits(Array1DTracer, _Array2DTracer);

  _createClass(Array1DTracer, null, [{
    key: 'getClassName',
    value: function getClassName() {
      return 'Array1DTracer';
    }
  }]);

  function Array1DTracer(name) {
    _classCallCheck(this, Array1DTracer);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Array1DTracer).call(this, name));
  }

  _createClass(Array1DTracer, [{
    key: '_notify',
    value: function _notify(idx, v) {
      _get(Object.getPrototypeOf(Array1DTracer.prototype), '_notify', this).call(this, 0, idx, v);
      return this;
    }
  }, {
    key: '_denotify',
    value: function _denotify(idx) {
      _get(Object.getPrototypeOf(Array1DTracer.prototype), '_denotify', this).call(this, 0, idx);
      return this;
    }
  }, {
    key: '_select',
    value: function _select(s, e) {
      if (e === undefined) {
        _get(Object.getPrototypeOf(Array1DTracer.prototype), '_select', this).call(this, 0, s);
      } else {
        _get(Object.getPrototypeOf(Array1DTracer.prototype), '_selectRow', this).call(this, 0, s, e);
      }
      return this;
    }
  }, {
    key: '_deselect',
    value: function _deselect(s, e) {
      if (e === undefined) {
        _get(Object.getPrototypeOf(Array1DTracer.prototype), '_deselect', this).call(this, 0, s);
      } else {
        _get(Object.getPrototypeOf(Array1DTracer.prototype), '_deselectRow', this).call(this, 0, s, e);
      }
      return this;
    }
  }, {
    key: 'setData',
    value: function setData(D) {
      return _get(Object.getPrototypeOf(Array1DTracer.prototype), 'setData', this).call(this, [D]);
    }
  }]);

  return Array1DTracer;
}(Array2DTracer);

module.exports = Array1DTracer;

},{"./array2d":38}],38:[function(require,module,exports){
'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Tracer = require('./tracer');

var _require = require('../../tracer_manager/util/index');

var refineByType = _require.refineByType;

var Array2DTracer = function (_Tracer) {
  _inherits(Array2DTracer, _Tracer);

  _createClass(Array2DTracer, null, [{
    key: 'getClassName',
    value: function getClassName() {
      return 'Array2DTracer';
    }
  }]);

  function Array2DTracer(name) {
    _classCallCheck(this, Array2DTracer);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Array2DTracer).call(this, name));

    _this.colorClass = {
      selected: 'selected',
      notified: 'notified'
    };

    if (_this.isNew) initView(_this);
    return _this;
  }

  _createClass(Array2DTracer, [{
    key: '_notify',
    value: function _notify(x, y, v) {
      this.manager.pushStep(this.capsule, {
        type: 'notify',
        x: x,
        y: y,
        v: v
      });
      return this;
    }
  }, {
    key: '_denotify',
    value: function _denotify(x, y) {
      this.manager.pushStep(this.capsule, {
        type: 'denotify',
        x: x,
        y: y
      });
      return this;
    }
  }, {
    key: '_select',
    value: function _select(sx, sy, ex, ey) {
      this.pushSelectingStep('select', null, arguments);
      return this;
    }
  }, {
    key: '_selectRow',
    value: function _selectRow(x, sy, ey) {
      this.pushSelectingStep('select', 'row', arguments);
      return this;
    }
  }, {
    key: '_selectCol',
    value: function _selectCol(y, sx, ex) {
      this.pushSelectingStep('select', 'col', arguments);
      return this;
    }
  }, {
    key: '_deselect',
    value: function _deselect(sx, sy, ex, ey) {
      this.pushSelectingStep('deselect', null, arguments);
      return this;
    }
  }, {
    key: '_deselectRow',
    value: function _deselectRow(x, sy, ey) {
      this.pushSelectingStep('deselect', 'row', arguments);
      return this;
    }
  }, {
    key: '_deselectCol',
    value: function _deselectCol(y, sx, ex) {
      this.pushSelectingStep('deselect', 'col', arguments);
      return this;
    }
  }, {
    key: '_separate',
    value: function _separate(x, y) {
      this.manager.pushStep(this.capsule, {
        type: 'separate',
        x: x,
        y: y
      });
      return this;
    }
  }, {
    key: '_separateRow',
    value: function _separateRow(x) {
      this._separate(x, -1);
      return this;
    }
  }, {
    key: '_separateCol',
    value: function _separateCol(y) {
      this._separate(-1, y);
      return this;
    }
  }, {
    key: '_deseparate',
    value: function _deseparate(x, y) {
      this.manager.pushStep(this.capsule, {
        type: 'deseparate',
        x: x,
        y: y
      });
      return this;
    }
  }, {
    key: '_deseparateRow',
    value: function _deseparateRow(x) {
      this._deseparate(x, -1);
      return this;
    }
  }, {
    key: '_deseparateCol',
    value: function _deseparateCol(y) {
      this._deseparate(-1, y);
      return this;
    }
  }, {
    key: 'pushSelectingStep',
    value: function pushSelectingStep() {
      var args = Array.prototype.slice.call(arguments);
      var type = args.shift();
      var mode = args.shift();
      args = Array.prototype.slice.call(args.shift());
      var coord;
      switch (mode) {
        case 'row':
          coord = {
            x: args[0],
            sy: args[1],
            ey: args[2]
          };
          break;
        case 'col':
          coord = {
            y: args[0],
            sx: args[1],
            ex: args[2]
          };
          break;
        default:
          if (args[2] === undefined && args[3] === undefined) {
            coord = {
              x: args[0],
              y: args[1]
            };
          } else {
            coord = {
              sx: args[0],
              sy: args[1],
              ex: args[2],
              ey: args[3]
            };
          }
      }
      var step = {
        type: type
      };
      $.extend(step, coord);
      this.manager.pushStep(this.capsule, step);
    }
  }, {
    key: 'processStep',
    value: function processStep(step, options) {
      switch (step.type) {
        case 'notify':
          if (step.v !== undefined) {
            var $row = this.$table.find('.mtbl-row').eq(step.x);
            var $col = $row.find('.mtbl-col').eq(step.y);
            $col.text(refineByType(step.v));
          }
        case 'denotify':
        case 'select':
        case 'deselect':
          var colorClass = step.type == 'select' || step.type == 'deselect' ? this.colorClass.selected : this.colorClass.notified;
          var addClass = step.type == 'select' || step.type == 'notify';
          var sx = step.sx;
          var sy = step.sy;
          var ex = step.ex;
          var ey = step.ey;
          if (sx === undefined) sx = step.x;
          if (sy === undefined) sy = step.y;
          if (ex === undefined) ex = step.x;
          if (ey === undefined) ey = step.y;
          this.paintColor(sx, sy, ex, ey, colorClass, addClass);
          break;
        case 'separate':
          this.deseparate(step.x, step.y);
          this.separate(step.x, step.y);
          break;
        case 'deseparate':
          this.deseparate(step.x, step.y);
          break;
        default:
          _get(Object.getPrototypeOf(Array2DTracer.prototype), 'processStep', this).call(this, step, options);
      }
    }
  }, {
    key: 'setData',
    value: function setData(D) {
      this.viewX = this.viewY = 0;
      this.paddingH = 6;
      this.paddingV = 3;
      this.fontSize = 16;

      if (_get(Object.getPrototypeOf(Array2DTracer.prototype), 'setData', this).apply(this, arguments)) {
        this.$table.find('.mtbl-row').each(function (i) {
          $(this).find('.mtbl-col').each(function (j) {
            $(this).text(refineByType(D[i][j]));
          });
        });
        return true;
      }

      this.$table.empty();
      for (var i = 0; i < D.length; i++) {
        var $row = $('<div class="mtbl-row">');
        this.$table.append($row);
        for (var j = 0; j < D[i].length; j++) {
          var $col = $('<div class="mtbl-col">').css(this.getCellCss()).text(refineByType(D[i][j]));
          $row.append($col);
        }
      }
      this.resize();

      return false;
    }
  }, {
    key: 'resize',
    value: function resize() {
      _get(Object.getPrototypeOf(Array2DTracer.prototype), 'resize', this).call(this);

      this.refresh();
    }
  }, {
    key: 'clear',
    value: function clear() {
      _get(Object.getPrototypeOf(Array2DTracer.prototype), 'clear', this).call(this);

      this.clearColor();
      this.deseparateAll();
    }
  }, {
    key: 'getCellCss',
    value: function getCellCss() {
      return {
        padding: this.paddingV.toFixed(1) + 'px ' + this.paddingH.toFixed(1) + 'px',
        'font-size': this.fontSize.toFixed(1) + 'px'
      };
    }
  }, {
    key: 'refresh',
    value: function refresh() {
      _get(Object.getPrototypeOf(Array2DTracer.prototype), 'refresh', this).call(this);

      var $parent = this.$table.parent();
      var top = $parent.height() / 2 - this.$table.height() / 2 + this.viewY;
      var left = $parent.width() / 2 - this.$table.width() / 2 + this.viewX;
      this.$table.css('margin-top', top);
      this.$table.css('margin-left', left);
    }
  }, {
    key: 'mousedown',
    value: function mousedown(e) {
      _get(Object.getPrototypeOf(Array2DTracer.prototype), 'mousedown', this).call(this, e);

      this.dragX = e.pageX;
      this.dragY = e.pageY;
      this.dragging = true;
    }
  }, {
    key: 'mousemove',
    value: function mousemove(e) {
      _get(Object.getPrototypeOf(Array2DTracer.prototype), 'mousemove', this).call(this, e);

      if (this.dragging) {
        this.viewX += e.pageX - this.dragX;
        this.viewY += e.pageY - this.dragY;
        this.dragX = e.pageX;
        this.dragY = e.pageY;
        this.refresh();
      }
    }
  }, {
    key: 'mouseup',
    value: function mouseup(e) {
      _get(Object.getPrototypeOf(Array2DTracer.prototype), 'mouseup', this).call(this, e);

      this.dragging = false;
    }
  }, {
    key: 'mousewheel',
    value: function mousewheel(e) {
      _get(Object.getPrototypeOf(Array2DTracer.prototype), 'mousewheel', this).call(this, e);

      e.preventDefault();
      e = e.originalEvent;
      var delta = e.wheelDelta !== undefined && e.wheelDelta || e.detail !== undefined && -e.detail;
      var weight = 1.01;
      var ratio = delta > 0 ? 1 / weight : weight;
      if (this.fontSize < 4 && ratio < 1) return;
      if (this.fontSize > 40 && ratio > 1) return;
      this.paddingV *= ratio;
      this.paddingH *= ratio;
      this.fontSize *= ratio;
      this.$table.find('.mtbl-col').css(this.getCellCss());
      this.refresh();
    }
  }, {
    key: 'paintColor',
    value: function paintColor(sx, sy, ex, ey, colorClass, addClass) {
      for (var i = sx; i <= ex; i++) {
        var $row = this.$table.find('.mtbl-row').eq(i);
        for (var j = sy; j <= ey; j++) {
          var $col = $row.find('.mtbl-col').eq(j);
          if (addClass) $col.addClass(colorClass);else $col.removeClass(colorClass);
        }
      }
    }
  }, {
    key: 'clearColor',
    value: function clearColor() {
      this.$table.find('.mtbl-col').removeClass(Object.keys(this.colorClass).join(' '));
    }
  }, {
    key: 'separate',
    value: function separate(x, y) {
      this.$table.find('.mtbl-row').each(function (i) {
        var $row = $(this);
        if (i == x) {
          $row.after($('<div class="mtbl-empty-row">').attr('data-row', i));
        }
        $row.find('.mtbl-col').each(function (j) {
          var $col = $(this);
          if (j == y) {
            $col.after($('<div class="mtbl-empty-col">').attr('data-col', j));
          }
        });
      });
    }
  }, {
    key: 'deseparate',
    value: function deseparate(x, y) {
      this.$table.find('[data-row=' + x + ']').remove();
      this.$table.find('[data-col=' + y + ']').remove();
    }
  }, {
    key: 'deseparateAll',
    value: function deseparateAll() {
      this.$table.find('.mtbl-empty-row, .mtbl-empty-col').remove();
    }
  }]);

  return Array2DTracer;
}(Tracer);

var initView = function initView(tracer) {
  tracer.$table = tracer.capsule.$table = $('<div class="mtbl-table">');
  tracer.$container.append(tracer.$table);
};

module.exports = Array2DTracer;

},{"../../tracer_manager/util/index":62,"./tracer":44}],39:[function(require,module,exports){
'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Tracer = require('./tracer');

var ChartTracer = function (_Tracer) {
  _inherits(ChartTracer, _Tracer);

  _createClass(ChartTracer, null, [{
    key: 'getClassName',
    value: function getClassName() {
      return 'ChartTracer';
    }
  }]);

  function ChartTracer(name) {
    _classCallCheck(this, ChartTracer);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(ChartTracer).call(this, name));

    if (_this.isNew) initView(_this);
    return _this;
  }

  _createClass(ChartTracer, [{
    key: 'setData',
    value: function setData(C) {
      if (_get(Object.getPrototypeOf(ChartTracer.prototype), 'setData', this).apply(this, arguments)) return true;

      if (this.chart) this.chart.destroy();
      var color = [];
      for (var i = 0; i < C.length; i++) {
        color.push('rgba(136, 136, 136, 1)');
      }var data = {
        type: 'bar',
        data: {
          labels: C.map(String),
          datasets: [{
            backgroundColor: color,
            data: C
          }]
        },
        options: {
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
          },
          animation: false,
          legend: false,
          responsive: true,
          maintainAspectRatio: false
        }
      };
      this.chart = this.capsule.chart = new Chart(this.$wrapper, data);
    }
  }, {
    key: '_notify',
    value: function _notify(s, v) {
      this.manager.pushStep(this.capsule, {
        type: 'notify',
        s: s,
        v: v
      });
      return this;
    }
  }, {
    key: '_denotify',
    value: function _denotify(s) {
      this.manager.pushStep(this.capsule, {
        type: 'denotify',
        s: s
      });
      return this;
    }
  }, {
    key: '_select',
    value: function _select(s, e) {
      this.manager.pushStep(this.capsule, {
        type: 'select',
        s: s,
        e: e
      });
      return this;
    }
  }, {
    key: '_deselect',
    value: function _deselect(s, e) {
      this.manager.pushStep(this.capsule, {
        type: 'deselect',
        s: s,
        e: e
      });
      return this;
    }
  }, {
    key: 'processStep',
    value: function processStep(step, options) {
      switch (step.type) {
        case 'notify':
          if (step.v !== undefined) {
            this.chart.config.data.datasets[0].data[step.s] = step.v;
            this.chart.config.data.labels[step.s] = step.v.toString();
          }
        case 'denotify':
        case 'deselect':
          var color = step.type == 'denotify' || step.type == 'deselect' ? 'rgba(136, 136, 136, 1)' : 'rgba(255, 0, 0, 1)';
        case 'select':
          if (color === undefined) var color = 'rgba(0, 0, 255, 1)';
          if (step.e !== undefined) for (var i = step.s; i <= step.e; i++) {
            this.chart.config.data.datasets[0].backgroundColor[i] = color;
          } else this.chart.config.data.datasets[0].backgroundColor[step.s] = color;
          this.chart.update();
          break;
        default:
          _get(Object.getPrototypeOf(ChartTracer.prototype), 'processStep', this).call(this, step, options);
      }
    }
  }]);

  return ChartTracer;
}(Tracer);

var initView = function initView(tracer) {
  tracer.$wrapper = tracer.capsule.$wrapper = $('<canvas class="mchrt-chart">');
  tracer.$container.append(tracer.$wrapper);
};

module.exports = ChartTracer;

},{"./tracer":44}],40:[function(require,module,exports){
'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DirectedGraphTracer = require('./directed_graph');

var CoordinateSystemTracer = function (_DirectedGraphTracer) {
  _inherits(CoordinateSystemTracer, _DirectedGraphTracer);

  _createClass(CoordinateSystemTracer, null, [{
    key: 'getClassName',
    value: function getClassName() {
      return 'CoordinateSystemTracer';
    }
  }]);

  function CoordinateSystemTracer(name) {
    _classCallCheck(this, CoordinateSystemTracer);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(CoordinateSystemTracer).call(this, name));

    if (_this.isNew) initView(_this);
    return _this;
  }

  _createClass(CoordinateSystemTracer, [{
    key: 'setData',
    value: function setData(C) {
      if (Tracer.prototype.setData.apply(this, arguments)) return true;

      this.graph.clear();
      var nodes = [];
      var edges = [];
      for (var i = 0; i < C.length; i++) {
        nodes.push({
          id: this.n(i),
          x: C[i][0],
          y: C[i][1],
          label: '' + i,
          size: 1,
          color: this.color.default
        });
      }this.graph.read({
        nodes: nodes,
        edges: edges
      });
      this.s.camera.goTo({
        x: 0,
        y: 0,
        angle: 0,
        ratio: 1
      });
      this.refresh();

      return false;
    }
  }, {
    key: 'processStep',
    value: function processStep(step, options) {
      switch (step.type) {
        case 'visit':
        case 'leave':
          var visit = step.type == 'visit';
          var targetNode = this.graph.nodes(this.n(step.target));
          var color = visit ? this.color.visited : this.color.left;
          targetNode.color = color;
          if (step.source !== undefined) {
            var edgeId = this.e(step.source, step.target);
            if (this.graph.edges(edgeId)) {
              var edge = this.graph.edges(edgeId);
              edge.color = color;
              this.graph.dropEdge(edgeId).addEdge(edge);
            } else {
              this.graph.addEdge({
                id: this.e(step.target, step.source),
                source: this.n(step.source),
                target: this.n(step.target),
                color: color,
                size: 1
              });
            }
          }
          if (this.logTracer) {
            var source = step.source;
            if (source === undefined) source = '';
            this.logTracer.print(visit ? source + ' -> ' + step.target : source + ' <- ' + step.target);
          }
          break;
        default:
          _get(Object.getPrototypeOf(CoordinateSystemTracer.prototype), 'processStep', this).call(this, step, options);
      }
    }
  }, {
    key: 'e',
    value: function e(v1, v2) {
      if (v1 > v2) {
        var temp = v1;
        v1 = v2;
        v2 = temp;
      }
      return 'e' + v1 + '_' + v2;
    }
  }, {
    key: 'drawOnHover',
    value: function drawOnHover(node, context, settings, next) {
      var tracer = this;

      context.setLineDash([5, 5]);
      var nodeIdx = node.id.substring(1);
      this.graph.edges().forEach(function (edge) {
        var ends = edge.id.substring(1).split("_");
        if (ends[0] == nodeIdx) {
          var color = '#0ff';
          var source = node;
          var target = tracer.graph.nodes('n' + ends[1]);
          tracer.drawEdge(edge, source, target, color, context, settings);
          if (next) next(edge, source, target, color, context, settings);
        } else if (ends[1] == nodeIdx) {
          var color = '#0ff';
          var source = tracer.graph.nodes('n' + ends[0]);
          var target = node;
          tracer.drawEdge(edge, source, target, color, context, settings);
          if (next) next(edge, source, target, color, context, settings);
        }
      });
    }
  }, {
    key: 'drawEdge',
    value: function drawEdge(edge, source, target, color, context, settings) {
      var prefix = settings('prefix') || '',
          size = edge[prefix + 'size'] || 1;

      context.strokeStyle = color;
      context.lineWidth = size;
      context.beginPath();
      context.moveTo(source[prefix + 'x'], source[prefix + 'y']);
      context.lineTo(target[prefix + 'x'], target[prefix + 'y']);
      context.stroke();
    }
  }]);

  return CoordinateSystemTracer;
}(DirectedGraphTracer);

var initView = function initView(tracer) {
  tracer.s.settings({
    defaultEdgeType: 'def',
    funcEdgesDef: function funcEdgesDef(edge, source, target, context, settings) {
      var color = tracer.getColor(edge, source, target, settings);
      tracer.drawEdge(edge, source, target, color, context, settings);
    }
  });
};

module.exports = CoordinateSystemTracer;

},{"./directed_graph":41}],41:[function(require,module,exports){
'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Tracer = require('./tracer');

var _require = require('../../tracer_manager/util/index');

var refineByType = _require.refineByType;

var DirectedGraphTracer = function (_Tracer) {
  _inherits(DirectedGraphTracer, _Tracer);

  _createClass(DirectedGraphTracer, null, [{
    key: 'getClassName',
    value: function getClassName() {
      return 'DirectedGraphTracer';
    }
  }]);

  function DirectedGraphTracer(name) {
    _classCallCheck(this, DirectedGraphTracer);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(DirectedGraphTracer).call(this, name));

    _this.color = {
      visited: '#f00',
      left: '#000',
      default: '#888'
    };

    if (_this.isNew) initView(_this);
    return _this;
  }

  _createClass(DirectedGraphTracer, [{
    key: '_setTreeData',
    value: function _setTreeData(G, root) {
      this.manager.pushStep(this.capsule, {
        type: 'setTreeData',
        arguments: arguments
      });
      return this;
    }
  }, {
    key: '_visit',
    value: function _visit(target, source) {
      this.manager.pushStep(this.capsule, {
        type: 'visit',
        target: target,
        source: source
      });
      return this;
    }
  }, {
    key: '_leave',
    value: function _leave(target, source) {
      this.manager.pushStep(this.capsule, {
        type: 'leave',
        target: target,
        source: source
      });
      return this;
    }
  }, {
    key: 'processStep',
    value: function processStep(step, options) {
      switch (step.type) {
        case 'setTreeData':
          this.setTreeData.apply(this, step.arguments);
          break;
        case 'visit':
        case 'leave':
          var visit = step.type == 'visit';
          var targetNode = this.graph.nodes(this.n(step.target));
          var color = visit ? this.color.visited : this.color.left;
          targetNode.color = color;
          if (step.source !== undefined) {
            var edgeId = this.e(step.source, step.target);
            var edge = this.graph.edges(edgeId);
            edge.color = color;
            this.graph.dropEdge(edgeId).addEdge(edge);
          }
          if (this.logTracer) {
            var source = step.source;
            if (source === undefined) source = '';
            this.logTracer.print(visit ? source + ' -> ' + step.target : source + ' <- ' + step.target);
          }
          break;
        default:
          _get(Object.getPrototypeOf(DirectedGraphTracer.prototype), 'processStep', this).call(this, step, options);
      }
    }
  }, {
    key: 'setTreeData',
    value: function setTreeData(G, root) {
      var tracer = this;

      root = root || 0;
      var maxDepth = -1;

      var chk = new Array(G.length);
      var getDepth = function getDepth(node, depth) {
        if (chk[node]) throw "the given graph is not a tree because it forms a circuit";
        chk[node] = true;
        if (maxDepth < depth) maxDepth = depth;
        for (var i = 0; i < G[node].length; i++) {
          if (G[node][i]) getDepth(i, depth + 1);
        }
      };
      getDepth(root, 1);

      if (this.setData(G)) return true;

      var place = function place(node, x, y) {
        var temp = tracer.graph.nodes(tracer.n(node));
        temp.x = x;
        temp.y = y;
      };

      var wgap = 1 / (maxDepth - 1);
      var dfs = function dfs(node, depth, top, bottom) {
        place(node, top + bottom, depth * wgap);
        var children = 0;
        for (var i = 0; i < G[node].length; i++) {
          if (G[node][i]) children++;
        }
        var vgap = (bottom - top) / children;
        var cnt = 0;
        for (var i = 0; i < G[node].length; i++) {
          if (G[node][i]) dfs(i, depth + 1, top + vgap * cnt, top + vgap * ++cnt);
        }
      };
      dfs(root, 0, 0, 1);

      this.refresh();
    }
  }, {
    key: 'setData',
    value: function setData(G, undirected) {
      if (_get(Object.getPrototypeOf(DirectedGraphTracer.prototype), 'setData', this).apply(this, arguments)) return true;

      this.graph.clear();
      var nodes = [];
      var edges = [];
      var unitAngle = 2 * Math.PI / G.length;
      var currentAngle = 0;
      for (var i = 0; i < G.length; i++) {
        currentAngle += unitAngle;
        nodes.push({
          id: this.n(i),
          label: '' + i,
          x: .5 + Math.sin(currentAngle) / 2,
          y: .5 + Math.cos(currentAngle) / 2,
          size: 1,
          color: this.color.default,
          weight: 0
        });

        if (undirected) {
          for (var j = 0; j <= i; j++) {
            if (G[i][j] || G[j][i]) {
              edges.push({
                id: this.e(i, j),
                source: this.n(i),
                target: this.n(j),
                color: this.color.default,
                size: 1,
                weight: refineByType(G[i][j])
              });
            }
          }
        } else {
          for (var _j = 0; _j < G[i].length; _j++) {
            if (G[i][_j]) {
              edges.push({
                id: this.e(i, _j),
                source: this.n(i),
                target: this.n(_j),
                color: this.color.default,
                size: 1,
                weight: refineByType(G[i][_j])
              });
            }
          }
        }
      }

      this.graph.read({
        nodes: nodes,
        edges: edges
      });
      this.s.camera.goTo({
        x: 0,
        y: 0,
        angle: 0,
        ratio: 1
      });
      this.refresh();

      return false;
    }
  }, {
    key: 'resize',
    value: function resize() {
      _get(Object.getPrototypeOf(DirectedGraphTracer.prototype), 'resize', this).call(this);

      this.s.renderers[0].resize();
      this.refresh();
    }
  }, {
    key: 'refresh',
    value: function refresh() {
      _get(Object.getPrototypeOf(DirectedGraphTracer.prototype), 'refresh', this).call(this);

      this.s.refresh();
    }
  }, {
    key: 'clear',
    value: function clear() {
      _get(Object.getPrototypeOf(DirectedGraphTracer.prototype), 'clear', this).call(this);

      this.clearGraphColor();
    }
  }, {
    key: 'clearGraphColor',
    value: function clearGraphColor() {
      var tracer = this;

      this.graph.nodes().forEach(function (node) {
        node.color = tracer.color.default;
      });
      this.graph.edges().forEach(function (edge) {
        edge.color = tracer.color.default;
      });
    }
  }, {
    key: 'n',
    value: function n(v) {
      return 'n' + v;
    }
  }, {
    key: 'e',
    value: function e(v1, v2) {
      return 'e' + v1 + '_' + v2;
    }
  }, {
    key: 'getColor',
    value: function getColor(edge, source, target, settings) {
      var color = edge.color,
          edgeColor = settings('edgeColor'),
          defaultNodeColor = settings('defaultNodeColor'),
          defaultEdgeColor = settings('defaultEdgeColor');
      if (!color) switch (edgeColor) {
        case 'source':
          color = source.color || defaultNodeColor;
          break;
        case 'target':
          color = target.color || defaultNodeColor;
          break;
        default:
          color = defaultEdgeColor;
          break;
      }

      return color;
    }
  }, {
    key: 'drawLabel',
    value: function drawLabel(node, context, settings) {
      var fontSize,
          prefix = settings('prefix') || '',
          size = node[prefix + 'size'];

      if (size < settings('labelThreshold')) return;

      if (!node.label || typeof node.label !== 'string') return;

      fontSize = settings('labelSize') === 'fixed' ? settings('defaultLabelSize') : settings('labelSizeRatio') * size;

      context.font = (settings('fontStyle') ? settings('fontStyle') + ' ' : '') + fontSize + 'px ' + settings('font');
      context.fillStyle = settings('labelColor') === 'node' ? node.color || settings('defaultNodeColor') : settings('defaultLabelColor');

      context.textAlign = 'center';
      context.fillText(node.label, Math.round(node[prefix + 'x']), Math.round(node[prefix + 'y'] + fontSize / 3));
    }
  }, {
    key: 'drawArrow',
    value: function drawArrow(edge, source, target, color, context, settings) {
      var prefix = settings('prefix') || '',
          size = edge[prefix + 'size'] || 1,
          tSize = target[prefix + 'size'],
          sX = source[prefix + 'x'],
          sY = source[prefix + 'y'],
          tX = target[prefix + 'x'],
          tY = target[prefix + 'y'],
          angle = Math.atan2(tY - sY, tX - sX),
          dist = 3;
      sX += Math.sin(angle) * dist;
      tX += Math.sin(angle) * dist;
      sY += -Math.cos(angle) * dist;
      tY += -Math.cos(angle) * dist;
      var aSize = Math.max(size * 2.5, settings('minArrowSize')),
          d = Math.sqrt(Math.pow(tX - sX, 2) + Math.pow(tY - sY, 2)),
          aX = sX + (tX - sX) * (d - aSize - tSize) / d,
          aY = sY + (tY - sY) * (d - aSize - tSize) / d,
          vX = (tX - sX) * aSize / d,
          vY = (tY - sY) * aSize / d;

      context.strokeStyle = color;
      context.lineWidth = size;
      context.beginPath();
      context.moveTo(sX, sY);
      context.lineTo(aX, aY);
      context.stroke();

      context.fillStyle = color;
      context.beginPath();
      context.moveTo(aX + vX, aY + vY);
      context.lineTo(aX + vY * 0.6, aY - vX * 0.6);
      context.lineTo(aX - vY * 0.6, aY + vX * 0.6);
      context.lineTo(aX + vX, aY + vY);
      context.closePath();
      context.fill();
    }
  }, {
    key: 'drawOnHover',
    value: function drawOnHover(node, context, settings, next) {
      var tracer = this;

      context.setLineDash([5, 5]);
      var nodeIdx = node.id.substring(1);
      this.graph.edges().forEach(function (edge) {
        var ends = edge.id.substring(1).split("_");
        if (ends[0] == nodeIdx) {
          var color = '#0ff';
          var source = node;
          var target = tracer.graph.nodes('n' + ends[1]);
          tracer.drawArrow(edge, source, target, color, context, settings);
          if (next) next(edge, source, target, color, context, settings);
        } else if (ends[1] == nodeIdx) {
          var color = '#ff0';
          var source = tracer.graph.nodes('n' + ends[0]);
          var target = node;
          tracer.drawArrow(edge, source, target, color, context, settings);
          if (next) next(edge, source, target, color, context, settings);
        }
      });
    }
  }]);

  return DirectedGraphTracer;
}(Tracer);

var initView = function initView(tracer) {
  tracer.s = tracer.capsule.s = new sigma({
    renderer: {
      container: tracer.$container[0],
      type: 'canvas'
    },
    settings: {
      minArrowSize: 8,
      defaultEdgeType: 'arrow',
      maxEdgeSize: 2.5,
      labelThreshold: 4,
      font: 'Roboto',
      defaultLabelColor: '#fff',
      zoomMin: 0.6,
      zoomMax: 1.2,
      skipErrors: true,
      minNodeSize: .5,
      maxNodeSize: 12,
      labelSize: 'proportional',
      labelSizeRatio: 1.3,
      funcLabelsDef: function funcLabelsDef(node, context, settings) {
        tracer.drawLabel(node, context, settings);
      },
      funcHoversDef: function funcHoversDef(node, context, settings, next) {
        tracer.drawOnHover(node, context, settings, next);
      },
      funcEdgesArrow: function funcEdgesArrow(edge, source, target, context, settings) {
        var color = tracer.getColor(edge, source, target, settings);
        tracer.drawArrow(edge, source, target, color, context, settings);
      }
    }
  });
  sigma.plugins.dragNodes(tracer.s, tracer.s.renderers[0]);
  tracer.graph = tracer.capsule.graph = tracer.s.graph;
};

sigma.canvas.labels.def = function (node, context, settings) {
  var func = settings('funcLabelsDef');
  if (func) {
    func(node, context, settings);
  }
};
sigma.canvas.hovers.def = function (node, context, settings) {
  var func = settings('funcHoversDef');
  if (func) {
    func(node, context, settings);
  }
};
sigma.canvas.edges.def = function (edge, source, target, context, settings) {
  var func = settings('funcEdgesDef');
  if (func) {
    func(edge, source, target, context, settings);
  }
};
sigma.canvas.edges.arrow = function (edge, source, target, context, settings) {
  var func = settings('funcEdgesArrow');
  if (func) {
    func(edge, source, target, context, settings);
  }
};

module.exports = DirectedGraphTracer;

},{"../../tracer_manager/util/index":62,"./tracer":44}],42:[function(require,module,exports){
'use strict';

var Tracer = require('./tracer');
var LogTracer = require('./log');
var Array1DTracer = require('./array1d');
var Array2DTracer = require('./array2d');
var ChartTracer = require('./chart');
var CoordinateSystemTracer = require('./coordinate_system');
var DirectedGraphTracer = require('./directed_graph');
var UndirectedGraphTracer = require('./undirected_graph');
var WeightedDirectedGraphTracer = require('./weighted_directed_graph');
var WeightedUndirectedGraphTracer = require('./weighted_undirected_graph');

module.exports = {
  Tracer: Tracer,
  LogTracer: LogTracer,
  Array1DTracer: Array1DTracer,
  Array2DTracer: Array2DTracer,
  ChartTracer: ChartTracer,
  CoordinateSystemTracer: CoordinateSystemTracer,
  DirectedGraphTracer: DirectedGraphTracer,
  UndirectedGraphTracer: UndirectedGraphTracer,
  WeightedDirectedGraphTracer: WeightedDirectedGraphTracer,
  WeightedUndirectedGraphTracer: WeightedUndirectedGraphTracer
};

},{"./array1d":37,"./array2d":38,"./chart":39,"./coordinate_system":40,"./directed_graph":41,"./log":43,"./tracer":44,"./undirected_graph":45,"./weighted_directed_graph":46,"./weighted_undirected_graph":47}],43:[function(require,module,exports){
'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Tracer = require('./tracer');

var LogTracer = function (_Tracer) {
  _inherits(LogTracer, _Tracer);

  _createClass(LogTracer, null, [{
    key: 'getClassName',
    value: function getClassName() {
      return 'LogTracer';
    }
  }]);

  function LogTracer(name) {
    _classCallCheck(this, LogTracer);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(LogTracer).call(this, name));

    if (_this.isNew) initView(_this);
    return _this;
  }

  _createClass(LogTracer, [{
    key: '_print',
    value: function _print(msg) {
      this.manager.pushStep(this.capsule, {
        type: 'print',
        msg: msg
      });
      return this;
    }
  }, {
    key: 'processStep',
    value: function processStep(step, options) {
      switch (step.type) {
        case 'print':
          this.print(step.msg);
          break;
      }
    }
  }, {
    key: 'refresh',
    value: function refresh() {
      this.scrollToEnd(Math.min(50, this.interval));
    }
  }, {
    key: 'clear',
    value: function clear() {
      _get(Object.getPrototypeOf(LogTracer.prototype), 'clear', this).call(this);

      this.$wrapper.empty();
    }
  }, {
    key: 'print',
    value: function print(message) {
      this.$wrapper.append($('<span>').append(message + '<br/>'));
    }
  }, {
    key: 'scrollToEnd',
    value: function scrollToEnd(duration) {
      this.$container.animate({
        scrollTop: this.$container[0].scrollHeight
      }, duration);
    }
  }]);

  return LogTracer;
}(Tracer);

var initView = function initView(tracer) {
  tracer.$wrapper = tracer.capsule.$wrapper = $('<div class="wrapper">');
  tracer.$container.append(tracer.$wrapper);
};

module.exports = LogTracer;

},{"./tracer":44}],44:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var app = require('../../app');

var _require = require('../../tracer_manager/util/index');

var toJSON = _require.toJSON;
var fromJSON = _require.fromJSON;

var Tracer = function () {
  _createClass(Tracer, null, [{
    key: 'getClassName',
    value: function getClassName() {
      return 'Tracer';
    }
  }]);

  function Tracer(name) {
    _classCallCheck(this, Tracer);

    this.module = this.constructor;

    this.manager = app.getTracerManager();
    this.capsule = this.manager.allocate(this);
    $.extend(this, this.capsule);

    this.setName(name);
  }

  _createClass(Tracer, [{
    key: '_setData',
    value: function _setData() {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      this.manager.pushStep(this.capsule, {
        type: 'setData',
        args: toJSON(args)
      });
      return this;
    }
  }, {
    key: '_clear',
    value: function _clear() {
      this.manager.pushStep(this.capsule, {
        type: 'clear'
      });
      return this;
    }
  }, {
    key: '_wait',
    value: function _wait() {
      this.manager.newStep();
      return this;
    }
  }, {
    key: 'processStep',
    value: function processStep(step, options) {
      var type = step.type;
      var args = step.args;


      switch (type) {
        case 'setData':
          this.setData.apply(this, _toConsumableArray(fromJSON(args)));
          break;
        case 'clear':
          this.clear();
          break;
      }
    }
  }, {
    key: 'setName',
    value: function setName(name) {
      var $name = void 0;
      if (this.isNew) {
        $name = $('<span class="name">');
        this.$container.append($name);
      } else {
        $name = this.$container.find('span.name');
      }
      $name.text(name || this.defaultName);
    }
  }, {
    key: 'setData',
    value: function setData() {
      var data = toJSON(arguments);
      if (!this.isNew && this.lastData === data) {
        return true;
      }
      this.lastData = this.capsule.lastData = data;
      return false;
    }
  }, {
    key: 'resize',
    value: function resize() {}
  }, {
    key: 'refresh',
    value: function refresh() {}
  }, {
    key: 'clear',
    value: function clear() {}
  }, {
    key: 'attach',
    value: function attach(tracer) {
      if (tracer.module === LogTracer) {
        this.logTracer = tracer;
      }
      return this;
    }
  }, {
    key: 'mousedown',
    value: function mousedown(e) {}
  }, {
    key: 'mousemove',
    value: function mousemove(e) {}
  }, {
    key: 'mouseup',
    value: function mouseup(e) {}
  }, {
    key: 'mousewheel',
    value: function mousewheel(e) {}
  }]);

  return Tracer;
}();

module.exports = Tracer;

},{"../../app":3,"../../tracer_manager/util/index":62}],45:[function(require,module,exports){
'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DirectedGraphTracer = require('./directed_graph');

var UndirectedGraphTracer = function (_DirectedGraphTracer) {
  _inherits(UndirectedGraphTracer, _DirectedGraphTracer);

  _createClass(UndirectedGraphTracer, null, [{
    key: 'getClassName',
    value: function getClassName() {
      return 'UndirectedGraphTracer';
    }
  }]);

  function UndirectedGraphTracer(name) {
    _classCallCheck(this, UndirectedGraphTracer);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(UndirectedGraphTracer).call(this, name));

    if (_this.isNew) initView(_this);
    return _this;
  }

  _createClass(UndirectedGraphTracer, [{
    key: 'setData',
    value: function setData(G) {
      return _get(Object.getPrototypeOf(UndirectedGraphTracer.prototype), 'setData', this).call(this, G, true);
    }
  }, {
    key: 'e',
    value: function e(v1, v2) {
      if (v1 > v2) {
        var temp = v1;
        v1 = v2;
        v2 = temp;
      }
      return 'e' + v1 + '_' + v2;
    }
  }, {
    key: 'drawOnHover',
    value: function drawOnHover(node, context, settings, next) {
      var tracer = this;

      context.setLineDash([5, 5]);
      var nodeIdx = node.id.substring(1);
      this.graph.edges().forEach(function (edge) {
        var ends = edge.id.substring(1).split("_");
        if (ends[0] == nodeIdx) {
          var color = '#0ff';
          var source = node;
          var target = tracer.graph.nodes('n' + ends[1]);
          tracer.drawEdge(edge, source, target, color, context, settings);
          if (next) next(edge, source, target, color, context, settings);
        } else if (ends[1] == nodeIdx) {
          var color = '#0ff';
          var source = tracer.graph.nodes('n' + ends[0]);
          var target = node;
          tracer.drawEdge(edge, source, target, color, context, settings);
          if (next) next(edge, source, target, color, context, settings);
        }
      });
    }
  }, {
    key: 'drawEdge',
    value: function drawEdge(edge, source, target, color, context, settings) {
      var prefix = settings('prefix') || '',
          size = edge[prefix + 'size'] || 1;

      context.strokeStyle = color;
      context.lineWidth = size;
      context.beginPath();
      context.moveTo(source[prefix + 'x'], source[prefix + 'y']);
      context.lineTo(target[prefix + 'x'], target[prefix + 'y']);
      context.stroke();
    }
  }]);

  return UndirectedGraphTracer;
}(DirectedGraphTracer);

var initView = function initView(tracer) {
  tracer.s.settings({
    defaultEdgeType: 'def',
    funcEdgesDef: function funcEdgesDef(edge, source, target, context, settings) {
      var color = tracer.getColor(edge, source, target, settings);
      tracer.drawEdge(edge, source, target, color, context, settings);
    }
  });
};

module.exports = UndirectedGraphTracer;

},{"./directed_graph":41}],46:[function(require,module,exports){
'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DirectedGraphTracer = require('./directed_graph');

var _require = require('../../tracer_manager/util/index');

var refineByType = _require.refineByType;

var WeightedDirectedGraphTracer = function (_DirectedGraphTracer) {
  _inherits(WeightedDirectedGraphTracer, _DirectedGraphTracer);

  _createClass(WeightedDirectedGraphTracer, null, [{
    key: 'getClassName',
    value: function getClassName() {
      return 'WeightedDirectedGraphTracer';
    }
  }]);

  function WeightedDirectedGraphTracer(name) {
    _classCallCheck(this, WeightedDirectedGraphTracer);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(WeightedDirectedGraphTracer).call(this, name));

    if (_this.isNew) initView(_this);
    return _this;
  }

  _createClass(WeightedDirectedGraphTracer, [{
    key: '_weight',
    value: function _weight(target, weight) {
      this.manager.pushStep(this.capsule, {
        type: 'weight',
        target: target,
        weight: weight
      });
      return this;
    }
  }, {
    key: '_visit',
    value: function _visit(target, source, weight) {
      this.manager.pushStep(this.capsule, {
        type: 'visit',
        target: target,
        source: source,
        weight: weight
      });
      return this;
    }
  }, {
    key: '_leave',
    value: function _leave(target, source, weight) {
      this.manager.pushStep(this.capsule, {
        type: 'leave',
        target: target,
        source: source,
        weight: weight
      });
      return this;
    }
  }, {
    key: 'processStep',
    value: function processStep(step, options) {
      switch (step.type) {
        case 'weight':
          var targetNode = this.graph.nodes(this.n(step.target));
          if (step.weight !== undefined) targetNode.weight = refineByType(step.weight);
          break;
        case 'visit':
        case 'leave':
          var visit = step.type == 'visit';
          var targetNode = this.graph.nodes(this.n(step.target));
          var color = visit ? this.color.visited : this.color.left;
          targetNode.color = color;
          if (step.weight !== undefined) targetNode.weight = refineByType(step.weight);
          if (step.source !== undefined) {
            var edgeId = this.e(step.source, step.target);
            var edge = this.graph.edges(edgeId);
            edge.color = color;
            this.graph.dropEdge(edgeId).addEdge(edge);
          }
          if (this.logTracer) {
            var source = step.source;
            if (source === undefined) source = '';
            this.logTracer.print(visit ? source + ' -> ' + step.target : source + ' <- ' + step.target);
          }
          break;
        default:
          _get(Object.getPrototypeOf(WeightedDirectedGraphTracer.prototype), 'processStep', this).call(this, step, options);
      }
    }
  }, {
    key: 'clear',
    value: function clear() {
      _get(Object.getPrototypeOf(WeightedDirectedGraphTracer.prototype), 'clear', this).call(this);

      this.clearWeights();
    }
  }, {
    key: 'clearWeights',
    value: function clearWeights() {
      this.graph.nodes().forEach(function (node) {
        node.weight = 0;
      });
    }
  }, {
    key: 'drawEdgeWeight',
    value: function drawEdgeWeight(edge, source, target, color, context, settings) {
      if (source == target) return;

      var prefix = settings('prefix') || '',
          size = edge[prefix + 'size'] || 1;

      if (size < settings('edgeLabelThreshold')) return;

      if (0 === settings('edgeLabelSizePowRatio')) throw '"edgeLabelSizePowRatio" must not be 0.';

      var fontSize,
          x = (source[prefix + 'x'] + target[prefix + 'x']) / 2,
          y = (source[prefix + 'y'] + target[prefix + 'y']) / 2,
          dX = target[prefix + 'x'] - source[prefix + 'x'],
          dY = target[prefix + 'y'] - source[prefix + 'y'],
          angle = Math.atan2(dY, dX);

      fontSize = settings('edgeLabelSize') === 'fixed' ? settings('defaultEdgeLabelSize') : settings('defaultEdgeLabelSize') * size * Math.pow(size, -1 / settings('edgeLabelSizePowRatio'));

      context.save();

      if (edge.active) {
        context.font = [settings('activeFontStyle'), fontSize + 'px', settings('activeFont') || settings('font')].join(' ');

        context.fillStyle = color;
      } else {
        context.font = [settings('fontStyle'), fontSize + 'px', settings('font')].join(' ');

        context.fillStyle = color;
      }

      context.textAlign = 'center';
      context.textBaseline = 'alphabetic';

      context.translate(x, y);
      context.rotate(angle);
      context.fillText(edge.weight, 0, -size / 2 - 3);

      context.restore();
    }
  }, {
    key: 'drawNodeWeight',
    value: function drawNodeWeight(node, context, settings) {
      var fontSize,
          prefix = settings('prefix') || '',
          size = node[prefix + 'size'];

      if (size < settings('labelThreshold')) return;

      fontSize = settings('labelSize') === 'fixed' ? settings('defaultLabelSize') : settings('labelSizeRatio') * size;

      context.font = (settings('fontStyle') ? settings('fontStyle') + ' ' : '') + fontSize + 'px ' + settings('font');
      context.fillStyle = settings('labelColor') === 'node' ? node.color || settings('defaultNodeColor') : settings('defaultLabelColor');

      context.textAlign = 'left';
      context.fillText(node.weight, Math.round(node[prefix + 'x'] + size * 1.5), Math.round(node[prefix + 'y'] + fontSize / 3));
    }
  }]);

  return WeightedDirectedGraphTracer;
}(DirectedGraphTracer);

var initView = function initView(tracer) {
  tracer.s.settings({
    edgeLabelSize: 'proportional',
    defaultEdgeLabelSize: 20,
    edgeLabelSizePowRatio: 0.8,
    funcLabelsDef: function funcLabelsDef(node, context, settings) {
      tracer.drawNodeWeight(node, context, settings);
      tracer.drawLabel(node, context, settings);
    },
    funcHoversDef: function funcHoversDef(node, context, settings) {
      tracer.drawOnHover(node, context, settings, tracer.drawEdgeWeight);
    },
    funcEdgesArrow: function funcEdgesArrow(edge, source, target, context, settings) {
      var color = tracer.getColor(edge, source, target, settings);
      tracer.drawArrow(edge, source, target, color, context, settings);
      tracer.drawEdgeWeight(edge, source, target, color, context, settings);
    }
  });
};

module.exports = WeightedDirectedGraphTracer;

},{"../../tracer_manager/util/index":62,"./directed_graph":41}],47:[function(require,module,exports){
'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var WeightedDirectedGraphTracer = require('./weighted_directed_graph');
var UndirectedGraphTracer = require('./undirected_graph');

var WeightedUndirectedGraphTracer = function (_WeightedDirectedGrap) {
  _inherits(WeightedUndirectedGraphTracer, _WeightedDirectedGrap);

  _createClass(WeightedUndirectedGraphTracer, null, [{
    key: 'getClassName',
    value: function getClassName() {
      return 'WeightedUndirectedGraphTracer';
    }
  }]);

  function WeightedUndirectedGraphTracer(name) {
    _classCallCheck(this, WeightedUndirectedGraphTracer);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(WeightedUndirectedGraphTracer).call(this, name));

    _this.e = UndirectedGraphTracer.prototype.e;
    _this.drawOnHover = UndirectedGraphTracer.prototype.drawOnHover;
    _this.drawEdge = UndirectedGraphTracer.prototype.drawEdge;

    if (_this.isNew) initView(_this);
    return _this;
  }

  _createClass(WeightedUndirectedGraphTracer, [{
    key: 'setData',
    value: function setData(G) {
      return _get(Object.getPrototypeOf(WeightedUndirectedGraphTracer.prototype), 'setData', this).call(this, G, true);
    }
  }, {
    key: 'drawEdgeWeight',
    value: function drawEdgeWeight(edge, source, target, color, context, settings) {
      var prefix = settings('prefix') || '';
      if (source[prefix + 'x'] > target[prefix + 'x']) {
        var temp = source;
        source = target;
        target = temp;
      }
      WeightedDirectedGraphTracer.prototype.drawEdgeWeight.call(this, edge, source, target, color, context, settings);
    }
  }]);

  return WeightedUndirectedGraphTracer;
}(WeightedDirectedGraphTracer);

var initView = function initView(tracer) {
  tracer.s.settings({
    defaultEdgeType: 'def',
    funcEdgesDef: function funcEdgesDef(edge, source, target, context, settings) {
      var color = tracer.getColor(edge, source, target, settings);
      tracer.drawEdge(edge, source, target, color, context, settings);
      tracer.drawEdgeWeight(edge, source, target, color, context, settings);
    }
  });
};

module.exports = WeightedUndirectedGraphTracer;

},{"./undirected_graph":45,"./weighted_directed_graph":46}],48:[function(require,module,exports){
'use strict';

var request = require('./request');

module.exports = function (url) {

  return request(url, {
    type: 'GET'
  });
};

},{"./request":51}],49:[function(require,module,exports){
'use strict';

var request = require('./request');

module.exports = function (url) {
  return request(url, {
    dataType: 'json',
    type: 'GET'
  });
};

},{"./request":51}],50:[function(require,module,exports){
'use strict';

var request = require('./request');

module.exports = function (url, data) {
  return request(url, {
    dataType: 'json',
    type: 'POST',
    data: JSON.stringify(data)
  });
};

},{"./request":51}],51:[function(require,module,exports){
'use strict';

var RSVP = require('rsvp');
var app = require('../../app');

var _$ = $;
var ajax = _$.ajax;
var extend = _$.extend;


var defaults = {};

module.exports = function (url) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  app.setIsLoading(true);

  return new RSVP.Promise(function (resolve, reject) {
    var callbacks = {
      success: function success(response) {
        app.setIsLoading(false);
        resolve(response);
      },
      error: function error(reason) {
        app.setIsLoading(false);
        reject(reason);
      }
    };

    var opts = extend({}, defaults, options, callbacks, {
      url: url
    });

    ajax(opts);
  });
};

},{"../../app":3,"rsvp":67}],52:[function(require,module,exports){
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var app = require('../app');
var Toast = require('../dom/toast');

var checkLoading = function checkLoading() {
  if (app.getIsLoading()) {
    Toast.showErrorToast('Wait until it completes loading of previous file.');
    return true;
  }
  return false;
};

var getParameterByName = function getParameterByName(name) {
  var url = window.location.href;
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');

  var results = regex.exec(url);

  if (!results || results.length !== 3) {
    return null;
  }

  var _results = _slicedToArray(results, 3);

  var id = _results[2];


  return id;
};

var getHashValue = function getHashValue(key) {
  if (!key) return null;
  var hash = window.location.hash.substr(1);
  var params = hash ? hash.split('&') : [];
  for (var i = 0; i < params.length; i++) {
    var pair = params[i].split('=');
    if (pair[0] === key) {
      return pair[1];
    }
  }
  return null;
};

var setHashValue = function setHashValue(key, value) {
  if (!key || !value) return;
  var hash = window.location.hash.substr(1);
  var params = hash ? hash.split('&') : [];

  var found = false;
  for (var i = 0; i < params.length && !found; i++) {
    var pair = params[i].split('=');
    if (pair[0] === key) {
      pair[1] = value;
      params[i] = pair.join('=');
      found = true;
    }
  }
  if (!found) {
    params.push([key, value].join('='));
  }

  var newHash = params.join('&');
  window.location.hash = '#' + newHash;
};

var removeHashValue = function removeHashValue(key) {
  if (!key) return;
  var hash = window.location.hash.substr(1);
  var params = hash ? hash.split('&') : [];

  for (var i = 0; i < params.length; i++) {
    var pair = params[i].split('=');
    if (pair[0] === key) {
      params.splice(i, 1);
      break;
    }
  }

  var newHash = params.join('&');
  window.location.hash = '#' + newHash;
};

var setPath = function setPath(category, algorithm, file) {
  var path = category ? category + (algorithm ? '/' + algorithm + (file ? '/' + file : '') : '') : '';
  setHashValue('path', path);
};

var getPath = function getPath() {
  var hash = getHashValue('path');
  if (hash) {
    var _hash$split = hash.split('/');

    var _hash$split2 = _slicedToArray(_hash$split, 3);

    var category = _hash$split2[0];
    var algorithm = _hash$split2[1];
    var file = _hash$split2[2];

    return { category: category, algorithm: algorithm, file: file };
  } else {
    return false;
  }
};

module.exports = {
  checkLoading: checkLoading,
  getParameterByName: getParameterByName,
  getHashValue: getHashValue,
  setHashValue: setHashValue,
  removeHashValue: removeHashValue,
  setPath: setPath,
  getPath: getPath
};

},{"../app":3,"../dom/toast":23}],53:[function(require,module,exports){
'use strict';

var loadAlgorithm = require('./load_algorithm');
var loadCategories = require('./load_categories');
var loadFile = require('./load_file');
var loadScratchPaper = require('./load_scratch_paper');
var shareScratchPaper = require('./share_scratch_paper');

module.exports = {
  loadAlgorithm: loadAlgorithm,
  loadCategories: loadCategories,
  loadFile: loadFile,
  loadScratchPaper: loadScratchPaper,
  shareScratchPaper: shareScratchPaper
};

},{"./load_algorithm":54,"./load_categories":55,"./load_file":56,"./load_scratch_paper":57,"./share_scratch_paper":58}],54:[function(require,module,exports){
'use strict';

var getJSON = require('./ajax/get_json');

var _require = require('../utils');

var getAlgorithmDir = _require.getAlgorithmDir;


module.exports = function (category, algorithm) {
  var dir = getAlgorithmDir(category, algorithm);
  return getJSON(dir + 'desc.json');
};

},{"../utils":65,"./ajax/get_json":49}],55:[function(require,module,exports){
'use strict';

var getJSON = require('./ajax/get_json');

module.exports = function () {
  return getJSON('./algorithm/category.json');
};

},{"./ajax/get_json":49}],56:[function(require,module,exports){
'use strict';

var RSVP = require('rsvp');

var app = require('../app');

var _require = require('../utils');

var getFileDir = _require.getFileDir;
var isScratchPaper = _require.isScratchPaper;

var _require2 = require('./helpers');

var checkLoading = _require2.checkLoading;
var setPath = _require2.setPath;


var get = require('./ajax/get');

var loadDataAndCode = function loadDataAndCode(dir) {
  return RSVP.hash({
    data: get(dir + 'data.js'),
    code: get(dir + 'code.js')
  });
};

var loadFileAndUpdateContent = function loadFileAndUpdateContent(dir) {
  app.getEditor().clearContent();

  return loadDataAndCode(dir).then(function (content) {
    app.updateCachedFile(dir, content);
    app.getEditor().setContent(content);
  });
};

var cachedContentExists = function cachedContentExists(cachedFile) {
  return cachedFile && cachedFile.data !== undefined && cachedFile.code !== undefined;
};

module.exports = function (category, algorithm, file, explanation) {
  return new RSVP.Promise(function (resolve, reject) {
    if (checkLoading()) {
      reject();
    } else {
      if (isScratchPaper(category)) {
        setPath(category, app.getLoadedScratch());
      } else {
        setPath(category, algorithm, file);
      }
      $('#explanation').html(explanation);

      var dir = getFileDir(category, algorithm, file);
      app.setLastFileUsed(dir);
      var cachedFile = app.getCachedFile(dir);

      if (cachedContentExists(cachedFile)) {
        app.getEditor().setContent(cachedFile);
        resolve();
      } else {
        loadFileAndUpdateContent(dir).then(resolve, reject);
      }
    }
  });
};

},{"../app":3,"../utils":65,"./ajax/get":48,"./helpers":52,"rsvp":67}],57:[function(require,module,exports){
'use strict';

var RSVP = require('rsvp');
var app = require('../app');

var _require = require('../utils');

var getFileDir = _require.getFileDir;


var getJSON = require('./ajax/get_json');
var loadAlgorithm = require('./load_algorithm');

var extractGistCode = function extractGistCode(files, name) {
  return files[name + '.js'].content;
};

module.exports = function (gistID) {
  return new RSVP.Promise(function (resolve, reject) {
    app.setLoadedScratch(gistID);

    getJSON('https://api.github.com/gists/' + gistID).then(function (_ref) {
      var files = _ref.files;


      var category = 'scratch';
      var algorithm = gistID;

      loadAlgorithm(category, algorithm).then(function (data) {

        var algoData = extractGistCode(files, 'data');
        var algoCode = extractGistCode(files, 'code');

        // update scratch paper algo code with the loaded gist code
        var dir = getFileDir(category, algorithm, 'scratch_paper');
        app.updateCachedFile(dir, {
          data: algoData,
          code: algoCode,
          'CREDIT.md': 'Shared by an anonymous user from http://parkjs814.github.io/AlgorithmVisualizer'
        });

        resolve({
          category: category,
          algorithm: algorithm,
          data: data
        });
      });
    });
  });
};

},{"../app":3,"../utils":65,"./ajax/get_json":49,"./load_algorithm":54,"rsvp":67}],58:[function(require,module,exports){
'use strict';

var RSVP = require('rsvp');
var app = require('../app');

var postJSON = require('./ajax/post_json');

var _require = require('./helpers');

var setPath = _require.setPath;


module.exports = function () {
  return new RSVP.Promise(function (resolve, reject) {
    var _app$getEditor = app.getEditor();

    var dataEditor = _app$getEditor.dataEditor;
    var codeEditor = _app$getEditor.codeEditor;


    var gist = {
      'description': 'temp',
      'public': true,
      'files': {
        'data.js': {
          'content': dataEditor.getValue()
        },
        'code.js': {
          'content': codeEditor.getValue()
        }
      }
    };

    postJSON('https://api.github.com/gists', gist).then(function (_ref) {
      var id = _ref.id;

      app.setLoadedScratch(id);
      setPath('scratch', id);
      var _location = location;
      var href = _location.href;

      $('#algorithm').html('Shared');
      resolve(href);
    });
  });
};

},{"../app":3,"./ajax/post_json":50,"./helpers":52,"rsvp":67}],59:[function(require,module,exports){
'use strict';

var TracerManager = require('./manager');
var Tracer = require('../module/tracer/tracer');

module.exports = {
  init: function init() {
    var tm = new TracerManager();
    Tracer.prototype.manager = tm;
    return tm;
  }
};

},{"../module/tracer/tracer":44,"./manager":60}],60:[function(require,module,exports){
'use strict';

var stepLimit = 1e6;

var TracerManager = function TracerManager() {
  this.timer = null;
  this.pause = false;
  this.capsules = [];
  this.interval = 500;
};

TracerManager.prototype = {
  add: function add(tracer) {

    var $container = $('<section class="module_wrapper">');
    $('.module_container').append($container);

    var capsule = {
      module: tracer.module,
      tracer: tracer,
      allocated: true,
      defaultName: null,
      $container: $container,
      isNew: true
    };

    this.capsules.push(capsule);
    return capsule;
  },
  allocate: function allocate(newTracer) {
    var selectedCapsule = null;
    var count = 0;

    $.each(this.capsules, function (i, capsule) {
      if (capsule.module === newTracer.module) {
        count++;
        if (!capsule.allocated) {
          capsule.tracer = newTracer;
          capsule.allocated = true;
          capsule.isNew = false;
          selectedCapsule = capsule;
          return false;
        }
      }
    });

    if (selectedCapsule === null) {
      count++;
      selectedCapsule = this.add(newTracer);
    }

    var className = newTracer.module.getClassName();
    selectedCapsule.defaultName = className + ' ' + count;
    selectedCapsule.order = this.order++;
    return selectedCapsule;
  },
  deallocateAll: function deallocateAll() {
    this.order = 0;
    this.reset();
    $.each(this.capsules, function (i, capsule) {
      capsule.allocated = false;
    });
  },
  removeUnallocated: function removeUnallocated() {
    var changed = false;

    this.capsules = $.grep(this.capsules, function (capsule) {
      var removed = !capsule.allocated;

      if (capsule.isNew || removed) {
        changed = true;
      }
      if (removed) {
        capsule.$container.remove();
      }

      return !removed;
    });

    if (changed) {
      this.place();
    }
  },
  place: function place() {
    var capsules = this.capsules;


    $.each(capsules, function (i, capsule) {
      var width = 100;
      var height = 100 / capsules.length;
      var top = height * capsule.order;

      capsule.$container.css({
        top: top + '%',
        width: width + '%',
        height: height + '%'
      });

      capsule.tracer.resize();
    });
  },
  resize: function resize() {
    this.command('resize');
  },
  isPause: function isPause() {
    return this.pause;
  },
  setInterval: function setInterval(interval) {
    $('#interval').val(interval);
  },
  reset: function reset() {
    this.traces = [];
    this.traceIndex = -1;
    this.stepCnt = 0;
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.command('clear');
  },
  pushStep: function pushStep(capsule, step) {
    if (this.stepCnt++ > stepLimit) throw "Tracer's stack overflow";
    var len = this.traces.length;
    var last = [];
    if (len === 0) {
      this.traces.push(last);
    } else {
      last = this.traces[len - 1];
    }
    last.push($.extend(step, {
      capsule: capsule
    }));
  },
  newStep: function newStep() {
    this.traces.push([]);
  },
  pauseStep: function pauseStep() {
    if (this.traceIndex < 0) return;
    this.pause = true;
    if (this.timer) {
      clearTimeout(this.timer);
    }
    $('#btn_pause').addClass('active');
  },
  resumeStep: function resumeStep() {
    this.pause = false;
    this.step(this.traceIndex + 1);
    $('#btn_pause').removeClass('active');
  },
  step: function step(i) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var tracer = this;

    if (isNaN(i) || i >= this.traces.length || i < 0) return;

    this.traceIndex = i;
    var trace = this.traces[i];
    trace.forEach(function (step) {
      step.capsule.tracer.processStep(step, options);
    });

    if (!options.virtual) {
      this.command('refresh');
    }

    if (this.pause) return;

    this.timer = setTimeout(function () {
      tracer.step(i + 1, options);
    }, this.interval);
  },
  prevStep: function prevStep() {
    this.command('clear');

    var finalIndex = this.traceIndex - 1;
    if (finalIndex < 0) {
      this.traceIndex = -1;
      this.command('refresh');
      return;
    }

    for (var i = 0; i < finalIndex; i++) {
      this.step(i, {
        virtual: true
      });
    }

    this.step(finalIndex);
  },
  nextStep: function nextStep() {
    this.step(this.traceIndex + 1);
  },
  visualize: function visualize() {
    this.traceIndex = -1;
    this.resumeStep();
  },
  command: function command() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var functionName = args.shift();
    $.each(this.capsules, function (i, capsule) {
      if (capsule.allocated) {
        capsule.tracer.module.prototype[functionName].apply(capsule.tracer, args);
      }
    });
  },
  findOwner: function findOwner(container) {
    var selectedCapsule = null;
    $.each(this.capsules, function (i, capsule) {
      if (capsule.$container[0] === container) {
        selectedCapsule = capsule;
        return false;
      }
    });
    return selectedCapsule.tracer;
  }
};

module.exports = TracerManager;

},{}],61:[function(require,module,exports){
'use strict';

var parse = JSON.parse;


var fromJSON = function fromJSON(obj) {
  return parse(obj, function (key, value) {
    return value === 'Infinity' ? Infinity : value;
  });
};

module.exports = fromJSON;

},{}],62:[function(require,module,exports){
'use strict';

var toJSON = require('./to_json');
var fromJSON = require('./from_json');
var refineByType = require('./refine_by_type');

module.exports = {
  toJSON: toJSON,
  fromJSON: fromJSON,
  refineByType: refineByType
};

},{"./from_json":61,"./refine_by_type":63,"./to_json":64}],63:[function(require,module,exports){
'use strict';

var refineByType = function refineByType(item) {
  return typeof item === 'number' ? refineNumber(item) : refineString(item);
};

var refineString = function refineString(str) {
  return str === '' ? ' ' : str;
};

var refineNumber = function refineNumber(num) {
  return num === Infinity ? '∞' : num;
};

module.exports = refineByType;

},{}],64:[function(require,module,exports){
'use strict';

var stringify = JSON.stringify;


var toJSON = function toJSON(obj) {
  return stringify(obj, function (key, value) {
    return value === Infinity ? 'Infinity' : value;
  });
};

module.exports = toJSON;

},{}],65:[function(require,module,exports){
'use strict';

var isScratchPaper = function isScratchPaper(category, algorithm) {
  return category == 'scratch';
};

var getAlgorithmDir = function getAlgorithmDir(category, algorithm) {
  if (isScratchPaper(category)) return './algorithm/scratch_paper/';
  return './algorithm/' + category + '/' + algorithm + '/';
};

var getFileDir = function getFileDir(category, algorithm, file) {
  if (isScratchPaper(category)) return './algorithm/scratch_paper/';
  return './algorithm/' + category + '/' + algorithm + '/' + file + '/';
};

module.exports = {
  isScratchPaper: isScratchPaper,
  getAlgorithmDir: getAlgorithmDir,
  getFileDir: getFileDir
};

},{}],66:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],67:[function(require,module,exports){
(function (process,global){
/*!
 * @overview RSVP - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/tildeio/rsvp.js/master/LICENSE
 * @version   3.2.1
 */

(function() {
    "use strict";
    function lib$rsvp$utils$$objectOrFunction(x) {
      return typeof x === 'function' || (typeof x === 'object' && x !== null);
    }

    function lib$rsvp$utils$$isFunction(x) {
      return typeof x === 'function';
    }

    function lib$rsvp$utils$$isMaybeThenable(x) {
      return typeof x === 'object' && x !== null;
    }

    var lib$rsvp$utils$$_isArray;
    if (!Array.isArray) {
      lib$rsvp$utils$$_isArray = function (x) {
        return Object.prototype.toString.call(x) === '[object Array]';
      };
    } else {
      lib$rsvp$utils$$_isArray = Array.isArray;
    }

    var lib$rsvp$utils$$isArray = lib$rsvp$utils$$_isArray;

    var lib$rsvp$utils$$now = Date.now || function() { return new Date().getTime(); };

    function lib$rsvp$utils$$F() { }

    var lib$rsvp$utils$$o_create = (Object.create || function (o) {
      if (arguments.length > 1) {
        throw new Error('Second argument not supported');
      }
      if (typeof o !== 'object') {
        throw new TypeError('Argument must be an object');
      }
      lib$rsvp$utils$$F.prototype = o;
      return new lib$rsvp$utils$$F();
    });
    function lib$rsvp$events$$indexOf(callbacks, callback) {
      for (var i=0, l=callbacks.length; i<l; i++) {
        if (callbacks[i] === callback) { return i; }
      }

      return -1;
    }

    function lib$rsvp$events$$callbacksFor(object) {
      var callbacks = object._promiseCallbacks;

      if (!callbacks) {
        callbacks = object._promiseCallbacks = {};
      }

      return callbacks;
    }

    var lib$rsvp$events$$default = {

      /**
        `RSVP.EventTarget.mixin` extends an object with EventTarget methods. For
        Example:

        ```javascript
        var object = {};

        RSVP.EventTarget.mixin(object);

        object.on('finished', function(event) {
          // handle event
        });

        object.trigger('finished', { detail: value });
        ```

        `EventTarget.mixin` also works with prototypes:

        ```javascript
        var Person = function() {};
        RSVP.EventTarget.mixin(Person.prototype);

        var yehuda = new Person();
        var tom = new Person();

        yehuda.on('poke', function(event) {
          console.log('Yehuda says OW');
        });

        tom.on('poke', function(event) {
          console.log('Tom says OW');
        });

        yehuda.trigger('poke');
        tom.trigger('poke');
        ```

        @method mixin
        @for RSVP.EventTarget
        @private
        @param {Object} object object to extend with EventTarget methods
      */
      'mixin': function(object) {
        object['on']      = this['on'];
        object['off']     = this['off'];
        object['trigger'] = this['trigger'];
        object._promiseCallbacks = undefined;
        return object;
      },

      /**
        Registers a callback to be executed when `eventName` is triggered

        ```javascript
        object.on('event', function(eventInfo){
          // handle the event
        });

        object.trigger('event');
        ```

        @method on
        @for RSVP.EventTarget
        @private
        @param {String} eventName name of the event to listen for
        @param {Function} callback function to be called when the event is triggered.
      */
      'on': function(eventName, callback) {
        if (typeof callback !== 'function') {
          throw new TypeError('Callback must be a function');
        }

        var allCallbacks = lib$rsvp$events$$callbacksFor(this), callbacks;

        callbacks = allCallbacks[eventName];

        if (!callbacks) {
          callbacks = allCallbacks[eventName] = [];
        }

        if (lib$rsvp$events$$indexOf(callbacks, callback) === -1) {
          callbacks.push(callback);
        }
      },

      /**
        You can use `off` to stop firing a particular callback for an event:

        ```javascript
        function doStuff() { // do stuff! }
        object.on('stuff', doStuff);

        object.trigger('stuff'); // doStuff will be called

        // Unregister ONLY the doStuff callback
        object.off('stuff', doStuff);
        object.trigger('stuff'); // doStuff will NOT be called
        ```

        If you don't pass a `callback` argument to `off`, ALL callbacks for the
        event will not be executed when the event fires. For example:

        ```javascript
        var callback1 = function(){};
        var callback2 = function(){};

        object.on('stuff', callback1);
        object.on('stuff', callback2);

        object.trigger('stuff'); // callback1 and callback2 will be executed.

        object.off('stuff');
        object.trigger('stuff'); // callback1 and callback2 will not be executed!
        ```

        @method off
        @for RSVP.EventTarget
        @private
        @param {String} eventName event to stop listening to
        @param {Function} callback optional argument. If given, only the function
        given will be removed from the event's callback queue. If no `callback`
        argument is given, all callbacks will be removed from the event's callback
        queue.
      */
      'off': function(eventName, callback) {
        var allCallbacks = lib$rsvp$events$$callbacksFor(this), callbacks, index;

        if (!callback) {
          allCallbacks[eventName] = [];
          return;
        }

        callbacks = allCallbacks[eventName];

        index = lib$rsvp$events$$indexOf(callbacks, callback);

        if (index !== -1) { callbacks.splice(index, 1); }
      },

      /**
        Use `trigger` to fire custom events. For example:

        ```javascript
        object.on('foo', function(){
          console.log('foo event happened!');
        });
        object.trigger('foo');
        // 'foo event happened!' logged to the console
        ```

        You can also pass a value as a second argument to `trigger` that will be
        passed as an argument to all event listeners for the event:

        ```javascript
        object.on('foo', function(value){
          console.log(value.name);
        });

        object.trigger('foo', { name: 'bar' });
        // 'bar' logged to the console
        ```

        @method trigger
        @for RSVP.EventTarget
        @private
        @param {String} eventName name of the event to be triggered
        @param {*} options optional value to be passed to any event handlers for
        the given `eventName`
      */
      'trigger': function(eventName, options, label) {
        var allCallbacks = lib$rsvp$events$$callbacksFor(this), callbacks, callback;

        if (callbacks = allCallbacks[eventName]) {
          // Don't cache the callbacks.length since it may grow
          for (var i=0; i<callbacks.length; i++) {
            callback = callbacks[i];

            callback(options, label);
          }
        }
      }
    };

    var lib$rsvp$config$$config = {
      instrument: false
    };

    lib$rsvp$events$$default['mixin'](lib$rsvp$config$$config);

    function lib$rsvp$config$$configure(name, value) {
      if (name === 'onerror') {
        // handle for legacy users that expect the actual
        // error to be passed to their function added via
        // `RSVP.configure('onerror', someFunctionHere);`
        lib$rsvp$config$$config['on']('error', value);
        return;
      }

      if (arguments.length === 2) {
        lib$rsvp$config$$config[name] = value;
      } else {
        return lib$rsvp$config$$config[name];
      }
    }

    var lib$rsvp$instrument$$queue = [];

    function lib$rsvp$instrument$$scheduleFlush() {
      setTimeout(function() {
        var entry;
        for (var i = 0; i < lib$rsvp$instrument$$queue.length; i++) {
          entry = lib$rsvp$instrument$$queue[i];

          var payload = entry.payload;

          payload.guid = payload.key + payload.id;
          payload.childGuid = payload.key + payload.childId;
          if (payload.error) {
            payload.stack = payload.error.stack;
          }

          lib$rsvp$config$$config['trigger'](entry.name, entry.payload);
        }
        lib$rsvp$instrument$$queue.length = 0;
      }, 50);
    }

    function lib$rsvp$instrument$$instrument(eventName, promise, child) {
      if (1 === lib$rsvp$instrument$$queue.push({
        name: eventName,
        payload: {
          key: promise._guidKey,
          id:  promise._id,
          eventName: eventName,
          detail: promise._result,
          childId: child && child._id,
          label: promise._label,
          timeStamp: lib$rsvp$utils$$now(),
          error: lib$rsvp$config$$config["instrument-with-stack"] ? new Error(promise._label) : null
        }})) {
          lib$rsvp$instrument$$scheduleFlush();
        }
      }
    var lib$rsvp$instrument$$default = lib$rsvp$instrument$$instrument;
    function lib$rsvp$then$$then(onFulfillment, onRejection, label) {
      var parent = this;
      var state = parent._state;

      if (state === lib$rsvp$$internal$$FULFILLED && !onFulfillment || state === lib$rsvp$$internal$$REJECTED && !onRejection) {
        lib$rsvp$config$$config.instrument && lib$rsvp$instrument$$default('chained', parent, parent);
        return parent;
      }

      parent._onError = null;

      var child = new parent.constructor(lib$rsvp$$internal$$noop, label);
      var result = parent._result;

      lib$rsvp$config$$config.instrument && lib$rsvp$instrument$$default('chained', parent, child);

      if (state) {
        var callback = arguments[state - 1];
        lib$rsvp$config$$config.async(function(){
          lib$rsvp$$internal$$invokeCallback(state, child, callback, result);
        });
      } else {
        lib$rsvp$$internal$$subscribe(parent, child, onFulfillment, onRejection);
      }

      return child;
    }
    var lib$rsvp$then$$default = lib$rsvp$then$$then;
    function lib$rsvp$promise$resolve$$resolve(object, label) {
      /*jshint validthis:true */
      var Constructor = this;

      if (object && typeof object === 'object' && object.constructor === Constructor) {
        return object;
      }

      var promise = new Constructor(lib$rsvp$$internal$$noop, label);
      lib$rsvp$$internal$$resolve(promise, object);
      return promise;
    }
    var lib$rsvp$promise$resolve$$default = lib$rsvp$promise$resolve$$resolve;
    function lib$rsvp$enumerator$$makeSettledResult(state, position, value) {
      if (state === lib$rsvp$$internal$$FULFILLED) {
        return {
          state: 'fulfilled',
          value: value
        };
      } else {
         return {
          state: 'rejected',
          reason: value
        };
      }
    }

    function lib$rsvp$enumerator$$Enumerator(Constructor, input, abortOnReject, label) {
      this._instanceConstructor = Constructor;
      this.promise = new Constructor(lib$rsvp$$internal$$noop, label);
      this._abortOnReject = abortOnReject;

      if (this._validateInput(input)) {
        this._input     = input;
        this.length     = input.length;
        this._remaining = input.length;

        this._init();

        if (this.length === 0) {
          lib$rsvp$$internal$$fulfill(this.promise, this._result);
        } else {
          this.length = this.length || 0;
          this._enumerate();
          if (this._remaining === 0) {
            lib$rsvp$$internal$$fulfill(this.promise, this._result);
          }
        }
      } else {
        lib$rsvp$$internal$$reject(this.promise, this._validationError());
      }
    }

    var lib$rsvp$enumerator$$default = lib$rsvp$enumerator$$Enumerator;

    lib$rsvp$enumerator$$Enumerator.prototype._validateInput = function(input) {
      return lib$rsvp$utils$$isArray(input);
    };

    lib$rsvp$enumerator$$Enumerator.prototype._validationError = function() {
      return new Error('Array Methods must be provided an Array');
    };

    lib$rsvp$enumerator$$Enumerator.prototype._init = function() {
      this._result = new Array(this.length);
    };

    lib$rsvp$enumerator$$Enumerator.prototype._enumerate = function() {
      var length     = this.length;
      var promise    = this.promise;
      var input      = this._input;

      for (var i = 0; promise._state === lib$rsvp$$internal$$PENDING && i < length; i++) {
        this._eachEntry(input[i], i);
      }
    };

    lib$rsvp$enumerator$$Enumerator.prototype._settleMaybeThenable = function(entry, i) {
      var c = this._instanceConstructor;
      var resolve = c.resolve;

      if (resolve === lib$rsvp$promise$resolve$$default) {
        var then = lib$rsvp$$internal$$getThen(entry);

        if (then === lib$rsvp$then$$default &&
            entry._state !== lib$rsvp$$internal$$PENDING) {
          entry._onError = null;
          this._settledAt(entry._state, i, entry._result);
        } else if (typeof then !== 'function') {
          this._remaining--;
          this._result[i] = this._makeResult(lib$rsvp$$internal$$FULFILLED, i, entry);
        } else if (c === lib$rsvp$promise$$default) {
          var promise = new c(lib$rsvp$$internal$$noop);
          lib$rsvp$$internal$$handleMaybeThenable(promise, entry, then);
          this._willSettleAt(promise, i);
        } else {
          this._willSettleAt(new c(function(resolve) { resolve(entry); }), i);
        }
      } else {
        this._willSettleAt(resolve(entry), i);
      }
    };

    lib$rsvp$enumerator$$Enumerator.prototype._eachEntry = function(entry, i) {
      if (lib$rsvp$utils$$isMaybeThenable(entry)) {
        this._settleMaybeThenable(entry, i);
      } else {
        this._remaining--;
        this._result[i] = this._makeResult(lib$rsvp$$internal$$FULFILLED, i, entry);
      }
    };

    lib$rsvp$enumerator$$Enumerator.prototype._settledAt = function(state, i, value) {
      var promise = this.promise;

      if (promise._state === lib$rsvp$$internal$$PENDING) {
        this._remaining--;

        if (this._abortOnReject && state === lib$rsvp$$internal$$REJECTED) {
          lib$rsvp$$internal$$reject(promise, value);
        } else {
          this._result[i] = this._makeResult(state, i, value);
        }
      }

      if (this._remaining === 0) {
        lib$rsvp$$internal$$fulfill(promise, this._result);
      }
    };

    lib$rsvp$enumerator$$Enumerator.prototype._makeResult = function(state, i, value) {
      return value;
    };

    lib$rsvp$enumerator$$Enumerator.prototype._willSettleAt = function(promise, i) {
      var enumerator = this;

      lib$rsvp$$internal$$subscribe(promise, undefined, function(value) {
        enumerator._settledAt(lib$rsvp$$internal$$FULFILLED, i, value);
      }, function(reason) {
        enumerator._settledAt(lib$rsvp$$internal$$REJECTED, i, reason);
      });
    };
    function lib$rsvp$promise$all$$all(entries, label) {
      return new lib$rsvp$enumerator$$default(this, entries, true /* abort on reject */, label).promise;
    }
    var lib$rsvp$promise$all$$default = lib$rsvp$promise$all$$all;
    function lib$rsvp$promise$race$$race(entries, label) {
      /*jshint validthis:true */
      var Constructor = this;

      var promise = new Constructor(lib$rsvp$$internal$$noop, label);

      if (!lib$rsvp$utils$$isArray(entries)) {
        lib$rsvp$$internal$$reject(promise, new TypeError('You must pass an array to race.'));
        return promise;
      }

      var length = entries.length;

      function onFulfillment(value) {
        lib$rsvp$$internal$$resolve(promise, value);
      }

      function onRejection(reason) {
        lib$rsvp$$internal$$reject(promise, reason);
      }

      for (var i = 0; promise._state === lib$rsvp$$internal$$PENDING && i < length; i++) {
        lib$rsvp$$internal$$subscribe(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);
      }

      return promise;
    }
    var lib$rsvp$promise$race$$default = lib$rsvp$promise$race$$race;
    function lib$rsvp$promise$reject$$reject(reason, label) {
      /*jshint validthis:true */
      var Constructor = this;
      var promise = new Constructor(lib$rsvp$$internal$$noop, label);
      lib$rsvp$$internal$$reject(promise, reason);
      return promise;
    }
    var lib$rsvp$promise$reject$$default = lib$rsvp$promise$reject$$reject;

    var lib$rsvp$promise$$guidKey = 'rsvp_' + lib$rsvp$utils$$now() + '-';
    var lib$rsvp$promise$$counter = 0;

    function lib$rsvp$promise$$needsResolver() {
      throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
    }

    function lib$rsvp$promise$$needsNew() {
      throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
    }

    function lib$rsvp$promise$$Promise(resolver, label) {
      this._id = lib$rsvp$promise$$counter++;
      this._label = label;
      this._state = undefined;
      this._result = undefined;
      this._subscribers = [];

      lib$rsvp$config$$config.instrument && lib$rsvp$instrument$$default('created', this);

      if (lib$rsvp$$internal$$noop !== resolver) {
        typeof resolver !== 'function' && lib$rsvp$promise$$needsResolver();
        this instanceof lib$rsvp$promise$$Promise ? lib$rsvp$$internal$$initializePromise(this, resolver) : lib$rsvp$promise$$needsNew();
      }
    }

    var lib$rsvp$promise$$default = lib$rsvp$promise$$Promise;

    // deprecated
    lib$rsvp$promise$$Promise.cast = lib$rsvp$promise$resolve$$default;
    lib$rsvp$promise$$Promise.all = lib$rsvp$promise$all$$default;
    lib$rsvp$promise$$Promise.race = lib$rsvp$promise$race$$default;
    lib$rsvp$promise$$Promise.resolve = lib$rsvp$promise$resolve$$default;
    lib$rsvp$promise$$Promise.reject = lib$rsvp$promise$reject$$default;

    lib$rsvp$promise$$Promise.prototype = {
      constructor: lib$rsvp$promise$$Promise,

      _guidKey: lib$rsvp$promise$$guidKey,

      _onError: function (reason) {
        var promise = this;
        lib$rsvp$config$$config.after(function() {
          if (promise._onError) {
            lib$rsvp$config$$config['trigger']('error', reason, promise._label);
          }
        });
      },

    /**
      The primary way of interacting with a promise is through its `then` method,
      which registers callbacks to receive either a promise's eventual value or the
      reason why the promise cannot be fulfilled.

      ```js
      findUser().then(function(user){
        // user is available
      }, function(reason){
        // user is unavailable, and you are given the reason why
      });
      ```

      Chaining
      --------

      The return value of `then` is itself a promise.  This second, 'downstream'
      promise is resolved with the return value of the first promise's fulfillment
      or rejection handler, or rejected if the handler throws an exception.

      ```js
      findUser().then(function (user) {
        return user.name;
      }, function (reason) {
        return 'default name';
      }).then(function (userName) {
        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
        // will be `'default name'`
      });

      findUser().then(function (user) {
        throw new Error('Found user, but still unhappy');
      }, function (reason) {
        throw new Error('`findUser` rejected and we're unhappy');
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
      });
      ```
      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.

      ```js
      findUser().then(function (user) {
        throw new PedagogicalException('Upstream error');
      }).then(function (value) {
        // never reached
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // The `PedgagocialException` is propagated all the way down to here
      });
      ```

      Assimilation
      ------------

      Sometimes the value you want to propagate to a downstream promise can only be
      retrieved asynchronously. This can be achieved by returning a promise in the
      fulfillment or rejection handler. The downstream promise will then be pending
      until the returned promise is settled. This is called *assimilation*.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // The user's comments are now available
      });
      ```

      If the assimliated promise rejects, then the downstream promise will also reject.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // If `findCommentsByAuthor` fulfills, we'll have the value here
      }, function (reason) {
        // If `findCommentsByAuthor` rejects, we'll have the reason here
      });
      ```

      Simple Example
      --------------

      Synchronous Example

      ```javascript
      var result;

      try {
        result = findResult();
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js
      findResult(function(result, err){
        if (err) {
          // failure
        } else {
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findResult().then(function(result){
        // success
      }, function(reason){
        // failure
      });
      ```

      Advanced Example
      --------------

      Synchronous Example

      ```javascript
      var author, books;

      try {
        author = findAuthor();
        books  = findBooksByAuthor(author);
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js

      function foundBooks(books) {

      }

      function failure(reason) {

      }

      findAuthor(function(author, err){
        if (err) {
          failure(err);
          // failure
        } else {
          try {
            findBoooksByAuthor(author, function(books, err) {
              if (err) {
                failure(err);
              } else {
                try {
                  foundBooks(books);
                } catch(reason) {
                  failure(reason);
                }
              }
            });
          } catch(error) {
            failure(err);
          }
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findAuthor().
        then(findBooksByAuthor).
        then(function(books){
          // found books
      }).catch(function(reason){
        // something went wrong
      });
      ```

      @method then
      @param {Function} onFulfillment
      @param {Function} onRejection
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise}
    */
      then: lib$rsvp$then$$default,

    /**
      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
      as the catch block of a try/catch statement.

      ```js
      function findAuthor(){
        throw new Error('couldn't find that author');
      }

      // synchronous
      try {
        findAuthor();
      } catch(reason) {
        // something went wrong
      }

      // async with promises
      findAuthor().catch(function(reason){
        // something went wrong
      });
      ```

      @method catch
      @param {Function} onRejection
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise}
    */
      'catch': function(onRejection, label) {
        return this.then(undefined, onRejection, label);
      },

    /**
      `finally` will be invoked regardless of the promise's fate just as native
      try/catch/finally behaves

      Synchronous example:

      ```js
      findAuthor() {
        if (Math.random() > 0.5) {
          throw new Error();
        }
        return new Author();
      }

      try {
        return findAuthor(); // succeed or fail
      } catch(error) {
        return findOtherAuther();
      } finally {
        // always runs
        // doesn't affect the return value
      }
      ```

      Asynchronous example:

      ```js
      findAuthor().catch(function(reason){
        return findOtherAuther();
      }).finally(function(){
        // author was either found, or not
      });
      ```

      @method finally
      @param {Function} callback
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise}
    */
      'finally': function(callback, label) {
        var promise = this;
        var constructor = promise.constructor;

        return promise.then(function(value) {
          return constructor.resolve(callback()).then(function() {
            return value;
          });
        }, function(reason) {
          return constructor.resolve(callback()).then(function() {
            return constructor.reject(reason);
          });
        }, label);
      }
    };
    function  lib$rsvp$$internal$$withOwnPromise() {
      return new TypeError('A promises callback cannot return that same promise.');
    }

    function lib$rsvp$$internal$$noop() {}

    var lib$rsvp$$internal$$PENDING   = void 0;
    var lib$rsvp$$internal$$FULFILLED = 1;
    var lib$rsvp$$internal$$REJECTED  = 2;

    var lib$rsvp$$internal$$GET_THEN_ERROR = new lib$rsvp$$internal$$ErrorObject();

    function lib$rsvp$$internal$$getThen(promise) {
      try {
        return promise.then;
      } catch(error) {
        lib$rsvp$$internal$$GET_THEN_ERROR.error = error;
        return lib$rsvp$$internal$$GET_THEN_ERROR;
      }
    }

    function lib$rsvp$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
      try {
        then.call(value, fulfillmentHandler, rejectionHandler);
      } catch(e) {
        return e;
      }
    }

    function lib$rsvp$$internal$$handleForeignThenable(promise, thenable, then) {
      lib$rsvp$config$$config.async(function(promise) {
        var sealed = false;
        var error = lib$rsvp$$internal$$tryThen(then, thenable, function(value) {
          if (sealed) { return; }
          sealed = true;
          if (thenable !== value) {
            lib$rsvp$$internal$$resolve(promise, value, undefined);
          } else {
            lib$rsvp$$internal$$fulfill(promise, value);
          }
        }, function(reason) {
          if (sealed) { return; }
          sealed = true;

          lib$rsvp$$internal$$reject(promise, reason);
        }, 'Settle: ' + (promise._label || ' unknown promise'));

        if (!sealed && error) {
          sealed = true;
          lib$rsvp$$internal$$reject(promise, error);
        }
      }, promise);
    }

    function lib$rsvp$$internal$$handleOwnThenable(promise, thenable) {
      if (thenable._state === lib$rsvp$$internal$$FULFILLED) {
        lib$rsvp$$internal$$fulfill(promise, thenable._result);
      } else if (thenable._state === lib$rsvp$$internal$$REJECTED) {
        thenable._onError = null;
        lib$rsvp$$internal$$reject(promise, thenable._result);
      } else {
        lib$rsvp$$internal$$subscribe(thenable, undefined, function(value) {
          if (thenable !== value) {
            lib$rsvp$$internal$$resolve(promise, value, undefined);
          } else {
            lib$rsvp$$internal$$fulfill(promise, value);
          }
        }, function(reason) {
          lib$rsvp$$internal$$reject(promise, reason);
        });
      }
    }

    function lib$rsvp$$internal$$handleMaybeThenable(promise, maybeThenable, then) {
      if (maybeThenable.constructor === promise.constructor &&
          then === lib$rsvp$then$$default &&
          constructor.resolve === lib$rsvp$promise$resolve$$default) {
        lib$rsvp$$internal$$handleOwnThenable(promise, maybeThenable);
      } else {
        if (then === lib$rsvp$$internal$$GET_THEN_ERROR) {
          lib$rsvp$$internal$$reject(promise, lib$rsvp$$internal$$GET_THEN_ERROR.error);
        } else if (then === undefined) {
          lib$rsvp$$internal$$fulfill(promise, maybeThenable);
        } else if (lib$rsvp$utils$$isFunction(then)) {
          lib$rsvp$$internal$$handleForeignThenable(promise, maybeThenable, then);
        } else {
          lib$rsvp$$internal$$fulfill(promise, maybeThenable);
        }
      }
    }

    function lib$rsvp$$internal$$resolve(promise, value) {
      if (promise === value) {
        lib$rsvp$$internal$$fulfill(promise, value);
      } else if (lib$rsvp$utils$$objectOrFunction(value)) {
        lib$rsvp$$internal$$handleMaybeThenable(promise, value, lib$rsvp$$internal$$getThen(value));
      } else {
        lib$rsvp$$internal$$fulfill(promise, value);
      }
    }

    function lib$rsvp$$internal$$publishRejection(promise) {
      if (promise._onError) {
        promise._onError(promise._result);
      }

      lib$rsvp$$internal$$publish(promise);
    }

    function lib$rsvp$$internal$$fulfill(promise, value) {
      if (promise._state !== lib$rsvp$$internal$$PENDING) { return; }

      promise._result = value;
      promise._state = lib$rsvp$$internal$$FULFILLED;

      if (promise._subscribers.length === 0) {
        if (lib$rsvp$config$$config.instrument) {
          lib$rsvp$instrument$$default('fulfilled', promise);
        }
      } else {
        lib$rsvp$config$$config.async(lib$rsvp$$internal$$publish, promise);
      }
    }

    function lib$rsvp$$internal$$reject(promise, reason) {
      if (promise._state !== lib$rsvp$$internal$$PENDING) { return; }
      promise._state = lib$rsvp$$internal$$REJECTED;
      promise._result = reason;
      lib$rsvp$config$$config.async(lib$rsvp$$internal$$publishRejection, promise);
    }

    function lib$rsvp$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
      var subscribers = parent._subscribers;
      var length = subscribers.length;

      parent._onError = null;

      subscribers[length] = child;
      subscribers[length + lib$rsvp$$internal$$FULFILLED] = onFulfillment;
      subscribers[length + lib$rsvp$$internal$$REJECTED]  = onRejection;

      if (length === 0 && parent._state) {
        lib$rsvp$config$$config.async(lib$rsvp$$internal$$publish, parent);
      }
    }

    function lib$rsvp$$internal$$publish(promise) {
      var subscribers = promise._subscribers;
      var settled = promise._state;

      if (lib$rsvp$config$$config.instrument) {
        lib$rsvp$instrument$$default(settled === lib$rsvp$$internal$$FULFILLED ? 'fulfilled' : 'rejected', promise);
      }

      if (subscribers.length === 0) { return; }

      var child, callback, detail = promise._result;

      for (var i = 0; i < subscribers.length; i += 3) {
        child = subscribers[i];
        callback = subscribers[i + settled];

        if (child) {
          lib$rsvp$$internal$$invokeCallback(settled, child, callback, detail);
        } else {
          callback(detail);
        }
      }

      promise._subscribers.length = 0;
    }

    function lib$rsvp$$internal$$ErrorObject() {
      this.error = null;
    }

    var lib$rsvp$$internal$$TRY_CATCH_ERROR = new lib$rsvp$$internal$$ErrorObject();

    function lib$rsvp$$internal$$tryCatch(callback, detail) {
      try {
        return callback(detail);
      } catch(e) {
        lib$rsvp$$internal$$TRY_CATCH_ERROR.error = e;
        return lib$rsvp$$internal$$TRY_CATCH_ERROR;
      }
    }

    function lib$rsvp$$internal$$invokeCallback(settled, promise, callback, detail) {
      var hasCallback = lib$rsvp$utils$$isFunction(callback),
          value, error, succeeded, failed;

      if (hasCallback) {
        value = lib$rsvp$$internal$$tryCatch(callback, detail);

        if (value === lib$rsvp$$internal$$TRY_CATCH_ERROR) {
          failed = true;
          error = value.error;
          value = null;
        } else {
          succeeded = true;
        }

        if (promise === value) {
          lib$rsvp$$internal$$reject(promise, lib$rsvp$$internal$$withOwnPromise());
          return;
        }

      } else {
        value = detail;
        succeeded = true;
      }

      if (promise._state !== lib$rsvp$$internal$$PENDING) {
        // noop
      } else if (hasCallback && succeeded) {
        lib$rsvp$$internal$$resolve(promise, value);
      } else if (failed) {
        lib$rsvp$$internal$$reject(promise, error);
      } else if (settled === lib$rsvp$$internal$$FULFILLED) {
        lib$rsvp$$internal$$fulfill(promise, value);
      } else if (settled === lib$rsvp$$internal$$REJECTED) {
        lib$rsvp$$internal$$reject(promise, value);
      }
    }

    function lib$rsvp$$internal$$initializePromise(promise, resolver) {
      var resolved = false;
      try {
        resolver(function resolvePromise(value){
          if (resolved) { return; }
          resolved = true;
          lib$rsvp$$internal$$resolve(promise, value);
        }, function rejectPromise(reason) {
          if (resolved) { return; }
          resolved = true;
          lib$rsvp$$internal$$reject(promise, reason);
        });
      } catch(e) {
        lib$rsvp$$internal$$reject(promise, e);
      }
    }

    function lib$rsvp$all$settled$$AllSettled(Constructor, entries, label) {
      this._superConstructor(Constructor, entries, false /* don't abort on reject */, label);
    }

    lib$rsvp$all$settled$$AllSettled.prototype = lib$rsvp$utils$$o_create(lib$rsvp$enumerator$$default.prototype);
    lib$rsvp$all$settled$$AllSettled.prototype._superConstructor = lib$rsvp$enumerator$$default;
    lib$rsvp$all$settled$$AllSettled.prototype._makeResult = lib$rsvp$enumerator$$makeSettledResult;
    lib$rsvp$all$settled$$AllSettled.prototype._validationError = function() {
      return new Error('allSettled must be called with an array');
    };

    function lib$rsvp$all$settled$$allSettled(entries, label) {
      return new lib$rsvp$all$settled$$AllSettled(lib$rsvp$promise$$default, entries, label).promise;
    }
    var lib$rsvp$all$settled$$default = lib$rsvp$all$settled$$allSettled;
    function lib$rsvp$all$$all(array, label) {
      return lib$rsvp$promise$$default.all(array, label);
    }
    var lib$rsvp$all$$default = lib$rsvp$all$$all;
    var lib$rsvp$asap$$len = 0;
    var lib$rsvp$asap$$toString = {}.toString;
    var lib$rsvp$asap$$vertxNext;
    function lib$rsvp$asap$$asap(callback, arg) {
      lib$rsvp$asap$$queue[lib$rsvp$asap$$len] = callback;
      lib$rsvp$asap$$queue[lib$rsvp$asap$$len + 1] = arg;
      lib$rsvp$asap$$len += 2;
      if (lib$rsvp$asap$$len === 2) {
        // If len is 1, that means that we need to schedule an async flush.
        // If additional callbacks are queued before the queue is flushed, they
        // will be processed by this flush that we are scheduling.
        lib$rsvp$asap$$scheduleFlush();
      }
    }

    var lib$rsvp$asap$$default = lib$rsvp$asap$$asap;

    var lib$rsvp$asap$$browserWindow = (typeof window !== 'undefined') ? window : undefined;
    var lib$rsvp$asap$$browserGlobal = lib$rsvp$asap$$browserWindow || {};
    var lib$rsvp$asap$$BrowserMutationObserver = lib$rsvp$asap$$browserGlobal.MutationObserver || lib$rsvp$asap$$browserGlobal.WebKitMutationObserver;
    var lib$rsvp$asap$$isNode = typeof self === 'undefined' &&
      typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

    // test for web worker but not in IE10
    var lib$rsvp$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' &&
      typeof importScripts !== 'undefined' &&
      typeof MessageChannel !== 'undefined';

    // node
    function lib$rsvp$asap$$useNextTick() {
      var nextTick = process.nextTick;
      // node version 0.10.x displays a deprecation warning when nextTick is used recursively
      // setImmediate should be used instead instead
      var version = process.versions.node.match(/^(?:(\d+)\.)?(?:(\d+)\.)?(\*|\d+)$/);
      if (Array.isArray(version) && version[1] === '0' && version[2] === '10') {
        nextTick = setImmediate;
      }
      return function() {
        nextTick(lib$rsvp$asap$$flush);
      };
    }

    // vertx
    function lib$rsvp$asap$$useVertxTimer() {
      return function() {
        lib$rsvp$asap$$vertxNext(lib$rsvp$asap$$flush);
      };
    }

    function lib$rsvp$asap$$useMutationObserver() {
      var iterations = 0;
      var observer = new lib$rsvp$asap$$BrowserMutationObserver(lib$rsvp$asap$$flush);
      var node = document.createTextNode('');
      observer.observe(node, { characterData: true });

      return function() {
        node.data = (iterations = ++iterations % 2);
      };
    }

    // web worker
    function lib$rsvp$asap$$useMessageChannel() {
      var channel = new MessageChannel();
      channel.port1.onmessage = lib$rsvp$asap$$flush;
      return function () {
        channel.port2.postMessage(0);
      };
    }

    function lib$rsvp$asap$$useSetTimeout() {
      return function() {
        setTimeout(lib$rsvp$asap$$flush, 1);
      };
    }

    var lib$rsvp$asap$$queue = new Array(1000);
    function lib$rsvp$asap$$flush() {
      for (var i = 0; i < lib$rsvp$asap$$len; i+=2) {
        var callback = lib$rsvp$asap$$queue[i];
        var arg = lib$rsvp$asap$$queue[i+1];

        callback(arg);

        lib$rsvp$asap$$queue[i] = undefined;
        lib$rsvp$asap$$queue[i+1] = undefined;
      }

      lib$rsvp$asap$$len = 0;
    }

    function lib$rsvp$asap$$attemptVertex() {
      try {
        var r = require;
        var vertx = r('vertx');
        lib$rsvp$asap$$vertxNext = vertx.runOnLoop || vertx.runOnContext;
        return lib$rsvp$asap$$useVertxTimer();
      } catch(e) {
        return lib$rsvp$asap$$useSetTimeout();
      }
    }

    var lib$rsvp$asap$$scheduleFlush;
    // Decide what async method to use to triggering processing of queued callbacks:
    if (lib$rsvp$asap$$isNode) {
      lib$rsvp$asap$$scheduleFlush = lib$rsvp$asap$$useNextTick();
    } else if (lib$rsvp$asap$$BrowserMutationObserver) {
      lib$rsvp$asap$$scheduleFlush = lib$rsvp$asap$$useMutationObserver();
    } else if (lib$rsvp$asap$$isWorker) {
      lib$rsvp$asap$$scheduleFlush = lib$rsvp$asap$$useMessageChannel();
    } else if (lib$rsvp$asap$$browserWindow === undefined && typeof require === 'function') {
      lib$rsvp$asap$$scheduleFlush = lib$rsvp$asap$$attemptVertex();
    } else {
      lib$rsvp$asap$$scheduleFlush = lib$rsvp$asap$$useSetTimeout();
    }
    function lib$rsvp$defer$$defer(label) {
      var deferred = {};

      deferred['promise'] = new lib$rsvp$promise$$default(function(resolve, reject) {
        deferred['resolve'] = resolve;
        deferred['reject'] = reject;
      }, label);

      return deferred;
    }
    var lib$rsvp$defer$$default = lib$rsvp$defer$$defer;
    function lib$rsvp$filter$$filter(promises, filterFn, label) {
      return lib$rsvp$promise$$default.all(promises, label).then(function(values) {
        if (!lib$rsvp$utils$$isFunction(filterFn)) {
          throw new TypeError("You must pass a function as filter's second argument.");
        }

        var length = values.length;
        var filtered = new Array(length);

        for (var i = 0; i < length; i++) {
          filtered[i] = filterFn(values[i]);
        }

        return lib$rsvp$promise$$default.all(filtered, label).then(function(filtered) {
          var results = new Array(length);
          var newLength = 0;

          for (var i = 0; i < length; i++) {
            if (filtered[i]) {
              results[newLength] = values[i];
              newLength++;
            }
          }

          results.length = newLength;

          return results;
        });
      });
    }
    var lib$rsvp$filter$$default = lib$rsvp$filter$$filter;

    function lib$rsvp$promise$hash$$PromiseHash(Constructor, object, label) {
      this._superConstructor(Constructor, object, true, label);
    }

    var lib$rsvp$promise$hash$$default = lib$rsvp$promise$hash$$PromiseHash;

    lib$rsvp$promise$hash$$PromiseHash.prototype = lib$rsvp$utils$$o_create(lib$rsvp$enumerator$$default.prototype);
    lib$rsvp$promise$hash$$PromiseHash.prototype._superConstructor = lib$rsvp$enumerator$$default;
    lib$rsvp$promise$hash$$PromiseHash.prototype._init = function() {
      this._result = {};
    };

    lib$rsvp$promise$hash$$PromiseHash.prototype._validateInput = function(input) {
      return input && typeof input === 'object';
    };

    lib$rsvp$promise$hash$$PromiseHash.prototype._validationError = function() {
      return new Error('Promise.hash must be called with an object');
    };

    lib$rsvp$promise$hash$$PromiseHash.prototype._enumerate = function() {
      var enumerator = this;
      var promise    = enumerator.promise;
      var input      = enumerator._input;
      var results    = [];

      for (var key in input) {
        if (promise._state === lib$rsvp$$internal$$PENDING && Object.prototype.hasOwnProperty.call(input, key)) {
          results.push({
            position: key,
            entry: input[key]
          });
        }
      }

      var length = results.length;
      enumerator._remaining = length;
      var result;

      for (var i = 0; promise._state === lib$rsvp$$internal$$PENDING && i < length; i++) {
        result = results[i];
        enumerator._eachEntry(result.entry, result.position);
      }
    };

    function lib$rsvp$hash$settled$$HashSettled(Constructor, object, label) {
      this._superConstructor(Constructor, object, false, label);
    }

    lib$rsvp$hash$settled$$HashSettled.prototype = lib$rsvp$utils$$o_create(lib$rsvp$promise$hash$$default.prototype);
    lib$rsvp$hash$settled$$HashSettled.prototype._superConstructor = lib$rsvp$enumerator$$default;
    lib$rsvp$hash$settled$$HashSettled.prototype._makeResult = lib$rsvp$enumerator$$makeSettledResult;

    lib$rsvp$hash$settled$$HashSettled.prototype._validationError = function() {
      return new Error('hashSettled must be called with an object');
    };

    function lib$rsvp$hash$settled$$hashSettled(object, label) {
      return new lib$rsvp$hash$settled$$HashSettled(lib$rsvp$promise$$default, object, label).promise;
    }
    var lib$rsvp$hash$settled$$default = lib$rsvp$hash$settled$$hashSettled;
    function lib$rsvp$hash$$hash(object, label) {
      return new lib$rsvp$promise$hash$$default(lib$rsvp$promise$$default, object, label).promise;
    }
    var lib$rsvp$hash$$default = lib$rsvp$hash$$hash;
    function lib$rsvp$map$$map(promises, mapFn, label) {
      return lib$rsvp$promise$$default.all(promises, label).then(function(values) {
        if (!lib$rsvp$utils$$isFunction(mapFn)) {
          throw new TypeError("You must pass a function as map's second argument.");
        }

        var length = values.length;
        var results = new Array(length);

        for (var i = 0; i < length; i++) {
          results[i] = mapFn(values[i]);
        }

        return lib$rsvp$promise$$default.all(results, label);
      });
    }
    var lib$rsvp$map$$default = lib$rsvp$map$$map;

    function lib$rsvp$node$$Result() {
      this.value = undefined;
    }

    var lib$rsvp$node$$ERROR = new lib$rsvp$node$$Result();
    var lib$rsvp$node$$GET_THEN_ERROR = new lib$rsvp$node$$Result();

    function lib$rsvp$node$$getThen(obj) {
      try {
       return obj.then;
      } catch(error) {
        lib$rsvp$node$$ERROR.value= error;
        return lib$rsvp$node$$ERROR;
      }
    }


    function lib$rsvp$node$$tryApply(f, s, a) {
      try {
        f.apply(s, a);
      } catch(error) {
        lib$rsvp$node$$ERROR.value = error;
        return lib$rsvp$node$$ERROR;
      }
    }

    function lib$rsvp$node$$makeObject(_, argumentNames) {
      var obj = {};
      var name;
      var i;
      var length = _.length;
      var args = new Array(length);

      for (var x = 0; x < length; x++) {
        args[x] = _[x];
      }

      for (i = 0; i < argumentNames.length; i++) {
        name = argumentNames[i];
        obj[name] = args[i + 1];
      }

      return obj;
    }

    function lib$rsvp$node$$arrayResult(_) {
      var length = _.length;
      var args = new Array(length - 1);

      for (var i = 1; i < length; i++) {
        args[i - 1] = _[i];
      }

      return args;
    }

    function lib$rsvp$node$$wrapThenable(then, promise) {
      return {
        then: function(onFulFillment, onRejection) {
          return then.call(promise, onFulFillment, onRejection);
        }
      };
    }

    function lib$rsvp$node$$denodeify(nodeFunc, options) {
      var fn = function() {
        var self = this;
        var l = arguments.length;
        var args = new Array(l + 1);
        var arg;
        var promiseInput = false;

        for (var i = 0; i < l; ++i) {
          arg = arguments[i];

          if (!promiseInput) {
            // TODO: clean this up
            promiseInput = lib$rsvp$node$$needsPromiseInput(arg);
            if (promiseInput === lib$rsvp$node$$GET_THEN_ERROR) {
              var p = new lib$rsvp$promise$$default(lib$rsvp$$internal$$noop);
              lib$rsvp$$internal$$reject(p, lib$rsvp$node$$GET_THEN_ERROR.value);
              return p;
            } else if (promiseInput && promiseInput !== true) {
              arg = lib$rsvp$node$$wrapThenable(promiseInput, arg);
            }
          }
          args[i] = arg;
        }

        var promise = new lib$rsvp$promise$$default(lib$rsvp$$internal$$noop);

        args[l] = function(err, val) {
          if (err)
            lib$rsvp$$internal$$reject(promise, err);
          else if (options === undefined)
            lib$rsvp$$internal$$resolve(promise, val);
          else if (options === true)
            lib$rsvp$$internal$$resolve(promise, lib$rsvp$node$$arrayResult(arguments));
          else if (lib$rsvp$utils$$isArray(options))
            lib$rsvp$$internal$$resolve(promise, lib$rsvp$node$$makeObject(arguments, options));
          else
            lib$rsvp$$internal$$resolve(promise, val);
        };

        if (promiseInput) {
          return lib$rsvp$node$$handlePromiseInput(promise, args, nodeFunc, self);
        } else {
          return lib$rsvp$node$$handleValueInput(promise, args, nodeFunc, self);
        }
      };

      fn.__proto__ = nodeFunc;

      return fn;
    }

    var lib$rsvp$node$$default = lib$rsvp$node$$denodeify;

    function lib$rsvp$node$$handleValueInput(promise, args, nodeFunc, self) {
      var result = lib$rsvp$node$$tryApply(nodeFunc, self, args);
      if (result === lib$rsvp$node$$ERROR) {
        lib$rsvp$$internal$$reject(promise, result.value);
      }
      return promise;
    }

    function lib$rsvp$node$$handlePromiseInput(promise, args, nodeFunc, self){
      return lib$rsvp$promise$$default.all(args).then(function(args){
        var result = lib$rsvp$node$$tryApply(nodeFunc, self, args);
        if (result === lib$rsvp$node$$ERROR) {
          lib$rsvp$$internal$$reject(promise, result.value);
        }
        return promise;
      });
    }

    function lib$rsvp$node$$needsPromiseInput(arg) {
      if (arg && typeof arg === 'object') {
        if (arg.constructor === lib$rsvp$promise$$default) {
          return true;
        } else {
          return lib$rsvp$node$$getThen(arg);
        }
      } else {
        return false;
      }
    }
    var lib$rsvp$platform$$platform;

    /* global self */
    if (typeof self === 'object') {
      lib$rsvp$platform$$platform = self;

    /* global global */
    } else if (typeof global === 'object') {
      lib$rsvp$platform$$platform = global;
    } else {
      throw new Error('no global: `self` or `global` found');
    }

    var lib$rsvp$platform$$default = lib$rsvp$platform$$platform;
    function lib$rsvp$race$$race(array, label) {
      return lib$rsvp$promise$$default.race(array, label);
    }
    var lib$rsvp$race$$default = lib$rsvp$race$$race;
    function lib$rsvp$reject$$reject(reason, label) {
      return lib$rsvp$promise$$default.reject(reason, label);
    }
    var lib$rsvp$reject$$default = lib$rsvp$reject$$reject;
    function lib$rsvp$resolve$$resolve(value, label) {
      return lib$rsvp$promise$$default.resolve(value, label);
    }
    var lib$rsvp$resolve$$default = lib$rsvp$resolve$$resolve;
    function lib$rsvp$rethrow$$rethrow(reason) {
      setTimeout(function() {
        throw reason;
      });
      throw reason;
    }
    var lib$rsvp$rethrow$$default = lib$rsvp$rethrow$$rethrow;

    // defaults
    lib$rsvp$config$$config.async = lib$rsvp$asap$$default;
    lib$rsvp$config$$config.after = function(cb) {
      setTimeout(cb, 0);
    };
    var lib$rsvp$$cast = lib$rsvp$resolve$$default;
    function lib$rsvp$$async(callback, arg) {
      lib$rsvp$config$$config.async(callback, arg);
    }

    function lib$rsvp$$on() {
      lib$rsvp$config$$config['on'].apply(lib$rsvp$config$$config, arguments);
    }

    function lib$rsvp$$off() {
      lib$rsvp$config$$config['off'].apply(lib$rsvp$config$$config, arguments);
    }

    // Set up instrumentation through `window.__PROMISE_INTRUMENTATION__`
    if (typeof window !== 'undefined' && typeof window['__PROMISE_INSTRUMENTATION__'] === 'object') {
      var lib$rsvp$$callbacks = window['__PROMISE_INSTRUMENTATION__'];
      lib$rsvp$config$$configure('instrument', true);
      for (var lib$rsvp$$eventName in lib$rsvp$$callbacks) {
        if (lib$rsvp$$callbacks.hasOwnProperty(lib$rsvp$$eventName)) {
          lib$rsvp$$on(lib$rsvp$$eventName, lib$rsvp$$callbacks[lib$rsvp$$eventName]);
        }
      }
    }

    var lib$rsvp$umd$$RSVP = {
      'race': lib$rsvp$race$$default,
      'Promise': lib$rsvp$promise$$default,
      'allSettled': lib$rsvp$all$settled$$default,
      'hash': lib$rsvp$hash$$default,
      'hashSettled': lib$rsvp$hash$settled$$default,
      'denodeify': lib$rsvp$node$$default,
      'on': lib$rsvp$$on,
      'off': lib$rsvp$$off,
      'map': lib$rsvp$map$$default,
      'filter': lib$rsvp$filter$$default,
      'resolve': lib$rsvp$resolve$$default,
      'reject': lib$rsvp$reject$$default,
      'all': lib$rsvp$all$$default,
      'rethrow': lib$rsvp$rethrow$$default,
      'defer': lib$rsvp$defer$$default,
      'EventTarget': lib$rsvp$events$$default,
      'configure': lib$rsvp$config$$configure,
      'async': lib$rsvp$$async
    };

    /* global define:true module:true window: true */
    if (typeof define === 'function' && define['amd']) {
      define(function() { return lib$rsvp$umd$$RSVP; });
    } else if (typeof module !== 'undefined' && module['exports']) {
      module['exports'] = lib$rsvp$umd$$RSVP;
    } else if (typeof lib$rsvp$platform$$default !== 'undefined') {
      lib$rsvp$platform$$default['RSVP'] = lib$rsvp$umd$$RSVP;
    }
}).call(this);


}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"_process":66}]},{},[27])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9hcHAvY2FjaGUuanMiLCJqcy9hcHAvY29uc3RydWN0b3IuanMiLCJqcy9hcHAvaW5kZXguanMiLCJqcy9kb20vYWRkX2NhdGVnb3JpZXMuanMiLCJqcy9kb20vYWRkX2ZpbGVzLmpzIiwianMvZG9tL2luZGV4LmpzIiwianMvZG9tL2xvYWRpbmdfc2xpZGVyLmpzIiwianMvZG9tL3NldHVwL2luZGV4LmpzIiwianMvZG9tL3NldHVwL3NldHVwX2RpdmlkZXJzLmpzIiwianMvZG9tL3NldHVwL3NldHVwX2RvY3VtZW50LmpzIiwianMvZG9tL3NldHVwL3NldHVwX2ZpbGVzX2Jhci5qcyIsImpzL2RvbS9zZXR1cC9zZXR1cF9pbnRlcnZhbC5qcyIsImpzL2RvbS9zZXR1cC9zZXR1cF9tb2R1bGVfY29udGFpbmVyLmpzIiwianMvZG9tL3NldHVwL3NldHVwX3Bvd2VyZWRfYnkuanMiLCJqcy9kb20vc2V0dXAvc2V0dXBfc2NyYXRjaF9wYXBlci5qcyIsImpzL2RvbS9zZXR1cC9zZXR1cF9zaWRlX21lbnUuanMiLCJqcy9kb20vc2V0dXAvc2V0dXBfdG9wX21lbnUuanMiLCJqcy9kb20vc2V0dXAvc2V0dXBfd2luZG93LmpzIiwianMvZG9tL3Nob3dfYWxnb3JpdGhtLmpzIiwianMvZG9tL3Nob3dfZGVzY3JpcHRpb24uanMiLCJqcy9kb20vc2hvd19maXJzdF9hbGdvcml0aG0uanMiLCJqcy9kb20vc2hvd19yZXF1ZXN0ZWRfYWxnb3JpdGhtLmpzIiwianMvZG9tL3RvYXN0LmpzIiwianMvZWRpdG9yL2NyZWF0ZS5qcyIsImpzL2VkaXRvci9leGVjdXRvci5qcyIsImpzL2VkaXRvci9pbmRleC5qcyIsImpzL2luZGV4LmpzIiwianMvbW9kdWxlL2RhdGEvYXJyYXkxZC5qcyIsImpzL21vZHVsZS9kYXRhL2FycmF5MmQuanMiLCJqcy9tb2R1bGUvZGF0YS9jb29yZGluYXRlX3N5c3RlbS5qcyIsImpzL21vZHVsZS9kYXRhL2RpcmVjdGVkX2dyYXBoLmpzIiwianMvbW9kdWxlL2RhdGEvaW5kZXguanMiLCJqcy9tb2R1bGUvZGF0YS91bmRpcmVjdGVkX2dyYXBoLmpzIiwianMvbW9kdWxlL2RhdGEvd2VpZ2h0ZWRfZGlyZWN0ZWRfZ3JhcGguanMiLCJqcy9tb2R1bGUvZGF0YS93ZWlnaHRlZF91bmRpcmVjdGVkX2dyYXBoLmpzIiwianMvbW9kdWxlL2luZGV4LmpzIiwianMvbW9kdWxlL3RyYWNlci9hcnJheTFkLmpzIiwianMvbW9kdWxlL3RyYWNlci9hcnJheTJkLmpzIiwianMvbW9kdWxlL3RyYWNlci9jaGFydC5qcyIsImpzL21vZHVsZS90cmFjZXIvY29vcmRpbmF0ZV9zeXN0ZW0uanMiLCJqcy9tb2R1bGUvdHJhY2VyL2RpcmVjdGVkX2dyYXBoLmpzIiwianMvbW9kdWxlL3RyYWNlci9pbmRleC5qcyIsImpzL21vZHVsZS90cmFjZXIvbG9nLmpzIiwianMvbW9kdWxlL3RyYWNlci90cmFjZXIuanMiLCJqcy9tb2R1bGUvdHJhY2VyL3VuZGlyZWN0ZWRfZ3JhcGguanMiLCJqcy9tb2R1bGUvdHJhY2VyL3dlaWdodGVkX2RpcmVjdGVkX2dyYXBoLmpzIiwianMvbW9kdWxlL3RyYWNlci93ZWlnaHRlZF91bmRpcmVjdGVkX2dyYXBoLmpzIiwianMvc2VydmVyL2FqYXgvZ2V0LmpzIiwianMvc2VydmVyL2FqYXgvZ2V0X2pzb24uanMiLCJqcy9zZXJ2ZXIvYWpheC9wb3N0X2pzb24uanMiLCJqcy9zZXJ2ZXIvYWpheC9yZXF1ZXN0LmpzIiwianMvc2VydmVyL2hlbHBlcnMuanMiLCJqcy9zZXJ2ZXIvaW5kZXguanMiLCJqcy9zZXJ2ZXIvbG9hZF9hbGdvcml0aG0uanMiLCJqcy9zZXJ2ZXIvbG9hZF9jYXRlZ29yaWVzLmpzIiwianMvc2VydmVyL2xvYWRfZmlsZS5qcyIsImpzL3NlcnZlci9sb2FkX3NjcmF0Y2hfcGFwZXIuanMiLCJqcy9zZXJ2ZXIvc2hhcmVfc2NyYXRjaF9wYXBlci5qcyIsImpzL3RyYWNlcl9tYW5hZ2VyL2luZGV4LmpzIiwianMvdHJhY2VyX21hbmFnZXIvbWFuYWdlci5qcyIsImpzL3RyYWNlcl9tYW5hZ2VyL3V0aWwvZnJvbV9qc29uLmpzIiwianMvdHJhY2VyX21hbmFnZXIvdXRpbC9pbmRleC5qcyIsImpzL3RyYWNlcl9tYW5hZ2VyL3V0aWwvcmVmaW5lX2J5X3R5cGUuanMiLCJqcy90cmFjZXJfbWFuYWdlci91dGlsL3RvX2pzb24uanMiLCJqcy91dGlscy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvcnN2cC9kaXN0L3JzdnAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7U0FJSSxDO0lBREYsTSxNQUFBLE07OztBQUdGLElBQU0sUUFBUTtBQUNaLGdCQUFjLEVBREY7QUFFWixTQUFPO0FBRkssQ0FBZDs7QUFLQSxJQUFNLGlCQUFpQixTQUFqQixjQUFpQixDQUFDLElBQUQsRUFBVTtBQUMvQixNQUFJLENBQUMsSUFBTCxFQUFXO0FBQ1QsVUFBTSxtQkFBTjtBQUNEO0FBQ0YsQ0FKRDs7Ozs7QUFVQSxPQUFPLE9BQVAsR0FBaUI7QUFFZixlQUZlLHlCQUVELElBRkMsRUFFSztBQUNsQixtQkFBZSxJQUFmO0FBQ0EsV0FBTyxNQUFNLEtBQU4sQ0FBWSxJQUFaLENBQVA7QUFDRCxHQUxjO0FBT2Ysa0JBUGUsNEJBT0UsSUFQRixFQU9RLE9BUFIsRUFPaUI7QUFDOUIsbUJBQWUsSUFBZjtBQUNBLFFBQUksQ0FBQyxNQUFNLEtBQU4sQ0FBWSxJQUFaLENBQUwsRUFBd0I7QUFDdEIsWUFBTSxLQUFOLENBQVksSUFBWixJQUFvQixFQUFwQjtBQUNEO0FBQ0QsV0FBTyxNQUFNLEtBQU4sQ0FBWSxJQUFaLENBQVAsRUFBMEIsT0FBMUI7QUFDRCxHQWJjO0FBZWYsaUJBZmUsNkJBZUc7QUFDaEIsV0FBTyxNQUFNLFlBQWI7QUFDRCxHQWpCYztBQW1CZixpQkFuQmUsMkJBbUJDLElB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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IHtcbiAgZXh0ZW5kXG59ID0gJDtcblxuY29uc3QgY2FjaGUgPSB7XG4gIGxhc3RGaWxlVXNlZDogJycsXG4gIGZpbGVzOiB7fVxufTtcblxuY29uc3QgYXNzZXJ0RmlsZU5hbWUgPSAobmFtZSkgPT4ge1xuICBpZiAoIW5hbWUpIHtcbiAgICB0aHJvdyAnTWlzc2luZyBmaWxlIG5hbWUnO1xuICB9XG59O1xuXG5cbi8qKlxuICogR2xvYmFsIGFwcGxpY2F0aW9uIGNhY2hlXG4gKi9cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIGdldENhY2hlZEZpbGUobmFtZSkge1xuICAgIGFzc2VydEZpbGVOYW1lKG5hbWUpO1xuICAgIHJldHVybiBjYWNoZS5maWxlc1tuYW1lXTtcbiAgfSxcblxuICB1cGRhdGVDYWNoZWRGaWxlKG5hbWUsIHVwZGF0ZXMpIHtcbiAgICBhc3NlcnRGaWxlTmFtZShuYW1lKTtcbiAgICBpZiAoIWNhY2hlLmZpbGVzW25hbWVdKSB7XG4gICAgICBjYWNoZS5maWxlc1tuYW1lXSA9IHt9O1xuICAgIH1cbiAgICBleHRlbmQoY2FjaGUuZmlsZXNbbmFtZV0sIHVwZGF0ZXMpO1xuICB9LFxuXG4gIGdldExhc3RGaWxlVXNlZCgpIHtcbiAgICByZXR1cm4gY2FjaGUubGFzdEZpbGVVc2VkO1xuICB9LFxuXG4gIHNldExhc3RGaWxlVXNlZChmaWxlKSB7XG4gICAgY2FjaGUubGFzdEZpbGVVc2VkID0gZmlsZTtcbiAgfVxufTsiLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IEVkaXRvciA9IHJlcXVpcmUoJy4uL2VkaXRvcicpO1xuY29uc3QgVHJhY2VyTWFuYWdlciA9IHJlcXVpcmUoJy4uL3RyYWNlcl9tYW5hZ2VyJyk7XG5jb25zdCBET00gPSByZXF1aXJlKCcuLi9kb20vc2V0dXAnKTtcblxuY29uc3Qge1xuICBzaG93TG9hZGluZ1NsaWRlcixcbiAgaGlkZUxvYWRpbmdTbGlkZXJcbn0gPSByZXF1aXJlKCcuLi9kb20vbG9hZGluZ19zbGlkZXInKTtcblxuY29uc3QgQ2FjaGUgPSByZXF1aXJlKCcuL2NhY2hlJyk7XG5cbmNvbnN0IHN0YXRlID0ge1xuICBpc0xvYWRpbmc6IG51bGwsXG4gIGVkaXRvcjogbnVsbCxcbiAgdHJhY2VyTWFuYWdlcjogbnVsbCxcbiAgY2F0ZWdvcmllczogbnVsbCxcbiAgbG9hZGVkU2NyYXRjaDogbnVsbFxufTtcblxuY29uc3QgaW5pdFN0YXRlID0gKHRyYWNlck1hbmFnZXIpID0+IHtcbiAgc3RhdGUuaXNMb2FkaW5nID0gZmFsc2U7XG4gIHN0YXRlLmVkaXRvciA9IG5ldyBFZGl0b3IodHJhY2VyTWFuYWdlcik7XG4gIHN0YXRlLnRyYWNlck1hbmFnZXIgPSB0cmFjZXJNYW5hZ2VyO1xuICBzdGF0ZS5jYXRlZ29yaWVzID0ge307XG4gIHN0YXRlLmxvYWRlZFNjcmF0Y2ggPSBudWxsO1xufTtcblxuLyoqXG4gKiBHbG9iYWwgYXBwbGljYXRpb24gc2luZ2xldG9uLlxuICovXG5jb25zdCBBcHAgPSBmdW5jdGlvbiAoKSB7XG5cbiAgdGhpcy5nZXRJc0xvYWRpbmcgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHN0YXRlLmlzTG9hZGluZztcbiAgfTtcblxuICB0aGlzLnNldElzTG9hZGluZyA9IChsb2FkaW5nKSA9PiB7XG4gICAgc3RhdGUuaXNMb2FkaW5nID0gbG9hZGluZztcbiAgICBpZiAobG9hZGluZykge1xuICAgICAgc2hvd0xvYWRpbmdTbGlkZXIoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaGlkZUxvYWRpbmdTbGlkZXIoKTtcbiAgICB9XG4gIH07XG5cbiAgdGhpcy5nZXRFZGl0b3IgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHN0YXRlLmVkaXRvcjtcbiAgfTtcblxuICB0aGlzLmdldENhdGVnb3JpZXMgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHN0YXRlLmNhdGVnb3JpZXM7XG4gIH07XG5cbiAgdGhpcy5nZXRDYXRlZ29yeSA9IChuYW1lKSA9PiB7XG4gICAgcmV0dXJuIHN0YXRlLmNhdGVnb3JpZXNbbmFtZV07XG4gIH07XG5cbiAgdGhpcy5zZXRDYXRlZ29yaWVzID0gKGNhdGVnb3JpZXMpID0+IHtcbiAgICBzdGF0ZS5jYXRlZ29yaWVzID0gY2F0ZWdvcmllcztcbiAgfTtcblxuICB0aGlzLnVwZGF0ZUNhdGVnb3J5ID0gKG5hbWUsIHVwZGF0ZXMpID0+IHtcbiAgICAkLmV4dGVuZChzdGF0ZS5jYXRlZ29yaWVzW25hbWVdLCB1cGRhdGVzKTtcbiAgfTtcblxuICB0aGlzLmdldFRyYWNlck1hbmFnZXIgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHN0YXRlLnRyYWNlck1hbmFnZXI7XG4gIH07XG5cbiAgdGhpcy5nZXRMb2FkZWRTY3JhdGNoID0gKCkgPT4ge1xuICAgIHJldHVybiBzdGF0ZS5sb2FkZWRTY3JhdGNoO1xuICB9O1xuXG4gIHRoaXMuc2V0TG9hZGVkU2NyYXRjaCA9IChsb2FkZWRTY3JhdGNoKSA9PiB7XG4gICAgc3RhdGUubG9hZGVkU2NyYXRjaCA9IGxvYWRlZFNjcmF0Y2g7XG4gIH07XG5cbiAgY29uc3QgdHJhY2VyTWFuYWdlciA9IFRyYWNlck1hbmFnZXIuaW5pdCgpO1xuXG4gIGluaXRTdGF0ZSh0cmFjZXJNYW5hZ2VyKTtcbiAgRE9NLnNldHVwKHRyYWNlck1hbmFnZXIpO1xuXG59O1xuXG5BcHAucHJvdG90eXBlID0gQ2FjaGU7XG5cbm1vZHVsZS5leHBvcnRzID0gQXBwO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFRoaXMgaXMgdGhlIG1haW4gYXBwbGljYXRpb24gaW5zdGFuY2UuXG4gKiBHZXRzIHBvcHVsYXRlZCBvbiBwYWdlIGxvYWQuIFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IHt9OyIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgYXBwID0gcmVxdWlyZSgnLi4vYXBwJyk7XG5jb25zdCBTZXJ2ZXIgPSByZXF1aXJlKCcuLi9zZXJ2ZXInKTtcbmNvbnN0IHNob3dBbGdvcml0aG0gPSByZXF1aXJlKCcuL3Nob3dfYWxnb3JpdGhtJyk7XG5cbmNvbnN0IHtcbiAgZWFjaFxufSA9ICQ7XG5cbmNvbnN0IGFkZEFsZ29yaXRobVRvQ2F0ZWdvcnlET00gPSAoY2F0ZWdvcnksIHN1Ykxpc3QsIGFsZ29yaXRobSkgPT4ge1xuICBjb25zdCAkYWxnb3JpdGhtID0gJCgnPGJ1dHRvbiBjbGFzcz1cImluZGVudCBjb2xsYXBzZVwiPicpXG4gICAgLmFwcGVuZChzdWJMaXN0W2FsZ29yaXRobV0pXG4gICAgLmF0dHIoJ2RhdGEtYWxnb3JpdGhtJywgYWxnb3JpdGhtKVxuICAgIC5hdHRyKCdkYXRhLWNhdGVnb3J5JywgY2F0ZWdvcnkpXG4gICAgLmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgIFNlcnZlci5sb2FkQWxnb3JpdGhtKGNhdGVnb3J5LCBhbGdvcml0aG0pLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgc2hvd0FsZ29yaXRobShjYXRlZ29yeSwgYWxnb3JpdGhtLCBkYXRhKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICQoJyNsaXN0JykuYXBwZW5kKCRhbGdvcml0aG0pO1xufTtcblxuY29uc3QgYWRkQ2F0ZWdvcnlUb0RPTSA9IChjYXRlZ29yeSkgPT4ge1xuXG4gIGNvbnN0IHtcbiAgICBuYW1lOiBjYXRlZ29yeU5hbWUsXG4gICAgbGlzdDogY2F0ZWdvcnlTdWJMaXN0XG4gIH0gPSBhcHAuZ2V0Q2F0ZWdvcnkoY2F0ZWdvcnkpO1xuXG4gIGNvbnN0ICRjYXRlZ29yeSA9ICQoJzxidXR0b24gY2xhc3M9XCJjYXRlZ29yeVwiPicpXG4gICAgLmFwcGVuZCgnPGkgY2xhc3M9XCJmYSBmYS1mdyBmYS1jYXJldC1yaWdodFwiPicpXG4gICAgLmFwcGVuZChjYXRlZ29yeU5hbWUpXG4gICAgLmF0dHIoJ2RhdGEtY2F0ZWdvcnknLCBjYXRlZ29yeSk7XG5cbiAgJGNhdGVnb3J5LmNsaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAkKGAuaW5kZW50W2RhdGEtY2F0ZWdvcnk9XCIke2NhdGVnb3J5fVwiXWApLnRvZ2dsZUNsYXNzKCdjb2xsYXBzZScpO1xuICAgICQodGhpcykuZmluZCgnaS5mYScpLnRvZ2dsZUNsYXNzKCdmYS1jYXJldC1yaWdodCBmYS1jYXJldC1kb3duJyk7XG4gIH0pO1xuXG4gICQoJyNsaXN0JykuYXBwZW5kKCRjYXRlZ29yeSk7XG5cbiAgZWFjaChjYXRlZ29yeVN1Ykxpc3QsIChhbGdvcml0aG0pID0+IHtcbiAgICBhZGRBbGdvcml0aG1Ub0NhdGVnb3J5RE9NKGNhdGVnb3J5LCBjYXRlZ29yeVN1Ykxpc3QsIGFsZ29yaXRobSk7XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSAoKSA9PiB7XG4gIGVhY2goYXBwLmdldENhdGVnb3JpZXMoKSwgYWRkQ2F0ZWdvcnlUb0RPTSk7XG59OyIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgU2VydmVyID0gcmVxdWlyZSgnLi4vc2VydmVyJyk7XG5cbmNvbnN0IHtcbiAgZWFjaFxufSA9ICQ7XG5cbmNvbnN0IGFkZEZpbGVUb0RPTSA9IChjYXRlZ29yeSwgYWxnb3JpdGhtLCBmaWxlLCBleHBsYW5hdGlvbikgPT4ge1xuICB2YXIgJGZpbGUgPSAkKCc8YnV0dG9uPicpXG4gICAgLmFwcGVuZChmaWxlKVxuICAgIC5hdHRyKCdkYXRhLWZpbGUnLCBmaWxlKVxuICAgIC5jbGljayhmdW5jdGlvbiAoKSB7XG4gICAgICBTZXJ2ZXIubG9hZEZpbGUoY2F0ZWdvcnksIGFsZ29yaXRobSwgZmlsZSwgZXhwbGFuYXRpb24pO1xuICAgICAgJCgnLmZpbGVzX2JhciA+IC53cmFwcGVyID4gYnV0dG9uJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgJCh0aGlzKS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgfSk7XG4gICQoJy5maWxlc19iYXIgPiAud3JhcHBlcicpLmFwcGVuZCgkZmlsZSk7XG4gIHJldHVybiAkZmlsZTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gKGNhdGVnb3J5LCBhbGdvcml0aG0sIGZpbGVzLCByZXF1ZXN0ZWRGaWxlKSA9PiB7XG4gICQoJy5maWxlc19iYXIgPiAud3JhcHBlcicpLmVtcHR5KCk7XG5cbiAgZWFjaChmaWxlcywgKGZpbGUsIGV4cGxhbmF0aW9uKSA9PiB7XG4gICAgdmFyICRmaWxlID0gYWRkRmlsZVRvRE9NKGNhdGVnb3J5LCBhbGdvcml0aG0sIGZpbGUsIGV4cGxhbmF0aW9uKTtcbiAgICBpZiAocmVxdWVzdGVkRmlsZSAmJiByZXF1ZXN0ZWRGaWxlID09IGZpbGUpICRmaWxlLmNsaWNrKCk7XG4gIH0pO1xuXG4gIGlmICghcmVxdWVzdGVkRmlsZSkgJCgnLmZpbGVzX2JhciA+IC53cmFwcGVyID4gYnV0dG9uJykuZmlyc3QoKS5jbGljaygpO1xuICAkKCcuZmlsZXNfYmFyID4gLndyYXBwZXInKS5zY3JvbGwoKTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBzaG93QWxnb3JpdGhtID0gcmVxdWlyZSgnLi9zaG93X2FsZ29yaXRobScpO1xuY29uc3QgYWRkQ2F0ZWdvcmllcyA9IHJlcXVpcmUoJy4vYWRkX2NhdGVnb3JpZXMnKTtcbmNvbnN0IHNob3dEZXNjcmlwdGlvbiA9IHJlcXVpcmUoJy4vc2hvd19kZXNjcmlwdGlvbicpO1xuY29uc3QgYWRkRmlsZXMgPSByZXF1aXJlKCcuL2FkZF9maWxlcycpO1xuY29uc3Qgc2hvd0ZpcnN0QWxnb3JpdGhtID0gcmVxdWlyZSgnLi9zaG93X2ZpcnN0X2FsZ29yaXRobScpO1xuY29uc3Qgc2hvd1JlcXVlc3RlZEFsZ29yaXRobSA9IHJlcXVpcmUoJy4vc2hvd19yZXF1ZXN0ZWRfYWxnb3JpdGhtJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBzaG93QWxnb3JpdGhtLFxuICBhZGRDYXRlZ29yaWVzLFxuICBzaG93RGVzY3JpcHRpb24sXG4gIGFkZEZpbGVzLFxuICBzaG93Rmlyc3RBbGdvcml0aG0sXG4gIHNob3dSZXF1ZXN0ZWRBbGdvcml0aG1cbn07IiwiXG5jb25zdCBzaG93TG9hZGluZ1NsaWRlciA9ICgpID0+IHtcbiAgJCgnI2xvYWRpbmctc2xpZGVyJykucmVtb3ZlQ2xhc3MoJ2xvYWRlZCcpO1xufTtcblxuY29uc3QgaGlkZUxvYWRpbmdTbGlkZXIgPSAoKSA9PiB7XG4gICQoJyNsb2FkaW5nLXNsaWRlcicpLmFkZENsYXNzKCdsb2FkZWQnKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBzaG93TG9hZGluZ1NsaWRlcixcbiAgaGlkZUxvYWRpbmdTbGlkZXJcbn07XG4iLCJjb25zdCBzZXR1cERpdmlkZXJzID0gcmVxdWlyZSgnLi9zZXR1cF9kaXZpZGVycycpO1xuY29uc3Qgc2V0dXBEb2N1bWVudCA9IHJlcXVpcmUoJy4vc2V0dXBfZG9jdW1lbnQnKTtcbmNvbnN0IHNldHVwRmlsZXNCYXIgPSByZXF1aXJlKCcuL3NldHVwX2ZpbGVzX2JhcicpO1xuY29uc3Qgc2V0dXBJbnRlcnZhbCA9IHJlcXVpcmUoJy4vc2V0dXBfaW50ZXJ2YWwnKTtcbmNvbnN0IHNldHVwTW9kdWxlQ29udGFpbmVyID0gcmVxdWlyZSgnLi9zZXR1cF9tb2R1bGVfY29udGFpbmVyJyk7XG5jb25zdCBzZXR1cFBvd2VyZWRCeSA9IHJlcXVpcmUoJy4vc2V0dXBfcG93ZXJlZF9ieScpO1xuY29uc3Qgc2V0dXBTY3JhdGNoUGFwZXIgPSByZXF1aXJlKCcuL3NldHVwX3NjcmF0Y2hfcGFwZXInKTtcbmNvbnN0IHNldHVwU2lkZU1lbnUgPSByZXF1aXJlKCcuL3NldHVwX3NpZGVfbWVudScpO1xuY29uc3Qgc2V0dXBUb3BNZW51ID0gcmVxdWlyZSgnLi9zZXR1cF90b3BfbWVudScpO1xuY29uc3Qgc2V0dXBXaW5kb3cgPSByZXF1aXJlKCcuL3NldHVwX3dpbmRvdycpO1xuXG4vKipcbiAqIEluaXRpYWxpemVzIGVsZW1lbnRzIG9uY2UgdGhlIGFwcCBsb2FkcyBpbiB0aGUgRE9NLiBcbiAqL1xuY29uc3Qgc2V0dXAgPSAoKSA9PiB7XG5cbiAgJCgnLmJ0biBpbnB1dCcpLmNsaWNrKChlKSA9PiB7XG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgfSk7XG5cbiAgLy8gZGl2aWRlcnNcbiAgc2V0dXBEaXZpZGVycygpO1xuXG4gIC8vIGRvY3VtZW50XG4gIHNldHVwRG9jdW1lbnQoKTtcblxuICAvLyBmaWxlcyBiYXJcbiAgc2V0dXBGaWxlc0JhcigpO1xuXG4gIC8vIGludGVydmFsXG4gIHNldHVwSW50ZXJ2YWwoKTtcblxuICAvLyBtb2R1bGUgY29udGFpbmVyXG4gIHNldHVwTW9kdWxlQ29udGFpbmVyKCk7XG5cbiAgLy8gcG93ZXJlZCBieVxuICBzZXR1cFBvd2VyZWRCeSgpO1xuXG4gIC8vIHNjcmF0Y2ggcGFwZXJcbiAgc2V0dXBTY3JhdGNoUGFwZXIoKTtcblxuICAvLyBzaWRlIG1lbnVcbiAgc2V0dXBTaWRlTWVudSgpO1xuXG4gIC8vIHRvcCBtZW51XG4gIHNldHVwVG9wTWVudSgpO1xuXG4gIC8vIHdpbmRvd1xuICBzZXR1cFdpbmRvdygpO1xuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2V0dXBcbn07IiwiY29uc3QgYXBwID0gcmVxdWlyZSgnLi4vLi4vYXBwJyk7XG5cbmNvbnN0IGFkZERpdmlkZXJUb0RvbSA9IChkaXZpZGVyKSA9PiB7XG4gIGNvbnN0IFt2ZXJ0aWNhbCwgJGZpcnN0LCAkc2Vjb25kXSA9IGRpdmlkZXI7XG4gIGNvbnN0ICRwYXJlbnQgPSAkZmlyc3QucGFyZW50KCk7XG4gIGNvbnN0IHRoaWNrbmVzcyA9IDU7XG5cbiAgY29uc3QgJGRpdmlkZXIgPSAkKCc8ZGl2IGNsYXNzPVwiZGl2aWRlclwiPicpO1xuXG4gIGxldCBkcmFnZ2luZyA9IGZhbHNlO1xuICBpZiAodmVydGljYWwpIHtcbiAgICAkZGl2aWRlci5hZGRDbGFzcygndmVydGljYWwnKTtcblxuICAgIGxldCBfbGVmdCA9IC10aGlja25lc3MgLyAyO1xuICAgICRkaXZpZGVyLmNzcyh7XG4gICAgICB0b3A6IDAsXG4gICAgICBib3R0b206IDAsXG4gICAgICBsZWZ0OiBfbGVmdCxcbiAgICAgIHdpZHRoOiB0aGlja25lc3NcbiAgICB9KTtcblxuICAgIGxldCB4O1xuICAgICRkaXZpZGVyLm1vdXNlZG93bigoe1xuICAgICAgcGFnZVhcbiAgICB9KSA9PiB7XG4gICAgICB4ID0gcGFnZVg7XG4gICAgICBkcmFnZ2luZyA9IHRydWU7XG4gICAgfSk7XG5cbiAgICAkKGRvY3VtZW50KS5tb3VzZW1vdmUoKHtcbiAgICAgIHBhZ2VYXG4gICAgfSkgPT4ge1xuICAgICAgaWYgKGRyYWdnaW5nKSB7XG4gICAgICAgIGNvbnN0IG5ld19sZWZ0ID0gJHNlY29uZC5wb3NpdGlvbigpLmxlZnQgKyBwYWdlWCAtIHg7XG4gICAgICAgIGxldCBwZXJjZW50ID0gbmV3X2xlZnQgLyAkcGFyZW50LndpZHRoKCkgKiAxMDA7XG4gICAgICAgIHBlcmNlbnQgPSBNYXRoLm1pbig5MCwgTWF0aC5tYXgoMTAsIHBlcmNlbnQpKTtcbiAgICAgICAgJGZpcnN0LmNzcygncmlnaHQnLCAoMTAwIC0gcGVyY2VudCkgKyAnJScpO1xuICAgICAgICAkc2Vjb25kLmNzcygnbGVmdCcsIHBlcmNlbnQgKyAnJScpO1xuICAgICAgICB4ID0gcGFnZVg7XG4gICAgICAgIGFwcC5nZXRUcmFjZXJNYW5hZ2VyKCkucmVzaXplKCk7XG4gICAgICAgICQoJy5maWxlc19iYXIgPiAud3JhcHBlcicpLnNjcm9sbCgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgJChkb2N1bWVudCkubW91c2V1cChmdW5jdGlvbihlKSB7XG4gICAgICBkcmFnZ2luZyA9IGZhbHNlO1xuICAgIH0pO1xuXG4gIH0gZWxzZSB7XG5cbiAgICAkZGl2aWRlci5hZGRDbGFzcygnaG9yaXpvbnRhbCcpO1xuICAgIGNvbnN0IF90b3AgPSAtdGhpY2tuZXNzIC8gMjtcbiAgICAkZGl2aWRlci5jc3Moe1xuICAgICAgdG9wOiBfdG9wLFxuICAgICAgaGVpZ2h0OiB0aGlja25lc3MsXG4gICAgICBsZWZ0OiAwLFxuICAgICAgcmlnaHQ6IDBcbiAgICB9KTtcblxuICAgIGxldCB5O1xuICAgICRkaXZpZGVyLm1vdXNlZG93bihmdW5jdGlvbih7XG4gICAgICBwYWdlWVxuICAgIH0pIHtcbiAgICAgIHkgPSBwYWdlWTtcbiAgICAgIGRyYWdnaW5nID0gdHJ1ZTtcbiAgICB9KTtcblxuICAgICQoZG9jdW1lbnQpLm1vdXNlbW92ZShmdW5jdGlvbih7XG4gICAgICBwYWdlWVxuICAgIH0pIHtcbiAgICAgIGlmIChkcmFnZ2luZykge1xuICAgICAgICBjb25zdCBuZXdfdG9wID0gJHNlY29uZC5wb3NpdGlvbigpLnRvcCArIHBhZ2VZIC0geTtcbiAgICAgICAgbGV0IHBlcmNlbnQgPSBuZXdfdG9wIC8gJHBhcmVudC5oZWlnaHQoKSAqIDEwMDtcbiAgICAgICAgcGVyY2VudCA9IE1hdGgubWluKDkwLCBNYXRoLm1heCgxMCwgcGVyY2VudCkpO1xuICAgICAgICAkZmlyc3QuY3NzKCdib3R0b20nLCAoMTAwIC0gcGVyY2VudCkgKyAnJScpO1xuICAgICAgICAkc2Vjb25kLmNzcygndG9wJywgcGVyY2VudCArICclJyk7XG4gICAgICAgIHkgPSBwYWdlWTtcbiAgICAgICAgYXBwLmdldFRyYWNlck1hbmFnZXIoKS5yZXNpemUoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgICQoZG9jdW1lbnQpLm1vdXNldXAoZnVuY3Rpb24oZSkge1xuICAgICAgZHJhZ2dpbmcgPSBmYWxzZTtcbiAgICB9KTtcbiAgfVxuXG4gICRzZWNvbmQuYXBwZW5kKCRkaXZpZGVyKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gKCkgPT4ge1xuICBjb25zdCBkaXZpZGVycyA9IFtcbiAgICBbJ3YnLCAkKCcuc2lkZW1lbnUnKSwgJCgnLndvcmtzcGFjZScpXSxcbiAgICBbJ3YnLCAkKCcudmlld2VyX2NvbnRhaW5lcicpLCAkKCcuZWRpdG9yX2NvbnRhaW5lcicpXSxcbiAgICBbJ2gnLCAkKCcuZGF0YV9jb250YWluZXInKSwgJCgnLmNvZGVfY29udGFpbmVyJyldXG4gIF07XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZGl2aWRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICBhZGREaXZpZGVyVG9Eb20oZGl2aWRlcnNbaV0pO1xuICB9XG59IiwiY29uc3QgYXBwID0gcmVxdWlyZSgnLi4vLi4vYXBwJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKCkgPT4ge1xuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnYScsIGZ1bmN0aW9uIChlKSB7XG4gICAgY29uc29sZS5sb2coZSk7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGlmICghd2luZG93Lm9wZW4oJCh0aGlzKS5hdHRyKCdocmVmJyksICdfYmxhbmsnKSkge1xuICAgICAgYWxlcnQoJ1BsZWFzZSBhbGxvdyBwb3B1cHMgZm9yIHRoaXMgc2l0ZScpO1xuICAgIH1cbiAgfSk7XG5cbiAgJChkb2N1bWVudCkubW91c2V1cChmdW5jdGlvbiAoZSkge1xuICAgIGFwcC5nZXRUcmFjZXJNYW5hZ2VyKCkuY29tbWFuZCgnbW91c2V1cCcsIGUpO1xuICB9KTtcbn07IiwiY29uc3QgZGVmaW5pdGVseUJpZ2dlciA9ICh4LCB5KSA9PiB4ID4gKHkgKyAyKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoKSA9PiB7XG5cbiAgJCgnLmZpbGVzX2JhciA+IC5idG4tbGVmdCcpLmNsaWNrKCgpID0+IHtcbiAgICBjb25zdCAkd3JhcHBlciA9ICQoJy5maWxlc19iYXIgPiAud3JhcHBlcicpO1xuICAgIGNvbnN0IGNsaXBXaWR0aCA9ICR3cmFwcGVyLndpZHRoKCk7XG4gICAgY29uc3Qgc2Nyb2xsTGVmdCA9ICR3cmFwcGVyLnNjcm9sbExlZnQoKTtcblxuICAgICQoJHdyYXBwZXIuY2hpbGRyZW4oJ2J1dHRvbicpLmdldCgpLnJldmVyc2UoKSkuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgIGNvbnN0IGxlZnQgPSAkKHRoaXMpLnBvc2l0aW9uKCkubGVmdDtcbiAgICAgIGNvbnN0IHJpZ2h0ID0gbGVmdCArICQodGhpcykub3V0ZXJXaWR0aCgpO1xuICAgICAgaWYgKDAgPiBsZWZ0KSB7XG4gICAgICAgICR3cmFwcGVyLnNjcm9sbExlZnQoc2Nyb2xsTGVmdCArIHJpZ2h0IC0gY2xpcFdpZHRoKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcblxuICAkKCcuZmlsZXNfYmFyID4gLmJ0bi1yaWdodCcpLmNsaWNrKCgpID0+IHtcbiAgICBjb25zdCAkd3JhcHBlciA9ICQoJy5maWxlc19iYXIgPiAud3JhcHBlcicpO1xuICAgIGNvbnN0IGNsaXBXaWR0aCA9ICR3cmFwcGVyLndpZHRoKCk7XG4gICAgY29uc3Qgc2Nyb2xsTGVmdCA9ICR3cmFwcGVyLnNjcm9sbExlZnQoKTtcblxuICAgICR3cmFwcGVyLmNoaWxkcmVuKCdidXR0b24nKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgY29uc3QgbGVmdCA9ICQodGhpcykucG9zaXRpb24oKS5sZWZ0O1xuICAgICAgY29uc3QgcmlnaHQgPSBsZWZ0ICsgJCh0aGlzKS5vdXRlcldpZHRoKCk7XG4gICAgICBpZiAoY2xpcFdpZHRoIDwgcmlnaHQpIHtcbiAgICAgICAgJHdyYXBwZXIuc2Nyb2xsTGVmdChzY3JvbGxMZWZ0ICsgbGVmdCk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG5cbiAgJCgnLmZpbGVzX2JhciA+IC53cmFwcGVyJykuc2Nyb2xsKGZ1bmN0aW9uKCkge1xuXG4gICAgY29uc3QgJHdyYXBwZXIgPSAkKCcuZmlsZXNfYmFyID4gLndyYXBwZXInKTtcbiAgICBjb25zdCBjbGlwV2lkdGggPSAkd3JhcHBlci53aWR0aCgpO1xuICAgIGNvbnN0ICRsZWZ0ID0gJHdyYXBwZXIuY2hpbGRyZW4oJ2J1dHRvbjpmaXJzdC1jaGlsZCcpO1xuICAgIGNvbnN0ICRyaWdodCA9ICR3cmFwcGVyLmNoaWxkcmVuKCdidXR0b246bGFzdC1jaGlsZCcpO1xuICAgIGNvbnN0IGxlZnQgPSAkbGVmdC5wb3NpdGlvbigpLmxlZnQ7XG4gICAgY29uc3QgcmlnaHQgPSAkcmlnaHQucG9zaXRpb24oKS5sZWZ0ICsgJHJpZ2h0Lm91dGVyV2lkdGgoKTtcblxuICAgIGlmIChkZWZpbml0ZWx5QmlnZ2VyKDAsIGxlZnQpICYmIGRlZmluaXRlbHlCaWdnZXIoY2xpcFdpZHRoLCByaWdodCkpIHtcbiAgICAgIGNvbnN0IHNjcm9sbExlZnQgPSAkd3JhcHBlci5zY3JvbGxMZWZ0KCk7XG4gICAgICAkd3JhcHBlci5zY3JvbGxMZWZ0KHNjcm9sbExlZnQgKyBjbGlwV2lkdGggLSByaWdodCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgbGVmdGVyID0gZGVmaW5pdGVseUJpZ2dlcigwLCBsZWZ0KTtcbiAgICBjb25zdCByaWdodGVyID0gZGVmaW5pdGVseUJpZ2dlcihyaWdodCwgY2xpcFdpZHRoKTtcbiAgICAkd3JhcHBlci50b2dnbGVDbGFzcygnc2hhZG93LWxlZnQnLCBsZWZ0ZXIpO1xuICAgICR3cmFwcGVyLnRvZ2dsZUNsYXNzKCdzaGFkb3ctcmlnaHQnLCByaWdodGVyKTtcbiAgICAkKCcuZmlsZXNfYmFyID4gLmJ0bi1sZWZ0JykuYXR0cignZGlzYWJsZWQnLCAhbGVmdGVyKTtcbiAgICAkKCcuZmlsZXNfYmFyID4gLmJ0bi1yaWdodCcpLmF0dHIoJ2Rpc2FibGVkJywgIXJpZ2h0ZXIpO1xuICB9KTtcbn0iLCJjb25zdCBhcHAgPSByZXF1aXJlKCcuLi8uLi9hcHAnKTtcbmNvbnN0IFRvYXN0ID0gcmVxdWlyZSgnLi4vdG9hc3QnKTtcblxuY29uc3Qge1xuICBwYXJzZUZsb2F0XG59ID0gTnVtYmVyO1xuXG5jb25zdCBtaW5JbnRlcnZhbCA9IDAuMTtcbmNvbnN0IG1heEludGVydmFsID0gMTA7XG5jb25zdCBzdGFydEludGVydmFsID0gMC41O1xuY29uc3Qgc3RlcEludGVydmFsID0gMC4xO1xuXG5jb25zdCBub3JtYWxpemUgPSAoc2VjKSA9PiB7XG5cblxuICBsZXQgaW50ZXJ2YWw7XG4gIGxldCBtZXNzYWdlO1xuICBpZiAoc2VjIDwgbWluSW50ZXJ2YWwpIHtcbiAgICBpbnRlcnZhbCA9IG1pbkludGVydmFsO1xuICAgIG1lc3NhZ2UgPSBgSW50ZXJ2YWwgb2YgJHtzZWN9IHNlY29uZHMgaXMgdG9vIGxvdy4gU2V0dGluZyB0byBtaW4gYWxsb3dlZCBpbnRlcnZhbCBvZiAke21pbkludGVydmFsfSBzZWNvbmQocykuYDtcbiAgfSBlbHNlIGlmIChzZWMgPiBtYXhJbnRlcnZhbCkge1xuICAgIGludGVydmFsID0gbWF4SW50ZXJ2YWw7XG4gICAgbWVzc2FnZSA9IGBJbnRlcnZhbCBvZiAke3NlY30gc2Vjb25kcyBpcyB0b28gaGlnaC4gU2V0dGluZyB0byBtYXggYWxsb3dlZCBpbnRlcnZhbCBvZiAke21heEludGVydmFsfSBzZWNvbmQocykuYDtcbiAgfSBlbHNlIHtcbiAgICBpbnRlcnZhbCA9IHNlYztcbiAgICBtZXNzYWdlID0gYEludGVydmFsIGhhcyBiZWVuIHNldCB0byAke3NlY30gc2Vjb25kKHMpLmBcbiAgfVxuXG4gIHJldHVybiBbaW50ZXJ2YWwsIG1lc3NhZ2VdO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSAoKSA9PiB7XG5cbiAgY29uc3QgJGludGVydmFsID0gJCgnI2ludGVydmFsJyk7XG4gICRpbnRlcnZhbC52YWwoc3RhcnRJbnRlcnZhbCk7XG4gICRpbnRlcnZhbC5hdHRyKHtcbiAgICBtYXg6IG1heEludGVydmFsLFxuICAgIG1pbjogbWluSW50ZXJ2YWwsXG4gICAgc3RlcDogc3RlcEludGVydmFsXG4gIH0pO1xuXG4gICQoJyNpbnRlcnZhbCcpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcbiAgICBjb25zdCB0cmFjZXJNYW5hZ2VyID0gYXBwLmdldFRyYWNlck1hbmFnZXIoKTtcbiAgICBjb25zdCBbc2Vjb25kcywgbWVzc2FnZV0gPSBub3JtYWxpemUocGFyc2VGbG9hdCgkKHRoaXMpLnZhbCgpKSk7XG5cbiAgICAkKHRoaXMpLnZhbChzZWNvbmRzKTtcbiAgICB0cmFjZXJNYW5hZ2VyLmludGVydmFsID0gc2Vjb25kcyAqIDEwMDA7XG4gICAgVG9hc3Quc2hvd0luZm9Ub2FzdChtZXNzYWdlKTtcbiAgfSk7XG59OyIsImNvbnN0IGFwcCA9IHJlcXVpcmUoJy4uLy4uL2FwcCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9ICgpID0+IHtcblxuICBjb25zdCAkbW9kdWxlX2NvbnRhaW5lciA9ICQoJy5tb2R1bGVfY29udGFpbmVyJyk7XG5cbiAgJG1vZHVsZV9jb250YWluZXIub24oJ21vdXNlZG93bicsICcubW9kdWxlX3dyYXBwZXInLCBmdW5jdGlvbihlKSB7XG4gICAgYXBwLmdldFRyYWNlck1hbmFnZXIoKS5maW5kT3duZXIodGhpcykubW91c2Vkb3duKGUpO1xuICB9KTtcblxuICAkbW9kdWxlX2NvbnRhaW5lci5vbignbW91c2Vtb3ZlJywgJy5tb2R1bGVfd3JhcHBlcicsIGZ1bmN0aW9uKGUpIHtcbiAgICBhcHAuZ2V0VHJhY2VyTWFuYWdlcigpLmZpbmRPd25lcih0aGlzKS5tb3VzZW1vdmUoZSk7XG4gIH0pO1xuXG4gICRtb2R1bGVfY29udGFpbmVyLm9uKCdET01Nb3VzZVNjcm9sbCBtb3VzZXdoZWVsJywgJy5tb2R1bGVfd3JhcHBlcicsIGZ1bmN0aW9uKGUpIHtcbiAgICBhcHAuZ2V0VHJhY2VyTWFuYWdlcigpLmZpbmRPd25lcih0aGlzKS5tb3VzZXdoZWVsKGUpO1xuICB9KTtcbn0iLCJtb2R1bGUuZXhwb3J0cyA9ICgpID0+IHtcbiAgJCgnI3Bvd2VyZWQtYnknKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICAkKCcjcG93ZXJlZC1ieS1saXN0IGJ1dHRvbicpLnRvZ2dsZUNsYXNzKCdjb2xsYXBzZScpO1xuICB9KTtcbn07IiwiY29uc3QgYXBwID0gcmVxdWlyZSgnLi4vLi4vYXBwJyk7XG5jb25zdCBTZXJ2ZXIgPSByZXF1aXJlKCcuLi8uLi9zZXJ2ZXInKTtcbmNvbnN0IHNob3dBbGdvcml0aG0gPSByZXF1aXJlKCcuLi9zaG93X2FsZ29yaXRobScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9ICgpID0+IHtcbiAgJCgnI3NjcmF0Y2gtcGFwZXInKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICBjb25zdCBjYXRlZ29yeSA9ICdzY3JhdGNoJztcbiAgICBjb25zdCBhbGdvcml0aG0gPSBhcHAuZ2V0TG9hZGVkU2NyYXRjaCgpO1xuICAgIFNlcnZlci5sb2FkQWxnb3JpdGhtKGNhdGVnb3J5LCBhbGdvcml0aG0pLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgIHNob3dBbGdvcml0aG0oY2F0ZWdvcnksIGFsZ29yaXRobSwgZGF0YSk7XG4gICAgfSk7XG4gIH0pO1xufTsiLCJjb25zdCBhcHAgPSByZXF1aXJlKCcuLi8uLi9hcHAnKTtcblxubGV0IHNpZGVtZW51X3BlcmNlbnQ7XG5cbm1vZHVsZS5leHBvcnRzID0gKCkgPT4ge1xuICAkKCcjbmF2aWdhdGlvbicpLmNsaWNrKCgpID0+IHtcbiAgICBjb25zdCAkc2lkZW1lbnUgPSAkKCcuc2lkZW1lbnUnKTtcbiAgICBjb25zdCAkd29ya3NwYWNlID0gJCgnLndvcmtzcGFjZScpO1xuXG4gICAgJHNpZGVtZW51LnRvZ2dsZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAkKCcubmF2LWRyb3Bkb3duJykudG9nZ2xlQ2xhc3MoJ2ZhLWNhcmV0LWRvd24gZmEtY2FyZXQtdXAnKTtcblxuICAgIGlmICgkc2lkZW1lbnUuaGFzQ2xhc3MoJ2FjdGl2ZScpKSB7XG4gICAgICAkc2lkZW1lbnUuY3NzKCdyaWdodCcsICgxMDAgLSBzaWRlbWVudV9wZXJjZW50KSArICclJyk7XG4gICAgICAkd29ya3NwYWNlLmNzcygnbGVmdCcsIHNpZGVtZW51X3BlcmNlbnQgKyAnJScpO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgIHNpZGVtZW51X3BlcmNlbnQgPSAkd29ya3NwYWNlLnBvc2l0aW9uKCkubGVmdCAvICQoJ2JvZHknKS53aWR0aCgpICogMTAwO1xuICAgICAgJHNpZGVtZW51LmNzcygncmlnaHQnLCAwKTtcbiAgICAgICR3b3Jrc3BhY2UuY3NzKCdsZWZ0JywgMCk7XG4gICAgfVxuXG4gICAgYXBwLmdldFRyYWNlck1hbmFnZXIoKS5yZXNpemUoKTtcbiAgfSk7XG59IiwiY29uc3QgYXBwID0gcmVxdWlyZSgnLi4vLi4vYXBwJyk7XG5jb25zdCBTZXJ2ZXIgPSByZXF1aXJlKCcuLi8uLi9zZXJ2ZXInKTtcbmNvbnN0IFRvYXN0ID0gcmVxdWlyZSgnLi4vdG9hc3QnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoKSA9PiB7XG5cbiAgLy8gc2hhcmVkXG4gICQoJyNzaGFyZWQnKS5tb3VzZXVwKGZ1bmN0aW9uKCkge1xuICAgICQodGhpcykuc2VsZWN0KCk7XG4gIH0pO1xuXG4gICQoJyNidG5fc2hhcmUnKS5jbGljayhmdW5jdGlvbigpIHtcblxuICAgIGNvbnN0ICRpY29uID0gJCh0aGlzKS5maW5kKCcuZmEtc2hhcmUnKTtcbiAgICAkaWNvbi5hZGRDbGFzcygnZmEtc3BpbiBmYS1zcGluLWZhc3RlcicpO1xuXG4gICAgU2VydmVyLnNoYXJlU2NyYXRjaFBhcGVyKCkudGhlbigodXJsKSA9PiB7XG4gICAgICAkaWNvbi5yZW1vdmVDbGFzcygnZmEtc3BpbiBmYS1zcGluLWZhc3RlcicpO1xuICAgICAgJCgnI3NoYXJlZCcpLnJlbW92ZUNsYXNzKCdjb2xsYXBzZScpO1xuICAgICAgJCgnI3NoYXJlZCcpLnZhbCh1cmwpO1xuICAgICAgVG9hc3Quc2hvd0luZm9Ub2FzdCgnU2hhcmVhYmxlIGxpbmsgaXMgY3JlYXRlZC4nKTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgLy8gY29udHJvbFxuXG4gICQoJyNidG5fcnVuJykuY2xpY2soKCkgPT4ge1xuICAgICQoJyNidG5fdHJhY2UnKS5jbGljaygpO1xuICAgIHZhciBlcnIgPSBhcHAuZ2V0RWRpdG9yKCkuZXhlY3V0ZSgpO1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgIFRvYXN0LnNob3dFcnJvclRvYXN0KGVycik7XG4gICAgfVxuICB9KTtcbiAgJCgnI2J0bl9wYXVzZScpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgIGlmIChhcHAuZ2V0VHJhY2VyTWFuYWdlcigpLmlzUGF1c2UoKSkge1xuICAgICAgYXBwLmdldFRyYWNlck1hbmFnZXIoKS5yZXN1bWVTdGVwKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFwcC5nZXRUcmFjZXJNYW5hZ2VyKCkucGF1c2VTdGVwKCk7XG4gICAgfVxuICB9KTtcbiAgJCgnI2J0bl9wcmV2JykuY2xpY2soKCkgPT4ge1xuICAgIGFwcC5nZXRUcmFjZXJNYW5hZ2VyKCkucGF1c2VTdGVwKCk7XG4gICAgYXBwLmdldFRyYWNlck1hbmFnZXIoKS5wcmV2U3RlcCgpO1xuICB9KTtcbiAgJCgnI2J0bl9uZXh0JykuY2xpY2soKCkgPT4ge1xuICAgIGFwcC5nZXRUcmFjZXJNYW5hZ2VyKCkucGF1c2VTdGVwKCk7XG4gICAgYXBwLmdldFRyYWNlck1hbmFnZXIoKS5uZXh0U3RlcCgpO1xuICB9KTtcblxuICAvLyBkZXNjcmlwdGlvbiAmIHRyYWNlXG5cbiAgJCgnI2J0bl9kZXNjJykuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgJCgnLnRhYl9jb250YWluZXIgPiAudGFiJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICQoJyN0YWJfZGVzYycpLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICAkKCcudGFiX2JhciA+IGJ1dHRvbicpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAkKHRoaXMpLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgfSk7XG5cbiAgJCgnI2J0bl90cmFjZScpLmNsaWNrKGZ1bmN0aW9uKCkge1xuICAgICQoJy50YWJfY29udGFpbmVyID4gLnRhYicpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAkKCcjdGFiX21vZHVsZScpLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICAkKCcudGFiX2JhciA+IGJ1dHRvbicpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAkKHRoaXMpLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgfSk7XG5cbn07IiwiY29uc3QgYXBwID0gcmVxdWlyZSgnLi4vLi4vYXBwJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICQod2luZG93KS5yZXNpemUoZnVuY3Rpb24oKSB7XG4gICAgYXBwLmdldFRyYWNlck1hbmFnZXIoKS5yZXNpemUoKTtcbiAgfSk7XG59OyIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgYXBwID0gcmVxdWlyZSgnLi4vYXBwJyk7XG5cbmNvbnN0IHtcbiAgaXNTY3JhdGNoUGFwZXJcbn0gPSByZXF1aXJlKCcuLi91dGlscycpO1xuXG5jb25zdCBzaG93RGVzY3JpcHRpb24gPSByZXF1aXJlKCcuL3Nob3dfZGVzY3JpcHRpb24nKTtcbmNvbnN0IGFkZEZpbGVzID0gcmVxdWlyZSgnLi9hZGRfZmlsZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoY2F0ZWdvcnksIGFsZ29yaXRobSwgZGF0YSwgcmVxdWVzdGVkRmlsZSkgPT4ge1xuICBsZXQgJG1lbnU7XG4gIGxldCBjYXRlZ29yeV9uYW1lO1xuICBsZXQgYWxnb3JpdGhtX25hbWU7XG5cbiAgaWYgKGlzU2NyYXRjaFBhcGVyKGNhdGVnb3J5KSkge1xuICAgICRtZW51ID0gJCgnI3NjcmF0Y2gtcGFwZXInKTtcbiAgICBjYXRlZ29yeV9uYW1lID0gJ1NjcmF0Y2ggUGFwZXInO1xuICAgIGFsZ29yaXRobV9uYW1lID0gYWxnb3JpdGhtID8gJ1NoYXJlZCcgOiAnVGVtcG9yYXJ5JztcbiAgfSBlbHNlIHtcbiAgICAkbWVudSA9ICQoYFtkYXRhLWNhdGVnb3J5PVwiJHtjYXRlZ29yeX1cIl1bZGF0YS1hbGdvcml0aG09XCIke2FsZ29yaXRobX1cIl1gKTtcbiAgICBjb25zdCBjYXRlZ29yeU9iaiA9IGFwcC5nZXRDYXRlZ29yeShjYXRlZ29yeSk7XG4gICAgY2F0ZWdvcnlfbmFtZSA9IGNhdGVnb3J5T2JqLm5hbWU7XG4gICAgYWxnb3JpdGhtX25hbWUgPSBjYXRlZ29yeU9iai5saXN0W2FsZ29yaXRobV07XG4gIH1cblxuICAkKCcuc2lkZW1lbnUgYnV0dG9uJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAkbWVudS5hZGRDbGFzcygnYWN0aXZlJyk7XG5cbiAgJCgnI2NhdGVnb3J5JykuaHRtbChjYXRlZ29yeV9uYW1lKTtcbiAgJCgnI2FsZ29yaXRobScpLmh0bWwoYWxnb3JpdGhtX25hbWUpO1xuICAkKCcjdGFiX2Rlc2MgPiAud3JhcHBlcicpLmVtcHR5KCk7XG4gICQoJy5maWxlc19iYXIgPiAud3JhcHBlcicpLmVtcHR5KCk7XG4gICQoJyNleHBsYW5hdGlvbicpLmh0bWwoJycpO1xuXG4gIGFwcC5zZXRMYXN0RmlsZVVzZWQobnVsbCk7XG4gIGFwcC5nZXRFZGl0b3IoKS5jbGVhckNvbnRlbnQoKTtcblxuICBjb25zdCB7XG4gICAgZmlsZXNcbiAgfSA9IGRhdGE7XG5cbiAgZGVsZXRlIGRhdGEuZmlsZXM7XG5cbiAgc2hvd0Rlc2NyaXB0aW9uKGRhdGEpO1xuICBhZGRGaWxlcyhjYXRlZ29yeSwgYWxnb3JpdGhtLCBmaWxlcywgcmVxdWVzdGVkRmlsZSk7XG59OyIsIid1c2Ugc3RyaWN0JztcblxuY29uc3Qge1xuICBpc0FycmF5XG59ID0gQXJyYXk7XG5cbmNvbnN0IHtcbiAgZWFjaFxufSA9ICQ7XG5cbm1vZHVsZS5leHBvcnRzID0gKGRhdGEpID0+IHtcbiAgY29uc3QgJGNvbnRhaW5lciA9ICQoJyN0YWJfZGVzYyA+IC53cmFwcGVyJyk7XG4gICRjb250YWluZXIuZW1wdHkoKTtcblxuICBlYWNoKGRhdGEsIChrZXksIHZhbHVlKSA9PiB7XG5cbiAgICBpZiAoa2V5KSB7XG4gICAgICAkY29udGFpbmVyLmFwcGVuZCgkKCc8aDM+JykuaHRtbChrZXkpKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgJGNvbnRhaW5lci5hcHBlbmQoJCgnPHA+JykuaHRtbCh2YWx1ZSkpO1xuXG4gICAgfSBlbHNlIGlmIChpc0FycmF5KHZhbHVlKSkge1xuXG4gICAgICBjb25zdCAkdWwgPSAkKCc8dWw+Jyk7XG4gICAgICAkY29udGFpbmVyLmFwcGVuZCgkdWwpO1xuXG4gICAgICB2YWx1ZS5mb3JFYWNoKChsaSkgPT4ge1xuICAgICAgICAkdWwuYXBwZW5kKCQoJzxsaT4nKS5odG1sKGxpKSk7XG4gICAgICB9KTtcblxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuXG4gICAgICBjb25zdCAkdWwgPSAkKCc8dWw+Jyk7XG4gICAgICAkY29udGFpbmVyLmFwcGVuZCgkdWwpO1xuXG4gICAgICBlYWNoKHZhbHVlLCAocHJvcCkgPT4ge1xuICAgICAgICAkdWwuYXBwZW5kKCQoJzxsaT4nKS5hcHBlbmQoJCgnPHN0cm9uZz4nKS5odG1sKHByb3ApKS5hcHBlbmQoYCAke3ZhbHVlW3Byb3BdfWApKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG59OyIsIid1c2Ugc3RyaWN0JztcblxuLy8gY2xpY2sgdGhlIGZpcnN0IGFsZ29yaXRobSBpbiB0aGUgZmlyc3QgY2F0ZWdvcnlcbm1vZHVsZS5leHBvcnRzID0gKCkgPT4ge1xuICAkKCcjbGlzdCBidXR0b24uY2F0ZWdvcnknKS5maXJzdCgpLmNsaWNrKCk7XG4gICQoJyNsaXN0IGJ1dHRvbi5jYXRlZ29yeSArIC5pbmRlbnQnKS5maXJzdCgpLmNsaWNrKCk7XG59OyIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgU2VydmVyID0gcmVxdWlyZSgnLi4vc2VydmVyJyk7XG5jb25zdCBzaG93QWxnb3JpdGhtID0gcmVxdWlyZSgnLi9zaG93X2FsZ29yaXRobScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IChjYXRlZ29yeSwgYWxnb3JpdGhtLCBmaWxlKSA9PiB7XG4gICQoYC5jYXRlZ29yeVtkYXRhLWNhdGVnb3J5PVwiJHtjYXRlZ29yeX1cIl1gKS5jbGljaygpO1xuICBTZXJ2ZXIubG9hZEFsZ29yaXRobShjYXRlZ29yeSwgYWxnb3JpdGhtKS50aGVuKChkYXRhKSA9PiB7XG4gICAgc2hvd0FsZ29yaXRobShjYXRlZ29yeSwgYWxnb3JpdGhtLCBkYXRhLCBmaWxlKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBzaG93VG9hc3QgPSAoZGF0YSwgdHlwZSkgPT4ge1xuICBjb25zdCAkdG9hc3QgPSAkKGA8ZGl2IGNsYXNzPVwidG9hc3QgJHt0eXBlfVwiPmApLmFwcGVuZChkYXRhKTtcblxuICAkKCcudG9hc3RfY29udGFpbmVyJykuYXBwZW5kKCR0b2FzdCk7XG4gIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICR0b2FzdC5mYWRlT3V0KCgpID0+IHtcbiAgICAgICR0b2FzdC5yZW1vdmUoKTtcbiAgICB9KTtcbiAgfSwgMzAwMCk7XG59O1xuXG5jb25zdCBzaG93RXJyb3JUb2FzdCA9IChlcnIpID0+IHtcbiAgc2hvd1RvYXN0KGVyciwgJ2Vycm9yJyk7XG59O1xuXG5jb25zdCBzaG93SW5mb1RvYXN0ID0gKGVycikgPT4ge1xuICBzaG93VG9hc3QoZXJyLCAnaW5mbycpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHNob3dFcnJvclRvYXN0LFxuICBzaG93SW5mb1RvYXN0XG59OyIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpZCkge1xuICBjb25zdCBlZGl0b3IgPSBhY2UuZWRpdChpZCk7XG5cbiAgZWRpdG9yLnNldE9wdGlvbnMoe1xuICAgIGVuYWJsZUJhc2ljQXV0b2NvbXBsZXRpb246IHRydWUsXG4gICAgZW5hYmxlU25pcHBldHM6IHRydWUsXG4gICAgZW5hYmxlTGl2ZUF1dG9jb21wbGV0aW9uOiB0cnVlXG4gIH0pO1xuXG4gIGVkaXRvci5zZXRUaGVtZSgnYWNlL3RoZW1lL3RvbW9ycm93X25pZ2h0X2VpZ2h0aWVzJyk7XG4gIGVkaXRvci5zZXNzaW9uLnNldE1vZGUoJ2FjZS9tb2RlL2phdmFzY3JpcHQnKTtcbiAgZWRpdG9yLiRibG9ja1Njcm9sbGluZyA9IEluZmluaXR5O1xuXG4gIHJldHVybiBlZGl0b3I7XG59OyIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgZXhlY3V0ZSA9ICh0cmFjZXJNYW5hZ2VyLCBjb2RlKSA9PiB7XG4gIC8vIGFsbCBtb2R1bGVzIGF2YWlsYWJsZSB0byBldmFsIGFyZSBvYnRhaW5lZCBmcm9tIHdpbmRvd1xuICB0cnkge1xuICAgIHRyYWNlck1hbmFnZXIuZGVhbGxvY2F0ZUFsbCgpO1xuICAgIGV2YWwoY29kZSk7XG4gICAgdHJhY2VyTWFuYWdlci52aXN1YWxpemUoKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmV0dXJuIGVycjtcbiAgfSBmaW5hbGx5IHtcbiAgICB0cmFjZXJNYW5hZ2VyLnJlbW92ZVVuYWxsb2NhdGVkKCk7XG4gIH1cbn07XG5cbmNvbnN0IGV4ZWN1dGVEYXRhID0gKHRyYWNlck1hbmFnZXIsIGFsZ29EYXRhKSA9PiB7XG4gIHJldHVybiBleGVjdXRlKHRyYWNlck1hbmFnZXIsIGFsZ29EYXRhKTtcbn07XG5cbmNvbnN0IGV4ZWN1dGVEYXRhQW5kQ29kZSA9ICh0cmFjZXJNYW5hZ2VyLCBhbGdvRGF0YSwgYWxnb0NvZGUpID0+IHtcbiAgcmV0dXJuIGV4ZWN1dGUodHJhY2VyTWFuYWdlciwgYCR7YWxnb0RhdGF9OyR7YWxnb0NvZGV9YCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgZXhlY3V0ZURhdGEsXG4gIGV4ZWN1dGVEYXRhQW5kQ29kZVxufTsiLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IGFwcCA9IHJlcXVpcmUoJy4uL2FwcCcpO1xuY29uc3QgY3JlYXRlRWRpdG9yID0gcmVxdWlyZSgnLi9jcmVhdGUnKTtcbmNvbnN0IEV4ZWN1dG9yID0gcmVxdWlyZSgnLi9leGVjdXRvcicpO1xuXG5mdW5jdGlvbiBFZGl0b3IodHJhY2VyTWFuYWdlcikge1xuICBpZiAoIXRyYWNlck1hbmFnZXIpIHtcbiAgICB0aHJvdyAnQ2Fubm90IGNyZWF0ZSBFZGl0b3IuIE1pc3NpbmcgdGhlIHRyYWNlck1hbmFnZXInO1xuICB9XG5cbiAgYWNlLnJlcXVpcmUoJ2FjZS9leHQvbGFuZ3VhZ2VfdG9vbHMnKTtcblxuICB0aGlzLmRhdGFFZGl0b3IgPSBjcmVhdGVFZGl0b3IoJ2RhdGEnKTtcbiAgdGhpcy5jb2RlRWRpdG9yID0gY3JlYXRlRWRpdG9yKCdjb2RlJyk7XG5cbiAgLy8gU2V0dGluZyBkYXRhXG5cbiAgdGhpcy5zZXREYXRhID0gKGRhdGEpID0+IHtcbiAgICB0aGlzLmRhdGFFZGl0b3Iuc2V0VmFsdWUoZGF0YSwgLTEpO1xuICB9O1xuXG4gIHRoaXMuc2V0Q29kZSA9IChjb2RlKSA9PiB7XG4gICAgdGhpcy5jb2RlRWRpdG9yLnNldFZhbHVlKGNvZGUsIC0xKTtcbiAgfTtcblxuICB0aGlzLnNldENvbnRlbnQgPSAoKHtcbiAgICBkYXRhLFxuICAgIGNvZGVcbiAgfSkgPT4ge1xuICAgIHRoaXMuc2V0RGF0YShkYXRhKTtcbiAgICB0aGlzLnNldENvZGUoY29kZSk7XG4gIH0pO1xuXG4gIC8vIENsZWFyaW5nIGRhdGFcblxuICB0aGlzLmNsZWFyRGF0YSA9ICgpID0+IHtcbiAgICB0aGlzLmRhdGFFZGl0b3Iuc2V0VmFsdWUoJycpO1xuICB9O1xuXG4gIHRoaXMuY2xlYXJDb2RlID0gKCkgPT4ge1xuICAgIHRoaXMuY29kZUVkaXRvci5zZXRWYWx1ZSgnJyk7XG4gIH07XG5cbiAgdGhpcy5jbGVhckNvbnRlbnQgPSAoKSA9PiB7XG4gICAgdGhpcy5jbGVhckRhdGEoKTtcbiAgICB0aGlzLmNsZWFyQ29kZSgpO1xuICB9O1xuXG4gIHRoaXMuZXhlY3V0ZSA9ICgpID0+IHtcbiAgICBjb25zdCBkYXRhID0gdGhpcy5kYXRhRWRpdG9yLmdldFZhbHVlKCk7XG4gICAgY29uc3QgY29kZSA9IHRoaXMuY29kZUVkaXRvci5nZXRWYWx1ZSgpO1xuICAgIHJldHVybiBFeGVjdXRvci5leGVjdXRlRGF0YUFuZENvZGUodHJhY2VyTWFuYWdlciwgZGF0YSwgY29kZSk7XG4gIH07XG5cbiAgLy8gbGlzdGVuZXJzXG5cbiAgdGhpcy5kYXRhRWRpdG9yLm9uKCdjaGFuZ2UnLCAoKSA9PiB7XG4gICAgY29uc3QgZGF0YSA9IHRoaXMuZGF0YUVkaXRvci5nZXRWYWx1ZSgpO1xuICAgIGNvbnN0IGxhc3RGaWxlVXNlZCA9IGFwcC5nZXRMYXN0RmlsZVVzZWQoKTtcbiAgICBpZiAobGFzdEZpbGVVc2VkKSB7XG4gICAgICBhcHAudXBkYXRlQ2FjaGVkRmlsZShsYXN0RmlsZVVzZWQsIHtcbiAgICAgICAgZGF0YVxuICAgICAgfSk7XG4gICAgfVxuICAgIEV4ZWN1dG9yLmV4ZWN1dGVEYXRhKHRyYWNlck1hbmFnZXIsIGRhdGEpO1xuICB9KTtcblxuICB0aGlzLmNvZGVFZGl0b3Iub24oJ2NoYW5nZScsICgpID0+IHtcbiAgICBjb25zdCBjb2RlID0gdGhpcy5jb2RlRWRpdG9yLmdldFZhbHVlKCk7XG4gICAgY29uc3QgbGFzdEZpbGVVc2VkID0gYXBwLmdldExhc3RGaWxlVXNlZCgpO1xuICAgIGlmIChsYXN0RmlsZVVzZWQpIHtcbiAgICAgIGFwcC51cGRhdGVDYWNoZWRGaWxlKGxhc3RGaWxlVXNlZCwge1xuICAgICAgICBjb2RlXG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBFZGl0b3I7IiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBSU1ZQID0gcmVxdWlyZSgncnN2cCcpO1xuY29uc3QgYXBwID0gcmVxdWlyZSgnLi9hcHAnKTtcbmNvbnN0IEFwcENvbnN0cnVjdG9yID0gcmVxdWlyZSgnLi9hcHAvY29uc3RydWN0b3InKTtcbmNvbnN0IERPTSA9IHJlcXVpcmUoJy4vZG9tJyk7XG5jb25zdCBTZXJ2ZXIgPSByZXF1aXJlKCcuL3NlcnZlcicpO1xuXG5jb25zdCBtb2R1bGVzID0gcmVxdWlyZSgnLi9tb2R1bGUnKTtcblxuY29uc3Qge1xuICBleHRlbmRcbn0gPSAkO1xuXG4kLmFqYXhTZXR1cCh7XG4gIGNhY2hlOiBmYWxzZSxcbiAgZGF0YVR5cGU6ICd0ZXh0J1xufSk7XG5cbmNvbnN0IHtcbiAgaXNTY3JhdGNoUGFwZXJcbn0gPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5cbmNvbnN0IHtcbiAgZ2V0UGF0aFxufSA9IHJlcXVpcmUoJy4vc2VydmVyL2hlbHBlcnMnKTtcblxuLy8gc2V0IGdsb2JhbCBwcm9taXNlIGVycm9yIGhhbmRsZXJcblJTVlAub24oJ2Vycm9yJywgZnVuY3Rpb24gKHJlYXNvbikge1xuICBjb25zb2xlLmFzc2VydChmYWxzZSwgcmVhc29uKTtcbn0pO1xuXG4kKCgpID0+IHtcblxuICAvLyBpbml0aWFsaXplIHRoZSBhcHBsaWNhdGlvbiBhbmQgYXR0YWNoIGluIHRvIHRoZSBpbnN0YW5jZSBtb2R1bGVcbiAgY29uc3QgYXBwQ29uc3RydWN0b3IgPSBuZXcgQXBwQ29uc3RydWN0b3IoKTtcbiAgZXh0ZW5kKHRydWUsIGFwcCwgYXBwQ29uc3RydWN0b3IpO1xuXG4gIC8vIGxvYWQgbW9kdWxlcyB0byB0aGUgZ2xvYmFsIHNjb3BlIHNvIHRoZXkgY2FuIGJlIGV2YWxlZFxuICBleHRlbmQodHJ1ZSwgd2luZG93LCBtb2R1bGVzKTtcblxuICBTZXJ2ZXIubG9hZENhdGVnb3JpZXMoKS50aGVuKChkYXRhKSA9PiB7XG4gICAgYXBwLnNldENhdGVnb3JpZXMoZGF0YSk7XG4gICAgRE9NLmFkZENhdGVnb3JpZXMoKTtcblxuICAgIC8vIGRldGVybWluZSBpZiB0aGUgYXBwIGlzIGxvYWRpbmcgYSBwcmUtZXhpc3Rpbmcgc2NyYXRjaC1wYWRcbiAgICAvLyBvciB0aGUgaG9tZSBwYWdlXG4gICAgY29uc3Qge1xuICAgICAgY2F0ZWdvcnksXG4gICAgICBhbGdvcml0aG0sXG4gICAgICBmaWxlXG4gICAgfSA9IGdldFBhdGgoKTtcbiAgICBpZiAoaXNTY3JhdGNoUGFwZXIoY2F0ZWdvcnkpKSB7XG4gICAgICBpZiAoYWxnb3JpdGhtKSB7XG4gICAgICAgIFNlcnZlci5sb2FkU2NyYXRjaFBhcGVyKGFsZ29yaXRobSkudGhlbigoe2NhdGVnb3J5LCBhbGdvcml0aG0sIGRhdGF9KSA9PiB7XG4gICAgICAgICAgRE9NLnNob3dBbGdvcml0aG0oY2F0ZWdvcnksIGFsZ29yaXRobSwgZGF0YSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgU2VydmVyLmxvYWRBbGdvcml0aG0oY2F0ZWdvcnkpLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgICBET00uc2hvd0FsZ29yaXRobShjYXRlZ29yeSwgbnVsbCwgZGF0YSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoY2F0ZWdvcnkgJiYgYWxnb3JpdGhtKSB7XG4gICAgICBET00uc2hvd1JlcXVlc3RlZEFsZ29yaXRobShjYXRlZ29yeSwgYWxnb3JpdGhtLCBmaWxlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgRE9NLnNob3dGaXJzdEFsZ29yaXRobSgpO1xuICAgIH1cblxuICB9KTtcbn0pOyIsImNvbnN0IEFycmF5MkQgPSByZXF1aXJlKCcuL2FycmF5MmQnKTtcblxuY29uc3QgcmFuZG9tID0gKE4sIG1pbiwgbWF4KSA9PiB7XG4gIHJldHVybiBBcnJheTJELnJhbmRvbSgxLCBOLCBtaW4sIG1heClbMF07XG59O1xuXG5jb25zdCByYW5kb21Tb3J0ZWQgPSAoTiwgbWluLCBtYXgpPT4ge1xuICByZXR1cm4gQXJyYXkyRC5yYW5kb21Tb3J0ZWQoMSwgTiwgbWluLCBtYXgpWzBdO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHJhbmRvbSxcbiAgcmFuZG9tU29ydGVkXG59O1xuIiwiY29uc3QgcmFuZG9tID0gKE4sIE0sIG1pbiwgbWF4KSA9PiB7XG4gIGlmICghTikgTiA9IDEwO1xuICBpZiAoIU0pIE0gPSAxMDtcbiAgaWYgKG1pbiA9PT0gdW5kZWZpbmVkKSBtaW4gPSAxO1xuICBpZiAobWF4ID09PSB1bmRlZmluZWQpIG1heCA9IDk7XG4gIHZhciBEID0gW107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgTjsgaSsrKSB7XG4gICAgRC5wdXNoKFtdKTtcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IE07IGorKykge1xuICAgICAgRFtpXS5wdXNoKChNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpIHwgMCkgKyBtaW4pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gRDtcbn07XG5cbmNvbnN0IHJhbmRvbVNvcnRlZCA9IChOLCBNLCBtaW4sIG1heCkgPT4ge1xuICByZXR1cm4gcmFuZG9tKE4sIE0sIG1pbiwgbWF4KS5tYXAoZnVuY3Rpb24gKGFycikge1xuICAgIHJldHVybiBhcnIuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgcmV0dXJuIGEgLSBiO1xuICAgIH0pO1xuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICByYW5kb20sXG4gIHJhbmRvbVNvcnRlZFxufTsiLCJjb25zdCByYW5kb20gPSAoTiwgbWluLCBtYXgpID0+IHtcbiAgaWYgKCFOKSBOID0gNztcbiAgaWYgKCFtaW4pIG1pbiA9IDE7XG4gIGlmICghbWF4KSBtYXggPSAxMDtcbiAgdmFyIEMgPSBuZXcgQXJyYXkoTik7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgTjsgaSsrKSBDW2ldID0gbmV3IEFycmF5KDIpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IE47IGkrKylcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IENbaV0ubGVuZ3RoOyBqKyspXG4gICAgICBDW2ldW2pdID0gKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkgfCAwKSArIG1pbjtcbiAgcmV0dXJuIEM7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgcmFuZG9tXG59OyIsImNvbnN0IHJhbmRvbSA9IChOLCByYXRpbykgPT4ge1xuICBpZiAoIU4pIE4gPSA1O1xuICBpZiAoIXJhdGlvKSByYXRpbyA9IC4zO1xuICB2YXIgRyA9IG5ldyBBcnJheShOKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBOOyBpKyspIHtcbiAgICBHW2ldID0gbmV3IEFycmF5KE4pO1xuICAgIGZvciAodmFyIGogPSAwOyBqIDwgTjsgaisrKSB7XG4gICAgICBpZiAoaSAhPSBqKSB7XG4gICAgICAgIEdbaV1bal0gPSAoTWF0aC5yYW5kb20oKSAqICgxIC8gcmF0aW8pIHwgMCkgPT0gMCA/IDEgOiAwO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gRztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICByYW5kb21cbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBBcnJheTFEID0gcmVxdWlyZSgnLi9hcnJheTFkJyk7XG5jb25zdCBBcnJheTJEID0gcmVxdWlyZSgnLi9hcnJheTJkJyk7XG5jb25zdCBDb29yZGluYXRlU3lzdGVtID0gcmVxdWlyZSgnLi9jb29yZGluYXRlX3N5c3RlbScpO1xuY29uc3QgRGlyZWN0ZWRHcmFwaCA9IHJlcXVpcmUoJy4vZGlyZWN0ZWRfZ3JhcGgnKTtcbmNvbnN0IFVuZGlyZWN0ZWRHcmFwaCA9IHJlcXVpcmUoJy4vdW5kaXJlY3RlZF9ncmFwaCcpO1xuY29uc3QgV2VpZ2h0ZWREaXJlY3RlZEdyYXBoID0gcmVxdWlyZSgnLi93ZWlnaHRlZF9kaXJlY3RlZF9ncmFwaCcpO1xuY29uc3QgV2VpZ2h0ZWRVbmRpcmVjdGVkR3JhcGggPSByZXF1aXJlKCcuL3dlaWdodGVkX3VuZGlyZWN0ZWRfZ3JhcGgnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIEFycmF5MUQsXG4gIEFycmF5MkQsXG4gIENvb3JkaW5hdGVTeXN0ZW0sXG4gIERpcmVjdGVkR3JhcGgsXG4gIFVuZGlyZWN0ZWRHcmFwaCxcbiAgV2VpZ2h0ZWREaXJlY3RlZEdyYXBoLFxuICBXZWlnaHRlZFVuZGlyZWN0ZWRHcmFwaFxufTsiLCJjb25zdCByYW5kb20gPSAoTiwgcmF0aW8pID0+IHtcbiAgaWYgKCFOKSBOID0gNTtcbiAgaWYgKCFyYXRpbykgcmF0aW8gPSAuMztcbiAgdmFyIEcgPSBuZXcgQXJyYXkoTik7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgTjsgaSsrKSBHW2ldID0gbmV3IEFycmF5KE4pO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IE47IGkrKykge1xuICAgIGZvciAodmFyIGogPSAwOyBqIDwgTjsgaisrKSB7XG4gICAgICBpZiAoaSA+IGopIHtcbiAgICAgICAgR1tpXVtqXSA9IEdbal1baV0gPSAoTWF0aC5yYW5kb20oKSAqICgxIC8gcmF0aW8pIHwgMCkgPT0gMCA/IDEgOiAwO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gRztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICByYW5kb21cbn07IiwiY29uc3QgcmFuZG9tID0gKE4sIHJhdGlvLCBtaW4sIG1heCkgPT4ge1xuICBpZiAoIU4pIE4gPSA1O1xuICBpZiAoIXJhdGlvKSByYXRpbyA9IC4zO1xuICBpZiAoIW1pbikgbWluID0gMTtcbiAgaWYgKCFtYXgpIG1heCA9IDU7XG4gIHZhciBHID0gbmV3IEFycmF5KE4pO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IE47IGkrKykge1xuICAgIEdbaV0gPSBuZXcgQXJyYXkoTik7XG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBOOyBqKyspIHtcbiAgICAgIGlmIChpICE9IGogJiYgKE1hdGgucmFuZG9tKCkgKiAoMSAvIHJhdGlvKSB8IDApID09IDApIHtcbiAgICAgICAgR1tpXVtqXSA9IChNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpIHwgMCkgKyBtaW47XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiBHO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHJhbmRvbVxufTsiLCJjb25zdCByYW5kb20gPSAoTiwgcmF0aW8sIG1pbiwgbWF4KSA9PiB7XG4gIGlmICghTikgTiA9IDU7XG4gIGlmICghcmF0aW8pIHJhdGlvID0gLjM7XG4gIGlmICghbWluKSBtaW4gPSAxO1xuICBpZiAoIW1heCkgbWF4ID0gNTtcbiAgdmFyIEcgPSBuZXcgQXJyYXkoTik7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgTjsgaSsrKSBHW2ldID0gbmV3IEFycmF5KE4pO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IE47IGkrKykge1xuICAgIGZvciAodmFyIGogPSAwOyBqIDwgTjsgaisrKSB7XG4gICAgICBpZiAoaSA+IGogJiYgKE1hdGgucmFuZG9tKCkgKiAoMSAvIHJhdGlvKSB8IDApID09IDApIHtcbiAgICAgICAgR1tpXVtqXSA9IEdbal1baV0gPSAoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSB8IDApICsgbWluO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gRztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICByYW5kb21cbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdHJhY2VycyA9IHJlcXVpcmUoJy4vdHJhY2VyJyk7XG52YXIgZGF0YXMgPSByZXF1aXJlKCcuL2RhdGEnKTtcblxuY29uc3Qge1xuICBleHRlbmRcbn0gPSAkO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4dGVuZCh0cnVlLCB7fSwgdHJhY2VycywgZGF0YXMpOyIsImNvbnN0IEFycmF5MkRUcmFjZXIgPSByZXF1aXJlKCcuL2FycmF5MmQnKTtcblxuY2xhc3MgQXJyYXkxRFRyYWNlciBleHRlbmRzIEFycmF5MkRUcmFjZXIge1xuICBzdGF0aWMgZ2V0Q2xhc3NOYW1lKCkge1xuICAgIHJldHVybiAnQXJyYXkxRFRyYWNlcic7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihuYW1lKSB7XG4gICAgc3VwZXIobmFtZSk7XG4gIH1cblxuICBfbm90aWZ5KGlkeCwgdikge1xuICAgIHN1cGVyLl9ub3RpZnkoMCwgaWR4LCB2KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIF9kZW5vdGlmeShpZHgpIHtcbiAgICBzdXBlci5fZGVub3RpZnkoMCwgaWR4KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIF9zZWxlY3QocywgZSkge1xuICAgIGlmIChlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHN1cGVyLl9zZWxlY3QoMCwgcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN1cGVyLl9zZWxlY3RSb3coMCwgcywgZSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgX2Rlc2VsZWN0KHMsIGUpIHtcbiAgICBpZiAoZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBzdXBlci5fZGVzZWxlY3QoMCwgcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN1cGVyLl9kZXNlbGVjdFJvdygwLCBzLCBlKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBzZXREYXRhKEQpIHtcbiAgICByZXR1cm4gc3VwZXIuc2V0RGF0YShbRF0pO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQXJyYXkxRFRyYWNlcjsiLCJjb25zdCBUcmFjZXIgPSByZXF1aXJlKCcuL3RyYWNlcicpO1xuXG5jb25zdCB7XG4gIHJlZmluZUJ5VHlwZVxufSA9IHJlcXVpcmUoJy4uLy4uL3RyYWNlcl9tYW5hZ2VyL3V0aWwvaW5kZXgnKTtcblxuY2xhc3MgQXJyYXkyRFRyYWNlciBleHRlbmRzIFRyYWNlciB7XG4gIHN0YXRpYyBnZXRDbGFzc05hbWUoKSB7XG4gICAgcmV0dXJuICdBcnJheTJEVHJhY2VyJztcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKG5hbWUpIHtcbiAgICBzdXBlcihuYW1lKTtcblxuICAgIHRoaXMuY29sb3JDbGFzcyA9IHtcbiAgICAgIHNlbGVjdGVkOiAnc2VsZWN0ZWQnLFxuICAgICAgbm90aWZpZWQ6ICdub3RpZmllZCdcbiAgICB9O1xuXG4gICAgaWYgKHRoaXMuaXNOZXcpIGluaXRWaWV3KHRoaXMpO1xuICB9XG5cbiAgX25vdGlmeSh4LCB5LCB2KSB7XG4gICAgdGhpcy5tYW5hZ2VyLnB1c2hTdGVwKHRoaXMuY2Fwc3VsZSwge1xuICAgICAgdHlwZTogJ25vdGlmeScsXG4gICAgICB4OiB4LFxuICAgICAgeTogeSxcbiAgICAgIHY6IHZcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIF9kZW5vdGlmeSh4LCB5KSB7XG4gICAgdGhpcy5tYW5hZ2VyLnB1c2hTdGVwKHRoaXMuY2Fwc3VsZSwge1xuICAgICAgdHlwZTogJ2Rlbm90aWZ5JyxcbiAgICAgIHg6IHgsXG4gICAgICB5OiB5XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfc2VsZWN0KHN4LCBzeSwgZXgsIGV5KSB7XG4gICAgdGhpcy5wdXNoU2VsZWN0aW5nU3RlcCgnc2VsZWN0JywgbnVsbCwgYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIF9zZWxlY3RSb3coeCwgc3ksIGV5KSB7XG4gICAgdGhpcy5wdXNoU2VsZWN0aW5nU3RlcCgnc2VsZWN0JywgJ3JvdycsIGFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfc2VsZWN0Q29sKHksIHN4LCBleCkge1xuICAgIHRoaXMucHVzaFNlbGVjdGluZ1N0ZXAoJ3NlbGVjdCcsICdjb2wnLCBhcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgX2Rlc2VsZWN0KHN4LCBzeSwgZXgsIGV5KSB7XG4gICAgdGhpcy5wdXNoU2VsZWN0aW5nU3RlcCgnZGVzZWxlY3QnLCBudWxsLCBhcmd1bWVudHMpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgX2Rlc2VsZWN0Um93KHgsIHN5LCBleSkge1xuICAgIHRoaXMucHVzaFNlbGVjdGluZ1N0ZXAoJ2Rlc2VsZWN0JywgJ3JvdycsIGFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfZGVzZWxlY3RDb2woeSwgc3gsIGV4KSB7XG4gICAgdGhpcy5wdXNoU2VsZWN0aW5nU3RlcCgnZGVzZWxlY3QnLCAnY29sJywgYXJndW1lbnRzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIF9zZXBhcmF0ZSh4LCB5KSB7XG4gICAgdGhpcy5tYW5hZ2VyLnB1c2hTdGVwKHRoaXMuY2Fwc3VsZSwge1xuICAgICAgdHlwZTogJ3NlcGFyYXRlJyxcbiAgICAgIHg6IHgsXG4gICAgICB5OiB5XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfc2VwYXJhdGVSb3coeCkge1xuICAgIHRoaXMuX3NlcGFyYXRlKHgsIC0xKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIF9zZXBhcmF0ZUNvbCh5KSB7XG4gICAgdGhpcy5fc2VwYXJhdGUoLTEsIHkpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgX2Rlc2VwYXJhdGUoeCwgeSkge1xuICAgIHRoaXMubWFuYWdlci5wdXNoU3RlcCh0aGlzLmNhcHN1bGUsIHtcbiAgICAgIHR5cGU6ICdkZXNlcGFyYXRlJyxcbiAgICAgIHg6IHgsXG4gICAgICB5OiB5XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfZGVzZXBhcmF0ZVJvdyh4KSB7XG4gICAgdGhpcy5fZGVzZXBhcmF0ZSh4LCAtMSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfZGVzZXBhcmF0ZUNvbCh5KSB7XG4gICAgdGhpcy5fZGVzZXBhcmF0ZSgtMSwgeSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBwdXNoU2VsZWN0aW5nU3RlcCgpIHtcbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgdmFyIHR5cGUgPSBhcmdzLnNoaWZ0KCk7XG4gICAgdmFyIG1vZGUgPSBhcmdzLnNoaWZ0KCk7XG4gICAgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3Muc2hpZnQoKSk7XG4gICAgdmFyIGNvb3JkO1xuICAgIHN3aXRjaCAobW9kZSkge1xuICAgICAgY2FzZSAncm93JzpcbiAgICAgICAgY29vcmQgPSB7XG4gICAgICAgICAgeDogYXJnc1swXSxcbiAgICAgICAgICBzeTogYXJnc1sxXSxcbiAgICAgICAgICBleTogYXJnc1syXVxuICAgICAgICB9O1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2NvbCc6XG4gICAgICAgIGNvb3JkID0ge1xuICAgICAgICAgIHk6IGFyZ3NbMF0sXG4gICAgICAgICAgc3g6IGFyZ3NbMV0sXG4gICAgICAgICAgZXg6IGFyZ3NbMl1cbiAgICAgICAgfTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAoYXJnc1syXSA9PT0gdW5kZWZpbmVkICYmIGFyZ3NbM10gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGNvb3JkID0ge1xuICAgICAgICAgICAgeDogYXJnc1swXSxcbiAgICAgICAgICAgIHk6IGFyZ3NbMV1cbiAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvb3JkID0ge1xuICAgICAgICAgICAgc3g6IGFyZ3NbMF0sXG4gICAgICAgICAgICBzeTogYXJnc1sxXSxcbiAgICAgICAgICAgIGV4OiBhcmdzWzJdLFxuICAgICAgICAgICAgZXk6IGFyZ3NbM11cbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuICAgIHZhciBzdGVwID0ge1xuICAgICAgdHlwZTogdHlwZVxuICAgIH07XG4gICAgJC5leHRlbmQoc3RlcCwgY29vcmQpO1xuICAgIHRoaXMubWFuYWdlci5wdXNoU3RlcCh0aGlzLmNhcHN1bGUsIHN0ZXApO1xuICB9XG5cbiAgcHJvY2Vzc1N0ZXAoc3RlcCwgb3B0aW9ucykge1xuICAgIHN3aXRjaCAoc3RlcC50eXBlKSB7XG4gICAgICBjYXNlICdub3RpZnknOlxuICAgICAgICBpZiAoc3RlcC52ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB2YXIgJHJvdyA9IHRoaXMuJHRhYmxlLmZpbmQoJy5tdGJsLXJvdycpLmVxKHN0ZXAueCk7XG4gICAgICAgICAgdmFyICRjb2wgPSAkcm93LmZpbmQoJy5tdGJsLWNvbCcpLmVxKHN0ZXAueSk7XG4gICAgICAgICAgJGNvbC50ZXh0KHJlZmluZUJ5VHlwZShzdGVwLnYpKTtcbiAgICAgICAgfVxuICAgICAgY2FzZSAnZGVub3RpZnknOlxuICAgICAgY2FzZSAnc2VsZWN0JzpcbiAgICAgIGNhc2UgJ2Rlc2VsZWN0JzpcbiAgICAgICAgdmFyIGNvbG9yQ2xhc3MgPSBzdGVwLnR5cGUgPT0gJ3NlbGVjdCcgfHwgc3RlcC50eXBlID09ICdkZXNlbGVjdCcgPyB0aGlzLmNvbG9yQ2xhc3Muc2VsZWN0ZWQgOiB0aGlzLmNvbG9yQ2xhc3Mubm90aWZpZWQ7XG4gICAgICAgIHZhciBhZGRDbGFzcyA9IHN0ZXAudHlwZSA9PSAnc2VsZWN0JyB8fCBzdGVwLnR5cGUgPT0gJ25vdGlmeSc7XG4gICAgICAgIHZhciBzeCA9IHN0ZXAuc3g7XG4gICAgICAgIHZhciBzeSA9IHN0ZXAuc3k7XG4gICAgICAgIHZhciBleCA9IHN0ZXAuZXg7XG4gICAgICAgIHZhciBleSA9IHN0ZXAuZXk7XG4gICAgICAgIGlmIChzeCA9PT0gdW5kZWZpbmVkKSBzeCA9IHN0ZXAueDtcbiAgICAgICAgaWYgKHN5ID09PSB1bmRlZmluZWQpIHN5ID0gc3RlcC55O1xuICAgICAgICBpZiAoZXggPT09IHVuZGVmaW5lZCkgZXggPSBzdGVwLng7XG4gICAgICAgIGlmIChleSA9PT0gdW5kZWZpbmVkKSBleSA9IHN0ZXAueTtcbiAgICAgICAgdGhpcy5wYWludENvbG9yKHN4LCBzeSwgZXgsIGV5LCBjb2xvckNsYXNzLCBhZGRDbGFzcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnc2VwYXJhdGUnOlxuICAgICAgICB0aGlzLmRlc2VwYXJhdGUoc3RlcC54LCBzdGVwLnkpO1xuICAgICAgICB0aGlzLnNlcGFyYXRlKHN0ZXAueCwgc3RlcC55KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdkZXNlcGFyYXRlJzpcbiAgICAgICAgdGhpcy5kZXNlcGFyYXRlKHN0ZXAueCwgc3RlcC55KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBzdXBlci5wcm9jZXNzU3RlcChzdGVwLCBvcHRpb25zKTtcbiAgICB9XG4gIH1cblxuICBzZXREYXRhKEQpIHtcbiAgICB0aGlzLnZpZXdYID0gdGhpcy52aWV3WSA9IDA7XG4gICAgdGhpcy5wYWRkaW5nSCA9IDY7XG4gICAgdGhpcy5wYWRkaW5nViA9IDM7XG4gICAgdGhpcy5mb250U2l6ZSA9IDE2O1xuXG4gICAgaWYgKHN1cGVyLnNldERhdGEuYXBwbHkodGhpcywgYXJndW1lbnRzKSkge1xuICAgICAgdGhpcy4kdGFibGUuZmluZCgnLm10Ymwtcm93JykuZWFjaChmdW5jdGlvbiAoaSkge1xuICAgICAgICAkKHRoaXMpLmZpbmQoJy5tdGJsLWNvbCcpLmVhY2goZnVuY3Rpb24gKGopIHtcbiAgICAgICAgICAkKHRoaXMpLnRleHQocmVmaW5lQnlUeXBlKERbaV1bal0pKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHRoaXMuJHRhYmxlLmVtcHR5KCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBELmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgJHJvdyA9ICQoJzxkaXYgY2xhc3M9XCJtdGJsLXJvd1wiPicpO1xuICAgICAgdGhpcy4kdGFibGUuYXBwZW5kKCRyb3cpO1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBEW2ldLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIHZhciAkY29sID0gJCgnPGRpdiBjbGFzcz1cIm10YmwtY29sXCI+JylcbiAgICAgICAgICAuY3NzKHRoaXMuZ2V0Q2VsbENzcygpKVxuICAgICAgICAgIC50ZXh0KHJlZmluZUJ5VHlwZShEW2ldW2pdKSk7XG4gICAgICAgICRyb3cuYXBwZW5kKCRjb2wpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnJlc2l6ZSgpO1xuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmVzaXplKCkge1xuICAgIHN1cGVyLnJlc2l6ZSgpO1xuXG4gICAgdGhpcy5yZWZyZXNoKCk7XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICBzdXBlci5jbGVhcigpO1xuXG4gICAgdGhpcy5jbGVhckNvbG9yKCk7XG4gICAgdGhpcy5kZXNlcGFyYXRlQWxsKCk7XG4gIH1cblxuICBnZXRDZWxsQ3NzKCkge1xuICAgIHJldHVybiB7XG4gICAgICBwYWRkaW5nOiB0aGlzLnBhZGRpbmdWLnRvRml4ZWQoMSkgKyAncHggJyArIHRoaXMucGFkZGluZ0gudG9GaXhlZCgxKSArICdweCcsXG4gICAgICAnZm9udC1zaXplJzogdGhpcy5mb250U2l6ZS50b0ZpeGVkKDEpICsgJ3B4J1xuICAgIH07XG4gIH1cblxuICByZWZyZXNoKCkge1xuICAgIHN1cGVyLnJlZnJlc2goKTtcblxuICAgIHZhciAkcGFyZW50ID0gdGhpcy4kdGFibGUucGFyZW50KCk7XG4gICAgdmFyIHRvcCA9ICRwYXJlbnQuaGVpZ2h0KCkgLyAyIC0gdGhpcy4kdGFibGUuaGVpZ2h0KCkgLyAyICsgdGhpcy52aWV3WTtcbiAgICB2YXIgbGVmdCA9ICRwYXJlbnQud2lkdGgoKSAvIDIgLSB0aGlzLiR0YWJsZS53aWR0aCgpIC8gMiArIHRoaXMudmlld1g7XG4gICAgdGhpcy4kdGFibGUuY3NzKCdtYXJnaW4tdG9wJywgdG9wKTtcbiAgICB0aGlzLiR0YWJsZS5jc3MoJ21hcmdpbi1sZWZ0JywgbGVmdCk7XG4gIH1cblxuICBtb3VzZWRvd24oZSkge1xuICAgIHN1cGVyLm1vdXNlZG93bihlKTtcblxuICAgIHRoaXMuZHJhZ1ggPSBlLnBhZ2VYO1xuICAgIHRoaXMuZHJhZ1kgPSBlLnBhZ2VZO1xuICAgIHRoaXMuZHJhZ2dpbmcgPSB0cnVlO1xuICB9XG5cbiAgbW91c2Vtb3ZlKGUpIHtcbiAgICBzdXBlci5tb3VzZW1vdmUoZSk7XG5cbiAgICBpZiAodGhpcy5kcmFnZ2luZykge1xuICAgICAgdGhpcy52aWV3WCArPSBlLnBhZ2VYIC0gdGhpcy5kcmFnWDtcbiAgICAgIHRoaXMudmlld1kgKz0gZS5wYWdlWSAtIHRoaXMuZHJhZ1k7XG4gICAgICB0aGlzLmRyYWdYID0gZS5wYWdlWDtcbiAgICAgIHRoaXMuZHJhZ1kgPSBlLnBhZ2VZO1xuICAgICAgdGhpcy5yZWZyZXNoKCk7XG4gICAgfVxuICB9XG5cbiAgbW91c2V1cChlKSB7XG4gICAgc3VwZXIubW91c2V1cChlKTtcblxuICAgIHRoaXMuZHJhZ2dpbmcgPSBmYWxzZTtcbiAgfVxuXG4gIG1vdXNld2hlZWwoZSkge1xuICAgIHN1cGVyLm1vdXNld2hlZWwoZSk7XG5cbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgZSA9IGUub3JpZ2luYWxFdmVudDtcbiAgICB2YXIgZGVsdGEgPSAoZS53aGVlbERlbHRhICE9PSB1bmRlZmluZWQgJiYgZS53aGVlbERlbHRhKSB8fFxuICAgICAgKGUuZGV0YWlsICE9PSB1bmRlZmluZWQgJiYgLWUuZGV0YWlsKTtcbiAgICB2YXIgd2VpZ2h0ID0gMS4wMTtcbiAgICB2YXIgcmF0aW8gPSBkZWx0YSA+IDAgPyAxIC8gd2VpZ2h0IDogd2VpZ2h0O1xuICAgIGlmICh0aGlzLmZvbnRTaXplIDwgNCAmJiByYXRpbyA8IDEpIHJldHVybjtcbiAgICBpZiAodGhpcy5mb250U2l6ZSA+IDQwICYmIHJhdGlvID4gMSkgcmV0dXJuO1xuICAgIHRoaXMucGFkZGluZ1YgKj0gcmF0aW87XG4gICAgdGhpcy5wYWRkaW5nSCAqPSByYXRpbztcbiAgICB0aGlzLmZvbnRTaXplICo9IHJhdGlvO1xuICAgIHRoaXMuJHRhYmxlLmZpbmQoJy5tdGJsLWNvbCcpLmNzcyh0aGlzLmdldENlbGxDc3MoKSk7XG4gICAgdGhpcy5yZWZyZXNoKCk7XG4gIH1cblxuICBwYWludENvbG9yKHN4LCBzeSwgZXgsIGV5LCBjb2xvckNsYXNzLCBhZGRDbGFzcykge1xuICAgIGZvciAodmFyIGkgPSBzeDsgaSA8PSBleDsgaSsrKSB7XG4gICAgICB2YXIgJHJvdyA9IHRoaXMuJHRhYmxlLmZpbmQoJy5tdGJsLXJvdycpLmVxKGkpO1xuICAgICAgZm9yICh2YXIgaiA9IHN5OyBqIDw9IGV5OyBqKyspIHtcbiAgICAgICAgdmFyICRjb2wgPSAkcm93LmZpbmQoJy5tdGJsLWNvbCcpLmVxKGopO1xuICAgICAgICBpZiAoYWRkQ2xhc3MpICRjb2wuYWRkQ2xhc3MoY29sb3JDbGFzcyk7XG4gICAgICAgIGVsc2UgJGNvbC5yZW1vdmVDbGFzcyhjb2xvckNsYXNzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjbGVhckNvbG9yKCkge1xuICAgIHRoaXMuJHRhYmxlLmZpbmQoJy5tdGJsLWNvbCcpLnJlbW92ZUNsYXNzKE9iamVjdC5rZXlzKHRoaXMuY29sb3JDbGFzcykuam9pbignICcpKTtcbiAgfVxuXG4gIHNlcGFyYXRlKHgsIHkpIHtcbiAgICB0aGlzLiR0YWJsZS5maW5kKCcubXRibC1yb3cnKS5lYWNoKGZ1bmN0aW9uIChpKSB7XG4gICAgICB2YXIgJHJvdyA9ICQodGhpcyk7XG4gICAgICBpZiAoaSA9PSB4KSB7XG4gICAgICAgICRyb3cuYWZ0ZXIoJCgnPGRpdiBjbGFzcz1cIm10YmwtZW1wdHktcm93XCI+JykuYXR0cignZGF0YS1yb3cnLCBpKSlcbiAgICAgIH1cbiAgICAgICRyb3cuZmluZCgnLm10YmwtY29sJykuZWFjaChmdW5jdGlvbiAoaikge1xuICAgICAgICB2YXIgJGNvbCA9ICQodGhpcyk7XG4gICAgICAgIGlmIChqID09IHkpIHtcbiAgICAgICAgICAkY29sLmFmdGVyKCQoJzxkaXYgY2xhc3M9XCJtdGJsLWVtcHR5LWNvbFwiPicpLmF0dHIoJ2RhdGEtY29sJywgaikpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGRlc2VwYXJhdGUoeCwgeSkge1xuICAgIHRoaXMuJHRhYmxlLmZpbmQoJ1tkYXRhLXJvdz0nICsgeCArICddJykucmVtb3ZlKCk7XG4gICAgdGhpcy4kdGFibGUuZmluZCgnW2RhdGEtY29sPScgKyB5ICsgJ10nKS5yZW1vdmUoKTtcbiAgfVxuXG4gIGRlc2VwYXJhdGVBbGwoKSB7XG4gICAgdGhpcy4kdGFibGUuZmluZCgnLm10YmwtZW1wdHktcm93LCAubXRibC1lbXB0eS1jb2wnKS5yZW1vdmUoKTtcbiAgfVxufVxuXG5jb25zdCBpbml0VmlldyA9ICh0cmFjZXIpID0+IHtcbiAgdHJhY2VyLiR0YWJsZSA9IHRyYWNlci5jYXBzdWxlLiR0YWJsZSA9ICQoJzxkaXYgY2xhc3M9XCJtdGJsLXRhYmxlXCI+Jyk7XG4gIHRyYWNlci4kY29udGFpbmVyLmFwcGVuZCh0cmFjZXIuJHRhYmxlKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQXJyYXkyRFRyYWNlcjsiLCJjb25zdCBUcmFjZXIgPSByZXF1aXJlKCcuL3RyYWNlcicpO1xuXG5jbGFzcyBDaGFydFRyYWNlciBleHRlbmRzIFRyYWNlciB7XG4gIHN0YXRpYyBnZXRDbGFzc05hbWUoKSB7XG4gICAgcmV0dXJuICdDaGFydFRyYWNlcic7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihuYW1lKSB7XG4gICAgc3VwZXIobmFtZSk7XG5cbiAgICBpZiAodGhpcy5pc05ldykgaW5pdFZpZXcodGhpcyk7XG4gIH1cblxuICBzZXREYXRhKEMpIHtcbiAgICBpZiAoc3VwZXIuc2V0RGF0YS5hcHBseSh0aGlzLCBhcmd1bWVudHMpKSByZXR1cm4gdHJ1ZTtcblxuICAgIGlmICh0aGlzLmNoYXJ0KSB0aGlzLmNoYXJ0LmRlc3Ryb3koKTtcbiAgICB2YXIgY29sb3IgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IEMubGVuZ3RoOyBpKyspIGNvbG9yLnB1c2goJ3JnYmEoMTM2LCAxMzYsIDEzNiwgMSknKTtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgIHR5cGU6ICdiYXInLFxuICAgICAgZGF0YToge1xuICAgICAgICBsYWJlbHM6IEMubWFwKFN0cmluZyksXG4gICAgICAgIGRhdGFzZXRzOiBbe1xuICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogY29sb3IsXG4gICAgICAgICAgZGF0YTogQ1xuICAgICAgICB9XVxuICAgICAgfSxcbiAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgc2NhbGVzOiB7XG4gICAgICAgICAgeUF4ZXM6IFt7XG4gICAgICAgICAgICB0aWNrczoge1xuICAgICAgICAgICAgICBiZWdpbkF0WmVybzogdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1dXG4gICAgICAgIH0sXG4gICAgICAgIGFuaW1hdGlvbjogZmFsc2UsXG4gICAgICAgIGxlZ2VuZDogZmFsc2UsXG4gICAgICAgIHJlc3BvbnNpdmU6IHRydWUsXG4gICAgICAgIG1haW50YWluQXNwZWN0UmF0aW86IGZhbHNlXG4gICAgICB9XG4gICAgfTtcbiAgICB0aGlzLmNoYXJ0ID0gdGhpcy5jYXBzdWxlLmNoYXJ0ID0gbmV3IENoYXJ0KHRoaXMuJHdyYXBwZXIsIGRhdGEpO1xuICB9XG5cbiAgX25vdGlmeShzLCB2KSB7XG4gICAgdGhpcy5tYW5hZ2VyLnB1c2hTdGVwKHRoaXMuY2Fwc3VsZSwge1xuICAgICAgdHlwZTogJ25vdGlmeScsXG4gICAgICBzOiBzLFxuICAgICAgdjogdlxuICAgIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgX2Rlbm90aWZ5KHMpIHtcbiAgICB0aGlzLm1hbmFnZXIucHVzaFN0ZXAodGhpcy5jYXBzdWxlLCB7XG4gICAgICB0eXBlOiAnZGVub3RpZnknLFxuICAgICAgczogc1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgX3NlbGVjdChzLCBlKSB7XG4gICAgdGhpcy5tYW5hZ2VyLnB1c2hTdGVwKHRoaXMuY2Fwc3VsZSwge1xuICAgICAgdHlwZTogJ3NlbGVjdCcsXG4gICAgICBzOiBzLFxuICAgICAgZTogZVxuICAgIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgX2Rlc2VsZWN0KHMsIGUpIHtcbiAgICB0aGlzLm1hbmFnZXIucHVzaFN0ZXAodGhpcy5jYXBzdWxlLCB7XG4gICAgICB0eXBlOiAnZGVzZWxlY3QnLFxuICAgICAgczogcyxcbiAgICAgIGU6IGVcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHByb2Nlc3NTdGVwKHN0ZXAsIG9wdGlvbnMpIHtcbiAgICBzd2l0Y2ggKHN0ZXAudHlwZSkge1xuICAgICAgY2FzZSAnbm90aWZ5JzpcbiAgICAgICAgaWYgKHN0ZXAudiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhpcy5jaGFydC5jb25maWcuZGF0YS5kYXRhc2V0c1swXS5kYXRhW3N0ZXAuc10gPSBzdGVwLnY7XG4gICAgICAgICAgdGhpcy5jaGFydC5jb25maWcuZGF0YS5sYWJlbHNbc3RlcC5zXSA9IHN0ZXAudi50b1N0cmluZygpO1xuICAgICAgICB9XG4gICAgICBjYXNlICdkZW5vdGlmeSc6XG4gICAgICBjYXNlICdkZXNlbGVjdCc6XG4gICAgICAgIHZhciBjb2xvciA9IHN0ZXAudHlwZSA9PSAnZGVub3RpZnknIHx8IHN0ZXAudHlwZSA9PSAnZGVzZWxlY3QnID8gJ3JnYmEoMTM2LCAxMzYsIDEzNiwgMSknIDogJ3JnYmEoMjU1LCAwLCAwLCAxKSc7XG4gICAgICBjYXNlICdzZWxlY3QnOlxuICAgICAgICBpZiAoY29sb3IgPT09IHVuZGVmaW5lZCkgdmFyIGNvbG9yID0gJ3JnYmEoMCwgMCwgMjU1LCAxKSc7XG4gICAgICAgIGlmIChzdGVwLmUgIT09IHVuZGVmaW5lZClcbiAgICAgICAgICBmb3IgKHZhciBpID0gc3RlcC5zOyBpIDw9IHN0ZXAuZTsgaSsrKVxuICAgICAgICAgICAgdGhpcy5jaGFydC5jb25maWcuZGF0YS5kYXRhc2V0c1swXS5iYWNrZ3JvdW5kQ29sb3JbaV0gPSBjb2xvcjtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHRoaXMuY2hhcnQuY29uZmlnLmRhdGEuZGF0YXNldHNbMF0uYmFja2dyb3VuZENvbG9yW3N0ZXAuc10gPSBjb2xvcjtcbiAgICAgICAgdGhpcy5jaGFydC51cGRhdGUoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBzdXBlci5wcm9jZXNzU3RlcChzdGVwLCBvcHRpb25zKTtcbiAgICB9XG4gIH1cbn1cblxuY29uc3QgaW5pdFZpZXcgPSAodHJhY2VyKSA9PiB7XG4gIHRyYWNlci4kd3JhcHBlciA9IHRyYWNlci5jYXBzdWxlLiR3cmFwcGVyID0gJCgnPGNhbnZhcyBjbGFzcz1cIm1jaHJ0LWNoYXJ0XCI+Jyk7XG4gIHRyYWNlci4kY29udGFpbmVyLmFwcGVuZCh0cmFjZXIuJHdyYXBwZXIpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDaGFydFRyYWNlcjsiLCJjb25zdCBEaXJlY3RlZEdyYXBoVHJhY2VyID0gcmVxdWlyZSgnLi9kaXJlY3RlZF9ncmFwaCcpO1xuXG5jbGFzcyBDb29yZGluYXRlU3lzdGVtVHJhY2VyIGV4dGVuZHMgRGlyZWN0ZWRHcmFwaFRyYWNlciB7XG4gIHN0YXRpYyBnZXRDbGFzc05hbWUoKSB7XG4gICAgcmV0dXJuICdDb29yZGluYXRlU3lzdGVtVHJhY2VyJztcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKG5hbWUpIHtcbiAgICBzdXBlcihuYW1lKTtcblxuICAgIGlmICh0aGlzLmlzTmV3KSBpbml0Vmlldyh0aGlzKTtcbiAgfVxuXG4gIHNldERhdGEoQykge1xuICAgIGlmIChUcmFjZXIucHJvdG90eXBlLnNldERhdGEuYXBwbHkodGhpcywgYXJndW1lbnRzKSkgcmV0dXJuIHRydWU7XG5cbiAgICB0aGlzLmdyYXBoLmNsZWFyKCk7XG4gICAgdmFyIG5vZGVzID0gW107XG4gICAgdmFyIGVkZ2VzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBDLmxlbmd0aDsgaSsrKVxuICAgICAgbm9kZXMucHVzaCh7XG4gICAgICAgIGlkOiB0aGlzLm4oaSksXG4gICAgICAgIHg6IENbaV1bMF0sXG4gICAgICAgIHk6IENbaV1bMV0sXG4gICAgICAgIGxhYmVsOiAnJyArIGksXG4gICAgICAgIHNpemU6IDEsXG4gICAgICAgIGNvbG9yOiB0aGlzLmNvbG9yLmRlZmF1bHRcbiAgICAgIH0pO1xuICAgIHRoaXMuZ3JhcGgucmVhZCh7XG4gICAgICBub2Rlczogbm9kZXMsXG4gICAgICBlZGdlczogZWRnZXNcbiAgICB9KTtcbiAgICB0aGlzLnMuY2FtZXJhLmdvVG8oe1xuICAgICAgeDogMCxcbiAgICAgIHk6IDAsXG4gICAgICBhbmdsZTogMCxcbiAgICAgIHJhdGlvOiAxXG4gICAgfSk7XG4gICAgdGhpcy5yZWZyZXNoKCk7XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBwcm9jZXNzU3RlcChzdGVwLCBvcHRpb25zKSB7XG4gICAgc3dpdGNoIChzdGVwLnR5cGUpIHtcbiAgICAgIGNhc2UgJ3Zpc2l0JzpcbiAgICAgIGNhc2UgJ2xlYXZlJzpcbiAgICAgICAgdmFyIHZpc2l0ID0gc3RlcC50eXBlID09ICd2aXNpdCc7XG4gICAgICAgIHZhciB0YXJnZXROb2RlID0gdGhpcy5ncmFwaC5ub2Rlcyh0aGlzLm4oc3RlcC50YXJnZXQpKTtcbiAgICAgICAgdmFyIGNvbG9yID0gdmlzaXQgPyB0aGlzLmNvbG9yLnZpc2l0ZWQgOiB0aGlzLmNvbG9yLmxlZnQ7XG4gICAgICAgIHRhcmdldE5vZGUuY29sb3IgPSBjb2xvcjtcbiAgICAgICAgaWYgKHN0ZXAuc291cmNlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB2YXIgZWRnZUlkID0gdGhpcy5lKHN0ZXAuc291cmNlLCBzdGVwLnRhcmdldCk7XG4gICAgICAgICAgaWYgKHRoaXMuZ3JhcGguZWRnZXMoZWRnZUlkKSkge1xuICAgICAgICAgICAgdmFyIGVkZ2UgPSB0aGlzLmdyYXBoLmVkZ2VzKGVkZ2VJZCk7XG4gICAgICAgICAgICBlZGdlLmNvbG9yID0gY29sb3I7XG4gICAgICAgICAgICB0aGlzLmdyYXBoLmRyb3BFZGdlKGVkZ2VJZCkuYWRkRWRnZShlZGdlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5ncmFwaC5hZGRFZGdlKHtcbiAgICAgICAgICAgICAgaWQ6IHRoaXMuZShzdGVwLnRhcmdldCwgc3RlcC5zb3VyY2UpLFxuICAgICAgICAgICAgICBzb3VyY2U6IHRoaXMubihzdGVwLnNvdXJjZSksXG4gICAgICAgICAgICAgIHRhcmdldDogdGhpcy5uKHN0ZXAudGFyZ2V0KSxcbiAgICAgICAgICAgICAgY29sb3I6IGNvbG9yLFxuICAgICAgICAgICAgICBzaXplOiAxXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMubG9nVHJhY2VyKSB7XG4gICAgICAgICAgdmFyIHNvdXJjZSA9IHN0ZXAuc291cmNlO1xuICAgICAgICAgIGlmIChzb3VyY2UgPT09IHVuZGVmaW5lZCkgc291cmNlID0gJyc7XG4gICAgICAgICAgdGhpcy5sb2dUcmFjZXIucHJpbnQodmlzaXQgPyBzb3VyY2UgKyAnIC0+ICcgKyBzdGVwLnRhcmdldCA6IHNvdXJjZSArICcgPC0gJyArIHN0ZXAudGFyZ2V0KTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHN1cGVyLnByb2Nlc3NTdGVwKHN0ZXAsIG9wdGlvbnMpO1xuICAgIH1cbiAgfVxuXG4gIGUodjEsIHYyKSB7XG4gICAgaWYgKHYxID4gdjIpIHtcbiAgICAgIHZhciB0ZW1wID0gdjE7XG4gICAgICB2MSA9IHYyO1xuICAgICAgdjIgPSB0ZW1wO1xuICAgIH1cbiAgICByZXR1cm4gJ2UnICsgdjEgKyAnXycgKyB2MjtcbiAgfVxuXG4gIGRyYXdPbkhvdmVyKG5vZGUsIGNvbnRleHQsIHNldHRpbmdzLCBuZXh0KSB7XG4gICAgdmFyIHRyYWNlciA9IHRoaXM7XG5cbiAgICBjb250ZXh0LnNldExpbmVEYXNoKFs1LCA1XSk7XG4gICAgdmFyIG5vZGVJZHggPSBub2RlLmlkLnN1YnN0cmluZygxKTtcbiAgICB0aGlzLmdyYXBoLmVkZ2VzKCkuZm9yRWFjaChmdW5jdGlvbiAoZWRnZSkge1xuICAgICAgdmFyIGVuZHMgPSBlZGdlLmlkLnN1YnN0cmluZygxKS5zcGxpdChcIl9cIik7XG4gICAgICBpZiAoZW5kc1swXSA9PSBub2RlSWR4KSB7XG4gICAgICAgIHZhciBjb2xvciA9ICcjMGZmJztcbiAgICAgICAgdmFyIHNvdXJjZSA9IG5vZGU7XG4gICAgICAgIHZhciB0YXJnZXQgPSB0cmFjZXIuZ3JhcGgubm9kZXMoJ24nICsgZW5kc1sxXSk7XG4gICAgICAgIHRyYWNlci5kcmF3RWRnZShlZGdlLCBzb3VyY2UsIHRhcmdldCwgY29sb3IsIGNvbnRleHQsIHNldHRpbmdzKTtcbiAgICAgICAgaWYgKG5leHQpIG5leHQoZWRnZSwgc291cmNlLCB0YXJnZXQsIGNvbG9yLCBjb250ZXh0LCBzZXR0aW5ncyk7XG4gICAgICB9IGVsc2UgaWYgKGVuZHNbMV0gPT0gbm9kZUlkeCkge1xuICAgICAgICB2YXIgY29sb3IgPSAnIzBmZic7XG4gICAgICAgIHZhciBzb3VyY2UgPSB0cmFjZXIuZ3JhcGgubm9kZXMoJ24nICsgZW5kc1swXSk7XG4gICAgICAgIHZhciB0YXJnZXQgPSBub2RlO1xuICAgICAgICB0cmFjZXIuZHJhd0VkZ2UoZWRnZSwgc291cmNlLCB0YXJnZXQsIGNvbG9yLCBjb250ZXh0LCBzZXR0aW5ncyk7XG4gICAgICAgIGlmIChuZXh0KSBuZXh0KGVkZ2UsIHNvdXJjZSwgdGFyZ2V0LCBjb2xvciwgY29udGV4dCwgc2V0dGluZ3MpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZHJhd0VkZ2UoZWRnZSwgc291cmNlLCB0YXJnZXQsIGNvbG9yLCBjb250ZXh0LCBzZXR0aW5ncykge1xuICAgIHZhciBwcmVmaXggPSBzZXR0aW5ncygncHJlZml4JykgfHwgJycsXG4gICAgICBzaXplID0gZWRnZVtwcmVmaXggKyAnc2l6ZSddIHx8IDE7XG5cbiAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gY29sb3I7XG4gICAgY29udGV4dC5saW5lV2lkdGggPSBzaXplO1xuICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgY29udGV4dC5tb3ZlVG8oXG4gICAgICBzb3VyY2VbcHJlZml4ICsgJ3gnXSxcbiAgICAgIHNvdXJjZVtwcmVmaXggKyAneSddXG4gICAgKTtcbiAgICBjb250ZXh0LmxpbmVUbyhcbiAgICAgIHRhcmdldFtwcmVmaXggKyAneCddLFxuICAgICAgdGFyZ2V0W3ByZWZpeCArICd5J11cbiAgICApO1xuICAgIGNvbnRleHQuc3Ryb2tlKCk7XG4gIH1cbn1cblxuY29uc3QgaW5pdFZpZXcgPSAodHJhY2VyKSA9PiB7XG4gIHRyYWNlci5zLnNldHRpbmdzKHtcbiAgICBkZWZhdWx0RWRnZVR5cGU6ICdkZWYnLFxuICAgIGZ1bmNFZGdlc0RlZihlZGdlLCBzb3VyY2UsIHRhcmdldCwgY29udGV4dCwgc2V0dGluZ3MpIHtcbiAgICAgIHZhciBjb2xvciA9IHRyYWNlci5nZXRDb2xvcihlZGdlLCBzb3VyY2UsIHRhcmdldCwgc2V0dGluZ3MpO1xuICAgICAgdHJhY2VyLmRyYXdFZGdlKGVkZ2UsIHNvdXJjZSwgdGFyZ2V0LCBjb2xvciwgY29udGV4dCwgc2V0dGluZ3MpO1xuICAgIH1cbiAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvb3JkaW5hdGVTeXN0ZW1UcmFjZXI7IiwiY29uc3QgVHJhY2VyID0gcmVxdWlyZSgnLi90cmFjZXInKTtcblxuY29uc3Qge1xuICByZWZpbmVCeVR5cGVcbn0gPSByZXF1aXJlKCcuLi8uLi90cmFjZXJfbWFuYWdlci91dGlsL2luZGV4Jyk7XG5cbmNsYXNzIERpcmVjdGVkR3JhcGhUcmFjZXIgZXh0ZW5kcyBUcmFjZXIge1xuICBzdGF0aWMgZ2V0Q2xhc3NOYW1lKCkge1xuICAgIHJldHVybiAnRGlyZWN0ZWRHcmFwaFRyYWNlcic7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihuYW1lKSB7XG4gICAgc3VwZXIobmFtZSk7XG5cbiAgICB0aGlzLmNvbG9yID0ge1xuICAgICAgdmlzaXRlZDogJyNmMDAnLFxuICAgICAgbGVmdDogJyMwMDAnLFxuICAgICAgZGVmYXVsdDogJyM4ODgnXG4gICAgfTtcblxuICAgIGlmICh0aGlzLmlzTmV3KSBpbml0Vmlldyh0aGlzKTtcbiAgfVxuXG4gIF9zZXRUcmVlRGF0YShHLCByb290KSB7XG4gICAgdGhpcy5tYW5hZ2VyLnB1c2hTdGVwKHRoaXMuY2Fwc3VsZSwge1xuICAgICAgdHlwZTogJ3NldFRyZWVEYXRhJyxcbiAgICAgIGFyZ3VtZW50czogYXJndW1lbnRzXG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfdmlzaXQodGFyZ2V0LCBzb3VyY2UpIHtcbiAgICB0aGlzLm1hbmFnZXIucHVzaFN0ZXAodGhpcy5jYXBzdWxlLCB7XG4gICAgICB0eXBlOiAndmlzaXQnLFxuICAgICAgdGFyZ2V0OiB0YXJnZXQsXG4gICAgICBzb3VyY2U6IHNvdXJjZVxuICAgIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgX2xlYXZlKHRhcmdldCwgc291cmNlKSB7XG4gICAgdGhpcy5tYW5hZ2VyLnB1c2hTdGVwKHRoaXMuY2Fwc3VsZSwge1xuICAgICAgdHlwZTogJ2xlYXZlJyxcbiAgICAgIHRhcmdldDogdGFyZ2V0LFxuICAgICAgc291cmNlOiBzb3VyY2VcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHByb2Nlc3NTdGVwKHN0ZXAsIG9wdGlvbnMpIHtcbiAgICBzd2l0Y2ggKHN0ZXAudHlwZSkge1xuICAgICAgY2FzZSAnc2V0VHJlZURhdGEnOlxuICAgICAgICB0aGlzLnNldFRyZWVEYXRhLmFwcGx5KHRoaXMsIHN0ZXAuYXJndW1lbnRzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICd2aXNpdCc6XG4gICAgICBjYXNlICdsZWF2ZSc6XG4gICAgICAgIHZhciB2aXNpdCA9IHN0ZXAudHlwZSA9PSAndmlzaXQnO1xuICAgICAgICB2YXIgdGFyZ2V0Tm9kZSA9IHRoaXMuZ3JhcGgubm9kZXModGhpcy5uKHN0ZXAudGFyZ2V0KSk7XG4gICAgICAgIHZhciBjb2xvciA9IHZpc2l0ID8gdGhpcy5jb2xvci52aXNpdGVkIDogdGhpcy5jb2xvci5sZWZ0O1xuICAgICAgICB0YXJnZXROb2RlLmNvbG9yID0gY29sb3I7XG4gICAgICAgIGlmIChzdGVwLnNvdXJjZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdmFyIGVkZ2VJZCA9IHRoaXMuZShzdGVwLnNvdXJjZSwgc3RlcC50YXJnZXQpO1xuICAgICAgICAgIHZhciBlZGdlID0gdGhpcy5ncmFwaC5lZGdlcyhlZGdlSWQpO1xuICAgICAgICAgIGVkZ2UuY29sb3IgPSBjb2xvcjtcbiAgICAgICAgICB0aGlzLmdyYXBoLmRyb3BFZGdlKGVkZ2VJZCkuYWRkRWRnZShlZGdlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5sb2dUcmFjZXIpIHtcbiAgICAgICAgICB2YXIgc291cmNlID0gc3RlcC5zb3VyY2U7XG4gICAgICAgICAgaWYgKHNvdXJjZSA9PT0gdW5kZWZpbmVkKSBzb3VyY2UgPSAnJztcbiAgICAgICAgICB0aGlzLmxvZ1RyYWNlci5wcmludCh2aXNpdCA/IHNvdXJjZSArICcgLT4gJyArIHN0ZXAudGFyZ2V0IDogc291cmNlICsgJyA8LSAnICsgc3RlcC50YXJnZXQpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgc3VwZXIucHJvY2Vzc1N0ZXAoc3RlcCwgb3B0aW9ucyk7XG4gICAgfVxuICB9XG5cbiAgc2V0VHJlZURhdGEoRywgcm9vdCkge1xuICAgIHZhciB0cmFjZXIgPSB0aGlzO1xuXG4gICAgcm9vdCA9IHJvb3QgfHwgMDtcbiAgICB2YXIgbWF4RGVwdGggPSAtMTtcblxuICAgIHZhciBjaGsgPSBuZXcgQXJyYXkoRy5sZW5ndGgpO1xuICAgIHZhciBnZXREZXB0aCA9IGZ1bmN0aW9uIChub2RlLCBkZXB0aCkge1xuICAgICAgaWYgKGNoa1tub2RlXSkgdGhyb3cgXCJ0aGUgZ2l2ZW4gZ3JhcGggaXMgbm90IGEgdHJlZSBiZWNhdXNlIGl0IGZvcm1zIGEgY2lyY3VpdFwiO1xuICAgICAgY2hrW25vZGVdID0gdHJ1ZTtcbiAgICAgIGlmIChtYXhEZXB0aCA8IGRlcHRoKSBtYXhEZXB0aCA9IGRlcHRoO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBHW25vZGVdLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChHW25vZGVdW2ldKSBnZXREZXB0aChpLCBkZXB0aCArIDEpO1xuICAgICAgfVxuICAgIH07XG4gICAgZ2V0RGVwdGgocm9vdCwgMSk7XG5cbiAgICBpZiAodGhpcy5zZXREYXRhKEcpKSByZXR1cm4gdHJ1ZTtcblxuICAgIHZhciBwbGFjZSA9IGZ1bmN0aW9uIChub2RlLCB4LCB5KSB7XG4gICAgICB2YXIgdGVtcCA9IHRyYWNlci5ncmFwaC5ub2Rlcyh0cmFjZXIubihub2RlKSk7XG4gICAgICB0ZW1wLnggPSB4O1xuICAgICAgdGVtcC55ID0geTtcbiAgICB9O1xuXG4gICAgdmFyIHdnYXAgPSAxIC8gKG1heERlcHRoIC0gMSk7XG4gICAgdmFyIGRmcyA9IGZ1bmN0aW9uIChub2RlLCBkZXB0aCwgdG9wLCBib3R0b20pIHtcbiAgICAgIHBsYWNlKG5vZGUsIHRvcCArIGJvdHRvbSwgZGVwdGggKiB3Z2FwKTtcbiAgICAgIHZhciBjaGlsZHJlbiA9IDA7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IEdbbm9kZV0ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKEdbbm9kZV1baV0pIGNoaWxkcmVuKys7XG4gICAgICB9XG4gICAgICB2YXIgdmdhcCA9IChib3R0b20gLSB0b3ApIC8gY2hpbGRyZW47XG4gICAgICB2YXIgY250ID0gMDtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgR1tub2RlXS5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoR1tub2RlXVtpXSkgZGZzKGksIGRlcHRoICsgMSwgdG9wICsgdmdhcCAqIGNudCwgdG9wICsgdmdhcCAqICsrY250KTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGRmcyhyb290LCAwLCAwLCAxKTtcblxuICAgIHRoaXMucmVmcmVzaCgpO1xuICB9XG5cbiAgc2V0RGF0YShHLCB1bmRpcmVjdGVkKSB7XG4gICAgaWYgKHN1cGVyLnNldERhdGEuYXBwbHkodGhpcywgYXJndW1lbnRzKSkgcmV0dXJuIHRydWU7XG5cbiAgICB0aGlzLmdyYXBoLmNsZWFyKCk7XG4gICAgY29uc3Qgbm9kZXMgPSBbXTtcbiAgICBjb25zdCBlZGdlcyA9IFtdO1xuICAgIGNvbnN0IHVuaXRBbmdsZSA9IDIgKiBNYXRoLlBJIC8gRy5sZW5ndGg7XG4gICAgbGV0IGN1cnJlbnRBbmdsZSA9IDA7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBHLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjdXJyZW50QW5nbGUgKz0gdW5pdEFuZ2xlO1xuICAgICAgbm9kZXMucHVzaCh7XG4gICAgICAgIGlkOiB0aGlzLm4oaSksXG4gICAgICAgIGxhYmVsOiAnJyArIGksXG4gICAgICAgIHg6IC41ICsgTWF0aC5zaW4oY3VycmVudEFuZ2xlKSAvIDIsXG4gICAgICAgIHk6IC41ICsgTWF0aC5jb3MoY3VycmVudEFuZ2xlKSAvIDIsXG4gICAgICAgIHNpemU6IDEsXG4gICAgICAgIGNvbG9yOiB0aGlzLmNvbG9yLmRlZmF1bHQsXG4gICAgICAgIHdlaWdodDogMFxuICAgICAgfSk7XG5cbiAgICAgIGlmICh1bmRpcmVjdGVkKSB7XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDw9IGk7IGorKykge1xuICAgICAgICAgIGlmIChHW2ldW2pdIHx8IEdbal1baV0pIHtcbiAgICAgICAgICAgIGVkZ2VzLnB1c2goe1xuICAgICAgICAgICAgICBpZDogdGhpcy5lKGksIGopLFxuICAgICAgICAgICAgICBzb3VyY2U6IHRoaXMubihpKSxcbiAgICAgICAgICAgICAgdGFyZ2V0OiB0aGlzLm4oaiksXG4gICAgICAgICAgICAgIGNvbG9yOiB0aGlzLmNvbG9yLmRlZmF1bHQsXG4gICAgICAgICAgICAgIHNpemU6IDEsXG4gICAgICAgICAgICAgIHdlaWdodDogcmVmaW5lQnlUeXBlKEdbaV1bal0pXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgR1tpXS5sZW5ndGg7IGorKykge1xuICAgICAgICAgIGlmIChHW2ldW2pdKSB7XG4gICAgICAgICAgICBlZGdlcy5wdXNoKHtcbiAgICAgICAgICAgICAgaWQ6IHRoaXMuZShpLCBqKSxcbiAgICAgICAgICAgICAgc291cmNlOiB0aGlzLm4oaSksXG4gICAgICAgICAgICAgIHRhcmdldDogdGhpcy5uKGopLFxuICAgICAgICAgICAgICBjb2xvcjogdGhpcy5jb2xvci5kZWZhdWx0LFxuICAgICAgICAgICAgICBzaXplOiAxLFxuICAgICAgICAgICAgICB3ZWlnaHQ6IHJlZmluZUJ5VHlwZShHW2ldW2pdKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5ncmFwaC5yZWFkKHtcbiAgICAgIG5vZGVzOiBub2RlcyxcbiAgICAgIGVkZ2VzOiBlZGdlc1xuICAgIH0pO1xuICAgIHRoaXMucy5jYW1lcmEuZ29Ubyh7XG4gICAgICB4OiAwLFxuICAgICAgeTogMCxcbiAgICAgIGFuZ2xlOiAwLFxuICAgICAgcmF0aW86IDFcbiAgICB9KTtcbiAgICB0aGlzLnJlZnJlc2goKTtcblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJlc2l6ZSgpIHtcbiAgICBzdXBlci5yZXNpemUoKTtcblxuICAgIHRoaXMucy5yZW5kZXJlcnNbMF0ucmVzaXplKCk7XG4gICAgdGhpcy5yZWZyZXNoKCk7XG4gIH1cblxuICByZWZyZXNoKCkge1xuICAgIHN1cGVyLnJlZnJlc2goKTtcblxuICAgIHRoaXMucy5yZWZyZXNoKCk7XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICBzdXBlci5jbGVhcigpO1xuXG4gICAgdGhpcy5jbGVhckdyYXBoQ29sb3IoKTtcbiAgfVxuXG4gIGNsZWFyR3JhcGhDb2xvcigpIHtcbiAgICB2YXIgdHJhY2VyID0gdGhpcztcblxuICAgIHRoaXMuZ3JhcGgubm9kZXMoKS5mb3JFYWNoKGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICBub2RlLmNvbG9yID0gdHJhY2VyLmNvbG9yLmRlZmF1bHQ7XG4gICAgfSk7XG4gICAgdGhpcy5ncmFwaC5lZGdlcygpLmZvckVhY2goZnVuY3Rpb24gKGVkZ2UpIHtcbiAgICAgIGVkZ2UuY29sb3IgPSB0cmFjZXIuY29sb3IuZGVmYXVsdDtcbiAgICB9KTtcbiAgfVxuXG4gIG4odikge1xuICAgIHJldHVybiAnbicgKyB2O1xuICB9XG5cbiAgZSh2MSwgdjIpIHtcbiAgICByZXR1cm4gJ2UnICsgdjEgKyAnXycgKyB2MjtcbiAgfVxuXG4gIGdldENvbG9yKGVkZ2UsIHNvdXJjZSwgdGFyZ2V0LCBzZXR0aW5ncykge1xuICAgIHZhciBjb2xvciA9IGVkZ2UuY29sb3IsXG4gICAgICBlZGdlQ29sb3IgPSBzZXR0aW5ncygnZWRnZUNvbG9yJyksXG4gICAgICBkZWZhdWx0Tm9kZUNvbG9yID0gc2V0dGluZ3MoJ2RlZmF1bHROb2RlQ29sb3InKSxcbiAgICAgIGRlZmF1bHRFZGdlQ29sb3IgPSBzZXR0aW5ncygnZGVmYXVsdEVkZ2VDb2xvcicpO1xuICAgIGlmICghY29sb3IpXG4gICAgICBzd2l0Y2ggKGVkZ2VDb2xvcikge1xuICAgICAgICBjYXNlICdzb3VyY2UnOlxuICAgICAgICAgIGNvbG9yID0gc291cmNlLmNvbG9yIHx8IGRlZmF1bHROb2RlQ29sb3I7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3RhcmdldCc6XG4gICAgICAgICAgY29sb3IgPSB0YXJnZXQuY29sb3IgfHwgZGVmYXVsdE5vZGVDb2xvcjtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBjb2xvciA9IGRlZmF1bHRFZGdlQ29sb3I7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICByZXR1cm4gY29sb3I7XG4gIH1cblxuICBkcmF3TGFiZWwobm9kZSwgY29udGV4dCwgc2V0dGluZ3MpIHtcbiAgICB2YXIgZm9udFNpemUsXG4gICAgICBwcmVmaXggPSBzZXR0aW5ncygncHJlZml4JykgfHwgJycsXG4gICAgICBzaXplID0gbm9kZVtwcmVmaXggKyAnc2l6ZSddO1xuXG4gICAgaWYgKHNpemUgPCBzZXR0aW5ncygnbGFiZWxUaHJlc2hvbGQnKSlcbiAgICAgIHJldHVybjtcblxuICAgIGlmICghbm9kZS5sYWJlbCB8fCB0eXBlb2Ygbm9kZS5sYWJlbCAhPT0gJ3N0cmluZycpXG4gICAgICByZXR1cm47XG5cbiAgICBmb250U2l6ZSA9IChzZXR0aW5ncygnbGFiZWxTaXplJykgPT09ICdmaXhlZCcpID9cbiAgICAgIHNldHRpbmdzKCdkZWZhdWx0TGFiZWxTaXplJykgOlxuICAgIHNldHRpbmdzKCdsYWJlbFNpemVSYXRpbycpICogc2l6ZTtcblxuICAgIGNvbnRleHQuZm9udCA9IChzZXR0aW5ncygnZm9udFN0eWxlJykgPyBzZXR0aW5ncygnZm9udFN0eWxlJykgKyAnICcgOiAnJykgK1xuICAgICAgZm9udFNpemUgKyAncHggJyArIHNldHRpbmdzKCdmb250Jyk7XG4gICAgY29udGV4dC5maWxsU3R5bGUgPSAoc2V0dGluZ3MoJ2xhYmVsQ29sb3InKSA9PT0gJ25vZGUnKSA/XG4gICAgICAobm9kZS5jb2xvciB8fCBzZXR0aW5ncygnZGVmYXVsdE5vZGVDb2xvcicpKSA6XG4gICAgICBzZXR0aW5ncygnZGVmYXVsdExhYmVsQ29sb3InKTtcblxuICAgIGNvbnRleHQudGV4dEFsaWduID0gJ2NlbnRlcic7XG4gICAgY29udGV4dC5maWxsVGV4dChcbiAgICAgIG5vZGUubGFiZWwsXG4gICAgICBNYXRoLnJvdW5kKG5vZGVbcHJlZml4ICsgJ3gnXSksXG4gICAgICBNYXRoLnJvdW5kKG5vZGVbcHJlZml4ICsgJ3knXSArIGZvbnRTaXplIC8gMylcbiAgICApO1xuICB9XG5cbiAgZHJhd0Fycm93KGVkZ2UsIHNvdXJjZSwgdGFyZ2V0LCBjb2xvciwgY29udGV4dCwgc2V0dGluZ3MpIHtcbiAgICB2YXIgcHJlZml4ID0gc2V0dGluZ3MoJ3ByZWZpeCcpIHx8ICcnLFxuICAgICAgc2l6ZSA9IGVkZ2VbcHJlZml4ICsgJ3NpemUnXSB8fCAxLFxuICAgICAgdFNpemUgPSB0YXJnZXRbcHJlZml4ICsgJ3NpemUnXSxcbiAgICAgIHNYID0gc291cmNlW3ByZWZpeCArICd4J10sXG4gICAgICBzWSA9IHNvdXJjZVtwcmVmaXggKyAneSddLFxuICAgICAgdFggPSB0YXJnZXRbcHJlZml4ICsgJ3gnXSxcbiAgICAgIHRZID0gdGFyZ2V0W3ByZWZpeCArICd5J10sXG4gICAgICBhbmdsZSA9IE1hdGguYXRhbjIodFkgLSBzWSwgdFggLSBzWCksXG4gICAgICBkaXN0ID0gMztcbiAgICBzWCArPSBNYXRoLnNpbihhbmdsZSkgKiBkaXN0O1xuICAgIHRYICs9IE1hdGguc2luKGFuZ2xlKSAqIGRpc3Q7XG4gICAgc1kgKz0gLU1hdGguY29zKGFuZ2xlKSAqIGRpc3Q7XG4gICAgdFkgKz0gLU1hdGguY29zKGFuZ2xlKSAqIGRpc3Q7XG4gICAgdmFyIGFTaXplID0gTWF0aC5tYXgoc2l6ZSAqIDIuNSwgc2V0dGluZ3MoJ21pbkFycm93U2l6ZScpKSxcbiAgICAgIGQgPSBNYXRoLnNxcnQoTWF0aC5wb3codFggLSBzWCwgMikgKyBNYXRoLnBvdyh0WSAtIHNZLCAyKSksXG4gICAgICBhWCA9IHNYICsgKHRYIC0gc1gpICogKGQgLSBhU2l6ZSAtIHRTaXplKSAvIGQsXG4gICAgICBhWSA9IHNZICsgKHRZIC0gc1kpICogKGQgLSBhU2l6ZSAtIHRTaXplKSAvIGQsXG4gICAgICB2WCA9ICh0WCAtIHNYKSAqIGFTaXplIC8gZCxcbiAgICAgIHZZID0gKHRZIC0gc1kpICogYVNpemUgLyBkO1xuXG4gICAgY29udGV4dC5zdHJva2VTdHlsZSA9IGNvbG9yO1xuICAgIGNvbnRleHQubGluZVdpZHRoID0gc2l6ZTtcbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgIGNvbnRleHQubW92ZVRvKHNYLCBzWSk7XG4gICAgY29udGV4dC5saW5lVG8oXG4gICAgICBhWCxcbiAgICAgIGFZXG4gICAgKTtcbiAgICBjb250ZXh0LnN0cm9rZSgpO1xuXG4gICAgY29udGV4dC5maWxsU3R5bGUgPSBjb2xvcjtcbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgIGNvbnRleHQubW92ZVRvKGFYICsgdlgsIGFZICsgdlkpO1xuICAgIGNvbnRleHQubGluZVRvKGFYICsgdlkgKiAwLjYsIGFZIC0gdlggKiAwLjYpO1xuICAgIGNvbnRleHQubGluZVRvKGFYIC0gdlkgKiAwLjYsIGFZICsgdlggKiAwLjYpO1xuICAgIGNvbnRleHQubGluZVRvKGFYICsgdlgsIGFZICsgdlkpO1xuICAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XG4gICAgY29udGV4dC5maWxsKCk7XG4gIH1cblxuICBkcmF3T25Ib3Zlcihub2RlLCBjb250ZXh0LCBzZXR0aW5ncywgbmV4dCkge1xuICAgIHZhciB0cmFjZXIgPSB0aGlzO1xuXG4gICAgY29udGV4dC5zZXRMaW5lRGFzaChbNSwgNV0pO1xuICAgIHZhciBub2RlSWR4ID0gbm9kZS5pZC5zdWJzdHJpbmcoMSk7XG4gICAgdGhpcy5ncmFwaC5lZGdlcygpLmZvckVhY2goZnVuY3Rpb24gKGVkZ2UpIHtcbiAgICAgIHZhciBlbmRzID0gZWRnZS5pZC5zdWJzdHJpbmcoMSkuc3BsaXQoXCJfXCIpO1xuICAgICAgaWYgKGVuZHNbMF0gPT0gbm9kZUlkeCkge1xuICAgICAgICB2YXIgY29sb3IgPSAnIzBmZic7XG4gICAgICAgIHZhciBzb3VyY2UgPSBub2RlO1xuICAgICAgICB2YXIgdGFyZ2V0ID0gdHJhY2VyLmdyYXBoLm5vZGVzKCduJyArIGVuZHNbMV0pO1xuICAgICAgICB0cmFjZXIuZHJhd0Fycm93KGVkZ2UsIHNvdXJjZSwgdGFyZ2V0LCBjb2xvciwgY29udGV4dCwgc2V0dGluZ3MpO1xuICAgICAgICBpZiAobmV4dCkgbmV4dChlZGdlLCBzb3VyY2UsIHRhcmdldCwgY29sb3IsIGNvbnRleHQsIHNldHRpbmdzKTtcbiAgICAgIH0gZWxzZSBpZiAoZW5kc1sxXSA9PSBub2RlSWR4KSB7XG4gICAgICAgIHZhciBjb2xvciA9ICcjZmYwJztcbiAgICAgICAgdmFyIHNvdXJjZSA9IHRyYWNlci5ncmFwaC5ub2RlcygnbicgKyBlbmRzWzBdKTtcbiAgICAgICAgdmFyIHRhcmdldCA9IG5vZGU7XG4gICAgICAgIHRyYWNlci5kcmF3QXJyb3coZWRnZSwgc291cmNlLCB0YXJnZXQsIGNvbG9yLCBjb250ZXh0LCBzZXR0aW5ncyk7XG4gICAgICAgIGlmIChuZXh0KSBuZXh0KGVkZ2UsIHNvdXJjZSwgdGFyZ2V0LCBjb2xvciwgY29udGV4dCwgc2V0dGluZ3MpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59XG5cbmNvbnN0IGluaXRWaWV3ID0gKHRyYWNlcikgPT4ge1xuICB0cmFjZXIucyA9IHRyYWNlci5jYXBzdWxlLnMgPSBuZXcgc2lnbWEoe1xuICAgIHJlbmRlcmVyOiB7XG4gICAgICBjb250YWluZXI6IHRyYWNlci4kY29udGFpbmVyWzBdLFxuICAgICAgdHlwZTogJ2NhbnZhcydcbiAgICB9LFxuICAgIHNldHRpbmdzOiB7XG4gICAgICBtaW5BcnJvd1NpemU6IDgsXG4gICAgICBkZWZhdWx0RWRnZVR5cGU6ICdhcnJvdycsXG4gICAgICBtYXhFZGdlU2l6ZTogMi41LFxuICAgICAgbGFiZWxUaHJlc2hvbGQ6IDQsXG4gICAgICBmb250OiAnUm9ib3RvJyxcbiAgICAgIGRlZmF1bHRMYWJlbENvbG9yOiAnI2ZmZicsXG4gICAgICB6b29tTWluOiAwLjYsXG4gICAgICB6b29tTWF4OiAxLjIsXG4gICAgICBza2lwRXJyb3JzOiB0cnVlLFxuICAgICAgbWluTm9kZVNpemU6IC41LFxuICAgICAgbWF4Tm9kZVNpemU6IDEyLFxuICAgICAgbGFiZWxTaXplOiAncHJvcG9ydGlvbmFsJyxcbiAgICAgIGxhYmVsU2l6ZVJhdGlvOiAxLjMsXG4gICAgICBmdW5jTGFiZWxzRGVmKG5vZGUsIGNvbnRleHQsIHNldHRpbmdzKSB7XG4gICAgICAgIHRyYWNlci5kcmF3TGFiZWwobm9kZSwgY29udGV4dCwgc2V0dGluZ3MpO1xuICAgICAgfSxcbiAgICAgIGZ1bmNIb3ZlcnNEZWYobm9kZSwgY29udGV4dCwgc2V0dGluZ3MsIG5leHQpIHtcbiAgICAgICAgdHJhY2VyLmRyYXdPbkhvdmVyKG5vZGUsIGNvbnRleHQsIHNldHRpbmdzLCBuZXh0KTtcbiAgICAgIH0sXG4gICAgICBmdW5jRWRnZXNBcnJvdyhlZGdlLCBzb3VyY2UsIHRhcmdldCwgY29udGV4dCwgc2V0dGluZ3MpIHtcbiAgICAgICAgdmFyIGNvbG9yID0gdHJhY2VyLmdldENvbG9yKGVkZ2UsIHNvdXJjZSwgdGFyZ2V0LCBzZXR0aW5ncyk7XG4gICAgICAgIHRyYWNlci5kcmF3QXJyb3coZWRnZSwgc291cmNlLCB0YXJnZXQsIGNvbG9yLCBjb250ZXh0LCBzZXR0aW5ncyk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgc2lnbWEucGx1Z2lucy5kcmFnTm9kZXModHJhY2VyLnMsIHRyYWNlci5zLnJlbmRlcmVyc1swXSk7XG4gIHRyYWNlci5ncmFwaCA9IHRyYWNlci5jYXBzdWxlLmdyYXBoID0gdHJhY2VyLnMuZ3JhcGg7XG59O1xuXG5zaWdtYS5jYW52YXMubGFiZWxzLmRlZiA9IGZ1bmN0aW9uIChub2RlLCBjb250ZXh0LCBzZXR0aW5ncykge1xuICB2YXIgZnVuYyA9IHNldHRpbmdzKCdmdW5jTGFiZWxzRGVmJyk7XG4gIGlmIChmdW5jKSB7XG4gICAgZnVuYyhub2RlLCBjb250ZXh0LCBzZXR0aW5ncyk7XG4gIH1cbn07XG5zaWdtYS5jYW52YXMuaG92ZXJzLmRlZiA9IGZ1bmN0aW9uIChub2RlLCBjb250ZXh0LCBzZXR0aW5ncykge1xuICB2YXIgZnVuYyA9IHNldHRpbmdzKCdmdW5jSG92ZXJzRGVmJyk7XG4gIGlmIChmdW5jKSB7XG4gICAgZnVuYyhub2RlLCBjb250ZXh0LCBzZXR0aW5ncyk7XG4gIH1cbn07XG5zaWdtYS5jYW52YXMuZWRnZXMuZGVmID0gZnVuY3Rpb24gKGVkZ2UsIHNvdXJjZSwgdGFyZ2V0LCBjb250ZXh0LCBzZXR0aW5ncykge1xuICB2YXIgZnVuYyA9IHNldHRpbmdzKCdmdW5jRWRnZXNEZWYnKTtcbiAgaWYgKGZ1bmMpIHtcbiAgICBmdW5jKGVkZ2UsIHNvdXJjZSwgdGFyZ2V0LCBjb250ZXh0LCBzZXR0aW5ncyk7XG4gIH1cbn07XG5zaWdtYS5jYW52YXMuZWRnZXMuYXJyb3cgPSBmdW5jdGlvbiAoZWRnZSwgc291cmNlLCB0YXJnZXQsIGNvbnRleHQsIHNldHRpbmdzKSB7XG4gIHZhciBmdW5jID0gc2V0dGluZ3MoJ2Z1bmNFZGdlc0Fycm93Jyk7XG4gIGlmIChmdW5jKSB7XG4gICAgZnVuYyhlZGdlLCBzb3VyY2UsIHRhcmdldCwgY29udGV4dCwgc2V0dGluZ3MpO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IERpcmVjdGVkR3JhcGhUcmFjZXI7IiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBUcmFjZXIgPSByZXF1aXJlKCcuL3RyYWNlcicpO1xuY29uc3QgTG9nVHJhY2VyID0gcmVxdWlyZSgnLi9sb2cnKTtcbmNvbnN0IEFycmF5MURUcmFjZXIgPSByZXF1aXJlKCcuL2FycmF5MWQnKTtcbmNvbnN0IEFycmF5MkRUcmFjZXIgPSByZXF1aXJlKCcuL2FycmF5MmQnKTtcbmNvbnN0IENoYXJ0VHJhY2VyID0gcmVxdWlyZSgnLi9jaGFydCcpO1xuY29uc3QgQ29vcmRpbmF0ZVN5c3RlbVRyYWNlciA9IHJlcXVpcmUoJy4vY29vcmRpbmF0ZV9zeXN0ZW0nKTtcbmNvbnN0IERpcmVjdGVkR3JhcGhUcmFjZXIgPSByZXF1aXJlKCcuL2RpcmVjdGVkX2dyYXBoJyk7XG5jb25zdCBVbmRpcmVjdGVkR3JhcGhUcmFjZXIgPSByZXF1aXJlKCcuL3VuZGlyZWN0ZWRfZ3JhcGgnKTtcbmNvbnN0IFdlaWdodGVkRGlyZWN0ZWRHcmFwaFRyYWNlciA9IHJlcXVpcmUoJy4vd2VpZ2h0ZWRfZGlyZWN0ZWRfZ3JhcGgnKTtcbmNvbnN0IFdlaWdodGVkVW5kaXJlY3RlZEdyYXBoVHJhY2VyID0gcmVxdWlyZSgnLi93ZWlnaHRlZF91bmRpcmVjdGVkX2dyYXBoJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBUcmFjZXIsXG4gIExvZ1RyYWNlcixcbiAgQXJyYXkxRFRyYWNlcixcbiAgQXJyYXkyRFRyYWNlcixcbiAgQ2hhcnRUcmFjZXIsXG4gIENvb3JkaW5hdGVTeXN0ZW1UcmFjZXIsXG4gIERpcmVjdGVkR3JhcGhUcmFjZXIsXG4gIFVuZGlyZWN0ZWRHcmFwaFRyYWNlcixcbiAgV2VpZ2h0ZWREaXJlY3RlZEdyYXBoVHJhY2VyLFxuICBXZWlnaHRlZFVuZGlyZWN0ZWRHcmFwaFRyYWNlclxufTsiLCJjb25zdCBUcmFjZXIgPSByZXF1aXJlKCcuL3RyYWNlcicpO1xuXG5jbGFzcyBMb2dUcmFjZXIgZXh0ZW5kcyBUcmFjZXIge1xuICBzdGF0aWMgZ2V0Q2xhc3NOYW1lKCkge1xuICAgIHJldHVybiAnTG9nVHJhY2VyJztcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKG5hbWUpIHtcbiAgICBzdXBlcihuYW1lKTtcblxuICAgIGlmICh0aGlzLmlzTmV3KSBpbml0Vmlldyh0aGlzKTtcbiAgfVxuXG4gIF9wcmludChtc2cpIHtcbiAgICB0aGlzLm1hbmFnZXIucHVzaFN0ZXAodGhpcy5jYXBzdWxlLCB7XG4gICAgICB0eXBlOiAncHJpbnQnLFxuICAgICAgbXNnOiBtc2dcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHByb2Nlc3NTdGVwKHN0ZXAsIG9wdGlvbnMpIHtcbiAgICBzd2l0Y2ggKHN0ZXAudHlwZSkge1xuICAgICAgY2FzZSAncHJpbnQnOlxuICAgICAgICB0aGlzLnByaW50KHN0ZXAubXNnKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgcmVmcmVzaCgpIHtcbiAgICB0aGlzLnNjcm9sbFRvRW5kKE1hdGgubWluKDUwLCB0aGlzLmludGVydmFsKSk7XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICBzdXBlci5jbGVhcigpO1xuXG4gICAgdGhpcy4kd3JhcHBlci5lbXB0eSgpO1xuICB9XG5cbiAgcHJpbnQobWVzc2FnZSkge1xuICAgIHRoaXMuJHdyYXBwZXIuYXBwZW5kKCQoJzxzcGFuPicpLmFwcGVuZChtZXNzYWdlICsgJzxici8+JykpO1xuICB9XG5cbiAgc2Nyb2xsVG9FbmQoZHVyYXRpb24pIHtcbiAgICB0aGlzLiRjb250YWluZXIuYW5pbWF0ZSh7XG4gICAgICBzY3JvbGxUb3A6IHRoaXMuJGNvbnRhaW5lclswXS5zY3JvbGxIZWlnaHRcbiAgICB9LCBkdXJhdGlvbik7XG4gIH1cbn1cblxuY29uc3QgaW5pdFZpZXcgPSAodHJhY2VyKSA9PiB7XG4gIHRyYWNlci4kd3JhcHBlciA9IHRyYWNlci5jYXBzdWxlLiR3cmFwcGVyID0gJCgnPGRpdiBjbGFzcz1cIndyYXBwZXJcIj4nKTtcbiAgdHJhY2VyLiRjb250YWluZXIuYXBwZW5kKHRyYWNlci4kd3JhcHBlcik7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IExvZ1RyYWNlcjsiLCJjb25zdCBhcHAgPSByZXF1aXJlKCcuLi8uLi9hcHAnKTtcblxuY29uc3Qge1xuICB0b0pTT04sXG4gIGZyb21KU09OXG59ID0gcmVxdWlyZSgnLi4vLi4vdHJhY2VyX21hbmFnZXIvdXRpbC9pbmRleCcpO1xuXG5jbGFzcyBUcmFjZXIge1xuICBzdGF0aWMgZ2V0Q2xhc3NOYW1lKCkge1xuICAgIHJldHVybiAnVHJhY2VyJztcbiAgfVxuICBcbiAgY29uc3RydWN0b3IobmFtZSkge1xuICAgIHRoaXMubW9kdWxlID0gdGhpcy5jb25zdHJ1Y3RvcjtcblxuICAgIHRoaXMubWFuYWdlciA9IGFwcC5nZXRUcmFjZXJNYW5hZ2VyKCk7XG4gICAgdGhpcy5jYXBzdWxlID0gdGhpcy5tYW5hZ2VyLmFsbG9jYXRlKHRoaXMpO1xuICAgICQuZXh0ZW5kKHRoaXMsIHRoaXMuY2Fwc3VsZSk7XG5cbiAgICB0aGlzLnNldE5hbWUobmFtZSk7XG4gIH1cblxuICBfc2V0RGF0YSguLi5hcmdzKSB7XG4gICAgdGhpcy5tYW5hZ2VyLnB1c2hTdGVwKHRoaXMuY2Fwc3VsZSwge1xuICAgICAgdHlwZTogJ3NldERhdGEnLFxuICAgICAgYXJnczogdG9KU09OKGFyZ3MpXG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfY2xlYXIoKSB7XG4gICAgdGhpcy5tYW5hZ2VyLnB1c2hTdGVwKHRoaXMuY2Fwc3VsZSwge1xuICAgICAgdHlwZTogJ2NsZWFyJ1xuICAgIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgX3dhaXQoKSB7XG4gICAgdGhpcy5tYW5hZ2VyLm5ld1N0ZXAoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHByb2Nlc3NTdGVwKHN0ZXAsIG9wdGlvbnMpIHtcbiAgICBjb25zdCB7XG4gICAgICB0eXBlLFxuICAgICAgYXJnc1xuICAgIH0gPSBzdGVwO1xuXG4gICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICBjYXNlICdzZXREYXRhJzpcbiAgICAgICAgdGhpcy5zZXREYXRhKC4uLmZyb21KU09OKGFyZ3MpKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdjbGVhcic6XG4gICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgc2V0TmFtZShuYW1lKSB7XG4gICAgbGV0ICRuYW1lO1xuICAgIGlmICh0aGlzLmlzTmV3KSB7XG4gICAgICAkbmFtZSA9ICQoJzxzcGFuIGNsYXNzPVwibmFtZVwiPicpO1xuICAgICAgdGhpcy4kY29udGFpbmVyLmFwcGVuZCgkbmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICRuYW1lID0gdGhpcy4kY29udGFpbmVyLmZpbmQoJ3NwYW4ubmFtZScpO1xuICAgIH1cbiAgICAkbmFtZS50ZXh0KG5hbWUgfHwgdGhpcy5kZWZhdWx0TmFtZSk7XG4gIH1cblxuICBzZXREYXRhKCkge1xuICAgIGNvbnN0IGRhdGEgPSB0b0pTT04oYXJndW1lbnRzKTtcbiAgICBpZiAoIXRoaXMuaXNOZXcgJiYgdGhpcy5sYXN0RGF0YSA9PT0gZGF0YSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHRoaXMubGFzdERhdGEgPSB0aGlzLmNhcHN1bGUubGFzdERhdGEgPSBkYXRhO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJlc2l6ZSgpIHtcbiAgfVxuXG4gIHJlZnJlc2goKSB7XG4gIH1cblxuICBjbGVhcigpIHtcbiAgfVxuXG4gIGF0dGFjaCh0cmFjZXIpIHtcbiAgICBpZiAodHJhY2VyLm1vZHVsZSA9PT0gTG9nVHJhY2VyKSB7XG4gICAgICB0aGlzLmxvZ1RyYWNlciA9IHRyYWNlcjtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBtb3VzZWRvd24oZSkge1xuICB9XG5cbiAgbW91c2Vtb3ZlKGUpIHtcbiAgfVxuXG4gIG1vdXNldXAoZSkge1xuICB9XG5cbiAgbW91c2V3aGVlbChlKSB7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBUcmFjZXI7IiwiY29uc3QgRGlyZWN0ZWRHcmFwaFRyYWNlciA9IHJlcXVpcmUoJy4vZGlyZWN0ZWRfZ3JhcGgnKTtcblxuY2xhc3MgVW5kaXJlY3RlZEdyYXBoVHJhY2VyIGV4dGVuZHMgRGlyZWN0ZWRHcmFwaFRyYWNlciB7XG4gIHN0YXRpYyBnZXRDbGFzc05hbWUoKSB7XG4gICAgcmV0dXJuICdVbmRpcmVjdGVkR3JhcGhUcmFjZXInO1xuICB9XG5cbiAgY29uc3RydWN0b3IobmFtZSkge1xuICAgIHN1cGVyKG5hbWUpO1xuXG4gICAgaWYgKHRoaXMuaXNOZXcpIGluaXRWaWV3KHRoaXMpO1xuICB9XG5cbiAgc2V0RGF0YShHKSB7XG4gICAgcmV0dXJuIHN1cGVyLnNldERhdGEoRywgdHJ1ZSk7XG4gIH1cblxuICBlKHYxLCB2Mikge1xuICAgIGlmICh2MSA+IHYyKSB7XG4gICAgICB2YXIgdGVtcCA9IHYxO1xuICAgICAgdjEgPSB2MjtcbiAgICAgIHYyID0gdGVtcDtcbiAgICB9XG4gICAgcmV0dXJuICdlJyArIHYxICsgJ18nICsgdjI7XG4gIH1cblxuICBkcmF3T25Ib3Zlcihub2RlLCBjb250ZXh0LCBzZXR0aW5ncywgbmV4dCkge1xuICAgIHZhciB0cmFjZXIgPSB0aGlzO1xuXG4gICAgY29udGV4dC5zZXRMaW5lRGFzaChbNSwgNV0pO1xuICAgIHZhciBub2RlSWR4ID0gbm9kZS5pZC5zdWJzdHJpbmcoMSk7XG4gICAgdGhpcy5ncmFwaC5lZGdlcygpLmZvckVhY2goZnVuY3Rpb24gKGVkZ2UpIHtcbiAgICAgIHZhciBlbmRzID0gZWRnZS5pZC5zdWJzdHJpbmcoMSkuc3BsaXQoXCJfXCIpO1xuICAgICAgaWYgKGVuZHNbMF0gPT0gbm9kZUlkeCkge1xuICAgICAgICB2YXIgY29sb3IgPSAnIzBmZic7XG4gICAgICAgIHZhciBzb3VyY2UgPSBub2RlO1xuICAgICAgICB2YXIgdGFyZ2V0ID0gdHJhY2VyLmdyYXBoLm5vZGVzKCduJyArIGVuZHNbMV0pO1xuICAgICAgICB0cmFjZXIuZHJhd0VkZ2UoZWRnZSwgc291cmNlLCB0YXJnZXQsIGNvbG9yLCBjb250ZXh0LCBzZXR0aW5ncyk7XG4gICAgICAgIGlmIChuZXh0KSBuZXh0KGVkZ2UsIHNvdXJjZSwgdGFyZ2V0LCBjb2xvciwgY29udGV4dCwgc2V0dGluZ3MpO1xuICAgICAgfSBlbHNlIGlmIChlbmRzWzFdID09IG5vZGVJZHgpIHtcbiAgICAgICAgdmFyIGNvbG9yID0gJyMwZmYnO1xuICAgICAgICB2YXIgc291cmNlID0gdHJhY2VyLmdyYXBoLm5vZGVzKCduJyArIGVuZHNbMF0pO1xuICAgICAgICB2YXIgdGFyZ2V0ID0gbm9kZTtcbiAgICAgICAgdHJhY2VyLmRyYXdFZGdlKGVkZ2UsIHNvdXJjZSwgdGFyZ2V0LCBjb2xvciwgY29udGV4dCwgc2V0dGluZ3MpO1xuICAgICAgICBpZiAobmV4dCkgbmV4dChlZGdlLCBzb3VyY2UsIHRhcmdldCwgY29sb3IsIGNvbnRleHQsIHNldHRpbmdzKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGRyYXdFZGdlKGVkZ2UsIHNvdXJjZSwgdGFyZ2V0LCBjb2xvciwgY29udGV4dCwgc2V0dGluZ3MpIHtcbiAgICB2YXIgcHJlZml4ID0gc2V0dGluZ3MoJ3ByZWZpeCcpIHx8ICcnLFxuICAgICAgc2l6ZSA9IGVkZ2VbcHJlZml4ICsgJ3NpemUnXSB8fCAxO1xuXG4gICAgY29udGV4dC5zdHJva2VTdHlsZSA9IGNvbG9yO1xuICAgIGNvbnRleHQubGluZVdpZHRoID0gc2l6ZTtcbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgIGNvbnRleHQubW92ZVRvKFxuICAgICAgc291cmNlW3ByZWZpeCArICd4J10sXG4gICAgICBzb3VyY2VbcHJlZml4ICsgJ3knXVxuICAgICk7XG4gICAgY29udGV4dC5saW5lVG8oXG4gICAgICB0YXJnZXRbcHJlZml4ICsgJ3gnXSxcbiAgICAgIHRhcmdldFtwcmVmaXggKyAneSddXG4gICAgKTtcbiAgICBjb250ZXh0LnN0cm9rZSgpO1xuICB9XG59XG5cbmNvbnN0IGluaXRWaWV3ID0gKHRyYWNlcikgPT4ge1xuICB0cmFjZXIucy5zZXR0aW5ncyh7XG4gICAgZGVmYXVsdEVkZ2VUeXBlOiAnZGVmJyxcbiAgICBmdW5jRWRnZXNEZWYoZWRnZSwgc291cmNlLCB0YXJnZXQsIGNvbnRleHQsIHNldHRpbmdzKSB7XG4gICAgICB2YXIgY29sb3IgPSB0cmFjZXIuZ2V0Q29sb3IoZWRnZSwgc291cmNlLCB0YXJnZXQsIHNldHRpbmdzKTtcbiAgICAgIHRyYWNlci5kcmF3RWRnZShlZGdlLCBzb3VyY2UsIHRhcmdldCwgY29sb3IsIGNvbnRleHQsIHNldHRpbmdzKTtcbiAgICB9XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBVbmRpcmVjdGVkR3JhcGhUcmFjZXI7IiwiY29uc3QgRGlyZWN0ZWRHcmFwaFRyYWNlciA9IHJlcXVpcmUoJy4vZGlyZWN0ZWRfZ3JhcGgnKTtcblxuY29uc3Qge1xuICByZWZpbmVCeVR5cGVcbn0gPSByZXF1aXJlKCcuLi8uLi90cmFjZXJfbWFuYWdlci91dGlsL2luZGV4Jyk7XG5cbmNsYXNzIFdlaWdodGVkRGlyZWN0ZWRHcmFwaFRyYWNlciBleHRlbmRzIERpcmVjdGVkR3JhcGhUcmFjZXIge1xuICBzdGF0aWMgZ2V0Q2xhc3NOYW1lKCkge1xuICAgIHJldHVybiAnV2VpZ2h0ZWREaXJlY3RlZEdyYXBoVHJhY2VyJztcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKG5hbWUpIHtcbiAgICBzdXBlcihuYW1lKTtcblxuICAgIGlmICh0aGlzLmlzTmV3KSBpbml0Vmlldyh0aGlzKTtcbiAgfVxuXG4gIF93ZWlnaHQodGFyZ2V0LCB3ZWlnaHQpIHtcbiAgICB0aGlzLm1hbmFnZXIucHVzaFN0ZXAodGhpcy5jYXBzdWxlLCB7XG4gICAgICB0eXBlOiAnd2VpZ2h0JyxcbiAgICAgIHRhcmdldDogdGFyZ2V0LFxuICAgICAgd2VpZ2h0OiB3ZWlnaHRcbiAgICB9KTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIF92aXNpdCh0YXJnZXQsIHNvdXJjZSwgd2VpZ2h0KSB7XG4gICAgdGhpcy5tYW5hZ2VyLnB1c2hTdGVwKHRoaXMuY2Fwc3VsZSwge1xuICAgICAgdHlwZTogJ3Zpc2l0JyxcbiAgICAgIHRhcmdldDogdGFyZ2V0LFxuICAgICAgc291cmNlOiBzb3VyY2UsXG4gICAgICB3ZWlnaHQ6IHdlaWdodFxuICAgIH0pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgX2xlYXZlKHRhcmdldCwgc291cmNlLCB3ZWlnaHQpIHtcbiAgICB0aGlzLm1hbmFnZXIucHVzaFN0ZXAodGhpcy5jYXBzdWxlLCB7XG4gICAgICB0eXBlOiAnbGVhdmUnLFxuICAgICAgdGFyZ2V0OiB0YXJnZXQsXG4gICAgICBzb3VyY2U6IHNvdXJjZSxcbiAgICAgIHdlaWdodDogd2VpZ2h0XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBwcm9jZXNzU3RlcChzdGVwLCBvcHRpb25zKSB7XG4gICAgc3dpdGNoIChzdGVwLnR5cGUpIHtcbiAgICAgIGNhc2UgJ3dlaWdodCc6XG4gICAgICAgIHZhciB0YXJnZXROb2RlID0gdGhpcy5ncmFwaC5ub2Rlcyh0aGlzLm4oc3RlcC50YXJnZXQpKTtcbiAgICAgICAgaWYgKHN0ZXAud2VpZ2h0ICE9PSB1bmRlZmluZWQpIHRhcmdldE5vZGUud2VpZ2h0ID0gcmVmaW5lQnlUeXBlKHN0ZXAud2VpZ2h0KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICd2aXNpdCc6XG4gICAgICBjYXNlICdsZWF2ZSc6XG4gICAgICAgIHZhciB2aXNpdCA9IHN0ZXAudHlwZSA9PSAndmlzaXQnO1xuICAgICAgICB2YXIgdGFyZ2V0Tm9kZSA9IHRoaXMuZ3JhcGgubm9kZXModGhpcy5uKHN0ZXAudGFyZ2V0KSk7XG4gICAgICAgIHZhciBjb2xvciA9IHZpc2l0ID8gdGhpcy5jb2xvci52aXNpdGVkIDogdGhpcy5jb2xvci5sZWZ0O1xuICAgICAgICB0YXJnZXROb2RlLmNvbG9yID0gY29sb3I7XG4gICAgICAgIGlmIChzdGVwLndlaWdodCAhPT0gdW5kZWZpbmVkKSB0YXJnZXROb2RlLndlaWdodCA9IHJlZmluZUJ5VHlwZShzdGVwLndlaWdodCk7XG4gICAgICAgIGlmIChzdGVwLnNvdXJjZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdmFyIGVkZ2VJZCA9IHRoaXMuZShzdGVwLnNvdXJjZSwgc3RlcC50YXJnZXQpO1xuICAgICAgICAgIHZhciBlZGdlID0gdGhpcy5ncmFwaC5lZGdlcyhlZGdlSWQpO1xuICAgICAgICAgIGVkZ2UuY29sb3IgPSBjb2xvcjtcbiAgICAgICAgICB0aGlzLmdyYXBoLmRyb3BFZGdlKGVkZ2VJZCkuYWRkRWRnZShlZGdlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5sb2dUcmFjZXIpIHtcbiAgICAgICAgICB2YXIgc291cmNlID0gc3RlcC5zb3VyY2U7XG4gICAgICAgICAgaWYgKHNvdXJjZSA9PT0gdW5kZWZpbmVkKSBzb3VyY2UgPSAnJztcbiAgICAgICAgICB0aGlzLmxvZ1RyYWNlci5wcmludCh2aXNpdCA/IHNvdXJjZSArICcgLT4gJyArIHN0ZXAudGFyZ2V0IDogc291cmNlICsgJyA8LSAnICsgc3RlcC50YXJnZXQpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgc3VwZXIucHJvY2Vzc1N0ZXAoc3RlcCwgb3B0aW9ucyk7XG4gICAgfVxuICB9XG5cbiAgY2xlYXIoKSB7XG4gICAgc3VwZXIuY2xlYXIoKTtcblxuICAgIHRoaXMuY2xlYXJXZWlnaHRzKCk7XG4gIH1cblxuICBjbGVhcldlaWdodHMoKSB7XG4gICAgdGhpcy5ncmFwaC5ub2RlcygpLmZvckVhY2goZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgIG5vZGUud2VpZ2h0ID0gMDtcbiAgICB9KTtcbiAgfVxuXG4gIGRyYXdFZGdlV2VpZ2h0KGVkZ2UsIHNvdXJjZSwgdGFyZ2V0LCBjb2xvciwgY29udGV4dCwgc2V0dGluZ3MpIHtcbiAgICBpZiAoc291cmNlID09IHRhcmdldClcbiAgICAgIHJldHVybjtcblxuICAgIHZhciBwcmVmaXggPSBzZXR0aW5ncygncHJlZml4JykgfHwgJycsXG4gICAgICBzaXplID0gZWRnZVtwcmVmaXggKyAnc2l6ZSddIHx8IDE7XG5cbiAgICBpZiAoc2l6ZSA8IHNldHRpbmdzKCdlZGdlTGFiZWxUaHJlc2hvbGQnKSlcbiAgICAgIHJldHVybjtcblxuICAgIGlmICgwID09PSBzZXR0aW5ncygnZWRnZUxhYmVsU2l6ZVBvd1JhdGlvJykpXG4gICAgICB0aHJvdyAnXCJlZGdlTGFiZWxTaXplUG93UmF0aW9cIiBtdXN0IG5vdCBiZSAwLic7XG5cbiAgICB2YXIgZm9udFNpemUsXG4gICAgICB4ID0gKHNvdXJjZVtwcmVmaXggKyAneCddICsgdGFyZ2V0W3ByZWZpeCArICd4J10pIC8gMixcbiAgICAgIHkgPSAoc291cmNlW3ByZWZpeCArICd5J10gKyB0YXJnZXRbcHJlZml4ICsgJ3knXSkgLyAyLFxuICAgICAgZFggPSB0YXJnZXRbcHJlZml4ICsgJ3gnXSAtIHNvdXJjZVtwcmVmaXggKyAneCddLFxuICAgICAgZFkgPSB0YXJnZXRbcHJlZml4ICsgJ3knXSAtIHNvdXJjZVtwcmVmaXggKyAneSddLFxuICAgICAgYW5nbGUgPSBNYXRoLmF0YW4yKGRZLCBkWCk7XG5cbiAgICBmb250U2l6ZSA9IChzZXR0aW5ncygnZWRnZUxhYmVsU2l6ZScpID09PSAnZml4ZWQnKSA/XG4gICAgICBzZXR0aW5ncygnZGVmYXVsdEVkZ2VMYWJlbFNpemUnKSA6XG4gICAgc2V0dGluZ3MoJ2RlZmF1bHRFZGdlTGFiZWxTaXplJykgKlxuICAgIHNpemUgKlxuICAgIE1hdGgucG93KHNpemUsIC0xIC8gc2V0dGluZ3MoJ2VkZ2VMYWJlbFNpemVQb3dSYXRpbycpKTtcblxuICAgIGNvbnRleHQuc2F2ZSgpO1xuXG4gICAgaWYgKGVkZ2UuYWN0aXZlKSB7XG4gICAgICBjb250ZXh0LmZvbnQgPSBbXG4gICAgICAgIHNldHRpbmdzKCdhY3RpdmVGb250U3R5bGUnKSxcbiAgICAgICAgZm9udFNpemUgKyAncHgnLFxuICAgICAgICBzZXR0aW5ncygnYWN0aXZlRm9udCcpIHx8IHNldHRpbmdzKCdmb250JylcbiAgICAgIF0uam9pbignICcpO1xuXG4gICAgICBjb250ZXh0LmZpbGxTdHlsZSA9IGNvbG9yO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb250ZXh0LmZvbnQgPSBbXG4gICAgICAgIHNldHRpbmdzKCdmb250U3R5bGUnKSxcbiAgICAgICAgZm9udFNpemUgKyAncHgnLFxuICAgICAgICBzZXR0aW5ncygnZm9udCcpXG4gICAgICBdLmpvaW4oJyAnKTtcblxuICAgICAgY29udGV4dC5maWxsU3R5bGUgPSBjb2xvcjtcbiAgICB9XG5cbiAgICBjb250ZXh0LnRleHRBbGlnbiA9ICdjZW50ZXInO1xuICAgIGNvbnRleHQudGV4dEJhc2VsaW5lID0gJ2FscGhhYmV0aWMnO1xuXG4gICAgY29udGV4dC50cmFuc2xhdGUoeCwgeSk7XG4gICAgY29udGV4dC5yb3RhdGUoYW5nbGUpO1xuICAgIGNvbnRleHQuZmlsbFRleHQoXG4gICAgICBlZGdlLndlaWdodCxcbiAgICAgIDAsXG4gICAgICAoLXNpemUgLyAyKSAtIDNcbiAgICApO1xuXG4gICAgY29udGV4dC5yZXN0b3JlKCk7XG4gIH1cblxuICBkcmF3Tm9kZVdlaWdodChub2RlLCBjb250ZXh0LCBzZXR0aW5ncykge1xuICAgIHZhciBmb250U2l6ZSxcbiAgICAgIHByZWZpeCA9IHNldHRpbmdzKCdwcmVmaXgnKSB8fCAnJyxcbiAgICAgIHNpemUgPSBub2RlW3ByZWZpeCArICdzaXplJ107XG5cbiAgICBpZiAoc2l6ZSA8IHNldHRpbmdzKCdsYWJlbFRocmVzaG9sZCcpKVxuICAgICAgcmV0dXJuO1xuXG4gICAgZm9udFNpemUgPSAoc2V0dGluZ3MoJ2xhYmVsU2l6ZScpID09PSAnZml4ZWQnKSA/XG4gICAgICBzZXR0aW5ncygnZGVmYXVsdExhYmVsU2l6ZScpIDpcbiAgICBzZXR0aW5ncygnbGFiZWxTaXplUmF0aW8nKSAqIHNpemU7XG5cbiAgICBjb250ZXh0LmZvbnQgPSAoc2V0dGluZ3MoJ2ZvbnRTdHlsZScpID8gc2V0dGluZ3MoJ2ZvbnRTdHlsZScpICsgJyAnIDogJycpICtcbiAgICAgIGZvbnRTaXplICsgJ3B4ICcgKyBzZXR0aW5ncygnZm9udCcpO1xuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gKHNldHRpbmdzKCdsYWJlbENvbG9yJykgPT09ICdub2RlJykgP1xuICAgICAgKG5vZGUuY29sb3IgfHwgc2V0dGluZ3MoJ2RlZmF1bHROb2RlQ29sb3InKSkgOlxuICAgICAgc2V0dGluZ3MoJ2RlZmF1bHRMYWJlbENvbG9yJyk7XG5cbiAgICBjb250ZXh0LnRleHRBbGlnbiA9ICdsZWZ0JztcbiAgICBjb250ZXh0LmZpbGxUZXh0KFxuICAgICAgbm9kZS53ZWlnaHQsXG4gICAgICBNYXRoLnJvdW5kKG5vZGVbcHJlZml4ICsgJ3gnXSArIHNpemUgKiAxLjUpLFxuICAgICAgTWF0aC5yb3VuZChub2RlW3ByZWZpeCArICd5J10gKyBmb250U2l6ZSAvIDMpXG4gICAgKTtcbiAgfVxufVxuXG5jb25zdCBpbml0VmlldyA9ICh0cmFjZXIpID0+IHtcbiAgdHJhY2VyLnMuc2V0dGluZ3Moe1xuICAgIGVkZ2VMYWJlbFNpemU6ICdwcm9wb3J0aW9uYWwnLFxuICAgIGRlZmF1bHRFZGdlTGFiZWxTaXplOiAyMCxcbiAgICBlZGdlTGFiZWxTaXplUG93UmF0aW86IDAuOCxcbiAgICBmdW5jTGFiZWxzRGVmKG5vZGUsIGNvbnRleHQsIHNldHRpbmdzKSB7XG4gICAgICB0cmFjZXIuZHJhd05vZGVXZWlnaHQobm9kZSwgY29udGV4dCwgc2V0dGluZ3MpO1xuICAgICAgdHJhY2VyLmRyYXdMYWJlbChub2RlLCBjb250ZXh0LCBzZXR0aW5ncyk7XG4gICAgfSxcbiAgICBmdW5jSG92ZXJzRGVmKG5vZGUsIGNvbnRleHQsIHNldHRpbmdzKSB7XG4gICAgICB0cmFjZXIuZHJhd09uSG92ZXIobm9kZSwgY29udGV4dCwgc2V0dGluZ3MsIHRyYWNlci5kcmF3RWRnZVdlaWdodCk7XG4gICAgfSxcbiAgICBmdW5jRWRnZXNBcnJvdyhlZGdlLCBzb3VyY2UsIHRhcmdldCwgY29udGV4dCwgc2V0dGluZ3MpIHtcbiAgICAgIHZhciBjb2xvciA9IHRyYWNlci5nZXRDb2xvcihlZGdlLCBzb3VyY2UsIHRhcmdldCwgc2V0dGluZ3MpO1xuICAgICAgdHJhY2VyLmRyYXdBcnJvdyhlZGdlLCBzb3VyY2UsIHRhcmdldCwgY29sb3IsIGNvbnRleHQsIHNldHRpbmdzKTtcbiAgICAgIHRyYWNlci5kcmF3RWRnZVdlaWdodChlZGdlLCBzb3VyY2UsIHRhcmdldCwgY29sb3IsIGNvbnRleHQsIHNldHRpbmdzKTtcbiAgICB9XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBXZWlnaHRlZERpcmVjdGVkR3JhcGhUcmFjZXI7IiwiY29uc3QgV2VpZ2h0ZWREaXJlY3RlZEdyYXBoVHJhY2VyID0gcmVxdWlyZSgnLi93ZWlnaHRlZF9kaXJlY3RlZF9ncmFwaCcpO1xuY29uc3QgVW5kaXJlY3RlZEdyYXBoVHJhY2VyID0gcmVxdWlyZSgnLi91bmRpcmVjdGVkX2dyYXBoJyk7XG5cbmNsYXNzIFdlaWdodGVkVW5kaXJlY3RlZEdyYXBoVHJhY2VyIGV4dGVuZHMgV2VpZ2h0ZWREaXJlY3RlZEdyYXBoVHJhY2VyIHtcbiAgc3RhdGljIGdldENsYXNzTmFtZSgpIHtcbiAgICByZXR1cm4gJ1dlaWdodGVkVW5kaXJlY3RlZEdyYXBoVHJhY2VyJztcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKG5hbWUpIHtcbiAgICBzdXBlcihuYW1lKTtcblxuICAgIHRoaXMuZSA9IFVuZGlyZWN0ZWRHcmFwaFRyYWNlci5wcm90b3R5cGUuZTtcbiAgICB0aGlzLmRyYXdPbkhvdmVyID0gVW5kaXJlY3RlZEdyYXBoVHJhY2VyLnByb3RvdHlwZS5kcmF3T25Ib3ZlcjtcbiAgICB0aGlzLmRyYXdFZGdlID0gVW5kaXJlY3RlZEdyYXBoVHJhY2VyLnByb3RvdHlwZS5kcmF3RWRnZTtcblxuICAgIGlmICh0aGlzLmlzTmV3KSBpbml0Vmlldyh0aGlzKTtcbiAgfVxuXG4gIHNldERhdGEoRykge1xuICAgIHJldHVybiBzdXBlci5zZXREYXRhKEcsIHRydWUpO1xuICB9XG5cbiAgZHJhd0VkZ2VXZWlnaHQoZWRnZSwgc291cmNlLCB0YXJnZXQsIGNvbG9yLCBjb250ZXh0LCBzZXR0aW5ncykge1xuICAgIHZhciBwcmVmaXggPSBzZXR0aW5ncygncHJlZml4JykgfHwgJyc7XG4gICAgaWYgKHNvdXJjZVtwcmVmaXggKyAneCddID4gdGFyZ2V0W3ByZWZpeCArICd4J10pIHtcbiAgICAgIHZhciB0ZW1wID0gc291cmNlO1xuICAgICAgc291cmNlID0gdGFyZ2V0O1xuICAgICAgdGFyZ2V0ID0gdGVtcDtcbiAgICB9XG4gICAgV2VpZ2h0ZWREaXJlY3RlZEdyYXBoVHJhY2VyLnByb3RvdHlwZS5kcmF3RWRnZVdlaWdodC5jYWxsKHRoaXMsIGVkZ2UsIHNvdXJjZSwgdGFyZ2V0LCBjb2xvciwgY29udGV4dCwgc2V0dGluZ3MpO1xuICB9XG59XG5cbmNvbnN0IGluaXRWaWV3ID0gKHRyYWNlcikgPT4ge1xuICB0cmFjZXIucy5zZXR0aW5ncyh7XG4gICAgZGVmYXVsdEVkZ2VUeXBlOiAnZGVmJyxcbiAgICBmdW5jRWRnZXNEZWYoZWRnZSwgc291cmNlLCB0YXJnZXQsIGNvbnRleHQsIHNldHRpbmdzKSB7XG4gICAgICB2YXIgY29sb3IgPSB0cmFjZXIuZ2V0Q29sb3IoZWRnZSwgc291cmNlLCB0YXJnZXQsIHNldHRpbmdzKTtcbiAgICAgIHRyYWNlci5kcmF3RWRnZShlZGdlLCBzb3VyY2UsIHRhcmdldCwgY29sb3IsIGNvbnRleHQsIHNldHRpbmdzKTtcbiAgICAgIHRyYWNlci5kcmF3RWRnZVdlaWdodChlZGdlLCBzb3VyY2UsIHRhcmdldCwgY29sb3IsIGNvbnRleHQsIHNldHRpbmdzKTtcbiAgICB9XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBXZWlnaHRlZFVuZGlyZWN0ZWRHcmFwaFRyYWNlcjsiLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IHJlcXVlc3QgPSByZXF1aXJlKCcuL3JlcXVlc3QnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAodXJsKSA9PiB7XG5cbiAgcmV0dXJuIHJlcXVlc3QodXJsLCB7XG4gICAgdHlwZTogJ0dFVCdcbiAgfSk7XG59OyIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgcmVxdWVzdCA9IHJlcXVpcmUoJy4vcmVxdWVzdCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHVybCkge1xuICByZXR1cm4gcmVxdWVzdCh1cmwsIHtcbiAgICBkYXRhVHlwZTogJ2pzb24nLFxuICAgIHR5cGU6ICdHRVQnXG4gIH0pO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IHJlcXVlc3QgPSByZXF1aXJlKCcuL3JlcXVlc3QnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih1cmwsIGRhdGEpIHtcbiAgcmV0dXJuIHJlcXVlc3QodXJsLCB7XG4gICAgZGF0YVR5cGU6ICdqc29uJyxcbiAgICB0eXBlOiAnUE9TVCcsXG4gICAgZGF0YTogSlNPTi5zdHJpbmdpZnkoZGF0YSksXG4gIH0pO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IFJTVlAgPSByZXF1aXJlKCdyc3ZwJyk7XG5jb25zdCBhcHAgPSByZXF1aXJlKCcuLi8uLi9hcHAnKTtcblxuY29uc3Qge1xuICBhamF4LFxuICBleHRlbmRcbn0gPSAkO1xuXG5jb25zdCBkZWZhdWx0cyA9IHtcblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih1cmwsIG9wdGlvbnMgPSB7fSkge1xuICBhcHAuc2V0SXNMb2FkaW5nKHRydWUpO1xuXG4gIHJldHVybiBuZXcgUlNWUC5Qcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCBjYWxsYmFja3MgPSB7XG4gICAgICBzdWNjZXNzKHJlc3BvbnNlKSB7XG4gICAgICAgIGFwcC5zZXRJc0xvYWRpbmcoZmFsc2UpO1xuICAgICAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgIH0sXG4gICAgICBlcnJvcihyZWFzb24pIHtcbiAgICAgICAgYXBwLnNldElzTG9hZGluZyhmYWxzZSk7XG4gICAgICAgIHJlamVjdChyZWFzb24pO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCBvcHRzID0gZXh0ZW5kKHt9LCBkZWZhdWx0cywgb3B0aW9ucywgY2FsbGJhY2tzLCB7XG4gICAgICB1cmxcbiAgICB9KTtcblxuICAgIGFqYXgob3B0cyk7XG4gIH0pO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IGFwcCA9IHJlcXVpcmUoJy4uL2FwcCcpO1xuY29uc3QgVG9hc3QgPSByZXF1aXJlKCcuLi9kb20vdG9hc3QnKTtcblxuY29uc3QgY2hlY2tMb2FkaW5nID0gKCkgPT4ge1xuICBpZiAoYXBwLmdldElzTG9hZGluZygpKSB7XG4gICAgVG9hc3Quc2hvd0Vycm9yVG9hc3QoJ1dhaXQgdW50aWwgaXQgY29tcGxldGVzIGxvYWRpbmcgb2YgcHJldmlvdXMgZmlsZS4nKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59O1xuXG5jb25zdCBnZXRQYXJhbWV0ZXJCeU5hbWUgPSAobmFtZSkgPT4ge1xuICBjb25zdCB1cmwgPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcbiAgY29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKGBbPyZdJHtuYW1lfSg9KFteJiNdKil8JnwjfCQpYCk7XG5cbiAgY29uc3QgcmVzdWx0cyA9IHJlZ2V4LmV4ZWModXJsKTtcblxuICBpZiAoIXJlc3VsdHMgfHwgcmVzdWx0cy5sZW5ndGggIT09IDMpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGNvbnN0IFssICwgaWRdID0gcmVzdWx0cztcblxuICByZXR1cm4gaWQ7XG59O1xuXG5jb25zdCBnZXRIYXNoVmFsdWUgPSAoa2V5KT0+IHtcbiAgaWYgKCFrZXkpIHJldHVybiBudWxsO1xuICBjb25zdCBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2guc3Vic3RyKDEpO1xuICBjb25zdCBwYXJhbXMgPSBoYXNoID8gaGFzaC5zcGxpdCgnJicpIDogW107XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcGFyYW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgcGFpciA9IHBhcmFtc1tpXS5zcGxpdCgnPScpO1xuICAgIGlmIChwYWlyWzBdID09PSBrZXkpIHtcbiAgICAgIHJldHVybiBwYWlyWzFdO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVsbDtcbn07XG5cbmNvbnN0IHNldEhhc2hWYWx1ZSA9IChrZXksIHZhbHVlKT0+IHtcbiAgaWYgKCFrZXkgfHwgIXZhbHVlKSByZXR1cm47XG4gIGNvbnN0IGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHIoMSk7XG4gIGNvbnN0IHBhcmFtcyA9IGhhc2ggPyBoYXNoLnNwbGl0KCcmJykgOiBbXTtcblxuICBsZXQgZm91bmQgPSBmYWxzZTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXJhbXMubGVuZ3RoICYmICFmb3VuZDsgaSsrKSB7XG4gICAgY29uc3QgcGFpciA9IHBhcmFtc1tpXS5zcGxpdCgnPScpO1xuICAgIGlmIChwYWlyWzBdID09PSBrZXkpIHtcbiAgICAgIHBhaXJbMV0gPSB2YWx1ZTtcbiAgICAgIHBhcmFtc1tpXSA9IHBhaXIuam9pbignPScpO1xuICAgICAgZm91bmQgPSB0cnVlO1xuICAgIH1cbiAgfVxuICBpZiAoIWZvdW5kKSB7XG4gICAgcGFyYW1zLnB1c2goW2tleSwgdmFsdWVdLmpvaW4oJz0nKSk7XG4gIH1cblxuICBjb25zdCBuZXdIYXNoID0gcGFyYW1zLmpvaW4oJyYnKTtcbiAgd2luZG93LmxvY2F0aW9uLmhhc2ggPSBgIyR7bmV3SGFzaH1gO1xufTtcblxuY29uc3QgcmVtb3ZlSGFzaFZhbHVlID0gKGtleSkgPT4ge1xuICBpZiAoIWtleSkgcmV0dXJuO1xuICBjb25zdCBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2guc3Vic3RyKDEpO1xuICBjb25zdCBwYXJhbXMgPSBoYXNoID8gaGFzaC5zcGxpdCgnJicpIDogW107XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXJhbXMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBwYWlyID0gcGFyYW1zW2ldLnNwbGl0KCc9Jyk7XG4gICAgaWYgKHBhaXJbMF0gPT09IGtleSkge1xuICAgICAgcGFyYW1zLnNwbGljZShpLCAxKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IG5ld0hhc2ggPSBwYXJhbXMuam9pbignJicpO1xuICB3aW5kb3cubG9jYXRpb24uaGFzaCA9IGAjJHtuZXdIYXNofWA7XG59O1xuXG5jb25zdCBzZXRQYXRoID0gKGNhdGVnb3J5LCBhbGdvcml0aG0sIGZpbGUpID0+IHtcbiAgY29uc3QgcGF0aCA9IGNhdGVnb3J5ID8gY2F0ZWdvcnkgKyAoYWxnb3JpdGhtID8gYC8ke2FsZ29yaXRobX1gICsgKGZpbGUgPyBgLyR7ZmlsZX1gIDogJycpIDogJycpIDogJyc7XG4gIHNldEhhc2hWYWx1ZSgncGF0aCcsIHBhdGgpO1xufTtcblxuY29uc3QgZ2V0UGF0aCA9ICgpID0+IHtcbiAgY29uc3QgaGFzaCA9IGdldEhhc2hWYWx1ZSgncGF0aCcpO1xuICBpZiAoaGFzaCkge1xuICAgIGNvbnN0IFsgY2F0ZWdvcnksIGFsZ29yaXRobSwgZmlsZSBdID0gaGFzaC5zcGxpdCgnLycpO1xuICAgIHJldHVybiB7IGNhdGVnb3J5LCBhbGdvcml0aG0sIGZpbGUgfTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBjaGVja0xvYWRpbmcsXG4gIGdldFBhcmFtZXRlckJ5TmFtZSxcbiAgZ2V0SGFzaFZhbHVlLFxuICBzZXRIYXNoVmFsdWUsXG4gIHJlbW92ZUhhc2hWYWx1ZSxcbiAgc2V0UGF0aCxcbiAgZ2V0UGF0aFxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgbG9hZEFsZ29yaXRobSA9IHJlcXVpcmUoJy4vbG9hZF9hbGdvcml0aG0nKTtcbmNvbnN0IGxvYWRDYXRlZ29yaWVzID0gcmVxdWlyZSgnLi9sb2FkX2NhdGVnb3JpZXMnKTtcbmNvbnN0IGxvYWRGaWxlID0gcmVxdWlyZSgnLi9sb2FkX2ZpbGUnKTtcbmNvbnN0IGxvYWRTY3JhdGNoUGFwZXIgPSByZXF1aXJlKCcuL2xvYWRfc2NyYXRjaF9wYXBlcicpO1xuY29uc3Qgc2hhcmVTY3JhdGNoUGFwZXIgPSByZXF1aXJlKCcuL3NoYXJlX3NjcmF0Y2hfcGFwZXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGxvYWRBbGdvcml0aG0sXG4gIGxvYWRDYXRlZ29yaWVzLFxuICBsb2FkRmlsZSxcbiAgbG9hZFNjcmF0Y2hQYXBlcixcbiAgc2hhcmVTY3JhdGNoUGFwZXJcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBnZXRKU09OID0gcmVxdWlyZSgnLi9hamF4L2dldF9qc29uJyk7XG5cbmNvbnN0IHtcbiAgZ2V0QWxnb3JpdGhtRGlyXG59ID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAoY2F0ZWdvcnksIGFsZ29yaXRobSkgPT4ge1xuICBjb25zdCBkaXIgPSBnZXRBbGdvcml0aG1EaXIoY2F0ZWdvcnksIGFsZ29yaXRobSk7XG4gIHJldHVybiBnZXRKU09OKGAke2Rpcn1kZXNjLmpzb25gKTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBnZXRKU09OID0gcmVxdWlyZSgnLi9hamF4L2dldF9qc29uJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKCkgPT4ge1xuICByZXR1cm4gZ2V0SlNPTignLi9hbGdvcml0aG0vY2F0ZWdvcnkuanNvbicpO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IFJTVlAgPSByZXF1aXJlKCdyc3ZwJyk7XG5cbmNvbnN0IGFwcCA9IHJlcXVpcmUoJy4uL2FwcCcpO1xuXG5jb25zdCB7XG4gIGdldEZpbGVEaXIsXG4gIGlzU2NyYXRjaFBhcGVyXG59ID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxuY29uc3Qge1xuICBjaGVja0xvYWRpbmcsXG4gIHNldFBhdGhcbn0gPSByZXF1aXJlKCcuL2hlbHBlcnMnKTtcblxuY29uc3QgZ2V0ID0gcmVxdWlyZSgnLi9hamF4L2dldCcpO1xuXG5jb25zdCBsb2FkRGF0YUFuZENvZGUgPSAoZGlyKSA9PiB7XG4gIHJldHVybiBSU1ZQLmhhc2goe1xuICAgIGRhdGE6IGdldChgJHtkaXJ9ZGF0YS5qc2ApLFxuICAgIGNvZGU6IGdldChgJHtkaXJ9Y29kZS5qc2ApXG4gIH0pO1xufTtcblxuY29uc3QgbG9hZEZpbGVBbmRVcGRhdGVDb250ZW50ID0gKGRpcikgPT4ge1xuICBhcHAuZ2V0RWRpdG9yKCkuY2xlYXJDb250ZW50KCk7XG5cbiAgcmV0dXJuIGxvYWREYXRhQW5kQ29kZShkaXIpLnRoZW4oKGNvbnRlbnQpID0+IHtcbiAgICBhcHAudXBkYXRlQ2FjaGVkRmlsZShkaXIsIGNvbnRlbnQpO1xuICAgIGFwcC5nZXRFZGl0b3IoKS5zZXRDb250ZW50KGNvbnRlbnQpO1xuICB9KTtcbn07XG5cbmNvbnN0IGNhY2hlZENvbnRlbnRFeGlzdHMgPSAoY2FjaGVkRmlsZSkgPT4ge1xuICByZXR1cm4gY2FjaGVkRmlsZSAmJlxuICAgIGNhY2hlZEZpbGUuZGF0YSAhPT0gdW5kZWZpbmVkICYmXG4gICAgY2FjaGVkRmlsZS5jb2RlICE9PSB1bmRlZmluZWQ7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IChjYXRlZ29yeSwgYWxnb3JpdGhtLCBmaWxlLCBleHBsYW5hdGlvbikgPT4ge1xuICByZXR1cm4gbmV3IFJTVlAuUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgaWYgKGNoZWNrTG9hZGluZygpKSB7XG4gICAgICByZWplY3QoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGlzU2NyYXRjaFBhcGVyKGNhdGVnb3J5KSkge1xuICAgICAgICBzZXRQYXRoKGNhdGVnb3J5LCBhcHAuZ2V0TG9hZGVkU2NyYXRjaCgpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldFBhdGgoY2F0ZWdvcnksIGFsZ29yaXRobSwgZmlsZSk7XG4gICAgICB9XG4gICAgICAkKCcjZXhwbGFuYXRpb24nKS5odG1sKGV4cGxhbmF0aW9uKTtcblxuICAgICAgbGV0IGRpciA9IGdldEZpbGVEaXIoY2F0ZWdvcnksIGFsZ29yaXRobSwgZmlsZSk7XG4gICAgICBhcHAuc2V0TGFzdEZpbGVVc2VkKGRpcik7XG4gICAgICBjb25zdCBjYWNoZWRGaWxlID0gYXBwLmdldENhY2hlZEZpbGUoZGlyKTtcblxuICAgICAgaWYgKGNhY2hlZENvbnRlbnRFeGlzdHMoY2FjaGVkRmlsZSkpIHtcbiAgICAgICAgYXBwLmdldEVkaXRvcigpLnNldENvbnRlbnQoY2FjaGVkRmlsZSk7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxvYWRGaWxlQW5kVXBkYXRlQ29udGVudChkaXIpLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IFJTVlAgPSByZXF1aXJlKCdyc3ZwJyk7XG5jb25zdCBhcHAgPSByZXF1aXJlKCcuLi9hcHAnKTtcblxuY29uc3Qge1xuICBnZXRGaWxlRGlyXG59ID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcblxuY29uc3QgZ2V0SlNPTiA9IHJlcXVpcmUoJy4vYWpheC9nZXRfanNvbicpO1xuY29uc3QgbG9hZEFsZ29yaXRobSA9IHJlcXVpcmUoJy4vbG9hZF9hbGdvcml0aG0nKTtcblxuY29uc3QgZXh0cmFjdEdpc3RDb2RlID0gKGZpbGVzLCBuYW1lKSA9PiBmaWxlc1tgJHtuYW1lfS5qc2BdLmNvbnRlbnQ7XG5cbm1vZHVsZS5leHBvcnRzID0gKGdpc3RJRCkgPT4ge1xuICByZXR1cm4gbmV3IFJTVlAuUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgYXBwLnNldExvYWRlZFNjcmF0Y2goZ2lzdElEKTtcblxuICAgIGdldEpTT04oYGh0dHBzOi8vYXBpLmdpdGh1Yi5jb20vZ2lzdHMvJHtnaXN0SUR9YCkudGhlbigoe1xuICAgICAgZmlsZXNcbiAgICB9KSA9PiB7XG5cbiAgICAgIGNvbnN0IGNhdGVnb3J5ID0gJ3NjcmF0Y2gnO1xuICAgICAgY29uc3QgYWxnb3JpdGhtID0gZ2lzdElEO1xuXG4gICAgICBsb2FkQWxnb3JpdGhtKGNhdGVnb3J5LCBhbGdvcml0aG0pLnRoZW4oKGRhdGEpID0+IHtcblxuICAgICAgICBjb25zdCBhbGdvRGF0YSA9IGV4dHJhY3RHaXN0Q29kZShmaWxlcywgJ2RhdGEnKTtcbiAgICAgICAgY29uc3QgYWxnb0NvZGUgPSBleHRyYWN0R2lzdENvZGUoZmlsZXMsICdjb2RlJyk7XG5cbiAgICAgICAgLy8gdXBkYXRlIHNjcmF0Y2ggcGFwZXIgYWxnbyBjb2RlIHdpdGggdGhlIGxvYWRlZCBnaXN0IGNvZGVcbiAgICAgICAgY29uc3QgZGlyID0gZ2V0RmlsZURpcihjYXRlZ29yeSwgYWxnb3JpdGhtLCAnc2NyYXRjaF9wYXBlcicpO1xuICAgICAgICBhcHAudXBkYXRlQ2FjaGVkRmlsZShkaXIsIHtcbiAgICAgICAgICBkYXRhOiBhbGdvRGF0YSxcbiAgICAgICAgICBjb2RlOiBhbGdvQ29kZSxcbiAgICAgICAgICAnQ1JFRElULm1kJzogJ1NoYXJlZCBieSBhbiBhbm9ueW1vdXMgdXNlciBmcm9tIGh0dHA6Ly9wYXJranM4MTQuZ2l0aHViLmlvL0FsZ29yaXRobVZpc3VhbGl6ZXInXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgIGNhdGVnb3J5LFxuICAgICAgICAgIGFsZ29yaXRobSxcbiAgICAgICAgICBkYXRhXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG59OyIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgUlNWUCA9IHJlcXVpcmUoJ3JzdnAnKTtcbmNvbnN0IGFwcCA9IHJlcXVpcmUoJy4uL2FwcCcpO1xuXG5jb25zdCBwb3N0SlNPTiA9IHJlcXVpcmUoJy4vYWpheC9wb3N0X2pzb24nKTtcblxuY29uc3Qge1xuICBzZXRQYXRoXG59ID0gcmVxdWlyZSgnLi9oZWxwZXJzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gKCkgPT4ge1xuICByZXR1cm4gbmV3IFJTVlAuUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICBjb25zdCB7XG4gICAgICBkYXRhRWRpdG9yLFxuICAgICAgY29kZUVkaXRvclxuICAgIH0gPSBhcHAuZ2V0RWRpdG9yKCk7XG5cbiAgICBjb25zdCBnaXN0ID0ge1xuICAgICAgJ2Rlc2NyaXB0aW9uJzogJ3RlbXAnLFxuICAgICAgJ3B1YmxpYyc6IHRydWUsXG4gICAgICAnZmlsZXMnOiB7XG4gICAgICAgICdkYXRhLmpzJzoge1xuICAgICAgICAgICdjb250ZW50JzogZGF0YUVkaXRvci5nZXRWYWx1ZSgpXG4gICAgICAgIH0sXG4gICAgICAgICdjb2RlLmpzJzoge1xuICAgICAgICAgICdjb250ZW50JzogY29kZUVkaXRvci5nZXRWYWx1ZSgpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcG9zdEpTT04oJ2h0dHBzOi8vYXBpLmdpdGh1Yi5jb20vZ2lzdHMnLCBnaXN0KS50aGVuKCh7XG4gICAgICBpZFxuICAgIH0pID0+IHtcbiAgICAgIGFwcC5zZXRMb2FkZWRTY3JhdGNoKGlkKTtcbiAgICAgIHNldFBhdGgoJ3NjcmF0Y2gnLCBpZCk7XG4gICAgICBjb25zdCB7XG4gICAgICAgIGhyZWZcbiAgICAgIH0gPSBsb2NhdGlvbjtcbiAgICAgICQoJyNhbGdvcml0aG0nKS5odG1sKCdTaGFyZWQnKTtcbiAgICAgIHJlc29sdmUoaHJlZik7XG4gICAgfSk7XG4gIH0pO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IFRyYWNlck1hbmFnZXIgPSByZXF1aXJlKCcuL21hbmFnZXInKTtcbmNvbnN0IFRyYWNlciA9IHJlcXVpcmUoJy4uL21vZHVsZS90cmFjZXIvdHJhY2VyJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIGluaXQoKSB7XG4gICAgY29uc3QgdG0gPSBuZXcgVHJhY2VyTWFuYWdlcigpO1xuICAgIFRyYWNlci5wcm90b3R5cGUubWFuYWdlciA9IHRtO1xuICAgIHJldHVybiB0bTtcbiAgfVxuXG59OyIsIid1c2Ugc3RyaWN0JztcblxuY29uc3Qgc3RlcExpbWl0ID0gMWU2O1xuXG5jb25zdCBUcmFjZXJNYW5hZ2VyID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLnRpbWVyID0gbnVsbDtcbiAgdGhpcy5wYXVzZSA9IGZhbHNlO1xuICB0aGlzLmNhcHN1bGVzID0gW107XG4gIHRoaXMuaW50ZXJ2YWwgPSA1MDA7XG59O1xuXG5UcmFjZXJNYW5hZ2VyLnByb3RvdHlwZSA9IHtcblxuICBhZGQodHJhY2VyKSB7XG5cbiAgICBjb25zdCAkY29udGFpbmVyID0gJCgnPHNlY3Rpb24gY2xhc3M9XCJtb2R1bGVfd3JhcHBlclwiPicpO1xuICAgICQoJy5tb2R1bGVfY29udGFpbmVyJykuYXBwZW5kKCRjb250YWluZXIpO1xuXG4gICAgY29uc3QgY2Fwc3VsZSA9IHtcbiAgICAgIG1vZHVsZTogdHJhY2VyLm1vZHVsZSxcbiAgICAgIHRyYWNlcixcbiAgICAgIGFsbG9jYXRlZDogdHJ1ZSxcbiAgICAgIGRlZmF1bHROYW1lOiBudWxsLFxuICAgICAgJGNvbnRhaW5lcixcbiAgICAgIGlzTmV3OiB0cnVlXG4gICAgfTtcblxuICAgIHRoaXMuY2Fwc3VsZXMucHVzaChjYXBzdWxlKTtcbiAgICByZXR1cm4gY2Fwc3VsZTtcbiAgfSxcblxuICBhbGxvY2F0ZShuZXdUcmFjZXIpIHtcbiAgICBsZXQgc2VsZWN0ZWRDYXBzdWxlID0gbnVsbDtcbiAgICBsZXQgY291bnQgPSAwO1xuXG4gICAgJC5lYWNoKHRoaXMuY2Fwc3VsZXMsIChpLCBjYXBzdWxlKSA9PiB7XG4gICAgICBpZiAoY2Fwc3VsZS5tb2R1bGUgPT09IG5ld1RyYWNlci5tb2R1bGUpIHtcbiAgICAgICAgY291bnQrKztcbiAgICAgICAgaWYgKCFjYXBzdWxlLmFsbG9jYXRlZCkge1xuICAgICAgICAgIGNhcHN1bGUudHJhY2VyID0gbmV3VHJhY2VyO1xuICAgICAgICAgIGNhcHN1bGUuYWxsb2NhdGVkID0gdHJ1ZTtcbiAgICAgICAgICBjYXBzdWxlLmlzTmV3ID0gZmFsc2U7XG4gICAgICAgICAgc2VsZWN0ZWRDYXBzdWxlID0gY2Fwc3VsZTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmIChzZWxlY3RlZENhcHN1bGUgPT09IG51bGwpIHtcbiAgICAgIGNvdW50Kys7XG4gICAgICBzZWxlY3RlZENhcHN1bGUgPSB0aGlzLmFkZChuZXdUcmFjZXIpO1xuICAgIH1cblxuICAgIGNvbnN0IGNsYXNzTmFtZSA9IG5ld1RyYWNlci5tb2R1bGUuZ2V0Q2xhc3NOYW1lKCk7XG4gICAgc2VsZWN0ZWRDYXBzdWxlLmRlZmF1bHROYW1lID0gYCR7Y2xhc3NOYW1lfSAke2NvdW50fWA7XG4gICAgc2VsZWN0ZWRDYXBzdWxlLm9yZGVyID0gdGhpcy5vcmRlcisrO1xuICAgIHJldHVybiBzZWxlY3RlZENhcHN1bGU7XG4gIH0sXG5cbiAgZGVhbGxvY2F0ZUFsbCgpIHtcbiAgICB0aGlzLm9yZGVyID0gMDtcbiAgICB0aGlzLnJlc2V0KCk7XG4gICAgJC5lYWNoKHRoaXMuY2Fwc3VsZXMsIChpLCBjYXBzdWxlKSA9PiB7XG4gICAgICBjYXBzdWxlLmFsbG9jYXRlZCA9IGZhbHNlO1xuICAgIH0pO1xuICB9LFxuXG4gIHJlbW92ZVVuYWxsb2NhdGVkKCkge1xuICAgIGxldCBjaGFuZ2VkID0gZmFsc2U7XG5cbiAgICB0aGlzLmNhcHN1bGVzID0gJC5ncmVwKHRoaXMuY2Fwc3VsZXMsIChjYXBzdWxlKSA9PiB7XG4gICAgICBsZXQgcmVtb3ZlZCA9ICFjYXBzdWxlLmFsbG9jYXRlZDtcblxuICAgICAgaWYgKGNhcHN1bGUuaXNOZXcgfHwgcmVtb3ZlZCkge1xuICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGlmIChyZW1vdmVkKSB7XG4gICAgICAgIGNhcHN1bGUuJGNvbnRhaW5lci5yZW1vdmUoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuICFyZW1vdmVkO1xuICAgIH0pO1xuXG4gICAgaWYgKGNoYW5nZWQpIHtcbiAgICAgIHRoaXMucGxhY2UoKTtcbiAgICB9XG4gIH0sXG5cbiAgcGxhY2UoKSB7XG4gICAgY29uc3Qge1xuICAgICAgY2Fwc3VsZXNcbiAgICB9ID0gdGhpcztcblxuICAgICQuZWFjaChjYXBzdWxlcywgKGksIGNhcHN1bGUpID0+IHtcbiAgICAgIGxldCB3aWR0aCA9IDEwMDtcbiAgICAgIGxldCBoZWlnaHQgPSAoMTAwIC8gY2Fwc3VsZXMubGVuZ3RoKTtcbiAgICAgIGxldCB0b3AgPSBoZWlnaHQgKiBjYXBzdWxlLm9yZGVyO1xuXG4gICAgICBjYXBzdWxlLiRjb250YWluZXIuY3NzKHtcbiAgICAgICAgdG9wOiBgJHt0b3B9JWAsXG4gICAgICAgIHdpZHRoOiBgJHt3aWR0aH0lYCxcbiAgICAgICAgaGVpZ2h0OiBgJHtoZWlnaHR9JWBcbiAgICAgIH0pO1xuXG4gICAgICBjYXBzdWxlLnRyYWNlci5yZXNpemUoKTtcbiAgICB9KTtcbiAgfSxcblxuICByZXNpemUoKSB7XG4gICAgdGhpcy5jb21tYW5kKCdyZXNpemUnKTtcbiAgfSxcblxuICBpc1BhdXNlKCkge1xuICAgIHJldHVybiB0aGlzLnBhdXNlO1xuICB9LFxuXG4gIHNldEludGVydmFsKGludGVydmFsKSB7XG4gICAgJCgnI2ludGVydmFsJykudmFsKGludGVydmFsKTtcbiAgfSxcblxuICByZXNldCgpIHtcbiAgICB0aGlzLnRyYWNlcyA9IFtdO1xuICAgIHRoaXMudHJhY2VJbmRleCA9IC0xO1xuICAgIHRoaXMuc3RlcENudCA9IDA7XG4gICAgaWYgKHRoaXMudGltZXIpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVyKTtcbiAgICB9XG4gICAgdGhpcy5jb21tYW5kKCdjbGVhcicpO1xuICB9LFxuXG4gIHB1c2hTdGVwKGNhcHN1bGUsIHN0ZXApIHtcbiAgICBpZiAodGhpcy5zdGVwQ250KysgPiBzdGVwTGltaXQpIHRocm93IFwiVHJhY2VyJ3Mgc3RhY2sgb3ZlcmZsb3dcIjtcbiAgICBsZXQgbGVuID0gdGhpcy50cmFjZXMubGVuZ3RoO1xuICAgIGxldCBsYXN0ID0gW107XG4gICAgaWYgKGxlbiA9PT0gMCkge1xuICAgICAgdGhpcy50cmFjZXMucHVzaChsYXN0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGFzdCA9IHRoaXMudHJhY2VzW2xlbiAtIDFdO1xuICAgIH1cbiAgICBsYXN0LnB1c2goJC5leHRlbmQoc3RlcCwge1xuICAgICAgY2Fwc3VsZVxuICAgIH0pKTtcbiAgfSxcblxuICBuZXdTdGVwKCkge1xuICAgIHRoaXMudHJhY2VzLnB1c2goW10pO1xuICB9LFxuXG4gIHBhdXNlU3RlcCgpIHtcbiAgICBpZiAodGhpcy50cmFjZUluZGV4IDwgMCkgcmV0dXJuO1xuICAgIHRoaXMucGF1c2UgPSB0cnVlO1xuICAgIGlmICh0aGlzLnRpbWVyKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy50aW1lcik7XG4gICAgfVxuICAgICQoJyNidG5fcGF1c2UnKS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gIH0sXG5cbiAgcmVzdW1lU3RlcCgpIHtcbiAgICB0aGlzLnBhdXNlID0gZmFsc2U7XG4gICAgdGhpcy5zdGVwKHRoaXMudHJhY2VJbmRleCArIDEpO1xuICAgICQoJyNidG5fcGF1c2UnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gIH0sXG5cbiAgc3RlcChpLCBvcHRpb25zID0ge30pIHtcbiAgICBjb25zdCB0cmFjZXIgPSB0aGlzO1xuXG4gICAgaWYgKGlzTmFOKGkpIHx8IGkgPj0gdGhpcy50cmFjZXMubGVuZ3RoIHx8IGkgPCAwKSByZXR1cm47XG5cbiAgICB0aGlzLnRyYWNlSW5kZXggPSBpO1xuICAgIGNvbnN0IHRyYWNlID0gdGhpcy50cmFjZXNbaV07XG4gICAgdHJhY2UuZm9yRWFjaCgoc3RlcCkgPT4ge1xuICAgICAgc3RlcC5jYXBzdWxlLnRyYWNlci5wcm9jZXNzU3RlcChzdGVwLCBvcHRpb25zKTtcbiAgICB9KTtcblxuICAgIGlmICghb3B0aW9ucy52aXJ0dWFsKSB7XG4gICAgICB0aGlzLmNvbW1hbmQoJ3JlZnJlc2gnKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5wYXVzZSkgcmV0dXJuO1xuXG4gICAgdGhpcy50aW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdHJhY2VyLnN0ZXAoaSArIDEsIG9wdGlvbnMpO1xuICAgIH0sIHRoaXMuaW50ZXJ2YWwpO1xuICB9LFxuXG4gIHByZXZTdGVwKCkge1xuICAgIHRoaXMuY29tbWFuZCgnY2xlYXInKTtcblxuICAgIGNvbnN0IGZpbmFsSW5kZXggPSB0aGlzLnRyYWNlSW5kZXggLSAxO1xuICAgIGlmIChmaW5hbEluZGV4IDwgMCkge1xuICAgICAgdGhpcy50cmFjZUluZGV4ID0gLTE7XG4gICAgICB0aGlzLmNvbW1hbmQoJ3JlZnJlc2gnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZpbmFsSW5kZXg7IGkrKykge1xuICAgICAgdGhpcy5zdGVwKGksIHtcbiAgICAgICAgdmlydHVhbDogdHJ1ZVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5zdGVwKGZpbmFsSW5kZXgpO1xuICB9LFxuXG4gIG5leHRTdGVwKCkge1xuICAgIHRoaXMuc3RlcCh0aGlzLnRyYWNlSW5kZXggKyAxKTtcbiAgfSxcblxuICB2aXN1YWxpemUoKSB7XG4gICAgdGhpcy50cmFjZUluZGV4ID0gLTE7XG4gICAgdGhpcy5yZXN1bWVTdGVwKCk7XG4gIH0sXG5cbiAgY29tbWFuZCguLi5hcmdzKSB7XG4gICAgY29uc3QgZnVuY3Rpb25OYW1lID0gYXJncy5zaGlmdCgpO1xuICAgICQuZWFjaCh0aGlzLmNhcHN1bGVzLCAoaSwgY2Fwc3VsZSkgPT4ge1xuICAgICAgaWYgKGNhcHN1bGUuYWxsb2NhdGVkKSB7XG4gICAgICAgIGNhcHN1bGUudHJhY2VyLm1vZHVsZS5wcm90b3R5cGVbZnVuY3Rpb25OYW1lXS5hcHBseShjYXBzdWxlLnRyYWNlciwgYXJncyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG5cbiAgZmluZE93bmVyKGNvbnRhaW5lcikge1xuICAgIGxldCBzZWxlY3RlZENhcHN1bGUgPSBudWxsO1xuICAgICQuZWFjaCh0aGlzLmNhcHN1bGVzLCAoaSwgY2Fwc3VsZSkgPT4ge1xuICAgICAgaWYgKGNhcHN1bGUuJGNvbnRhaW5lclswXSA9PT0gY29udGFpbmVyKSB7XG4gICAgICAgIHNlbGVjdGVkQ2Fwc3VsZSA9IGNhcHN1bGU7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gc2VsZWN0ZWRDYXBzdWxlLnRyYWNlcjtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBUcmFjZXJNYW5hZ2VyOyIsImNvbnN0IHtcbiAgcGFyc2Vcbn0gPSBKU09OO1xuXG5jb25zdCBmcm9tSlNPTiA9IChvYmopID0+IHtcbiAgcmV0dXJuIHBhcnNlKG9iaiwgKGtleSwgdmFsdWUpID0+IHtcbiAgICByZXR1cm4gdmFsdWUgPT09ICdJbmZpbml0eScgPyBJbmZpbml0eSA6IHZhbHVlO1xuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnJvbUpTT047IiwiY29uc3QgdG9KU09OID0gcmVxdWlyZSgnLi90b19qc29uJyk7XG5jb25zdCBmcm9tSlNPTiA9IHJlcXVpcmUoJy4vZnJvbV9qc29uJyk7XG5jb25zdCByZWZpbmVCeVR5cGUgPSByZXF1aXJlKCcuL3JlZmluZV9ieV90eXBlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICB0b0pTT04sXG4gIGZyb21KU09OLFxuICByZWZpbmVCeVR5cGVcbn07IiwiY29uc3QgcmVmaW5lQnlUeXBlID0gKGl0ZW0pID0+IHtcbiAgcmV0dXJuIHR5cGVvZihpdGVtKSA9PT0gJ251bWJlcicgPyByZWZpbmVOdW1iZXIoaXRlbSkgOiByZWZpbmVTdHJpbmcoaXRlbSk7XG59O1xuXG5jb25zdCByZWZpbmVTdHJpbmcgPSAoc3RyKSA9PiB7XG4gIHJldHVybiBzdHIgPT09ICcnID8gJyAnIDogc3RyO1xufTtcblxuY29uc3QgcmVmaW5lTnVtYmVyID0gKG51bSkgPT4ge1xuICByZXR1cm4gbnVtID09PSBJbmZpbml0eSA/ICfiiJ4nIDogbnVtO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSByZWZpbmVCeVR5cGU7IiwiY29uc3Qge1xuICBzdHJpbmdpZnlcbn0gPSBKU09OO1xuXG5jb25zdCB0b0pTT04gPSAob2JqKSA9PiB7XG4gIHJldHVybiBzdHJpbmdpZnkob2JqLCAoa2V5LCB2YWx1ZSkgPT4ge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gSW5maW5pdHkgPyAnSW5maW5pdHknIDogdmFsdWU7XG4gIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB0b0pTT047IiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBpc1NjcmF0Y2hQYXBlciA9IChjYXRlZ29yeSwgYWxnb3JpdGhtKSA9PiB7XG4gIHJldHVybiBjYXRlZ29yeSA9PSAnc2NyYXRjaCc7XG59O1xuXG5jb25zdCBnZXRBbGdvcml0aG1EaXIgPSAoY2F0ZWdvcnksIGFsZ29yaXRobSkgPT4ge1xuICBpZiAoaXNTY3JhdGNoUGFwZXIoY2F0ZWdvcnkpKSByZXR1cm4gJy4vYWxnb3JpdGhtL3NjcmF0Y2hfcGFwZXIvJztcbiAgcmV0dXJuIGAuL2FsZ29yaXRobS8ke2NhdGVnb3J5fS8ke2FsZ29yaXRobX0vYDtcbn07XG5cbmNvbnN0IGdldEZpbGVEaXIgPSAoY2F0ZWdvcnksIGFsZ29yaXRobSwgZmlsZSkgPT4ge1xuICBpZiAoaXNTY3JhdGNoUGFwZXIoY2F0ZWdvcnkpKSByZXR1cm4gJy4vYWxnb3JpdGhtL3NjcmF0Y2hfcGFwZXIvJztcbiAgcmV0dXJuIGAuL2FsZ29yaXRobS8ke2NhdGVnb3J5fS8ke2FsZ29yaXRobX0vJHtmaWxlfS9gO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGlzU2NyYXRjaFBhcGVyLFxuICBnZXRBbGdvcml0aG1EaXIsXG4gIGdldEZpbGVEaXJcbn07IiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHNldFRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZHJhaW5RdWV1ZSwgMCk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCIvKiFcbiAqIEBvdmVydmlldyBSU1ZQIC0gYSB0aW55IGltcGxlbWVudGF0aW9uIG9mIFByb21pc2VzL0ErLlxuICogQGNvcHlyaWdodCBDb3B5cmlnaHQgKGMpIDIwMTQgWWVodWRhIEthdHosIFRvbSBEYWxlLCBTdGVmYW4gUGVubmVyIGFuZCBjb250cmlidXRvcnNcbiAqIEBsaWNlbnNlICAgTGljZW5zZWQgdW5kZXIgTUlUIGxpY2Vuc2VcbiAqICAgICAgICAgICAgU2VlIGh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS90aWxkZWlvL3JzdnAuanMvbWFzdGVyL0xJQ0VOU0VcbiAqIEB2ZXJzaW9uICAgMy4yLjFcbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgZnVuY3Rpb24gbGliJHJzdnAkdXRpbHMkJG9iamVjdE9yRnVuY3Rpb24oeCkge1xuICAgICAgcmV0dXJuIHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nIHx8ICh0eXBlb2YgeCA9PT0gJ29iamVjdCcgJiYgeCAhPT0gbnVsbCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJHJzdnAkdXRpbHMkJGlzRnVuY3Rpb24oeCkge1xuICAgICAgcmV0dXJuIHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJHV0aWxzJCRpc01heWJlVGhlbmFibGUoeCkge1xuICAgICAgcmV0dXJuIHR5cGVvZiB4ID09PSAnb2JqZWN0JyAmJiB4ICE9PSBudWxsO1xuICAgIH1cblxuICAgIHZhciBsaWIkcnN2cCR1dGlscyQkX2lzQXJyYXk7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KSB7XG4gICAgICBsaWIkcnN2cCR1dGlscyQkX2lzQXJyYXkgPSBmdW5jdGlvbiAoeCkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHgpID09PSAnW29iamVjdCBBcnJheV0nO1xuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGliJHJzdnAkdXRpbHMkJF9pc0FycmF5ID0gQXJyYXkuaXNBcnJheTtcbiAgICB9XG5cbiAgICB2YXIgbGliJHJzdnAkdXRpbHMkJGlzQXJyYXkgPSBsaWIkcnN2cCR1dGlscyQkX2lzQXJyYXk7XG5cbiAgICB2YXIgbGliJHJzdnAkdXRpbHMkJG5vdyA9IERhdGUubm93IHx8IGZ1bmN0aW9uKCkgeyByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCk7IH07XG5cbiAgICBmdW5jdGlvbiBsaWIkcnN2cCR1dGlscyQkRigpIHsgfVxuXG4gICAgdmFyIGxpYiRyc3ZwJHV0aWxzJCRvX2NyZWF0ZSA9IChPYmplY3QuY3JlYXRlIHx8IGZ1bmN0aW9uIChvKSB7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTZWNvbmQgYXJndW1lbnQgbm90IHN1cHBvcnRlZCcpO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBvICE9PSAnb2JqZWN0Jykge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudCBtdXN0IGJlIGFuIG9iamVjdCcpO1xuICAgICAgfVxuICAgICAgbGliJHJzdnAkdXRpbHMkJEYucHJvdG90eXBlID0gbztcbiAgICAgIHJldHVybiBuZXcgbGliJHJzdnAkdXRpbHMkJEYoKTtcbiAgICB9KTtcbiAgICBmdW5jdGlvbiBsaWIkcnN2cCRldmVudHMkJGluZGV4T2YoY2FsbGJhY2tzLCBjYWxsYmFjaykge1xuICAgICAgZm9yICh2YXIgaT0wLCBsPWNhbGxiYWNrcy5sZW5ndGg7IGk8bDsgaSsrKSB7XG4gICAgICAgIGlmIChjYWxsYmFja3NbaV0gPT09IGNhbGxiYWNrKSB7IHJldHVybiBpOyB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAtMTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkcnN2cCRldmVudHMkJGNhbGxiYWNrc0ZvcihvYmplY3QpIHtcbiAgICAgIHZhciBjYWxsYmFja3MgPSBvYmplY3QuX3Byb21pc2VDYWxsYmFja3M7XG5cbiAgICAgIGlmICghY2FsbGJhY2tzKSB7XG4gICAgICAgIGNhbGxiYWNrcyA9IG9iamVjdC5fcHJvbWlzZUNhbGxiYWNrcyA9IHt9O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gY2FsbGJhY2tzO1xuICAgIH1cblxuICAgIHZhciBsaWIkcnN2cCRldmVudHMkJGRlZmF1bHQgPSB7XG5cbiAgICAgIC8qKlxuICAgICAgICBgUlNWUC5FdmVudFRhcmdldC5taXhpbmAgZXh0ZW5kcyBhbiBvYmplY3Qgd2l0aCBFdmVudFRhcmdldCBtZXRob2RzLiBGb3JcbiAgICAgICAgRXhhbXBsZTpcblxuICAgICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICAgIHZhciBvYmplY3QgPSB7fTtcblxuICAgICAgICBSU1ZQLkV2ZW50VGFyZ2V0Lm1peGluKG9iamVjdCk7XG5cbiAgICAgICAgb2JqZWN0Lm9uKCdmaW5pc2hlZCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgLy8gaGFuZGxlIGV2ZW50XG4gICAgICAgIH0pO1xuXG4gICAgICAgIG9iamVjdC50cmlnZ2VyKCdmaW5pc2hlZCcsIHsgZGV0YWlsOiB2YWx1ZSB9KTtcbiAgICAgICAgYGBgXG5cbiAgICAgICAgYEV2ZW50VGFyZ2V0Lm1peGluYCBhbHNvIHdvcmtzIHdpdGggcHJvdG90eXBlczpcblxuICAgICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICAgIHZhciBQZXJzb24gPSBmdW5jdGlvbigpIHt9O1xuICAgICAgICBSU1ZQLkV2ZW50VGFyZ2V0Lm1peGluKFBlcnNvbi5wcm90b3R5cGUpO1xuXG4gICAgICAgIHZhciB5ZWh1ZGEgPSBuZXcgUGVyc29uKCk7XG4gICAgICAgIHZhciB0b20gPSBuZXcgUGVyc29uKCk7XG5cbiAgICAgICAgeWVodWRhLm9uKCdwb2tlJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnWWVodWRhIHNheXMgT1cnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdG9tLm9uKCdwb2tlJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnVG9tIHNheXMgT1cnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgeWVodWRhLnRyaWdnZXIoJ3Bva2UnKTtcbiAgICAgICAgdG9tLnRyaWdnZXIoJ3Bva2UnKTtcbiAgICAgICAgYGBgXG5cbiAgICAgICAgQG1ldGhvZCBtaXhpblxuICAgICAgICBAZm9yIFJTVlAuRXZlbnRUYXJnZXRcbiAgICAgICAgQHByaXZhdGVcbiAgICAgICAgQHBhcmFtIHtPYmplY3R9IG9iamVjdCBvYmplY3QgdG8gZXh0ZW5kIHdpdGggRXZlbnRUYXJnZXQgbWV0aG9kc1xuICAgICAgKi9cbiAgICAgICdtaXhpbic6IGZ1bmN0aW9uKG9iamVjdCkge1xuICAgICAgICBvYmplY3RbJ29uJ10gICAgICA9IHRoaXNbJ29uJ107XG4gICAgICAgIG9iamVjdFsnb2ZmJ10gICAgID0gdGhpc1snb2ZmJ107XG4gICAgICAgIG9iamVjdFsndHJpZ2dlciddID0gdGhpc1sndHJpZ2dlciddO1xuICAgICAgICBvYmplY3QuX3Byb21pc2VDYWxsYmFja3MgPSB1bmRlZmluZWQ7XG4gICAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgICB9LFxuXG4gICAgICAvKipcbiAgICAgICAgUmVnaXN0ZXJzIGEgY2FsbGJhY2sgdG8gYmUgZXhlY3V0ZWQgd2hlbiBgZXZlbnROYW1lYCBpcyB0cmlnZ2VyZWRcblxuICAgICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICAgIG9iamVjdC5vbignZXZlbnQnLCBmdW5jdGlvbihldmVudEluZm8pe1xuICAgICAgICAgIC8vIGhhbmRsZSB0aGUgZXZlbnRcbiAgICAgICAgfSk7XG5cbiAgICAgICAgb2JqZWN0LnRyaWdnZXIoJ2V2ZW50Jyk7XG4gICAgICAgIGBgYFxuXG4gICAgICAgIEBtZXRob2Qgb25cbiAgICAgICAgQGZvciBSU1ZQLkV2ZW50VGFyZ2V0XG4gICAgICAgIEBwcml2YXRlXG4gICAgICAgIEBwYXJhbSB7U3RyaW5nfSBldmVudE5hbWUgbmFtZSBvZiB0aGUgZXZlbnQgdG8gbGlzdGVuIGZvclxuICAgICAgICBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiB0aGUgZXZlbnQgaXMgdHJpZ2dlcmVkLlxuICAgICAgKi9cbiAgICAgICdvbic6IGZ1bmN0aW9uKGV2ZW50TmFtZSwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0NhbGxiYWNrIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGFsbENhbGxiYWNrcyA9IGxpYiRyc3ZwJGV2ZW50cyQkY2FsbGJhY2tzRm9yKHRoaXMpLCBjYWxsYmFja3M7XG5cbiAgICAgICAgY2FsbGJhY2tzID0gYWxsQ2FsbGJhY2tzW2V2ZW50TmFtZV07XG5cbiAgICAgICAgaWYgKCFjYWxsYmFja3MpIHtcbiAgICAgICAgICBjYWxsYmFja3MgPSBhbGxDYWxsYmFja3NbZXZlbnROYW1lXSA9IFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGxpYiRyc3ZwJGV2ZW50cyQkaW5kZXhPZihjYWxsYmFja3MsIGNhbGxiYWNrKSA9PT0gLTEpIHtcbiAgICAgICAgICBjYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICAgIH0sXG5cbiAgICAgIC8qKlxuICAgICAgICBZb3UgY2FuIHVzZSBgb2ZmYCB0byBzdG9wIGZpcmluZyBhIHBhcnRpY3VsYXIgY2FsbGJhY2sgZm9yIGFuIGV2ZW50OlxuXG4gICAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgICAgZnVuY3Rpb24gZG9TdHVmZigpIHsgLy8gZG8gc3R1ZmYhIH1cbiAgICAgICAgb2JqZWN0Lm9uKCdzdHVmZicsIGRvU3R1ZmYpO1xuXG4gICAgICAgIG9iamVjdC50cmlnZ2VyKCdzdHVmZicpOyAvLyBkb1N0dWZmIHdpbGwgYmUgY2FsbGVkXG5cbiAgICAgICAgLy8gVW5yZWdpc3RlciBPTkxZIHRoZSBkb1N0dWZmIGNhbGxiYWNrXG4gICAgICAgIG9iamVjdC5vZmYoJ3N0dWZmJywgZG9TdHVmZik7XG4gICAgICAgIG9iamVjdC50cmlnZ2VyKCdzdHVmZicpOyAvLyBkb1N0dWZmIHdpbGwgTk9UIGJlIGNhbGxlZFxuICAgICAgICBgYGBcblxuICAgICAgICBJZiB5b3UgZG9uJ3QgcGFzcyBhIGBjYWxsYmFja2AgYXJndW1lbnQgdG8gYG9mZmAsIEFMTCBjYWxsYmFja3MgZm9yIHRoZVxuICAgICAgICBldmVudCB3aWxsIG5vdCBiZSBleGVjdXRlZCB3aGVuIHRoZSBldmVudCBmaXJlcy4gRm9yIGV4YW1wbGU6XG5cbiAgICAgICAgYGBgamF2YXNjcmlwdFxuICAgICAgICB2YXIgY2FsbGJhY2sxID0gZnVuY3Rpb24oKXt9O1xuICAgICAgICB2YXIgY2FsbGJhY2syID0gZnVuY3Rpb24oKXt9O1xuXG4gICAgICAgIG9iamVjdC5vbignc3R1ZmYnLCBjYWxsYmFjazEpO1xuICAgICAgICBvYmplY3Qub24oJ3N0dWZmJywgY2FsbGJhY2syKTtcblxuICAgICAgICBvYmplY3QudHJpZ2dlcignc3R1ZmYnKTsgLy8gY2FsbGJhY2sxIGFuZCBjYWxsYmFjazIgd2lsbCBiZSBleGVjdXRlZC5cblxuICAgICAgICBvYmplY3Qub2ZmKCdzdHVmZicpO1xuICAgICAgICBvYmplY3QudHJpZ2dlcignc3R1ZmYnKTsgLy8gY2FsbGJhY2sxIGFuZCBjYWxsYmFjazIgd2lsbCBub3QgYmUgZXhlY3V0ZWQhXG4gICAgICAgIGBgYFxuXG4gICAgICAgIEBtZXRob2Qgb2ZmXG4gICAgICAgIEBmb3IgUlNWUC5FdmVudFRhcmdldFxuICAgICAgICBAcHJpdmF0ZVxuICAgICAgICBAcGFyYW0ge1N0cmluZ30gZXZlbnROYW1lIGV2ZW50IHRvIHN0b3AgbGlzdGVuaW5nIHRvXG4gICAgICAgIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIG9wdGlvbmFsIGFyZ3VtZW50LiBJZiBnaXZlbiwgb25seSB0aGUgZnVuY3Rpb25cbiAgICAgICAgZ2l2ZW4gd2lsbCBiZSByZW1vdmVkIGZyb20gdGhlIGV2ZW50J3MgY2FsbGJhY2sgcXVldWUuIElmIG5vIGBjYWxsYmFja2BcbiAgICAgICAgYXJndW1lbnQgaXMgZ2l2ZW4sIGFsbCBjYWxsYmFja3Mgd2lsbCBiZSByZW1vdmVkIGZyb20gdGhlIGV2ZW50J3MgY2FsbGJhY2tcbiAgICAgICAgcXVldWUuXG4gICAgICAqL1xuICAgICAgJ29mZic6IGZ1bmN0aW9uKGV2ZW50TmFtZSwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGFsbENhbGxiYWNrcyA9IGxpYiRyc3ZwJGV2ZW50cyQkY2FsbGJhY2tzRm9yKHRoaXMpLCBjYWxsYmFja3MsIGluZGV4O1xuXG4gICAgICAgIGlmICghY2FsbGJhY2spIHtcbiAgICAgICAgICBhbGxDYWxsYmFja3NbZXZlbnROYW1lXSA9IFtdO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhbGxiYWNrcyA9IGFsbENhbGxiYWNrc1tldmVudE5hbWVdO1xuXG4gICAgICAgIGluZGV4ID0gbGliJHJzdnAkZXZlbnRzJCRpbmRleE9mKGNhbGxiYWNrcywgY2FsbGJhY2spO1xuXG4gICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHsgY2FsbGJhY2tzLnNwbGljZShpbmRleCwgMSk7IH1cbiAgICAgIH0sXG5cbiAgICAgIC8qKlxuICAgICAgICBVc2UgYHRyaWdnZXJgIHRvIGZpcmUgY3VzdG9tIGV2ZW50cy4gRm9yIGV4YW1wbGU6XG5cbiAgICAgICAgYGBgamF2YXNjcmlwdFxuICAgICAgICBvYmplY3Qub24oJ2ZvbycsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgY29uc29sZS5sb2coJ2ZvbyBldmVudCBoYXBwZW5lZCEnKTtcbiAgICAgICAgfSk7XG4gICAgICAgIG9iamVjdC50cmlnZ2VyKCdmb28nKTtcbiAgICAgICAgLy8gJ2ZvbyBldmVudCBoYXBwZW5lZCEnIGxvZ2dlZCB0byB0aGUgY29uc29sZVxuICAgICAgICBgYGBcblxuICAgICAgICBZb3UgY2FuIGFsc28gcGFzcyBhIHZhbHVlIGFzIGEgc2Vjb25kIGFyZ3VtZW50IHRvIGB0cmlnZ2VyYCB0aGF0IHdpbGwgYmVcbiAgICAgICAgcGFzc2VkIGFzIGFuIGFyZ3VtZW50IHRvIGFsbCBldmVudCBsaXN0ZW5lcnMgZm9yIHRoZSBldmVudDpcblxuICAgICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICAgIG9iamVjdC5vbignZm9vJywgZnVuY3Rpb24odmFsdWUpe1xuICAgICAgICAgIGNvbnNvbGUubG9nKHZhbHVlLm5hbWUpO1xuICAgICAgICB9KTtcblxuICAgICAgICBvYmplY3QudHJpZ2dlcignZm9vJywgeyBuYW1lOiAnYmFyJyB9KTtcbiAgICAgICAgLy8gJ2JhcicgbG9nZ2VkIHRvIHRoZSBjb25zb2xlXG4gICAgICAgIGBgYFxuXG4gICAgICAgIEBtZXRob2QgdHJpZ2dlclxuICAgICAgICBAZm9yIFJTVlAuRXZlbnRUYXJnZXRcbiAgICAgICAgQHByaXZhdGVcbiAgICAgICAgQHBhcmFtIHtTdHJpbmd9IGV2ZW50TmFtZSBuYW1lIG9mIHRoZSBldmVudCB0byBiZSB0cmlnZ2VyZWRcbiAgICAgICAgQHBhcmFtIHsqfSBvcHRpb25zIG9wdGlvbmFsIHZhbHVlIHRvIGJlIHBhc3NlZCB0byBhbnkgZXZlbnQgaGFuZGxlcnMgZm9yXG4gICAgICAgIHRoZSBnaXZlbiBgZXZlbnROYW1lYFxuICAgICAgKi9cbiAgICAgICd0cmlnZ2VyJzogZnVuY3Rpb24oZXZlbnROYW1lLCBvcHRpb25zLCBsYWJlbCkge1xuICAgICAgICB2YXIgYWxsQ2FsbGJhY2tzID0gbGliJHJzdnAkZXZlbnRzJCRjYWxsYmFja3NGb3IodGhpcyksIGNhbGxiYWNrcywgY2FsbGJhY2s7XG5cbiAgICAgICAgaWYgKGNhbGxiYWNrcyA9IGFsbENhbGxiYWNrc1tldmVudE5hbWVdKSB7XG4gICAgICAgICAgLy8gRG9uJ3QgY2FjaGUgdGhlIGNhbGxiYWNrcy5sZW5ndGggc2luY2UgaXQgbWF5IGdyb3dcbiAgICAgICAgICBmb3IgKHZhciBpPTA7IGk8Y2FsbGJhY2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjYWxsYmFjayA9IGNhbGxiYWNrc1tpXTtcblxuICAgICAgICAgICAgY2FsbGJhY2sob3B0aW9ucywgbGFiZWwpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgbGliJHJzdnAkY29uZmlnJCRjb25maWcgPSB7XG4gICAgICBpbnN0cnVtZW50OiBmYWxzZVxuICAgIH07XG5cbiAgICBsaWIkcnN2cCRldmVudHMkJGRlZmF1bHRbJ21peGluJ10obGliJHJzdnAkY29uZmlnJCRjb25maWcpO1xuXG4gICAgZnVuY3Rpb24gbGliJHJzdnAkY29uZmlnJCRjb25maWd1cmUobmFtZSwgdmFsdWUpIHtcbiAgICAgIGlmIChuYW1lID09PSAnb25lcnJvcicpIHtcbiAgICAgICAgLy8gaGFuZGxlIGZvciBsZWdhY3kgdXNlcnMgdGhhdCBleHBlY3QgdGhlIGFjdHVhbFxuICAgICAgICAvLyBlcnJvciB0byBiZSBwYXNzZWQgdG8gdGhlaXIgZnVuY3Rpb24gYWRkZWQgdmlhXG4gICAgICAgIC8vIGBSU1ZQLmNvbmZpZ3VyZSgnb25lcnJvcicsIHNvbWVGdW5jdGlvbkhlcmUpO2BcbiAgICAgICAgbGliJHJzdnAkY29uZmlnJCRjb25maWdbJ29uJ10oJ2Vycm9yJywgdmFsdWUpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyKSB7XG4gICAgICAgIGxpYiRyc3ZwJGNvbmZpZyQkY29uZmlnW25hbWVdID0gdmFsdWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbGliJHJzdnAkY29uZmlnJCRjb25maWdbbmFtZV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGxpYiRyc3ZwJGluc3RydW1lbnQkJHF1ZXVlID0gW107XG5cbiAgICBmdW5jdGlvbiBsaWIkcnN2cCRpbnN0cnVtZW50JCRzY2hlZHVsZUZsdXNoKCkge1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGVudHJ5O1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpYiRyc3ZwJGluc3RydW1lbnQkJHF1ZXVlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgZW50cnkgPSBsaWIkcnN2cCRpbnN0cnVtZW50JCRxdWV1ZVtpXTtcblxuICAgICAgICAgIHZhciBwYXlsb2FkID0gZW50cnkucGF5bG9hZDtcblxuICAgICAgICAgIHBheWxvYWQuZ3VpZCA9IHBheWxvYWQua2V5ICsgcGF5bG9hZC5pZDtcbiAgICAgICAgICBwYXlsb2FkLmNoaWxkR3VpZCA9IHBheWxvYWQua2V5ICsgcGF5bG9hZC5jaGlsZElkO1xuICAgICAgICAgIGlmIChwYXlsb2FkLmVycm9yKSB7XG4gICAgICAgICAgICBwYXlsb2FkLnN0YWNrID0gcGF5bG9hZC5lcnJvci5zdGFjaztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsaWIkcnN2cCRjb25maWckJGNvbmZpZ1sndHJpZ2dlciddKGVudHJ5Lm5hbWUsIGVudHJ5LnBheWxvYWQpO1xuICAgICAgICB9XG4gICAgICAgIGxpYiRyc3ZwJGluc3RydW1lbnQkJHF1ZXVlLmxlbmd0aCA9IDA7XG4gICAgICB9LCA1MCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJHJzdnAkaW5zdHJ1bWVudCQkaW5zdHJ1bWVudChldmVudE5hbWUsIHByb21pc2UsIGNoaWxkKSB7XG4gICAgICBpZiAoMSA9PT0gbGliJHJzdnAkaW5zdHJ1bWVudCQkcXVldWUucHVzaCh7XG4gICAgICAgIG5hbWU6IGV2ZW50TmFtZSxcbiAgICAgICAgcGF5bG9hZDoge1xuICAgICAgICAgIGtleTogcHJvbWlzZS5fZ3VpZEtleSxcbiAgICAgICAgICBpZDogIHByb21pc2UuX2lkLFxuICAgICAgICAgIGV2ZW50TmFtZTogZXZlbnROYW1lLFxuICAgICAgICAgIGRldGFpbDogcHJvbWlzZS5fcmVzdWx0LFxuICAgICAgICAgIGNoaWxkSWQ6IGNoaWxkICYmIGNoaWxkLl9pZCxcbiAgICAgICAgICBsYWJlbDogcHJvbWlzZS5fbGFiZWwsXG4gICAgICAgICAgdGltZVN0YW1wOiBsaWIkcnN2cCR1dGlscyQkbm93KCksXG4gICAgICAgICAgZXJyb3I6IGxpYiRyc3ZwJGNvbmZpZyQkY29uZmlnW1wiaW5zdHJ1bWVudC13aXRoLXN0YWNrXCJdID8gbmV3IEVycm9yKHByb21pc2UuX2xhYmVsKSA6IG51bGxcbiAgICAgICAgfX0pKSB7XG4gICAgICAgICAgbGliJHJzdnAkaW5zdHJ1bWVudCQkc2NoZWR1bGVGbHVzaCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgdmFyIGxpYiRyc3ZwJGluc3RydW1lbnQkJGRlZmF1bHQgPSBsaWIkcnN2cCRpbnN0cnVtZW50JCRpbnN0cnVtZW50O1xuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJHRoZW4kJHRoZW4ob25GdWxmaWxsbWVudCwgb25SZWplY3Rpb24sIGxhYmVsKSB7XG4gICAgICB2YXIgcGFyZW50ID0gdGhpcztcbiAgICAgIHZhciBzdGF0ZSA9IHBhcmVudC5fc3RhdGU7XG5cbiAgICAgIGlmIChzdGF0ZSA9PT0gbGliJHJzdnAkJGludGVybmFsJCRGVUxGSUxMRUQgJiYgIW9uRnVsZmlsbG1lbnQgfHwgc3RhdGUgPT09IGxpYiRyc3ZwJCRpbnRlcm5hbCQkUkVKRUNURUQgJiYgIW9uUmVqZWN0aW9uKSB7XG4gICAgICAgIGxpYiRyc3ZwJGNvbmZpZyQkY29uZmlnLmluc3RydW1lbnQgJiYgbGliJHJzdnAkaW5zdHJ1bWVudCQkZGVmYXVsdCgnY2hhaW5lZCcsIHBhcmVudCwgcGFyZW50KTtcbiAgICAgICAgcmV0dXJuIHBhcmVudDtcbiAgICAgIH1cblxuICAgICAgcGFyZW50Ll9vbkVycm9yID0gbnVsbDtcblxuICAgICAgdmFyIGNoaWxkID0gbmV3IHBhcmVudC5jb25zdHJ1Y3RvcihsaWIkcnN2cCQkaW50ZXJuYWwkJG5vb3AsIGxhYmVsKTtcbiAgICAgIHZhciByZXN1bHQgPSBwYXJlbnQuX3Jlc3VsdDtcblxuICAgICAgbGliJHJzdnAkY29uZmlnJCRjb25maWcuaW5zdHJ1bWVudCAmJiBsaWIkcnN2cCRpbnN0cnVtZW50JCRkZWZhdWx0KCdjaGFpbmVkJywgcGFyZW50LCBjaGlsZCk7XG5cbiAgICAgIGlmIChzdGF0ZSkge1xuICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmd1bWVudHNbc3RhdGUgLSAxXTtcbiAgICAgICAgbGliJHJzdnAkY29uZmlnJCRjb25maWcuYXN5bmMoZnVuY3Rpb24oKXtcbiAgICAgICAgICBsaWIkcnN2cCQkaW50ZXJuYWwkJGludm9rZUNhbGxiYWNrKHN0YXRlLCBjaGlsZCwgY2FsbGJhY2ssIHJlc3VsdCk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGliJHJzdnAkJGludGVybmFsJCRzdWJzY3JpYmUocGFyZW50LCBjaGlsZCwgb25GdWxmaWxsbWVudCwgb25SZWplY3Rpb24pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gY2hpbGQ7XG4gICAgfVxuICAgIHZhciBsaWIkcnN2cCR0aGVuJCRkZWZhdWx0ID0gbGliJHJzdnAkdGhlbiQkdGhlbjtcbiAgICBmdW5jdGlvbiBsaWIkcnN2cCRwcm9taXNlJHJlc29sdmUkJHJlc29sdmUob2JqZWN0LCBsYWJlbCkge1xuICAgICAgLypqc2hpbnQgdmFsaWR0aGlzOnRydWUgKi9cbiAgICAgIHZhciBDb25zdHJ1Y3RvciA9IHRoaXM7XG5cbiAgICAgIGlmIChvYmplY3QgJiYgdHlwZW9mIG9iamVjdCA9PT0gJ29iamVjdCcgJiYgb2JqZWN0LmNvbnN0cnVjdG9yID09PSBDb25zdHJ1Y3Rvcikge1xuICAgICAgICByZXR1cm4gb2JqZWN0O1xuICAgICAgfVxuXG4gICAgICB2YXIgcHJvbWlzZSA9IG5ldyBDb25zdHJ1Y3RvcihsaWIkcnN2cCQkaW50ZXJuYWwkJG5vb3AsIGxhYmVsKTtcbiAgICAgIGxpYiRyc3ZwJCRpbnRlcm5hbCQkcmVzb2x2ZShwcm9taXNlLCBvYmplY3QpO1xuICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfVxuICAgIHZhciBsaWIkcnN2cCRwcm9taXNlJHJlc29sdmUkJGRlZmF1bHQgPSBsaWIkcnN2cCRwcm9taXNlJHJlc29sdmUkJHJlc29sdmU7XG4gICAgZnVuY3Rpb24gbGliJHJzdnAkZW51bWVyYXRvciQkbWFrZVNldHRsZWRSZXN1bHQoc3RhdGUsIHBvc2l0aW9uLCB2YWx1ZSkge1xuICAgICAgaWYgKHN0YXRlID09PSBsaWIkcnN2cCQkaW50ZXJuYWwkJEZVTEZJTExFRCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHN0YXRlOiAnZnVsZmlsbGVkJyxcbiAgICAgICAgICB2YWx1ZTogdmFsdWVcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHN0YXRlOiAncmVqZWN0ZWQnLFxuICAgICAgICAgIHJlYXNvbjogdmFsdWVcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkcnN2cCRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yKENvbnN0cnVjdG9yLCBpbnB1dCwgYWJvcnRPblJlamVjdCwgbGFiZWwpIHtcbiAgICAgIHRoaXMuX2luc3RhbmNlQ29uc3RydWN0b3IgPSBDb25zdHJ1Y3RvcjtcbiAgICAgIHRoaXMucHJvbWlzZSA9IG5ldyBDb25zdHJ1Y3RvcihsaWIkcnN2cCQkaW50ZXJuYWwkJG5vb3AsIGxhYmVsKTtcbiAgICAgIHRoaXMuX2Fib3J0T25SZWplY3QgPSBhYm9ydE9uUmVqZWN0O1xuXG4gICAgICBpZiAodGhpcy5fdmFsaWRhdGVJbnB1dChpbnB1dCkpIHtcbiAgICAgICAgdGhpcy5faW5wdXQgICAgID0gaW5wdXQ7XG4gICAgICAgIHRoaXMubGVuZ3RoICAgICA9IGlucHV0Lmxlbmd0aDtcbiAgICAgICAgdGhpcy5fcmVtYWluaW5nID0gaW5wdXQubGVuZ3RoO1xuXG4gICAgICAgIHRoaXMuX2luaXQoKTtcblxuICAgICAgICBpZiAodGhpcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICBsaWIkcnN2cCQkaW50ZXJuYWwkJGZ1bGZpbGwodGhpcy5wcm9taXNlLCB0aGlzLl9yZXN1bHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMubGVuZ3RoID0gdGhpcy5sZW5ndGggfHwgMDtcbiAgICAgICAgICB0aGlzLl9lbnVtZXJhdGUoKTtcbiAgICAgICAgICBpZiAodGhpcy5fcmVtYWluaW5nID09PSAwKSB7XG4gICAgICAgICAgICBsaWIkcnN2cCQkaW50ZXJuYWwkJGZ1bGZpbGwodGhpcy5wcm9taXNlLCB0aGlzLl9yZXN1bHQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGliJHJzdnAkJGludGVybmFsJCRyZWplY3QodGhpcy5wcm9taXNlLCB0aGlzLl92YWxpZGF0aW9uRXJyb3IoKSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGxpYiRyc3ZwJGVudW1lcmF0b3IkJGRlZmF1bHQgPSBsaWIkcnN2cCRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yO1xuXG4gICAgbGliJHJzdnAkZW51bWVyYXRvciQkRW51bWVyYXRvci5wcm90b3R5cGUuX3ZhbGlkYXRlSW5wdXQgPSBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgcmV0dXJuIGxpYiRyc3ZwJHV0aWxzJCRpc0FycmF5KGlucHV0KTtcbiAgICB9O1xuXG4gICAgbGliJHJzdnAkZW51bWVyYXRvciQkRW51bWVyYXRvci5wcm90b3R5cGUuX3ZhbGlkYXRpb25FcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIG5ldyBFcnJvcignQXJyYXkgTWV0aG9kcyBtdXN0IGJlIHByb3ZpZGVkIGFuIEFycmF5Jyk7XG4gICAgfTtcblxuICAgIGxpYiRyc3ZwJGVudW1lcmF0b3IkJEVudW1lcmF0b3IucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLl9yZXN1bHQgPSBuZXcgQXJyYXkodGhpcy5sZW5ndGgpO1xuICAgIH07XG5cbiAgICBsaWIkcnN2cCRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yLnByb3RvdHlwZS5fZW51bWVyYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbGVuZ3RoICAgICA9IHRoaXMubGVuZ3RoO1xuICAgICAgdmFyIHByb21pc2UgICAgPSB0aGlzLnByb21pc2U7XG4gICAgICB2YXIgaW5wdXQgICAgICA9IHRoaXMuX2lucHV0O1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgcHJvbWlzZS5fc3RhdGUgPT09IGxpYiRyc3ZwJCRpbnRlcm5hbCQkUEVORElORyAmJiBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGhpcy5fZWFjaEVudHJ5KGlucHV0W2ldLCBpKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgbGliJHJzdnAkZW51bWVyYXRvciQkRW51bWVyYXRvci5wcm90b3R5cGUuX3NldHRsZU1heWJlVGhlbmFibGUgPSBmdW5jdGlvbihlbnRyeSwgaSkge1xuICAgICAgdmFyIGMgPSB0aGlzLl9pbnN0YW5jZUNvbnN0cnVjdG9yO1xuICAgICAgdmFyIHJlc29sdmUgPSBjLnJlc29sdmU7XG5cbiAgICAgIGlmIChyZXNvbHZlID09PSBsaWIkcnN2cCRwcm9taXNlJHJlc29sdmUkJGRlZmF1bHQpIHtcbiAgICAgICAgdmFyIHRoZW4gPSBsaWIkcnN2cCQkaW50ZXJuYWwkJGdldFRoZW4oZW50cnkpO1xuXG4gICAgICAgIGlmICh0aGVuID09PSBsaWIkcnN2cCR0aGVuJCRkZWZhdWx0ICYmXG4gICAgICAgICAgICBlbnRyeS5fc3RhdGUgIT09IGxpYiRyc3ZwJCRpbnRlcm5hbCQkUEVORElORykge1xuICAgICAgICAgIGVudHJ5Ll9vbkVycm9yID0gbnVsbDtcbiAgICAgICAgICB0aGlzLl9zZXR0bGVkQXQoZW50cnkuX3N0YXRlLCBpLCBlbnRyeS5fcmVzdWx0KTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhlbiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHRoaXMuX3JlbWFpbmluZy0tO1xuICAgICAgICAgIHRoaXMuX3Jlc3VsdFtpXSA9IHRoaXMuX21ha2VSZXN1bHQobGliJHJzdnAkJGludGVybmFsJCRGVUxGSUxMRUQsIGksIGVudHJ5KTtcbiAgICAgICAgfSBlbHNlIGlmIChjID09PSBsaWIkcnN2cCRwcm9taXNlJCRkZWZhdWx0KSB7XG4gICAgICAgICAgdmFyIHByb21pc2UgPSBuZXcgYyhsaWIkcnN2cCQkaW50ZXJuYWwkJG5vb3ApO1xuICAgICAgICAgIGxpYiRyc3ZwJCRpbnRlcm5hbCQkaGFuZGxlTWF5YmVUaGVuYWJsZShwcm9taXNlLCBlbnRyeSwgdGhlbik7XG4gICAgICAgICAgdGhpcy5fd2lsbFNldHRsZUF0KHByb21pc2UsIGkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX3dpbGxTZXR0bGVBdChuZXcgYyhmdW5jdGlvbihyZXNvbHZlKSB7IHJlc29sdmUoZW50cnkpOyB9KSwgaSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3dpbGxTZXR0bGVBdChyZXNvbHZlKGVudHJ5KSwgaSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGxpYiRyc3ZwJGVudW1lcmF0b3IkJEVudW1lcmF0b3IucHJvdG90eXBlLl9lYWNoRW50cnkgPSBmdW5jdGlvbihlbnRyeSwgaSkge1xuICAgICAgaWYgKGxpYiRyc3ZwJHV0aWxzJCRpc01heWJlVGhlbmFibGUoZW50cnkpKSB7XG4gICAgICAgIHRoaXMuX3NldHRsZU1heWJlVGhlbmFibGUoZW50cnksIGkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fcmVtYWluaW5nLS07XG4gICAgICAgIHRoaXMuX3Jlc3VsdFtpXSA9IHRoaXMuX21ha2VSZXN1bHQobGliJHJzdnAkJGludGVybmFsJCRGVUxGSUxMRUQsIGksIGVudHJ5KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgbGliJHJzdnAkZW51bWVyYXRvciQkRW51bWVyYXRvci5wcm90b3R5cGUuX3NldHRsZWRBdCA9IGZ1bmN0aW9uKHN0YXRlLCBpLCB2YWx1ZSkge1xuICAgICAgdmFyIHByb21pc2UgPSB0aGlzLnByb21pc2U7XG5cbiAgICAgIGlmIChwcm9taXNlLl9zdGF0ZSA9PT0gbGliJHJzdnAkJGludGVybmFsJCRQRU5ESU5HKSB7XG4gICAgICAgIHRoaXMuX3JlbWFpbmluZy0tO1xuXG4gICAgICAgIGlmICh0aGlzLl9hYm9ydE9uUmVqZWN0ICYmIHN0YXRlID09PSBsaWIkcnN2cCQkaW50ZXJuYWwkJFJFSkVDVEVEKSB7XG4gICAgICAgICAgbGliJHJzdnAkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX3Jlc3VsdFtpXSA9IHRoaXMuX21ha2VSZXN1bHQoc3RhdGUsIGksIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5fcmVtYWluaW5nID09PSAwKSB7XG4gICAgICAgIGxpYiRyc3ZwJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCB0aGlzLl9yZXN1bHQpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBsaWIkcnN2cCRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yLnByb3RvdHlwZS5fbWFrZVJlc3VsdCA9IGZ1bmN0aW9uKHN0YXRlLCBpLCB2YWx1ZSkge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH07XG5cbiAgICBsaWIkcnN2cCRlbnVtZXJhdG9yJCRFbnVtZXJhdG9yLnByb3RvdHlwZS5fd2lsbFNldHRsZUF0ID0gZnVuY3Rpb24ocHJvbWlzZSwgaSkge1xuICAgICAgdmFyIGVudW1lcmF0b3IgPSB0aGlzO1xuXG4gICAgICBsaWIkcnN2cCQkaW50ZXJuYWwkJHN1YnNjcmliZShwcm9taXNlLCB1bmRlZmluZWQsIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIGVudW1lcmF0b3IuX3NldHRsZWRBdChsaWIkcnN2cCQkaW50ZXJuYWwkJEZVTEZJTExFRCwgaSwgdmFsdWUpO1xuICAgICAgfSwgZnVuY3Rpb24ocmVhc29uKSB7XG4gICAgICAgIGVudW1lcmF0b3IuX3NldHRsZWRBdChsaWIkcnN2cCQkaW50ZXJuYWwkJFJFSkVDVEVELCBpLCByZWFzb24pO1xuICAgICAgfSk7XG4gICAgfTtcbiAgICBmdW5jdGlvbiBsaWIkcnN2cCRwcm9taXNlJGFsbCQkYWxsKGVudHJpZXMsIGxhYmVsKSB7XG4gICAgICByZXR1cm4gbmV3IGxpYiRyc3ZwJGVudW1lcmF0b3IkJGRlZmF1bHQodGhpcywgZW50cmllcywgdHJ1ZSAvKiBhYm9ydCBvbiByZWplY3QgKi8sIGxhYmVsKS5wcm9taXNlO1xuICAgIH1cbiAgICB2YXIgbGliJHJzdnAkcHJvbWlzZSRhbGwkJGRlZmF1bHQgPSBsaWIkcnN2cCRwcm9taXNlJGFsbCQkYWxsO1xuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJHByb21pc2UkcmFjZSQkcmFjZShlbnRyaWVzLCBsYWJlbCkge1xuICAgICAgLypqc2hpbnQgdmFsaWR0aGlzOnRydWUgKi9cbiAgICAgIHZhciBDb25zdHJ1Y3RvciA9IHRoaXM7XG5cbiAgICAgIHZhciBwcm9taXNlID0gbmV3IENvbnN0cnVjdG9yKGxpYiRyc3ZwJCRpbnRlcm5hbCQkbm9vcCwgbGFiZWwpO1xuXG4gICAgICBpZiAoIWxpYiRyc3ZwJHV0aWxzJCRpc0FycmF5KGVudHJpZXMpKSB7XG4gICAgICAgIGxpYiRyc3ZwJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIG5ldyBUeXBlRXJyb3IoJ1lvdSBtdXN0IHBhc3MgYW4gYXJyYXkgdG8gcmFjZS4nKSk7XG4gICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgICAgfVxuXG4gICAgICB2YXIgbGVuZ3RoID0gZW50cmllcy5sZW5ndGg7XG5cbiAgICAgIGZ1bmN0aW9uIG9uRnVsZmlsbG1lbnQodmFsdWUpIHtcbiAgICAgICAgbGliJHJzdnAkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gb25SZWplY3Rpb24ocmVhc29uKSB7XG4gICAgICAgIGxpYiRyc3ZwJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHJlYXNvbik7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBwcm9taXNlLl9zdGF0ZSA9PT0gbGliJHJzdnAkJGludGVybmFsJCRQRU5ESU5HICYmIGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBsaWIkcnN2cCQkaW50ZXJuYWwkJHN1YnNjcmliZShDb25zdHJ1Y3Rvci5yZXNvbHZlKGVudHJpZXNbaV0pLCB1bmRlZmluZWQsIG9uRnVsZmlsbG1lbnQsIG9uUmVqZWN0aW9uKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfVxuICAgIHZhciBsaWIkcnN2cCRwcm9taXNlJHJhY2UkJGRlZmF1bHQgPSBsaWIkcnN2cCRwcm9taXNlJHJhY2UkJHJhY2U7XG4gICAgZnVuY3Rpb24gbGliJHJzdnAkcHJvbWlzZSRyZWplY3QkJHJlamVjdChyZWFzb24sIGxhYmVsKSB7XG4gICAgICAvKmpzaGludCB2YWxpZHRoaXM6dHJ1ZSAqL1xuICAgICAgdmFyIENvbnN0cnVjdG9yID0gdGhpcztcbiAgICAgIHZhciBwcm9taXNlID0gbmV3IENvbnN0cnVjdG9yKGxpYiRyc3ZwJCRpbnRlcm5hbCQkbm9vcCwgbGFiZWwpO1xuICAgICAgbGliJHJzdnAkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVhc29uKTtcbiAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH1cbiAgICB2YXIgbGliJHJzdnAkcHJvbWlzZSRyZWplY3QkJGRlZmF1bHQgPSBsaWIkcnN2cCRwcm9taXNlJHJlamVjdCQkcmVqZWN0O1xuXG4gICAgdmFyIGxpYiRyc3ZwJHByb21pc2UkJGd1aWRLZXkgPSAncnN2cF8nICsgbGliJHJzdnAkdXRpbHMkJG5vdygpICsgJy0nO1xuICAgIHZhciBsaWIkcnN2cCRwcm9taXNlJCRjb3VudGVyID0gMDtcblxuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJHByb21pc2UkJG5lZWRzUmVzb2x2ZXIoKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdZb3UgbXVzdCBwYXNzIGEgcmVzb2x2ZXIgZnVuY3Rpb24gYXMgdGhlIGZpcnN0IGFyZ3VtZW50IHRvIHRoZSBwcm9taXNlIGNvbnN0cnVjdG9yJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJHJzdnAkcHJvbWlzZSQkbmVlZHNOZXcoKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRmFpbGVkIHRvIGNvbnN0cnVjdCAnUHJvbWlzZSc6IFBsZWFzZSB1c2UgdGhlICduZXcnIG9wZXJhdG9yLCB0aGlzIG9iamVjdCBjb25zdHJ1Y3RvciBjYW5ub3QgYmUgY2FsbGVkIGFzIGEgZnVuY3Rpb24uXCIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJHByb21pc2UkJFByb21pc2UocmVzb2x2ZXIsIGxhYmVsKSB7XG4gICAgICB0aGlzLl9pZCA9IGxpYiRyc3ZwJHByb21pc2UkJGNvdW50ZXIrKztcbiAgICAgIHRoaXMuX2xhYmVsID0gbGFiZWw7XG4gICAgICB0aGlzLl9zdGF0ZSA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuX3Jlc3VsdCA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuX3N1YnNjcmliZXJzID0gW107XG5cbiAgICAgIGxpYiRyc3ZwJGNvbmZpZyQkY29uZmlnLmluc3RydW1lbnQgJiYgbGliJHJzdnAkaW5zdHJ1bWVudCQkZGVmYXVsdCgnY3JlYXRlZCcsIHRoaXMpO1xuXG4gICAgICBpZiAobGliJHJzdnAkJGludGVybmFsJCRub29wICE9PSByZXNvbHZlcikge1xuICAgICAgICB0eXBlb2YgcmVzb2x2ZXIgIT09ICdmdW5jdGlvbicgJiYgbGliJHJzdnAkcHJvbWlzZSQkbmVlZHNSZXNvbHZlcigpO1xuICAgICAgICB0aGlzIGluc3RhbmNlb2YgbGliJHJzdnAkcHJvbWlzZSQkUHJvbWlzZSA/IGxpYiRyc3ZwJCRpbnRlcm5hbCQkaW5pdGlhbGl6ZVByb21pc2UodGhpcywgcmVzb2x2ZXIpIDogbGliJHJzdnAkcHJvbWlzZSQkbmVlZHNOZXcoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgbGliJHJzdnAkcHJvbWlzZSQkZGVmYXVsdCA9IGxpYiRyc3ZwJHByb21pc2UkJFByb21pc2U7XG5cbiAgICAvLyBkZXByZWNhdGVkXG4gICAgbGliJHJzdnAkcHJvbWlzZSQkUHJvbWlzZS5jYXN0ID0gbGliJHJzdnAkcHJvbWlzZSRyZXNvbHZlJCRkZWZhdWx0O1xuICAgIGxpYiRyc3ZwJHByb21pc2UkJFByb21pc2UuYWxsID0gbGliJHJzdnAkcHJvbWlzZSRhbGwkJGRlZmF1bHQ7XG4gICAgbGliJHJzdnAkcHJvbWlzZSQkUHJvbWlzZS5yYWNlID0gbGliJHJzdnAkcHJvbWlzZSRyYWNlJCRkZWZhdWx0O1xuICAgIGxpYiRyc3ZwJHByb21pc2UkJFByb21pc2UucmVzb2x2ZSA9IGxpYiRyc3ZwJHByb21pc2UkcmVzb2x2ZSQkZGVmYXVsdDtcbiAgICBsaWIkcnN2cCRwcm9taXNlJCRQcm9taXNlLnJlamVjdCA9IGxpYiRyc3ZwJHByb21pc2UkcmVqZWN0JCRkZWZhdWx0O1xuXG4gICAgbGliJHJzdnAkcHJvbWlzZSQkUHJvbWlzZS5wcm90b3R5cGUgPSB7XG4gICAgICBjb25zdHJ1Y3RvcjogbGliJHJzdnAkcHJvbWlzZSQkUHJvbWlzZSxcblxuICAgICAgX2d1aWRLZXk6IGxpYiRyc3ZwJHByb21pc2UkJGd1aWRLZXksXG5cbiAgICAgIF9vbkVycm9yOiBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIHZhciBwcm9taXNlID0gdGhpcztcbiAgICAgICAgbGliJHJzdnAkY29uZmlnJCRjb25maWcuYWZ0ZXIoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKHByb21pc2UuX29uRXJyb3IpIHtcbiAgICAgICAgICAgIGxpYiRyc3ZwJGNvbmZpZyQkY29uZmlnWyd0cmlnZ2VyJ10oJ2Vycm9yJywgcmVhc29uLCBwcm9taXNlLl9sYWJlbCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sXG5cbiAgICAvKipcbiAgICAgIFRoZSBwcmltYXJ5IHdheSBvZiBpbnRlcmFjdGluZyB3aXRoIGEgcHJvbWlzZSBpcyB0aHJvdWdoIGl0cyBgdGhlbmAgbWV0aG9kLFxuICAgICAgd2hpY2ggcmVnaXN0ZXJzIGNhbGxiYWNrcyB0byByZWNlaXZlIGVpdGhlciBhIHByb21pc2UncyBldmVudHVhbCB2YWx1ZSBvciB0aGVcbiAgICAgIHJlYXNvbiB3aHkgdGhlIHByb21pc2UgY2Fubm90IGJlIGZ1bGZpbGxlZC5cblxuICAgICAgYGBganNcbiAgICAgIGZpbmRVc2VyKCkudGhlbihmdW5jdGlvbih1c2VyKXtcbiAgICAgICAgLy8gdXNlciBpcyBhdmFpbGFibGVcbiAgICAgIH0sIGZ1bmN0aW9uKHJlYXNvbil7XG4gICAgICAgIC8vIHVzZXIgaXMgdW5hdmFpbGFibGUsIGFuZCB5b3UgYXJlIGdpdmVuIHRoZSByZWFzb24gd2h5XG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBDaGFpbmluZ1xuICAgICAgLS0tLS0tLS1cblxuICAgICAgVGhlIHJldHVybiB2YWx1ZSBvZiBgdGhlbmAgaXMgaXRzZWxmIGEgcHJvbWlzZS4gIFRoaXMgc2Vjb25kLCAnZG93bnN0cmVhbSdcbiAgICAgIHByb21pc2UgaXMgcmVzb2x2ZWQgd2l0aCB0aGUgcmV0dXJuIHZhbHVlIG9mIHRoZSBmaXJzdCBwcm9taXNlJ3MgZnVsZmlsbG1lbnRcbiAgICAgIG9yIHJlamVjdGlvbiBoYW5kbGVyLCBvciByZWplY3RlZCBpZiB0aGUgaGFuZGxlciB0aHJvd3MgYW4gZXhjZXB0aW9uLlxuXG4gICAgICBgYGBqc1xuICAgICAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgIHJldHVybiB1c2VyLm5hbWU7XG4gICAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIHJldHVybiAnZGVmYXVsdCBuYW1lJztcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHVzZXJOYW1lKSB7XG4gICAgICAgIC8vIElmIGBmaW5kVXNlcmAgZnVsZmlsbGVkLCBgdXNlck5hbWVgIHdpbGwgYmUgdGhlIHVzZXIncyBuYW1lLCBvdGhlcndpc2UgaXRcbiAgICAgICAgLy8gd2lsbCBiZSBgJ2RlZmF1bHQgbmFtZSdgXG4gICAgICB9KTtcblxuICAgICAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRm91bmQgdXNlciwgYnV0IHN0aWxsIHVuaGFwcHknKTtcbiAgICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdgZmluZFVzZXJgIHJlamVjdGVkIGFuZCB3ZSdyZSB1bmhhcHB5Jyk7XG4gICAgICB9KS50aGVuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAvLyBuZXZlciByZWFjaGVkXG4gICAgICB9LCBmdW5jdGlvbiAocmVhc29uKSB7XG4gICAgICAgIC8vIGlmIGBmaW5kVXNlcmAgZnVsZmlsbGVkLCBgcmVhc29uYCB3aWxsIGJlICdGb3VuZCB1c2VyLCBidXQgc3RpbGwgdW5oYXBweScuXG4gICAgICAgIC8vIElmIGBmaW5kVXNlcmAgcmVqZWN0ZWQsIGByZWFzb25gIHdpbGwgYmUgJ2BmaW5kVXNlcmAgcmVqZWN0ZWQgYW5kIHdlJ3JlIHVuaGFwcHknLlxuICAgICAgfSk7XG4gICAgICBgYGBcbiAgICAgIElmIHRoZSBkb3duc3RyZWFtIHByb21pc2UgZG9lcyBub3Qgc3BlY2lmeSBhIHJlamVjdGlvbiBoYW5kbGVyLCByZWplY3Rpb24gcmVhc29ucyB3aWxsIGJlIHByb3BhZ2F0ZWQgZnVydGhlciBkb3duc3RyZWFtLlxuXG4gICAgICBgYGBqc1xuICAgICAgZmluZFVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgIHRocm93IG5ldyBQZWRhZ29naWNhbEV4Y2VwdGlvbignVXBzdHJlYW0gZXJyb3InKTtcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIC8vIG5ldmVyIHJlYWNoZWRcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIC8vIG5ldmVyIHJlYWNoZWRcbiAgICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgLy8gVGhlIGBQZWRnYWdvY2lhbEV4Y2VwdGlvbmAgaXMgcHJvcGFnYXRlZCBhbGwgdGhlIHdheSBkb3duIHRvIGhlcmVcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIEFzc2ltaWxhdGlvblxuICAgICAgLS0tLS0tLS0tLS0tXG5cbiAgICAgIFNvbWV0aW1lcyB0aGUgdmFsdWUgeW91IHdhbnQgdG8gcHJvcGFnYXRlIHRvIGEgZG93bnN0cmVhbSBwcm9taXNlIGNhbiBvbmx5IGJlXG4gICAgICByZXRyaWV2ZWQgYXN5bmNocm9ub3VzbHkuIFRoaXMgY2FuIGJlIGFjaGlldmVkIGJ5IHJldHVybmluZyBhIHByb21pc2UgaW4gdGhlXG4gICAgICBmdWxmaWxsbWVudCBvciByZWplY3Rpb24gaGFuZGxlci4gVGhlIGRvd25zdHJlYW0gcHJvbWlzZSB3aWxsIHRoZW4gYmUgcGVuZGluZ1xuICAgICAgdW50aWwgdGhlIHJldHVybmVkIHByb21pc2UgaXMgc2V0dGxlZC4gVGhpcyBpcyBjYWxsZWQgKmFzc2ltaWxhdGlvbiouXG5cbiAgICAgIGBgYGpzXG4gICAgICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgcmV0dXJuIGZpbmRDb21tZW50c0J5QXV0aG9yKHVzZXIpO1xuICAgICAgfSkudGhlbihmdW5jdGlvbiAoY29tbWVudHMpIHtcbiAgICAgICAgLy8gVGhlIHVzZXIncyBjb21tZW50cyBhcmUgbm93IGF2YWlsYWJsZVxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgSWYgdGhlIGFzc2ltbGlhdGVkIHByb21pc2UgcmVqZWN0cywgdGhlbiB0aGUgZG93bnN0cmVhbSBwcm9taXNlIHdpbGwgYWxzbyByZWplY3QuXG5cbiAgICAgIGBgYGpzXG4gICAgICBmaW5kVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgcmV0dXJuIGZpbmRDb21tZW50c0J5QXV0aG9yKHVzZXIpO1xuICAgICAgfSkudGhlbihmdW5jdGlvbiAoY29tbWVudHMpIHtcbiAgICAgICAgLy8gSWYgYGZpbmRDb21tZW50c0J5QXV0aG9yYCBmdWxmaWxscywgd2UnbGwgaGF2ZSB0aGUgdmFsdWUgaGVyZVxuICAgICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAvLyBJZiBgZmluZENvbW1lbnRzQnlBdXRob3JgIHJlamVjdHMsIHdlJ2xsIGhhdmUgdGhlIHJlYXNvbiBoZXJlXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBTaW1wbGUgRXhhbXBsZVxuICAgICAgLS0tLS0tLS0tLS0tLS1cblxuICAgICAgU3luY2hyb25vdXMgRXhhbXBsZVxuXG4gICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICB2YXIgcmVzdWx0O1xuXG4gICAgICB0cnkge1xuICAgICAgICByZXN1bHQgPSBmaW5kUmVzdWx0KCk7XG4gICAgICAgIC8vIHN1Y2Nlc3NcbiAgICAgIH0gY2F0Y2gocmVhc29uKSB7XG4gICAgICAgIC8vIGZhaWx1cmVcbiAgICAgIH1cbiAgICAgIGBgYFxuXG4gICAgICBFcnJiYWNrIEV4YW1wbGVcblxuICAgICAgYGBganNcbiAgICAgIGZpbmRSZXN1bHQoZnVuY3Rpb24ocmVzdWx0LCBlcnIpe1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgLy8gZmFpbHVyZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIHN1Y2Nlc3NcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgUHJvbWlzZSBFeGFtcGxlO1xuXG4gICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICBmaW5kUmVzdWx0KCkudGhlbihmdW5jdGlvbihyZXN1bHQpe1xuICAgICAgICAvLyBzdWNjZXNzXG4gICAgICB9LCBmdW5jdGlvbihyZWFzb24pe1xuICAgICAgICAvLyBmYWlsdXJlXG4gICAgICB9KTtcbiAgICAgIGBgYFxuXG4gICAgICBBZHZhbmNlZCBFeGFtcGxlXG4gICAgICAtLS0tLS0tLS0tLS0tLVxuXG4gICAgICBTeW5jaHJvbm91cyBFeGFtcGxlXG5cbiAgICAgIGBgYGphdmFzY3JpcHRcbiAgICAgIHZhciBhdXRob3IsIGJvb2tzO1xuXG4gICAgICB0cnkge1xuICAgICAgICBhdXRob3IgPSBmaW5kQXV0aG9yKCk7XG4gICAgICAgIGJvb2tzICA9IGZpbmRCb29rc0J5QXV0aG9yKGF1dGhvcik7XG4gICAgICAgIC8vIHN1Y2Nlc3NcbiAgICAgIH0gY2F0Y2gocmVhc29uKSB7XG4gICAgICAgIC8vIGZhaWx1cmVcbiAgICAgIH1cbiAgICAgIGBgYFxuXG4gICAgICBFcnJiYWNrIEV4YW1wbGVcblxuICAgICAgYGBganNcblxuICAgICAgZnVuY3Rpb24gZm91bmRCb29rcyhib29rcykge1xuXG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGZhaWx1cmUocmVhc29uKSB7XG5cbiAgICAgIH1cblxuICAgICAgZmluZEF1dGhvcihmdW5jdGlvbihhdXRob3IsIGVycil7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBmYWlsdXJlKGVycik7XG4gICAgICAgICAgLy8gZmFpbHVyZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBmaW5kQm9vb2tzQnlBdXRob3IoYXV0aG9yLCBmdW5jdGlvbihib29rcywgZXJyKSB7XG4gICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBmYWlsdXJlKGVycik7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgIGZvdW5kQm9va3MoYm9va3MpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2gocmVhc29uKSB7XG4gICAgICAgICAgICAgICAgICBmYWlsdXJlKHJlYXNvbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICAgICAgICBmYWlsdXJlKGVycik7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIHN1Y2Nlc3NcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBgYGBcblxuICAgICAgUHJvbWlzZSBFeGFtcGxlO1xuXG4gICAgICBgYGBqYXZhc2NyaXB0XG4gICAgICBmaW5kQXV0aG9yKCkuXG4gICAgICAgIHRoZW4oZmluZEJvb2tzQnlBdXRob3IpLlxuICAgICAgICB0aGVuKGZ1bmN0aW9uKGJvb2tzKXtcbiAgICAgICAgICAvLyBmb3VuZCBib29rc1xuICAgICAgfSkuY2F0Y2goZnVuY3Rpb24ocmVhc29uKXtcbiAgICAgICAgLy8gc29tZXRoaW5nIHdlbnQgd3JvbmdcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIEBtZXRob2QgdGhlblxuICAgICAgQHBhcmFtIHtGdW5jdGlvbn0gb25GdWxmaWxsbWVudFxuICAgICAgQHBhcmFtIHtGdW5jdGlvbn0gb25SZWplY3Rpb25cbiAgICAgIEBwYXJhbSB7U3RyaW5nfSBsYWJlbCBvcHRpb25hbCBzdHJpbmcgZm9yIGxhYmVsaW5nIHRoZSBwcm9taXNlLlxuICAgICAgVXNlZnVsIGZvciB0b29saW5nLlxuICAgICAgQHJldHVybiB7UHJvbWlzZX1cbiAgICAqL1xuICAgICAgdGhlbjogbGliJHJzdnAkdGhlbiQkZGVmYXVsdCxcblxuICAgIC8qKlxuICAgICAgYGNhdGNoYCBpcyBzaW1wbHkgc3VnYXIgZm9yIGB0aGVuKHVuZGVmaW5lZCwgb25SZWplY3Rpb24pYCB3aGljaCBtYWtlcyBpdCB0aGUgc2FtZVxuICAgICAgYXMgdGhlIGNhdGNoIGJsb2NrIG9mIGEgdHJ5L2NhdGNoIHN0YXRlbWVudC5cblxuICAgICAgYGBganNcbiAgICAgIGZ1bmN0aW9uIGZpbmRBdXRob3IoKXtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb3VsZG4ndCBmaW5kIHRoYXQgYXV0aG9yJyk7XG4gICAgICB9XG5cbiAgICAgIC8vIHN5bmNocm9ub3VzXG4gICAgICB0cnkge1xuICAgICAgICBmaW5kQXV0aG9yKCk7XG4gICAgICB9IGNhdGNoKHJlYXNvbikge1xuICAgICAgICAvLyBzb21ldGhpbmcgd2VudCB3cm9uZ1xuICAgICAgfVxuXG4gICAgICAvLyBhc3luYyB3aXRoIHByb21pc2VzXG4gICAgICBmaW5kQXV0aG9yKCkuY2F0Y2goZnVuY3Rpb24ocmVhc29uKXtcbiAgICAgICAgLy8gc29tZXRoaW5nIHdlbnQgd3JvbmdcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIEBtZXRob2QgY2F0Y2hcbiAgICAgIEBwYXJhbSB7RnVuY3Rpb259IG9uUmVqZWN0aW9uXG4gICAgICBAcGFyYW0ge1N0cmluZ30gbGFiZWwgb3B0aW9uYWwgc3RyaW5nIGZvciBsYWJlbGluZyB0aGUgcHJvbWlzZS5cbiAgICAgIFVzZWZ1bCBmb3IgdG9vbGluZy5cbiAgICAgIEByZXR1cm4ge1Byb21pc2V9XG4gICAgKi9cbiAgICAgICdjYXRjaCc6IGZ1bmN0aW9uKG9uUmVqZWN0aW9uLCBsYWJlbCkge1xuICAgICAgICByZXR1cm4gdGhpcy50aGVuKHVuZGVmaW5lZCwgb25SZWplY3Rpb24sIGxhYmVsKTtcbiAgICAgIH0sXG5cbiAgICAvKipcbiAgICAgIGBmaW5hbGx5YCB3aWxsIGJlIGludm9rZWQgcmVnYXJkbGVzcyBvZiB0aGUgcHJvbWlzZSdzIGZhdGUganVzdCBhcyBuYXRpdmVcbiAgICAgIHRyeS9jYXRjaC9maW5hbGx5IGJlaGF2ZXNcblxuICAgICAgU3luY2hyb25vdXMgZXhhbXBsZTpcblxuICAgICAgYGBganNcbiAgICAgIGZpbmRBdXRob3IoKSB7XG4gICAgICAgIGlmIChNYXRoLnJhbmRvbSgpID4gMC41KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBBdXRob3IoKTtcbiAgICAgIH1cblxuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGZpbmRBdXRob3IoKTsgLy8gc3VjY2VlZCBvciBmYWlsXG4gICAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICAgIHJldHVybiBmaW5kT3RoZXJBdXRoZXIoKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIC8vIGFsd2F5cyBydW5zXG4gICAgICAgIC8vIGRvZXNuJ3QgYWZmZWN0IHRoZSByZXR1cm4gdmFsdWVcbiAgICAgIH1cbiAgICAgIGBgYFxuXG4gICAgICBBc3luY2hyb25vdXMgZXhhbXBsZTpcblxuICAgICAgYGBganNcbiAgICAgIGZpbmRBdXRob3IoKS5jYXRjaChmdW5jdGlvbihyZWFzb24pe1xuICAgICAgICByZXR1cm4gZmluZE90aGVyQXV0aGVyKCk7XG4gICAgICB9KS5maW5hbGx5KGZ1bmN0aW9uKCl7XG4gICAgICAgIC8vIGF1dGhvciB3YXMgZWl0aGVyIGZvdW5kLCBvciBub3RcbiAgICAgIH0pO1xuICAgICAgYGBgXG5cbiAgICAgIEBtZXRob2QgZmluYWxseVxuICAgICAgQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAgICAgIEBwYXJhbSB7U3RyaW5nfSBsYWJlbCBvcHRpb25hbCBzdHJpbmcgZm9yIGxhYmVsaW5nIHRoZSBwcm9taXNlLlxuICAgICAgVXNlZnVsIGZvciB0b29saW5nLlxuICAgICAgQHJldHVybiB7UHJvbWlzZX1cbiAgICAqL1xuICAgICAgJ2ZpbmFsbHknOiBmdW5jdGlvbihjYWxsYmFjaywgbGFiZWwpIHtcbiAgICAgICAgdmFyIHByb21pc2UgPSB0aGlzO1xuICAgICAgICB2YXIgY29uc3RydWN0b3IgPSBwcm9taXNlLmNvbnN0cnVjdG9yO1xuXG4gICAgICAgIHJldHVybiBwcm9taXNlLnRoZW4oZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICByZXR1cm4gY29uc3RydWN0b3IucmVzb2x2ZShjYWxsYmFjaygpKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LCBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgICByZXR1cm4gY29uc3RydWN0b3IucmVzb2x2ZShjYWxsYmFjaygpKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGNvbnN0cnVjdG9yLnJlamVjdChyZWFzb24pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LCBsYWJlbCk7XG4gICAgICB9XG4gICAgfTtcbiAgICBmdW5jdGlvbiAgbGliJHJzdnAkJGludGVybmFsJCR3aXRoT3duUHJvbWlzZSgpIHtcbiAgICAgIHJldHVybiBuZXcgVHlwZUVycm9yKCdBIHByb21pc2VzIGNhbGxiYWNrIGNhbm5vdCByZXR1cm4gdGhhdCBzYW1lIHByb21pc2UuJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJHJzdnAkJGludGVybmFsJCRub29wKCkge31cblxuICAgIHZhciBsaWIkcnN2cCQkaW50ZXJuYWwkJFBFTkRJTkcgICA9IHZvaWQgMDtcbiAgICB2YXIgbGliJHJzdnAkJGludGVybmFsJCRGVUxGSUxMRUQgPSAxO1xuICAgIHZhciBsaWIkcnN2cCQkaW50ZXJuYWwkJFJFSkVDVEVEICA9IDI7XG5cbiAgICB2YXIgbGliJHJzdnAkJGludGVybmFsJCRHRVRfVEhFTl9FUlJPUiA9IG5ldyBsaWIkcnN2cCQkaW50ZXJuYWwkJEVycm9yT2JqZWN0KCk7XG5cbiAgICBmdW5jdGlvbiBsaWIkcnN2cCQkaW50ZXJuYWwkJGdldFRoZW4ocHJvbWlzZSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIHByb21pc2UudGhlbjtcbiAgICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgICAgbGliJHJzdnAkJGludGVybmFsJCRHRVRfVEhFTl9FUlJPUi5lcnJvciA9IGVycm9yO1xuICAgICAgICByZXR1cm4gbGliJHJzdnAkJGludGVybmFsJCRHRVRfVEhFTl9FUlJPUjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkcnN2cCQkaW50ZXJuYWwkJHRyeVRoZW4odGhlbiwgdmFsdWUsIGZ1bGZpbGxtZW50SGFuZGxlciwgcmVqZWN0aW9uSGFuZGxlcikge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhlbi5jYWxsKHZhbHVlLCBmdWxmaWxsbWVudEhhbmRsZXIsIHJlamVjdGlvbkhhbmRsZXIpO1xuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIHJldHVybiBlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJCRpbnRlcm5hbCQkaGFuZGxlRm9yZWlnblRoZW5hYmxlKHByb21pc2UsIHRoZW5hYmxlLCB0aGVuKSB7XG4gICAgICBsaWIkcnN2cCRjb25maWckJGNvbmZpZy5hc3luYyhmdW5jdGlvbihwcm9taXNlKSB7XG4gICAgICAgIHZhciBzZWFsZWQgPSBmYWxzZTtcbiAgICAgICAgdmFyIGVycm9yID0gbGliJHJzdnAkJGludGVybmFsJCR0cnlUaGVuKHRoZW4sIHRoZW5hYmxlLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgIGlmIChzZWFsZWQpIHsgcmV0dXJuOyB9XG4gICAgICAgICAgc2VhbGVkID0gdHJ1ZTtcbiAgICAgICAgICBpZiAodGhlbmFibGUgIT09IHZhbHVlKSB7XG4gICAgICAgICAgICBsaWIkcnN2cCQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgdmFsdWUsIHVuZGVmaW5lZCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxpYiRyc3ZwJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCB2YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCBmdW5jdGlvbihyZWFzb24pIHtcbiAgICAgICAgICBpZiAoc2VhbGVkKSB7IHJldHVybjsgfVxuICAgICAgICAgIHNlYWxlZCA9IHRydWU7XG5cbiAgICAgICAgICBsaWIkcnN2cCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCByZWFzb24pO1xuICAgICAgICB9LCAnU2V0dGxlOiAnICsgKHByb21pc2UuX2xhYmVsIHx8ICcgdW5rbm93biBwcm9taXNlJykpO1xuXG4gICAgICAgIGlmICghc2VhbGVkICYmIGVycm9yKSB7XG4gICAgICAgICAgc2VhbGVkID0gdHJ1ZTtcbiAgICAgICAgICBsaWIkcnN2cCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICAgIH0sIHByb21pc2UpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJCRpbnRlcm5hbCQkaGFuZGxlT3duVGhlbmFibGUocHJvbWlzZSwgdGhlbmFibGUpIHtcbiAgICAgIGlmICh0aGVuYWJsZS5fc3RhdGUgPT09IGxpYiRyc3ZwJCRpbnRlcm5hbCQkRlVMRklMTEVEKSB7XG4gICAgICAgIGxpYiRyc3ZwJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCB0aGVuYWJsZS5fcmVzdWx0KTtcbiAgICAgIH0gZWxzZSBpZiAodGhlbmFibGUuX3N0YXRlID09PSBsaWIkcnN2cCQkaW50ZXJuYWwkJFJFSkVDVEVEKSB7XG4gICAgICAgIHRoZW5hYmxlLl9vbkVycm9yID0gbnVsbDtcbiAgICAgICAgbGliJHJzdnAkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgdGhlbmFibGUuX3Jlc3VsdCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsaWIkcnN2cCQkaW50ZXJuYWwkJHN1YnNjcmliZSh0aGVuYWJsZSwgdW5kZWZpbmVkLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgIGlmICh0aGVuYWJsZSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgIGxpYiRyc3ZwJCRpbnRlcm5hbCQkcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSwgdW5kZWZpbmVkKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGliJHJzdnAkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIHZhbHVlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIGZ1bmN0aW9uKHJlYXNvbikge1xuICAgICAgICAgIGxpYiRyc3ZwJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHJlYXNvbik7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJCRpbnRlcm5hbCQkaGFuZGxlTWF5YmVUaGVuYWJsZShwcm9taXNlLCBtYXliZVRoZW5hYmxlLCB0aGVuKSB7XG4gICAgICBpZiAobWF5YmVUaGVuYWJsZS5jb25zdHJ1Y3RvciA9PT0gcHJvbWlzZS5jb25zdHJ1Y3RvciAmJlxuICAgICAgICAgIHRoZW4gPT09IGxpYiRyc3ZwJHRoZW4kJGRlZmF1bHQgJiZcbiAgICAgICAgICBjb25zdHJ1Y3Rvci5yZXNvbHZlID09PSBsaWIkcnN2cCRwcm9taXNlJHJlc29sdmUkJGRlZmF1bHQpIHtcbiAgICAgICAgbGliJHJzdnAkJGludGVybmFsJCRoYW5kbGVPd25UaGVuYWJsZShwcm9taXNlLCBtYXliZVRoZW5hYmxlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh0aGVuID09PSBsaWIkcnN2cCQkaW50ZXJuYWwkJEdFVF9USEVOX0VSUk9SKSB7XG4gICAgICAgICAgbGliJHJzdnAkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgbGliJHJzdnAkJGludGVybmFsJCRHRVRfVEhFTl9FUlJPUi5lcnJvcik7XG4gICAgICAgIH0gZWxzZSBpZiAodGhlbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgbGliJHJzdnAkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIG1heWJlVGhlbmFibGUpO1xuICAgICAgICB9IGVsc2UgaWYgKGxpYiRyc3ZwJHV0aWxzJCRpc0Z1bmN0aW9uKHRoZW4pKSB7XG4gICAgICAgICAgbGliJHJzdnAkJGludGVybmFsJCRoYW5kbGVGb3JlaWduVGhlbmFibGUocHJvbWlzZSwgbWF5YmVUaGVuYWJsZSwgdGhlbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGliJHJzdnAkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIG1heWJlVGhlbmFibGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJHJzdnAkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIHZhbHVlKSB7XG4gICAgICBpZiAocHJvbWlzZSA9PT0gdmFsdWUpIHtcbiAgICAgICAgbGliJHJzdnAkJGludGVybmFsJCRmdWxmaWxsKHByb21pc2UsIHZhbHVlKTtcbiAgICAgIH0gZWxzZSBpZiAobGliJHJzdnAkdXRpbHMkJG9iamVjdE9yRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICAgIGxpYiRyc3ZwJCRpbnRlcm5hbCQkaGFuZGxlTWF5YmVUaGVuYWJsZShwcm9taXNlLCB2YWx1ZSwgbGliJHJzdnAkJGludGVybmFsJCRnZXRUaGVuKHZhbHVlKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsaWIkcnN2cCQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJCRpbnRlcm5hbCQkcHVibGlzaFJlamVjdGlvbihwcm9taXNlKSB7XG4gICAgICBpZiAocHJvbWlzZS5fb25FcnJvcikge1xuICAgICAgICBwcm9taXNlLl9vbkVycm9yKHByb21pc2UuX3Jlc3VsdCk7XG4gICAgICB9XG5cbiAgICAgIGxpYiRyc3ZwJCRpbnRlcm5hbCQkcHVibGlzaChwcm9taXNlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkcnN2cCQkaW50ZXJuYWwkJGZ1bGZpbGwocHJvbWlzZSwgdmFsdWUpIHtcbiAgICAgIGlmIChwcm9taXNlLl9zdGF0ZSAhPT0gbGliJHJzdnAkJGludGVybmFsJCRQRU5ESU5HKSB7IHJldHVybjsgfVxuXG4gICAgICBwcm9taXNlLl9yZXN1bHQgPSB2YWx1ZTtcbiAgICAgIHByb21pc2UuX3N0YXRlID0gbGliJHJzdnAkJGludGVybmFsJCRGVUxGSUxMRUQ7XG5cbiAgICAgIGlmIChwcm9taXNlLl9zdWJzY3JpYmVycy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgaWYgKGxpYiRyc3ZwJGNvbmZpZyQkY29uZmlnLmluc3RydW1lbnQpIHtcbiAgICAgICAgICBsaWIkcnN2cCRpbnN0cnVtZW50JCRkZWZhdWx0KCdmdWxmaWxsZWQnLCBwcm9taXNlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGliJHJzdnAkY29uZmlnJCRjb25maWcuYXN5bmMobGliJHJzdnAkJGludGVybmFsJCRwdWJsaXNoLCBwcm9taXNlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkcnN2cCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCByZWFzb24pIHtcbiAgICAgIGlmIChwcm9taXNlLl9zdGF0ZSAhPT0gbGliJHJzdnAkJGludGVybmFsJCRQRU5ESU5HKSB7IHJldHVybjsgfVxuICAgICAgcHJvbWlzZS5fc3RhdGUgPSBsaWIkcnN2cCQkaW50ZXJuYWwkJFJFSkVDVEVEO1xuICAgICAgcHJvbWlzZS5fcmVzdWx0ID0gcmVhc29uO1xuICAgICAgbGliJHJzdnAkY29uZmlnJCRjb25maWcuYXN5bmMobGliJHJzdnAkJGludGVybmFsJCRwdWJsaXNoUmVqZWN0aW9uLCBwcm9taXNlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkcnN2cCQkaW50ZXJuYWwkJHN1YnNjcmliZShwYXJlbnQsIGNoaWxkLCBvbkZ1bGZpbGxtZW50LCBvblJlamVjdGlvbikge1xuICAgICAgdmFyIHN1YnNjcmliZXJzID0gcGFyZW50Ll9zdWJzY3JpYmVycztcbiAgICAgIHZhciBsZW5ndGggPSBzdWJzY3JpYmVycy5sZW5ndGg7XG5cbiAgICAgIHBhcmVudC5fb25FcnJvciA9IG51bGw7XG5cbiAgICAgIHN1YnNjcmliZXJzW2xlbmd0aF0gPSBjaGlsZDtcbiAgICAgIHN1YnNjcmliZXJzW2xlbmd0aCArIGxpYiRyc3ZwJCRpbnRlcm5hbCQkRlVMRklMTEVEXSA9IG9uRnVsZmlsbG1lbnQ7XG4gICAgICBzdWJzY3JpYmVyc1tsZW5ndGggKyBsaWIkcnN2cCQkaW50ZXJuYWwkJFJFSkVDVEVEXSAgPSBvblJlamVjdGlvbjtcblxuICAgICAgaWYgKGxlbmd0aCA9PT0gMCAmJiBwYXJlbnQuX3N0YXRlKSB7XG4gICAgICAgIGxpYiRyc3ZwJGNvbmZpZyQkY29uZmlnLmFzeW5jKGxpYiRyc3ZwJCRpbnRlcm5hbCQkcHVibGlzaCwgcGFyZW50KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkcnN2cCQkaW50ZXJuYWwkJHB1Ymxpc2gocHJvbWlzZSkge1xuICAgICAgdmFyIHN1YnNjcmliZXJzID0gcHJvbWlzZS5fc3Vic2NyaWJlcnM7XG4gICAgICB2YXIgc2V0dGxlZCA9IHByb21pc2UuX3N0YXRlO1xuXG4gICAgICBpZiAobGliJHJzdnAkY29uZmlnJCRjb25maWcuaW5zdHJ1bWVudCkge1xuICAgICAgICBsaWIkcnN2cCRpbnN0cnVtZW50JCRkZWZhdWx0KHNldHRsZWQgPT09IGxpYiRyc3ZwJCRpbnRlcm5hbCQkRlVMRklMTEVEID8gJ2Z1bGZpbGxlZCcgOiAncmVqZWN0ZWQnLCBwcm9taXNlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHN1YnNjcmliZXJzLmxlbmd0aCA9PT0gMCkgeyByZXR1cm47IH1cblxuICAgICAgdmFyIGNoaWxkLCBjYWxsYmFjaywgZGV0YWlsID0gcHJvbWlzZS5fcmVzdWx0O1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN1YnNjcmliZXJzLmxlbmd0aDsgaSArPSAzKSB7XG4gICAgICAgIGNoaWxkID0gc3Vic2NyaWJlcnNbaV07XG4gICAgICAgIGNhbGxiYWNrID0gc3Vic2NyaWJlcnNbaSArIHNldHRsZWRdO1xuXG4gICAgICAgIGlmIChjaGlsZCkge1xuICAgICAgICAgIGxpYiRyc3ZwJCRpbnRlcm5hbCQkaW52b2tlQ2FsbGJhY2soc2V0dGxlZCwgY2hpbGQsIGNhbGxiYWNrLCBkZXRhaWwpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNhbGxiYWNrKGRldGFpbCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcHJvbWlzZS5fc3Vic2NyaWJlcnMubGVuZ3RoID0gMDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkcnN2cCQkaW50ZXJuYWwkJEVycm9yT2JqZWN0KCkge1xuICAgICAgdGhpcy5lcnJvciA9IG51bGw7XG4gICAgfVxuXG4gICAgdmFyIGxpYiRyc3ZwJCRpbnRlcm5hbCQkVFJZX0NBVENIX0VSUk9SID0gbmV3IGxpYiRyc3ZwJCRpbnRlcm5hbCQkRXJyb3JPYmplY3QoKTtcblxuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJCRpbnRlcm5hbCQkdHJ5Q2F0Y2goY2FsbGJhY2ssIGRldGFpbCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGRldGFpbCk7XG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgbGliJHJzdnAkJGludGVybmFsJCRUUllfQ0FUQ0hfRVJST1IuZXJyb3IgPSBlO1xuICAgICAgICByZXR1cm4gbGliJHJzdnAkJGludGVybmFsJCRUUllfQ0FUQ0hfRVJST1I7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJHJzdnAkJGludGVybmFsJCRpbnZva2VDYWxsYmFjayhzZXR0bGVkLCBwcm9taXNlLCBjYWxsYmFjaywgZGV0YWlsKSB7XG4gICAgICB2YXIgaGFzQ2FsbGJhY2sgPSBsaWIkcnN2cCR1dGlscyQkaXNGdW5jdGlvbihjYWxsYmFjayksXG4gICAgICAgICAgdmFsdWUsIGVycm9yLCBzdWNjZWVkZWQsIGZhaWxlZDtcblxuICAgICAgaWYgKGhhc0NhbGxiYWNrKSB7XG4gICAgICAgIHZhbHVlID0gbGliJHJzdnAkJGludGVybmFsJCR0cnlDYXRjaChjYWxsYmFjaywgZGV0YWlsKTtcblxuICAgICAgICBpZiAodmFsdWUgPT09IGxpYiRyc3ZwJCRpbnRlcm5hbCQkVFJZX0NBVENIX0VSUk9SKSB7XG4gICAgICAgICAgZmFpbGVkID0gdHJ1ZTtcbiAgICAgICAgICBlcnJvciA9IHZhbHVlLmVycm9yO1xuICAgICAgICAgIHZhbHVlID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdWNjZWVkZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHByb21pc2UgPT09IHZhbHVlKSB7XG4gICAgICAgICAgbGliJHJzdnAkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgbGliJHJzdnAkJGludGVybmFsJCR3aXRoT3duUHJvbWlzZSgpKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWUgPSBkZXRhaWw7XG4gICAgICAgIHN1Y2NlZWRlZCA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChwcm9taXNlLl9zdGF0ZSAhPT0gbGliJHJzdnAkJGludGVybmFsJCRQRU5ESU5HKSB7XG4gICAgICAgIC8vIG5vb3BcbiAgICAgIH0gZWxzZSBpZiAoaGFzQ2FsbGJhY2sgJiYgc3VjY2VlZGVkKSB7XG4gICAgICAgIGxpYiRyc3ZwJCRpbnRlcm5hbCQkcmVzb2x2ZShwcm9taXNlLCB2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGZhaWxlZCkge1xuICAgICAgICBsaWIkcnN2cCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCBlcnJvcik7XG4gICAgICB9IGVsc2UgaWYgKHNldHRsZWQgPT09IGxpYiRyc3ZwJCRpbnRlcm5hbCQkRlVMRklMTEVEKSB7XG4gICAgICAgIGxpYiRyc3ZwJCRpbnRlcm5hbCQkZnVsZmlsbChwcm9taXNlLCB2YWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKHNldHRsZWQgPT09IGxpYiRyc3ZwJCRpbnRlcm5hbCQkUkVKRUNURUQpIHtcbiAgICAgICAgbGliJHJzdnAkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgdmFsdWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJCRpbnRlcm5hbCQkaW5pdGlhbGl6ZVByb21pc2UocHJvbWlzZSwgcmVzb2x2ZXIpIHtcbiAgICAgIHZhciByZXNvbHZlZCA9IGZhbHNlO1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmVzb2x2ZXIoZnVuY3Rpb24gcmVzb2x2ZVByb21pc2UodmFsdWUpe1xuICAgICAgICAgIGlmIChyZXNvbHZlZCkgeyByZXR1cm47IH1cbiAgICAgICAgICByZXNvbHZlZCA9IHRydWU7XG4gICAgICAgICAgbGliJHJzdnAkJGludGVybmFsJCRyZXNvbHZlKHByb21pc2UsIHZhbHVlKTtcbiAgICAgICAgfSwgZnVuY3Rpb24gcmVqZWN0UHJvbWlzZShyZWFzb24pIHtcbiAgICAgICAgICBpZiAocmVzb2x2ZWQpIHsgcmV0dXJuOyB9XG4gICAgICAgICAgcmVzb2x2ZWQgPSB0cnVlO1xuICAgICAgICAgIGxpYiRyc3ZwJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHJlYXNvbik7XG4gICAgICAgIH0pO1xuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIGxpYiRyc3ZwJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIGUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJGFsbCRzZXR0bGVkJCRBbGxTZXR0bGVkKENvbnN0cnVjdG9yLCBlbnRyaWVzLCBsYWJlbCkge1xuICAgICAgdGhpcy5fc3VwZXJDb25zdHJ1Y3RvcihDb25zdHJ1Y3RvciwgZW50cmllcywgZmFsc2UgLyogZG9uJ3QgYWJvcnQgb24gcmVqZWN0ICovLCBsYWJlbCk7XG4gICAgfVxuXG4gICAgbGliJHJzdnAkYWxsJHNldHRsZWQkJEFsbFNldHRsZWQucHJvdG90eXBlID0gbGliJHJzdnAkdXRpbHMkJG9fY3JlYXRlKGxpYiRyc3ZwJGVudW1lcmF0b3IkJGRlZmF1bHQucHJvdG90eXBlKTtcbiAgICBsaWIkcnN2cCRhbGwkc2V0dGxlZCQkQWxsU2V0dGxlZC5wcm90b3R5cGUuX3N1cGVyQ29uc3RydWN0b3IgPSBsaWIkcnN2cCRlbnVtZXJhdG9yJCRkZWZhdWx0O1xuICAgIGxpYiRyc3ZwJGFsbCRzZXR0bGVkJCRBbGxTZXR0bGVkLnByb3RvdHlwZS5fbWFrZVJlc3VsdCA9IGxpYiRyc3ZwJGVudW1lcmF0b3IkJG1ha2VTZXR0bGVkUmVzdWx0O1xuICAgIGxpYiRyc3ZwJGFsbCRzZXR0bGVkJCRBbGxTZXR0bGVkLnByb3RvdHlwZS5fdmFsaWRhdGlvbkVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbmV3IEVycm9yKCdhbGxTZXR0bGVkIG11c3QgYmUgY2FsbGVkIHdpdGggYW4gYXJyYXknKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gbGliJHJzdnAkYWxsJHNldHRsZWQkJGFsbFNldHRsZWQoZW50cmllcywgbGFiZWwpIHtcbiAgICAgIHJldHVybiBuZXcgbGliJHJzdnAkYWxsJHNldHRsZWQkJEFsbFNldHRsZWQobGliJHJzdnAkcHJvbWlzZSQkZGVmYXVsdCwgZW50cmllcywgbGFiZWwpLnByb21pc2U7XG4gICAgfVxuICAgIHZhciBsaWIkcnN2cCRhbGwkc2V0dGxlZCQkZGVmYXVsdCA9IGxpYiRyc3ZwJGFsbCRzZXR0bGVkJCRhbGxTZXR0bGVkO1xuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJGFsbCQkYWxsKGFycmF5LCBsYWJlbCkge1xuICAgICAgcmV0dXJuIGxpYiRyc3ZwJHByb21pc2UkJGRlZmF1bHQuYWxsKGFycmF5LCBsYWJlbCk7XG4gICAgfVxuICAgIHZhciBsaWIkcnN2cCRhbGwkJGRlZmF1bHQgPSBsaWIkcnN2cCRhbGwkJGFsbDtcbiAgICB2YXIgbGliJHJzdnAkYXNhcCQkbGVuID0gMDtcbiAgICB2YXIgbGliJHJzdnAkYXNhcCQkdG9TdHJpbmcgPSB7fS50b1N0cmluZztcbiAgICB2YXIgbGliJHJzdnAkYXNhcCQkdmVydHhOZXh0O1xuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJGFzYXAkJGFzYXAoY2FsbGJhY2ssIGFyZykge1xuICAgICAgbGliJHJzdnAkYXNhcCQkcXVldWVbbGliJHJzdnAkYXNhcCQkbGVuXSA9IGNhbGxiYWNrO1xuICAgICAgbGliJHJzdnAkYXNhcCQkcXVldWVbbGliJHJzdnAkYXNhcCQkbGVuICsgMV0gPSBhcmc7XG4gICAgICBsaWIkcnN2cCRhc2FwJCRsZW4gKz0gMjtcbiAgICAgIGlmIChsaWIkcnN2cCRhc2FwJCRsZW4gPT09IDIpIHtcbiAgICAgICAgLy8gSWYgbGVuIGlzIDEsIHRoYXQgbWVhbnMgdGhhdCB3ZSBuZWVkIHRvIHNjaGVkdWxlIGFuIGFzeW5jIGZsdXNoLlxuICAgICAgICAvLyBJZiBhZGRpdGlvbmFsIGNhbGxiYWNrcyBhcmUgcXVldWVkIGJlZm9yZSB0aGUgcXVldWUgaXMgZmx1c2hlZCwgdGhleVxuICAgICAgICAvLyB3aWxsIGJlIHByb2Nlc3NlZCBieSB0aGlzIGZsdXNoIHRoYXQgd2UgYXJlIHNjaGVkdWxpbmcuXG4gICAgICAgIGxpYiRyc3ZwJGFzYXAkJHNjaGVkdWxlRmx1c2goKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgbGliJHJzdnAkYXNhcCQkZGVmYXVsdCA9IGxpYiRyc3ZwJGFzYXAkJGFzYXA7XG5cbiAgICB2YXIgbGliJHJzdnAkYXNhcCQkYnJvd3NlcldpbmRvdyA9ICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykgPyB3aW5kb3cgOiB1bmRlZmluZWQ7XG4gICAgdmFyIGxpYiRyc3ZwJGFzYXAkJGJyb3dzZXJHbG9iYWwgPSBsaWIkcnN2cCRhc2FwJCRicm93c2VyV2luZG93IHx8IHt9O1xuICAgIHZhciBsaWIkcnN2cCRhc2FwJCRCcm93c2VyTXV0YXRpb25PYnNlcnZlciA9IGxpYiRyc3ZwJGFzYXAkJGJyb3dzZXJHbG9iYWwuTXV0YXRpb25PYnNlcnZlciB8fCBsaWIkcnN2cCRhc2FwJCRicm93c2VyR2xvYmFsLldlYktpdE11dGF0aW9uT2JzZXJ2ZXI7XG4gICAgdmFyIGxpYiRyc3ZwJGFzYXAkJGlzTm9kZSA9IHR5cGVvZiBzZWxmID09PSAndW5kZWZpbmVkJyAmJlxuICAgICAgdHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIHt9LnRvU3RyaW5nLmNhbGwocHJvY2VzcykgPT09ICdbb2JqZWN0IHByb2Nlc3NdJztcblxuICAgIC8vIHRlc3QgZm9yIHdlYiB3b3JrZXIgYnV0IG5vdCBpbiBJRTEwXG4gICAgdmFyIGxpYiRyc3ZwJGFzYXAkJGlzV29ya2VyID0gdHlwZW9mIFVpbnQ4Q2xhbXBlZEFycmF5ICE9PSAndW5kZWZpbmVkJyAmJlxuICAgICAgdHlwZW9mIGltcG9ydFNjcmlwdHMgIT09ICd1bmRlZmluZWQnICYmXG4gICAgICB0eXBlb2YgTWVzc2FnZUNoYW5uZWwgIT09ICd1bmRlZmluZWQnO1xuXG4gICAgLy8gbm9kZVxuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJGFzYXAkJHVzZU5leHRUaWNrKCkge1xuICAgICAgdmFyIG5leHRUaWNrID0gcHJvY2Vzcy5uZXh0VGljaztcbiAgICAgIC8vIG5vZGUgdmVyc2lvbiAwLjEwLnggZGlzcGxheXMgYSBkZXByZWNhdGlvbiB3YXJuaW5nIHdoZW4gbmV4dFRpY2sgaXMgdXNlZCByZWN1cnNpdmVseVxuICAgICAgLy8gc2V0SW1tZWRpYXRlIHNob3VsZCBiZSB1c2VkIGluc3RlYWQgaW5zdGVhZFxuICAgICAgdmFyIHZlcnNpb24gPSBwcm9jZXNzLnZlcnNpb25zLm5vZGUubWF0Y2goL14oPzooXFxkKylcXC4pPyg/OihcXGQrKVxcLik/KFxcKnxcXGQrKSQvKTtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHZlcnNpb24pICYmIHZlcnNpb25bMV0gPT09ICcwJyAmJiB2ZXJzaW9uWzJdID09PSAnMTAnKSB7XG4gICAgICAgIG5leHRUaWNrID0gc2V0SW1tZWRpYXRlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBuZXh0VGljayhsaWIkcnN2cCRhc2FwJCRmbHVzaCk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIHZlcnR4XG4gICAgZnVuY3Rpb24gbGliJHJzdnAkYXNhcCQkdXNlVmVydHhUaW1lcigpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgbGliJHJzdnAkYXNhcCQkdmVydHhOZXh0KGxpYiRyc3ZwJGFzYXAkJGZsdXNoKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJHJzdnAkYXNhcCQkdXNlTXV0YXRpb25PYnNlcnZlcigpIHtcbiAgICAgIHZhciBpdGVyYXRpb25zID0gMDtcbiAgICAgIHZhciBvYnNlcnZlciA9IG5ldyBsaWIkcnN2cCRhc2FwJCRCcm93c2VyTXV0YXRpb25PYnNlcnZlcihsaWIkcnN2cCRhc2FwJCRmbHVzaCk7XG4gICAgICB2YXIgbm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKTtcbiAgICAgIG9ic2VydmVyLm9ic2VydmUobm9kZSwgeyBjaGFyYWN0ZXJEYXRhOiB0cnVlIH0pO1xuXG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIG5vZGUuZGF0YSA9IChpdGVyYXRpb25zID0gKytpdGVyYXRpb25zICUgMik7XG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIHdlYiB3b3JrZXJcbiAgICBmdW5jdGlvbiBsaWIkcnN2cCRhc2FwJCR1c2VNZXNzYWdlQ2hhbm5lbCgpIHtcbiAgICAgIHZhciBjaGFubmVsID0gbmV3IE1lc3NhZ2VDaGFubmVsKCk7XG4gICAgICBjaGFubmVsLnBvcnQxLm9ubWVzc2FnZSA9IGxpYiRyc3ZwJGFzYXAkJGZsdXNoO1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY2hhbm5lbC5wb3J0Mi5wb3N0TWVzc2FnZSgwKTtcbiAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJHJzdnAkYXNhcCQkdXNlU2V0VGltZW91dCgpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgc2V0VGltZW91dChsaWIkcnN2cCRhc2FwJCRmbHVzaCwgMSk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIHZhciBsaWIkcnN2cCRhc2FwJCRxdWV1ZSA9IG5ldyBBcnJheSgxMDAwKTtcbiAgICBmdW5jdGlvbiBsaWIkcnN2cCRhc2FwJCRmbHVzaCgpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGliJHJzdnAkYXNhcCQkbGVuOyBpKz0yKSB7XG4gICAgICAgIHZhciBjYWxsYmFjayA9IGxpYiRyc3ZwJGFzYXAkJHF1ZXVlW2ldO1xuICAgICAgICB2YXIgYXJnID0gbGliJHJzdnAkYXNhcCQkcXVldWVbaSsxXTtcblxuICAgICAgICBjYWxsYmFjayhhcmcpO1xuXG4gICAgICAgIGxpYiRyc3ZwJGFzYXAkJHF1ZXVlW2ldID0gdW5kZWZpbmVkO1xuICAgICAgICBsaWIkcnN2cCRhc2FwJCRxdWV1ZVtpKzFdID0gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgICBsaWIkcnN2cCRhc2FwJCRsZW4gPSAwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJGFzYXAkJGF0dGVtcHRWZXJ0ZXgoKSB7XG4gICAgICB0cnkge1xuICAgICAgICB2YXIgciA9IHJlcXVpcmU7XG4gICAgICAgIHZhciB2ZXJ0eCA9IHIoJ3ZlcnR4Jyk7XG4gICAgICAgIGxpYiRyc3ZwJGFzYXAkJHZlcnR4TmV4dCA9IHZlcnR4LnJ1bk9uTG9vcCB8fCB2ZXJ0eC5ydW5PbkNvbnRleHQ7XG4gICAgICAgIHJldHVybiBsaWIkcnN2cCRhc2FwJCR1c2VWZXJ0eFRpbWVyKCk7XG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgcmV0dXJuIGxpYiRyc3ZwJGFzYXAkJHVzZVNldFRpbWVvdXQoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgbGliJHJzdnAkYXNhcCQkc2NoZWR1bGVGbHVzaDtcbiAgICAvLyBEZWNpZGUgd2hhdCBhc3luYyBtZXRob2QgdG8gdXNlIHRvIHRyaWdnZXJpbmcgcHJvY2Vzc2luZyBvZiBxdWV1ZWQgY2FsbGJhY2tzOlxuICAgIGlmIChsaWIkcnN2cCRhc2FwJCRpc05vZGUpIHtcbiAgICAgIGxpYiRyc3ZwJGFzYXAkJHNjaGVkdWxlRmx1c2ggPSBsaWIkcnN2cCRhc2FwJCR1c2VOZXh0VGljaygpO1xuICAgIH0gZWxzZSBpZiAobGliJHJzdnAkYXNhcCQkQnJvd3Nlck11dGF0aW9uT2JzZXJ2ZXIpIHtcbiAgICAgIGxpYiRyc3ZwJGFzYXAkJHNjaGVkdWxlRmx1c2ggPSBsaWIkcnN2cCRhc2FwJCR1c2VNdXRhdGlvbk9ic2VydmVyKCk7XG4gICAgfSBlbHNlIGlmIChsaWIkcnN2cCRhc2FwJCRpc1dvcmtlcikge1xuICAgICAgbGliJHJzdnAkYXNhcCQkc2NoZWR1bGVGbHVzaCA9IGxpYiRyc3ZwJGFzYXAkJHVzZU1lc3NhZ2VDaGFubmVsKCk7XG4gICAgfSBlbHNlIGlmIChsaWIkcnN2cCRhc2FwJCRicm93c2VyV2luZG93ID09PSB1bmRlZmluZWQgJiYgdHlwZW9mIHJlcXVpcmUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGxpYiRyc3ZwJGFzYXAkJHNjaGVkdWxlRmx1c2ggPSBsaWIkcnN2cCRhc2FwJCRhdHRlbXB0VmVydGV4KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpYiRyc3ZwJGFzYXAkJHNjaGVkdWxlRmx1c2ggPSBsaWIkcnN2cCRhc2FwJCR1c2VTZXRUaW1lb3V0KCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJGRlZmVyJCRkZWZlcihsYWJlbCkge1xuICAgICAgdmFyIGRlZmVycmVkID0ge307XG5cbiAgICAgIGRlZmVycmVkWydwcm9taXNlJ10gPSBuZXcgbGliJHJzdnAkcHJvbWlzZSQkZGVmYXVsdChmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZGVmZXJyZWRbJ3Jlc29sdmUnXSA9IHJlc29sdmU7XG4gICAgICAgIGRlZmVycmVkWydyZWplY3QnXSA9IHJlamVjdDtcbiAgICAgIH0sIGxhYmVsKTtcblxuICAgICAgcmV0dXJuIGRlZmVycmVkO1xuICAgIH1cbiAgICB2YXIgbGliJHJzdnAkZGVmZXIkJGRlZmF1bHQgPSBsaWIkcnN2cCRkZWZlciQkZGVmZXI7XG4gICAgZnVuY3Rpb24gbGliJHJzdnAkZmlsdGVyJCRmaWx0ZXIocHJvbWlzZXMsIGZpbHRlckZuLCBsYWJlbCkge1xuICAgICAgcmV0dXJuIGxpYiRyc3ZwJHByb21pc2UkJGRlZmF1bHQuYWxsKHByb21pc2VzLCBsYWJlbCkudGhlbihmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgaWYgKCFsaWIkcnN2cCR1dGlscyQkaXNGdW5jdGlvbihmaWx0ZXJGbikpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiWW91IG11c3QgcGFzcyBhIGZ1bmN0aW9uIGFzIGZpbHRlcidzIHNlY29uZCBhcmd1bWVudC5cIik7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbGVuZ3RoID0gdmFsdWVzLmxlbmd0aDtcbiAgICAgICAgdmFyIGZpbHRlcmVkID0gbmV3IEFycmF5KGxlbmd0aCk7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgIGZpbHRlcmVkW2ldID0gZmlsdGVyRm4odmFsdWVzW2ldKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBsaWIkcnN2cCRwcm9taXNlJCRkZWZhdWx0LmFsbChmaWx0ZXJlZCwgbGFiZWwpLnRoZW4oZnVuY3Rpb24oZmlsdGVyZWQpIHtcbiAgICAgICAgICB2YXIgcmVzdWx0cyA9IG5ldyBBcnJheShsZW5ndGgpO1xuICAgICAgICAgIHZhciBuZXdMZW5ndGggPSAwO1xuXG4gICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGZpbHRlcmVkW2ldKSB7XG4gICAgICAgICAgICAgIHJlc3VsdHNbbmV3TGVuZ3RoXSA9IHZhbHVlc1tpXTtcbiAgICAgICAgICAgICAgbmV3TGVuZ3RoKys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmVzdWx0cy5sZW5ndGggPSBuZXdMZW5ndGg7XG5cbiAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgdmFyIGxpYiRyc3ZwJGZpbHRlciQkZGVmYXVsdCA9IGxpYiRyc3ZwJGZpbHRlciQkZmlsdGVyO1xuXG4gICAgZnVuY3Rpb24gbGliJHJzdnAkcHJvbWlzZSRoYXNoJCRQcm9taXNlSGFzaChDb25zdHJ1Y3Rvciwgb2JqZWN0LCBsYWJlbCkge1xuICAgICAgdGhpcy5fc3VwZXJDb25zdHJ1Y3RvcihDb25zdHJ1Y3Rvciwgb2JqZWN0LCB0cnVlLCBsYWJlbCk7XG4gICAgfVxuXG4gICAgdmFyIGxpYiRyc3ZwJHByb21pc2UkaGFzaCQkZGVmYXVsdCA9IGxpYiRyc3ZwJHByb21pc2UkaGFzaCQkUHJvbWlzZUhhc2g7XG5cbiAgICBsaWIkcnN2cCRwcm9taXNlJGhhc2gkJFByb21pc2VIYXNoLnByb3RvdHlwZSA9IGxpYiRyc3ZwJHV0aWxzJCRvX2NyZWF0ZShsaWIkcnN2cCRlbnVtZXJhdG9yJCRkZWZhdWx0LnByb3RvdHlwZSk7XG4gICAgbGliJHJzdnAkcHJvbWlzZSRoYXNoJCRQcm9taXNlSGFzaC5wcm90b3R5cGUuX3N1cGVyQ29uc3RydWN0b3IgPSBsaWIkcnN2cCRlbnVtZXJhdG9yJCRkZWZhdWx0O1xuICAgIGxpYiRyc3ZwJHByb21pc2UkaGFzaCQkUHJvbWlzZUhhc2gucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLl9yZXN1bHQgPSB7fTtcbiAgICB9O1xuXG4gICAgbGliJHJzdnAkcHJvbWlzZSRoYXNoJCRQcm9taXNlSGFzaC5wcm90b3R5cGUuX3ZhbGlkYXRlSW5wdXQgPSBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgcmV0dXJuIGlucHV0ICYmIHR5cGVvZiBpbnB1dCA9PT0gJ29iamVjdCc7XG4gICAgfTtcblxuICAgIGxpYiRyc3ZwJHByb21pc2UkaGFzaCQkUHJvbWlzZUhhc2gucHJvdG90eXBlLl92YWxpZGF0aW9uRXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBuZXcgRXJyb3IoJ1Byb21pc2UuaGFzaCBtdXN0IGJlIGNhbGxlZCB3aXRoIGFuIG9iamVjdCcpO1xuICAgIH07XG5cbiAgICBsaWIkcnN2cCRwcm9taXNlJGhhc2gkJFByb21pc2VIYXNoLnByb3RvdHlwZS5fZW51bWVyYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZW51bWVyYXRvciA9IHRoaXM7XG4gICAgICB2YXIgcHJvbWlzZSAgICA9IGVudW1lcmF0b3IucHJvbWlzZTtcbiAgICAgIHZhciBpbnB1dCAgICAgID0gZW51bWVyYXRvci5faW5wdXQ7XG4gICAgICB2YXIgcmVzdWx0cyAgICA9IFtdO1xuXG4gICAgICBmb3IgKHZhciBrZXkgaW4gaW5wdXQpIHtcbiAgICAgICAgaWYgKHByb21pc2UuX3N0YXRlID09PSBsaWIkcnN2cCQkaW50ZXJuYWwkJFBFTkRJTkcgJiYgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGlucHV0LCBrZXkpKSB7XG4gICAgICAgICAgcmVzdWx0cy5wdXNoKHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiBrZXksXG4gICAgICAgICAgICBlbnRyeTogaW5wdXRba2V5XVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHZhciBsZW5ndGggPSByZXN1bHRzLmxlbmd0aDtcbiAgICAgIGVudW1lcmF0b3IuX3JlbWFpbmluZyA9IGxlbmd0aDtcbiAgICAgIHZhciByZXN1bHQ7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBwcm9taXNlLl9zdGF0ZSA9PT0gbGliJHJzdnAkJGludGVybmFsJCRQRU5ESU5HICYmIGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICByZXN1bHQgPSByZXN1bHRzW2ldO1xuICAgICAgICBlbnVtZXJhdG9yLl9lYWNoRW50cnkocmVzdWx0LmVudHJ5LCByZXN1bHQucG9zaXRpb24pO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBsaWIkcnN2cCRoYXNoJHNldHRsZWQkJEhhc2hTZXR0bGVkKENvbnN0cnVjdG9yLCBvYmplY3QsIGxhYmVsKSB7XG4gICAgICB0aGlzLl9zdXBlckNvbnN0cnVjdG9yKENvbnN0cnVjdG9yLCBvYmplY3QsIGZhbHNlLCBsYWJlbCk7XG4gICAgfVxuXG4gICAgbGliJHJzdnAkaGFzaCRzZXR0bGVkJCRIYXNoU2V0dGxlZC5wcm90b3R5cGUgPSBsaWIkcnN2cCR1dGlscyQkb19jcmVhdGUobGliJHJzdnAkcHJvbWlzZSRoYXNoJCRkZWZhdWx0LnByb3RvdHlwZSk7XG4gICAgbGliJHJzdnAkaGFzaCRzZXR0bGVkJCRIYXNoU2V0dGxlZC5wcm90b3R5cGUuX3N1cGVyQ29uc3RydWN0b3IgPSBsaWIkcnN2cCRlbnVtZXJhdG9yJCRkZWZhdWx0O1xuICAgIGxpYiRyc3ZwJGhhc2gkc2V0dGxlZCQkSGFzaFNldHRsZWQucHJvdG90eXBlLl9tYWtlUmVzdWx0ID0gbGliJHJzdnAkZW51bWVyYXRvciQkbWFrZVNldHRsZWRSZXN1bHQ7XG5cbiAgICBsaWIkcnN2cCRoYXNoJHNldHRsZWQkJEhhc2hTZXR0bGVkLnByb3RvdHlwZS5fdmFsaWRhdGlvbkVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbmV3IEVycm9yKCdoYXNoU2V0dGxlZCBtdXN0IGJlIGNhbGxlZCB3aXRoIGFuIG9iamVjdCcpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBsaWIkcnN2cCRoYXNoJHNldHRsZWQkJGhhc2hTZXR0bGVkKG9iamVjdCwgbGFiZWwpIHtcbiAgICAgIHJldHVybiBuZXcgbGliJHJzdnAkaGFzaCRzZXR0bGVkJCRIYXNoU2V0dGxlZChsaWIkcnN2cCRwcm9taXNlJCRkZWZhdWx0LCBvYmplY3QsIGxhYmVsKS5wcm9taXNlO1xuICAgIH1cbiAgICB2YXIgbGliJHJzdnAkaGFzaCRzZXR0bGVkJCRkZWZhdWx0ID0gbGliJHJzdnAkaGFzaCRzZXR0bGVkJCRoYXNoU2V0dGxlZDtcbiAgICBmdW5jdGlvbiBsaWIkcnN2cCRoYXNoJCRoYXNoKG9iamVjdCwgbGFiZWwpIHtcbiAgICAgIHJldHVybiBuZXcgbGliJHJzdnAkcHJvbWlzZSRoYXNoJCRkZWZhdWx0KGxpYiRyc3ZwJHByb21pc2UkJGRlZmF1bHQsIG9iamVjdCwgbGFiZWwpLnByb21pc2U7XG4gICAgfVxuICAgIHZhciBsaWIkcnN2cCRoYXNoJCRkZWZhdWx0ID0gbGliJHJzdnAkaGFzaCQkaGFzaDtcbiAgICBmdW5jdGlvbiBsaWIkcnN2cCRtYXAkJG1hcChwcm9taXNlcywgbWFwRm4sIGxhYmVsKSB7XG4gICAgICByZXR1cm4gbGliJHJzdnAkcHJvbWlzZSQkZGVmYXVsdC5hbGwocHJvbWlzZXMsIGxhYmVsKS50aGVuKGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICBpZiAoIWxpYiRyc3ZwJHV0aWxzJCRpc0Z1bmN0aW9uKG1hcEZuKSkge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJZb3UgbXVzdCBwYXNzIGEgZnVuY3Rpb24gYXMgbWFwJ3Mgc2Vjb25kIGFyZ3VtZW50LlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBsZW5ndGggPSB2YWx1ZXMubGVuZ3RoO1xuICAgICAgICB2YXIgcmVzdWx0cyA9IG5ldyBBcnJheShsZW5ndGgpO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICByZXN1bHRzW2ldID0gbWFwRm4odmFsdWVzW2ldKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBsaWIkcnN2cCRwcm9taXNlJCRkZWZhdWx0LmFsbChyZXN1bHRzLCBsYWJlbCk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgdmFyIGxpYiRyc3ZwJG1hcCQkZGVmYXVsdCA9IGxpYiRyc3ZwJG1hcCQkbWFwO1xuXG4gICAgZnVuY3Rpb24gbGliJHJzdnAkbm9kZSQkUmVzdWx0KCkge1xuICAgICAgdGhpcy52YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICB2YXIgbGliJHJzdnAkbm9kZSQkRVJST1IgPSBuZXcgbGliJHJzdnAkbm9kZSQkUmVzdWx0KCk7XG4gICAgdmFyIGxpYiRyc3ZwJG5vZGUkJEdFVF9USEVOX0VSUk9SID0gbmV3IGxpYiRyc3ZwJG5vZGUkJFJlc3VsdCgpO1xuXG4gICAgZnVuY3Rpb24gbGliJHJzdnAkbm9kZSQkZ2V0VGhlbihvYmopIHtcbiAgICAgIHRyeSB7XG4gICAgICAgcmV0dXJuIG9iai50aGVuO1xuICAgICAgfSBjYXRjaChlcnJvcikge1xuICAgICAgICBsaWIkcnN2cCRub2RlJCRFUlJPUi52YWx1ZT0gZXJyb3I7XG4gICAgICAgIHJldHVybiBsaWIkcnN2cCRub2RlJCRFUlJPUjtcbiAgICAgIH1cbiAgICB9XG5cblxuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJG5vZGUkJHRyeUFwcGx5KGYsIHMsIGEpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGYuYXBwbHkocywgYSk7XG4gICAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICAgIGxpYiRyc3ZwJG5vZGUkJEVSUk9SLnZhbHVlID0gZXJyb3I7XG4gICAgICAgIHJldHVybiBsaWIkcnN2cCRub2RlJCRFUlJPUjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkcnN2cCRub2RlJCRtYWtlT2JqZWN0KF8sIGFyZ3VtZW50TmFtZXMpIHtcbiAgICAgIHZhciBvYmogPSB7fTtcbiAgICAgIHZhciBuYW1lO1xuICAgICAgdmFyIGk7XG4gICAgICB2YXIgbGVuZ3RoID0gXy5sZW5ndGg7XG4gICAgICB2YXIgYXJncyA9IG5ldyBBcnJheShsZW5ndGgpO1xuXG4gICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IGxlbmd0aDsgeCsrKSB7XG4gICAgICAgIGFyZ3NbeF0gPSBfW3hdO1xuICAgICAgfVxuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgYXJndW1lbnROYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBuYW1lID0gYXJndW1lbnROYW1lc1tpXTtcbiAgICAgICAgb2JqW25hbWVdID0gYXJnc1tpICsgMV07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGliJHJzdnAkbm9kZSQkYXJyYXlSZXN1bHQoXykge1xuICAgICAgdmFyIGxlbmd0aCA9IF8ubGVuZ3RoO1xuICAgICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkobGVuZ3RoIC0gMSk7XG5cbiAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYXJnc1tpIC0gMV0gPSBfW2ldO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gYXJncztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkcnN2cCRub2RlJCR3cmFwVGhlbmFibGUodGhlbiwgcHJvbWlzZSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdGhlbjogZnVuY3Rpb24ob25GdWxGaWxsbWVudCwgb25SZWplY3Rpb24pIHtcbiAgICAgICAgICByZXR1cm4gdGhlbi5jYWxsKHByb21pc2UsIG9uRnVsRmlsbG1lbnQsIG9uUmVqZWN0aW9uKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkcnN2cCRub2RlJCRkZW5vZGVpZnkobm9kZUZ1bmMsIG9wdGlvbnMpIHtcbiAgICAgIHZhciBmbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBsID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkobCArIDEpO1xuICAgICAgICB2YXIgYXJnO1xuICAgICAgICB2YXIgcHJvbWlzZUlucHV0ID0gZmFsc2U7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyArK2kpIHtcbiAgICAgICAgICBhcmcgPSBhcmd1bWVudHNbaV07XG5cbiAgICAgICAgICBpZiAoIXByb21pc2VJbnB1dCkge1xuICAgICAgICAgICAgLy8gVE9ETzogY2xlYW4gdGhpcyB1cFxuICAgICAgICAgICAgcHJvbWlzZUlucHV0ID0gbGliJHJzdnAkbm9kZSQkbmVlZHNQcm9taXNlSW5wdXQoYXJnKTtcbiAgICAgICAgICAgIGlmIChwcm9taXNlSW5wdXQgPT09IGxpYiRyc3ZwJG5vZGUkJEdFVF9USEVOX0VSUk9SKSB7XG4gICAgICAgICAgICAgIHZhciBwID0gbmV3IGxpYiRyc3ZwJHByb21pc2UkJGRlZmF1bHQobGliJHJzdnAkJGludGVybmFsJCRub29wKTtcbiAgICAgICAgICAgICAgbGliJHJzdnAkJGludGVybmFsJCRyZWplY3QocCwgbGliJHJzdnAkbm9kZSQkR0VUX1RIRU5fRVJST1IudmFsdWUpO1xuICAgICAgICAgICAgICByZXR1cm4gcDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocHJvbWlzZUlucHV0ICYmIHByb21pc2VJbnB1dCAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICBhcmcgPSBsaWIkcnN2cCRub2RlJCR3cmFwVGhlbmFibGUocHJvbWlzZUlucHV0LCBhcmcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBhcmdzW2ldID0gYXJnO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHByb21pc2UgPSBuZXcgbGliJHJzdnAkcHJvbWlzZSQkZGVmYXVsdChsaWIkcnN2cCQkaW50ZXJuYWwkJG5vb3ApO1xuXG4gICAgICAgIGFyZ3NbbF0gPSBmdW5jdGlvbihlcnIsIHZhbCkge1xuICAgICAgICAgIGlmIChlcnIpXG4gICAgICAgICAgICBsaWIkcnN2cCQkaW50ZXJuYWwkJHJlamVjdChwcm9taXNlLCBlcnIpO1xuICAgICAgICAgIGVsc2UgaWYgKG9wdGlvbnMgPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgIGxpYiRyc3ZwJCRpbnRlcm5hbCQkcmVzb2x2ZShwcm9taXNlLCB2YWwpO1xuICAgICAgICAgIGVsc2UgaWYgKG9wdGlvbnMgPT09IHRydWUpXG4gICAgICAgICAgICBsaWIkcnN2cCQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgbGliJHJzdnAkbm9kZSQkYXJyYXlSZXN1bHQoYXJndW1lbnRzKSk7XG4gICAgICAgICAgZWxzZSBpZiAobGliJHJzdnAkdXRpbHMkJGlzQXJyYXkob3B0aW9ucykpXG4gICAgICAgICAgICBsaWIkcnN2cCQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgbGliJHJzdnAkbm9kZSQkbWFrZU9iamVjdChhcmd1bWVudHMsIG9wdGlvbnMpKTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBsaWIkcnN2cCQkaW50ZXJuYWwkJHJlc29sdmUocHJvbWlzZSwgdmFsKTtcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAocHJvbWlzZUlucHV0KSB7XG4gICAgICAgICAgcmV0dXJuIGxpYiRyc3ZwJG5vZGUkJGhhbmRsZVByb21pc2VJbnB1dChwcm9taXNlLCBhcmdzLCBub2RlRnVuYywgc2VsZik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGxpYiRyc3ZwJG5vZGUkJGhhbmRsZVZhbHVlSW5wdXQocHJvbWlzZSwgYXJncywgbm9kZUZ1bmMsIHNlbGYpO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBmbi5fX3Byb3RvX18gPSBub2RlRnVuYztcblxuICAgICAgcmV0dXJuIGZuO1xuICAgIH1cblxuICAgIHZhciBsaWIkcnN2cCRub2RlJCRkZWZhdWx0ID0gbGliJHJzdnAkbm9kZSQkZGVub2RlaWZ5O1xuXG4gICAgZnVuY3Rpb24gbGliJHJzdnAkbm9kZSQkaGFuZGxlVmFsdWVJbnB1dChwcm9taXNlLCBhcmdzLCBub2RlRnVuYywgc2VsZikge1xuICAgICAgdmFyIHJlc3VsdCA9IGxpYiRyc3ZwJG5vZGUkJHRyeUFwcGx5KG5vZGVGdW5jLCBzZWxmLCBhcmdzKTtcbiAgICAgIGlmIChyZXN1bHQgPT09IGxpYiRyc3ZwJG5vZGUkJEVSUk9SKSB7XG4gICAgICAgIGxpYiRyc3ZwJCRpbnRlcm5hbCQkcmVqZWN0KHByb21pc2UsIHJlc3VsdC52YWx1ZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkcnN2cCRub2RlJCRoYW5kbGVQcm9taXNlSW5wdXQocHJvbWlzZSwgYXJncywgbm9kZUZ1bmMsIHNlbGYpe1xuICAgICAgcmV0dXJuIGxpYiRyc3ZwJHByb21pc2UkJGRlZmF1bHQuYWxsKGFyZ3MpLnRoZW4oZnVuY3Rpb24oYXJncyl7XG4gICAgICAgIHZhciByZXN1bHQgPSBsaWIkcnN2cCRub2RlJCR0cnlBcHBseShub2RlRnVuYywgc2VsZiwgYXJncyk7XG4gICAgICAgIGlmIChyZXN1bHQgPT09IGxpYiRyc3ZwJG5vZGUkJEVSUk9SKSB7XG4gICAgICAgICAgbGliJHJzdnAkJGludGVybmFsJCRyZWplY3QocHJvbWlzZSwgcmVzdWx0LnZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJG5vZGUkJG5lZWRzUHJvbWlzZUlucHV0KGFyZykge1xuICAgICAgaWYgKGFyZyAmJiB0eXBlb2YgYXJnID09PSAnb2JqZWN0Jykge1xuICAgICAgICBpZiAoYXJnLmNvbnN0cnVjdG9yID09PSBsaWIkcnN2cCRwcm9taXNlJCRkZWZhdWx0KSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGxpYiRyc3ZwJG5vZGUkJGdldFRoZW4oYXJnKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICB2YXIgbGliJHJzdnAkcGxhdGZvcm0kJHBsYXRmb3JtO1xuXG4gICAgLyogZ2xvYmFsIHNlbGYgKi9cbiAgICBpZiAodHlwZW9mIHNlbGYgPT09ICdvYmplY3QnKSB7XG4gICAgICBsaWIkcnN2cCRwbGF0Zm9ybSQkcGxhdGZvcm0gPSBzZWxmO1xuXG4gICAgLyogZ2xvYmFsIGdsb2JhbCAqL1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGdsb2JhbCA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGxpYiRyc3ZwJHBsYXRmb3JtJCRwbGF0Zm9ybSA9IGdsb2JhbDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdubyBnbG9iYWw6IGBzZWxmYCBvciBgZ2xvYmFsYCBmb3VuZCcpO1xuICAgIH1cblxuICAgIHZhciBsaWIkcnN2cCRwbGF0Zm9ybSQkZGVmYXVsdCA9IGxpYiRyc3ZwJHBsYXRmb3JtJCRwbGF0Zm9ybTtcbiAgICBmdW5jdGlvbiBsaWIkcnN2cCRyYWNlJCRyYWNlKGFycmF5LCBsYWJlbCkge1xuICAgICAgcmV0dXJuIGxpYiRyc3ZwJHByb21pc2UkJGRlZmF1bHQucmFjZShhcnJheSwgbGFiZWwpO1xuICAgIH1cbiAgICB2YXIgbGliJHJzdnAkcmFjZSQkZGVmYXVsdCA9IGxpYiRyc3ZwJHJhY2UkJHJhY2U7XG4gICAgZnVuY3Rpb24gbGliJHJzdnAkcmVqZWN0JCRyZWplY3QocmVhc29uLCBsYWJlbCkge1xuICAgICAgcmV0dXJuIGxpYiRyc3ZwJHByb21pc2UkJGRlZmF1bHQucmVqZWN0KHJlYXNvbiwgbGFiZWwpO1xuICAgIH1cbiAgICB2YXIgbGliJHJzdnAkcmVqZWN0JCRkZWZhdWx0ID0gbGliJHJzdnAkcmVqZWN0JCRyZWplY3Q7XG4gICAgZnVuY3Rpb24gbGliJHJzdnAkcmVzb2x2ZSQkcmVzb2x2ZSh2YWx1ZSwgbGFiZWwpIHtcbiAgICAgIHJldHVybiBsaWIkcnN2cCRwcm9taXNlJCRkZWZhdWx0LnJlc29sdmUodmFsdWUsIGxhYmVsKTtcbiAgICB9XG4gICAgdmFyIGxpYiRyc3ZwJHJlc29sdmUkJGRlZmF1bHQgPSBsaWIkcnN2cCRyZXNvbHZlJCRyZXNvbHZlO1xuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJHJldGhyb3ckJHJldGhyb3cocmVhc29uKSB7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICB0aHJvdyByZWFzb247XG4gICAgICB9KTtcbiAgICAgIHRocm93IHJlYXNvbjtcbiAgICB9XG4gICAgdmFyIGxpYiRyc3ZwJHJldGhyb3ckJGRlZmF1bHQgPSBsaWIkcnN2cCRyZXRocm93JCRyZXRocm93O1xuXG4gICAgLy8gZGVmYXVsdHNcbiAgICBsaWIkcnN2cCRjb25maWckJGNvbmZpZy5hc3luYyA9IGxpYiRyc3ZwJGFzYXAkJGRlZmF1bHQ7XG4gICAgbGliJHJzdnAkY29uZmlnJCRjb25maWcuYWZ0ZXIgPSBmdW5jdGlvbihjYikge1xuICAgICAgc2V0VGltZW91dChjYiwgMCk7XG4gICAgfTtcbiAgICB2YXIgbGliJHJzdnAkJGNhc3QgPSBsaWIkcnN2cCRyZXNvbHZlJCRkZWZhdWx0O1xuICAgIGZ1bmN0aW9uIGxpYiRyc3ZwJCRhc3luYyhjYWxsYmFjaywgYXJnKSB7XG4gICAgICBsaWIkcnN2cCRjb25maWckJGNvbmZpZy5hc3luYyhjYWxsYmFjaywgYXJnKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkcnN2cCQkb24oKSB7XG4gICAgICBsaWIkcnN2cCRjb25maWckJGNvbmZpZ1snb24nXS5hcHBseShsaWIkcnN2cCRjb25maWckJGNvbmZpZywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaWIkcnN2cCQkb2ZmKCkge1xuICAgICAgbGliJHJzdnAkY29uZmlnJCRjb25maWdbJ29mZiddLmFwcGx5KGxpYiRyc3ZwJGNvbmZpZyQkY29uZmlnLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIC8vIFNldCB1cCBpbnN0cnVtZW50YXRpb24gdGhyb3VnaCBgd2luZG93Ll9fUFJPTUlTRV9JTlRSVU1FTlRBVElPTl9fYFxuICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2Ygd2luZG93WydfX1BST01JU0VfSU5TVFJVTUVOVEFUSU9OX18nXSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHZhciBsaWIkcnN2cCQkY2FsbGJhY2tzID0gd2luZG93WydfX1BST01JU0VfSU5TVFJVTUVOVEFUSU9OX18nXTtcbiAgICAgIGxpYiRyc3ZwJGNvbmZpZyQkY29uZmlndXJlKCdpbnN0cnVtZW50JywgdHJ1ZSk7XG4gICAgICBmb3IgKHZhciBsaWIkcnN2cCQkZXZlbnROYW1lIGluIGxpYiRyc3ZwJCRjYWxsYmFja3MpIHtcbiAgICAgICAgaWYgKGxpYiRyc3ZwJCRjYWxsYmFja3MuaGFzT3duUHJvcGVydHkobGliJHJzdnAkJGV2ZW50TmFtZSkpIHtcbiAgICAgICAgICBsaWIkcnN2cCQkb24obGliJHJzdnAkJGV2ZW50TmFtZSwgbGliJHJzdnAkJGNhbGxiYWNrc1tsaWIkcnN2cCQkZXZlbnROYW1lXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgbGliJHJzdnAkdW1kJCRSU1ZQID0ge1xuICAgICAgJ3JhY2UnOiBsaWIkcnN2cCRyYWNlJCRkZWZhdWx0LFxuICAgICAgJ1Byb21pc2UnOiBsaWIkcnN2cCRwcm9taXNlJCRkZWZhdWx0LFxuICAgICAgJ2FsbFNldHRsZWQnOiBsaWIkcnN2cCRhbGwkc2V0dGxlZCQkZGVmYXVsdCxcbiAgICAgICdoYXNoJzogbGliJHJzdnAkaGFzaCQkZGVmYXVsdCxcbiAgICAgICdoYXNoU2V0dGxlZCc6IGxpYiRyc3ZwJGhhc2gkc2V0dGxlZCQkZGVmYXVsdCxcbiAgICAgICdkZW5vZGVpZnknOiBsaWIkcnN2cCRub2RlJCRkZWZhdWx0LFxuICAgICAgJ29uJzogbGliJHJzdnAkJG9uLFxuICAgICAgJ29mZic6IGxpYiRyc3ZwJCRvZmYsXG4gICAgICAnbWFwJzogbGliJHJzdnAkbWFwJCRkZWZhdWx0LFxuICAgICAgJ2ZpbHRlcic6IGxpYiRyc3ZwJGZpbHRlciQkZGVmYXVsdCxcbiAgICAgICdyZXNvbHZlJzogbGliJHJzdnAkcmVzb2x2ZSQkZGVmYXVsdCxcbiAgICAgICdyZWplY3QnOiBsaWIkcnN2cCRyZWplY3QkJGRlZmF1bHQsXG4gICAgICAnYWxsJzogbGliJHJzdnAkYWxsJCRkZWZhdWx0LFxuICAgICAgJ3JldGhyb3cnOiBsaWIkcnN2cCRyZXRocm93JCRkZWZhdWx0LFxuICAgICAgJ2RlZmVyJzogbGliJHJzdnAkZGVmZXIkJGRlZmF1bHQsXG4gICAgICAnRXZlbnRUYXJnZXQnOiBsaWIkcnN2cCRldmVudHMkJGRlZmF1bHQsXG4gICAgICAnY29uZmlndXJlJzogbGliJHJzdnAkY29uZmlnJCRjb25maWd1cmUsXG4gICAgICAnYXN5bmMnOiBsaWIkcnN2cCQkYXN5bmNcbiAgICB9O1xuXG4gICAgLyogZ2xvYmFsIGRlZmluZTp0cnVlIG1vZHVsZTp0cnVlIHdpbmRvdzogdHJ1ZSAqL1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZVsnYW1kJ10pIHtcbiAgICAgIGRlZmluZShmdW5jdGlvbigpIHsgcmV0dXJuIGxpYiRyc3ZwJHVtZCQkUlNWUDsgfSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGVbJ2V4cG9ydHMnXSkge1xuICAgICAgbW9kdWxlWydleHBvcnRzJ10gPSBsaWIkcnN2cCR1bWQkJFJTVlA7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbGliJHJzdnAkcGxhdGZvcm0kJGRlZmF1bHQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBsaWIkcnN2cCRwbGF0Zm9ybSQkZGVmYXVsdFsnUlNWUCddID0gbGliJHJzdnAkdW1kJCRSU1ZQO1xuICAgIH1cbn0pLmNhbGwodGhpcyk7XG5cbiJdfQ==

//# sourceMappingURL=algorithm_visualizer.js.map