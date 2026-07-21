import $ from 'jquery'
import ko from 'knockout'
import view from './report-manager.html?raw'
import sharedState from 'atlas-state'
import * as d3 from 'd3'
import atlascharts from 'atlascharts'
import colorbrewer from 'colorbrewer'
import config from 'appConfig'
import cohortReportingService from 'services/CohortReporting'
import costUtilConst from 'pages/cohort-definitions/const'
import Component from 'components/Component'
import commonUtils from 'utils/CommonUtils'
import ChartUtils from 'utils/ChartUtils'
import { nestEntries } from 'utils/D3NestCompat'
import 'databindings'
import 'faceted-datatable'
import 'colvis'
import './persons-exposure'
import './visit-util'
import './drug-util'
import './report-manager.less'

class ReportManager extends Component {
  constructor (params) {
    super(params)
    this.config = config
    this.refresh = ko.observable(true)
    this.cohortCaption = ko.observable(
      ko.unwrap(ko.i18n('cohortDefinitions.costUtilization.reportManager.reportManagerText_71', 'Click Here to Choose a Cohort')))
    this.showSelectionArea = params.showSelectionArea === undefined ? true : params.showSelectionArea
    this.reference = ko.observableArray()
    this.dataCompleteReference = ko.observableArray()
    this.dom = '<<"row vertical-align"<"col-xs-6"<"dt-btn"B>l><"col-xs-6 search"f>><"row vertical-align"<"col-xs-3"i><"col-xs-9"p>><t><"row vertical-align"<"col-xs-3"i><"col-xs-9"p>>>'
    this.tableOptions = params.tableOptions || commonUtils.getTableOptions('M')
    this.visualizationPacks = cohortReportingService.visualizationPacks
    this.costUtilConst = costUtilConst
    this.activeReportDrilldown = ko.observable(false)
    this._loadingReportDrilldown = ko.observable(false)
    this.reportSourceKey = params.reportSourceKey
    this.reportReportName = params.reportReportName
    this.currentReport = ko.observable()

    // Setting 'ko.options.deferUpdates = true' in PR #2084 breaks rendering of reports and charts
    // we need explicitly call for 'ko.tasks.runEarly' method
    // TODO: Needs to be refactored in 2.8.1
    this.loadingReport = ko.pureComputed({
      read: () => params.loadingReport(),
      write: isLoading => {
        params.loadingReport(isLoading)
        ko.tasks.runEarly()
      }
    })
    this.loadingReportDrilldown = ko.pureComputed({
      read: () => this._loadingReportDrilldown(),
      write: isLoading => {
        this._loadingReportDrilldown(isLoading)
        ko.tasks.runEarly()
      }
    })

    this.reportTriggerRun = params.reportTriggerRun
    this.reportCohortDefinitionId = params.reportCohortDefinitionId
    this.reportValid = ko.computed(() => {
      return (
        this.reportReportName() !== undefined &&
      this.reportSourceKey() !== undefined &&
      this.reportCohortDefinitionId() !== undefined &&
      !this.loadingReport() &&
      !this.loadingReportDrilldown()
      )
    })
    const size4 = {
      width: 400,
      height: 140
    }
    const size6 = {
      width: 500,
      height: 150
    }
    const size12 = {
      width: 1000,
      height: 250
    }

    this.breakpoints = {
      wide: {
        width: 1000,
        height: 1000 * 0.3,
      },
      medium: {
        width: 500,
        height: 500 * 0.75,
      },
      narrow: {
        width: 300,
        height: 300 * 0.75,
      },
      guessFromNode: (selector) => {
        const bounds = document.querySelector(selector).getBoundingClientRect()

        return {
          width: bounds.width,
          height: bounds.height,
        }
      },
    }

    this.chartOptions = {
      margins: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20,
      },
    }

    this.buttons = ['colvis', 'copyHtml5', 'excelHtml5', 'csvHtml5', 'pdfHtml5']
    this.heelOptions = {
      Facets: [{
        caption: ko.i18n('facets.caption.errorMsg', 'Error Msg'),
        binding: d => {
          if (d.attributeName < 10) {
            return 'Person'
          } else if ((d.attributeName >= 100 && d.attributeName < 200) || (d.attributeName >= 800 && d.attributeName < 900)) {
            return 'Observation'
          } else if (d.attributeName >= 200 && d.attributeName < 300) {
            return 'Visits'
          } else if (d.attributeName >= 400 && d.attributeName < 500) {
            return 'Condition'
          } else if (d.attributeName >= 500 && d.attributeName < 600) {
            return 'Death'
          } else if (d.attributeName >= 600 && d.attributeName < 700) {
            return 'Procedure'
          } else if (d.attributeName >= 700 && d.attributeName < 800) {
            return 'Drug'
          } else if (d.attributeName >= 900 && d.attributeName < 1000) {
            return 'Drug Era'
          } else if (d.attributeName >= 1000 && d.attributeName < 1100) {
            return 'Condition Era'
          } else if (d.attributeName >= 1100 && d.attributeName < 1200) {
            return 'Location'
          } else if (d.attributeName >= 1200 && d.attributeName < 1300) {
            return 'Care Site'
          } else if (d.attributeName >= 1700 && d.attributeName < 1800) {
            return 'Cohort'
          } else if (d.attributeName >= 1800 && d.attributeName < 1900) {
            return 'Cohort Specific'
          } else if (d.attributeName >= 1300 && d.attributeName < 1400) {
            return 'Measurement'
          } else {
            return 'Other'
          }
        }
      }]
    }

    this.helpTitle = ko.observable()
    this.helpContent = ko.observable()
    this.helpModalOpened = ko.observable(false)

    this.setHelpContent = (h) => {
      this.helpModalOpened(true)
      if (typeof h === 'string') {
        switch (h) {
          case 'condition-prevalence':
          {
            this.helpTitle('Condition Prevalence')
            this.helpContent('not available')
            break
          }
          case 'year-of-birth':
          {
            this.helpTitle('Year of Birth')
            this.helpContent('The number of people in this cohort shown with respect to their year of birth.')
            break
          }
          default:
          {
            this.helpTitle('Help Unavailable')
            this.helpContent('Help not yet available for this topic: ' + h)
          }
        }
      } else if (typeof h === 'object' && (h.helpTitle || h.name) && h.helpContent) {
        this.helpTitle(h.helpTitle || h.name)
        this.helpContent(h.helpContent)
      }
    }
    this.heelDataColumns = [{
      title: 'Message Type',
      data: 'attributeName',
      width: '10%'
    }, {
      title: 'Message',
      data: 'attributeValue'
    }]

    this.dataCompleteOptions = {
      Facets: [{
        caption: 'Filter',
        binding: d => {
          return ''
        }
      }]
    }

    this.dataCompletColumns = [{
      title: 'Age',
      data: 'covariance'
    }, {
      title: 'Gender (%)',
      data: row => row.genderP < 0 ? '-' : row.genderP
    }, {
      title: 'Race (%)',
      data: row => row.raceP < 0 ? '-' : row.raceP
    }, {
      title: 'Ethnicity (%)',
      data: row => row.ethP < 0 ? '-' : row.ethP
    }]

    this.currentAgeGroup = ko.observable()

    this.reportCohortDefinitionId.subscribe((d) => {
      if (this.showSelectionArea) {
        this.cohortCaption(sharedState.cohortDefinitions()
          .filter(function (value) {
            return value.id === d
          })[0].name)
        $('#cohortDefinitionChooser')
          .modal('hide')
      }
    })

    this.formatPercent = d3.format('.2%')
    this.formatFixed = d3.format('.2f')
    this.formatComma = d3.format(',')

    this.treemapGradient = ['#c7eaff', '#6E92A8', '#1F425A']
    this.boxplotWidth = 200
    this.boxplotHeight = 125
    this.genderIcon = function (d) {
      if (d.genderConceptId === 8507) {
        return 'fa-male'
      }

      if (d.genderConceptId === 8532) {
        return 'fa-female'
      }
    }

    this.showBrowser = function () {
      $('#cohortDefinitionChooser')
        .modal('show')
    }

    this.datatables = {}

    this.tornadoChart = function (target, data, profiles, profilesSelected) {
      data.sort((a, b) => {
        return b.ageGroup - a.ageGroup
      })
      data.forEach(d => {
        if (d.genderConceptId === 8532) {
          d.personCount = d.personCount * -1
        }
      })

      const margin = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 60
      }
      const width = 600 - margin.left - margin.right
      const height = 300 - margin.top - margin.bottom

      const x = d3.scaleLinear()
        .range([0, width])

      const y = d3.scaleLinear()
        .range([0, height])

      const formatSI = d3.format('.2s')
      const xAxis = d3.axisBottom()
        .scale(x)
        .ticks(7)
        .tickFormat(d => {
          return formatSI(Math.abs(d))
        })

      const yAxis = d3.axisLeft()
        .scale(y)
        .tickSize(0)
        .tickValues([5, 15, 25, 35, 45, 55, 65, 75, 85, 95, 105])
        .tickFormat(d => {
          d = d - 5
          if (d === 100) { return '100+' }

          return d + '-' + (d + 9)
        })

      const svg = d3.select(target)
        .attr('viewBox', '0 0 ' + (width + margin.left + margin.right) + ' ' + (height + margin.top + margin.bottom))
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

      const xExtent = d3.extent(data, d => {
        return d.personCount
      })
      const xMax = Math.max(Math.abs(xExtent[0]), Math.abs(xExtent[1]))
      x.domain([-1 * xMax, xMax])
      y.domain([100, 0])

      const bar = svg.selectAll('.bar')
        .data(data)

      bar.enter().append('rect')
        .attr('class', function (d) {
          return 'bar bar--' + (d.personCount < 0 ? 'negative' : 'positive')
        })
        .attr('x', function (d) {
          const minWidth = 5
          let correction = 0
          const xPos = x(Math.min(0, d.personCount))
          if (d.personCount < 0 && (xPos - x(0)) > -5) {
            correction = minWidth
          }
          return xPos - correction
        })
        .attr('y', function (d) {
          return y(d.ageGroup) - (height / 11)
        })
        .attr('width', function (d) {
          return Math.max(Math.abs(x(d.personCount) - x(0)), 5)
        })
        .attr('height', height / 11)
        .on('click', d => {
          const filteredProfiles = profiles.filter(s => {
            return s.genderConceptId === d.genderConceptId && s.ageGroup === d.ageGroup
          })
          profilesSelected(filteredProfiles)
        })

      bar.enter().append('text')
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .style('stroke-width', 2)
        .style('stroke', '#fff')
        .attr('x', function (d, i) {
          const xPos = x(Math.min(0, d.personCount)) + (Math.abs(x(d.personCount) - x(0)) / 2)
          let correction = 0
          if ((Math.abs(x(d.personCount) - x(0))) <= 100) {
            correction = Math.abs(d.personCount) / d.personCount * 10
          }
          return xPos + correction
        })
        .attr('y', function (d, i) {
          return y(d.ageGroup - 5) - (height / 11)
        })
        .text(function (d) {
          return Math.abs(d.personCount)
        })

      bar.enter().append('text')
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .style('stroke-width', 1)
        .style('stroke', '#000')
        .attr('x', function (d, i) {
          const xPos = x(Math.min(0, d.personCount)) + (Math.abs(x(d.personCount) - x(0)) / 2)
          let correction = 0
          if ((Math.abs(x(d.personCount) - x(0))) <= 100) {
            correction = Math.abs(d.personCount) / d.personCount * 10
          }
          return xPos + correction
        })
        .attr('y', function (d, i) {
          return y(d.ageGroup - 5) - (height / 11)
        })
        .text(function (d) {
          return Math.abs(d.personCount)
        })

      svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis)

      svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis)
    }
    this.tornadoProfiles = ko.observableArray()
    this.profilesSelected = (profiles) => {
      this.tornadoProfiles(profiles)
    }
    this.buildProfileLink = (p) => {
      return '#/profiles/' + this.reportSourceKey() + '/' + p.personId + '/' + this.reportCohortDefinitionId()
    }
    this.runReport = () => {
      this.loadingReport(true)
      this.activeReportDrilldown(false)
      this.reportTriggerRun(false)

      const width = 1000
      const height = 250
      const minimumArea = 50
      const threshold = minimumArea / (width * height)

      switch (this.reportReportName()) {
        case 'Template':
          $.ajax({
            url: this.config.api.url + 'cohortresults/' + this.reportSourceKey() + '/' + this.reportCohortDefinitionId() + '/cohortspecific?refresh=' + this.refresh(),
            success: (data) => {
              this.currentReport(this.reportReportName())
              this.loadingReport(false)
            }
          })
          break
        case 'Tornado':
          $.ajax({
            url: this.config.api.url + 'cohortresults/' + this.reportSourceKey() + '/' + this.reportCohortDefinitionId() + '/tornado?refresh=' + this.refresh(),
            success: (data) => {
              this.tornadoRecords = data.tornadoRecords
              this.tornadoSamples = data.profileSamples
              this.currentReport(this.reportReportName())
              this.loadingReport(false)
              this.tornadoChart('#tornadoPlot svg', this.tornadoRecords, this.tornadoSamples, this.profilesSelected)
            }
          })
          break
        case 'Death':
          $.ajax({
            url: this.config.api.url + 'cohortresults/' + this.reportSourceKey() + '/' + this.reportCohortDefinitionId() + '/death?refresh=' + this.refresh(),
            success: (data) => {
              this.currentReport(this.reportReportName())
              this.loadingReport(false)

              // render trellis
              const trellisData = ChartUtils.normalizeArray(data.prevalenceByGenderAgeYear, true)
              if (!trellisData.empty) {
                const allDeciles = ['0-9', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80-89', '90-99']
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
                  Object.keys(container)
                    .forEach(function (p) {
                      item[p] = container[p][i]
                    })
                  return item
                }, trellisData)

                const dataByDecile = nestByDecile(normalizedSeries)
                // fill in gaps
                const yearRange = d3.range(minYear, maxYear, 1)

                dataByDecile.forEach(function (trellis) {
                  trellis.values.forEach(function (series) {
                    series.values = yearRange.map(function (year) {
                      const yearData = series.values.filter(function (f) {
                        return f.xCalendarYear === year
                      })[0] || seriesInitializer(trellis.key, series.key, year, 0)
                      yearData.date = new Date(year, 0, 1)
                      return yearData
                    })
                  })
                })

                // create svg with range bands based on the trellis names
                // eslint-disable-next-line new-cap
                const chart = new atlascharts.trellisline()
                chart.render(dataByDecile, '#death_trellisLinePlot', 1000, 300, {
                  trellisSet: allDeciles,
                  trellisLabel: 'Age Decile',
                  seriesLabel: 'Year of Observation',
                  yLabel: 'Prevalence Per 1000 People',
                  xFormat: d3.timeFormat('%m/%Y'),
                  yFormat: d3.format('0.2f'),
                  tickPadding: 20,
                  colors: d3.scaleOrdinal()
                    .domain(['MALE', 'FEMALE', 'UNKNOWN'])
                    .range(['#1F78B4', '#FB9A99', '#33A02C'])
                })
              }

              // prevalence by month
              const byMonthData = ChartUtils.normalizeArray(data.prevalenceByMonth, true)
              if (!byMonthData.empty) {
                const byMonthSeries = this.mapMonthYearDataToSeries(byMonthData, {
                  dateField: 'xCalendarMonth',
                  yValue: 'yPrevalence1000Pp',
                  yPercent: 'yPrevalence1000Pp'
                })

                // eslint-disable-next-line new-cap
                const prevalenceByMonth = new atlascharts.line()
                prevalenceByMonth.render(byMonthSeries, '#deathPrevalenceByMonth', 1000, 300, {
                  xScale: d3.scaleTime()
                    .domain(d3.extent(byMonthSeries[0].values, function (d) {
                      return d.xValue
                    })),
                  xFormat: d3.timeFormat('%m/%Y'),
                  tickFormat: d3.timeFormat('%m/%Y'),
                  xLabel: 'Date',
                  yLabel: 'Prevalence per 1000 People'
                })
              }

              // death type
              if (data.deathByType && data.deathByType.length > 0) {
                // eslint-disable-next-line new-cap
                const genderDonut = new atlascharts.donut()
                genderDonut.render(this.mapConceptData(data.deathByType), '#deathByType', size6.width, size6.height, {
                  margin: {
                    top: 5,
                    left: 5,
                    right: 200,
                    bottom: 5
                  }
                })
              }

              // Age At Death
              const bpdata = ChartUtils.normalizeArray(data.agetAtDeath)
              if (!bpdata.empty) {
                // eslint-disable-next-line new-cap
                const boxplot = new atlascharts.boxplot()
                const bpseries = []

                for (let i = 0; i < bpdata.category.length; i++) {
                  bpseries.push({
                    Category: bpdata.category[i],
                    min: bpdata.minValue[i],
                    max: bpdata.maxValue[i],
                    median: bpdata.medianValue[i],
                    LIF: bpdata.p10Value[i],
                    q1: bpdata.p25Value[i],
                    q3: bpdata.p75Value[i],
                    UIF: bpdata.p90Value[i]
                  })
                }
                boxplot.render(bpseries, '#ageAtDeath', size6.width, size6.height, {
                  yMax: d3.max(bpdata.p90Value),
                  yFormat: d3.format(',.1s'),
                  xLabel: 'Gender',
                  yLabel: 'Age at Death',
                  ...this.chartOptions,
                })
              }
            }
          })
          break
          // not yet implemented
        case 'Care Site':
          $.ajax({
            url: this.config.api.url + 'cohortresults/' + this.reportSourceKey() + '/' + this.reportCohortDefinitionId() + '/caresite?refresh=' + this.refresh(),
            success: (data) => {
              this.currentReport(this.reportReportName())
              this.loadingReport(false)
            }
          })
          break
        case 'Measurement':
          $.ajax({
            url: this.config.api.url + 'cohortresults/' + this.reportSourceKey() + '/' + this.reportCohortDefinitionId() + '/measurement?refresh=' + this.refresh(),
            success: (data) => {
              this.currentReport(this.reportReportName())
              this.loadingReport(false)
            }
          })
          break
        case 'Procedure':
          $.ajax({
            type: 'GET',
            url: this.config.api.url + 'cohortresults/' + this.reportSourceKey() + '/' + this.reportCohortDefinitionId() + '/procedure?refresh=' + this.refresh(),
            contentType: 'application/json; charset=utf-8',
            success: (data) => {
              this.currentReport(this.reportReportName())
              this.loadingReport(false)

              const normalizedData = ChartUtils.normalizeArray(data)
              if (!normalizedData.empty) {
                const tableData = normalizedData.conceptPath.map((d, i) => {
                  const conceptDetails = normalizedData.conceptPath[i].split('||')
                  return {
                    concept_id: normalizedData.conceptId[i],
                    level_3: conceptDetails[0],
                    level_2: conceptDetails[1],
                    level_1: conceptDetails[2],
                    procedure_name: conceptDetails[3],
                    num_persons: this.formatComma(normalizedData.numPersons[i]),
                    percent_persons: this.formatPercent(normalizedData.percentPersons[i]),
                    records_per_person: this.formatFixed(normalizedData.recordsPerPerson[i])
                  }
                })

                $('#procedure_table')
                  .DataTable({
                    language: {
                      searchPlaceholder: 'Search...',
                    },
                    order: [5, 'desc'],
                    dom: this.dom,
                    buttons: this.buttons,
                    ...this.tableOptions,
                    autoWidth: false,
                    data: tableData,
                    createdRow: function (row, data, dataIndex) {
                      $(row)
                        .addClass('procedure_table_selector')
                    },
                    columns: [{
                      data: 'conceptId'
                    },
                    {
                      data: 'level_3'
                    },
                    {
                      data: 'level_2',
                      visible: false
                    },
                    {
                      data: 'level_1'
                    },
                    {
                      data: 'procedure_name'
                    },
                    {
                      data: 'num_persons',
                      className: 'numeric'
                    },
                    {
                      data: 'percent_persons',
                      className: 'numeric'
                    },
                    {
                      data: 'records_per_person',
                      className: 'numeric'
                    }
                    ],
                    deferRender: true,
                    destroy: true,
                  })

                const tree = this.buildHierarchyFromJSON(normalizedData, threshold)
                // eslint-disable-next-line new-cap
                const treemap = new atlascharts.treemap()
                treemap.render(tree, '#procedure_treemap_container', width, height, {
                  onclick: (node) => {
                    this.procedureDrilldown(node.id, node.name)
                  },
                  getsizevalue: function (node) {
                    return node.num_persons
                  },
                  getcolorvalue: function (node) {
                    return node.records_per_person
                  },
                  getcolorrange: () => {
                    return this.treemapGradient
                  },
                  getcontent: (node) => {
                    let result = ''
                    const steps = node.path.split('||')
                    const i = steps.length - 1
                    result += '<div class="pathleaf">' + steps[i] + '</div>'
                    result += '<div class="pathleafstat">Prevalence: ' + this.formatPercent(node.pct_persons) + '</div>'
                    result += '<div class="pathleafstat">Number of People: ' + this.formatComma(node.num_persons) + '</div>'
                    result += '<div class="pathleafstat">Records per Person: ' + this.formatFixed(node.records_per_person) + '</div>'
                    return result
                  },
                  gettitle: function (node) {
                    let title = ''
                    const steps = node.path.split('||')
                    for (let i = 0; i < steps.length - 1; i++) {
                      title += ' <div class="pathstep">' + Array(i + 1)
                        .join('&nbsp;&nbsp') + steps[i] + ' </div>'
                    }
                    return title
                  }
                })
                $('[data-toggle="popover"]')
                  .popover()
              }
            }
          })
          break
        case 'Drug Exposure':
          $.ajax({
            type: 'GET',
            url: this.config.api.url + 'cohortresults/' + this.reportSourceKey() + '/' + this.reportCohortDefinitionId() + '/drug?refresh=' + this.refresh(),
            contentType: 'application/json; charset=utf-8',
            success: (data) => {
              this.currentReport(this.reportReportName())
              this.loadingReport(false)
              const normalizedData = atlascharts.chart.normalizeDataframe(ChartUtils.normalizeArray(data, true))
              if (!normalizedData.empty) {
                const tableData = normalizedData.conceptPath.map((d, i) => {
                  const conceptDetails = normalizedData.conceptPath[i].split('||')
                  return {
                    concept_id: normalizedData.conceptId[i],
                    atc1: conceptDetails[0],
                    atc3: conceptDetails[1],
                    atc5: conceptDetails[2],
                    ingredient: conceptDetails[3],
                    rxnorm: conceptDetails[4],
                    num_persons: this.formatComma(normalizedData.numPersons[i]),
                    percent_persons: this.formatPercent(normalizedData.percentPersons[i]),
                    records_per_person: this.formatFixed(normalizedData.recordsPerPerson[i])
                  }
                })

                $('#drug_table')
                  .DataTable({
                    language: {
                      searchPlaceholder: 'Search...',
                    },
                    order: [6, 'desc'],
                    dom: this.dom,
                    buttons: this.buttons,
                    ...this.tableOptions,
                    autoWidth: false,
                    data: tableData,
                    createdRow: function (row, data, dataIndex) {
                      $(row)
                        .addClass('drug_table_selector')
                    },
                    columns: [{
                      data: 'conceptId'
                    },
                    {
                      data: 'atc1'
                    },
                    {
                      data: 'atc3',
                      visible: false
                    },
                    {
                      data: 'atc5'
                    },
                    {
                      data: 'ingredient',
                      visible: false
                    },
                    {
                      data: 'rxnorm'
                    },
                    {
                      data: 'num_persons',
                      className: 'numeric'
                    },
                    {
                      data: 'percent_persons',
                      className: 'numeric'
                    },
                    {
                      data: 'records_per_person',
                      className: 'numeric'
                    }
                    ],
                    deferRender: true,
                    destroy: true,
                  })

                const tree = this.buildHierarchyFromJSON(normalizedData, threshold)
                // eslint-disable-next-line new-cap
                const treemap = new atlascharts.treemap()
                treemap.render(tree, '#drug_treemap_container', width, height, {
                  onclick: (node) => {
                    this.drugExposureDrilldown(node.id, node.name)
                  },
                  getsizevalue: function (node) {
                    return node.num_persons
                  },
                  getcolorvalue: function (node) {
                    return node.records_per_person
                  },
                  getcolorrange: () => {
                    return this.treemapGradient
                  },
                  getcontent: (node) => {
                    let result = ''
                    const steps = node.path.split('||')
                    const i = steps.length - 1
                    result += '<div class="pathleaf">' + steps[i] + '</div>'
                    result += '<div class="pathleafstat">Prevalence: ' + this.formatPercent(node.pct_persons) + '</div>'
                    result += '<div class="pathleafstat">Number of People: ' + this.formatComma(node.num_persons) + '</div>'
                    result += '<div class="pathleafstat">Records per Person: ' + this.formatFixed(node.records_per_person) + '</div>'
                    return result
                  },
                  gettitle: function (node) {
                    let title = ''
                    const steps = node.path.split('||')
                    for (let i = 0; i < steps.length - 1; i++) {
                      title += ' <div class="pathstep">' + Array(i + 1)
                        .join('&nbsp;&nbsp') + steps[i] + ' </div>'
                    }
                    return title
                  }
                })
                $('[data-toggle="popover"]')
                  .popover()
              }
            }
          })
          break
        case 'Drug Eras':

          $.ajax({
            url: this.config.api.url + 'cohortresults/' + this.reportSourceKey() + '/' + this.reportCohortDefinitionId() + '/drugera?refresh=' + this.refresh(),
            success: (data) => {
              this.currentReport(this.reportReportName())
              this.loadingReport(false)

              const normalizedData = atlascharts.chart.normalizeDataframe(ChartUtils.normalizeArray(data, true))
              if (!normalizedData.empty) {
                const tableData = normalizedData.conceptPath.map((d, i) => {
                  const conceptDetails = normalizedData.conceptPath[i].split('||')
                  return {
                    concept_id: normalizedData.conceptId[i],
                    atc1: conceptDetails[0],
                    atc3: conceptDetails[1],
                    atc5: conceptDetails[2],
                    ingredient: conceptDetails[3],
                    num_persons: this.formatComma(normalizedData.numPersons[i]),
                    percent_persons: this.formatPercent(normalizedData.percentPersons[i]),
                    length_of_era: this.formatFixed(normalizedData.lengthOfEra[i])
                  }
                })

                $('#drugera_table')
                  .DataTable({
                    language: {
                      searchPlaceholder: 'Search...',
                    },
                    order: [5, 'desc'],
                    dom: this.dom,
                    buttons: this.buttons,
                    ...this.tableOptions,
                    autoWidth: false,
                    data: tableData,
                    createdRow: function (row, data, dataIndex) {
                      $(row)
                        .addClass('drugera_table_selector')
                    },
                    columns: [{
                      data: 'conceptId'
                    },
                    {
                      data: 'atc1'
                    },
                    {
                      data: 'atc3',
                      visible: false
                    },
                    {
                      data: 'atc5'
                    },
                    {
                      data: 'ingredient'
                    },
                    {
                      data: 'num_persons',
                      className: 'numeric'
                    },
                    {
                      data: 'percent_persons',
                      className: 'numeric'
                    },
                    {
                      data: 'length_of_era',
                      className: 'numeric'
                    }
                    ],
                    deferRender: true,
                    destroy: true,
                  })

                const tree = this.eraBuildHierarchyFromJSON(normalizedData, threshold)
                // eslint-disable-next-line new-cap
                const treemap = new atlascharts.treemap()
                treemap.render(tree, '#drugera_treemap_container', width, height, {
                  onclick: (node) => {
                    this.drugeraDrilldown(node.id, node.name)
                  },
                  getsizevalue: function (node) {
                    return node.num_persons
                  },
                  getcolorvalue: function (node) {
                    return node.length_of_era
                  },
                  getcolorrange: () => {
                    return this.treemapGradient
                  },
                  getcontent: (node) => {
                    let result = ''
                    const steps = node.path.split('||')
                    const i = steps.length - 1
                    result += '<div class="pathleaf">' + steps[i] + '</div>'
                    result += '<div class="pathleafstat">Prevalence: ' + this.formatPercent(node.pct_persons) + '</div>'
                    result += '<div class="pathleafstat">Number of People: ' + this.formatComma(node.num_persons) + '</div>'
                    result += '<div class="pathleafstat">Length of Era: ' + this.formatFixed(node.length_of_era) + '</div>'
                    return result
                  },
                  gettitle: function (node) {
                    let title = ''
                    const steps = node.path.split('||')
                    for (let i = 0; i < steps.length - 1; i++) {
                      title += ' <div class="pathstep">' + Array(i + 1)
                        .join('&nbsp;&nbsp') + steps[i] + ' </div>'
                    }
                    return title
                  }
                })
                $('[data-toggle="popover"]')
                  .popover()
              }
            }
          })
          break
        case 'Condition':
          $.ajax({
            url: this.config.api.url + 'cohortresults/' + this.reportSourceKey() + '/' + this.reportCohortDefinitionId() + '/condition?refresh=' + this.refresh(),
            success: (data) => {
              this.currentReport(this.reportReportName())
              this.loadingReport(false)
              const normalizedData = atlascharts.chart.normalizeDataframe(ChartUtils.normalizeArray(data, true))
              if (!normalizedData.empty) {
                const tableData = normalizedData.conceptPath.map((d, i) => {
                  const conceptDetails = normalizedData.conceptPath[i].split('||')
                  return {
                    concept_id: normalizedData.conceptId[i],
                    soc: conceptDetails[0],
                    hlgt: conceptDetails[1],
                    hlt: conceptDetails[2],
                    pt: conceptDetails[3],
                    snomed: conceptDetails[4],
                    num_persons: this.formatComma(normalizedData.numPersons[i]),
                    percent_persons: this.formatPercent(normalizedData.percentPersons[i]),
                    records_per_person: this.formatFixed(normalizedData.recordsPerPerson[i])
                  }
                })

                $('#condition_table')
                  .DataTable({
                    language: {
                      searchPlaceholder: 'Search...',
                    },
                    dom: this.dom,
                    buttons: this.buttons,
                    ...this.tableOptions,
                    autoWidth: false,
                    order: [6, 'desc'],
                    data: tableData,
                    createdRow: function (row, data, dataIndex) {
                      $(row)
                        .addClass('condition_table_selector')
                    },
                    columns: [{
                      data: 'conceptId'
                    },
                    {
                      data: 'soc'
                    },
                    {
                      data: 'hlgt',
                      visible: false
                    },
                    {
                      data: 'hlt'
                    },
                    {
                      data: 'pt',
                      visible: false
                    },
                    {
                      data: 'snomed'
                    },
                    {
                      data: 'num_persons',
                      className: 'numeric'
                    },
                    {
                      data: 'percent_persons',
                      className: 'numeric'
                    },
                    {
                      data: 'records_per_person',
                      className: 'numeric'
                    }
                    ],
                    lengthChange: false,
                    deferRender: true,
                    destroy: true,
                  })

                const tree = this.buildHierarchyFromJSON(normalizedData, threshold)
                // eslint-disable-next-line new-cap
                const treemap = new atlascharts.treemap()
                treemap.render(tree, '#condition_treemap_container', width, height, {
                  onclick: (node) => {
                    this.conditionDrilldown(node.id, node.name)
                  },
                  getsizevalue: function (node) {
                    return node.num_persons
                  },
                  getcolorvalue: function (node) {
                    return node.records_per_person
                  },
                  getcolorrange: () => {
                    return this.treemapGradient
                  },
                  getcontent: (node) => {
                    let result = ''
                    const steps = node.path.split('||')
                    const i = steps.length - 1
                    result += '<div class="pathleaf">' + steps[i] + '</div>'
                    result += '<div class="pathleafstat">Prevalence: ' + this.formatPercent(node.pct_persons) + '</div>'
                    result += '<div class="pathleafstat">Number of People: ' + this.formatComma(node.num_persons) + '</div>'
                    result += '<div class="pathleafstat">Records per Person: ' + this.formatFixed(node.records_per_person) + '</div>'
                    return result
                  },
                  gettitle: function (node) {
                    let title = ''
                    const steps = node.path.split('||')
                    for (let i = 0; i < steps.length - 1; i++) {
                      title += ' <div class="pathstep">' + Array(i + 1)
                        .join('&nbsp;&nbsp') + steps[i] + ' </div>'
                    }
                    return title
                  }
                })
                $('[data-toggle="popover"]').popover()
              }
            }
          })
          break
        case 'Observation Periods':
          $.ajax({
            url: this.config.api.url + 'cohortresults/' + this.reportSourceKey() + '/' + this.reportCohortDefinitionId() + '/observationperiod?refresh=' + this.refresh(),
            success: (data) => {
              this.currentReport(this.reportReportName())
              this.loadingReport(false)
              // age by gender
              const ageByGenderData = ChartUtils.normalizeArray(data.ageByGender)
              if (!ageByGenderData.empty) {
                // eslint-disable-next-line new-cap
                const agegenderboxplot = new atlascharts.boxplot()
                const agData = ageByGenderData.category
                  .map(function (d, i) {
                    const item = {
                      Category: this[i].category,
                      min: this[i].minValue,
                      LIF: this[i].p10Value,
                      q1: this[i].p25Value,
                      median: this[i].medianValue,
                      q3: this[i].p75Value,
                      UIF: this[i].p90Value,
                      max: this[i].maxValue
                    }
                    return item
                  }, data.ageByGender)
                agegenderboxplot.render(agData, '#agebygender', size12.width, size12.height, {
                  xLabel: 'Gender',
                  yLabel: 'Age',
                  yFormat: d3.format('0f'),
                })
              }

              // age at first obs
              const ageAtFirstData = data.ageAtFirst
              if (!ageAtFirstData.empty) {
                const histData = {}
                d3.selectAll('#ageatfirstobservation svg').remove()
                histData.INTERVAL_SIZE = 1
                histData.DATA = ChartUtils.normalizeArray(ageAtFirstData.map(value => ({ INTERVAL_INDEX: value.intervalIndex, COUNT_VALUE: value.countValue })))
                histData.OFFSET = 0
                histData.INTERVALS = histData.DATA.INTERVAL_INDEX.length

                const ageAtFirstObservationData = atlascharts.histogram.mapHistogram(histData)
                // eslint-disable-next-line new-cap
                const ageAtFirstObservationHistogram = new atlascharts.histogram()
                ageAtFirstObservationHistogram.render(ageAtFirstObservationData, '#ageatfirstobservation', size12.width, size12.height, {
                  xFormat: d3.format('0.0d'),
                  xLabel: 'Age',
                  yLabel: 'People'
                })
              }

              // observation length
              if (data.observationLength && data.observationLength.length > 0 && data.observationLengthStats) {
                const histData2 = {}
                const observationDataMapped = data.observationLength.map(value => ({ INTERVAL_INDEX: value.intervalIndex, COUNT_VALUE: value.countValue }))
                histData2.DATA = ChartUtils.normalizeArray(observationDataMapped)
                histData2.INTERVAL_SIZE = +data.observationLengthStats[0].intervalSize
                histData2.OFFSET = 0
                histData2.MAX = +data.observationLengthStats[0].maxValue
                histData2.INTERVALS = histData2.DATA.INTERVAL_INDEX.length
                d3.selectAll('#observationlength svg')
                  .remove()
                if (!histData2.DATA.empty) {
                  const observationLengthData = atlascharts.histogram.mapHistogram(histData2)
                  let observationLengthXLabel = 'Days'
                  if (observationLengthData.length > 0) {
                    if (observationLengthData[observationLengthData.length - 1].x - observationLengthData[0].x > 1000) {
                      observationLengthData.forEach(function (d) {
                        d.x = d.x / 365.25
                        d.dx = d.dx / 365.25
                      })
                      observationLengthXLabel = 'Years'
                    }
                  }
                  // eslint-disable-next-line new-cap
                  const observationLengthHistogram = new atlascharts.histogram()
                  observationLengthHistogram.render(observationLengthData, '#observationlength', size12.width, size12.height, {
                    xLabel: observationLengthXLabel,
                    yLabel: 'People',
                    yFormat: d3.format('0.1d')
                  })
                }
              }

              /* error in charting library
            // cumulative observation
            d3.selectAll("#cumulativeobservation svg")
              .remove();
            let cumObsData = ChartUtils.normalizeArray(data.cumulativeObservation);
            if (!cumObsData.empty) {
              // eslint-disable-next-line new-cap
              let cumulativeObservationLine = new atlascharts.line();
              let cumulativeData = atlascharts.histogram.normalizeDataframe(cumObsData)
                .xLengthOfObservation
                .map(function (d, i) {
                  let item = {
                    xValue: this.xLengthOfObservation[i],
                    yValue: this.yPercentPersons[i]
                  };
                  return item;
                }, cumObsData);

              let cumulativeObservationXLabel = 'Days';
              if (cumulativeData.length > 0) {
                if (cumulativeData.slice(-1)[0].xValue - cumulativeData[0].xValue > 1000) {
                  // convert x data to years
                  cumulativeData.forEach(function (d) {
                    d.xValue = d.xValue / 365.25;
                  });
                  cumulativeObservationXLabel = 'Years';
                }
              }

              cumulativeObservationLine.render(cumulativeData, "#cumulativeobservation", 230, 115, {
                yFormat: d3.format('0%'),
                // eslint-disable-next-line new-cap
                interpolate: (new atlascharts.line()).interpolation.curveStepBefore,
                xLabel: cumulativeObservationXLabel,
                yLabel: 'Percent of Population'
              });
            }
            */

              // observation period length by gender
              const obsPeriodByGenderData = ChartUtils.normalizeArray(data.durationByGender)
              if (!obsPeriodByGenderData.empty) {
                d3.selectAll('#opbygender svg')
                  .remove()
                // eslint-disable-next-line new-cap
                const opbygenderboxplot = new atlascharts.boxplot()
                const opgData = obsPeriodByGenderData.category
                  .map(function (d, i) {
                    const item = {
                      Category: this.category[i],
                      min: this.minValue[i],
                      LIF: this.p10Value[i],
                      q1: this.p25Value[i],
                      median: this.medianValue[i],
                      q3: this.p75Value[i],
                      UIF: this.p90Value[i],
                      max: this.maxValue[i]
                    }
                    return item
                  }, obsPeriodByGenderData)

                let opgDataYlabel = 'Days'
                const opgDataMinY = d3.min(opgData, function (d) {
                  return d.min
                })
                const opgDataMaxY = d3.max(opgData, function (d) {
                  return d.max
                })
                if ((opgDataMaxY - opgDataMinY) > 1000) {
                  opgData.forEach(function (d) {
                    d.min = d.min / 365.25
                    d.LIF = d.LIF / 365.25
                    d.q1 = d.q1 / 365.25
                    d.median = d.median / 365.25
                    d.q3 = d.q3 / 365.25
                    d.UIF = d.UIF / 365.25
                    d.max = d.max / 365.25
                  })
                  opgDataYlabel = 'Years'
                }

                opbygenderboxplot.render(opgData, '#opbygender', size12.width, size12.height, {
                  xLabel: 'Gender',
                  yLabel: opgDataYlabel
                })
              }

              // observation period length by age
              d3.selectAll('#opbyage svg')
                .remove()
              const obsPeriodByLenByAgeData = ChartUtils.normalizeArray(data.durationByAgeDecile)
              if (!obsPeriodByLenByAgeData.empty) {
                // eslint-disable-next-line new-cap
                const opbyageboxplot = new atlascharts.boxplot()
                const opaData = obsPeriodByLenByAgeData.category
                  .map(function (d, i) {
                    const item = {
                      Category: this.category[i],
                      min: this.minValue[i],
                      LIF: this.p10Value[i],
                      q1: this.p25Value[i],
                      median: this.medianValue[i],
                      q3: this.p75Value[i],
                      UIF: this.p90Value[i],
                      max: this.maxValue[i]
                    }
                    return item
                  }, obsPeriodByLenByAgeData)

                let opaDataYlabel = 'Days'
                const opaDataMinY = d3.min(opaData, function (d) {
                  return d.min
                })
                const opaDataMaxY = d3.max(opaData, function (d) {
                  return d.max
                })
                if ((opaDataMaxY - opaDataMinY) > 1000) {
                  opaData.forEach(function (d) {
                    d.min = d.min / 365.25
                    d.LIF = d.LIF / 365.25
                    d.q1 = d.q1 / 365.25
                    d.median = d.median / 365.25
                    d.q3 = d.q3 / 365.25
                    d.UIF = d.UIF / 365.25
                    d.max = d.max / 365.25
                  })
                  opaDataYlabel = 'Years'
                }

                opbyageboxplot.render(opaData, '#opbyage', size12.width, size12.height, {
                  xLabel: 'Age Decile',
                  yLabel: opaDataYlabel
                })
              }

              // observed by year
              // tooltip bug
              /*
            if (!data.personsWithContinuousObservationsByYear.empty && data.personsWithContinuousObservationsByYearStats) {
              let histData3 = {};
              let obsByYearDataMapped = data.personsWithContinuousObservationsByYear.map(value => ({ INTERVAL_INDEX: value.intervalIndex, COUNT_VALUE: value.countValue }));
              histData2.DATA = ChartUtils.normalizeArray(obsByYearDataMapped);
              histData3.INTERVAL_SIZE = +data.personsWithContinuousObservationsByYearStats[0].intervalSize;
              histData3.OFFSET = +data.personsWithContinuousObservationsByYearStats[0].minValue;
              histData3.MAX = +data.personsWithContinuousObservationsByYearStats[0].maxValue;
              histData3.INTERVALS = Math.round((histData3.MAX - histData3.OFFSET + histData3.intervalSize) / histData3.INTERVAL_SIZE) + histData3.INTERVAL_SIZE;
              d3.selectAll("#oppeoplebyyear svg").remove();
              // eslint-disable-next-line new-cap
              let observationLengthByYearHistogram = new atlascharts.histogram();
              observationLengthByYearHistogram.render(atlascharts.histogram.mapHistogram(histData3), "#oppeoplebyyear", size12.width, size12.height, {
                xLabel: 'Year',
                yLabel: 'People'
              });
            }
            */

              // observed by month
              const obsByMonthData = ChartUtils.normalizeArray(data.observedByMonth)
              if (!obsByMonthData.empty) {
                const byMonthSeries = this.mapMonthYearDataToSeries(obsByMonthData, {
                  dateField: 'monthYear',
                  yValue: 'countValue',
                  yPercent: 'percentValue'
                })
                d3.selectAll('#oppeoplebymonthsingle svg')
                  .remove()
                // eslint-disable-next-line new-cap
                const observationByMonthSingle = new atlascharts.line()
                observationByMonthSingle.render(byMonthSeries, '#oppeoplebymonthsingle', size12.width, size12.height, {
                  xScale: d3.scaleTime()
                    .domain(d3.extent(byMonthSeries[0].values, function (d) {
                      return d.xValue
                    })),
                  xFormat: d3.timeFormat('%m/%Y'),
                  tickFormat: d3.timeFormat('%m/%Y'),
                  ticks: 10,
                  xLabel: 'Date',
                  yLabel: 'People'
                })
              }

              // obs period per person
              const personPeriodData = ChartUtils.normalizeArray(data.observationPeriodsPerPerson)
              if (!personPeriodData.empty) {
                d3.selectAll('#opperperson svg')
                  .remove()
                // eslint-disable-next-line new-cap
                const donut = new atlascharts.donut()
                donut.render(this.mapConceptData(data.observationPeriodsPerPerson), '#opperperson', size12.width, size12.height, {
                  margin: {
                    top: 5,
                    bottom: 10,
                    right: 50,
                    left: 10
                  }
                })
              }
            }
          })
          break
        case 'Condition Eras':
          $.ajax({
            url: this.config.api.url + 'cohortresults/' + this.reportSourceKey() + '/' + this.reportCohortDefinitionId() + '/conditionera?refresh=' + this.refresh(),
            success: (data) => {
              this.currentReport(this.reportReportName())
              this.loadingReport(false)
              const normalizedData = atlascharts.chart.normalizeDataframe(ChartUtils.normalizeArray(data, true))
              if (!normalizedData.empty) {
                const tableData = normalizedData.conceptPath.map((d, i) => {
                  const conceptDetails = normalizedData.conceptPath[i].split('||')
                  return {
                    concept_id: normalizedData.conceptId[i],
                    soc: conceptDetails[0],
                    hlgt: conceptDetails[1],
                    hlt: conceptDetails[2],
                    pt: conceptDetails[3],
                    snomed: conceptDetails[4],
                    num_persons: this.formatComma(normalizedData.numPersons[i]),
                    percent_persons: this.formatPercent(normalizedData.percentPersons[i]),
                    length_of_era: normalizedData.lengthOfEra[i]
                  }
                })

                $('#conditionera_table')
                  .DataTable({
                    language: {
                      searchPlaceholder: 'Search...',
                    },
                    order: [6, 'desc'],
                    dom: this.dom,
                    buttons: this.buttons,
                    ...this.tableOptions,
                    autoWidth: false,
                    data: tableData,
                    createdRow: function (row, data, dataIndex) {
                      $(row)
                        .addClass('conditionera_table_selector')
                    },
                    columns: [{
                      data: 'conceptId'
                    },
                    {
                      data: 'soc'
                    },
                    {
                      data: 'hlgt',
                      visible: false
                    },
                    {
                      data: 'hlt'
                    },
                    {
                      data: 'pt',
                      visible: false
                    },
                    {
                      data: 'snomed'
                    },
                    {
                      data: 'num_persons',
                      className: 'numeric'
                    },
                    {
                      data: 'percent_persons',
                      className: 'numeric'
                    },
                    {
                      data: 'length_of_era',
                      className: 'numeric'
                    }
                    ],
                    deferRender: true,
                    destroy: true,
                  })

                const tree = this.eraBuildHierarchyFromJSON(normalizedData, threshold)
                // eslint-disable-next-line new-cap
                const treemap = new atlascharts.treemap()
                treemap.render(tree, '#conditionera_treemap_container', width, height, {
                  onclick: (node) => {
                    this.conditionEraDrilldown(node.id, node.name)
                  },
                  getsizevalue: function (node) {
                    return node.num_persons
                  },
                  getcolorvalue: function (node) {
                    return node.length_of_era
                  },
                  getcolorrange: () => {
                    return this.treemapGradient
                  },
                  getcontent: (node) => {
                    let result = ''
                    const steps = node.path.split('||')
                    const i = steps.length - 1
                    result += '<div class="pathleaf">' + steps[i] + '</div>'
                    result += '<div class="pathleafstat">Prevalence: ' + this.formatPercent(node.pct_persons) + '</div>'
                    result += '<div class="pathleafstat">Number of People: ' + this.formatComma(node.num_persons) + '</div>'
                    result += '<div class="pathleafstat">Length of Era: ' + this.formatFixed(node.length_of_era) + '</div>'
                    return result
                  },
                  gettitle: function (node) {
                    let title = ''
                    const steps = node.path.split('||')
                    for (let i = 0; i < steps.length - 1; i++) {
                      title += ' <div class="pathstep">' + Array(i + 1)
                        .join('&nbsp;&nbsp') + steps[i] + ' </div>'
                    }
                    return title
                  }
                })
                $('[data-toggle="popover"]')
                  .popover()
              }
            }
          })
          break
        case 'Drugs by Index':
          $.ajax({
            url: this.config.api.url + 'cohortresults/' + this.reportSourceKey() + '/' + this.reportCohortDefinitionId() + '/cohortspecifictreemap?refresh=' + this.refresh(),
            success: (data) => {
              this.currentReport(this.reportReportName())
              this.loadingReport(false)

              let tableData
              if (data.drugEraPrevalence) {
                const drugEraPrevalence = atlascharts.chart.normalizeDataframe(ChartUtils.normalizeArray(data.drugEraPrevalence, true))

                if (!drugEraPrevalence.empty) {
                  tableData = drugEraPrevalence.conceptPath.map((d, i) => {
                    const conceptDetails = d.split('||')
                    return {
                      concept_id: drugEraPrevalence.conceptId[i],
                      atc1: conceptDetails[0],
                      atc3: conceptDetails[1],
                      atc5: conceptDetails[2],
                      ingredient: conceptDetails[3],
                      name: conceptDetails[3],
                      num_persons: this.formatComma(drugEraPrevalence.numPersons[i]),
                      percent_persons: this.formatPercent(drugEraPrevalence.percentPersons[i]),
                      relative_risk: this.formatFixed(drugEraPrevalence.logRRAfterBefore[i]),
                      percent_persons_before: this.formatPercent(drugEraPrevalence.percentPersons[i]),
                      percent_persons_after: this.formatPercent(drugEraPrevalence.percentPersons[i]),
                      risk_difference: this.formatFixed(drugEraPrevalence.riskDiffAfterBefore[i])
                    }
                  })

                  const datatable = $('#drugs-by-index-table')
                    .DataTable({
                      language: {
                        searchPlaceholder: 'Search...',
                      },
                      order: [5, 'desc'],
                      dom: this.dom,
                      buttons: this.buttons,
                      ...this.tableOptions,
                      autoWidth: false,
                      data: tableData,
                      columns: [{
                        data: 'conceptId'
                      },
                      {
                        data: 'atc1'
                      },
                      {
                        data: 'atc3',
                        visible: false
                      },
                      {
                        data: 'atc5'
                      },
                      {
                        data: 'ingredient'
                      },
                      {
                        data: 'num_persons',
                        className: 'numeric'
                      },
                      {
                        data: 'percent_persons',
                        className: 'numeric'
                      },
                      {
                        data: 'relative_risk',
                        className: 'numeric'
                      }
                      ],
                      deferRender: true,
                      destroy: true,
                    })
                  this.datatables['drugs-by-index-table'] = datatable

                  const tree = this.buildHierarchyFromJSON(drugEraPrevalence, threshold)
                  // eslint-disable-next-line new-cap
                  const treemap = new atlascharts.treemap()
                  treemap.render(tree, '#drugindex_treemap_container', width, height, {
                    onclick: (node) => {
                      this.drilldown(node.id, node.name, 'drug')
                    },
                    getsizevalue: function (node) {
                      return node.num_persons
                    },
                    getcolorvalue: function (node) {
                      return node.relative_risk
                    },
                    getcolorrange: function () {
                      return colorbrewer.Reds[3]
                    },
                    getcolorscale: function () {
                      return [-6, 0, 5]
                    },
                    getcontent: (node) => {
                      let result = ''
                      const steps = node.path.split('||')
                      const i = steps.length - 1
                      result += '<div class="pathleaf">' + steps[i] + '</div>'
                      result += '<div class="pathleafstat">Prevalence: ' + this.formatPercent(node.pct_persons) + '</div>'
                      result += '<div class="pathleafstat">% Persons Before: ' + this.formatPercent(node.pct_persons_before) + '</div>'
                      result += '<div class="pathleafstat">% Persons After: ' + this.formatPercent(node.pct_persons_after) + '</div>'
                      result += '<div class="pathleafstat">Number of People: ' + this.formatComma(node.num_persons) + '</div>'
                      result += '<div class="pathleafstat">Log of Relative Risk per Person: ' + this.formatFixed(node.relative_risk) + '</div>'
                      result += '<div class="pathleafstat">Difference in Risk: ' + this.formatFixed(node.risk_difference) + '</div>'
                      return result
                    },
                    gettitle: function (node) {
                      let title = ''
                      const steps = node.path.split('||')
                      for (let i = 0; i < steps.length - 1; i++) {
                        title += ' <div class="pathstep">' + Array(i + 1)
                          .join('&nbsp;&nbsp') + steps[i] + ' </div>'
                      }
                      return title
                    }
                  })

                  $('[data-toggle="popover"]')
                    .popover()
                }
              }
            }
          })
          break
        case 'Conditions by Index':
          $.ajax({
            url: this.config.api.url + 'cohortresults/' + this.reportSourceKey() + '/' + this.reportCohortDefinitionId() + '/cohortspecifictreemap?refresh=' + this.refresh(),
            success: (data) => {
              this.currentReport(this.reportReportName())
              this.loadingReport(false)

              let tableData
              // condition prevalence
              if (data.conditionOccurrencePrevalence) {
                const normalizedData = atlascharts.chart.normalizeDataframe(ChartUtils.normalizeArray(data.conditionOccurrencePrevalence, true))
                if (!normalizedData.empty) {
                  tableData = normalizedData.conceptPath.map((d, i) => {
                    const conceptDetails = d.split('||')
                    return {
                      concept_id: normalizedData.conceptId[i],
                      soc: conceptDetails[0],
                      hlgt: conceptDetails[1],
                      hlt: conceptDetails[2],
                      pt: conceptDetails[3],
                      snomed: conceptDetails[4],
                      name: conceptDetails[4],
                      num_persons: this.formatComma(normalizedData.numPersons[i]),
                      percent_persons: this.formatPercent(normalizedData.percentPersons[i]),
                      relative_risk: this.formatFixed(normalizedData.logRRAfterBefore[i]),
                      percent_persons_before: this.formatPercent(normalizedData.percentPersons[i]),
                      percent_persons_after: this.formatPercent(normalizedData.percentPersons[i]),
                      risk_difference: this.formatFixed(normalizedData.riskDiffAfterBefore[i])
                    }
                  })

                  const datatable = $('#condition_table')
                    .DataTable({
                      language: {
                        searchPlaceholder: 'Search...',
                      },
                      order: [6, 'desc'],
                      dom: this.dom,
                      buttons: this.buttons,
                      ...this.tableOptions,
                      data: tableData,
                      autoWidth: false,
                      columns: [{
                        data: 'conceptId'
                      },
                      {
                        data: 'soc'
                      },
                      {
                        data: 'hlgt',
                        visible: false
                      },
                      {
                        data: 'hlt'
                      },
                      {
                        data: 'pt',
                        visible: false
                      },
                      {
                        data: 'snomed'
                      },
                      {
                        data: 'num_persons',
                        className: 'numeric'
                      },
                      {
                        data: 'percent_persons',
                        className: 'numeric'
                      },
                      {
                        data: 'relative_risk',
                        className: 'numeric'
                      }
                      ],
                      lengthChange: false,
                      deferRender: true,
                      destroy: true,
                    })
                  this.datatables['condition_table'] = datatable

                  const tree = this.buildHierarchyFromJSON(normalizedData, threshold)
                  // eslint-disable-next-line new-cap
                  const treemap = new atlascharts.treemap()
                  treemap.render(tree, '#condition_treemap_container', width, height, {
                    onclick: (node) => {
                      this.drilldown(node.id, node.name, 'condition')
                    },
                    getsizevalue: function (node) {
                      return node.num_persons
                    },
                    getcolorvalue: function (node) {
                      return node.relative_risk
                    },
                    getcolorrange: function () {
                      return colorbrewer.Reds[3]
                    },
                    getcolorscale: function () {
                      return [-6, 0, 5]
                    },
                    getcontent: (node) => {
                      let result = ''
                      const steps = node.path.split('||')
                      const i = steps.length - 1
                      result += '<div class="pathleaf">' + steps[i] + '</div>'
                      result += '<div class="pathleafstat">Prevalence: ' + this.formatPercent(node.pct_persons) + '</div>'
                      result += '<div class="pathleafstat">% Persons Before: ' + this.formatPercent(node.pct_persons_before) + '</div>'
                      result += '<div class="pathleafstat">% Persons After: ' + this.formatPercent(node.pct_persons_after) + '</div>'
                      result += '<div class="pathleafstat">Number of People: ' + this.formatComma(node.num_persons) + '</div>'
                      result += '<div class="pathleafstat">Log of Relative Risk per Person: ' + this.formatFixed(node.relative_risk) + '</div>'
                      result += '<div class="pathleafstat">Difference in Risk: ' + this.formatFixed(node.risk_difference) + '</div>'
                      return result
                    },
                    gettitle: function (node) {
                      let title = ''
                      const steps = node.path.split('||')
                      for (let i = 0; i < steps.length - 1; i++) {
                        title += ' <div class="pathstep">' + Array(i + 1)
                          .join('&nbsp;&nbsp') + steps[i] + ' </div>'
                      }
                      return title
                    }
                  })

                  $('[data-toggle="popover"]')
                    .popover()
                }
              }
            }
          })
          break
        case 'Procedures by Index':
          $.ajax({
            url: this.config.api.url + 'cohortresults/' + this.reportSourceKey() + '/' + this.reportCohortDefinitionId() + '/cohortspecifictreemap?refresh=' + this.refresh(),
            success: (data) => {
              this.currentReport(this.reportReportName())
              this.loadingReport(false)

              let tableData
              if (data.procedureOccurrencePrevalence) {
                const normalizedData = atlascharts.chart.normalizeDataframe(ChartUtils.normalizeArray(data.procedureOccurrencePrevalence, true))
                if (!normalizedData.empty) {
                  tableData = normalizedData.conceptPath.map((d, i) => {
                    const conceptDetails = d.split('||')
                    return {
                      concept_id: normalizedData.conceptId[i],
                      level_4: conceptDetails[0],
                      level_3: conceptDetails[1],
                      level_2: conceptDetails[2],
                      procedure_name: conceptDetails[3],
                      name: conceptDetails[3],
                      num_persons: this.formatComma(normalizedData.numPersons[i]),
                      percent_persons: this.formatPercent(normalizedData.percentPersons[i]),
                      relative_risk: this.formatFixed(normalizedData.logRRAfterBefore[i]),
                      percent_persons_before: this.formatPercent(normalizedData.percentPersons[i]),
                      percent_persons_after: this.formatPercent(normalizedData.percentPersons[i]),
                      risk_difference: this.formatFixed(normalizedData.riskDiffAfterBefore[i])
                    }
                  })

                  const datatable = $('#procedure_table')
                    .DataTable({
                      language: {
                        searchPlaceholder: 'Search...',
                      },
                      order: [6, 'desc'],
                      dom: this.dom,
                      buttons: this.buttons,
                      ...this.tableOptions,
                      autoWidth: false,
                      data: tableData,
                      columns: [{
                        data: 'conceptId'
                      },
                      {
                        data: 'level_4'
                      },
                      {
                        data: 'level_3',
                        visible: false
                      },
                      {
                        data: 'level_2'
                      },
                      {
                        data: 'procedure_name'
                      },
                      {
                        data: 'num_persons',
                        className: 'numeric'
                      },
                      {
                        data: 'percent_persons',
                        className: 'numeric'
                      },
                      {
                        data: 'relative_risk',
                        className: 'numeric'
                      }
                      ],
                      deferRender: true,
                      destroy: true,
                    })
                  this.datatables['procedure_table'] = datatable

                  const tree = this.buildHierarchyFromJSON(normalizedData, threshold)
                  // eslint-disable-next-line new-cap
                  const treemap = new atlascharts.treemap()
                  treemap.render(tree, '#procedureindex_treemap_container', width, height, {
                    onclick: (node) => {
                      this.drilldown(node.id, node.name, 'procedure')
                    },
                    getsizevalue: function (node) {
                      return node.num_persons
                    },
                    getcolorvalue: function (node) {
                      return node.relative_risk
                    },
                    getcolorrange: function () {
                      return colorbrewer.Reds[3]
                    },
                    getcolorscale: function () {
                      return [-6, 0, 5]
                    },
                    getcontent: (node) => {
                      let result = ''
                      const steps = node.path.split('||')
                      const i = steps.length - 1
                      result += '<div class="pathleaf">' + steps[i] + '</div>'
                      result += '<div class="pathleafstat">Prevalence: ' + this.formatPercent(node.pct_persons) + '</div>'
                      result += '<div class="pathleafstat">% Persons Before: ' + this.formatPercent(node.pct_persons_before) + '</div>'
                      result += '<div class="pathleafstat">% Persons After: ' + this.formatPercent(node.pct_persons_after) + '</div>'
                      result += '<div class="pathleafstat">Number of People: ' + this.formatComma(node.num_persons) + '</div>'
                      result += '<div class="pathleafstat">Log of Relative Risk per Person: ' + this.formatFixed(node.relative_risk) + '</div>'
                      result += '<div class="pathleafstat">Difference in Risk: ' + this.formatFixed(node.risk_difference) + '</div>'
                      return result
                    },
                    gettitle: function (node) {
                      let title = ''
                      const steps = node.path.split('||')
                      for (let i = 0; i < steps.length - 1; i++) {
                        title += ' <div class="pathstep">' + Array(i + 1)
                          .join('&nbsp;&nbsp') + steps[i] + ' </div>'
                      }
                      return title
                    }
                  })

                  $('[data-toggle="popover"]')
                    .popover()
                }
              }
            }
          })
          break
        case 'Cohort Specific':
          $.ajax({
            url: this.config.api.url + 'cohortresults/' + this.reportSourceKey() + '/' + this.reportCohortDefinitionId() + '/cohortspecific?refresh=' + this.refresh(),
            success: (data) => {
              this.currentReport(this.reportReportName())
              this.loadingReport(false)

              // Persons By Duration From Start To End
              const result = ChartUtils.normalizeArray(data.personsByDurationFromStartToEnd, false)
              if (!result.empty) {
                const personsByDurationData = atlascharts.chart.normalizeDataframe(result)
                  .duration
                  .map((d, i) => {
                    const item = {
                      xValue: result.duration[i],
                      yValue: result.pctPersons[i]
                    }
                    return item
                  })

                // eslint-disable-next-line new-cap
                const personsByDurationSingle = new atlascharts.line()
                personsByDurationSingle.render(personsByDurationData, '#personsByDurationFromStartToEnd', size12.width, size12.height, {
                  yFormat: d3.format('0%'),
                  xLabel: 'Day',
                  yLabel: 'Percent of Population',
                  labelIndexDate: true,
                  colorBasedOnIndex: true
                })
              }

              // prevalence by month
              const byMonthData = ChartUtils.normalizeArray(data.prevalenceByMonth, true)
              if (!byMonthData.empty) {
                const byMonthSeries = this.mapMonthYearDataToSeries(byMonthData, {
                  dateField: 'xCalendarMonth',
                  yValue: 'yPrevalence1000Pp',
                  yPercent: 'yPrevalence1000Pp'
                })

                // eslint-disable-next-line new-cap
                const prevalenceByMonth = new atlascharts.line()
                prevalenceByMonth.render(byMonthSeries, '#prevalenceByMonth', size12.width, size12.height, {
                  xScale: d3.scaleTime()
                    .domain(d3.extent(byMonthSeries[0].values, function (d) {
                      return d.xValue
                    })),
                  xFormat: d3.timeFormat('%m/%Y'),
                  tickFormat: d3.timeFormat('%m/%Y'),
                  xLabel: 'Date',
                  yLabel: 'Prevalence per 1000 People'
                })
              }

              // age at index
              const ageAtIndexDistribution = ChartUtils.normalizeArray(data.ageAtIndexDistribution)
              if (!ageAtIndexDistribution.empty) {
                // eslint-disable-next-line new-cap
                const boxplot = new atlascharts.boxplot()
                const agData = ageAtIndexDistribution.category
                  .map(function (d, i) {
                    const item = {
                      Category: ageAtIndexDistribution.category[i],
                      min: ageAtIndexDistribution.minValue[i],
                      LIF: ageAtIndexDistribution.p10Value[i],
                      q1: ageAtIndexDistribution.p25Value[i],
                      median: ageAtIndexDistribution.medianValue[i],
                      q3: ageAtIndexDistribution.p75Value[i],
                      UIF: ageAtIndexDistribution.p90Value[i],
                      max: ageAtIndexDistribution.maxValue[i]
                    }
                    return item
                  }, ageAtIndexDistribution)
                boxplot.render(agData, '#ageAtIndex', size6.width, size6.height, {
                  xLabel: 'Gender',
                  yLabel: 'Age'
                })
              }

              // distributionAgeCohortStartByCohortStartYear
              const distributionAgeCohortStartByCohortStartYear = ChartUtils.normalizeArray(data.distributionAgeCohortStartByCohortStartYear)
              if (!distributionAgeCohortStartByCohortStartYear.empty) {
                // eslint-disable-next-line new-cap
                const boxplotCsy = new atlascharts.boxplot()
                const csyData = distributionAgeCohortStartByCohortStartYear.category
                  .map(function (d, i) {
                    const item = {
                      Category: this.category[i],
                      min: this.minValue[i],
                      LIF: this.p10Value[i],
                      q1: this.p25Value[i],
                      median: this.medianValue[i],
                      q3: this.p75Value[i],
                      UIF: this.p90Value[i],
                      max: this.maxValue[i]
                    }
                    return item
                  }, distributionAgeCohortStartByCohortStartYear)
                boxplotCsy.render(csyData, '#distributionAgeCohortStartByCohortStartYear', size4.width, size4.height, {
                  xLabel: 'Cohort Start Year',
                  yLabel: 'Age'
                })
              }

              // distributionAgeCohortStartByGender
              const distributionAgeCohortStartByGender = ChartUtils.normalizeArray(data.distributionAgeCohortStartByGender)
              if (!distributionAgeCohortStartByGender.empty) {
                // eslint-disable-next-line new-cap
                const boxplotBg = new atlascharts.boxplot()
                const bgData = distributionAgeCohortStartByGender.category
                  .map(function (d, i) {
                    const item = {
                      Category: this.category[i],
                      min: this.minValue[i],
                      LIF: this.p10Value[i],
                      q1: this.p25Value[i],
                      median: this.medianValue[i],
                      q3: this.p75Value[i],
                      UIF: this.p90Value[i],
                      max: this.maxValue[i]
                    }
                    return item
                  }, distributionAgeCohortStartByGender)
                boxplotBg.render(bgData, '#distributionAgeCohortStartByGender', size6.width, size6.height, {
                  xLabel: 'Gender',
                  yLabel: 'Age'
                })
              }

              // persons in cohort from start to end
              const personsInCohortFromCohortStartToEnd = ChartUtils.normalizeArray(data.personsInCohortFromCohortStartToEnd)
              if (!personsInCohortFromCohortStartToEnd.empty) {
                const personsInCohortFromCohortStartToEndSeries = this.map30DayDataToSeries(personsInCohortFromCohortStartToEnd, {
                  dateField: 'monthYear',
                  yValue: 'countValue',
                  yPercent: 'percentValue'
                })
                // eslint-disable-next-line new-cap
                const observationByMonthSingle = new atlascharts.line()
                observationByMonthSingle.render(personsInCohortFromCohortStartToEndSeries, '#personinCohortFromStartToEnd', size12.width, size12.height, {
                  xScale: d3.scaleTime()
                    .domain(d3.extent(personsInCohortFromCohortStartToEndSeries[0].values, function (d) {
                      return d.xValue
                    })),
                  xLabel: '30 Day Increments',
                  yLabel: 'People'
                })
              }

              // render trellis
              const trellisData = ChartUtils.normalizeArray(data.numPersonsByCohortStartByGenderByAge, true)

              if (!trellisData.empty) {
                const allDeciles = ['0-9', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80-89', '90-99']
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
                  Object.keys(container)
                    .forEach(function (p) {
                      item[p] = container[p][i]
                    })
                  return item
                }, trellisData)

                const dataByDecile = nestByDecile(normalizedSeries)
                // fill in gaps
                const yearRange = d3.range(minYear, maxYear, 1)

                dataByDecile.forEach(function (trellis) {
                  trellis.values.forEach(function (series) {
                    series.values = yearRange.map(function (year) {
                      const yearData = series.values.filter(function (f) {
                        return f.xCalendarYear === year
                      })[0] || seriesInitializer(trellis.key, series.key, year, 0)
                      yearData.date = new Date(year, 0, 1)
                      return yearData
                    })
                  })
                })

                // create svg with range bands based on the trellis names
                // eslint-disable-next-line new-cap
                const chart = new atlascharts.trellisline()
                chart.render(dataByDecile, '#cohort_trellisLinePlot', size12.width, size12.height, {
                  trellisSet: allDeciles,
                  trellisLabel: 'Age Decile',
                  seriesLabel: 'Year',
                  yLabel: 'Prevalence Per 1000 People',
                  xFormat: d3.timeFormat('%m/%Y'),
                  yFormat: d3.format('0.1f'),
                  tickPadding: 5,
                  colors: d3.scaleOrdinal()
                    .domain(['MALE', 'FEMALE', 'UNKNOWN'])
                    .range(['#1F78B4', '#FB9A99', '#33A02C'])

                })
              }
              this.loadingReport(false)
            }
          })
          break
        case 'Person':
          $.ajax({
            url: this.config.api.url + 'cohortresults/' + this.reportSourceKey() + '/' + this.reportCohortDefinitionId() + '/person?refresh=' + this.refresh(),
            success: (data) => {
              this.currentReport(this.reportReportName())
              this.loadingReport(false)

              if (data.yearOfBirth.length > 0 && data.yearOfBirthStats.length > 0) {
                // eslint-disable-next-line new-cap
                const yearHistogram = new atlascharts.histogram()
                const histData = {}
                histData.INTERVAL_SIZE = 1
                histData.OFFSET = data.yearOfBirthStats[0].minValue
                histData.DATA = (ChartUtils.normalizeArray(data.yearOfBirth.map(value => ({ INTERVAL_INDEX: value.intervalIndex, COUNT_VALUE: value.countValue }))))
                histData.INTERVALS = histData.DATA.INTERVAL_INDEX.length
                yearHistogram.render(atlascharts.histogram.mapHistogram(histData), '#hist', size12.width, size12.height, {
                  xFormat: d3.format('d'),
                  yFormat: d3.format(',.1s'),
                  xLabel: 'Year',
                  yLabel: 'People'
                })
              }

              // eslint-disable-next-line new-cap
              const genderDonut = new atlascharts.donut()
              // eslint-disable-next-line new-cap
              const raceDonut = new atlascharts.donut()
              // eslint-disable-next-line new-cap
              const ethnicityDonut = new atlascharts.donut()
              genderDonut.render(this.mapConceptData(data.gender), '#gender', size4.width, size4.height)
              raceDonut.render(this.mapConceptData(data.race), '#race', size4.width, size4.height)
              ethnicityDonut.render(this.mapConceptData(data.ethnicity), '#ethnicity', size4.width, size4.height)
              this.loadingReport(false)
            }
          })
          break // person report
        case 'Heracles Heel':
          $.ajax({
            url: this.config.api.url + 'cohortresults/' + this.reportSourceKey() + '/' + this.reportCohortDefinitionId() + '/heraclesheel?refresh=' + this.refresh(),
            success: (data) => {
              this.currentReport(this.reportReportName())
              this.loadingReport(false)

              this.reference(data)
            }
          })
          break // Heracles Heel report
        case 'Data Completeness':
          $.ajax({
            url: this.config.api.url + 'cohortresults/' + this.reportSourceKey() + '/' + this.reportCohortDefinitionId() + '/datacompleteness',
            success: (data) => {
              this.currentReport(this.reportReportName())
              this.loadingReport(false)

              this.dataCompleteReference(data)

              const initOneBarData = ChartUtils.normalizeArray(data.filter(function (d) {
                return d.covariance === '0~10'
              }), true)

              this.showHorizontalBar(initOneBarData)
            }
          })

          break // Data Completeness report
        case 'Entropy':
          $.ajax({
            url: config.api.url + 'cohortresults/' + this.reportSourceKey() + '/' + this.reportCohortDefinitionId() + '/allentropy',
            success: (data) => {
              this.currentReport(this.reportReportName())
              this.loadingReport(false)

              const allMapData = data.map(function (d) {
                return d.insitution
              })
              const careSiteArray = []
              for (let i = 0; i < allMapData.length; i++) {
                if (careSiteArray.indexOf(allMapData[i]) === -1) {
                  careSiteArray.push(allMapData[i])
                }
              }
              const careSiteData = careSiteArray.map(function (d) {
                return {
                  institution: d
                }
              })

              this.careSiteDatatable = $('#care_site_table').DataTable({
                language: {
                  searchPlaceholder: 'Search...',
                },
                order: [],
                dom: this.dom,
                buttons: this.buttons,
                ...this.tableOptions,
                data: careSiteData,
                columns: [{
                  data: 'institution'
                }],
                deferRender: true,
                destroy: true
              })
              const context = this

              $(document).on('click', '#care_site_table tbody tr', function () {
                $('#care_site_table tbody tr.selected').removeClass('selected')
                $(this).addClass('selected')

                const institutionId = context.careSiteDatatable.data()[context.careSiteDatatable.row(this)[0]].institution

                const entropyData = ChartUtils.normalizeArray(data.filter(function (d) {
                  return d.insitution === institutionId
                }), true)
                if (!entropyData.empty) {
                  const byDateSeries = context.mapDateDataToSeries(entropyData, {

                    dateField: 'date',
                    yValue: 'entropy',
                    yPercent: 'entropy'
                  })

                  // eslint-disable-next-line new-cap
                  const prevalenceByDate = new atlascharts.line()
                  prevalenceByDate.render(byDateSeries, '#entropyByDate', 400, 200, {
                    xScale: d3.scaleTime().domain(d3.extent(byDateSeries[0].values, function (d) {
                      return d.xValue
                    })),
                    xFormat: d3.timeFormat('%Y/%m/%d'),
                    yFormat: d3.format('.3f'),
                    tickFormat: d3.timeFormat('%m/%Y'),
                    xLabel: 'Date',
                    yLabel: 'Entropy'
                  })
                }
              })

              $('#care_site_table tbody tr:eq(0)').click()
            }
          })
          break // Entropy report

        case ko.unwrap(this.visualizationPacks.healthcareUtilPersonAndExposureBaseline.name):
        case ko.unwrap(this.visualizationPacks.healthcareUtilPersonAndExposureCohort.name):
        case ko.unwrap(this.visualizationPacks.healthcareUtilVisitRecordsBaseline.name):
        case ko.unwrap(this.visualizationPacks.healthcareUtilVisitDatesBaseline.name):
        case ko.unwrap(this.visualizationPacks.healthcareUtilCareSiteDatesBaseline.name):
        case ko.unwrap(this.visualizationPacks.healthcareUtilVisitRecordsCohort.name):
        case ko.unwrap(this.visualizationPacks.healthcareUtilVisitDatesCohort.name):
        case ko.unwrap(this.visualizationPacks.healthcareUtilCareSiteDatesCohort.name):
        case ko.unwrap(this.visualizationPacks.healthcareUtilDrugBaseline.name):
        case ko.unwrap(this.visualizationPacks.healthcareUtilDrugCohort.name):
          this.currentReport(this.reportReportName())
          this.loadingReport(false)
          break
      }
    }

    this.showHorizontalBar = function (oneBarData) {
      let svg = d3.select('svg')
      if (svg) {
        svg.remove()
      }

      this.currentAgeGroup('Age group of: ' + oneBarData.covariance)
      svg = d3.select('#dataCompletenessSvgDiv').append('svg')
      const margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 80
      }
      svg.attr('width', 960)
      svg.attr('height', 500)
      const width = svg.attr('width') - margin.left - margin.right
      const height = svg.attr('height') - margin.top - margin.bottom

      const tooltip = d3.select('body').append('div').style('position', 'absolute')
        .style('display', 'none')
        .style('min-width', '80px')
        .style('height', 'auto')
        .style('background', 'none repeat scroll 0 0 #ffffff')
        .style('border', '1px solid #6F257F')
        .style('padding', '14px')
        .style('text-align', 'center')

      const x = d3.scaleLinear().range([0, width])
      const y = d3.scaleBand().range([height, 0])

      const g = svg.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

      const barDataTxt = '[{"attr":"Gender", "value":' + Math.max(0, oneBarData.genderP) +
    '}, {"attr":"Race", "value":' + Math.max(0, oneBarData.raceP) +
    '}, {"attr":"Ethnicity", "value":' + Math.max(0, oneBarData.ethP) + '}]'

      const barData = JSON.parse(barDataTxt)
      x.domain([0, d3.max(barData, function (d) {
        return 100
      })])
      y.domain(barData.map(function (d) {
        return d.attr
      })).padding(0.1)

      g.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x).ticks(5).tickFormat(function (d) {
          return parseInt(d)
        }).tickSizeInner([-height]))

      // label for the x axis
      svg.append('text')
        .attr('transform',
          'translate(' + (width / 2) + ' ,' + (height + margin.top + 20) + ')')
        .style('text-anchor', 'middle')
        .text('Percentage')

      g.append('g')
        .attr('class', 'y axis')
        .call(d3.axisLeft(y))

      g.selectAll('.bar')
        .data(barData)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', 0)
        .attr('height', y.bandwidth())
        .attr('y', function (d) {
          return y(d.attr)
        })
        .attr('width', function (d) {
          return x(d.value)
        })
        .on('mousemove', function (event, d) {
          tooltip
            .style('left', event.pageX - 50 + 'px')
            .style('top', event.pageY - 70 + 'px')
            .style('display', 'inline-block')
            .html((d.attr) + '<br>' + (d.value) + '%')
        })
        .on('mouseout', function (d) {
          tooltip.style('display', 'none')
        })
    }

    this.dataCompleteRowClick = d => {
      this.showHorizontalBar(d)
    }

    // drilldown functions
    this.conditionDrilldown = (conceptId, conceptName) => {
      this.activeReportDrilldown(false)
      this.loadingReportDrilldown(true)

      $.ajax({
        type: 'GET',
        url: this.config.api.url + 'cohortresults/' + this.reportSourceKey() + '/' + this.reportCohortDefinitionId() + '/condition/' + conceptId + '?refresh=true',
        success: (data) => {
          this.activeReportDrilldown(true)
          this.loadingReportDrilldown(false)
          $('#conditionDrilldown')
            .html(conceptName + ' Drilldown Report')

          // age at first diagnosis visualization
          d3.selectAll('#ageAtFirstDiagnosis svg')
            .remove()
          // eslint-disable-next-line new-cap
          const boxplot = new atlascharts.boxplot()
          const bpseries = []
          const bpdata = ChartUtils.normalizeArray(data.ageAtFirstDiagnosis, true)
          if (!bpdata.empty) {
            for (let i = 0; i < bpdata.category.length; i++) {
              bpseries.push({
                Category: bpdata.category[i],
                min: bpdata.minValue[i],
                max: bpdata.maxValue[i],
                median: bpdata.medianValue[i],
                LIF: bpdata.p10Value[i],
                q1: bpdata.p25Value[i],
                q3: bpdata.p75Value[i],
                UIF: bpdata.p90Value[i]
              })
            }
            const size = this.breakpoints.guessFromNode('#ageAtFirstDiagnosis')
            boxplot.render(bpseries, '#ageAtFirstDiagnosis', size.width, this.breakpoints.wide.height, {
              yMax: d3.max(bpdata.p90Value),
              yFormat: d3.format(',.1s'),
              xLabel: 'Gender',
              yLabel: 'Age at First Diagnosis',
              ...this.chartOptions,
            })
          }

          // prevalence by month
          d3.selectAll('#conditionPrevalenceByMonth svg')
            .remove()
          const byMonthData = ChartUtils.normalizeArray(data.prevalenceByMonth, true)
          if (!byMonthData.empty) {
            const byMonthSeries = this.mapMonthYearDataToSeries(byMonthData, {

              dateField: 'xCalendarMonth',
              yValue: 'yPrevalence1000Pp',
              yPercent: 'yPrevalence1000Pp'
            })

            // eslint-disable-next-line new-cap
            const prevalenceByMonth = new atlascharts.line()
            const size = this.breakpoints.guessFromNode('#conditionPrevalenceByMonth')
            prevalenceByMonth.render(byMonthSeries, '#conditionPrevalenceByMonth', size.width, this.breakpoints.wide.height, {
              xScale: d3.scaleTime()
                .domain(d3.extent(byMonthSeries[0].values, function (d) {
                  return d.xValue
                })),
              xFormat: d3.timeFormat('%m/%Y'),
              tickFormat: d3.timeFormat('%m/%Y'),
              xLabel: 'Date',
              yLabel: 'Prevalence per 1000 People'
            })
          }

          // condition type visualization
          const conditionType = this.mapConceptData(data.conditionsByType)
          d3.selectAll('#conditionsByType svg')
            .remove()
          if (conditionType) {
            // eslint-disable-next-line new-cap
            const donut = new atlascharts.donut()
            donut.render(conditionType, '#conditionsByType', size12.width, size12.height, {
              margin: {
                top: 5,
                left: 5,
                right: 200,
                bottom: 5
              },
              colors: d3.scaleOrdinal()
                .domain(conditionType)
                .range(colorbrewer.Spectral[10])
            })
          }

          // render trellis
          d3.selectAll('#condition_trellisLinePlot svg')
            .remove()
          const trellisData = ChartUtils.normalizeArray(data.prevalenceByGenderAgeYear, true)

          if (!trellisData.empty) {
            const allDeciles = ['0-9', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80-89', '90-99']
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
              Object.keys(container)
                .forEach(function (p) {
                  item[p] = container[p][i]
                })
              return item
            }, trellisData)

            const dataByDecile = nestByDecile(normalizedSeries)
            // fill in gaps
            const yearRange = d3.range(minYear, maxYear, 1)

            dataByDecile.forEach(function (trellis) {
              trellis.values.forEach(function (series) {
                series.values = yearRange.map(function (year) {
                  const yearData = series.values.filter(function (f) {
                    return f.xCalendarYear === year
                  })[0] || seriesInitializer(trellis.key, series.key, year, 0)
                  yearData.date = new Date(year, 0, 1)
                  return yearData
                })
              })
            })

            // create svg with range bands based on the trellis names
            // eslint-disable-next-line new-cap
            const chart = new atlascharts.trellisline()
            const size = this.breakpoints.guessFromNode('#condition_trellisLinePlot')
            chart.render(dataByDecile, '#condition_trellisLinePlot', size.width, this.breakpoints.wide.height, {
              trellisSet: allDeciles,
              trellisLabel: 'Age Decile',
              seriesLabel: 'Year of Observation',
              yLabel: 'Prevalence Per 1000 People',
              xFormat: d3.timeFormat('%m/%Y'),
              yFormat: d3.format('0.2f'),
              tickPadding: 20,
              colors: d3.scaleOrdinal()
                .domain(['MALE', 'FEMALE', 'UNKNOWN'])
                .range(['#1F78B4', '#FB9A99', '#33A02C']),
              ...this.chartOptions,
            })
          }
        }
      })
    }

    this.drugExposureDrilldown = (conceptId, conceptName) => {
      this.loadingReportDrilldown(true)
      this.activeReportDrilldown(false)

      $.ajax({
        type: 'GET',
        url: this.config.api.url + 'cohortresults/' + this.reportSourceKey() + '/' + this.reportCohortDefinitionId() + '/drug/' + conceptId + '?refresh=' + this.refresh(),
        success: (data) => {
          $('#drugExposureDrilldown')
            .text(conceptName)
          this.activeReportDrilldown(true)
          this.loadingReportDrilldown(false)

          this.boxplotHelper(data.ageAtFirstExposure, '#ageAtFirstExposure', this.boxplotWidth, this.boxplotHeight, 'Gender', 'Age at First Exposure')
          this.boxplotHelper(data.daysSupplyDistribution, '#daysSupplyDistribution', this.boxplotWidth, this.boxplotHeight, 'Days Supply', 'Days')
          this.boxplotHelper(data.quantityDistribution, '#quantityDistribution', this.boxplotWidth, this.boxplotHeight, 'Quantity', 'Quantity')
          this.boxplotHelper(data.refillsDistribution, '#refillsDistribution', this.boxplotWidth, this.boxplotHeight, 'Refills', 'Refills')

          // drug  type visualization
          // eslint-disable-next-line new-cap
          const donut = new atlascharts.donut()
          const drugsByType = this.mapConceptData(data.drugsByType)
          donut.render(drugsByType, '#drugsByType', size12.width, size12.height, {
            margin: {
              top: 5,
              left: 5,
              right: 200,
              bottom: 5
            },
            colors: d3.scaleOrdinal()
              .domain(drugsByType)
              .range(colorbrewer.Spectral[10])
          })

          // prevalence by month
          const prevByMonth = ChartUtils.normalizeArray(data.prevalenceByMonth, true)
          if (!prevByMonth.empty) {
            const byMonthSeries = this.mapMonthYearDataToSeries(prevByMonth, {
              dateField: 'xCalendarMonth',
              yValue: 'yPrevalence1000Pp',
              yPercent: 'yPrevalence1000Pp'
            })

            d3.selectAll('#drugPrevalenceByMonth svg')
              .remove()
            // eslint-disable-next-line new-cap
            const prevalenceByMonth = new atlascharts.line()
            prevalenceByMonth.render(byMonthSeries, '#drugPrevalenceByMonth', 900, 250, {
              xScale: d3.scaleTime()
                .domain(d3.extent(byMonthSeries[0].values, function (d) {
                  return d.xValue
                })),
              xFormat: d3.timeFormat('%m/%Y'),
              tickFormat: d3.timeFormat('%m/%Y'),
              xLabel: 'Date',
              yLabel: 'Prevalence per 1000 People'
            })
          }

          // render trellis
          const trellisData = ChartUtils.normalizeArray(data.prevalenceByGenderAgeYear, true)

          if (!trellisData.empty) {
            const allDeciles = ['0-9', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80-89', '90-99']
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
              Object.keys(container)
                .forEach(function (p) {
                  item[p] = container[p][i]
                })
              return item
            }, trellisData)

            const dataByDecile = nestByDecile(normalizedSeries)
            // fill in gaps
            const yearRange = d3.range(minYear, maxYear, 1)

            dataByDecile.forEach(function (trellis) {
              trellis.values.forEach(function (series) {
                series.values = yearRange.map(function (year) {
                  const yearData = series.values.filter(function (f) {
                    return f.xCalendarYear === year
                  })[0] || seriesInitializer(trellis.key, series.key, year, 0)
                  yearData.date = new Date(year, 0, 1)
                  return yearData
                })
              })
            })

            // create svg with range bands based on the trellis names
            // eslint-disable-next-line new-cap
            const chart = new atlascharts.trellisline()
            chart.render(dataByDecile, '#drug_trellisLinePlot', 1000, 300, {
              trellisSet: allDeciles,
              trellisLabel: 'Age Decile',
              seriesLabel: 'Year of Observation',
              yLabel: 'Prevalence Per 1000 People',
              xFormat: d3.timeFormat('%m/%Y'),
              yFormat: d3.format('0.2f'),
              tickPadding: 20,
              colors: d3.scaleOrdinal()
                .domain(['MALE', 'FEMALE', 'UNKNOWN',])
                .range(['#1F78B4', '#FB9A99', '#33A02C'])
            })
          }
        }
      })
    }

    this.conditionEraDrilldown = (conceptId, conceptName) => {
      this.loadingReportDrilldown(true)
      this.activeReportDrilldown(false)

      $.ajax({
        type: 'GET',
        url: this.config.api.url + 'cohortresults/' + this.reportSourceKey() + '/' + this.reportCohortDefinitionId() + '/conditionera/' + conceptId + '?refresh=' + this.refresh(),
        success: (data) => {
          this.activeReportDrilldown(true)
          this.loadingReportDrilldown(false)

          $('#conditionEraDrilldown')
            .html(conceptName + ' Drilldown Report')

          this.boxplotHelper(data.ageAtFirstDiagnosis, '#conditioneras_age_at_first_diagnosis', 500, 300, 'Gender', 'Age at First Diagnosis')
          this.boxplotHelper(data.lengthOfEra, '#conditioneras_length_of_era', 500, 300, '', 'Days')

          // prevalence by month
          const byMonth = ChartUtils.normalizeArray(data.prevalenceByMonth, true)
          if (!byMonth.empty) {
            const byMonthSeries = this.mapMonthYearDataToSeries(byMonth, {
              dateField: 'xCalendarMonth',
              yValue: 'yPrevalence1000Pp',
              yPercent: 'yPrevalence1000Pp'
            })

            d3.selectAll('#conditioneraPrevalenceByMonth svg')
              .remove()
            // eslint-disable-next-line new-cap
            const prevalenceByMonth = new atlascharts.line()
            const size = this.breakpoints.guessFromNode('#conditioneraPrevalenceByMonth')
            prevalenceByMonth.render(byMonthSeries, '#conditioneraPrevalenceByMonth', size.width, this.breakpoints.wide.height, {
              xScale: d3.scaleTime()
                .domain(d3.extent(byMonthSeries[0].values, function (d) {
                  return d.xValue
                })),
              xFormat: d3.timeFormat('%m/%Y'),
              tickFormat: d3.timeFormat('%m/%Y'),
              xLabel: 'Date',
              yLabel: 'Prevalence per 1000 People'
            })
          }

          // render trellis
          const trellisData = ChartUtils.normalizeArray(data.prevalenceByGenderAgeYear, true)
          if (!trellisData.empty) {
            const allDeciles = ['0-9', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80-89', '90-99']
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
              Object.keys(container)
                .forEach(function (p) {
                  item[p] = container[p][i]
                })
              return item
            }, trellisData)

            const dataByDecile = nestByDecile(normalizedSeries)
            // fill in gaps
            const yearRange = d3.range(minYear, maxYear, 1)

            dataByDecile.forEach(function (trellis) {
              trellis.values.forEach(function (series) {
                series.values = yearRange.map(function (year) {
                  const yearData = series.values.filter(function (f) {
                    return f.xCalendarYear === year
                  })[0] || seriesInitializer(trellis.key, series.key, year, 0)
                  yearData.date = new Date(year, 0, 1)
                  return yearData
                })
              })
            })

            // create svg with range bands based on the trellis names
            // eslint-disable-next-line new-cap
            const chart = new atlascharts.trellisline()
            const size = this.breakpoints.guessFromNode('#conditionera_trellisLinePlot')
            chart.render(dataByDecile, '#conditionera_trellisLinePlot', size.width, this.breakpoints.wide.height, {
              trellisSet: allDeciles,
              trellisLabel: 'Age Decile',
              seriesLabel: 'Year of Observation',
              yLabel: 'Prevalence Per 1000 People',
              xFormat: d3.timeFormat('%m/%Y'),
              yFormat: d3.format('0.2f'),
              colors: d3.scaleOrdinal()
                .domain(['MALE', 'FEMALE', 'UNKNOWN'])
                .range(['#1F78B4', '#FB9A99', '#33A02C']),
              ...this.chartOptions,
            })
          }
        }
      })
    }

    this.drugeraDrilldown = (conceptId, conceptName) => {
      this.activeReportDrilldown(false)
      this.loadingReportDrilldown(true)

      $.ajax({
        type: 'GET',
        url: this.config.api.url + 'cohortresults/' + this.reportSourceKey() + '/' + this.reportCohortDefinitionId() + '/drugera/' + conceptId + '?refresh=' + this.refresh(),
        success: (data) => {
          this.activeReportDrilldown(true)
          this.loadingReportDrilldown(false)

          $('#drugeraDrilldown')
            .html(conceptName + ' Drilldown Report')

          // age at first exposure visualization
          this.boxplotHelper(data.ageAtFirstExposure, '#drugeras_age_at_first_exposure', 500, 200, 'Gender', 'Age at First Exposure')
          this.boxplotHelper(data.lengthOfEra, '#drugeras_length_of_era', 500, 200, '', 'Days')

          // prevalence by month
          const byMonth = ChartUtils.normalizeArray(data.prevalenceByMonth, true)
          if (!byMonth.empty) {
            const byMonthSeries = this.mapMonthYearDataToSeries(byMonth, {
              dateField: 'xCalendarMonth',
              yValue: 'yPrevalence1000Pp',
              yPercent: 'yPrevalence1000Pp'
            })

            d3.selectAll('#drugeraPrevalenceByMonth svg')
              .remove()
            // eslint-disable-next-line new-cap
            const prevalenceByMonth = new atlascharts.line()
            const size = this.breakpoints.guessFromNode('#drugeraPrevalenceByMonth')
            prevalenceByMonth.render(byMonthSeries, '#drugeraPrevalenceByMonth', size.width, this.breakpoints.wide.height, {
              xScale: d3.scaleTime()
                .domain(d3.extent(byMonthSeries[0].values, function (d) {
                  return d.xValue
                })),
              xFormat: d3.timeFormat('%m/%Y'),
              tickFormat: d3.timeFormat('%m/%Y'),
              xLabel: 'Date',
              yLabel: 'Prevalence per 1000 People',
              ...this.chartOptions
            })
          }

          // render trellis
          const trellisData = ChartUtils.normalizeArray(data.prevalenceByGenderAgeYear, true)
          if (!trellisData.empty) {
            const allDeciles = ['0-9', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80-89', '90-99']
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
              Object.keys(container)
                .forEach(function (p) {
                  item[p] = container[p][i]
                })
              return item
            }, trellisData)

            const dataByDecile = nestByDecile(normalizedSeries)
            // fill in gaps
            const yearRange = d3.range(minYear, maxYear, 1)

            dataByDecile.forEach(function (trellis) {
              trellis.values.forEach(function (series) {
                series.values = yearRange.map(function (year) {
                  const yearData = series.values.filter(function (f) {
                    return f.xCalendarYear === year
                  })[0] || seriesInitializer(trellis.key, series.key, year, 0)
                  yearData.date = new Date(year, 0, 1)
                  return yearData
                })
              })
            })

            // create svg with range bands based on the trellis names
            // eslint-disable-next-line new-cap
            const chart = new atlascharts.trellisline()
            const size = this.breakpoints.guessFromNode('#drugera_trellisLinePlot')
            chart.render(dataByDecile, '#drugera_trellisLinePlot', size.width, this.breakpoints.wide.height, {
              trellisSet: allDeciles,
              trellisLabel: 'Age Decile',
              seriesLabel: 'Year of Observation',
              yLabel: 'Prevalence Per 1000 People',
              xFormat: d3.timeFormat('%m/%Y'),
              yFormat: d3.format('0.2f'),
              colors: d3.scaleOrdinal()
                .domain(['MALE', 'FEMALE', 'UNKNOWN'])
                .range(['#1F78B4', '#FB9A99', '#33A02C']),
              ...this.chartOptions,
            })
          }
        }
      })
    }

    this.procedureDrilldown = (conceptId, conceptName) => {
      this.activeReportDrilldown(false)
      this.loadingReportDrilldown(true)

      $.ajax({
        type: 'GET',
        url: this.config.api.url + 'cohortresults/' + this.reportSourceKey() + '/' + this.reportCohortDefinitionId() + '/procedure/' + conceptId + '?refresh=' + this.refresh(),
        success: (data) => {
          this.activeReportDrilldown(true)
          this.loadingReportDrilldown(false)
          $('#procedureDrilldown')
            .text(conceptName + ' Drilldown Report')

          // age at first diagnosis visualization
          // eslint-disable-next-line new-cap
          const boxplot = new atlascharts.boxplot()
          const bpseries = []
          const bpdata = ChartUtils.normalizeArray(data.ageAtFirstOccurrence)
          if (!bpdata.empty) {
            for (let i = 0; i < bpdata.category.length; i++) {
              bpseries.push({
                Category: bpdata.category[i],
                min: bpdata.minValue[i],
                max: bpdata.maxValue[i],
                median: bpdata.medianValue[i],
                LIF: bpdata.p10Value[i],
                q1: bpdata.p25Value[i],
                q3: bpdata.p75Value[i],
                UIF: bpdata.p90Value[i]
              })
            }
            const size = this.breakpoints.guessFromNode('#ageAtFirstOccurrence')
            boxplot.render(bpseries, '#ageAtFirstOccurrence', size.width, this.breakpoints.wide.height, {
              yMax: d3.max(bpdata.p90Value),
              yFormat: d3.format(',.1s'),
              xLabel: 'Gender',
              yLabel: 'Age at First Occurrence',
              ...this.chartOptions,
            })
          }

          // prevalence by month
          const prevData = ChartUtils.normalizeArray(data.prevalenceByMonth)
          if (!prevData.empty) {
            const byMonthSeries = this.mapMonthYearDataToSeries(prevData, {
              dateField: 'xCalendarMonth',
              yValue: 'yPrevalence1000Pp',
              yPercent: 'yPrevalence1000Pp'
            })

            // eslint-disable-next-line new-cap
            const prevalenceByMonth = new atlascharts.line()
            prevalenceByMonth.render(byMonthSeries, '#procedurePrevalenceByMonth', 1000, 300, {
              xScale: d3.scaleTime()
                .domain(d3.extent(byMonthSeries[0].values, function (d) {
                  return d.xValue
                })),
              xFormat: d3.timeFormat('%m/%Y'),
              tickFormat: d3.timeFormat('%m/%Y'),
              xLabel: 'Date',
              yLabel: 'Prevalence per 1000 People'
            })
          }

          // procedure type visualization
          if (data.proceduresByType && data.proceduresByType.length > 0) {
            // eslint-disable-next-line new-cap
            const donut = new atlascharts.donut()
            donut.render(this.mapConceptData(data.proceduresByType), '#proceduresByType', size12.width, size12.height, {
              margin: {
                top: 5,
                left: 5,
                right: 200,
                bottom: 5
              }
            })
          }

          // render trellis
          const trellisData = ChartUtils.normalizeArray(data.prevalenceByGenderAgeYear)
          if (!trellisData.empty) {
            const allDeciles = ['0-9', '10-19', '20-29', '30-39', '40-49', '50-59', '60-69', '70-79', '80-89', '90-99']
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
              Object.keys(container)
                .forEach(function (p) {
                  item[p] = container[p][i]
                })
              return item
            }, trellisData)

            const dataByDecile = nestByDecile(normalizedSeries)
            // fill in gaps
            const yearRange = d3.range(minYear, maxYear, 1)

            dataByDecile.forEach(function (trellis) {
              trellis.values.forEach(function (series) {
                series.values = yearRange.map(function (year) {
                  const yearData = series.values.filter(function (f) {
                    return f.xCalendarYear === year
                  })[0] || seriesInitializer(trellis.key, series.key, year, 0)
                  yearData.date = new Date(year, 0, 1)
                  return yearData
                })
              })
            })

            // create svg with range bands based on the trellis names
            // eslint-disable-next-line new-cap
            const chart = new atlascharts.trellisline()
            const size = this.breakpoints.guessFromNode('#procedure_trellisLinePlot')
            chart.render(dataByDecile, '#procedure_trellisLinePlot', size.width, this.breakpoints.wide.height, {
              trellisSet: allDeciles,
              trellisLabel: 'Age Decile',
              seriesLabel: 'Year of Observation',
              yLabel: 'Prevalence Per 1000 People',
              xFormat: d3.timeFormat('%m/%Y'),
              yFormat: d3.format('0.2f'),
              tickPadding: 20,
              colors: d3.scaleOrdinal()
                .domain(['MALE', 'FEMALE', 'UNKNOWN'])
                .range(['#1F78B4', '#FB9A99', '#33A02C']),
              ...this.chartOptions,
            })
          }
        }
      })
    }

    this.handleGenericRowClick = (event, drilldownType, tableId) => {
      const dataTable = $(`#${tableId}`).DataTable()
      const rowIndex = event.target._DT_CellIndex.row
      const rowData = dataTable.row(rowIndex).data()

      this.drilldown(rowData.conceptId, rowData.name, drilldownType)
    }

    this.drilldown = (id, name, type) => {
      this.activeReportDrilldown(false)
      this.loadingReportDrilldown(true)

      $.ajax({
        type: 'GET',
        url: this.config.api.url + 'cohortresults/' + this.reportSourceKey() + '/' + this.reportCohortDefinitionId() + '/cohortspecific' + type + '/' + id + '?refresh=' + this.refresh(),
        contentType: 'application/json; charset=utf-8'
      })
        .done((result) => {
          this.activeReportDrilldown(true)
          this.loadingReportDrilldown(false)
          if (result && result.length > 0) {
            $('#' + type + 'DrilldownScatterplot')
              .empty()
            const normalized = this.dataframeToArray(ChartUtils.normalizeArray(result))

            // nest dataframe data into key->values pair
            const totalRecordsData = nestEntries(normalized, [(d) => d.recordType])
              .map(function (d) {
                return {
                  name: d.key,
                  values: d.values
                }
              })

            // eslint-disable-next-line new-cap
            const scatter = new atlascharts.scatterplot()
            $('#' + type + 'DrilldownScatterplotHeading').html(name)

            scatter.render(totalRecordsData, '#' + type + 'DrilldownScatterplot', 460, 150, {
              yFormat: d3.format('0.2%'),
              xValue: 'duration',
              yValue: 'pctPersons',
              xLabel: 'Duration Relative to Index',
              yLabel: '% Persons',
              seriesName: 'recordType',
              showLegend: false,
              colors: d3.schemeCategory10,
              tooltips: [{
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
        })
    }

    this.eraBuildHierarchyFromJSON = function (data, threshold) {
      let total = 0

      const root = {
        name: 'root',
        children: []
      }

      for (let i = 0; i < data.percentPersons.length; i++) {
        total += data.percentPersons[i]
      }

      for (let i = 0; i < data.conceptPath.length; i++) {
        const parts = data.conceptPath[i].split('||')
        let currentNode = root
        for (let j = 0; j < parts.length; j++) {
          const children = currentNode.children
          const nodeName = parts[j]
          let childNode
          if (j + 1 < parts.length) {
            // Not yet at the end of the path; move down the tree.
            let foundChild = false
            for (let k = 0; k < children.length; k++) {
              if (children[k].name === nodeName) {
                childNode = children[k]
                foundChild = true
                break
              }
            }

            if (!foundChild) {
              childNode = {
                name: nodeName,
                children: []
              }
              children.push(childNode)
            }
            currentNode = childNode
          } else {
            // Reached the end of the path; create a leaf node.
            childNode = {
              name: nodeName,
              num_persons: data.numPersons[i],
              id: data.conceptId[i],
              path: data.conceptPath[i],
              pct_persons: data.percentPersons[i],
              length_of_era: data.lengthOfEra[i]
            }

            if ((data.percentPersons[i] / total) > threshold) {
              children.push(childNode)
            }
          }
        }
      }
      return root
    }

    // common functions

    this.buildHierarchyFromJSON = function (data, threshold) {
      let total = 0

      const root = {
        name: 'root',
        children: []
      }

      for (let i = 0; i < data.percentPersons.length; i++) {
        total += data.percentPersons[i]
      }

      for (let i = 0; i < data.conceptPath.length; i++) {
        const parts = data.conceptPath[i].split('||')
        let currentNode = root
        for (let j = 0; j < parts.length; j++) {
          const children = currentNode.children
          const nodeName = parts[j]
          let childNode
          if (j + 1 < parts.length) {
            // Not yet at the end of the path; move down the tree.
            let foundChild = false
            for (let k = 0; k < children.length; k++) {
              if (children[k].name === nodeName) {
                childNode = children[k]
                foundChild = true
                break
              }
            }
            // If we don't already have a child node for this branch, create it.
            if (!foundChild) {
              childNode = {
                name: nodeName,
                children: []
              }
              children.push(childNode)
            }
            currentNode = childNode
          } else {
            // Reached the end of the path; create a leaf node.
            childNode = {
              name: nodeName,
              num_persons: data.numPersons[i],
              id: data.conceptId[i],
              path: data.conceptPath[i],
              pct_persons: data.percentPersons[i],
              records_per_person: data.recordsPerPerson[i],
              relative_risk: data.logRRAfterBefore[i],
              pct_persons_after: data.percentPersonsAfter[i],
              pct_persons_before: data.percentPersonsBefore[i],
              risk_difference: data.riskDiffAfterBefore[i]
            }

            if ((data.percentPersons[i] / total) > threshold) {
              children.push(childNode)
            }
          }
        }
      }
      return root
    }

    this.mapConceptData = function (data) {
      let result

      if (data instanceof Array) {
        result = []
        $.each(data, function () {
          const datum = {}
          datum.id = (+this.conceptId || this.conceptName)
          datum.label = this.conceptName
          datum.value = +this.countValue
          result.push(datum)
        })
      } else if (data.countValue instanceof Array) { // multiple rows, each value of each column is in the indexed properties.
        result = data.countValue.map(function (d, i) {
          const datum = {}
          datum.id = (this.conceptId || this.conceptName)[i]
          datum.label = this.conceptName[i]
          datum.value = this.countValue[i]
          return datum
        }, data)
      } else { // the dataset is a single value result, so the properties are not arrays.
        result = [{
          id: data.conceptId,
          label: data.conceptName,
          value: data.countValue
        }]
      }

      result = result.sort(function (a, b) {
        return b.label < a.label ? 1 : -1
      })

      return result
    }

    this.map30DayDataToSeries = function (data, opts) {
      const defaults = {
        dateField: 'x',
        yValue: 'y',
        yPercent: 'p'
      }

      const options = $.extend({}, defaults, opts)

      const series = {}
      series.name = 'All Time'
      series.values = []
      if (data && !data.empty) {
        for (let i = 0; i < data[options.dateField].length; i++) {
          series.values.push({
            xValue: data[options.dateField][i],
            yValue: data[options.yValue][i],
            yPercent: data[options.yPercent][i]
          })
        }
        series.values.sort(function (a, b) {
          return a.xValue - b.xValue
        })
      }
      return [series] // return series wrapped in an array
    }

    this.mapMonthYearDataToSeries = function (data, opts) { // copy paste from chartutils
      const defaults = {
        dateField: 'x',
        yValue: 'y',
        yPercent: 'p'
      }

      const options = $.extend({}, defaults, opts)

      const series = {}
      series.name = 'All Time'
      series.values = []
      if (data && !data.empty) {
        for (let i = 0; i < data[options.dateField].length; i++) {
          series.values.push({
            xValue: new Date(Math.floor(data[options.dateField][i] / 100), (data[options.dateField][i] % 100) - 1, 1),
            yValue: data[options.yValue][i],
            yPercent: data[options.yPercent][i]
          })
        }
        series.values.sort(function (a, b) {
          return a.xValue - b.xValue
        })
      }
      return [series] // return series wrapped in an array
    }

    this.mapDateDataToSeries = function (data, opts) {
      const defaults = {
        dateField: 'x',
        yValue: 'y',
        yPercent: 'p'
      }

      const options = $.extend({}, defaults, opts)

      const series = {}
      series.name = 'All Time'
      series.values = []
      if (data && !data.empty) {
        for (let i = 0; i < data[options.dateField].length; i++) {
          series.values.push({
            xValue: new Date(new Date(data[options.dateField][i]).getTime() + (new Date().getTimezoneOffset() + 60) * 60000), // offset timezone for date of "yyyy-mm-dd"
            yValue: data[options.yValue][i],
            yPercent: data[options.yPercent][i]
          })
        }
        series.values.sort(function (a, b) {
          return a.xValue - b.xValue
        })
      }
      return [series] // return series wrapped in an array
    }

    this.mapMonthYearDataToSeriesByYear = function (data, opts) {
      // map data in the format yyyymm into a series for each year, and a value for each month index (1-12)
      const defaults = {
        dateField: 'x',
        yValue: 'y',
        yPercent: 'p'
      }

      const options = $.extend({}, defaults, opts)

      // this function takes month/year histogram data from Achilles and converts it into a multi-series line plot
      const series = []
      const seriesMap = {}

      for (let i = 0; i < data[options.dateField].length; i++) {
        let targetSeries = seriesMap[Math.floor(data[options.dateField][i] / 100)]
        if (!targetSeries) {
          targetSeries = {
            name: (Math.floor(data[options.dateField][i] / 100)),
            values: []
          }
          seriesMap[targetSeries.name] = targetSeries
          series.push(targetSeries)
        }
        targetSeries.values.push({
          xValue: data[options.dateField][i] % 100,
          yValue: data[options.yValue][i],
          yPercent: data[options.yPercent][i]
        })
      }
      series.forEach(function (d) {
        d.values.sort(function (a, b) {
          return a.xValue - b.xValue
        })
      })
      return series
    }

    this.dataframeToArray = function (dataframe) {
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

    this.boxplotHelper = function (data, target, width, height, xlabel, ylabel) {
      // eslint-disable-next-line new-cap
      const boxplot = new atlascharts.boxplot()
      let yMax = 0
      const bpseries = []
      data = ChartUtils.normalizeArray(data)
      if (!data.empty) {
        const bpdata = atlascharts.chart.normalizeDataframe(data)

        for (let i = 0; i < bpdata.category.length; i++) {
          bpseries.push({
            Category: bpdata.category[i],
            min: bpdata.minValue[i],
            max: bpdata.maxValue[i],
            median: bpdata.medianValue[i],
            LIF: bpdata.p10Value[i],
            q1: bpdata.p25Value[i],
            q3: bpdata.p75Value[i],
            UIF: bpdata.p90Value[i]
          })
          yMax = Math.max(yMax, bpdata.p90Value[i])
        }
        const size = this.breakpoints.guessFromNode(target)
        boxplot.render(bpseries, target, size.width, this.breakpoints.wide.height, {
          yMax,
          yFormat: d3.format(',.1s'),
          xLabel: xlabel,
          yLabel: ylabel,
          ...this.chartOptions,
        })
      }
    }

    this.handleDrugTableClick = (data, context, event) => {
      const dataTable = $('#drug_table')
        .DataTable()
      const rowIndex = event.target._DT_CellIndex.row
      const rowData = dataTable.row(rowIndex)
        .data()

      this.drugExposureDrilldown(rowData.conceptId, rowData.rxnorm)
    }

    this.handleProcedureTableClick = (data, context, event) => {
      const dataTable = $('#procedure_table')
        .DataTable()
      const rowIndex = event.target._DT_CellIndex.row
      const rowData = dataTable.row(rowIndex)
        .data()

      this.procedureDrilldown(rowData.conceptId, rowData.procedure_name)
    }

    this.handleDrugEraTableClick = (data, context, event) => {
      const dataTable = $('#drugera_table')
        .DataTable()
      const rowIndex = event.target._DT_CellIndex.row
      const rowData = dataTable.row(rowIndex)
        .data()

      this.drugeraDrilldown(rowData.conceptId, rowData.ingredient)
    }

    this.handleConditionTableClick = (data, context, event) => {
      const dataTable = $('#condition_table')
        .DataTable()
      const rowIndex = event.target._DT_CellIndex.row
      const rowData = dataTable.row(rowIndex)
        .data()

      this.conditionDrilldown(rowData.conceptId, rowData.snomed)
    }

    this.handleConditionEraTableClick = (data, context, event) => {
      const dataTable = $('#conditionera_table')
        .DataTable()
      const rowIndex = event.target._DT_CellIndex.row
      const rowData = dataTable.row(rowIndex)
        .data()

      this.conditionEraDrilldown(rowData.conceptId, rowData.snomed)
    }

    this.subscriptions.push(
      this.reportTriggerRun.subscribe((newValue) => {
        if (newValue) {
          this.runReport()
        }
      })
    )
  }

  export (data, el) {
    const svg = el.target.closest('.chartContainer').querySelector('svg')
    const chartName = el.target.closest('.chartContainer').querySelector('.evidenceVisualization').getAttribute('id')
    const fileName = chartName ? `${this.reportReportName()}_${chartName}` : `${this.reportReportName()}`
    ChartUtils.downloadSvgAsPng(svg, fileName || 'untitled.png')
  }

  exportSvg (data, el) {
    const svg = el.target.closest('.chartContainer').querySelector('svg')
    const chartName = el.target.closest('.chartContainer').querySelector('.evidenceVisualization').getAttribute('id')
    const fileName = chartName ? `${this.reportReportName()}_${chartName}.svg` : `${this.reportReportName()}.svg`
    ChartUtils.downloadSvg(svg, fileName || 'untitled.svg')
  }

  dispose () {
    super.dispose()
  }
}

export default commonUtils.build('report-manager', ReportManager, view)
