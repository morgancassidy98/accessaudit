import { signIn } from '@/lib/auth';

export default function LoginPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg)',
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '32px',
          textAlign: 'center',
          marginBottom: '8px',
        }}>
          Audit Ally
        </h1>
        <p className="text-muted" style={{ textAlign: 'center', marginBottom: '32px' }}>
          Sign in to manage your accessibility audits
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <form action={async () => {
            'use server';
            await signIn('github', { redirectTo: '/' });
          }}>
            <button className="btn btn-primary w-full" type="submit">
              Continue with GitHub
            </button>
          </form>

          <form action={async () => {
            'use server';
            await signIn('google', { redirectTo: '/' });
          }}>
            <button className="btn btn-outline w-full" type="submit">
              Continue with Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}