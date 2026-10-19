/**
 * Exact Rational Arithmetic (Fraction) for Secondary School Math
 * Avoids all floating-point imprecision and provides clean LaTeX & fraction outputs.
 */

export class Fraction {
  readonly num: bigint;
  readonly den: bigint;

  constructor(num: bigint | number | string, den: bigint | number | string = 1n) {
    let n = typeof num === 'bigint' ? num : BigInt(Math.round(Number(num)));
    let d = typeof den === 'bigint' ? den : BigInt(Math.round(Number(den)));

    if (d === 0n) {
      throw new Error('Denominator cannot be zero');
    }

    if (d < 0n) {
      n = -n;
      d = -d;
    }

    const g = Fraction.gcd(n < 0n ? -n : n, d);
    this.num = n / g;
    this.den = d / g;
  }

  static gcd(a: bigint, b: bigint): bigint {
    while (b !== 0n) {
      const temp = b;
      b = a % b;
      a = temp;
    }
    return a === 0n ? 1n : a;
  }

  static lcm(a: bigint, b: bigint): bigint {
    if (a === 0n || b === 0n) return 0n;
    const g = Fraction.gcd(a < 0n ? -a : a, b < 0n ? -b : b);
    return ((a < 0n ? -a : a) * (b < 0n ? -b : b)) / g;
  }

  static from(val: Fraction | number | bigint | string): Fraction {
    if (val instanceof Fraction) return val;
    if (typeof val === 'bigint') return new Fraction(val, 1n);
    if (typeof val === 'number') {
      if (Number.isInteger(val)) return new Fraction(BigInt(val), 1n);
      // Convert floating decimal like 0.75 to fraction
      const s = val.toString();
      if (s.includes('.')) {
        const parts = s.split('.');
        const decLength = parts[1].length;
        const den = 10n ** BigInt(decLength);
        const num = BigInt(parts[0]) * den + (val < 0 ? -1n : 1n) * BigInt(parts[1]);
        return new Fraction(num, den);
      }
      return new Fraction(BigInt(Math.round(val)), 1n);
    }
    // String parsing like "3", "-2/5", "0.5"
    const str = val.trim();
    if (str.includes('/')) {
      const [nStr, dStr] = str.split('/');
      return new Fraction(BigInt(nStr.trim()), BigInt(dStr.trim()));
    }
    if (str.includes('.')) {
      const parts = str.split('.');
      const isNeg = parts[0].startsWith('-');
      const absInt = parts[0].replace('-', '');
      const decLength = parts[1].length;
      const den = 10n ** BigInt(decLength);
      const numVal = BigInt(absInt) * den + BigInt(parts[1]);
      return new Fraction(isNeg ? -numVal : numVal, den);
    }
    const clean = str.replace(/^\+/, '');
    if (!clean) return new Fraction(0n, 1n);
    return new Fraction(BigInt(clean), 1n);
  }

  add(other: Fraction | number | bigint): Fraction {
    const o = Fraction.from(other);
    const n = this.num * o.den + o.num * this.den;
    const d = this.den * o.den;
    return new Fraction(n, d);
  }

  sub(other: Fraction | number | bigint): Fraction {
    const o = Fraction.from(other);
    const n = this.num * o.den - o.num * this.den;
    const d = this.den * o.den;
    return new Fraction(n, d);
  }

  mul(other: Fraction | number | bigint): Fraction {
    const o = Fraction.from(other);
    return new Fraction(this.num * o.num, this.den * o.den);
  }

  div(other: Fraction | number | bigint): Fraction {
    const o = Fraction.from(other);
    if (o.isZero()) throw new Error('Division by zero');
    return new Fraction(this.num * o.den, this.den * o.num);
  }

  negate(): Fraction {
    return new Fraction(-this.num, this.den);
  }

  abs(): Fraction {
    return new Fraction(this.num < 0n ? -this.num : this.num, this.den);
  }

  isZero(): boolean {
    return this.num === 0n;
  }

  isOne(): boolean {
    return this.num === 1n && this.den === 1n;
  }

  isMinusOne(): boolean {
    return this.num === -1n && this.den === 1n;
  }

  isInteger(): boolean {
    return this.den === 1n;
  }

  isPositive(): boolean {
    return this.num > 0n;
  }

  isNegative(): boolean {
    return this.num < 0n;
  }

  equals(other: Fraction | number | bigint): boolean {
    const o = Fraction.from(other);
    return this.num === o.num && this.den === o.den;
  }

  toNumber(): number {
    return Number(this.num) / Number(this.den);
  }

  toString(): string {
    if (this.den === 1n) return this.num.toString();
    return `${this.num}/${this.den}`;
  }

  toTeX(): string {
    if (this.den === 1n) return this.num.toString();
    if (this.num < 0n) {
      return `-\\frac{${-this.num}}{${this.den}}`;
    }
    return `\\frac{${this.num}}{${this.den}}`;
  }

  /**
   * For display in coefficients: e.g. 1 -> "", -1 -> "-", 2 -> "2", -3/2 -> "-\\frac{3}{2}"
   */
  toCoefficientTeX(isFirst: boolean = false): string {
    if (this.isOne()) return isFirst ? '' : '+';
    if (this.isMinusOne()) return '-';
    if (this.isPositive() && !isFirst) {
      return `+${this.toTeX()}`;
    }
    return this.toTeX();
  }

  /**
   * Signed display for constant term: + 5, - 3, + \frac{2}{3}
   */
  toSignedTeX(): string {
    if (this.isZero()) return '';
    if (this.isPositive()) {
      return `+ ${this.toTeX()}`;
    }
    return `- ${this.abs().toTeX()}`;
  }
}
