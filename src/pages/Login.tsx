import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { LogIn, ShieldCheck } from 'lucide-react';
import { clientsApi } from '@/api/clients';
import { extractErrorMessage } from '@/api/client';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';

interface LoginForm {
  clientId: string;
  phoneNo: string;
}

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setSubmitting(true);
    try {
      const client = await clientsApi.getById(Number(data.clientId));

      // Lightweight verification: the entered phone must match the record.
      const enteredPhone = data.phoneNo.replace(/\s+/g, '');
      const storedPhone = (client.phoneNo ?? '').replace(/\s+/g, '');
      if (storedPhone && enteredPhone && storedPhone !== enteredPhone) {
        toast.error('Client ID and phone number do not match.');
        return;
      }

      login(client);
      toast.success(`Welcome back, ${client.name}!`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-600 to-brand-800 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center text-white">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-lg font-bold backdrop-blur">
            RP
          </div>
          <h1 className="text-2xl font-bold">Rana Plastics</h1>
          <p className="text-sm text-brand-100">Client Portal</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-xl sm:p-8">
          <h2 className="text-lg font-semibold text-slate-900">Sign in to your account</h2>
          <p className="mt-1 text-sm text-slate-500">
            Enter your Client ID and registered phone number to continue.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <Field label="Client ID" required error={errors.clientId?.message}>
              <Input
                type="number"
                inputMode="numeric"
                placeholder="e.g. 1024"
                autoComplete="username"
                {...register('clientId', {
                  required: 'Client ID is required',
                  min: { value: 1, message: 'Enter a valid Client ID' },
                })}
              />
            </Field>

            <Field label="Phone Number" required error={errors.phoneNo?.message}>
              <Input
                type="tel"
                inputMode="tel"
                placeholder="Registered mobile number"
                autoComplete="tel"
                {...register('phoneNo', { required: 'Phone number is required' })}
              />
            </Field>

            <Button type="submit" fullWidth loading={submitting} size="lg">
              <LogIn className="h-4 w-4" />
              Sign in
            </Button>
          </form>

          <div className="mt-6 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            <span>
              Your session is encrypted and stored only on this device. Contact Rana Plastics
              if you don&apos;t know your Client ID.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
