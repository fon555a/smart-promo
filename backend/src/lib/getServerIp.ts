import os from "os"

export default () => {
    const nets = os.networkInterfaces();
    for (const details of Object.values(nets)) {
        if (details) {
            for (const detail of details) {
                if (detail.family === "IPv4" && !detail.internal) {
                    return detail.address;
                }
            }
        }

    }
    return "127.0.0.1";
}
