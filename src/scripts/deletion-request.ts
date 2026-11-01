import { initializeApp } from 'firebase/app';
import { initializeAuth, inMemoryPersistence, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { getFunctions, httpsCallable } from 'firebase/functions';

const root = document.querySelector<HTMLElement>('#deletion-app');
if (root?.dataset.ready === 'true') {
  const app = initializeApp(JSON.parse(root.dataset.authOptions || '{}'), 'ginhawa-deletion');
  const auth = initializeAuth(app, { persistence: inMemoryPersistence });
  initializeAppCheck(app, { provider: new ReCaptchaV3Provider(root.dataset.appcheck!), isTokenAutoRefreshEnabled: true });
  const call = httpsCallable(getFunctions(app, 'asia-southeast1'), 'studentAccountDeletion');
  const login = document.querySelector<HTMLFormElement>('#deletion-sign-in')!;
  const email = document.querySelector<HTMLInputElement>('#account-email')!;
  const password = document.querySelector<HTMLInputElement>('#account-password')!;
  const panel = document.querySelector<HTMLElement>('#deletion-confirm')!;
  const output = document.querySelector<HTMLElement>('#deletion-status')!;
  const submit = document.querySelector<HTMLButtonElement>('#deletion-submit')!;
  const understood = document.querySelector<HTMLInputElement>('#deletion-understood')!;
  let busy = false, pending = false;
  async function showStatus() {
    const result = await call({ action: 'status' });
    const data = result.data as { id: string; status: string } | null;
    pending = Boolean(data); submit.disabled = pending || !understood.checked;
    output.textContent = data ? `Request ${data.id}: ${data.status.charAt(0).toUpperCase() + data.status.slice(1)}.` : 'Identity verified. You can submit your deletion request.';
  }
  async function verified() {
    password.value = ''; login.hidden = true; panel.hidden = false;
    document.querySelector<HTMLElement>('#verified-identity')!.textContent = `Signed in as ${auth.currentUser?.email || 'your GINHAWA account'}.`;
    await showStatus();
  }
  async function run(action: () => Promise<void>) {
    if (busy) return;
    busy = true; submit.disabled = true; login.querySelector('fieldset')!.disabled = true;
    try { await action(); }
    catch { output.textContent = 'We couldn’t confirm this action. Check your sign-in or connection and retry. Refresh status before submitting again.'; }
    finally { busy = false; login.querySelector('fieldset')!.disabled = false; submit.disabled = pending || !understood.checked; }
  }
  login.addEventListener('submit', event => { event.preventDefault(); void run(async () => { await signInWithEmailAndPassword(auth, email.value.trim(), password.value); await verified(); }); });
  document.querySelector('#deletion-google')!.addEventListener('click', () => void run(async () => { const provider = new GoogleAuthProvider(); provider.setCustomParameters({ prompt: 'select_account' }); await signInWithPopup(auth, provider); await verified(); }));
  document.querySelector('#deletion-recover')!.addEventListener('click', () => {
    if (!email.reportValidity()) return;
    void run(async () => { try { await sendPasswordResetEmail(auth, email.value.trim()); } catch { /* identical response prevents account enumeration */ } output.textContent = 'If password recovery is available for this address, Firebase will send instructions. Check your inbox, then return here to verify.'; });
  });
  understood.addEventListener('change', () => { submit.disabled = busy || pending || !understood.checked; });
  submit.addEventListener('click', () => void run(async () => { if (!understood.checked || pending) return; await auth.currentUser?.getIdToken(true); await call({ action: 'submit', confirmed: true }); pending = true; await showStatus(); }));
  document.querySelector('#deletion-refresh')!.addEventListener('click', () => void run(showStatus));
  document.querySelector('#deletion-sign-out')!.addEventListener('click', () => void run(async () => { await signOut(auth); panel.hidden = true; login.hidden = false; pending = false; understood.checked = false; output.textContent = 'Signed out.'; }));
}
