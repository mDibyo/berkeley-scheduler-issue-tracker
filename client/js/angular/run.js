var constants = require('../constants');

var SHARE_THRESHOLD = 5 * 60; // seconds

angular.module('berkeleyScheduler').run([
  '$window',
  '$state',
  '$rootScope',
  '$transitions',
  '$mdDialog',
  '$mdMedia',
  '$templateRequest',
  'userService',
  'timeSpentService',
  function(
      $window,
      $state,
      $rootScope,
      $transitions,
      $mdDialog,
      $mdMedia,
      $templateRequest,
      userService,
      timeSpentService
  ) {
    $rootScope.$state = $state;

    $transitions.onBefore({to: 'schedule.**'}, function(transition) {
      return transition.injector().getAsync('termAbbrev').then(function(termAbbrev) {
        if (Object.keys(constants.terms).indexOf(termAbbrev) >= 0) {
          return true;
        }

        return $state.target('schedule', {
          termAbbrev: constants.DEFAULT_TERM_ABBREV
        })
      });
    });

    var bodyHeight = null;
    var leftPane = null;
    var leftPaneHeight = null;
    var rightPane = null;

    function getHeight(element) {
      return Math.max(element.offsetHeight, element.clientHeight);
    }

    function setRightPaneHeight() {
      if (leftPane && rightPane) {
        bodyHeight = getHeight(document.body);
        leftPaneHeight = getHeight(leftPane);
        if (leftPaneHeight > bodyHeight) {
          rightPane.style['min-height'] = leftPaneHeight;
        } else {
          rightPane.style['min-height'] = null;
        }
      }
    }

    $rootScope.$on('$viewContentLoaded', function() {
      leftPane = leftPane || document.getElementById('left-pane');
      rightPane = rightPane || document.getElementById('right-pane');
      setRightPaneHeight();
    });
    $window.addEventListener('resize', setRightPaneHeight);

    var showMobUnoptDialog = userService.preferences.showMobUnoptDialog;
    if (showMobUnoptDialog && $mdMedia('xs')) {
      $mdDialog.show({
        templateUrl: 'assets/static/html/mobile_unoptimized.dialog.html',
        controller: 'MobileUnoptimizedDialogCtrl',
        controllerAs: 'vm',
        parent: angular.element(document.body),
        clickOutsideToClose: true
      });
    }

    // Pre-fetch SVG assets
    $templateRequest('assets/gen/sprite.defs.svg');

    function getNextShareThreshold(currentTimeSpent) {
      var shareThresholds = constants.shareThresholds;
      for (var i = 0; i < shareThresholds.length; i++) {
        if (shareThresholds[i] > currentTimeSpent) {
          return shareThresholds[i];
        }
      }
      return Infinity;
    }

    if (!$mdMedia('xs')) {
      var startTimeSpent = timeSpentService.current;
      var nextShareThreshold = getNextShareThreshold(startTimeSpent);

      timeSpentService.initialize();
      timeSpentService.addUpdateTimeSpentListener('run', function(timeSpent) {
        if (userService.preferences.showShareDialog && timeSpent > nextShareThreshold) {
          nextShareThreshold = getNextShareThreshold(timeSpent);

          $mdDialog.show({
            templateUrl: 'assets/static/html/share.dialog.html',
            controller: 'ShareDialogCtrl',
            controllerAs: 'vm',
            parent: angular.element(document.body),
            clickOutsideToClose: true
          });
        }
      });
    }
  }
]);
