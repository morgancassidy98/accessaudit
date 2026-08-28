import { signIn } from '@/lib/auth';
import { GitHubIcon, GoogleIcon } from '@/components/icons';
import styles from './page.module.css';

export default function LoginPage() {
  return (
    <div className={styles.shell}>
      <div className={`card ${styles.card}`}>
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
            <button className={`btn btn-primary w-full ${styles.providerButton}`} type="submit">
              <GitHubIcon size={24} />
              Continue with GitHub
            </button>
          </form>

          <form action={async () => {
            'use server';
            await signIn('google', { redirectTo: '/' });
          }}>
            <button className={`btn btn-outline w-full ${styles.providerButton}`} type="submit">
              <GoogleIcon size={24} />
              Continue with Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}