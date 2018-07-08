const getCamera = (renderer, scene) => {
    const fov = 45;
    const aspect = renderer.domElement.width / renderer.domElement.height;
    const near = 1;
    const far = 1000;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

    const R = 40
    const theta = 0.05 * 2 * Math.PI / 4
    camera.position.z = R * Math.cos(theta)
    camera.position.y = -R * Math.sin(theta)
    camera.lookAt(new THREE.Vector3(0, 0, 0))
    scene.add(camera)
    camera.updateProjectionMatrix()

    //camera.userData.controls = new THREE.OrbitControls(camera)
    //camera.userData.controls.update();
    return camera
}

const getScene = () => {
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)

    scene.userData.get = name => scene.children.find( child => child.name === name)
    scene.userData.add = (e,name) => {
        scene.userData[name] = e
        return scene
    }

    const clock = new THREE.Clock()
    scene.userData.add(clock,'clock')

    return scene
}

const getLights = scene => {

    const table = scene.userData.table
    const t_w = table.mesh.geometry.parameters.width
    const t_h = table.mesh.geometry.parameters.height

    const LightSystem = function () {
        this.clock = new THREE.Clock()
        this.render = function () {
            const t = this.clock.getElapsedTime()
            this.forEach (ls => ls.render(t))
        }
    }

    LightSystem.prototype = Object.create(Array.prototype)

    const lights = new LightSystem()
    
    const definitions = [
        {
            l: new THREE.AmbientLight(0xffffff, 0.5,100),
            p: l => t => {l.position.set(0,0,t_h/2)},
        },
    ]
    
    definitions.forEach (o => lights.push({
        light: o.l,
        render: o.p(o.l),
    }))

    lights.forEach( sl => scene.add(sl.light))

    scene.userData.add(lights,'lights')
    return lights
}

window.addEventListener('load', event => {

    const socket = io.connect('http://' + document.domain + ':' + location.port + '/party');
    socket.on('connect', () => {
        console.log(socket.id)
        socket.emit('join',g.party.token)
    })

    const canvas = document.getElementById('cv1')
    const touchManager = new TouchManager(canvas)
    
    const scene = getScene()
    
    const renderer = new THREE.WebGLRenderer({canvas,antialias: true});
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    renderer.setPixelRatio(devicePixelRatio)

    const camera = getCamera(renderer,scene)
    camera.name = 'SUBJECTIVE_CAMERA'
    
    const table = new Table(scene)
    table.name = "TABLE"
    scene.add(table.mesh);
    scene.userData.add(table,"table")

    const lights = getLights(scene)
    
    const cardsInGame = new Deck(socket,scene)
    const userManager = new UserManager(socket,scene)
    const raycaster = new THREE.Raycaster();
    scene.userData.add(raycaster,'raycaster')

    const regions = [new Region(scene, 5/8,7/2)]
    regions.forEach (region => region.update({pos: [0.5,0.5]}))
    regions.forEach (region => scene.add(region.mesh))
    scene.userData.add(regions,regions)

    raycaster.setFromCamera({x: 1,y:1},camera)
    raycaster.ray.origin.copy((new THREE.Vector3(1,1,-1)).unproject(camera))
    console.log(raycaster.ray)
    const plane = new THREE.Plane(new THREE.Vector3(0,0,1),0)
    const topLeft = raycaster.ray.intersectPlane(plane)
    console.log(topLeft)

    const cube = new THREE.Mesh(
        new THREE.BoxGeometry(0.5,0.5,0.5),
        new THREE.MeshPhongMaterial({
            color: 0xff0000,
        })
    )


    cube.position.set(-1,-1,-10).unproject(camera)
    //console.log(cube.position.copy(topLeft))

    scene.add(cube)

    touchManager.addEventListener('update', function (touch) {
        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components

        const touchPoint = {
            x: (touch.pos[0] / canvas.width) * 2 - 1,
            y: -(touch.pos[1] / canvas.height) * 2 + 1,
        }
        
        raycaster.setFromCamera(touchPoint, camera);
        const intersects = raycaster.intersectObjects([table.mesh]);
        if (intersects.length > 0) {
            const point = intersects[0].point

            touch.cards.forEach((card,i) => {
                i > 0 || card.moveTo(point,table)
            })

        }


    })

    touchManager.addEventListener('add', function (touch) {
        const point = {
            x: (touch.pos[0] / canvas.width) * 2 - 1,
            y: -(touch.pos[1] / canvas.height) * 2 + 1,
        }
        raycaster.setFromCamera(point, camera)
        touch.cards = cardsInGame.intersectCards(raycaster);
        
    })

    touchManager.addEventListener('remove', function (touch) {
        const point = {
            x: (touch.pos[0] / canvas.width) * 2 - 1,
            y: -(touch.pos[1] / canvas.height) * 2 + 1,
        }

        if (touch.cards.length > 0) {
            raycaster.setFromCamera(point, camera)
            const intersectedRegions = raycaster.intersectObjects(regions.map(r => r.mesh)).map( i => i.object.region)
            
            if (intersectedRegions.length > 0) {
                const region = intersectedRegions[0]

                touch.cards.forEach( card => {
                    card.moveTo(region.mesh.position)
                    card.emitPosition()
                })
            } else {
                touch.cards.forEach(card => {
                    card.moveTo(card.mesh.position)
                    card.emitPosition()
                })
            }
        }



    })

    const animate = function () {
        requestAnimationFrame(animate);
        //camera.userData.controls.update();
        lights.render()
        table.render()
        renderer.render(scene, camera);
    };

    animate();
});