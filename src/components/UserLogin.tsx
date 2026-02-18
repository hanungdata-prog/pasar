import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';
import { userAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Smartphone, User, Phone } from 'lucide-react';

const loginSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  whatsapp: z.string().regex(/^[8-9][0-9]{9,14}$/, 'Nomor WhatsApp tidak valid (mulai dengan 8/9, 10-15 angka)'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function UserLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, isAuthenticated, user, setDeviceFingerprint } = useUserStore();
  const [isGeneratingFingerprint, setIsGeneratingFingerprint] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      name: '',
      whatsapp: '',
    },
  });

  useEffect(() => {
    // Generate device fingerprint saat komponen mount
    const initFingerprint = async () => {
      try {
        const fingerprint = await userAPI.generateFingerprint();
        setDeviceFingerprint(fingerprint);
        console.log('Device Fingerprint:', fingerprint);
      } catch (error) {
        console.error('Failed to generate fingerprint:', error);
      } finally {
        setIsGeneratingFingerprint(false);
      }
    };

    initFingerprint();
  }, [setDeviceFingerprint]);

  const onSubmit = async (data: LoginForm) => {
    try {
      // Prepend +62 to whatsapp number
      const whatsappWithCode = `+62${data.whatsapp}`;
      await login(whatsappWithCode, data.name);
      toast({
        title: 'Berhasil!',
        description: 'Anda berhasil login/register.',
      });
      navigate('/');
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast({
        title: 'Error',
        description: err.message || 'Terjadi kesalahan saat login',
        variant: 'destructive',
      });
    }
  };

  if (isGeneratingFingerprint) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Mendeteksi Device...
          </CardTitle>
          <CardDescription>
            Kami sedang mendeteksi device Anda untuk keamanan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isAuthenticated && user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profil Anda
          </CardTitle>
          <CardDescription>
            Device Anda telah terdaftar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nama</Label>
            <div className="flex items-center gap-2 p-2 border rounded-md">
              <User className="w-4 h-4 text-muted-foreground" />
              <span>{user.name}</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label>WhatsApp</Label>
            <div className="flex items-center gap-2 p-2 border rounded-md">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>+62 {user.whatsapp?.replace(/^\+62/, '')}</span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>Device Info:</p>
            <ul className="list-disc list-inside mt-1">
              <li>OS: {user.deviceInfo?.os || 'Unknown'}</li>
              <li>Screen: {user.deviceInfo?.screenResolution || 'Unknown'}</li>
              <li>Timezone: {user.deviceInfo?.timezone || 'Unknown'}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          Login / Register
        </CardTitle>
        <CardDescription>
          Masuk dengan nomor WhatsApp Anda. Device akan otomatis terdeteksi.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama</Label>
            <Input
              id="name"
              placeholder="Masukkan nama Anda"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">Nomor WhatsApp</Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-background text-sm text-muted-foreground">
                +62
              </span>
              <Input
                id="whatsapp"
                placeholder="8123456789"
                type="tel"
                className="rounded-l-none"
                {...register('whatsapp')}
              />
            </div>
            {errors.whatsapp && (
              <p className="text-sm text-destructive">{errors.whatsapp.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Memproses...' : 'Lanjut'}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Dengan melanjutkan, Anda menyetujui penggunaan device fingerprint untuk identifikasi.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
