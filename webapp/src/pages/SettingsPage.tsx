import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { updateAdminProfile, updatePassword } from '@/services/profile.service';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
  const { profile } = useAuth();
  const [profileForm, setProfileForm] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    phone_number: profile?.phone_number || 0,
    district: profile?.district || 'Musanze' as 'Musanze' | 'Nyabihu',
  });
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });

  const profileMutation = useMutation({
    mutationFn: () => updateAdminProfile(profile!.id, profileForm),
    onSuccess: () => toast.success('Profile updated successfully'),
    onError: () => toast.error('Failed to update profile'),
  });

  const passwordMutation = useMutation({
    mutationFn: () => updatePassword(passwordForm.newPassword),
    onSuccess: () => {
      toast.success('Password changed successfully');
      setPasswordForm({ newPassword: '', confirmPassword: '' });
    },
    onError: () => toast.error('Failed to change password'),
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    profileMutation.mutate();
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    passwordMutation.mutate();
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <Label>First Name</Label>
              <Input
                value={profileForm.first_name}
                onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input
                value={profileForm.last_name}
                onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input
                type="number"
                value={profileForm.phone_number}
                onChange={(e) => setProfileForm({ ...profileForm, phone_number: parseInt(e.target.value) || 0 })}
                placeholder="0790101642"
                required
              />
            </div>
            <div>
              <Label>District</Label>
              <Select
                value={profileForm.district}
                onValueChange={(v: 'Musanze' | 'Nyabihu') => setProfileForm({ ...profileForm, district: v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Musanze">Musanze</SelectItem>
                  <SelectItem value="Nyabihu">Nyabihu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" style={{ background: 'var(--brand-main)', color: 'white' }}>
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="Minimum 8 characters"
                required
              />
            </div>
            <div>
              <Label>Confirm Password</Label>
              <Input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder="Re-enter password"
                required
              />
            </div>
            <Button type="submit" className="w-full" style={{ background: 'var(--brand-main)', color: 'white' }}>
              Change Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
