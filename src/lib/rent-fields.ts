export interface RentField {
  name: string;
  amount: number;
}

export const FIXED_RENT_FIELD_NAMES = [
  "Monthly Rent",
  "Electricity",
  "Gas",
  "Water",
] as const;

export const DEFAULT_OTHER_RENT_FIELDS: RentField[] = [
  { name: "Internet", amount: 0 },
  { name: "Khala", amount: 0 },
  { name: "Dust", amount: 0 },
];

export const DEFAULT_RENT_FIELDS: RentField[] = [
  ...FIXED_RENT_FIELD_NAMES.map((name) => ({ name, amount: 0 })),
  ...DEFAULT_OTHER_RENT_FIELDS,
];

export function isFixedRentField(name: string) {
  const normalized = name.trim().toLowerCase();
  return FIXED_RENT_FIELD_NAMES.some(
    (field) => field.toLowerCase() === normalized
  );
}

function findFieldAmount(fields: RentField[], name: string) {
  const normalized = name.toLowerCase();
  const found = fields.find((f) => f.name.trim().toLowerCase() === normalized);
  return found?.amount ?? 0;
}

export function splitRentFields(fields: RentField[]) {
  const fixedFields = FIXED_RENT_FIELD_NAMES.map((name) => ({
    name,
    amount: findFieldAmount(fields, name),
  }));

  const otherFields = fields.filter((f) => !isFixedRentField(f.name));

  return { fixedFields, otherFields };
}

export function mergeRentFields(
  fixedFields: RentField[],
  otherFields: RentField[]
): RentField[] {
  const fixed = FIXED_RENT_FIELD_NAMES.map((name) => {
    const found = fixedFields.find(
      (f) => f.name.trim().toLowerCase() === name.toLowerCase()
    );
    return {
      name,
      amount: Math.max(0, Number(found?.amount) || 0),
    };
  });

  const others = otherFields
    .map((f) => ({
      name: String(f.name).trim(),
      amount: Math.max(0, Number(f.amount) || 0),
    }))
    .filter((f) => f.name.length > 0);

  return [...fixed, ...others];
}

export function rentFieldTotal(fields: RentField[]) {
  return fields.reduce((sum, f) => sum + f.amount, 0);
}
