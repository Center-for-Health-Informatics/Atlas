import DateOffset from './EndStrategies/DateOffsetStrategy'
import CustomEra from './EndStrategies/CustomEraStrategy'

function GetStrategyFromObject (data, conceptSets) {
  if (Object.prototype.hasOwnProperty.call(data, 'DateOffset')) {
    return { DateOffset: new DateOffset(data.DateOffset, conceptSets) }
  } else if (Object.prototype.hasOwnProperty.call(data, 'CustomEra')) {
    return { CustomEra: new CustomEra(data.CustomEra, conceptSets) }
  }
}

export { GetStrategyFromObject, DateOffset, CustomEra }
export default { GetStrategyFromObject, DateOffset, CustomEra }
