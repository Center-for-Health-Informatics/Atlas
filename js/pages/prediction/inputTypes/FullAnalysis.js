import TargetOutcome from './TargetOutcome'
import ModelCovarPopTuple from './ModelCovarPopTuple'

class FullAnalysis {
  constructor (targetOutcome, modelCovarPopTuple) {
    if (!(targetOutcome instanceof TargetOutcome)) {
      targetOutcome = new TargetOutcome(targetOutcome)
    }
    if (!(modelCovarPopTuple instanceof ModelCovarPopTuple)) {
      modelCovarPopTuple = new ModelCovarPopTuple(modelCovarPopTuple)
    }

    this.targetOutcome = targetOutcome || null
    this.modelCovarPopTuple = modelCovarPopTuple || null
  }
}

export default FullAnalysis
