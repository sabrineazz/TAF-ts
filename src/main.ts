import {
  type Wizard,
  type NewWizard,
  type Spell,
  type AcademyEvent,
  type SpellCastEvent,
  type House,
  type HousePoints,
  type SpellCategory,
  type SpellOutput,
  type ArrayElement,
  type WizardSummary,
  type WizardUpdate,
  type AttackSpell,
  type NonHealingCategory,
} from "./types";

import { WizardRepository, SpellRepository } from "./repository";
import { Log, Cache } from "./decorators";

// Exercise 6:
const validHouses: readonly House[] = [
  "Gryffindor",
  "Slytherin",
  "Ravenclaw",
  "Hufflepuff"
];

function isHouse(value: unknown): value is House {
  return (
    typeof value === "string" &&
    validHouses.some(house => house === value)
  );
}

// Type guard: safely narrow unknown data to a Wizard.
function isWizard(value: unknown): value is Wizard {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "number" &&
    typeof candidate.name === "string" &&
    isHouse(candidate.house) &&
    typeof candidate.level === "number" &&
    typeof candidate.active === "boolean"
  );
}

// Exercise 3:
function handleSpellCast(event: SpellCastEvent): void {
  console.log(
    `Wizard #${event.wizardId} casts ${event.spellName}!`
  );
}
class AcademyService {
  constructor(
    private readonly wizards: WizardRepository,
    private readonly spells: SpellRepository
  ) {}

  @Log
  castSpell(wizardId: number, spellId: number): string {
    const wizard = this.wizards.findById(wizardId);
    const spell = this.spells.findById(spellId);

    if (!wizard || !spell) {
      throw new Error("Wizard or spell not found");
    }

    return `${wizard.name} casts ${spell.name}!`;
  }

  findByHouse(house: House): WizardSummary[] {
  return this.wizards
    .findByHouse(house)
    .map(({ id, name, house }) => ({ id, name, house }));
  }

  updateWizard(id: number, changes: WizardUpdate): boolean {
    return this.wizards.update(id, changes);
  }

  registerWizard(wizard: NewWizard): Wizard {
    return this.wizards.register(wizard);
  }

  getSpellEvents(
    events: AcademyEvent[]
  ): Extract<AcademyEvent, { type: "spell-cast" }>[] {
    return events.filter(
      (event): event is Extract<AcademyEvent, { type: "spell-cast" }> =>
        event.type === "spell-cast"
    );
  }
}

const wizards = new WizardRepository();
const spells = new SpellRepository();

wizards.add({
  id: 1,
  name: "Harry Potter",
  house: "Gryffindor",
  level: 5,
  active: true
});

wizards.add({
  id: 2,
  name: "Draco Malfoy",
  house: "Slytherin",
  level: 8,
  active: true
});

wizards.add({
  id: 3,
  name: "Luna Lovegood",
  house: "Ravenclaw",
  level: 6,
  active: true
});

// Exercise 1:
console.log("\n--- Exercise 1: register a new wizard ---");

const sena = wizards.register({
  name: "Sena",
  house: "Hufflepuff",
  level: 4,
  active: true
});

console.log("Registered wizard:", sena);
console.log("Stored wizard:", wizards.findById(sena.id));

// Exercise 4:
console.log("\n--- Exercise 4: validate spell power ---");

spells.add({
  id: 101,
  name: "Dragon Flame",
  category: "attack",
  power: 80
});

spells.add({
  id: 102,
  name: "Magic Shield",
  category: "defense",
  power: 50
});

console.log("Valid spell stored:", spells.findById(101));

try {
  spells.add({
    id: 103,
    name: "Faded Spark",
    category: "attack",
    power: -10
  });
} catch (error: unknown) {
  if (error instanceof Error) {
    console.log("Rejected spell:", error.message);
  } else {
    throw error;
  }
}

console.log("Invalid spell stored:", spells.findById(103));

const academy = new AcademyService(wizards, spells);

console.log("\n--- Cast a spell ---");
console.log(academy.castSpell(1, 101));

// Exercise 2:
console.log("\n--- Exercise 2: find wizards by house ---");
console.log("Gryffindor:", wizards.findByHouse("Gryffindor"));
console.log("Hufflepuff:", wizards.findByHouse("Hufflepuff"));

console.log("\n--- Update a wizard ---");
academy.updateWizard(1, { level: 6 });
console.log(wizards.findById(1));

console.log("\n--- Type guard ---");
const unknownWizard: unknown = wizards.findById(1);

if (isWizard(unknownWizard)) {
  console.log(
    `${unknownWizard.name} belongs to ${unknownWizard.house}`
  );
}

console.log("\n--- Record utility type ---");

const points: HousePoints = {
  Gryffindor: 100,
  Slytherin: 80,
  Ravenclaw: 90,
  Hufflepuff: 70
};

console.log(points);

console.log(points);

console.log("\n--- Exercise 3: handle spell-cast events ---");

const events: AcademyEvent[] = [
  {
    type: "spell-cast",
    wizardId: 1,
    spellName: "Expelliarmus"
  },
  {
    type: "level-up",
    wizardId: 2,
    newLevel: 9
  },
  {
    type: "wizard-expelled",
    wizardId: 3
  }
];

const spellEvents = academy.getSpellEvents(events);

console.log("Spell-cast events:", spellEvents);
spellEvents.forEach(handleSpellCast);

// Exercise 5:
class SpellCalculator {
  @Cache
  calculatePower(basePower: number, multiplier: number): number {
    console.log("Calculating...");

    return basePower * multiplier;
  }
}

const calculator = new SpellCalculator();

console.log("\n--- Exercise 5 ---");
console.log(calculator.calculatePower(10, 3));
console.log(calculator.calculatePower(10, 3));
console.log(calculator.calculatePower(5, 2));

// Exercise 6:
const validData: unknown = {
  id: 1,
  name: "Harry Potter",
  house: "Gryffindor",
  level: 5,
  active: true
};

const invalidData: unknown = {
  id: 2,
  name: "Icy",
  house: "Ice",
  level: 5,
  active: true
};

console.log("\n--- Exercise 6 ---");
console.log(isWizard(validData));   // true
console.log(isWizard(invalidData)); // false

// Exercise 7: NewWizard utility type
const newWizard: NewWizard = {
  name: "Luna",
  house: "Ravenclaw",
  level: 7,
  active: true
};

console.log("\n--- Exercise 7: NewWizard ---");
console.log("New wizard data:", newWizard);

const registeredWizard = academy.registerWizard(newWizard);

console.log("Registered wizard:", registeredWizard);

// Compile-time demonstrations: these aliases are checked by TypeScript.
type CastArguments = Parameters<AcademyService["castSpell"]>;
type CastResult = ReturnType<AcademyService["castSpell"]>;
type AttackOutput = SpellOutput<"attack">; // number
type HealingOutput = SpellOutput<"healing">; // string
type SpellItem = ArrayElement<Spell[]>; // Spell
type AttackSpellExample = AttackSpell;
type RemainingCategories = NonHealingCategory;
type CategoryExample = SpellCategory;

const typeExamples: [
  CastArguments,
  CastResult,
  AttackOutput,
  HealingOutput,
  SpellItem,
  AttackSpellExample["category"],
  RemainingCategories,
  CategoryExample
] | null = null;

void typeExamples;