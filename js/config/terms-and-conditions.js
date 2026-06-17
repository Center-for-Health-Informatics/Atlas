import contentEn from './terms-and-conditions-content-en.html?raw'
import contentRu from './terms-and-conditions-content-ru.html?raw'
import contentKo from './terms-and-conditions-content-ko.html?raw'
import contentZh from './terms-and-conditions-content-zh.html?raw'
import './terms-and-conditions.less'

const termsAndConditions = {
  contents: {
    en: contentEn,
    ru: contentRu,
    ko: contentKo,
    zh: contentZh
  },
  acceptanceExpiresInDays: 30
}

export default {
  termsAndConditions
}

