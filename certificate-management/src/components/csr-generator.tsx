'use client';

import {useState} from 'react';
import {Check, Copy, KeyRound, ShieldCheck} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {toast} from 'sonner';

// Helper component for the Copy button
function CopyButton({textToCopy}: { textToCopy: string }) {
    const [hasCopied, setHasCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy);
        setHasCopied(true);
        toast.success('Copied to clipboard!');
        setTimeout(() => setHasCopied(false), 2000);
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
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({...formData, keySize}),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'An unknown server error occurred.');
            }

            setResult(data);
            toast.success('Success! Your new key and CSR are ready.', {id: toastId});
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
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Certificate Signing Request (CSR) Generator</CardTitle>
                <CardDescription>
                    Create a new private key and CSR to be signed by a Certificate Authority.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Column 1: The Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="commonName">Common Name (CN)</Label>
                        <Input id="commonName" name="commonName" value={formData.commonName} onChange={handleChange}
                               required/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="organization">Organization (O)</Label>
                        <Input id="organization" name="organization" value={formData.organization}
                               onChange={handleChange} required/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="organizationalUnit">Organizational Unit (OU)</Label>
                        <Input id="organizationalUnit" name="organizationalUnit" value={formData.organizationalUnit}
                               onChange={handleChange}/>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="locality">City / Locality (L)</Label>
                            <Input id="locality" name="locality" value={formData.locality} onChange={handleChange}
                                   required/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="state">State / Province (ST)</Label>
                            <Input id="state" name="state" value={formData.state} onChange={handleChange} required/>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="country">Country Code (C)</Label>
                            <Input id="country" name="country" value={formData.country} onChange={handleChange}
                                   maxLength={2} required/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="keySize">Key Size (bits)</Label>
                            <Select value={keySize} onValueChange={setKeySize}>
                                <SelectTrigger id="keySize"><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="2048">2048 (Recommended)</SelectItem>
                                    <SelectItem value="3072">3072</SelectItem>
                                    <SelectItem value="4096">4096 (More Secure)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full">
                        <KeyRound className="mr-2 h-4 w-4"/>
                        {isLoading ? 'Generating...' : 'Generate Key & CSR'}
                    </Button>
                </form>

                {/* Column 2: The Results */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="csrResult" className="flex items-center">
                            <ShieldCheck className="mr-2 h-4 w-4 text-muted-foreground"/>
                            Certificate Signing Request (CSR)
                        </Label>
                        <div className="relative">
                            <Textarea
                                id="csrResult"
                                placeholder="Your CSR will appear here..."
                                value={result?.csr ?? ''}
                                readOnly
                                rows={8}
                                className="font-mono text-xs pr-10 bg-secondary"
                            />
                            {result && <CopyButton textToCopy={result.csr}/>}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="privateKeyResult" className="flex items-center">
                            <ShieldCheck className="mr-2 h-4 w-4 text-muted-foreground"/>
                            Private Key
                        </Label>
                        <div className="relative">
                            <Textarea
                                id="privateKeyResult"
                                placeholder="Your private key will appear here. Keep it safe!"
                                value={result?.privateKey ?? ''}
                                readOnly
                                rows={8}
                                className="font-mono text-xs pr-10 bg-secondary"
                            />
                            {result && <CopyButton textToCopy={result.privateKey}/>}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}