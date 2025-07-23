function multiNumberHash(...nums: number[]): number {
    let hash = 0x811c9dc5;
    for (const num of nums) {
        let part = num;
        for (let i = 0; i < 4; i++) {
            const byte = part & 0xff;
            hash ^= byte;
            hash = (hash * 0x01000193) >>> 0;
            part >>= 8;
        }
    }
    return hash;
}

export default multiNumberHash;
