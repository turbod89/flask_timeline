const FormParser = function (metadata) {

    const data = {}
    Object.defineProperty(this, 'data', {
        enumerable: true,
        modificable: false,
        get: () => {
            const sendData = {};
            for (let inputId in metadata) {
                const fieldMetadata = metadata[inputId]

                if (!(fieldMetadata.sendName in data)) {
                    // do nothing
                } else if (!fieldMetadata.send) {
                    // do nothing
                } else {
                    sendData[fieldMetadata.sendName] = data[fieldMetadata.sendName]
                }
            }
            return sendData
        }
    })

    this.parse = function () {
        // parse data
        for (let inputId in metadata) {
            const fieldMetadata = metadata[inputId]
            const input = document.getElementById(inputId)
            if (input === null && fieldMetadata.required) {
                // required field not provided
                return
            } else if (input === null) {
                // do nothing
            } else {
                data[fieldMetadata.sendName] = fieldMetadata.parser(input.value)
            }
        }
        return this
    }

    this.validate = function (onValidationError) {
        // validate data
        for (let inputId in metadata) {
            const fieldMetadata = metadata[inputId]
            const fieldData = fieldMetadata.sendName in data ? data[fieldMetadata.sendName] : null

            if (fieldData === null) {
                // do nothing
            } else if (fieldMetadata.validator(fieldData, data)) {
                // success validation
            } else {
                // error on validation
                return onValidationError(inputId, fieldData, data)
            }
        }

        return this
    }

}


//
//	On ready
//


$(document).ready(function (event) {

    //
    // Define constants
    //

    const createPartyForm = document.querySelector('.form-create-party')

    const createPartyFormMetadata = {
        'inputParty_name': {
            'sendName': 'name',
            'send': true,
            'required': true,
            'parser': value => value.trim(),
            'validator': (value, data) => true,
        },
    }


    //
    //  submit form (via ajax)
    //

    createPartyForm.addEventListener('submit', event => {
        event.preventDefault()
        const onValidationError = (inputId, fieldData, data) => console.log('Validation error on field \'' + inputId + '\': Obtained value: ' + fieldData + '')
        const fp = new FormParser(createPartyFormMetadata)
        fp.parse().validate(onValidationError)

        $.ajax({
            url: "/api/parties/",
            type: 'POST',
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            async: true,
            data: JSON.stringify(fp.data),
            success: function (data) {
                console.log(data);
                if (data.errors && data.errors.length === 0) {
                    // success
                    window.location.replace('/parties/')
                } else {
                    // fail
                }
            },
            error: function (data) {
                console.error(data)
            }
        });

    })


})