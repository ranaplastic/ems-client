import { useState } from 'react';
import toast from 'react-hot-toast';
import { User, Phone, Mail, MapPin, Save, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clientsApi } from '@/api/clients';
import { extractErrorMessage } from '@/api/client';
import { useAuthStore } from '@/store/authStore';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Input';

export default function Profile() {
  const navigate = useNavigate();
  const client = useAuthStore((s) => s.client);
  const setClient = useAuthStore((s) => s.setClient);
  const logout = useAuthStore((s) => s.logout);

  const [name, setName] = useState(client?.name ?? '');
  const [phoneNo, setPhoneNo] = useState(client?.phoneNo ?? '');
  const [emailId, setEmailId] = useState(client?.emailId ?? '');
  const [address, setAddress] = useState(client?.address ?? '');
  const [saving, setSaving] = useState(false);

  if (!client) return null;

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      const updated = await clientsApi.update(client.clientId, {
        name: name.trim(),
        phoneNo: phoneNo.trim() || null,
        emailId: emailId.trim() || null,
        address: address.trim() || null,
      });
      setClient(updated);
      toast.success('Profile updated.');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">My Profile</h1>
        <p className="text-sm text-slate-500">Manage your contact details.</p>
      </div>

      <Card>
        <CardHeader className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-lg font-semibold text-white">
            {(client.name ?? 'C').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{client.name}</p>
            <p className="text-xs text-slate-400">Client #{client.clientId}</p>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <Field label="Full Name" required>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input className="pl-9" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </Field>

          <Field label="Phone Number">
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-9"
                type="tel"
                value={phoneNo}
                onChange={(e) => setPhoneNo(e.target.value)}
              />
            </div>
          </Field>

          <Field label="Email">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-9"
                type="email"
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
              />
            </div>
          </Field>

          <Field label="Address">
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Textarea
                className="pl-9"
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </Field>

          <Button fullWidth loading={saving} onClick={handleSave}>
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </CardBody>
      </Card>

      <Button variant="outline" fullWidth onClick={handleLogout} className="text-red-600">
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    </div>
  );
}
