const Button = function () {
    THREE.Group.apply(this,arguments)
    const scale = 1

    const geometry = new THREE.BoxGeometry(1 * scale, 1 * scale, 1 * scale);
    const material = new THREE.MeshStandardMaterial({
        metalness: 0.8,
        roughness: 0.8,
    });

    const mesh = new THREE.Mesh(geometry,material)


    this.add(mesh)

}
Button.prototype = Object.create(THREE.Group.prototype)