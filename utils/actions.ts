'use server'

export const createCamps = async (prevState, formData: FormData) => {
    const rawData = Object.fromEntries(formData)
    console.log("Create camp!!", rawData)

    // redirect("/")
    return "create success"
}

export const fetchCamps = async () => {
    const campsData = [
        {
            id: 1,
            name: "Wtasdwa",
            description: "Test"
        },
        {
            id: 2,
            name: "Wtasdwa",
            description: "Test"
        },
        {
            id: 3,
            name: "Wtasdwa",
            description: "Test"
        },
        {
            id: 4,
            name: "Wtasdwa",
            description: "Test"
        },
        
    ]

    return campsData
}