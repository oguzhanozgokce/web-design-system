import { PasswordField, type PasswordRule } from '@/registry/ds/ui/password-field';

const accountEmail = 'dana.whitfield@northwind.com';
const emailName = accountEmail.split('@')[0].split('.');

const rules: PasswordRule[] = [
  { label: 'At least 10 characters', test: (value) => value.length >= 10 },
  { label: 'A number or a symbol', test: (value) => /[\d\W_]/.test(value) },
  {
    label: 'Does not contain your name',
    test: (value) =>
      value.length > 0 && emailName.every((part) => !value.toLowerCase().includes(part)),
  },
];

export default function PasswordFieldRules() {
  return (
    <PasswordField
      className="w-full max-w-sm"
      label="New password"
      description={`For ${accountEmail}`}
      rules={rules}
    />
  );
}
