import { z } from "zod";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname } from "node:path"

/**
 * Bonus : un tableau rangé dans un fichier JSON. Les deux repositories JSON en reçoivent chacun un.
 * Outils : `existsSync`, `readFileSync`, `writeFileSync`, `mkdirSync` (node:fs) et `dirname` (node:path).
 */
export class JsonFile<T> {
  // À faire : recevoir par le constructeur le chemin du fichier et le schema Zod d'un élément (z.ZodType<T>).
  constructor(
    private readonly path: string,
    private readonly schema: z.ZodType<T>,
  ) {}

  read(): T[] {
    if (!existsSync(this.path)) return [];
    const text = readFileSync(this.path, "utf-8");
    return z.array(this.schema).parse(JSON.parse(text));
  }

  write(items: readonly T[]): void {
    mkdirSync(dirname(this.path), { recursive: true });
    writeFileSync(this.path, JSON.stringify(items, null, 2), "utf-8");
  }
}
