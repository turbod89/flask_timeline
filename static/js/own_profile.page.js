$(document).ready(function (event) {

    /**
    *   Presets
    */
   
    const video = document.querySelector('video')
    const canvas = document.querySelector('#selfie-card canvas.card-img-top')
    const context = canvas.getContext('2d')
    const takeSelfieBtn = document.getElementById('takeSelfie-btn')
    const reTakeSelfieBtn = document.getElementById('reTakeSelfie-btn')
    const removeSelfieBtn = document.getElementById('removeSelfie-btn')
    const updateSelfieBtn = document.getElementById('updateSelfie-btn')
    const profileImgElement = document.getElementById('profile-img')
    const uploadPhotoBtn = document.getElementById('uploadPhoto-btn')

    const profileImg = new Image()
    profileImg.onload = () => {
        canvas.height = profileImg.height
        canvas.width = profileImg.width
        context.drawImage(profileImg, 0, 0, profileImg.width, profileImg.height,0,0,canvas.width, canvas.height )
    }

    const createSelfieInput = () => {
        const selfieInput = document.createElement('input')
        selfieInput.setAttribute('type', 'file')
        selfieInput.setAttribute('accept', 'image/*')
        return selfieInput
    }
    let selfieInput = createSelfieInput()
    const clearSelfieInput = () => {
        /*
        let selfieInputClone = selfieInput.cloneNode()
        selfieInput.parentNode.appendChild(selfieInputClone)
        selfieInput.parentNode.removeChild(selfieInput)
        selfieInput = selfieInputClone
        */
        selfieInput = createSelfieInput()
    }
    let currentStream = null
    const stopTracks = stream => (stream === null) || stream.getTracks().forEach(track => track.stop())
    let havePhoto = false
    let havePhotoFrom = null

    //
    // Take photo from file uploader
    //

    uploadPhotoBtn.addEventListener('click', event => {
        selfieInput.click()
        event.preventDefault()
    })

    selfieInput.addEventListener('change', event => {

        if (event.target.files.lentgth <= 0) {
            return
        }

        const file = event.target.files[0]
        const reader = new FileReader()
        reader.onload = () => {
            const img = new Image()
            img.onload = () => {
                console.log('here')
                canvas.height = img.height
                canvas.width = img.width
                context.drawImage(img, 0, 0)
                havePhoto = true
                havePhotoFrom = 'file'
                stopTracks(currentStream)
                video.classList.add('d-none')
                canvas.classList.remove('d-none')
                profileImgElement.classList.add('d-none')
                takeSelfieBtn.parentNode.classList.add('d-none')
                reTakeSelfieBtn.parentNode.classList.remove('d-none')
                updateSelfieBtn.parentNode.classList.remove('d-none')
            }
            img.src = reader.result
        }

        reader.readAsDataURL(file)
    })


    //
    // Take photo from cam
    //

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {

        const startStream = constraints => navigator.mediaDevices.getUserMedia(constraints)
            .then(mediaStream => {
                video.srcObject = mediaStream
                return mediaStream
            })

        navigator.mediaDevices.enumerateDevices()
            .then(devices => devices.reduce((prev, curr) => {
                if (curr.kind == 'videoinput') {
                    prev.push(curr)
                }
                return prev
            }, []))
            .then(videoDevices => {

                // set initial variables
                const constraints = {
                    audio: false,
                    video: {
                        facingMode: 'user'
                    }
                }
                let deviceIndex = 0

                // set configuration in terms of number of cams
                if (videoDevices.length == 0) {
                    //takeSelfieBtn.setAttribute('disabled',true)
                    takeSelfieBtn.classList.add('disabled')
                    return
                } else if (videoDevices.length == 1) {

                } else {
                    const a = document.createElement('a')
                    a.setAttribute('href', '#')
                    a.classList.add('btn')
                    a.classList.add('btn-info')
                    const i = document.createElement('i')
                    i.classList.add('fa')
                    i.classList.add('fa-sync-alt')
                    a.append(i)
                    document.querySelector('#selfie-card .card-body .btn-group').append(a)

                    a.addEventListener('click', event => {
                        event.preventDefault()
                        deviceIndex++
                        deviceIndex = deviceIndex % videoDevices.length

                        constraints.video = {
                            deviceId: videoDevices[deviceIndex].deviceId
                        }
                        stopTracks(currentStream)
                        startStream(constraints).then(stream => currentStream = stream)
                    })
                }

                // start stream
                // startStream(constraints).then(stream => currentStream = stream)

                // assign events
                takeSelfieBtn.addEventListener('click', event => {
                    if (currentStream === null) {
                        video.classList.remove('d-none')
                        canvas.classList.add('d-none')
                        profileImgElement.classList.add('d-none')
                        startStream(constraints).then(stream => currentStream = stream)
                    } else {
                        havePhoto = true
                        havePhotoFrom = 'cam'
                        canvas.height = video.videoHeight
                        canvas.width = video.videoWidth
                        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)
                        stopTracks(currentStream)
                        clearSelfieInput()

                        video.classList.add('d-none')
                        canvas.classList.remove('d-none')
                        profileImgElement.classList.add('d-none')

                        takeSelfieBtn.parentNode.classList.add('d-none')
                        reTakeSelfieBtn.parentNode.classList.remove('d-none')
                        updateSelfieBtn.parentNode.classList.remove('d-none')
                    }
                    event.preventDefault()
                })

                reTakeSelfieBtn.addEventListener('click', event => {
                    havePhoto = false
                    havePhotoFrom = null
                    startStream(constraints).then(stream => currentStream = stream)

                    video.classList.remove('d-none')
                    canvas.classList.add('d-none')
                    profileImgElement.classList.add('d-none')

                    takeSelfieBtn.parentNode.classList.remove('d-none')
                    reTakeSelfieBtn.parentNode.classList.add('d-none')
                    updateSelfieBtn.parentNode.classList.add('d-none')
                    event.preventDefault()
                })

                removeSelfieBtn.addEventListener('click', event => {
                    currentStream = null
                    havePhoto = false
                    havePhotoFrom = null

                    video.classList.add('d-none')
                    canvas.classList.add('d-none')
                    profileImgElement.classList.remove('d-none')

                    takeSelfieBtn.parentNode.classList.remove('d-none')
                    reTakeSelfieBtn.parentNode.classList.add('d-none')
                    updateSelfieBtn.parentNode.classList.add('d-none')
                    event.preventDefault()
                })
            })
    }

    updateSelfieBtn.addEventListener('click', event => {

        // Two sending steps (to optimice performance in low speed connections)
        //
        // 1. take a reduction of the photo (64px x 64px) and send
        // 2. send complete image

        let sendResizedImageData = () => {}
        let sendImageData = () => {}

        if (havePhoto && havePhotoFrom === 'cam') {
            // 1
            const smallSize = 64
            const minDimension = Math.min(canvas.width, canvas.height)
            const scale = smallSize / minDimension
            const resizedCanvas = document.createElement('canvas')
            const resizedContext = resizedCanvas.getContext('2d')
            resizedCanvas.width = smallSize
            resizedCanvas.height = smallSize
            resizedContext.drawImage(canvas, (canvas.width - minDimension) / 2, (canvas.height - minDimension) / 2, minDimension, minDimension, 0, 0, resizedCanvas.width, resizedCanvas.height)
            const resizedImageData = resizedCanvas.toDataURL()

            sendResizedImageData = () => {
                $.ajax({
                    url: "/api/profile/avatar",
                    type: 'POST',
                    dataType: 'json',
                    contentType: "application/json; charset=utf-8",
                    async: true,
                    data: JSON.stringify({image: resizedImageData}),
                    success: function (data) {
                        console.log(data);
                        sendImageData()
                    },
                    error: function (data) {
                        console.error(data)
                    }
                });
            }

            // 2
            const imageData = canvas.toDataURL()
            sendImageData = () => {
                $.ajax({
                    url: "/api/profile/avatar",
                    type: 'POST',
                    dataType: 'json',
                    contentType: "application/json; charset=utf-8",
                    async: true,
                    data: JSON.stringify({
                        image: imageData
                    }),
                    success: function (data) {
                        console.log(data);
                    },
                    error: function (data) {
                        console.error(data)
                    }
                });
            }

            sendResizedImageData()

        } else if (havePhoto && havePhotoFrom === 'file' && selfieInput.files.length > 0) {

            const file = selfieInput.files[0]
            const reader = new FileReader();
            reader.onload = function () {

                $.ajax({
                    url: "/api/profile/avatar",
                    type: 'POST',
                    dataType: 'json',
                    contentType: "application/json; charset=utf-8",
                    async: true,
                    data: JSON.stringify({
                        image: reader.result
                    }),
                    success: function (data) {
                        console.log(data);
                    },
                    error: function (data) {
                        console.error(data)
                    }
                });
            };
            reader.onerror = function (error) {
                console.log('Error: ', error);
            };
            reader.readAsDataURL(file);
        }

    })


    /**
     *  Get info 
     */
    
    $.ajax({
        url: "/api/profile",
        type: 'GET',
        contentType: "application/json; charset=utf-8",
        async: true,
        success: function (data) {
            console.log(data);

            profileImgElement.src = data.profile.avatar
            document.getElementById('complete-name').innerHTML = data.profile.first_name + ' ' + data.profile.last_name
        },
        error: function (data) {
            console.error(data)
        }
    });            
})
