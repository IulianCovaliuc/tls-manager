"use client";

import {useState} from "react";
import {Toaster} from "sonner";
import {FileKey, ShieldCheck,} from "lucide-react";
import {CsrGenerator} from "@/components/csr-generator";


const tools = [
    {
        key: "generate-csr",
        title: "Generate CSR",
        description: "Create a new Certificate Signing Request.",
        icon: <FileKey className="w-8 h-8"/>,
        component: <CsrGenerator/>,
    },
];

export default function Home() {
    const currentYear = new Date().getFullYear();
    const [activeTool, setActiveTool] = useState("generate-csr");

    const activeToolData = tools.find((tool) => tool.key === activeTool);

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            <Toaster position="top-right" richColors/>
            {/* Header */}
            <header className="py-4 border-b border-slate-700">
                <div className="container mx-auto px-4 flex items-center gap-3">
                    <ShieldCheck className="h-7 w-7 text-sky-400"/>
                    <h1 className="text-2xl font-bold">TLS Manager</h1>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto py-10 px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold mb-4">
                        Certificate Management Tool
                    </h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        A complete suite of tools to generate, decode, and manage your TLS
                        certificates with ease.
                    </p>
                </div>

                {/* Tool Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-12">
                    {tools.map((tool) => (
                        <div
                            key={tool.key}
                            onClick={() => setActiveTool(tool.key)}
                            className={`p-4 rounded-lg text-center cursor-pointer transition-all duration-200 ${
                                activeTool === tool.key
                                    ? "bg-sky-500 text-white shadow-lg"
                                    : "bg-slate-800 hover:bg-slate-700"
                            }`}
                        >
                            <div className="flex justify-center mb-2">{tool.icon}</div>
                            <h3 className="font-semibold text-sm">{tool.title}</h3>
                        </div>
                    ))}
                </div>

                {/* Active Tool Area */}
                <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl">
                    <div className="p-4 border-b border-slate-700">
                        <h3 className="text-lg font-semibold">{activeToolData?.title}</h3>
                        <p className="text-sm text-slate-400">
                            {activeToolData?.description}
                        </p>
                    </div>
                    <div className="p-6">{activeToolData?.component}</div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-6 border-t border-slate-700 mt-12">
                <div className="container mx-auto px-4 text-center text-sm text-slate-400">
                    <p>
                        © {currentYear} Certificate Management Tool. This is a simple tool
                        created to help generate CSRs manually and to help with the hassle
                        of creating PFX files. Tool Created by Iulian Covaliuc.
                    </p>
                </div>
            </footer>
        </div>
    );
}