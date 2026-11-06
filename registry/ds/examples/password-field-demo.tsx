import { PasswordField, type PasswordRule } from '@/registry/ds/ui/password-field';

const rules: PasswordRule[] = [
  { label: 'At least 12 characters', test: (value) => value.length >= 12 },
  { label: 'One number', test: (value) => /\d/.test(value) },
  {
    label: 'Upper and lower case letters',
    test: (value) => /[a-z]/.test(value) && /[A-Z]/.test(value),
  },
  { label: 'One symbol', test: (value) => /[^A-Za-z0-9\s]/.test(value) },
];

export default function PasswordFieldDemo() {
  return (
    <PasswordField
      className="w-full max-w-sm"
      label="Create a password"
      name="new-password"
      rules={rules}
      isRequired
    />
  );
}
