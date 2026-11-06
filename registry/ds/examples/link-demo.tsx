import { Link } from '@/registry/ds/ui/link';

export default function LinkDemo() {
  return (
    <p className="max-w-md text-body-lg text-on-surface">
      By creating an account, you agree to the <Link href="#usage">Terms of Service</Link> and the{' '}
      <Link href="#api">Privacy Policy</Link>.
    </p>
  );
}
