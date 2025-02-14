"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Copy, ExternalLink, QrCode as LucidQrCode, XCircle } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import QRCode from "react-qr-code";

const Home = () => {

    const [longUrl, setLongUrl] = useState<string>('');
    const [shortUrl, setShortUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isQROpen, setIsQROpen] = useState(false);
    const copyToClipboard = () => {
        navigator.clipboard.writeText(shortUrl ?? '');
    }


    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            const response = await fetch('/api/shorten', {
                method: 'POST',
                body: longUrl
            })

            if (!response.ok) {
                throw new Error('Failed to shorten URL');
            }

            const data = await response.json();

            setShortUrl(data['short_url']);
            setError(null);
        }

        catch (error) {
            if (error instanceof Error)
                setError(error.message);
            setShortUrl(null);
        }
    }
    return (
        <>

            <div className="flex flex-col">

                <Card className="w-full max-w-md mx-auto my-8">
                    <CardHeader>
                        <CardTitle>ByteLink URL Shortener</CardTitle>
                        <CardDescription>Enter a long URL to get a ByteLink shortened version.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">

                            <Input
                                type="text"
                                placeholder="Enter your long URL here"
                                value={longUrl}
                                onChange={(e) => setLongUrl(e.target.value)}
                                required
                                aria-label="Long URL"
                            />
                            <Button type="submit" className="w-full">
                                Get ByteLink
                            </Button>
                        </form>

                    </CardContent>
                </Card>

                {
                    shortUrl && (

                        <Alert className="mt-4 bg-green-50 border-green-200">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertTitle className="text-green-800">Success!</AlertTitle>
                            <AlertDescription className="mt-2 flex items-center justify-between">
                                <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center">
                                    {shortUrl}
                                    <ExternalLink className="ml-1 h-4 w-4" />
                                </a>
                                <div className="flex space-x-2">
                                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                                        <Copy className="mr-1 h-4 w-4" />
                                        Copy
                                    </Button>
                                    <Dialog open={isQROpen} onOpenChange={setIsQROpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                <LucidQrCode className="mr-1 h-4 w-4" />
                                                QR Code
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-md">
                                            <DialogHeader>
                                                <DialogTitle>QR Code for {shortUrl}</DialogTitle>
                                            </DialogHeader>
                                            <div className="flex justify-center p-6">
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </AlertDescription>
                        </Alert>

                    )
                }

                {error && (
                    <Alert variant="destructive" className="mt-4">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

            </div>

        </>
    )

}

export default Home;
