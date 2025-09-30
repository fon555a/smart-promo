import axios from "axios";
import { assign, createMachine, fromPromise } from "xstate";
import "dotenv/config"


const sendMessageToServer = async (message: string) => {
    await axios.post(process.env.NEXT_PUBLIC_API_URL + "/api/announcements/ask_announcement", {
        text: message
    })
}

export const speechMachine = createMachine({
    id: "speechMachine",
    initial: "idle",
    on: {
        ANNOUNCEMENT: ".announcementSpeaking",
        RESET_MESSAGE: {
            actions: assign({
                message: ""
            })
        }
    },
    context: {
        message: ""
    },
    states: {
        idle: {
            on: {
                FACE_ENTER: "listening"

            }
        },
        announcementSpeaking: {
            on: {
                ANNOUNCEMENT_SPEAK_SUCCESS: "idle"
            }
        },
        listening: {
            on: {
                TIMEOUT: "idle",
                START_TALKING: "userTalking"
            }
        },
        userTalking: {
            on: {
                SET_MESSAGE: {
                    actions: assign({
                        message: ({ event }) => event.text
                    })
                },
                SEND_SPEAK_DATA: "sending",

            }
        },
        sending: {
            invoke: {

                // src: fromPromise(async ({ input }) => true),
                src: fromPromise(async ({ input }) => sendMessageToServer(input.message)),
                input: (event) => ({ message: event.context.message }),
                onDone: { target: "processing" },
                onError: {
                    target: "idle",
                    actions: ({ event }) => {
                        console.error("Error from sending:", event.error)
                    }
                }
            }
        },
        processing: {
            on: {
                PROCESSING_SUCCESS: "answerSpeaking"
            }
        },
        answerSpeaking: {
            on: {
                ANSWER_SPEAK_SUCCESS: "idle"
            }
        }
    }
})