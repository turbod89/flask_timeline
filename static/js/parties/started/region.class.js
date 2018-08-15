const Region = function region(scene,w,h) {

    const region = this

    const material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        opacity: 0.7,
        transparent: true,
    });

    const geometry = new THREE.PlaneGeometry(w, h)
    THREE.Mesh.apply(this, [geometry, material]);

    region.mesh.position.z = -0.1

    return region
}

Region.prototype = Object.create(THREE.Mesh.prototype)
