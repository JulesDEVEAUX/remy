import { SignupForm } from '@/components/auth/SignupForm';
import { signupAction } from './actions';

export default function SignupPage() {
  return <SignupForm action={signupAction} />;
}
