const User = function (socket,scene) {

    const avatar = {}
    const table = scene.userData.table
    const camera = scene.userData.get('SUBJECTIVE_CAMERA')
    const w = 2, h = 2, f_w = 0.2, f_d = 0.1

    avatar.texture = new THREE.Texture()
    avatar.normal = new THREE.Vector3(0,0,1)
    avatar.material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        map: avatar.texture,
        metalness: 0.8,
        roughness: 0.8,
    })
    avatar.image = null

    avatar.geometry = new THREE.PlaneGeometry(w,h)
    avatar.mesh = new THREE.Mesh(avatar.geometry,avatar.material)
    this.clock = new THREE.Clock()

    const sphere_bGeometry = new THREE.SphereBufferGeometry(0.25, 16, 8)
    
    const lightDefinitions = [
        {
            light: new THREE.PointLight(0xff7777, 0.9, 3*h + 1),
            render: l => t => l.position.set(0,h/2,1),
        },
        
    ]

    const lamps = lightDefinitions.map(ls => {
        const s = new THREE.Mesh(sphere_bGeometry, new THREE.MeshBasicMaterial({
            color: ls.light.color
        }))
        ls.setColor = color => {
            ls.light.color.setHex(color)
            s.material.color.setHex(color)
            s.material.needsUpdate = true
            ls.light.needsUpdate = true
        }
        ls.light.add(s)
        return s
    })

    lightDefinitions.forEach(ld => avatar.mesh.add(ld.light))
    
    this.avatar = avatar
    scene.add(avatar.mesh)
    
    this.update = function (data, position) {
        this.id = data.id
        this.email = data.email
        const d = table.mesh.geometry.parameters.height / 4
        const l = table.mesh.geometry.parameters.height /2 + 1*h
        this.avatar.mesh.position.set(
            -table.mesh.geometry.parameters.width / 4 + (w + 3 * f_w) * position,
            d,
            camera.position.z * (l-d)/(l - camera.position.y),
        )
        
        const camera_rot = camera.position.clone().normalize().multiplyScalar(1)
        const q = new THREE.Quaternion()
        q.setFromUnitVectors(avatar.normal, camera_rot);
        this.avatar.mesh.applyQuaternion(q)

        console.log(data)
        if (data.connected) {
            lightDefinitions[0].setColor( 0xffffff)
        } else {
            lightDefinitions[0].setColor( 0xff7777)
        }

        if (avatar.image === null) {
            
            const p = new Promise (( resolve, reject) => {
                $.post({
                    method: 'GET',
                    url: '/api/profile/'+data.id,
                    dataType: 'json',
                    contentType: 'application/json',
                    success: response => resolve(response),
                    error: response => reject(response),
                })
            })

            p.then(response => {
                const img = new Image()
                img.onload = () => {
                    console.log(img)
                    avatar.material.map = new THREE.Texture(img)
                    avatar.material.map.needsUpdate = true
                    avatar.image = img
                }
                img.src = response.profile.avatar
                
            })
        }
    }

    this.render = function () {
        const t = this.clock.getElapsedTime()
        lightDefinitions.forEach( ld => {
            ld.render(ld.light)(t)
        })
    }
}

const UserManager = function (socket,scene) {

    const userManager = this
    const table = scene.userData.table
    this.users = []

    socket.on('connected_users', function (data) {
        console.log(data)
        data.players.forEach ((userData,i) => {
            const index = userManager.users.findIndex(user => user.id === userData.id)

            if (index < 0) {
                const user = new User(socket,scene)
                user.update(userData,i)
                userManager.users.push(user)
            }
        })
    })

    this.render = function() {
        this.users.forEach( user => user.render())
    }
}