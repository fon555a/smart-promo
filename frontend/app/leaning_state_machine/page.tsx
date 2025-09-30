'use client'
import { useMachine } from "@xstate/react"
import { testMachine } from "./testMachine"

const LeaningPage = () => {
    const [state, send] = useMachine(testMachine)
    return (
        <div>
            <h1>State: {state.value as string}</h1>
            <div className="flex flex-col gap-4">
                <button onClick={() => send({ type: "FACE_ENTER" })}>face enter</button>
                <button onClick={() => send({ type: "TIMEOUT" })}>face leave</button>

                <button onClick={() => send({ type: "ANNOUNCEMENT" })}>announcement speaking</button>
                <button onClick={() => send({ type: "ANNOUNCEMENT_SPEAK_SUCCESS" })}>announcement success</button>
                
                <button onClick={() => send({ type: "ANSWER_SPEAK_SUCCESS" })}>answer speak success</button>

                <button onClick={() => send({ type: "PROCESS_SPEAK" })}>process speak</button>

                <button onClick={() => send({ type: "PROCESSING_SUCCESS" })}>processing success</button>
            </div>

        </div>
    )
}
export default LeaningPage