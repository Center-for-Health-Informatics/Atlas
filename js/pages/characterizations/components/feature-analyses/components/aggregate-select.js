import ko from 'knockout'
import view from './aggregate-select.html?raw'
import Component from 'components/Component'
import AutoBind from 'utils/AutoBind'
import commonUtils from 'utils/CommonUtils'
import lodash from 'lodash'
import FeatureAnalysisService from '../../../services/FeatureAnalysisService'
import consts from '../const'
import './aggregate-select.less'

const CriteriaDomains = [
  {
    type: 'Measurement',
    domains: ['MEASUREMENT']
  },
  {
    type: 'DrugEra',
    domains: ['DRUG_ERA']
  },
  {
    type: 'DrugExposure',
    domains: ['DRUG']
  },
  {
    type: 'VisitOccurrence',
    domains: ['VISIT']
  },
  {
    type: 'ProcedureOccurrence',
    domains: ['PROCEDURE']
  },
  {
    type: 'Observation',
    domains: ['OBSERVATION']
  },
  {
    type: 'ConditionEra',
    domains: ['CONDITION_ERA']
  },
  {
    type: 'ConditionOccurrence',
    domains: ['CONDITION']
  }
]

class AggregateSelector extends AutoBind(Component) {
  constructor (params) {
    super(params)
    this.criteria = params.criteria
    this.aggregate = params.currentAggregate || ko.observable()
    this.aggregates = ko.computed(() => ((params.aggregates && params.aggregates()) || [])
      .filter(a => a.value === consts.ANY_DOMAIN || this.criteria.criteriaType === 'DemographicCriteria' ||
			this.getCriteriaDomains(this.criteria).find(d => d === a.value)))
    this.domains = params.domains
  }

  selectAggregate (item) {
    this.aggregate(item)
  }

  getCriteriaDomains (criteria) {
    if (criteria.criteriaType === 'WindowedCriteria') {
      return CriteriaDomains.filter(d => criteria.expression().Criteria.hasOwnProperty(d.type)).flatMap(d => d.domains) || []
    }
    return []
  }
}

export default commonUtils.build('aggregate-select', AggregateSelector, view)

