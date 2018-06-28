Table = function (scene) {

    const camera = scene.userData.get('SUBJECTIVE_CAMERA')
    console.log(camera)
    const R = camera.position.length()

    const geometry = new THREE.BoxGeometry(1.618*2*R/3, 2*R/3, 1);
    const material = new THREE.MeshNormalMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = -1

    this.mesh = mesh
    return this
}