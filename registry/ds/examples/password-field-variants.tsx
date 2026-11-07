import { PasswordField } from '@/registry/ds/ui/password-field';

export default function PasswordFieldVariants() {
  return (
    <div className="grid w-full max-w-xl gap-6 sm:grid-cols-2">
      <PasswordField
        label="Admin PIN"
        size="sm"
        description="Small and outline, for dense forms."
      />
      <PasswordField
        label="Admin PIN"
        variant="soft"
        size="sm"
        description="Small and soft, for toolbars and tinted panels."
      />
      <PasswordField
        className="sm:col-span-2"
        label="Wi-Fi password"
        size="lg"
        defaultValue="sunny-garden-42"
        defaultRevealed
        description="Large, revealed by default for a password people read aloud."
      />
    </div>
  );
}
