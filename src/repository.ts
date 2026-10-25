import type { Wizard, Spell, NewWizard } from "./types";
import { Log, MeasureTime, ValidateSpellPower } from "./decorators";

export class Repository<T extends { id: number }> {
  private items: T[] = [];

  @Log
  add(item: T): void {
    this.items.push(item);
  }

  @MeasureTime
  findById(id: number): T | undefined {
    return this.items.find(item => item.id === id);
  }

  getAll(): T[] {
    return [...this.items];
  }

  update(id: number, changes: Partial<T>): boolean {
    const item = this.findById(id);

    if (!item) return false;

    Object.assign(item, changes);
    return true;
  }
}

export class WizardRepository extends Repository<Wizard> {
  findByHouse(house: Wizard["house"]): Wizard[] {
    return this.getAll().filter(Wizard => Wizard.house === house);
  }

  register(details: NewWizard): Wizard {
    let nextId = 1;

    for (const wizard of this.getAll()) {
      if (wizard.id >= nextId) {
        nextId = wizard.id + 1;
      }
    }

    const wizard: Wizard = { ...details, id: nextId };
    this.add(wizard);
    return wizard;
  }
}

export class SpellRepository extends Repository<Spell> {
  @ValidateSpellPower
  override add(spell: Spell): void {
    super.add(spell);
  }
}
