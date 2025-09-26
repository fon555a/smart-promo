type Data = {
    id: number,
    text: string,
    imagesList: Array<string>,
}

export default class Announcement {
    private data: Data

    constructor(data: Data) {
        this.data = data
    }
}