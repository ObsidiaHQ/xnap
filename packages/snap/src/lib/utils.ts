import { ALPHABET, BlockExplorers, RepAccounts, RpcEndpoints } from "./constants";
const MersenneTwister = require('mersenne-twister');

export function isValidAddress(address: string | undefined): boolean {
    const pattern = new RegExp(`^(nano_|xrb_)[13]{1}[${ALPHABET}]{59}$`);
    return !!address && pattern.test(address);
}

export function truncateAddress(address: string) {
    if (!address) return "";
    if (!isValidAddress(address)) return address;
    return `${address.slice(0, 11)}...${address.slice(-5)}`;
};

export function formatRelativeDate(date: string) {
    const now = new Date();
    const input = new Date(parseInt(date + '000'));
    const diffMs = +now - +input;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    // Helper function to format date without Intl
    function formatDate(date: Date) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const d = date.getDate();
        const m = months[date.getMonth()];
        const y = date.getFullYear();
        return `${m} ${d}, ${y}`;
    }

    // If less than a minute ago
    if (diffSecs < 60) {
        return diffSecs <= 10 ? 'just now' : `${diffSecs}s ago`;
    }
    // If less than an hour ago
    if (diffMins < 60) {
        return `${diffMins}m ago`;
    }
    // If less than a day ago
    if (diffHours < 24) {
        return `${diffHours}h ago`;
    }
    // If less than a month ago
    if (diffDays < 30) {
        return `${diffDays}d ago`;
    }
    // Otherwise return formatted date
    return formatDate(input);
}

/**
 * 
 * @param seed 
 * @param size default is 30
 * @copyright MetaMask 2020: THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
    WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
    MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
    ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
    WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
    ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
    OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 * @returns an SVG element as a string
 */
export function createJazzicon(seed: string, size = 30): string {
    const colors = [
        '#01888C', // teal
        '#FC7500', // bright orange
        '#034F5D', // dark teal
        '#F73F01', // orangered
        '#FC1960', // magenta
        '#C7144C', // raspberry
        '#F3C100', // goldenrod
        '#1598F2', // lightning blue
        '#2465E1', // sail blue
        '#F19E02', // gold
    ];
    let shapeCount = 4;

    const hash = Math.abs(Array.from(seed).reduce((hash, char) => {
        return ((hash << 5) - hash) + char.charCodeAt(0) | 0;
    }, 0));

    const generator = new MersenneTwister(hash);

    function hexToHSL(hex: string) {
        // Convert hex to RGB first
        var r: any = "0x" + hex[1] + hex[2];
        var g: any = "0x" + hex[3] + hex[4];
        var b: any = "0x" + hex[5] + hex[6];
        // Then to HSL
        r /= 255;
        g /= 255;
        b /= 255;
        var cmin = Math.min(r, g, b),
            cmax = Math.max(r, g, b),
            delta = cmax - cmin,
            h = 0,
            s = 0,
            l = 0;

        if (delta == 0)
            h = 0;
        else if (cmax == r)
            h = ((g - b) / delta) % 6;
        else if (cmax == g)
            h = (b - r) / delta + 2;
        else
            h = (r - g) / delta + 4;

        h = Math.round(h * 60);

        if (h < 0)
            h += 360;

        l = (cmax + cmin) / 2;
        s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
        s = +(s * 100).toFixed(1);
        l = +(l * 100).toFixed(1);

        return { h, s, l }
    }

    function HSLToHex(hsl: { h: number, s: number, l: number }) {
        var { h, s, l } = hsl
        s /= 100;
        l /= 100;

        let c = (1 - Math.abs(2 * l - 1)) * s,
            x = c * (1 - Math.abs((h / 60) % 2 - 1)),
            m = l - c / 2,
            r: any = 0,
            g: any = 0,
            b: any = 0;

        if (0 <= h && h < 60) {
            r = c; g = x; b = 0;
        } else if (60 <= h && h < 120) {
            r = x; g = c; b = 0;
        } else if (120 <= h && h < 180) {
            r = 0; g = c; b = x;
        } else if (180 <= h && h < 240) {
            r = 0; g = x; b = c;
        } else if (240 <= h && h < 300) {
            r = x; g = 0; b = c;
        } else if (300 <= h && h < 360) {
            r = c; g = 0; b = x;
        }
        // Having obtained RGB, convert channels to hex
        r = Math.round((r + m) * 255).toString(16);
        g = Math.round((g + m) * 255).toString(16);
        b = Math.round((b + m) * 255).toString(16);

        // Prepend 0s, if necessary
        if (r.length == 1)
            r = "0" + r;
        if (g.length == 1)
            g = "0" + g;
        if (b.length == 1)
            b = "0" + b;

        return "#" + r + g + b;
    }

    function colorRotate(hex: string, degrees: number) {
        var hsl = hexToHSL(hex)
        var hue = hsl.h
        hue = (hue + degrees) % 360;
        hue = hue < 0 ? 360 + hue : hue;
        hsl.h = hue;
        return HSLToHex(hsl);
    }

    function hueShift(colors: string[]) {
        var wobble = 30;
        var amount = (generator.random() * 30) - (wobble / 2)
        var rotate = (hex: string) => colorRotate(hex, amount)
        return colors.map(rotate)
    }

    function genColor(colors: string[]) {
        var idx = Math.floor(colors.length * generator.random())
        var color = colors.splice(idx, 1)[0]
        return color
    }

    function genShape(remainingColors: string[], diameter: number, i: number, total: number) {
        var center = diameter / 2;

        // Create virtual rectangle element
        var shape = {
            type: 'rect',
            attributes: {
                x: '0',
                y: '0',
                width: diameter,
                height: diameter,
                transform: '',
                fill: ''
            }
        };

        var firstRot = generator.random();
        var angle = Math.PI * 2 * firstRot;
        var velocity = diameter / total * generator.random() + (i * diameter / total);

        var tx = (Math.cos(angle) * velocity);
        var ty = (Math.sin(angle) * velocity);

        var translate = 'translate(' + tx + ' ' + ty + ')';

        var secondRot = generator.random();
        var rot = (firstRot * 360) + secondRot * 180;
        var rotate = 'rotate(' + rot.toFixed(1) + ' ' + center + ' ' + center + ')';
        var transform = translate + ' ' + rotate;

        shape.attributes.transform = transform;
        shape.attributes.fill = genColor(remainingColors)!;

        return shape;
    }

    var remainingColors = hueShift(colors.slice());

    // Create virtual SVG element
    const svg: Record<string, any> = {
        type: 'svg',
        attributes: {
            x: '0',
            y: '0',
            width: size,
            height: size
        },
        children: []
    };

    // Generate shapes
    for (var i = 0; i < shapeCount - 1; i++) {
        svg.children.push(genShape(remainingColors, size, i, shapeCount - 1));
    }

    let attributes = Object.entries(svg.attributes)
        .map(([key, value]) => `${key}="${value}"`)
        .join(' ');

    let children = svg.children
        .map((child: any) => {
            let childAttributes = Object.entries(child.attributes)
                .map(([key, value]) => `${key}="${value}"`)
                .join(' ');
            return `<${child.type} ${childAttributes}/>`;
        })
        .join('\n');

    const bgColor = Math.floor(generator.random() * colors.length);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <defs>
            <clipPath id="circleClip">
                <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" />
            </clipPath>
        </defs>
        <g clip-path="url(#circleClip)">
            <rect x="0" y="0" width="${size}" height="${size}" fill="${colors[bgColor]}"/>
            <svg ${attributes}>${children}</svg>
        </g>
    </svg>`;
}

export function rawToNano(raw: any): string {
    if (!raw) return '0';
    const mrai = 1000000000000000000000000000000;
    return (raw / mrai).toFixed(6).replace(/\.0+$|(\.\d*[1-9])0+$/, '$1');
}

export function getRandomRepresentative() {
    return RepAccounts[Math.floor(Math.random() * RepAccounts.length)]!;
}

export function getRandomRPC() {
    return RpcEndpoints[Math.floor(Math.random() * RpcEndpoints.length)]!;
}

export function getRandomBlockExplorer() {
    return BlockExplorers[Math.floor(Math.random() * BlockExplorers.length)]!;
}

export function nanoAddressToHex(nanoAddress: string) {
    if (!isValidAddress(nanoAddress))
        throw new Error("Invalid Nano address");

    let parts = nanoAddress.split("_");
    let accountPart: string | undefined = parts[1];

    // A valid Nano account part is 60 characters long:
    // 52 characters for the public key + 8 for the checksum.
    if (accountPart?.length !== 60)
        throw new Error("Invalid Nano account length.");

    // The first 52 characters are the public key
    let pubKeyEncoded = accountPart.substring(0, 52);

    // Build a mapping from character to value.
    let charMap: any = {};
    for (let i = 0; i < ALPHABET.length; i++) {
        charMap[ALPHABET[i]!] = i;
    }

    // Each character encodes 5 bits.
    let bitString = "";
    for (let char of pubKeyEncoded) {
        if (charMap[char] === undefined) {
            throw new Error("Invalid character in Nano address: " + char);
        }
        // Convert value to a 5-bit binary string
        let bits = charMap[char].toString(2);
        // Pad with leading zeros to ensure it has 5 bits.
        bits = bits.padStart(5, "0");
        bitString += bits;
    }
    // Now, bitString has 52 * 5 = 260 bits. The first 4 bits are padding.
    let publicKeyBits = bitString.substring(4); // remove the extra four bits at the start

    // Convert the 256-bit string into hex (32 bytes) 
    let hex = "";
    for (let i = 0; i < publicKeyBits.length; i += 8) {
        let byte = publicKeyBits.substring(i, i + 8);
        // Parse as integer then convert to hex
        let hexByte = parseInt(byte, 2).toString(16).padStart(2, "0");
        hex += hexByte;
    }

    return hex;
}

export function uint8ArrayToHex(arr: Uint8Array): string {
    return Array.from(arr)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function isNanoIdentifier(identifier: string): boolean {
    // @name@example.com
    return /@[a-zA-Z0-9]+@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}/.test(identifier);
}