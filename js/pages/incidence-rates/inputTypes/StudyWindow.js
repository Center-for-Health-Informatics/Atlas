import ko from 'knockout'

function StudyWindow (data) {
  const self = this
  data = data || {}

  self.startDate = ko.observable(data.startDate)
  self.endDate = ko.observable(data.endDate)
}

StudyWindow.prototype.toJSON = function () {
  return {
    startDate: this.startDate instanceof Date ? (this.startDate.toISOString().slice(0, 10)) : this.startDate,
    endDate: this.endDate instanceof Date ? (this.endDate.toISOString().slice(0, 10)) : this.endDate
  }
}
export default StudyWindow
