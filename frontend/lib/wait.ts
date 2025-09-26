export default function wait(ms: number) {
    return new Promise<null>((resolve) => {
        return setTimeout(() => resolve(null), ms)
    })
}