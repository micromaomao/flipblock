const FlipBlock_Levels = [
  fb => {
    fb.groundDrawRect(0, 0, 5, 3)
    fb.buildGroundTarget(3, 1)
  },
  fb => {
    fb.groundDrawRect(0, 0, 5, 5)
    fb.groundDrawRect(3, 3, 5, 5)
    fb.groundDrawRect(6, 6, 5, 5)
    fb.groundEraseRect(5, 5, 2, 2)
    fb.clearGroundBlock(2, 2)
    fb.buildGroundTarget(10, 10)
  },
  fb => {
    fb.groundDrawRect(0, 0, 3, 3)
    fb.buildGroundTarget(1, 1)
  },
  fb => {
    fb.groundDrawRect(0, 0, 1, 3)
    fb.groundDrawRect(1, 2, 2, 1)
    fb.buildGroundBlock(2, 0)
    fb.buildGroundBlock(3, 1)
    fb.buildGroundTarget(3, 2)
  },
  fb => {
    fb.groundDrawRect(0, 0, 2, 5)
    fb.groundEraseRect(1, 1, 1, 3)
    fb.buildGroundTarget(1, 2)
  },
  fb => {
    fb.buildGroundBlock(0, 0)(0, 1)(0, 2)(1, 1)(1, 2)(1, 3)(1, 4)(1, 5)(1, 6)(2, 6)(4, 6)(4, 4)(4, 5)(3, 3)(3, 1)(3, 2)(4, 1)(4, 2)(5, 1)(5, 2)(6, 1)(6, 2)(6, 3)(6, 4)(6, 5)(6, 6)(6, 7)(6, 8)(5, 7)(5, 8)(5, 6)(5, 4)(5, 5)
    fb.buildGroundTarget(5, 5)
    fb.groundEraseRect(3, 1, 4, 4)
    fb.groundEraseRect(0, 6, 1, 9)
  },
  fb => {
    fb.buildGroundBlock(0, 0)(1, 0)(1, 1)(0, 2)(2, 0)
    fb.buildGroundTarget(2, 2)
  },
  function* (fb) {
    fb.groundDrawRect(0, 0, 5, 5)
    let lastTarget = [0, 0]
    let lastDate = Date.now()
    while (true) {
      let now = Date.now()
      if (now - lastDate >= 500) {
        lastDate = now
        fb.clearGroundBlock(...lastTarget)
        fb.buildGroundBlock(...lastTarget)
        lastTarget = [Math.floor(Math.random() * 5), Math.floor(Math.random() * 5)]
        fb.buildGroundTarget(...lastTarget)
      }
      yield
    }
  },
  fb => {
    // This level is impossible to beat.
    fb.buildGroundBlock(0, 0)(1, 0)(1, 1)(0, 2)
    fb.buildGroundTarget(2, 2)
  }
]
