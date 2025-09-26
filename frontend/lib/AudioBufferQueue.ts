import wait from "./wait"


type PlaySetting = {
    repeatCount: number,
    repeatDelaySeconds: number
}

class Queue {
    public isPlaying: boolean = false
    public onSuccess?: () => void = null

    private queue: Array<{
        arrayBuffer: ArrayBuffer,
        playSetting: PlaySetting
    }> = []
    private id: string = ""

    constructor(id: string, onSuccess?: () => void) {
        this.id = id
        this.onSuccess = onSuccess
    }

    public addQueue(arrayBuffer: ArrayBuffer, playSetting: PlaySetting) {
        this.queue.push({
            arrayBuffer: arrayBuffer,
            playSetting: playSetting
        })
    }

    public shift() {
        return this.queue.shift()
    }

    public length = (): number => this.queue.length
}

export default class AudioBufferQueue {
    private audioContext: AudioContext
    private queueList: { [key: string]: Queue } = {}

    public onSuccess: () => void

    constructor() {
        this.audioContext = new AudioContext()
    }

    public createQueue(queueId: string, onSuccess: () => void) {
        const queue = new Queue(queueId, onSuccess)
        this.queueList[queueId] = queue
    }

    public addQueue(queueId: string, audioBuffer: ArrayBuffer, playSetting: PlaySetting) {
        const queue: Queue = this.queueList[queueId]

        if (!queue) {
            console.log(`The "${queueId}" queue doesn't exist.`)
            return false
        }

        queue.addQueue(audioBuffer, playSetting)

        if (!queue.isPlaying) {
            this.playNext(queue)
        }
    }

    private async playNext(queue: Queue) {
        if (queue.isPlaying) return false
        if (queue.length() === 0) {
            console.log("There's no audio queue anymore")
            queue.isPlaying = false
            return false
        }

        queue.isPlaying = true

        while (queue.length() > 0) {
            const queueData = queue.shift()
            await this.playAudio(queueData.arrayBuffer, queueData.playSetting)
        }

        queue.isPlaying = false
        if (queue.onSuccess) queue.onSuccess()

    }

    private async playAudio(arrayBuffer: ArrayBuffer, playSetting: PlaySetting) {
        const audioCtx = this.audioContext
        const decodedData = await audioCtx.decodeAudioData(arrayBuffer)
        const playCount = playSetting.repeatCount
        const delaySecondsTime = playSetting.repeatDelaySeconds

        for (let count = 0; count < playCount; count++) {
            await new Promise<void>((resolve) => {
                const source = audioCtx.createBufferSource();
                source.buffer = decodedData;
                source.connect(audioCtx.destination);
                source.onended = () => {
                    resolve(null)
                }
                source.start(0);
            })
            await wait(delaySecondsTime * 1000)
        }

        
    }

    public destroy() {
        this.audioContext.close()
    }
}