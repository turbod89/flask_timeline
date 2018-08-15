const LightManager = function () {

    this.setLights = function (scene,table) {
        const t_w = table.width;
        const t_h = table.height;

        const definitions = [
            {
                l: new THREE.PointLight(0xffffff, 0.9,100),
                p: l => t => {l.position.set(0,0,table.height/2)},
            },
        ];
        
        definitions.forEach (o => this.push({
            light: o.l,
            render: o.p(o.l),
        }));

        this.forEach( sl => {
            scene.add(sl.light)
            sl.render(0)
        });

        return this;
    }


    this.render = function (t) {
        this.forEach (ls => ls.render(t));
    }

}

LightManager.prototype = Object.create(Array.prototype);