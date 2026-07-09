import ko from 'knockout'
import { first } from 'utils/NativeCompat'

const periods = [
  {
    label: ko.i18n('options.ww', 'Weekly'),
    value: 'ww',
  },
  {
    label: ko.i18n('options.mm', 'Monthly'),
    value: 'mm',
  },
  {
    label: ko.i18n('options.qq', 'Quarterly'),
    value: 'qq',
  },
  {
    label: ko.i18n('options.yy', 'Yearly'),
    value: 'yy',
  },
]

const importTabModes = {
  identifiers: 'identifiers',
  sourcecodes: 'sourcecodes',
  conceptset: 'conceptset',
}
const conceptSetTabModes = {
  details: 'details',
  included: 'included',
  import: 'import',
  sourcecodes: 'included-sourcecodes',
  export: 'export',
}

const paths = {
  details: id => `/cohortdefinition/${id}`,
  downloadShiny: (id, sourceKey) => `shiny/download/cohort/${id}/${sourceKey}`,
  publishShiny: (id, sourceKey) => `shiny/publish/cohort/${id}/${sourceKey}`,
}

const getPeriodTypeFilter = (chosenPeriods) => ({
  type: 'select',
  label: ko.i18n('options.periodType', 'Period type'),
  name: 'periodType',
  options: ko.observableArray(periods.filter(p => chosenPeriods.includes(p.value))),
  selectedValue: ko.observable(first(chosenPeriods)),
})

const windowType = {
  baseline: 'baseline',
  atrisk: 'atrisk',
}

const visitStat = {
  occurrence: 'occurrence',
  visitdate: 'visitdate',
  caresitedate: 'caresitedate',
}

const rollups = [
  {
    label: ko.i18n('options.rollupUtilizationVisit', 'Visits'),
    value: 'rollupUtilizationVisit',
  },
  {
    label: ko.i18n('options.rollupUtilizationDrug', 'Drugs'),
    value: 'rollupUtilizationDrug',
  },
]

export { importTabModes, conceptSetTabModes, paths, windowType, visitStat, getPeriodTypeFilter, periods, rollups }
export default { importTabModes, conceptSetTabModes, paths, windowType, visitStat, getPeriodTypeFilter, periods, rollups }
