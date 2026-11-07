import { Sparkline } from '@/registry/ds/ui/sparkline';

const projects = [
  { name: 'Website', visits: [120, 132, 128, 150, 162, 171, 168, 190], total: '1,221' },
  { name: 'Mobile app', visits: [88, 84, 91, 87, 95, 102, 99, 110], total: '756' },
  { name: 'Help centre', visits: [64, 61, 59, 57, 60, 52, 49, 47], total: '449' },
];

const weeks = Array.from({ length: 8 }, (_, index) => new Date(2026, 8, 7 + index * 7));

export default function SparklineTable() {
  return (
    <table className="w-full max-w-lg text-sm">
      <thead>
        <tr className="text-xs text-on-surface-variant">
          <th scope="col" className="py-2 text-start font-medium">
            Project
          </th>
          <th scope="col" className="py-2 text-start font-medium">
            Last 8 weeks
          </th>
          <th scope="col" className="py-2 text-end font-medium">
            Visits
          </th>
        </tr>
      </thead>
      <tbody>
        {projects.map((project) => (
          <tr key={project.name} className="border-t border-outline-subtle">
            <th scope="row" className="py-3 text-start font-medium text-on-surface">
              {project.name}
            </th>
            <td className="py-3">
              <Sparkline
                aria-label={`${project.name} visits, last 8 weeks`}
                data={project.visits}
                categories={weeks}
                className="h-6 w-28"
              />
            </td>
            <td className="py-3 text-end text-on-surface tabular-nums">{project.total}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
