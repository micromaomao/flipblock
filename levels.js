const FlipBlock_Levels = [
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
  }
]
