import names from "../assets/names.json" with { type: "json" };
import { randomSeeded } from "@std/random";
import { parseArgs } from "@std/cli/parse-args";


/**
 * Options for generating a random name.
 * 
 * @property {bigint} [seed] - An optional seed value for the random name generator to ensure reproducibility.
 * @property {string} [separator] - An optional string to use as a separator between parts of the name.
 * @property {boolean} [capitalize] - An optional flag to capitalize the first letter of each part of the name.
 * @property {boolean} [addNumbers] - An optional flag to add numbers to the generated name.
 */
type RandomNameOptions = {
  seed?: bigint;
  separator?: string;
  capitalize?: boolean;
  addNumbers?: boolean;
};

/**
 * Class to generate random names in the form of "adjective-animal-01".
 */
export class RandomName {
  private seed: bigint;
  private nextRnd: () => number;
  private separator: string;
  private capitalize: boolean;
  private addNumbers: boolean;

  /**
   * Creates a new random name generator.
   * 
   * @param options - The options for generating random names.
   */
  constructor(options: RandomNameOptions = {}) {
    this.seed = options.seed || BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
    this.nextRnd = randomSeeded(this.seed);
    this.separator = options.separator || ' ';
    this.capitalize = options.capitalize || false;
    this.addNumbers = options.addNumbers || false;
  }

  private pick<T>(arr: T[]): T {
    return arr[Math.floor(this.nextRnd() * arr.length)];
  }

  /**
   * Generates the next random name.
   * 
   * @returns The next random name.
   */
  next(): string {

    const capitalize = this.capitalize ? (word: string) => word.charAt(0).toUpperCase() + word.slice(1) : (word: string) => word;
    let name = capitalize(this.pick(names.adjectives)) + this.separator + capitalize(this.pick(names.animals));

    if (this.addNumbers) {
      name = name + this.separator + Math.floor(this.nextRnd() * 100);
    }

    return name;
  }
}

if (import.meta.main) {

  const options = parseArgs(Deno.args, {
    string: ['seed', 'separator'],
    boolean: ['capitalize', 'addNumbers', 'help'],
    alias: {
      s: 'seed',
      S: 'separator',
      c: 'capitalize',
      n: 'addNumbers',
      h: 'help',
    },
    default: {
      seed: undefined,
      separator: ' ',
      capitalize: false,
      addNumbers: false,
    },
  });

  if (options.help) {
    console.log(`Usage: random-name [options]
Options:
  -s, --seed <seed>        Seed for random number generator
  -S, --separator <char>   Separator between words
  -c, --capitalize         Capitalize first letter of each word
  -n, --addNumbers         Add a random number at the end
  -h, --help               Show this help message
`);
    Deno.exit(0);
  }

  const name = new RandomName(options as RandomNameOptions);
  console.log(name.next());
}