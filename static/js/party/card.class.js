const Card = function Card(socket,scene,w,h) {

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

    const geometry = new THREE.PlaneGeometry(w, h)

    const mesh = new THREE.Mesh(geometry, material)
    mesh.card = card
    card.mesh = mesh

    card.moveTo = function (point) {
        card.mesh.position.x = point.x
        card.mesh.position.y = point.y

    }

    card.emitPosition = function () {
        socket.emit('update_card', {
            id: card.id,
            pos: [
                (card.mesh.position.x / table.mesh.geometry.parameters.width) + 0.5,
                (card.mesh.position.y / table.mesh.geometry.parameters.height) + 0.5,
            ],
        })
    }

    card.update = function (data,table) {

        card.id = data.id
        card.title = data.title

        context.fillStyle = 'white'
        context.fillRect(0,0,128,128)
        context.fillStyle = 'black'
        context.font = '24px arial'
        context.fillText(card.title,4,64)

        card.moveable = card.moveable || true
        card.year = card.year || null
        
        card.mesh.position.x = (data.pos[0] - 0.5) * table.mesh.geometry.parameters.width
        card.mesh.position.y = (data.pos[1] - 0.5) * table.mesh.geometry.parameters.height
    }
    

    card.holdInfo = {}
    return card
}



const Deck = function Deck(socket,scene) {

    const deck = this
    this.meshes = []
    this.cards = []
    this.table = scene.userData.table
    this.scene = scene

    this.refresh = function (newDeck) {
        let someHasChanged = false

        // any new card has changed or has been created
        newDeck.forEach(cardData => {
            const index = this.cards.findIndex(oldCard => cardData.id === oldCard.id)

            if (index < 0) {
                someHasChanged = true

                const card = new Card(socket,scene,5/2,7/2)
                card.update(cardData,this.table)
                this.cards.push(card)
                this.meshes.push(card.mesh)
                this.scene.add(card.mesh)
                
                
            } else {
                const card = this.cards[index]
                card.update(cardData,this.table)
                

            }
        })

        if (someHasChanged) {
            this.redraw()
        }
    }

    this.redraw = function () {
        
    }

    this.intersectCards = function (raycaster) {
        return raycaster.intersectObjects(this.meshes).map(i => i.object.card)
    }

    socket.on('cards_in_game', function (data) {
        deck.refresh(data)
    })

}