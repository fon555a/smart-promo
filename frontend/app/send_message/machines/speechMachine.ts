import { createMachine } from "xstate"

export const speechMachine = createMachine({
    id: "speech",
    initial: "idle",
    on: {
        ANNOUNCEMENT: "speakingAnnouncement"
    },
    states: {
        idle: {
            on: {
                FACE_ENTER: "listening"
            }
        },
        speakingAnnouncement: {
            on: {
                DONE: "idle"
            }
        },
        listening: {
            on: {
                TIMEOUT: "processing",
            }
        },
        
        processing: {
            on: {
                GOT_ANSWER: "speakingAnswer",
            
            }
        },
        speakingAnswer: {
            on: {
                DONE: "idle"
            }
        }
    }
})