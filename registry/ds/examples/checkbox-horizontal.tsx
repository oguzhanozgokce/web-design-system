import { Checkbox, CheckboxGroup } from '@/registry/ds/ui/checkbox';

export default function CheckboxHorizontal() {
  return (
    <CheckboxGroup label="File formats" orientation="horizontal" defaultValue={['pdf', 'png']}>
      <Checkbox value="pdf">PDF</Checkbox>
      <Checkbox value="png">PNG</Checkbox>
      <Checkbox value="jpg">JPG</Checkbox>
      <Checkbox value="svg">SVG</Checkbox>
      <Checkbox value="webp">WebP</Checkbox>
    </CheckboxGroup>
  );
}
