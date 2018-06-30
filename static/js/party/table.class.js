Table = function (scene) {

    const camera = scene.userData.get('SUBJECTIVE_CAMERA')
    const R = camera.position.length()
    const h = 2 * R / 3
    const w = 1.618 * h

    const geometry = new THREE.BoxGeometry(w,h, 1);
    const material = new THREE.MeshStandardMaterial({
        metalness: 0.8,
        roughness: 0.8,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = -1

    this.mesh = mesh
    this.clock = new THREE.Clock()

    const sphere_bGeometry = new THREE.SphereBufferGeometry(0.25, 16, 8)
    
    const lightDefinitions = [
        {
            light: new THREE.PointLight(0xffaaaa, 0.9, 100),
            render: l => t => l.position.set(0.90 * w / 2, 0.90 * h / 2,
                h/5 + h/16 * Math.sin(t / 15 * 2 * Math.PI)),
        },
        
        {
            light: new THREE.PointLight(0xaaffaa, 0.9, 100),
            render: l => t => l.position.set(-0.90 * w / 2, 0.90 * h / 2, h / 5 + h / 16 * Math.sin((0.25 + t / 15) * 2 * Math.PI)),
        }, {
            light: new THREE.PointLight(0xaaaaff, 0.9, 100),
            render: l => t => l.position.set(0.90 * w / 2, -0.90 * h / 2, h / 5 + h / 16 * Math.sin((0.50 + t / 15) * 2 * Math.PI)),
        }, {
            light: new THREE.PointLight(0xffffaa, 0.9, 100),
            render: l => t => l.position.set(-0.90 * w / 2, -0.90 * h / 2, h / 5 + h / 16 * Math.sin((0.75 + t / 15) * 2 * Math.PI)),
        },
        
    ]

    const lamps = lightDefinitions.map(ls => {
        const s = new THREE.Mesh(sphere_bGeometry, new THREE.MeshBasicMaterial({
            color: ls.light.color
        }))
        ls.light.add(s)
        return s
    })

    lightDefinitions.forEach(ld => this.mesh.add(ld.light))


    this.render = function () {
        const t = this.clock.getElapsedTime()
        lightDefinitions.forEach( ld => {
            ld.render(ld.light)(t)
        })
    }


    return this
}