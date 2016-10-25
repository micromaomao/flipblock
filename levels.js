const Colors = {
  FAIL_ON_STAND: 0x222222,
  VANISH_ON_TOUCH: 0xf1ca4f,
  SUCCESS_ON_TOUCH: 0x09f7a0,
  VANISH_ON_STAND_AND_SUCCESS_ON_STAND_ALL: 0x09d7f7,
  TARGET: 0x4caf50
}
const FlipBlock_Levels = [
  fb => {
    fb.groundDrawRect(0, 0, 5, 3)
    fb.buildGroundTarget(3, 1)
  },
  fb => {
    fb.groundDrawRect(0, 0, 5, 3)
    fb.buildGroundTarget(4, 1)
  },
  fb => {
    fb.groundDrawRect(0, 0, 5, 3)
    fb.clearGroundBlock(3, 1)
    fb.buildGroundTarget(4, 1)
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
    fb.groundDrawRect(0, 0, 4, 4)
    fb.groundEraseRect(1, 1, 2, 2)
    fb.buildGroundBlock(2, 2)
    fb.buildGroundTarget(2, 0)
  },
  fb => {
    fb.groundDrawRect(0, 0, 3, 3)
    fb.buildGroundTarget(1, 1)
  },
  fb => {
    fb.groundDrawRect(0, 0, 2, 2)
    fb.buildGroundTarget(0, 1)
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
    fb.groundDrawRect(0, 0, 5, 3)
    fb.groundEraseRect(1, 1, 3, 1)
    fb.buildGroundTarget(2, 2)
    let vanish = {color: Colors.VANISH_ON_TOUCH}
    fb.buildGroundBlock(0, 1, vanish)(0, 2, vanish)(1, 2, vanish)
    while (true) {
      if (fb._transforming) {
        yield
        continue
      }
      let fd = fb.getDownFaceCoords()
      fd.forEach(([x, y, v]) => {
        if (v && v.color === Colors.VANISH_ON_TOUCH) {
          fb.clearGroundBlock(x, y)
        }
      })
      yield
    }
  },
  function* (fb) {
    fb.groundDrawRect(0, 0, 5, 4)
    let vanish = {color: Colors.VANISH_ON_TOUCH}
    fb.groundDrawRect(0, 1, 1, 2, vanish)
    fb.groundDrawRect(1, 3, 3, 1, vanish)
    fb.groundDrawRect(3, 0, 2, 2, vanish)
    fb.clearGroundBlock(2, 2)
    fb.buildGroundBlock(1, 0, vanish)(1, 1, vanish)(2, 0, vanish)
    fb.buildGroundTarget(2, 1)
    while (true) {
      if (fb._transforming) {
        yield
        continue
      }
      let fd = fb.getDownFaceCoords()
      fd.forEach(([x, y, v]) => {
        if (v && v.color === Colors.VANISH_ON_TOUCH) {
          fb.clearGroundBlock(x, y)
        }
      })
      yield
    }
  },
  fb => {
    fb.buildGroundBlock(0, 0)(0, 1)
    fb.groundDrawRect(1, 1, 6, 6)
    fb.groundEraseRect(2, 2, 3, 3)
    fb.clearGroundBlock(3, 1)
    fb.clearGroundBlock(3, 5)
    fb.buildGroundTarget(3, 3)
  },
  function* (fb) {
    fb.groundDrawRect(1, 2, 6, 1)
    fb.groundEraseRect(2, 2, 4, 1)
    fb.clearGroundBlock(2, 1)
    fb.clearGroundBlock(1, 2)
    fb.buildGroundBlock(3, 4)(4, 4)(0, 2)(6, 5)(0, 3)(0, 4)(2, 1)(5, 4)(6, 3)(5, 3)(6, 4)
    fb.buildGroundBlock(5, 5, {color: Colors.FAIL_ON_STAND})
    fb.groundDrawRect(1, 4, 2, 1)
    fb.groundDrawRect(0, 0, 4, 1)
    fb.buildGroundTarget(3, 2)
    while (true) {
      if (fb._transforming) {
        yield
        continue
      }
      let fd = fb.getDownFaceCoords()
      if (fd.length === 1 && fd.find(([,, v]) => v.color === Colors.FAIL_ON_STAND)) {
        fb.fail()
      }
      yield
    }
  },
  fb => {
    fb.groundDrawRect(0, 0, 4, 1)
    fb.buildGroundBlock(3, 1)(1, 1)
    fb.buildGroundTarget(1, 0)
  },
  function* (fb) {
    fb.groundDrawRect(0, 0, 10, 10, {color: Colors.VANISH_ON_TOUCH})
    fb.buildGroundTarget(9, 8)
    while (true) {
      if (fb._transforming) {
        yield
        continue
      }
      let wo = fb.getDownFaceCoords()
      wo.forEach(v => {
        let [x, y] = v
        if (x === 9 && y === 8) return
        fb.clearGroundBlock(x, y)
      })
      yield
    }
  },
  function* (fb) {
    fb.groundDrawRect(0, 0, 4, 4)
    let target = {color: Colors.VANISH_ON_STAND_AND_SUCCESS_ON_STAND_ALL}
    fb.buildGroundBlock(1, 1, target)(2, 2, target)
    let left = 2
    while (true) {
      if (fb._transforming) {
        yield
        continue
      }
      let wo = fb.getDownFaceCoords()
      if (wo.length === 1) {
        let tg = wo[0]
        if (tg[2] && tg[2].color === Colors.VANISH_ON_STAND_AND_SUCCESS_ON_STAND_ALL) {
          fb.clearGroundBlock(tg[0], tg[1])
          left --
        }
      }
      if (left === 0) {
        fb.success()
      }
      yield
    }
  },
  function* (fb) {
    fb.groundDrawRect(0, 0, 10, 10, {color: Colors.SUCCESS_ON_TOUCH})
    let left = 10 * 10
    while (true) {
      if (fb._transforming) {
        yield
        continue
      }
      let wo = fb.getDownFaceCoords()
      wo.forEach(v => {
        let [x, y, b] = v
        if (b) {
          fb.clearGroundBlock(x, y)
          left --
        }
      })
      if (left <= 0) {
        fb.success()
      }
      yield
    }
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
