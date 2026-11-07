export interface RegistryFile {
  path: string;
  type: string;
  target?: string;
}

const directories = {
  ui: 'components/ds',
  lib: 'lib/ds',
  hooks: 'hooks/ds',
  components: 'components',
};

export function registryFileTarget(file: string) {
  if (file.startsWith('styles/')) return `~/styles/ds/${file.split('/').at(-1)}`;
  if (file.startsWith('licenses/')) return `~/licenses/ds/${file.split('/').at(-1)}`;
  const [directory, ...parts] = file.split('/');
  const alias = directory === 'blocks' ? 'components' : directory;
  if (alias in directories) return `@${alias}/${parts.join('/')}`;
  return undefined;
}

export function installedRegistryPath(file: RegistryFile) {
  const target = file.target ?? registryFileTarget(file.path.replace(/^registry\/ds\//, ''));
  if (!target) return file.path.split('/').at(-1)!;
  return target
    .replace(/^~\//, '')
    .replace(
      /^@(ui|lib|hooks|components)\//,
      (_, alias: keyof typeof directories) => `${directories[alias]}/`,
    );
}

export function rewriteRegistryImports(source: string) {
  return source.replace(
    /(['"])@\/registry\/ds\/(ui|lib|hooks|blocks)\/([^'"]+)\1/g,
    (_, quote: string, directory: string, file: string) => {
      const target = installedRegistryPath({ path: `registry/ds/${directory}/${file}`, type: '' });
      return `${quote}@/${target.replace(/\.tsx?$/, '')}${quote}`;
    },
  );
}
