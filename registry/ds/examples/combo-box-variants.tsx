import { ComboBox } from '@/registry/ds/ui/combo-box';
import { ListBoxItem } from '@/registry/ds/ui/list-box';

const projects = ['Website redesign', 'Mobile app', 'Payroll migration', 'Q4 audit'];

export default function ComboBoxVariants() {
  return (
    <div className="grid w-full max-w-lg grid-cols-1 gap-4 sm:grid-cols-2">
      {(['outlined', 'filled'] as const).map((variant) => (
        <ComboBox
          key={variant}
          label={`Project, ${variant}`}
          placeholder="Search projects"
          variant={variant}
        >
          {projects.map((project) => (
            <ListBoxItem key={project} id={project}>
              {project}
            </ListBoxItem>
          ))}
        </ComboBox>
      ))}
      {(['sm', 'lg'] as const).map((size) => (
        <ComboBox
          key={size}
          label={`Project, size ${size}`}
          placeholder="Search projects"
          size={size}
        >
          {projects.map((project) => (
            <ListBoxItem key={project} id={project}>
              {project}
            </ListBoxItem>
          ))}
        </ComboBox>
      ))}
    </div>
  );
}
