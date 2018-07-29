const Card = function Card(socket,scene) {

    
    const card = this
    const table = scene.userData.table
    
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
    
    Card.geometry.scale(2,2,2)
    THREE.Mesh.apply(this,[Card.geometry,material]);
    
    card.moveTo = function (point) {
        card.position.x = point.x
        card.position.y = point.y
    }

    card.emitPosition = function () {
        socket.emit('update_card', {
            id: card.id,
            pos: [
                (card.position.x / table.width) + 0.5,
                (card.position.y / table.height) + 0.5,
            ],
        })
    }

    card.update = function (data,table) {

        card.id = data.id
        card.title = data.title

        context.fillStyle = 'purple'
        context.fillRect(0,0,128,128)
        context.fillStyle = 'black'
        context.font = '24px arial'
        context.textBaseline = 'middle'
        const width = context.measureText(card.title).width
        context.fillText(card.title,64-width/2,64)

        card.moveable = card.moveable || true
        card.year = card.year || null
        
        card.position.x = (data.pos[0] - 0.5) * table.width
        card.position.y = (data.pos[1] - 0.5) * table.height
    }
    
}
Card.prototype = Object.create(THREE.Mesh.prototype)

Card.geometry = new THREE.PlaneGeometry(1,1)
Card.modelLoader = new THREE.BufferGeometryLoader();

// load a resource
Card.modelLoader.load(
	// resource URL
	'/static/models/card.geometry.json',

	// onLoad callback
	function ( geometry ) {
        console.log('Card geometry loaded')
		Card.geometry = geometry
	},

	// onProgress callback
	function ( xhr ) {
		console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
	},

	// onError callback
	function( err ) {
		console.log( 'An error happened' );
	}
);



const CardManager = function CardManager(socket,scene,table) {

    const deck = this
    this.cards = []

    this.refresh = function (cardsData) {
        let someHasChanged = false

        // any new card has changed or has been created
        cardsData.forEach(cardData => {
            const index = this.cards.findIndex(oldCard => cardData.id === oldCard.id)

            if (index < 0) {
                someHasChanged = true

                const card = new Card(socket,scene)
                card.update(cardData,table)
                this.cards.push(card)
                scene.add(card)
                console.log(card)
                
                
            } else {
                const card = this.cards[index]
                card.update(cardData,table)
                

            }
        })

        if (someHasChanged) {
            this.redraw()
        }
    }

    this.redraw = function () {}

    this.intersectCards = function (raycaster) {
        return raycaster.intersectObjects(this.cards).map(a => a.object)
    }

    socket.on('cards_in_game', function (data) {
        deck.refresh(data)
    })

    socket.on('cards_in_hands', function (data) {
        console.log(data)
    })

}