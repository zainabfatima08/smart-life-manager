import { redirect } from 'next/navigation';

export default function Home() {
  // The product entry point should open the signup experience directly.
  redirect('/register');
}
