import Chart from 'components/Chart'
import atlascharts from 'atlascharts'
import * as d3 from 'd3'
import view from 'components/charts/chart.html?raw'
import commonUtils from 'utils/CommonUtils'
import ChartUtils from 'utils/ChartUtils'
import { nestEntries } from 'utils/D3NestCompat'

class Trellisline extends Chart {
  constructor (params, element) {
    super(params, element)
    // eslint-disable-next-line new-cap
    this.renderer = new atlascharts.trellisline()
  }

  prepareData (rawData) {
    const trellisData = ChartUtils.normalizeArray(rawData)
    if (!trellisData.empty) {
      const minYear = d3.min(trellisData.xCalendarYear)
      const maxYear = d3.max(trellisData.xCalendarYear)

      const seriesInitializer = function (tName, sName, x, y) {
        return {
          trellisName: tName,
          seriesName: sName,
          xCalendarYear: x,
          yPrevalence1000Pp: y
        }
      }

      const nestByDecile = (data) => nestEntries(data, [(d) => d.trellisName, (d) => d.seriesName], (a, b) => a.xCalendarYear - b.xCalendarYear)

      // map data into chartable form
      const normalizedSeries = trellisData.trellisName.map(function (d, i) {
        const item = {}
        const container = this
        Object.keys(container).forEach(function (p) {
          item[p] = container[p][i]
        })
        return item
      }, trellisData)

      const dataByDecile = nestByDecile(normalizedSeries)
      // fill in gaps
      const yearRange = d3.range(minYear, maxYear, 1)
      let yearData = {}

      dataByDecile.forEach(function (trellis) {
        trellis.values.forEach(function (series) {
          series.values = yearRange.map(function (year) {
            yearData = series.values.filter(function (f) {
              return f.xCalendarYear === year
            })[0] || seriesInitializer(trellis.key, series.key, year, 0)
            yearData.date = new Date(year, 0, 1)
            return yearData
          })
        })
      })

      return dataByDecile
    }
    return null
  }
}

export default commonUtils.build('trellisline', Trellisline, view)
