'use client'

import { createCamps } from "@/utils/actions"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"

const SubmitButton = () => {
    const { pending } = useFormStatus()
    return <button type="submit">
    {
        pending 
        ? 'Submitting'
        : 'Submit'
    }
    </button>
}

const Form = () => {

    const [message, formAction] = useActionState(createCamps, null)

    return (
        <>
            {message && <h1>{message}</h1>}
            <form action={formAction}>
                form

                <input
                    type="text"
                    name="camping-name"
                    placeholder="camping name"
                    defaultValue={"idk"}
                />
                <input
                    type="text"
                    name="location"
                    placeholder="location"
                    defaultValue={"thailand"}
                />

                <SubmitButton/>
            </form>
        </>

    )
}
export default Form