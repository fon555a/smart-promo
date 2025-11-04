import axios from "axios";
import { assign, createMachine, fromPromise } from "xstate";

const sendMessageToServer = async (message: string, serverUrl: string) => {
    const url = "/api/announcements/ask_announcement"
    
    console.log("Url:", url)
    await axios.post(url, {
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
        },
        SET_SERVERURL: {
            actions: assign({
                serverUrl: ({ event }) => event.url
            })
        }
    },
    context: {
        message: "",
        serverUrl: ""
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
                CANCEL: "idle",
                SEND_SPEAK_DATA: "sending",

            }
        },
        sending: {
            invoke: {

                // src: fromPromise(async ({ input }) => true),
                src: fromPromise(async ({ input }) => sendMessageToServer(input.message, input.serverUrl)),
                input: (event) => ({
                    message: event.context.message,
                    serverUrl: event.context.serverUrl
                }),
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