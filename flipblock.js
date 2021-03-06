let scene = new THREE.Scene()

function round (float) {
  return Math.round(float * 1000) / 1000
}

class FlipBlock {
  constructor (scene, textures, initLevel, onLevelChange, onWoodHit) {
    this._scene = scene
    this._groundBlocks = []
    this._maxX = 18
    this._maxY = 15
    this._groundDepth = 0.05
    for (let i = 0; i <= this.maxX; i ++) {
      this._groundBlocks[i] = []
      for (let j = 0; j <= this.maxY; j ++) {
        this._groundBlocks[i][j] = null
      }
    }
    this._ground = new THREE.Object3D()
    scene.add(this._ground)

    this._animationTime = 100

    this._groundMaterial = new THREE.MeshLambertMaterial({color: 0xeeeeee})
    this._groundTargetMaterial = new THREE.MeshLambertMaterial({color: 0x4caf50})
    this._groundGeo = new THREE.BoxGeometry(0.97, 0.97, this.groundDepth)

    this._currentLevel = initLevel || 0
    if (this._currentLevel >= FlipBlock_Levels.length) {
      this._currentLevel = 0
    }
    this._onLevelChange = onLevelChange
    this._onWoodHit = onWoodHit

    this._boxDim = {w: 1, h: 1, d: 2}
    let boxDim = this._boxDim
    this._boxFaceVect = {wh: new THREE.Vector3(0, 0, -boxDim.d / 2), wd: new THREE.Vector3(0, -boxDim.h / 2, 0), hd: new THREE.Vector3(-boxDim.w, 0, 0)}

    this._boxMaterial = new THREE.MeshPhongMaterial({color: 0x795548, map: textures.wood})
    this._boxContainer = new THREE.Object3D()
    this._box = new THREE.Mesh(new THREE.BoxGeometry(boxDim.w, boxDim.h, boxDim.d), this._boxMaterial)
    this._boxContainer.add(this._box)
    this._initialBoxPos = new THREE.Vector3(0.5, 0.5, this._groundDepth / 2 + boxDim.d / 2)
    this._boxContainer.position.copy(this._initialBoxPos)
    scene.add(this._boxContainer)

    this._boxLight = new THREE.PointLight(0xffffff, 1, 20)
    this._boxLight.position.set(0.5, 0.5, boxDim.d + 2)
    scene.add(this._boxLight)

    this.nextLevel()
  }
  initBox (tr) {
    if (!tr && this._transforming) throw new Error('Can not init box while transforming.')
    this._transforming = true
    this._boxContainer.rotation.set(0, 0, 0)
    this._boxContainer.position.copy(this._initialBoxPos)
    this.animation(3, this._boxContainer.position.z, 200, () => {
      if (tr) return
      this._transforming = false
    }, v => {
      this._boxContainer.position.setZ(v)
    })
    if (this._steped && this._steped.length > 0) {
      console.log('fb.buildGroundBlock' + this._steped.map(v => `(${v.x}, ${v.y})`).join(''))
    }
    this._steped = []
  }
  get maxX () {
    return this._maxX
  }
  get maxY () {
    return this._maxY
  }
  get scene () {
    return this._scene
  }
  get groundDepth () {
    return this._groundDepth
  }
  groundDrawRect (x, y, w, h, props) {
    for (let i = x; i < x + w; i ++) {
      for (let j = y; j < y + h; j ++) {
        this.buildGroundBlock(i, j, props)
      }
    }
  }
  groundEraseRect (x, y, w, h) {
    for (let i = x; i < x + w; i ++) {
      for (let j = y; j < y + h; j ++) {
        this.clearGroundBlock(i, j)
      }
    }
  }
  buildGroundBlock (x, y, props) {
    props = props || {}
    if (x >= this.maxX || y >= this.maxY) {
      throw new Error('coordinate out of range')
    }
    if (this._groundBlocks[x][y]) {
      this.clearGroundBlock(x, y)
      return this.buildGroundBlock(x, y, props)
    }
    let geo = this._groundGeo
    let material = this._groundMaterial
    let blockObj = {geometry: geo, material}
    if (Number.isSafeInteger(props.color)) {
      material = material.clone()
      material.color = new THREE.Color(props.color)
      blockObj.color = props.color
    }
    let box = new THREE.Mesh(geo, material)
    blockObj.mesh = box
    box.position.set(x + 0.5, y + 0.5, 0)
    this._ground.add(box)
    this._groundBlocks[x][y] = blockObj
    return this.buildGroundBlock.bind(this)
  }
  buildGroundTarget (x, y) {
    if (x >= this.maxX || y >= this.maxY) {
      throw new Error('coordinate out of range')
    }
    if (this._groundBlocks[x][y]) {
      this.clearGroundBlock(x, y)
      this.buildGroundTarget(x, y)
      return
    }
    let geo = this._groundGeo
    let box = new THREE.Mesh(geo, this._groundTargetMaterial)
    box.position.set(x + 0.5, y + 0.5, 0)
    this._groundBlocks[x][y] = {geometry: geo, mesh: box, target: true}
    this._ground.add(box)
  }
  clearGroundBlock (x, y) {
    if (x >= this.maxX || y >= this.maxY) {
      throw new Error('coordinate out of range')
    }
    if (!this._groundBlocks[x][y]) {
      return
    }
    let {mesh: box} = this._groundBlocks[x][y]
    this._ground.remove(box)
    this._groundBlocks[x][y] = null
  }
  startBoxTransform (centerX, centerY, centerZ) {
    if (this._transforming) {
      throw new Error('There is another transform currently going on.')
    }
    this._transforming = true
    let rot = this._box.getWorldRotation()
    this._box.rotation.copy(rot)
    this._boxContainer.rotation.set(0, 0, 0)
    this._box.position.add(new THREE.Vector3(-centerX, -centerY, -centerZ))
    this._boxContainer.position.add(new THREE.Vector3(centerX, centerY, centerZ))
    this._boxContainer.updateMatrixWorld()
  }
  startBoxTransformFromWorldCord(vect) {
    let nVect = new THREE.Vector3()
    nVect.copy(vect)
    nVect.sub(this._boxContainer.position)
    this.startBoxTransform(round(nVect.x), round(nVect.y), round(nVect.z))
  }
  endBoxTransform () {
    if (!this._transforming) {
      throw new Error('There are no transform going on.')
    }
    this._boxContainer.updateMatrixWorld()
    let pos = this._box.getWorldPosition()
    let rot = this._box.getWorldRotation()
    this._boxContainer.position.copy(pos)
    this._boxContainer.rotation.copy(rot)
    this._box.position.set(0, 0, 0)
    this._box.rotation.set(0, 0, 0)
    this._boxContainer.updateMatrixWorld()
    this._transforming = false
  }
  getFaceTldr () {
    let tl // Top-left
    let dr // Down-right
    let boxD = this._boxDim
    // Face: {wh, wd, hd}

    // Get tl and dr in object space.
    if (this.ifFaceDown('wh')) {
      tl = new THREE.Vector3(-boxD.w / 2, -boxD.h / 2, 0)
      dr = new THREE.Vector3(boxD.w / 2, boxD.h / 2, 0)
    } else if (this.ifFaceDown('wd')) {
      tl = new THREE.Vector3(-boxD.w / 2, 0, -boxD.d / 2)
      dr = new THREE.Vector3(boxD.w / 2, 0, boxD.d / 2)
    } else if (this.ifFaceDown('hd')) {
      tl = new THREE.Vector3(0, -boxD.h / 2, -boxD.d / 2)
      dr = new THREE.Vector3(0, boxD.h / 2, boxD.d / 2)
    } else {
      throw new Error('Something goes wrong')
    }
    this._box.localToWorld(tl)
    this._box.localToWorld(dr)

    if (tl.x > dr.x) {
      let tmp = tl
      tl = dr
      dr = tmp
    }
    if (tl.y > dr.y) {
      let tmp = tl.y
      tl.setY(dr.y)
      dr.setY(tmp)
    }
    tl.x = round(tl.x)
    dr.x = round(dr.x)
    tl.y = round(tl.y)
    dr.y = round(dr.y)
    tl.z = this._groundDepth / 2
    dr.z = this._groundDepth / 2
    return {tl, dr}
  }
  getDownFaceCoords () {
    let {tl, dr} = this.getFaceTldr()
    let pts = []
    for (let i = tl.x; i < dr.x; i ++) {
      for (let j = tl.y; j < dr.y; j ++) {
        pts.push([i, j, (this._groundBlocks[i] ? this._groundBlocks[i][j] : null)])
      }
    }
    return pts
  }
  ifFaceDown (face) {
    let fv = this._boxFaceVect[face]
    if (!fv) {
      throw new Error(`Face ${face} do not exist.`)
    }
    let nVet = this.rotateFaceVector(fv)
    return (round(nVet.x) === 0 && round(nVet.y) === 0)
  }
  rotateFaceVector (vect) {
    if (this._transforming) {
      throw new Error('You must end the transformation before calling this.')
    }
    let nv = new THREE.Vector3()
    nv.copy(vect)
    nv.applyEuler(this._boxContainer.rotation)
    return nv
  }

  animation (start, end, time, finish, value) {
    let startTime = Date.now()
    let cts = setInterval(() => {
      let prog = Date.now() - startTime
      if (prog >= time) {
        value(end)
        clearInterval(cts)
        finish()
      } else {
        let nv = start + (end - start) * (prog / time)
        value(nv)
      }
    })
  }
  turnLeft () {
    if (this._transforming) return
    let {tl} = this.getFaceTldr()
    this.startBoxTransformFromWorldCord(tl)
    let nRotY = this._boxContainer.rotation.y - Math.PI / 2
    this.animation(this._boxContainer.rotation.y, nRotY, this._animationTime, () => {
      this.endBoxTransform()
      this.postTurn()
    }, v => {
      this._boxContainer.rotation.y = v
    })
  }
  turnRight () {
    if (this._transforming) return
    let {dr} = this.getFaceTldr()
    this.startBoxTransformFromWorldCord(dr)
    let nRotY = this._boxContainer.rotation.y + Math.PI / 2
    this.animation(this._boxContainer.rotation.y, nRotY, this._animationTime, () => {
      this.endBoxTransform()
      this.postTurn()
    }, v => {
      this._boxContainer.rotation.y = v
    })
  }
  turnUp () {
    if (this._transforming) return
    let {dr} = this.getFaceTldr()
    this.startBoxTransformFromWorldCord(dr)
    let nRotX = this._boxContainer.rotation.x - Math.PI / 2
    this.animation(this._boxContainer.rotation.x, nRotX, this._animationTime, () => {
      this.endBoxTransform()
      this.postTurn()
    }, v => {
      this._boxContainer.rotation.x = v
    })
  }
  turnDown () {
    if (this._transforming) return
    let {tl} = this.getFaceTldr()
    this.startBoxTransformFromWorldCord(tl)
    let nRotX = this._boxContainer.rotation.x + Math.PI / 2
    this.animation(this._boxContainer.rotation.x, nRotX, this._animationTime, () => {
      this.endBoxTransform()
      this.postTurn()
    }, v => {
      this._boxContainer.rotation.x = v
    })
  }

  postTurn () {
    this._boxLight.position.set(this._boxContainer.position.x, this._boxContainer.position.y, this._boxDim.d + 2)
    if (this._onWoodHit) this._onWoodHit()
    this._determineBlockFail()
    if (this._isGenerating) this._gen.next()
  }
  _determineBlockFail () {
    let faces = this.getDownFaceCoords()
    let emptySpace = 0
    let ret = false
    faces.forEach(co => {
      if (ret) return
      let [x, y] = co
      let st = this._steped.find(v => v.x === x && v.y === y)
      if (!st) {
        console.log(`fb.buildGroundBlock(${x}, ${y})`)
        this._steped.push({x, y})
      }
      if (x < 0 || y < 0 || x >= this._maxX || y >= this._maxY) {
        emptySpace ++
        return
      }
      if (this._groundBlocks[x][y] === null) {
        emptySpace ++
      }
    })
    if (ret) return
    if (emptySpace === faces.length) {
      this.fail()
      return
    }
    if (faces.length === 1) {
      let [x, y] = faces[0]
      let gb = this._groundBlocks[x][y]
      if (gb && gb.target) {
        this.success()
      }
    }
  }
  fail () {
    this.nextLevel()
  }
  success () {
    this._currentLevel ++
    this.nextLevel()
  }
  clearAll () {
    for (let i = 0; i <= this.maxX; i ++) {
      for (let j = 0; j <= this.maxY; j ++) {
        if (this._groundBlocks[i][j]) {
          this.clearGroundBlock(i, j)
        }
        this._groundBlocks[i][j] = null
      }
    }
  }
  nextLevel () {
    if (this._transforming) throw new Error('State not stable')
    this._transforming = true
    if (this._isGenerating) {
      clearInterval(this._generatorInterval)
      this._isGenerating = false
      this._gen = null
    }
    this.clearAll()
    this.initBox(true)
    let lv = this._currentLevel
    let gen = FlipBlock_Levels[lv](this)
    if (!gen || !gen.next) {
      this._isGenerating = false
      this._gen = null
    } else {
      this._isGenerating = true
      this._gen = gen
      this._generatorInterval = setInterval(() => {
        gen.next()
      })
      gen.next()
    }
    this.doBrickAnimation()
    if (this._onLevelChange) this._onLevelChange(lv)
  }
  doBrickAnimation () {
    let ani = 0
    for (let i = 0; i <= this.maxX; i ++) {
      for (let j = 0; j <= this.maxY; j ++) {
        let gb = this._groundBlocks[i][j]
        if (gb) {
          let nPos = gb.mesh.position.z
          ani++
          this.animation(-5, nPos, Math.floor(Math.random() * 200 + 200), () => {
            ani--
            if (ani === 0) {
              this._transforming = false
            }
          }, v => {
            if (!this._transforming) {
              throw new Error('Something goes wrong.')
            }
            gb.mesh.position.z = v
          })
        }
      }
    }
  }
}

let onTextureLoad = textures => {
  let ha = window.location.hash
  let hashMatch = ha.match(/^#l(\d+)$/)
  let initLevel = 0
  if (hashMatch) {
    initLevel = parseInt(hashMatch[1])
  }
  let auds = [0, 1, 2].map(x => {
    let aud = new Audio()
    aud.src = `wood${x}.mp3`
    return aud
  })
  let audioTouch = false
  let audt = 0
  let fb = new FlipBlock(scene, textures, initLevel, lv => {
    window.location = '#l' + lv
  }, () => {
    auds[audt].currentTime = 0
    auds[audt].play()
    audt = (audt + 1) % auds.length
  })

  let camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000)
  let renderer = new THREE.WebGLRenderer({
    antialias: true
  })

  function handleResize () {
    let wid = window.innerWidth
    let hig = window.innerHeight
    camera.aspect = wid / hig
    camera.updateProjectionMatrix()
    renderer.setSize(wid, hig)
  }

  renderer.setClearColor(0xebe8e7)

  handleResize()
  window.addEventListener('resize', handleResize)

  function doRender () {
    requestAnimationFrame(doRender)
    let wp = fb._box.getWorldPosition()
    camera.position.setX(wp.x / 2 + 3)
    camera.position.setY(wp.y / 2 - 5)
    renderer.render(scene, camera)
  }

  Object.assign(document.body.style, {
    margin: '0',
    padding: '0',
    overflow: 'hidden'
  })
  document.body.appendChild(renderer.domElement)

  camera.position.set(8, -5, 6)
  camera.rotation.set(Math.PI / 3, 0, 0)

  let light = new THREE.HemisphereLight(0xffffff, 0x222222, 1)
  scene.add(light)

  doRender()

  window.addEventListener('keydown', evt => {
    if (evt.key === 'ArrowLeft') {
      fb.turnLeft()
    }
    if (evt.key === 'ArrowRight') {
      fb.turnRight()
    }
    if (evt.key === 'ArrowUp') {
      fb.turnUp()
    }
    if (evt.key === 'ArrowDown') {
      fb.turnDown()
    }
  })

  let tsPoint = null
  window.addEventListener('touchstart', evt => {
    let touches = evt.touches
    if (touches.length === 1) {
      tsPoint = touches[0]
      evt.preventDefault()
    }
  })
  let lastTouch = null
  window.addEventListener('touchmove', evt => {
    if (!tsPoint) {
      return
    }
    evt.preventDefault()
    let touches = evt.touches
    if (touches.length === 1) {
      lastTouch = touches[0]
    } else {
      let newTouch = touches.find(touch => touch.identifier === lastTouch.identifier)
      if (newTouch) {
        lastTouch = newTouch
      } else if (touches.length >= 1) {
        lastTouch = touches[0]
      }
    }
  })
  window.addEventListener('touchend', evt => {
    if (tsPoint && lastTouch) {
      evt.preventDefault()
      let [dx, dy] = [lastTouch.clientX - tsPoint.clientX, lastTouch.clientY - tsPoint.clientY]
      let mag = Math.sqrt(dx * dx + dy * dy)
      let ang = Math.atan2(dy, dx) / Math.PI * 180
      if (ang <= -50 && ang >= -130) {
        fb.turnUp()
      } else if (ang >= 140 || ang <= -140) {
        fb.turnLeft()
      } else if (ang >= -40 && ang <= 40) {
        fb.turnRight()
      } else if (ang >= 50 && ang <= 130) {
        fb.turnDown()
      }
      if (!audioTouch) {
        auds.forEach(aud => {
          let oldsrc = aud.src
          aud.src = ''
          aud.play()
          aud.pause()
          aud.src = oldsrc
        })
        audioTouch = true
      }
    }
  })
}

let textureLoader = new THREE.TextureLoader()
textureLoader.load('wood.png', wood => {
  onTextureLoad({wood: wood})
})
