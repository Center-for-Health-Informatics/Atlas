import DateOffset from './EndStrategies/DateOffsetStrategy'
import CustomEra from './EndStrategies/CustomEraStrategy'

function GetStrategyFromObject (data, conceptSets) {
  if (data.hasOwnProperty('DateOffset')) {
    return { DateOffset: new DateOffset(data.DateOffset, conceptSets) }
  } else if (data.hasOwnProperty('CustomEra')) {
    return { CustomEra: new CustomEra(data.CustomEra, conceptSets) }
  }
}

export { GetStrategyFromObject, DateOffset, CustomEra }
export default { GetStrategyFromObject, DateOffset, CustomEra }
