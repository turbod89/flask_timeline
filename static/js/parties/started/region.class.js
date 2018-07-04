const Region = function region(scene,w,h) {

    const region = this
    const table = scene.userData.table

    const material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        opacity: 0.7,
        transparent: true,
    });

    const geometry = new THREE.PlaneGeometry(w, h)

    const mesh = new THREE.Mesh(geometry, material)
    mesh.region = region
    region.mesh = mesh

    region.mesh.position.z = -0.1

    region.update = function (data) {

        region.mesh.position.x = (data.pos[0] - 0.5) * table.mesh.geometry.parameters.width
        region.mesh.position.y = (data.pos[1] - 0.5) * table.mesh.geometry.parameters.height
    }
    
    return region
}