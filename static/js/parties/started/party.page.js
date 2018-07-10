const getLights = (scene,table) => {

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
            l: new THREE.AmbientLight(0xffffff, 1,1000),
            p: l => t => {l.position.set(0,0,t_h/2)},
        },
    ]
    
    definitions.forEach (o => lights.push({
        light: o.l,
        render: o.p(o.l),
    }))

    lights.forEach( sl => scene.add(sl.light))

    return lights
}

const CameraModel = function () {

    const material = new THREE.MeshStandardMaterial({
        metalness: 0.8,
        roughness: 0.8,
        color: 0xaaaaaa,
    })

    const bodyGeom = new THREE.BoxGeometry(1,2,3)
    const bodyMesh = new THREE.Mesh(bodyGeom,material)
    bodyMesh.material.wireframe = true

    const objGeom = new THREE.CylinderGeometry(0.6,0.4,0.5)
    const objMesh = new THREE.Mesh(objGeom,material)
    objMesh.rotateX(-Math.PI/2)
    objMesh.position.set(0,0,-(0.5 + 2/2))
    objMesh.material.wireframe = true


    this.add(bodyMesh)
    this.add(objMesh)

}
CameraModel.prototype = Object.create(new THREE.Group())


window.addEventListener('load', event => {

    const socket = io.connect('http://' + document.domain + ':' + location.port + '/party');
    socket.on('connect', () => {
        console.log(socket.id)
        socket.emit('join',g.party.token)
    })

    const canvas = document.getElementById('cv1')
    //const touchManager = new TouchManager(canvas)
    const sceneManager = new SceneManager(canvas)

    sceneManager
        .registerScene('main scene', scene => {
            scene.background = new THREE.Color( 0xffffff );
        })
        .registerCamera('main camera',{
            fov: 45,
            scene: 'main scene',
        }, camera => {

            
            camera.add(new CameraModel())

            const R = 40
            const theta = 0.25 * 2 * Math.PI / 4
            camera.position.z = R * Math.cos(theta)
            camera.position.y = -R * Math.sin(theta)
            camera.lookAt(new THREE.Vector3(0, 0, 0))
            camera.updateProjectionMatrix()

        })

        .registerCamera('side camera',{
            fov: 45,
            scene: 'main scene',
        }, camera => {

            camera.add(new CameraModel())

            const R = 100
            const theta = 0.25 * 2 * Math.PI / 4
            const phi = 0.25 * 2 * Math.PI / 4
            //camera.position.set(0,-R * Math.sin(theta), R * Math.cos(theta))
            //camera.rotateX(-theta)
            //camera.rotateZ(phi)
            camera.position.set(R * Math.sin(theta) * Math.cos(phi),-R * Math.sin(theta) * Math.sin(phi), R * Math.cos(theta))
            camera.lookAt(new THREE.Vector3(0, 0, 0))
            //camera.lookAt(sceneManager.getCamera('main camera').position)
            camera.updateProjectionMatrix()
        })


    const table = new Table(sceneManager.getCamera('main camera'))
    sceneManager.getScene('main scene').add(table);

    const lights = getLights(sceneManager.getScene('main scene'), table)
    
    
    
    /*
    const cardsInGame = new Deck(socket,scene)
    const userManager = new UserManager(socket,scene)
    const raycaster = new THREE.Raycaster();

    const regions = [new Region(scene, 5/8,7/2)]
    regions.forEach (region => region.update({pos: [0.5,0.5]}))
    regions.forEach (region => scene.add(region.mesh))
    scene.userData.add(regions,regions)

    raycaster.setFromCamera({x: 1,y:1,z: 0.5},camera)
    raycaster.ray.origin.copy((new THREE.Vector3(1,1,0.5)).unproject(camera))
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


    //cube.position.set(-1,-1,-10).unproject(camera)
    //console.log(cube.position.copy(topLeft))
    var p = (new THREE.Vector3(1,1,0.5)).unproject(camera)
    var dir = p.sub( camera.position ).normalize();
    var distance = - camera.position.z / dir.z;
    var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );
    console.log(pos)
    cube.position.copy(pos)

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
    */

    document.addEventListener('keypress', event => {
        if (event.key == 1) {
            sceneManager.selectCamera('main camera')
        } else if (event.key == 2) {
            sceneManager.selectCamera('side camera')
        }
    })

    sceneManager.registerStep('update things', function (t) {
        //camera.userData.controls.update();
        lights.render()
        table.render()
        //userManager.render()
        //camera.userData.render()
    })


    sceneManager.schedule = [ 'update things']

    sceneManager.start()

});