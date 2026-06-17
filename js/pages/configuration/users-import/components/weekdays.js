import ko from 'knockout'
import view from './weekdays.html?raw'
import AutoBind from 'utils/AutoBind'
import Component from 'components/Component'
import commonUtils from 'utils/CommonUtils'
import Consts from './const'
import './weekdays.less'

class Weekdays extends AutoBind(Component) {
  constructor (params) {
    super(params)

    this.labelFormat = params.labelFormat || 'short'
    this.weekdays = Consts.WEEKDAYS.map(d => ({ ...d, label: d[this.labelFormat] }))
    this.selectedWeekdays = params.weekdays || ko.observableArray([])
  }

  onDayClick (day) {
    if (this.selectedWeekdays().find(d => d === day)) {
      this.selectedWeekdays.remove(day)
    } else {
      this.selectedWeekdays.push(day)
    }
  }

  dayModifier (day) {
    return this.selectedWeekdays().find(d => d === day) ? 'selected' : null
  }

  buttonClass (day) {
    return ko.computed(() => {
      const params = {
        element: 'button',
        extra: 'btn',
      }
      const mod = this.dayModifier(day)
      if (mod) {
        params.modifiers = mod
      }
      return this.classes(params)
    })
  }
}

commonUtils.build('weekdays', Weekdays, view)
