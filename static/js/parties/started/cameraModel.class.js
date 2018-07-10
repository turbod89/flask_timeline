const CameraModel = function (color = 0xaaaaaa) {
    
    THREE.Group.apply(this, arguments);
    
    const scale = 1

    const material = new THREE.MeshStandardMaterial({
        metalness: 0.8,
        roughness: 0.8,
        color,
    })

    const bodyGeom = new THREE.BoxGeometry(1, 2, 3)
    const bodyMesh = new THREE.Mesh(bodyGeom, material)
    bodyMesh.position.set(0, 0, 1 + 2 + 0.5)

    const objGeom = new THREE.CylinderGeometry(0.6, 0.4, 0.5)
    const objMesh = new THREE.Mesh(objGeom, material)
    objMesh.rotateX(-Math.PI/2)
    objMesh.position.set(0, 0, 1)

    const cGeom = new THREE.CylinderGeometry(0.75, 0.75, 1)
    const c1Mesh = new THREE.Mesh(cGeom, material)
    const c2Mesh = new THREE.Mesh(cGeom, material)
    c1Mesh.rotateZ(-Math.PI / 2)
    c2Mesh.rotateZ(-Math.PI / 2)
    c1Mesh.position.set(0, 1 + 0.75, 1 + 1 + 2/2)
    c2Mesh.position.set(0, 1 + 0.75, 1 + 1 + 2/2 + 1.5)

    const light1 = new THREE.PointLight(color, 1,5)
    const light2 = new THREE.PointLight(color, 1,5)
    light1.position.set(-2,1,3)
    light2.position.set(2,5,-3)
    //light1.target = this
    //light2.target = this

    this.add(bodyMesh)
    this.add(objMesh)
    this.add(c1Mesh)
    this.add(c2Mesh)
    this.add(light1)
    this.add(light2)

}
CameraModel.prototype = Object.create(THREE.Group.prototype)
