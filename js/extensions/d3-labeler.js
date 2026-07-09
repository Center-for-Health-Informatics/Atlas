export function labeler () {
  let lab = []
  let anc = []
  let w = 1 // box width
  let h = 1 // box width
  const labeler = {}

  const maxMove = 5.0
  const maxAngle = 0.5

  // weights
  const wLen = 0.2 // leader line length
  const wInter = 1.0 // leader line intersection
  const wLab2 = 30.0 // label-label overlap
  const wLabAnc = 30.0 // label-anchor overlap
  const wOrient = 3.0 // orientation bias

  // booleans for user defined functions
  let userEnergy = false

  let userDefinedEnergy

  const energy = function (index) {
    // energy function, tailored for label placement

    const m = lab.length
    let ener = 0
    let dx = lab[index].x - anc[index].x
    let dy = anc[index].y - lab[index].y
    const dist = Math.sqrt(dx * dx + dy * dy)
    let overlap = true

    // penalty for length of leader line
    if (dist > 0) ener += dist * wLen

    // label orientation bias
    dx /= dist
    dy /= dist
    if (dx > 0 && dy > 0) { ener += 0 * wOrient } else if (dx < 0 && dy > 0) { ener += 1 * wOrient } else if (dx < 0 && dy < 0) { ener += 2 * wOrient } else { ener += 3 * wOrient }

    const x21 = lab[index].x
    const y21 = lab[index].y - lab[index].height + 2.0
    const x22 = lab[index].x + lab[index].width
    const y22 = lab[index].y + 2.0
    let x11, x12, y11, y12, xOverlap, yOverlap, overlapArea

    for (let i = 0; i < m; i++) {
      if (i !== index) {
        // penalty for intersection of leader lines
        overlap = intersect(anc[index].x, lab[index].x, anc[i].x, lab[i].x,
          anc[index].y, lab[index].y, anc[i].y, lab[i].y)
        if (overlap) ener += wInter

        // penalty for label-label overlap
        x11 = lab[i].x
        y11 = lab[i].y - lab[i].height + 2.0
        x12 = lab[i].x + lab[i].width
        y12 = lab[i].y + 2.0
        xOverlap = Math.max(0, Math.min(x12, x22) - Math.max(x11, x21))
        yOverlap = Math.max(0, Math.min(y12, y22) - Math.max(y11, y21))
        overlapArea = xOverlap * yOverlap
        ener += (overlapArea * wLab2)
      }

      // penalty for label-anchor overlap
      x11 = anc[i].x - anc[i].r
      y11 = anc[i].y - anc[i].r
      x12 = anc[i].x + anc[i].r
      y12 = anc[i].y + anc[i].r
      xOverlap = Math.max(0, Math.min(x12, x22) - Math.max(x11, x21))
      yOverlap = Math.max(0, Math.min(y12, y22) - Math.max(y11, y21))
      overlapArea = xOverlap * yOverlap
      ener += (overlapArea * wLabAnc)
    }
    return ener
  }

  const mcmove = function (currT) {
    // Monte Carlo translation move

    // select a random label
    const i = Math.floor(Math.random() * lab.length)

    // save old coordinates
    const xOld = lab[i].x
    const yOld = lab[i].y

    // old energy
    let oldEnergy
    if (userEnergy) { oldEnergy = userDefinedEnergy(i, lab, anc) } else { oldEnergy = energy(i) }

    // random translation
    lab[i].x += (Math.random() - 0.5) * maxMove
    lab[i].y += (Math.random() - 0.5) * maxMove

    // hard wall boundaries
    if (lab[i].x > w) lab[i].x = xOld
    if (lab[i].x < 0) lab[i].x = xOld
    if (lab[i].y > h) lab[i].y = yOld
    if (lab[i].y < 0) lab[i].y = yOld

    // new energy
    let newEnergy
    if (userEnergy) { newEnergy = userDefinedEnergy(i, lab, anc) } else { newEnergy = energy(i) }

    // delta E
    const deltaEnergy = newEnergy - oldEnergy

    if (Math.random() < Math.exp(-deltaEnergy / currT)) {
      // move accepted
    } else {
      // move back to old coordinates
      lab[i].x = xOld
      lab[i].y = yOld
    }
  }

  const mcrotate = function (currT) {
    // Monte Carlo rotation move

    // select a random label
    const i = Math.floor(Math.random() * lab.length)

    // save old coordinates
    const xOld = lab[i].x
    const yOld = lab[i].y

    // old energy
    let oldEnergy
    if (userEnergy) { oldEnergy = userDefinedEnergy(i, lab, anc) } else { oldEnergy = energy(i) }

    // random angle
    const angle = (Math.random() - 0.5) * maxAngle

    const s = Math.sin(angle)
    const c = Math.cos(angle)

    // translate label (relative to anchor at origin):
    lab[i].x -= anc[i].x
    lab[i].y -= anc[i].y

    // rotate label
    const xNew = lab[i].x * c - lab[i].y * s
    const yNew = lab[i].x * s + lab[i].y * c

    // translate label back
    lab[i].x = xNew + anc[i].x
    lab[i].y = yNew + anc[i].y

    // hard wall boundaries
    if (lab[i].x > w) lab[i].x = xOld
    if (lab[i].x < 0) lab[i].x = xOld
    if (lab[i].y > h) lab[i].y = yOld
    if (lab[i].y < 0) lab[i].y = yOld

    // new energy
    let newEnergy
    if (userEnergy) { newEnergy = userDefinedEnergy(i, lab, anc) } else { newEnergy = energy(i) }

    // delta E
    const deltaEnergy = newEnergy - oldEnergy

    if (Math.random() < Math.exp(-deltaEnergy / currT)) {
      // move accepted
    } else {
      // move back to old coordinates
      lab[i].x = xOld
      lab[i].y = yOld
    }
  }

  const intersect = function (x1, x2, x3, x4, y1, y2, y3, y4) {
    // returns true if two lines intersect, else false
    // from http://paulbourke.net/geometry/lineline2d/

    const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1)
    const numera = (x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)
    const numerb = (x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)

    /* Is the intersection along the the segments */
    const mua = numera / denom
    const mub = numerb / denom
    if (!(mua < 0 || mua > 1 || mub < 0 || mub > 1)) {
      return true
    }
    return false
  }

  const coolingSchedule = function (currT, initialT, nsweeps) {
    // linear cooling
    return (currT - (initialT / nsweeps))
  }

  labeler.start = function (nsweeps) {
    // main simulated annealing function
    const m = lab.length
    let currT = 1.0
    const initialT = 1.0

    for (let i = 0; i < nsweeps; i++) {
      for (let j = 0; j < m; j++) {
        if (Math.random() < 0.5) { mcmove(currT) } else { mcrotate(currT) }
      }
      currT = coolingSchedule(currT, initialT, nsweeps)
    }
  }

  labeler.width = function (x) {
    // users insert graph width
    if (!arguments.length) return w
    w = x
    return labeler
  }

  labeler.height = function (x) {
    // users insert graph height
    if (!arguments.length) return h
    h = x
    return labeler
  }

  labeler.label = function (x) {
    // users insert label positions
    if (!arguments.length) return lab
    lab = x
    return labeler
  }

  labeler.anchor = function (x) {
    // users insert anchor positions
    if (!arguments.length) return anc
    anc = x
    return labeler
  }

  labeler.alt_energy = function (x) {
    // user defined energy
    if (!arguments.length) return energy
    userDefinedEnergy = x
    userEnergy = true
    return labeler
  }

  labeler.alt_schedule = function (x) {
    // user defined cooling_schedule
    if (!arguments.length) return coolingSchedule
    return labeler
  }

  return labeler
}
