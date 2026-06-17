import ko from 'knockout'
import generateComponent from './components/GenerateComponent'
import conceptSetBrowser from './components/ConceptSetBrowser'

ko.components.register('generate-component', generateComponent)

ko.components.register('concept-set-browser', conceptSetBrowser)
