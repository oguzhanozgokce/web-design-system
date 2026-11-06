import { Button } from '@/registry/ds/ui/button';
import { ListBoxItem } from '@/registry/ds/ui/list-box';
import { Select } from '@/registry/ds/ui/select';

export default function SelectValidation() {
  return (
    <form
      className="flex w-full max-w-xs flex-col items-start gap-4"
      onSubmit={(event) => event.preventDefault()}
    >
      <Select
        name="language"
        label="Language"
        description="Used for menus and emails."
        errorMessage="Choose a language to continue."
        placeholder="Choose a language"
        isRequired
        className="w-full"
      >
        <ListBoxItem id="en">English</ListBoxItem>
        <ListBoxItem id="es">Español</ListBoxItem>
        <ListBoxItem id="fr">Français</ListBoxItem>
        <ListBoxItem id="ja">日本語</ListBoxItem>
      </Select>
      <Button type="submit">Continue</Button>
    </form>
  );
}
