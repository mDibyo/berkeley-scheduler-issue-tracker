var Time = require('../models/time');
var BaseCtrl = require('./_base.controller');

function sbGenerateSchedulesDirective() {

  sbGenerateSchedulesCtrl.prototype = Object.create(BaseCtrl.prototype);
  function sbGenerateSchedulesCtrl($state, $window, scheduleFactory) {
    BaseCtrl.call(this, $state, $window);

    var vm = this;

    var hours = [];
    var halfHours = [];
    var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    var startHour = 8;
    var endHour = 24;
    //var numHours = endHour - startHour;
    for (var h = startHour; h < endHour; h++) {
      hours.push(new Time(h, 0));
      halfHours.push(new Time(h, 0));
      halfHours.push(new Time(h, 30));
    }
    hours.push(new Time(h, 0));
    halfHours.push(new Time(h, 0));

    var schedulingOptions = scheduleFactory.getSchedulingOptions();

    vm.scheduleIsStale = scheduleFactory.isStale();
    vm.showSavedSchedules = schedulingOptions.showSavedSchedules;
    vm.showOptions = schedulingOptions.showOptions;
    vm.toggleSavedSchedules = toggleSavedSchedules;
    vm.toggleOptions = toggleOptions;
    vm.viewSchedules = viewSchedules;
    vm.generateAndViewSchedules = generateAndViewSchedules;

    vm.gapOptions = {
      minimize: 'minimizeGaps',
      maximize: 'maximizeGaps',
      none: 'dontWorryAboutGaps'
    };
    if (schedulingOptions.minimizeGaps) {
      vm.gapOption = vm.gapOptions.minimize;
    } else if (schedulingOptions.maximizeGaps) {
      vm.gapOption = vm.gapOptions.maximize;
    } else {
      vm.gapOption = vm.gapOptions.none;
    }
    vm.onChangeGapOption = onChangeGapOption;

    vm.partsOfDay = {
      morning: 'preferMorning',
      afternoon: 'preferAfternoon',
      evening: 'preferEvening',
      none: 'preferNone'
    };
    if (schedulingOptions.preferMornings) {
      vm.preferPartOfDay = vm.partsOfDay.morning;
    } else if (schedulingOptions.preferAfternoons) {
      vm.preferPartOfDay = vm.partsOfDay.afternoon;
    } else if (schedulingOptions.preferEvenings) {
      vm.preferPartOfDay = vm.partsOfDay.evening;
    } else {
      vm.preferPartOfDay = vm.partsOfDay.none;
    }
    vm.onChangePreferPartOfDay = onChangePreferPartOfDay;

    vm.selectedDayStartTimeJson =
      schedulingOptions.dayStartTime || halfHours[0];
    vm.selectedDayEndTimeJson =
      schedulingOptions.dayEndTime || halfHours[halfHours.length-1];
    vm.dayStartTimes = halfHours;
    vm.dayEndTimes = halfHours;
    vm.onSelectDayStartTime = onSelectDayStartTime;
    vm.onSelectDayEndTime = onSelectDayEndTime;
    vm.isSelectedDayStartTime = isSelectedDayStartTime;
    vm.isSelectedDayEndTime = isSelectedDayEndTime;

    vm.noTimeConflicts = schedulingOptions.noTimeConflicts;
    vm.onChangeNoTimeConflicts = onChangeNoTimeConflicts;

    vm.preferNoTimeConflicts = schedulingOptions.preferNoTimeConflicts;
    vm.disablePreferNoTimeConflicts = vm.noTimeConflicts;
    vm.onChangePreferNoTimeConflicts = onChangePreferNoTimeConflicts;

    vm.savedScheduleIds = scheduleFactory.getSavedScheduleIds();
    vm.dropSavedScheduleById = function($event, scheduleId) {
      $event.stopPropagation();
      scheduleFactory.dropSavedScheduleById(scheduleId);
    };

    scheduleFactory.registerSetStaleListener(function(isStale) {
      vm.scheduleIsStale = isStale;
      if (isStale && $state.includes('schedule.viewSchedule')) {
        vm.generateAndViewSchedules();
      }
    });

    scheduleFactory.registerAddSavedScheduleIdListener(function(scheduleId) {
      vm.savedScheduleIds.push(scheduleId);
    });

    scheduleFactory.registerDropSavedScheduleIdListener(function(scheduleId) {
      vm.savedScheduleIds.remove(scheduleId);
    });

    function viewSchedules() {
      var currScheduleId = scheduleFactory.getCurrScheduleId();
      if (currScheduleId === undefined) {
        generateAndViewSchedules();
      }
      vm.goToState('schedule.viewSchedule', {
        scheduleId: currScheduleId
      });
    }

    function generateAndViewSchedules() {
      vm.goToState('schedule.generatingSchedules', {
        scheduleGroupId: scheduleFactory.getCurrentScheduleGroupId()
      });
    }

    function toggleSavedSchedules(showSavedSchedules) {
      if (showSavedSchedules) {
        toggleOptions(false);
      }
      vm.showSavedSchedules = showSavedSchedules;
      scheduleFactory.setSchedulingOption('showSavedSchedules', vm.showSavedSchedules);
    }

    function toggleOptions(showOptions) {
      if (showOptions) {
        toggleSavedSchedules(false);
      }
      vm.showOptions = showOptions;
      scheduleFactory.setSchedulingOption('showOptions', vm.showOptions);
    }

    function onChangeGapOption() {
      switch (vm.gapOption) {
        case vm.gapOptions.minimize:
          scheduleFactory.setSchedulingOption('minimizeGaps', true);
          scheduleFactory.setSchedulingOption('maximizeGaps', false);
          break;
        case vm.gapOptions.maximize:
          scheduleFactory.setSchedulingOption('minimizeGaps', false);
          scheduleFactory.setSchedulingOption('maximizeGaps', true);
          break;
        case vm.gapOptions.none:
          scheduleFactory.setSchedulingOption('minimizeGaps', false);
          scheduleFactory.setSchedulingOption('maximizeGaps', false);
          break;
      }
      if (vm.gapOption != null) {
        vm.preferPartOfDay = vm.partsOfDay.none;
        scheduleFactory.setSchedulingOption('preferMornings', false);
        scheduleFactory.setSchedulingOption('preferAfternoons', false);
        scheduleFactory.setSchedulingOption('preferEvenings', false);
      }
      scheduleFactory.filterAndReorderSchedules();
    }

    function onChangePreferPartOfDay() {
      switch (vm.preferPartOfDay) {
        case vm.partsOfDay.morning:
          scheduleFactory.setSchedulingOption('preferMornings', true);
          scheduleFactory.setSchedulingOption('preferAfternoons', false);
          scheduleFactory.setSchedulingOption('preferEvenings', false);
          break;
        case vm.partsOfDay.afternoon:
          scheduleFactory.setSchedulingOption('preferMornings', false);
          scheduleFactory.setSchedulingOption('preferAfternoons', true);
          scheduleFactory.setSchedulingOption('preferEvenings', false);
          break;
        case vm.partsOfDay.evening:
          scheduleFactory.setSchedulingOption('preferMornings', false);
          scheduleFactory.setSchedulingOption('preferAfternoons', false);
          scheduleFactory.setSchedulingOption('preferEvenings', true);
          break;
        case vm.partsOfDay.none:
          scheduleFactory.setSchedulingOption('preferMornings', false);
          scheduleFactory.setSchedulingOption('preferAfternoons', false);
          scheduleFactory.setSchedulingOption('preferEvenings', false);
          break;
      }
      if (vm.preferPartOfDay != vm.partsOfDay.none) {
        vm.gapOption = vm.gapOptions.none;
        scheduleFactory.setSchedulingOption('minimizeGaps', false);
        scheduleFactory.setSchedulingOption('maximizeGaps', false);
      }
      scheduleFactory.filterAndReorderSchedules();
    }

    function onChangeNoTimeConflicts() {
      vm.disablePreferNoTimeConflicts = vm.noTimeConflicts;
      scheduleFactory.setSchedulingOption('noTimeConflicts', vm.noTimeConflicts);
      scheduleFactory.filterAndReorderSchedules();
    }

    function onChangePreferNoTimeConflicts() {
      schedulingOptions.setSchedulingOption('preferNoTimeConflicts', vm.preferNoTimeConflicts);
      scheduleFactory.filterAndReorderSchedules();
    }

    function onSelectDayStartTime() {
      var times = halfHours.slice();
      var selectedDayStartTime = Time.parse(vm.selectedDayStartTimeJson);
      while (times.length > 0 && times[0].compareTo(selectedDayStartTime) < 0) {
        times.shift()
      }
      vm.dayEndTimes = times;

      scheduleFactory.setSchedulingOption('dayStartTime', selectedDayStartTime);
      scheduleFactory.filterAndReorderSchedules();
    }

    function onSelectDayEndTime() {
      var times = halfHours.slice();
      var selectedDayEndTime = Time.parse(vm.selectedDayEndTimeJson);
      while (times.length > 0 && times[times.length-1].compareTo(selectedDayEndTime) > 0) {
        times.pop()
      }
      vm.dayStartTimes = times;

      scheduleFactory.setSchedulingOption('dayEndTime', selectedDayEndTime);
      scheduleFactory.filterAndReorderSchedules();
    }

    function isSelectedDayStartTime(time) {
      var selectedDayStartTimeJson = Time.parse(vm.selectedDayStartTimeJson);
      return time.hours === selectedDayStartTimeJson.hours
        && time.minutes === selectedDayStartTimeJson.minutes;
    }

    function isSelectedDayEndTime(time) {
      var selectedDayEndTimeJson = Time.parse(vm.selectedDayEndTimeJson);
      return time.hours === selectedDayEndTimeJson.hours
        && time.minutes === selectedDayEndTimeJson.minutes;
    }
  }

  return {
    controller: [
      '$state',
      '$window',
      'scheduleFactory',
      sbGenerateSchedulesCtrl
    ],
    controllerAs: 'dvm',
    templateUrl: 'html/generate_schedules.partial.html'
  }
}
angular.module('scheduleBuilder').directive('sbGenerateSchedules', [
  sbGenerateSchedulesDirective
]);
