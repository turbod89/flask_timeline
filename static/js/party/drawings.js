
const drawings = {


    background: context => {
        context.fillStyle = 'black'
        context.fillRect(0, 0, context.canvas.width, context.canvas.height)

    },













    rect: context => options => {

        if (!('size' in options) && ('bottomRight' in options)) {
            options.size = [
                options.bottomRight[0] - options.topLeft[0],
                options.bottomRight[1] - options.topLeft[1],
            ]
        } else if (('size' in options) && ('center' in options)) {
            options.topLeft = [
                options.center[0] - options.size[0]/2,
                options.center[1] - options.size[1]/2,
            ]
        } else {
            console.error('On \'Rect\': Exactly one of size or bottomRight propieties should be specified')
        }

        options.borderColor = options.borderColor || 'white'
        options.borderColorShadow = options.borderColorShadow || options.borderColor
        options.borderColorLight = options.borderColorLight || options.borderColor
        options.borderWidth = options.borderWidth || 1
        options.borderRadius = options.borderRadius || 0
        options.backgroundColor = options.backgroundColor || 'white'

        const R = options.borderRadius
        const w = options.size[0]
        const h = options.size[1]
        const tl = options.topLeft

        context.fillStyle = options.backgroundColor
        context.beginPath()
        context.moveTo(tl[0] + R, tl[1])
        context.lineTo(tl[0] + w - R, tl[1])
        context.arc(tl[0] + w - R, tl[1] + R, R, -2 * Math.PI / 4, 0, false)
        context.lineTo(tl[0] + w, tl[1] + h - R)
        context.arc(tl[0] + w - R, tl[1] + h - R, R, 0, 2 * Math.PI / 4, false)
        context.lineTo(tl[0] + R, tl[1] + h)
        context.arc(tl[0] + R, tl[1] + h - R, R, 2 * Math.PI / 4, 2 * 2 * Math.PI / 4, false)
        context.lineTo(tl[0], tl[1] + R)
        context.arc(tl[0] + R, tl[1] + R, R, 2 * 2 * Math.PI / 4, 3 * 2 * Math.PI / 4, false)
        context.fill()
        context.closePath()

        context.strokeStyle = options.borderColorLight
        context.lineWidth = options.borderWidth
        context.beginPath()
        context.moveTo(tl[0] + R, tl[1])
        context.lineTo(tl[0] + w - R, tl[1])
        context.arc(tl[0] + w - R, tl[1] + R, R, -2 * Math.PI / 4, 0, false)
        context.lineTo(tl[0] + w, tl[1] + h - R)
        context.arc(tl[0] + w - R, tl[1] + h - R, R, 0, 2 * Math.PI / 8, false)
        context.moveTo(tl[0] + R * (1 -Math.SQRT1_2), tl[1] + R * (1- Math.SQRT1_2))
        context.arc(tl[0] + R, tl[1] + R, R, 5 * Math.PI / 4, 3 * 2 * Math.PI / 4, false)
        context.stroke()
        context.closePath()

        context.strokeStyle = options.borderColorShadow
        context.lineWidth = options.borderWidth
        context.beginPath()
        
        context.moveTo(tl[0] + w - R * (1 - Math.SQRT1_2), tl[1] + h - R * (1 - Math.SQRT1_2))
        context.arc(tl[0] + w - R, tl[1] + h - R, R, Math.PI/4, 2 * Math.PI / 4, false)
        context.lineTo(tl[0] + R, tl[1] + h)
        context.arc(tl[0] + R, tl[1] + h - R, R, 2 * Math.PI / 4, 2 * 2 * Math.PI / 4, false)
        context.lineTo(tl[0], tl[1] + R)
        context.arc(tl[0] + R, tl[1] + R, R, 2 * 2 * Math.PI / 4, 5 * Math.PI / 4, false)
        context.stroke()
        context.closePath()

    },





    label: context => (text,options={}) => {

        options.borderColor = options.borderColor || 'white'
        options.borderColorShadow = options.borderColorShadow || options.borderColor
        options.borderColorLight = options.borderColorLight || options.borderColor
        options.borderWidth = options.borderWidth || 1
        options.borderRadius = options.borderRadius || 0
        options.backgroundColor = options.backgroundColor || 'white'
        options.color = options.color || 'black'
        options.fontFamily = options.fontFamily || 'arial'

        if (('topLeft' in options) && ('bottomRight' in options)) {
            options.size = [
                options.bottomRight[0] - options.topLeft[0],
                options.bottomRight[1] - options.topLeft[1],
            ]
        }
        
        if (!('fontSize' in options ) && ('size' in options)) {
            context.font = '10px ' + options.fontFamily
            const measure = context.measureText(' '+text+' ')
            options.fontSize = Math.floor(10*options.size[0]/measure.width)
        }
        
        if (('size' in options) && ('center' in options)) {
            options.topLeft = [
                options.center[0] - options.size[0] / 2,
                options.center[1] - options.size[1] / 2,
            ]
        }

        options.size[1] = options.size[1] || 1.6*options.fontSize

        drawings.rect(context)(options)
        context.textBaseline = 'middle'
        context.fillStyle = options.color
        context.font = options.fontSize+'px '+options.fontFamily
        
        context.fillText(' '+text,options.topLeft[0],options.topLeft[1] + options.size[1]/2)
    },





















    circle: context => (center, radius, options = {}) => {
        options.color = options.color || 'white'
        options.lineWidth = options.lineWidth || 3

        context.strokeStyle = options.color
        context.lineWidth = options.lineWidth
        context.beginPath()
        context.moveTo(center[0] + radius, center[1])
        context.arc(center[0], center[1], radius, 0, 2 * Math.PI)
        context.stroke()
        context.closePath()


    },
}