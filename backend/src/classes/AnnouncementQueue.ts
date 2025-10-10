import Announcement from "./Announcement";

type QueueConfig = {
    endTime: number,

}

class Queue {
    public instance: Announcement
    public isStarted: boolean = false
    public endTime: number
    public startAt: number | null = null

    private endTimeout: NodeJS.Timeout | null = null

    public onEnd: (() => void) | null = null
    public onCancel: (() => void) | null = null

    constructor(instance: Announcement, config: QueueConfig) {
        this.instance = instance

        this.endTime = config.endTime
    }


    public start() {
        this.isStarted = true
        this.endTimeout = setTimeout(() => {
            if (this.onEnd) {
                console.log("End sec:", this.endTime)
                this.onEnd()

            }
        }, this.endTime);

    }

    public destroy() {
        if (this.endTimeout) clearTimeout(this.endTimeout)
        if (this.onCancel) this.onCancel()

        this.onCancel = null as any
    }
}

type Params = {
    onQueueStart: (instance: Announcement) => void,
    onQueueEnd: (instance: Announcement) => void,
}

export class AnnouncementQueue {
    private queue: Array<Queue> = []
    private isAnnouncing: boolean = false

    private currentQueue: Queue | null = null
    private onQueueStart: (instance: Announcement) => void
    private onQueueEnd: (instance: Announcement) => void

    constructor(params: Params) {
        this.onQueueStart = params.onQueueStart
        this.onQueueEnd = params.onQueueEnd

    }

    public addQueue(instance: Announcement, endTime: number) {

        const newQueue = new Queue(instance, {

            endTime: endTime,
        })
        this.queue.push(newQueue)

        if (!this.isAnnouncing) {
            this.startNext()
        }
    }

    public getAllQueue(): Array<Queue> {
        return this.queue
    }

    public getCurrentQueue(): Queue | null {
        return this.currentQueue
    }

    private async startNext() {
        if (this.isAnnouncing) {
            console.error("Still announcing.")
            return false
        }

        if (this.queue.length === 0) return false

        this.isAnnouncing = true
        while (this.queue.length !== 0) {
            const nextQueue = this.queue.shift() as Queue

            if (!nextQueue) {
                console.log("There's no queue anymore.")
                return false
            }

            this.currentQueue = nextQueue
            await this.start(nextQueue)
        }

        this.currentQueue = null
        this.isAnnouncing = false
    }

    private start(queue: Queue) {
        this.onQueueStart(queue.instance)

        return new Promise((resolve) => {
            queue.onEnd = () => {
                this.onQueueEnd(queue.instance)
                resolve(null)
            }

            queue.onCancel = () => {
                resolve(null)
            }

            queue.start()
        })
    }
}