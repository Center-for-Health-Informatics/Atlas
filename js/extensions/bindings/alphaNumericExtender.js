import ko from 'knockout'
import './regexpExtender'

ko.extenders.alphaNumeric = (target) => ko.extenders.regexp(target, { pattern: '^[a-zA-Z0-9.]+$', allowEmpty: true })
