const Card = function Card(socket, scene) {

    const card = this

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.width = 128
    canvas.height = 128
    const texture = new THREE.Texture(canvas)
    texture.needsUpdate = true;

    const material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        map: texture,
        specularMap: texture,
    });

    THREE.Mesh.apply(this, [Card.geometry, material]);

    card.moveTo = function (point) {
        card.position.x = point.x
        card.position.y = point.y
    }

    card.update = function (data, table) {

        card.card_id = data.id
        card.title = data.title

        card.user_id = data.user_id || null

        context.fillStyle = data.team || data.team === 0 ? (['red','green','blue','yellow'])[data.team] : 'grey'
        context.fillRect(0, 0, 128, 128)
        context.fillStyle = 'black'
        context.font = '24px arial'
        context.textBaseline = 'middle'
        const width = context.measureText(card.title).width
        context.fillText(card.title, 64 - width / 2, 64)

        card.moveable = card.moveable || true
        card.year = card.year || null

    }

}
Card.prototype = Object.create(THREE.Mesh.prototype)

Card.geometry = new THREE.PlaneGeometry(1, 1)
Card.modelLoader = new THREE.BufferGeometryLoader();

// load a resource
Card.modelLoader.load(
    // resource URL
    '/static/models/card.geometry.json',

    // onLoad callback
    function (geometry) {
        console.log('Card geometry loaded');
        geometry.scale = new THREE.Vector3(2, 2, 2);
        Card.geometry = geometry;
    },

    // onProgress callback
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },

    // onError callback
    function (err) {
        console.log('An error happened');
    }
);