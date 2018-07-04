const Drawer = function (context) {

    const drawer = this

    let status = 0
    let fps = 0
    let lastFrameUpdate = 0
    let deltaTime = 0

    let resizeEventId = null

    this.step = () => this.schedule(context)

    const render = () => {
        if (status === 1) {
            window.requestAnimationFrame(render)
        }

        this.step()
        deltaTime = (Date.now() - lastFrameUpdate) / 1000
        fps = Math.round(1 / deltaTime)
        lastFrameUpdate = Date.now()
    }

    this.start = function () {
        status = 1
        render()
    }
    this.stop = function () {
        status = 0
    }

    this.resize = (auto = false) => {
        context.canvas.width = window.devicePixelRatio * context.canvas.offsetWidth
        context.canvas.height = window.devicePixelRatio * context.canvas.offsetHeight
        drawer.step()
        if (auto && resizeEventId === null) {
            resizeEventId = window.addEventListener('resize', event => drawer.resize())
        }
    }

    this.schedule = context => {}

    this.context = context

}