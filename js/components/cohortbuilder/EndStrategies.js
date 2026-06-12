define(function (require, exports) {
  const DateOffset = require('./EndStrategies/DateOffsetStrategy')
  const CustomEra = require('./EndStrategies/CustomEraStrategy')

  function GetStrategyFromObject (data, conceptSets) {
    let result

    if (data.hasOwnProperty('DateOffset')) {
      return {
        DateOffset: new exports.DateOffset(data.DateOffset, conceptSets)
      }
    } else if (data.hasOwnProperty('CustomEra')) {
      return {
        CustomEra: new exports.CustomEra(data.CustomEra, conceptSets)
      }
    };
  }

  exports.DateOffset = DateOffset
  exports.CustomEra = CustomEra

  exports.GetStrategyFromObject = GetStrategyFromObject
})
