import { createMachine } from "xstate";

export const testMachine = createMachine({
    id: "testMachine",
    initial: "idle",
    on: {
        ANNOUNCEMENT: ".announcementSpeaking"
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
                PROCESS_SPEAK: "processing",
                TIMEOUT: "idle"
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