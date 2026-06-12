define(['jquery', 'knockout', 'atlascharts'], function ($, ko, atlascharts) {
  ko.bindingHandlers.d3ChartBinding = {
    init: function (element, valueAccessor) {
      const va = ko.utils.unwrapObservable(valueAccessor())
      const chartType = ko.utils.unwrapObservable(va.chartType)
      const chartOptions = ko.utils.unwrapObservable(va.chartOptions) || {}
      const jqEventSpace = ko.utils.unwrapObservable(va.jqEventSpace) || {}
      const chart = new atlascharts[chartType](chartOptions, jqEventSpace)
      if (va.chartObj) {
        va.chartObj(chart)
      }
      return { controlsDescendantBindings: true }
    },
    update: function (element, valueAccessor, allBindings) {
      const va = ko.utils.unwrapObservable(valueAccessor())
      va.domElement(element)
      const chartData = ko.utils.unwrapObservable(va.chartData) || []
      const chartResolution = ko.utils.unwrapObservable(va.chartResolution) || { width: 460, height: 150 }
      const chartType = ko.utils.unwrapObservable(va.chartType)

      /* charts should not be assumed to be knockout aware
			 * (most jnj.charts are not), but they need ways to
			 * respond to external events and to trigger external
			 * events. charts should be usable without this binding,
			 * but this binding should allow charts to also be
			 * usable in a natural way from a knockout context.
			 *
			 * actually, the work order only requests that the
			 * chart accept a knockout observable for data
			 */

      if (va.chartObj) {
        // va.chartObj(chart);
      } else {
        // chart.render(chartData, element, chartResolution.width, chartResolution.height, chartOptions);
      }
    }
  }
})
