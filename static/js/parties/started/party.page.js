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
    
    const lightManager = new LightManager();
    const cardManager = new CardManager(socket,g.me, sceneManager.getScene('main scene'), table)
    
    lightManager.setLights(sceneManager.getScene('main scene'), table);

    sceneManager.registerStep('update things', function (t) {
        //camera.userData.controls.update();
        lightManager.render(t)
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
        if (intersects.length > 0) {
            const point = intersects[0].point
            touch.cards.forEach((card, i) => {
                i > 0 || card.user_id !== g.me.id || card.moveTo(point, table)
            })

        }


    })

    touchManager.addEventListener('add', function (touch) {
        const touchPoint = toScreenCoordinates(touch.pos)
        raycaster.setFromCamera(touchPoint, sceneManager.getCurrentCamera())
        touch.cards = cardManager.intersectCards(raycaster);
        touch.cards.forEach((card, i) => {
            if (i > 0 ) {} else { card.position.z += 1; }
        })
    })

    touchManager.addEventListener('remove', function (touch) {
        
        const touchPoint = toScreenCoordinates(touch.pos)

        if (touch.cards.length > 0) {
            raycaster.setFromCamera(touchPoint, sceneManager.getCurrentCamera())
            const intersectedRegions = []

            if (intersectedRegions.length > 0) {
                
            } else {
                touch.cards.forEach((card,i) => {
                    card.moveTo(card.position)
                    if (i > 0 ) {} else { card.position.z -= 1; }
                })
            }
        }



    })

    sceneManager.start()


});