Table = function (camera) {

    THREE.Group.apply(this, arguments);

    const points = [{x: -1, y:1},{x: 1, y:1},{x: -1, y:-1},{x: 1, y:-1}].map( point2d => {
        const raycaster = new THREE.Raycaster()
        raycaster.setFromCamera(point2d, camera)
        const pointA = raycaster.ray.origin
        const direction = raycaster.ray.direction
        direction.normalize();

        const lambda = -pointA.z / direction.z;
        if (lambda < 0) {
            lambda = 100
        }

        const pointB = new THREE.Vector3();
        pointB.addVectors(pointA, direction.multiplyScalar(lambda));
        return pointB
    })

    const R = camera.position.length()
    const w = Math.min(points[1].x - points[0].x,points[3].x  - points[2].x)
    const h = 2*Math.min(points[0].y,-points[2].y)
    this.width = w
    this.height = h

    const geometry = new THREE.BoxGeometry(w,h, 1);
    const material = new THREE.MeshStandardMaterial({
        metalness: 0.8,
        roughness: 0.8,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.z = -1
    this.add(mesh)

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

    lightDefinitions.forEach(ld => this.add(ld.light))


    this.render = function (t) {
        lightDefinitions.forEach( ld => {
            ld.render(ld.light)(t)
        })
    }

    console.log(this)
    return this
}

Table.prototype = Object.create(THREE.Group.prototype)