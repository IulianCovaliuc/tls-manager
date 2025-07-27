'use client';

import {useState} from 'react';
import {Check, Copy, KeyRound} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {toast} from 'sonner';

// Helper component for Copy functionality
function CopyButton({textToCopy}: { textToCopy: string }) {
    const [hasCopied, setHasCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy);
        setHasCopied(true);
        toast.success('Copied to clipboard!');
        setTimeout(() => setHasCopied(false), 2000); // Reset icon after 2 seconds
    };

    return (
        <Button variant="ghost" size="icon" onClick={handleCopy} className="absolute top-2 right-2 h-7 w-7">
            {hasCopied ? <Check className="h-4 w-4 text-emerald-500"/> : <Copy className="h-4 w-4"/>}
        </Button>
    );
}


export function CsrGenerator() {
    const [formData, setFormData] = useState({
        commonName: 'example.com',
        organization: 'My Awesome Company',
        organizationalUnit: 'IT Department',
        locality: 'Lisbon',
        state: 'Lisbon',
        country: 'PT',
    });
    const [keySize, setKeySize] = useState('2048');
    const [result, setResult] = useState<{ privateKey: string; csr: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setResult(null);
        const toastId = toast.loading('Generating CSR and Private Key...');

        try {
            const response = await fetch('/api/generate_csr', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({...formData, keySize}),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'An unknown server error occurred.');
            }

            setResult(data);
            toast.success('CSR and Private Key generated successfully!', {id: toastId});
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message, {id: toastId});
            } else {
                toast.error('An unexpected error occurred.', {id: toastId});
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setFormData((prev) => ({...prev, [name]: value}));
    };

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle>Certificate Signing Request (CSR) Generator</CardTitle>
                <CardDescription>
                    Fill in the details below to generate a new private key and a CSR to send to a Certificate
                    Authority.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="commonName">Common Name (CN)</Label>
                            <Input
                                id="commonName"
                                name="commonName"
                                value={formData.commonName}
                                onChange={handleChange}
                                placeholder="e.g., yourdomain.com"
                                required
                            />
                            <p className="text-sm text-muted-foreground">The fully qualified domain name for your
                                server.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="organization">Organization (O)</Label>
                            <Input
                                id="organization"
                                name="organization"
                                value={formData.organization}
                                onChange={handleChange}
                                placeholder="e.g., Your Company, Inc."
                                required
                            />
                            <p className="text-sm text-muted-foreground">Your company&apos;s legally registered
                                name.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="organizationalUnit">Organizational Unit (OU)</Label>
                            <Input
                                id="organizationalUnit"
                                name="organizationalUnit"
                                value={formData.organizationalUnit}
                                onChange={handleChange}
                                placeholder="e.g., IT Department"
                            />
                            <p className="text-sm text-muted-foreground">The specific division of your organization.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="locality">City / Locality (L)</Label>
                            <Input
                                id="locality"
                                name="locality"
                                value={formData.locality}
                                onChange={handleChange}
                                placeholder="e.g., Lisbon"
                                required
                            />
                            <p className="text-sm text-muted-foreground">The city where your company is located.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="state">State / Province (ST)</Label>
                            <Input
                                id="state"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                placeholder="e.g., Lisbon"
                                required
                            />
                            <p className="text-sm text-muted-foreground">The state or province of your location.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="country">Country (C)</Label>
                            <Input
                                id="country"
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                placeholder="e.g., PT"
                                maxLength={2}
                                required
                            />
                            <p className="text-sm text-muted-foreground">The two-letter ISO code for your country.</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="keySize">Key Size</Label>
                            <Select value={keySize} onValueChange={setKeySize}>
                                <SelectTrigger id="keySize">
                                    <SelectValue placeholder="Select key size"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2048">2048-bit (Recommended)</SelectItem>
                                    <SelectItem value="4096">4096-bit</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-sm text-muted-foreground">The strength of the private key.</p>
                        </div>
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                        <KeyRound className="mr-2 h-4 w-4"/>
                        {isLoading ? 'Generating...' : 'Generate'}
                    </Button>
                </form>

                {result && (
                    <div className="mt-8 pt-8 border-t space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="csrResult">Your Certificate Signing Request (CSR)</Label>
                            <div className="relative">
                                <Textarea id="csrResult" value={result.csr} readOnly rows={10}
                                          className="font-mono text-xs pr-10"/>
                                <CopyButton textToCopy={result.csr}/>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="privateKeyResult">Your Private Key (Keep it safe!)</Label>
                            <div className="relative">
                                <Textarea id="privateKeyResult" value={result.privateKey} readOnly rows={10}
                                          className="font-mono text-xs pr-10"/>
                                <CopyButton textToCopy={result.privateKey}/>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}