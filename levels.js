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
    fb.groundDrawRect(0, 0, 15, 15)
    fb.groundEraseRect(3, 2, 1, 5)
    fb.groundEraseRect(3, 2, 3, 1)
    fb.groundEraseRect(3, 4, 2, 1)
    fb.groundEraseRect(3, 6, 3, 1)
  }
]
