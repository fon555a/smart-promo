type CompressOptions = {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number; // 0-1
    type?: 'image/jpeg' | 'image/png' | 'image/webp';
};

/**
 * ย่อและบีบอัดรูปภาพ แล้ว return เป็น Blob
 * @param file ไฟล์ต้นฉบับ
 * @param options ตั้งค่า
 */
export default async function compressImage(file: File, options: CompressOptions = {}): Promise<Blob> {
    const {
        maxWidth = 800,
        maxHeight = 800,
        quality = 0.7,
        type = 'image/jpeg',
    } = options;

    // โหลดรูป
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await img.decode();

    // คำนวณขนาดใหม่
    let width = img.width;
    let height = img.height;
    if (width > height) {
        if (width > maxWidth) {
            height = Math.round(height * (maxWidth / width));
            width = maxWidth;
        }
    } else {
        if (height > maxHeight) {
            width = Math.round(width * (maxHeight / height));
            height = maxHeight;
        }
    }

    // วาดลง canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Cannot get canvas context');
    ctx.drawImage(img, 0, 0, width, height);

    // แปลงเป็น Blob
    const blob: Blob = await new Promise((resolve) => {
        canvas.toBlob((b) => {
            if (b) resolve(b);
        }, type, quality);
    });

    return blob;
}
