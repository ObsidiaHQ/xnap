import { ALPHABET, BlockExplorers, RepAccounts, RpcEndpoints } from './constants';
import MersenneTwister from 'mersenne-twister';
import { BlockExplorer, RpcEndpoint } from './types';

/**
 * checks if given address is a valid nano address
 * @param address
 */
export function isValidAddress(address: string | undefined): boolean {
  const pattern = new RegExp(`^(nano_|xrb_)[13]{1}[${ALPHABET}]{59}$`);
  return address ? pattern.test(address) : false;
}

/**
 * truncates given address to 11 characters + ... + 5 characters only if it's a valid nano address
 * @param address
 */
export function truncateAddress(address: string) {
  if (!address) {
    return '';
  }
  if (!isValidAddress(address)) {
    return address;
  }
  return `${address.slice(0, 11)}...${address.slice(-5)}`;
}

/**
 * formats given date relative to current date
 * @param date
 */
export function formatRelativeDate(date: string) {
  const now = new Date();
  const input = new Date(parseInt(`${date}000`));
  const diffMs = Number(now) - Number(input);
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  // Helper function to format date without Intl
  /**
   *
   * @param date
   */
  function formatDate(date: Date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
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
 * @param size - default is 30
 * @copyright MetaMask 2020: THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
    * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
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
  const shapeCount = 4;

  const hash = Math.abs(
    Array.from(seed).reduce((hash, char) => {
      return ((hash << 5) - hash + char.charCodeAt(0)) | 0;
    }, 0),
  );

  const generator = new MersenneTwister(hash);

  function hexToHSL(hex: string) {
    // Convert hex to RGB first
    let r: any = `0x${hex[1]}${hex[2]}`;
    let g: any = `0x${hex[3]}${hex[4]}`;
    let b: any = `0x${hex[5]}${hex[6]}`;
    // Then to HSL
    r /= 255;
    g /= 255;
    b /= 255;
    const cmin = Math.min(r, g, b);
    const cmax = Math.max(r, g, b);
    const delta = cmax - cmin;
    let h = 0;
    let s = 0;
    let l = 0;

    if (delta == 0) {
      h = 0;
    } else if (cmax == r) {
      h = ((g - b) / delta) % 6;
    } else if (cmax == g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }

    h = Math.round(h * 60);

    if (h < 0) {
      h += 360;
    }

    l = (cmax + cmin) / 2;
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = Number((s * 100).toFixed(1));
    l = Number((l * 100).toFixed(1));

    return { h, s, l };
  }

  function HSLToHex(hsl: { h: number; s: number; l: number }) {
    let { h, s, l } = hsl;
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r: any = 0;
    let g: any = 0;
    let b: any = 0;

    if (h >= 0 && h < 60) {
      r = c;
      g = x;
      b = 0;
    } else if (h >= 60 && h < 120) {
      r = x;
      g = c;
      b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0;
      g = c;
      b = x;
    } else if (h >= 180 && h < 240) {
      r = 0;
      g = x;
      b = c;
    } else if (h >= 240 && h < 300) {
      r = x;
      g = 0;
      b = c;
    } else if (h >= 300 && h < 360) {
      r = c;
      g = 0;
      b = x;
    }
    // Having obtained RGB, convert channels to hex
    r = Math.round((r + m) * 255).toString(16);
    g = Math.round((g + m) * 255).toString(16);
    b = Math.round((b + m) * 255).toString(16);

    // Prepend 0s, if necessary
    if (r.length == 1) {
      r = `0${r}`;
    }
    if (g.length == 1) {
      g = `0${g}`;
    }
    if (b.length == 1) {
      b = `0${b}`;
    }

    return `#${r}${g}${b}`;
  }

  function colorRotate(hex: string, degrees: number) {
    const hsl = hexToHSL(hex);
    let hue = hsl.h;
    hue = (hue + degrees) % 360;
    hue = hue < 0 ? 360 + hue : hue;
    hsl.h = hue;
    return HSLToHex(hsl);
  }

  function hueShift(fromColors: string[]) {
    const wobble = 30;
    const amount = generator.random() * 30 - wobble / 2;
    const rotate = (hex: string) => colorRotate(hex, amount);
    return fromColors.map(rotate);
  }

  function genColor(fromColors: string[]) {
    const idx = Math.floor(fromColors.length * generator.random());
    const color = fromColors.splice(idx, 1)[0];
    return color;
  }

  function genShape(remainingColors: string[], diameter: number, i: number, total: number) {
    const center = diameter / 2;

    // Create virtual rectangle element
    const shape = {
      type: 'rect',
      attributes: {
        x: '0',
        y: '0',
        width: diameter,
        height: diameter,
        transform: '',
        fill: '',
      },
    };

    const firstRot = generator.random();
    const angle = Math.PI * 2 * firstRot;
    const velocity = (diameter / total) * generator.random() + (i * diameter) / total;

    const tx = Math.cos(angle) * velocity;
    const ty = Math.sin(angle) * velocity;

    const translate = `translate(${tx} ${ty})`;

    const secondRot = generator.random();
    const rot = firstRot * 360 + secondRot * 180;
    const rotate = `rotate(${rot.toFixed(1)} ${center} ${center})`;
    const transform = `${translate} ${rotate}`;

    shape.attributes.transform = transform;
    shape.attributes.fill = genColor(remainingColors)!;

    return shape;
  }

  const remainingColors = hueShift(colors.slice());

  // Create virtual SVG element
  const svg: Record<string, any> = {
    type: 'svg',
    attributes: {
      x: '0',
      y: '0',
      width: size,
      height: size,
    },
    children: [],
  };

  // Generate shapes
  for (let i = 0; i < shapeCount - 1; i++) {
    svg.children.push(genShape(remainingColors, size, i, shapeCount - 1));
  }

  const attributes = Object.entries(svg.attributes)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ');

  const children = svg.children
    .map((child: any) => {
      const childAttributes = Object.entries(child.attributes)
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

/**
 * converts given raw amount to nano
 * @param raw
 */
export function rawToNano(raw?: string): string {
  if (!raw) {
    return '0';
  }
  const mrai = BigInt("1000000000000000000000000000000");
  const rawBigInt = BigInt(raw);
  
  // Calculate whole units
  const whole = rawBigInt / mrai;
  
  // Calculate decimal places
  const decimal = ((rawBigInt * BigInt(1000000)) / mrai) % BigInt(1000000);
  
  // Convert to string and trim trailing zeros
  const decimalStr = decimal.toString().padStart(6, '0');
  const trimmed = `${whole}.${decimalStr}`.replace(/\.?0+$/, '');
  
  return trimmed === '' ? '0' : trimmed;
}

/**
 * gets a random representative
 */
export function getRandomRepresentative(): string {
  return RepAccounts[Math.floor(Math.random() * RepAccounts.length)]!;
}

/**
 * gets a random rpc endpoint
 */
export function getRandomRPC(): RpcEndpoint {
  return RpcEndpoints[Math.floor(Math.random() * RpcEndpoints.length)]!;
}

/**
 * gets a random block explorer
 */
export function getRandomBlockExplorer(): BlockExplorer {
  return BlockExplorers[Math.floor(Math.random() * BlockExplorers.length)]!;
}

/**
 * converts given nano address to hex representation
 * @param nanoAddress
 * @returns The hex string representation of a given Nano address.
 */
export function nanoAddressToHex(nanoAddress: string): string {
  if (!isValidAddress(nanoAddress)) {
    throw new Error('Invalid Nano address');
  }

  const parts = nanoAddress.split('_');
  const accountPart: string | undefined = parts[1];

  // A valid Nano account part is 60 characters long:
  // 52 characters for the public key + 8 for the checksum.
  if (accountPart?.length !== 60) {
    throw new Error('Invalid Nano account length.');
  }

  // The first 52 characters are the public key
  const pubKeyEncoded = accountPart.substring(0, 52);

  // Build a mapping from character to value.
  const charMap: Record<string, number> = {};
  for (let i = 0; i < ALPHABET.length; i++) {
    charMap[ALPHABET[i]!] = i;
  }

  // Each character encodes 5 bits.
  let bitString = '';
  for (const char of pubKeyEncoded) {
    if (charMap[char] === undefined) {
      throw new Error(`Invalid character in Nano address: ${char}`);
    }
    // Convert value to a 5-bit binary string
    let bits = charMap[char].toString(2);
    // Pad with leading zeros to ensure it has 5 bits.
    bits = bits.padStart(5, '0');
    bitString += bits;
  }
  // Now, bitString has 52 * 5 = 260 bits. The first 4 bits are padding.
  const publicKeyBits = bitString.substring(4); // remove the extra four bits at the start

  // Convert the 256-bit string into hex (32 bytes)
  let hex = '';
  for (let i = 0; i < publicKeyBits.length; i += 8) {
    const byte = publicKeyBits.substring(i, i + 8);
    // Parse as integer then convert to hex
    const hexByte = parseInt(byte, 2).toString(16).padStart(2, '0');
    hex += hexByte;
  }

  return hex;
}

/**
 * converts given uint8array to hex
 * @param arr
 */
export function uint8ArrayToHex(arr: Uint8Array): string {
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * delays execution for given milliseconds
 * @param ms
 */
export async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * checks if given identifier is a valid nano identifier
 * @param identifier
 * @returns `true` if the identifier is of the form `@name@example.com`, `false` otherwise.
 */
export function isNanoIdentifier(identifier: string): boolean {
  return /@[a-zA-Z0-9]+@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}/.test(identifier);
}

/**
 * checks if given amount is valid (1-9 digits, optionally with a decimal point)
 * @param amount
 */
export function isValidAmount(amount: string): boolean {
  return /^\d{1,9}(\.\d+)?$/.test(amount);
}
