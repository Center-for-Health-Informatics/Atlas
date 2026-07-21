import $ from 'jquery'
import { isFinite } from 'utils/NativeCompat'
import ko from 'knockout'
import view from './concept-by-index.html?raw'
import * as d3 from 'd3'
import jnjChart from 'jnj_chart'
import { nestEntries } from 'utils/D3NestCompat'

function conceptByIndex (params) {
  const self = this
  self.conceptId = params.conceptId
  self.cohortDefinitionId = params.cohortDefinitionId
  self.caption = params.caption
  self.conceptDomain = params.conceptDomain.toLowerCase()
  self.resultsUrl = params.resultsUrl

  self.dataframeToArray = function (dataframe) {
    // dataframes from R serialize into an obect where each column is an array of values.
    const keys = Object.keys(dataframe)
    let result
    if (dataframe[keys[0]] instanceof Array) {
      result = dataframe[keys[0]].map(function (d, i) {
        const item = {}
        const container = this
        keys.forEach(function (p) {
          item[p] = container[p][i]
        })
        return item
      }, dataframe)
    } else {
      result = [dataframe]
    }
    return result
  }

  self.normalizeArray = function (ary, numerify) {
    const obj = {}
    let keys

    if (ary && ary.length > 0 && ary instanceof Array) {
      keys = Object.keys(ary[0])

      $.each(keys, function () {
        obj[this] = []
      })

      $.each(ary, function () {
        const thisAryObj = this
        $.each(keys, function () {
          let val = thisAryObj[this]
          if (numerify) {
            if (isFinite(+val)) {
              val = (+val)
            }
          }
          obj[this].push(val)
        })
      })
    } else {
      obj.empty = true
    }

    return obj
  }

  self.render = function () {
    $('#concept-by-index-caption').html(self.caption)

    $.ajax({
      type: 'GET',
      url: self.resultsUrl + self.cohortDefinitionId + '/cohortspecific' + self.conceptDomain + '/' + self.conceptId,
      contentType: 'application/json; charset=utf-8',
      success: function (result) {
        if (result && result.length > 0) {
          const normalized = self.dataframeToArray(self.normalizeArray(result))

          // nest dataframe data into key->values pair
          const totalRecordsData = nestEntries(normalized, [(d) => d.recordType])
            .map(function (d) {
              return {
                name: d.key,
                values: d.values
              }
            })

          // eslint-disable-next-line new-cap -- jnj_chart library exposes a lowercase constructor
          const scatter = new jnjChart.scatterplot()

          scatter.render(totalRecordsData, '#concept-by-index-scatterplot', 460, 150, {
            yFormat: d3.format('0.2%'),
            xValue: 'duration',
            yValue: 'pctPersons',
            xLabel: 'Duration Relative to Index',
            yLabel: '% Persons',
            seriesName: 'recordType',
            showLegend: true,
            tooltips: [
              {
                label: 'Series',
                accessor: function (o) {
                  return o.recordType
                }
              },
              {
                label: 'Percent Persons',
                accessor: function (o) {
                  return d3.format('0.2%')(o.pctPersons)
                }
              },
              {
                label: 'Duration Relative to Index',
                accessor: function (o) {
                  const years = Math.round(o.duration / 365)
                  const days = o.duration % 365
                  let result = ''
                  if (years !== 0) { result += years + 'y ' }

                  result += days + 'd'
                  return result
                }
              },
              {
                label: 'Person Count',
                accessor: function (o) {
                  return o.countValue
                }
              }
            ]
          })
        }
      }
    })
  }
  self.render()
}

const component = {
  viewModel: conceptByIndex,
  template: view
}

ko.components.register('visualizations/concept-by-index', component)
export default component
