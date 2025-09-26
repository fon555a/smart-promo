class Queue {
    
}

export default class AudioBufferQueue {
    private queue: ArrayBuffer[] = []
    private isPlaying: boolean = false
    private audioContext: AudioContext
    
    public onSuccess: () => void

    constructor() {
        this.audioContext = new AudioContext()
    }

    public addQueue(audioBuffer: ArrayBuffer) {
        this.queue.push(audioBuffer)
        if (!this.isPlaying) {
            this.playNext()
        }
    }

    private async playNext() {
        if (this.queue.length === 0) {
            console.log("There's no audio queue anymore")
            this.isPlaying = false
            return false
        }

        this.isPlaying = true
        const arrayBuffer = this.queue.shift()
        await this.playAudio(arrayBuffer)

        if (this.queue.length === 0 && this.onSuccess) {
            this.onSuccess()
        }
        
        this.playNext()
        
    }

    private async playAudio(arrayBuffer: ArrayBuffer) {
        const audioCtx = this.audioContext
        const decodedData = await audioCtx.decodeAudioData(arrayBuffer)
        try {
            return new Promise((resolve) => {

                const source = audioCtx.createBufferSource();
                source.buffer = decodedData;
                source.connect(audioCtx.destination);
                source.onended = () => {
                    resolve(null)
                }

                source.start(0);
            })

        } catch (error) {
            throw error
        }

    }

    public destroy() {
        this.audioContext.close()
    }
}