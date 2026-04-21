import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

export function isValidCnpj(raw: string): boolean {
  const digits = raw.replace(/\D/g, '');
  if (digits.length !== 14 || /^(\d)\1{13}$/.test(digits)) {
    return false;
  }
  const calc = (base: string, factors: number[]) => {
    let sum = 0;
    for (let i = 0; i < factors.length; i++) {
      sum += Number(base[i]) * factors[i];
    }
    const mod = sum % 11;
    return mod < 2 ? 0 : 11 - mod;
  };
  const base12 = digits.slice(0, 12);
  const d1 = calc(base12, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const base13 = base12 + String(d1);
  const d2 = calc(base13, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return digits === base13 + String(d2);
}

@ValidatorConstraint({ name: 'isCnpj', async: false })
export class IsCnpjConstraint implements ValidatorConstraintInterface {
  validate(value: unknown) {
    if (typeof value !== 'string') return false;
    return isValidCnpj(value);
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} deve ser um CNPJ válido`;
  }
}

export function IsCnpj(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsCnpjConstraint,
    });
  };
}
