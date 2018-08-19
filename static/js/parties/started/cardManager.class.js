const CardManager = function CardManager(socket, me, scene, table) {

    const deck = this;
    this.allCards = [];
    this.tableCards = [];
    this.handCards = {};
    this.numOfUsers = null;
    this.userSides = null;

    this.refresh = function (cardsData) {
        let someHasChanged = false;

        // any new card has changed or has been created
        cardsData.forEach(cardData => {
            const index = this.allCards.findIndex(oldCard => cardData.id === oldCard.card_id);

            if (index < 0) {

                someHasChanged = true;

                const card = new Card(socket, scene);
                card.update(cardData, table);
                scene.add(card);

                this.allCards.push(card);
                if (cardData.place === 'table') {
                    this.tableCards.push(card);
                } else if (cardData.place === 'hand') {
                    this.handCards[cardData.user_id] = this.handCards[cardData.user_id] || [];
                    this.handCards[cardData.user_id].push(card);
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

    const calculeNumOfUsers = (userIndexes) => {
        
        const meIndex = Math.max(0,userIndexes.findIndex( id => id === me.id));

        this.numOfUsers = userIndexes.length;
        this.userSides = userIndexes.reduce((o, id, i) => {
            o[id] = ( (4 - meIndex) + i * Math.floor(4 / this.numOfUsers)) % 4;
            return o;
        }, {});
    }

    this.redraw = function () {

        for (const user_id in this.handCards) {
            const side = this.userSides[user_id];
            const cards = this.handCards[user_id];
            cards.forEach( (card, i) => {
                if (table.width > table.height) {

                } else {
                    if (side === 0) {
                        card.moveTo({
                            x: ( (7/8) - 0.5 ) * table.width,
                            y: ( ( 1/4 + (i+1) / (cards.length + 1) / 2 ) - 0.5 ) * table.height,
                        })
                    } else if ( side === 1) {
                        card.moveTo({
                            x: ((1 / 4 + (i + 1) / (cards.length + 1) / 2) - 0.5) * table.width,
                            y: ((7 / 8) - 0.5) * table.height,
                        })
                    } else if (side === 2) {
                        card.moveTo({
                            x: ((1 / 8) - 0.5) * table.width,
                            y: ((1 / 4 + (i + 1) / (cards.length + 1) / 2) - 0.5) * table.height,
                        })
                    } else if (side === 3) {
                        card.moveTo({
                            x: ((1 / 4 + (i + 1) / (cards.length + 1) / 2) - 0.5) * table.width,
                            y: ((1 / 8) - 0.5) * table.height,
                        })
                    }
                }
            });
        }
    };

    this.intersectCards = function (raycaster) {
        return raycaster.intersectObjects(this.allCards).map(a => a.object);
    };

    socket.on('cards_in_game', function (data) {
        data.forEach(cardData => cardData.place = 'table');
        deck.refresh(data);
    });

    socket.on('cards_in_hands', function (data) {
        
        const userIndex = data.map(userData => userData.player.id);
        calculeNumOfUsers(userIndex);

        data.forEach(userData => {
            userData.cards.forEach(cardData => {
                cardData.place = 'hand'
                cardData.user_id = userData.player.id
                cardData.team = deck.userSides[userData.player.id];
            })
            deck.refresh(userData.cards)
        });
    });

}