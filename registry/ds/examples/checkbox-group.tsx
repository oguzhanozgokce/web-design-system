import { Checkbox, CheckboxGroup } from '@/registry/ds/ui/checkbox';

export default function CheckboxGroupExample() {
  return (
    <CheckboxGroup
      label="Interests"
      description="Pick the topics you want to see first."
      defaultValue={['music', 'travel']}
    >
      <Checkbox value="music">Music</Checkbox>
      <Checkbox value="movies">Movies</Checkbox>
      <Checkbox value="sports">Sports</Checkbox>
      <Checkbox value="travel">Travel</Checkbox>
    </CheckboxGroup>
  );
}
