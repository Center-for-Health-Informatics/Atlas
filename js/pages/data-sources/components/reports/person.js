import ko from 'knockout'
import view from './person.html?raw'
import * as d3 from 'd3'
import atlascharts from 'atlascharts'
import commonUtils from 'utils/CommonUtils'
import ChartUtils from 'utils/ChartUtils'
import Report from 'components/reports/classes/Report'
import Component from 'components/Component'
import 'components/heading'
import 'components/charts/histogram'
import 'components/charts/donut'
import './person.less'

class Person extends Report {
  constructor (params) {
    super(params)
    this.name = 'Person'
    this.yearHistogramData = ko.observable()
    this.genderData = ko.observable()
    this.raceData = ko.observable()
    this.ethnicityData = ko.observable()
    this.chartFormats = {
      yearHistogram: {
        xFormat: d3.format('d'),
        yFormat: d3.format(',.1s'),
        xLabel: ko.i18n('dataSources.personReport.year', 'Year'),
        yLabel: ko.i18n('dataSources.personReport.numberOfPersons', '# of Persons'),
        xValue: 'x',
        yValue: 'y',
        getTooltipBuilder: options => d => {
          const format = d3.format('')
          return `
					${options.xLabel}: ${options.xFormat(d[options.xValue])}<br/>
					${options.yLabel}: ${d3.format(',')(d[options.yValue])}
				`
        },
      },
    }

    this.loadData()
  }

  parseData ({ data }) {
    if (data.yearOfBirth.length > 0 && data.yearOfBirthStats.length > 0) {
      const histData = {}
      histData.INTERVAL_SIZE = 1
      histData.OFFSET = data.yearOfBirthStats[0].minValue
      const mappedHistData = data.yearOfBirth.map(each => ({ INTERVAL_INDEX: each.intervalIndex, COUNT_VALUE: each.countValue }))
      histData.DATA = ChartUtils.normalizeArray(mappedHistData)
      histData.INTERVALS = data.yearOfBirth.length
      this.yearHistogramData(atlascharts.histogram.mapHistogram(histData))
    }

    this.genderData(ChartUtils.mapConceptData(data.gender))
    this.raceData(ChartUtils.mapConceptData(data.race))
    this.ethnicityData(ChartUtils.mapConceptData(data.ethnicity))
  }
}

export default commonUtils.build('report-person', Person, view)

