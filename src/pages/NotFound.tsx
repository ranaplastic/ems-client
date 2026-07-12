import { ButtonLink } from '@/components/ui/ButtonLink';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-6xl font-bold text-brand-600">404</p>
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Page not found</h1>
        <p className="mt-1 text-sm text-slate-500">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
      <ButtonLink to="/dashboard">Back to Dashboard</ButtonLink>
    </div>
  );
}
