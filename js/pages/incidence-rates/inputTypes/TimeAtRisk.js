import FieldOffset from './FieldOffset'

function TimeAtRisk (data) {
  const self = this
  data = data || {}

  self.start = new FieldOffset(data.start, 'StartDate')
  self.end = new FieldOffset(data.end, 'EndDate')
}

export default TimeAtRisk
