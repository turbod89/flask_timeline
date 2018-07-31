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

        card.id = data.id
        card.title = data.title

        context.fillStyle = 'purple'
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



const CardManager = function CardManager(socket, me, scene, table) {
    console.log(me);

    const deck = this;
    this.allCards = [];
    this.tableCards = [];
    this.handCards = [];

    this.refresh = function (cardsData) {
        let someHasChanged = false;

        // any new card has changed or has been created
        cardsData.forEach(cardData => {
            const index = this.allCards.findIndex(oldCard => cardData.id === oldCard.id);

            if (index < 0) {
                someHasChanged = true;

                const card = new Card(socket, scene);
                card.update(cardData, table);
                scene.add(card);
                console.log(card);

                this.allCards.push(card);
                if (cardData.place === 'table') {
                    this.tableCards.push(card);
                } else if (cardData.place === 'hand') {
                    this.handCards.push(card);
                }


            } else {
                const card = this.allCards[index];
                card.update(cardData, table);


            }
        });

        if (someHasChanged) {
            this.redraw();
        }
    }

    this.redraw = function () {
        this.tableCards.forEach ( (card,i) => card.moveTo({
            x: table.width > table.height ?
                ((i + 1) / (this.tableCards.length + 1) -0.5) * table.width
                : 0,
            y: table.width > table.height ?
                0
                : ((i + 1) / (this.tableCards.length + 1) - 0.5) * table.height,
        }))

        this.handCards.forEach((card, i) => card.moveTo({
            x: table.width > table.height ?
                ((i + 1) / (this.handCards.length + 1) -0.5) * table.width
                : table.width / 6,

            y: table.width > table.height ?
                table.height / 6
                : ((i + 1) / (this.handCards.length + 1) - 0.5) * table.height,
        }))
    };

    this.intersectCards = function (raycaster) {
        return raycaster.intersectObjects(this.allCards).map(a => a.object);
    };

    socket.on('cards_in_game', function (data) {
        data.forEach(cardData => cardData.place = 'table');
        deck.refresh(data);
    });

    socket.on('cards_in_hands', function (data) {
        data.forEach(user => {
            user.cards.forEach( cardData => cardData.place = 'hand')
            deck.refresh(user.cards)
        });
    });

}