// AdditoinalCriteria.js - a wrapper for criteria that is used as Additional Criteria
import ko from 'knockout'
import * as CriteriaTypes from './CriteriaTypes'

function PrimaryCriteria (data, conceptSets) {
  const self = this

  data = data || {}
  self.CriteriaList = ko.observableArray(data.CriteriaList && data.CriteriaList.map(function (d) {
    return CriteriaTypes.GetCriteriaFromObject(d, conceptSets)
  }))

  self.ObservationWindow = {
    PriorDays: ko.observable((data.ObservationWindow && data.ObservationWindow.PriorDays) || 0),
    PostDays: ko.observable((data.ObservationWindow && data.ObservationWindow.PostDays) || 0)
  }

  self.PrimaryCriteriaLimit = { Type: ko.observable((data.PrimaryCriteriaLimit && data.PrimaryCriteriaLimit.Type) || 'First') }
}

export default PrimaryCriteria
