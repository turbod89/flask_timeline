const getLights = (scene,table) => {

    const t_w = table.width
    const t_h = table.height

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
            l: new THREE.PointLight(0xffffff, 0.9,100),
            p: l => t => {l.position.set(0,0,table.height/2)},
        },
    ]
    
    definitions.forEach (o => lights.push({
        light: o.l,
        render: o.p(o.l),
    }))

    lights.forEach( sl => {
        scene.add(sl.light)
        sl.render(0)
    })

    return lights
}

window.addEventListener('load', event => {

    const socket = io.connect('http://' + document.domain + ':' + location.port + '/party');
    socket.on('connect', () => {
        console.log(socket.id)
        socket.emit('join',g.party.token)
    })

    const canvas = document.getElementById('cv1')
    const sceneManager = new SceneManager(canvas)

    sceneManager
        .registerScene('main scene', scene => {
            scene.background = new THREE.Color( 0x000000 );
        })
        .registerCamera('main camera',{
            fov: 45,
            scene: 'main scene',
        }, camera => {

            
            //camera.add(new CameraModel(0xff0000))

            const R = 40
            const theta = 0.00 * 2 * Math.PI / 4
            camera.position.z = R * Math.cos(theta)
            camera.position.y = -R * Math.sin(theta)
            camera.lookAt(new THREE.Vector3(0, 0, 0))
            camera.orientation = camera.aspect < 1 ? 'portrait' : 'landscape'
            sceneManager.step()


        })

    const table = new Table(sceneManager.getCamera('main camera'))
    sceneManager.getScene('main scene').add(table);

    sceneManager
        .registerCamera('rotated camera',{
            fov: 45,
            scene: 'main scene',
        }, (camera,$) => {

            //camera.add(new CameraModel(0x00ff00))
            camera.rotateZ(Math.PI/2)
            camera.position.copy($.getCamera('main camera').position)
            console.log(camera.position)

        })
        .registerCamera('side camera',{
            fov: 45,
            scene: 'main scene',
        }, camera => {

            //camera.add(new CameraModel())

            const R = 100
            const theta = 0.25 * 2 * Math.PI / 4
            const phi = 1 * 2 * Math.PI / 4
            //camera.position.set(0,0,5)
            //camera.position.set(0,-R * Math.sin(theta), R * Math.cos(theta))
            //camera.rotateX(-theta)
            //camera.rotateZ(phi)
            camera.rotateZ(phi)
            camera.rotateX(theta)
            camera.position.set(R * Math.sin(theta) * Math.sin(phi),-R * Math.sin(theta) * Math.cos(phi), R * Math.cos(theta))
            //camera.lookAt(table.position)
            camera.updateProjectionMatrix()
        })

        .registerCamera('back camera', {
            fov: 45,
            scene: 'main scene',
        }, camera => {

            //camera.add(new CameraModel(0x0000ff))

            const R = 15
            const theta = 0.75 * 2 * Math.PI / 4
            const phi = 0.0 * 2 * Math.PI / 4
            //camera.position.set(0,0,5)
            //camera.position.set(0,-R * Math.sin(theta), R * Math.cos(theta))
            //camera.rotateX(-theta)
            camera.rotateZ(Math.PI)
            camera.rotateX(theta)
            camera.position.set(R * Math.sin(theta) * Math.sin(phi), R * Math.sin(theta) * Math.cos(phi), R * Math.cos(theta))
            //camera.lookAt(table.position)
            camera.updateProjectionMatrix()
        })
    
    const lights = getLights(sceneManager.getScene('main scene'), table)
    const cardManager = new CardManager(socket, sceneManager.getScene('main scene'), table)

    sceneManager.registerStep('update things', function (t) {
        //camera.userData.controls.update();
        lights.render(t)
        table.render(t)
        //userManager.render()
        //camera.userData.render()
    })

    sceneManager.schedule = [ 'update things']
       

    document.addEventListener('keypress', event => {
        const cameras = sceneManager.getCameras()
        const index = '123456789'.split('').findIndex(key => event.key === key)
        if (index >= 0) {
            sceneManager.selectCamera(cameras[index])
        }
    })

    window.addEventListener('resize', event => {
        const aspect = canvas.offsetWidth/canvas.offsetHeight
        const camera = sceneManager.getCamera('main camera')
        
        if (aspect <= 1 && camera.orientation === 'landscape') {
            camera.orientation = 'portrait'
            camera.rotateZ(-Math.PI/2)
        } else if (aspect >= 1 && camera.orientation === 'portrait') {
            camera.orientation = 'landscape'
            camera.rotateZ(Math.PI/2)
        }
    })

    const touchManager = new TouchManager(canvas)
    const raycaster = new THREE.Raycaster()

    const toScreenCoordinates = pos => ({
        x: (pos[0] / canvas.width) * 2 - 1,
        y: -(pos[1] / canvas.height) * 2 + 1,
    })

    touchManager.addEventListener('update', function (touch) {
        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components

        const touchPoint = toScreenCoordinates(touch.pos)

        raycaster.setFromCamera(touchPoint, sceneManager.getCurrentCamera());
        const intersects = raycaster.intersectObject(table,true);
        console.log(intersects)
        if (intersects.length > 0) {
            const point = intersects[0].point
            console.log(touch.cards)
            touch.cards.forEach((card, i) => {
                i > 0 || card.moveTo(point, table)
            })

        }


    })

    touchManager.addEventListener('add', function (touch) {
        const touchPoint = toScreenCoordinates(touch.pos)
        raycaster.setFromCamera(touchPoint, sceneManager.getCurrentCamera())
        touch.cards = cardManager.intersectCards(raycaster);
    })

    touchManager.addEventListener('remove', function (touch) {
        
        const touchPoint = toScreenCoordinates(touch.pos)

        if (touch.cards.length > 0) {
            raycaster.setFromCamera(touchPoint, sceneManager.getCurrentCamera())
            const intersectedRegions = []

            if (intersectedRegions.length > 0) {
                
            } else {
                touch.cards.forEach(card => {
                    card.moveTo(card.position)
                    card.emitPosition()
                })
            }
        }



    })

    sceneManager.start()


});



















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