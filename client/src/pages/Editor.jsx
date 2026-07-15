import axios from 'axios'
import React from 'react'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { serverUrl } from '../App'
import { useState } from 'react'
import { ArrowLeft, Code, Code2, MessageCircle, MessageSquare, Monitor, Palette, Rocket, Send, X } from 'lucide-react'
import { useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'

import Editor from '@monaco-editor/react';

function WebsiteEditor() {
    const { id } = useParams()
    const [website, setWebsite] = useState(null)
    const [error, setError] = useState("")
    const [code, setCode] = useState("")
    const [messages, setMessages] = useState([])
    const [prompt, setPrompt] = useState("")
    const iframeRef = useRef(null)
    const editorRef = useRef(null)
    const [updateLoading, setUpdateLoading] = useState(false)
    const [thinkingIndex, setThinkingIndex] = useState(0)
    const [showCode, setShowCode] = useState(false)
    const [stylePreset, setStylePreset] = useState("minimal")

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;

        monaco.editor.defineTheme('custom-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: {
                'editor.background': '#0f0f0f',
            }
        });
        monaco.editor.setTheme('custom-dark');

        editor.addAction({
            id: 'format-document',
            label: 'Format Document',
            keybindings: [
                monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF
            ],
            precondition: null,
            keybindingContext: null,
            contextMenuGroupId: 'navigation',
            contextMenuOrder: 1.5,
            run: function(ed) {
                ed.getAction('editor.action.formatDocument').run();
            }
        });

        editor.onDidPaste(() => {
            setTimeout(() => {
                editor.getAction('editor.action.formatDocument').run();
            }, 100);
        });
    }
    const [showFullPreview, setShowFullPreview] = useState(false)
    const [showChat, setShowChat] = useState(false)
    const thinkingSteps = [
        "Understanding your request…",
        "Planning layout changes…",
        "Improving responsiveness…",
        "Applying animations…",
        "Finalizing update…",
    ]
    const handleUpdate = async () => {
        if (!prompt) return
        setUpdateLoading(true)
        const text = prompt
        setPrompt("")
        setMessages((m) => [...m, { role: "user", content: text }])
        try {
            const result = await axios.post(`${serverUrl}/api/website/update/${id}`, { prompt: text, stylePreset }, { withCredentials: true })
            setMessages((m) => [...m, { role: "ai", content: result.data.message }])
            setCode(result.data.code)
        } catch (error) {
            console.log(error)
        } finally {
            setUpdateLoading(false)
        }
    }

    const handleApplyStyle = async () => {
        if (updateLoading) return

        setUpdateLoading(true)
        const styleMessage = `Apply a ${stylePreset} visual style to this website while preserving the current structure and content.`
        setMessages((m) => [...m, { role: "user", content: styleMessage }])

        try {
            const result = await axios.post(`${serverUrl}/api/website/update/${id}`, { prompt: styleMessage, stylePreset }, { withCredentials: true })
            setMessages((m) => [...m, { role: "ai", content: result.data.message }])
            setCode(result.data.code)
        } catch (error) {
            console.log(error)
        } finally {
            setUpdateLoading(false)
        }
    }

    const handleDeploy = async () => {
            try {
                const result = await axios.get(`${serverUrl}/api/website/deploy/${website._id}`, { withCredentials: true })
                window.open(`${result.data.url}`, "_blank")
               
            } catch (error) {
                console.log(error)
            }
        }

    const handleFormatCode = () => {
        if (editorRef.current) {
            editorRef.current.getAction('editor.action.formatDocument').run();
        }
    }


    useEffect(() => {
        if (!updateLoading) return;
        const i = setInterval(() => {
            setThinkingIndex((i) => (i + 1) % thinkingSteps.length)
        }, 1200)

        return () => clearInterval(i)
    }, [updateLoading])

    useEffect(() => {
        const handleGetWebsite = async () => {
            try {
                const result = await axios.get(`${serverUrl}/api/website/get-by-id/${id}`, { withCredentials: true })
                setWebsite(result.data)
                setCode(result.data.latestCode)
                setMessages(result.data.conversation)
                setStylePreset(result.data.stylePreset || "minimal")
            } catch (error) {
                console.log(error)
                setError(error.response.data.message)
            }
        }
        handleGetWebsite()
    }, [id])


    useEffect(() => {
        if (!iframeRef.current || !code) return;
        const blob = new Blob([code], { type: "text/html" })
        const url = URL.createObjectURL(blob)
        iframeRef.current.src = url

        // Auto-format code when it changes
        if (editorRef.current && code) {
            setTimeout(() => {
                if (editorRef.current) {
                    editorRef.current.getAction('editor.action.formatDocument').run();
                }
            }, 200);
        }

        return () => URL.revokeObjectURL(url)
    }, [code])

    if (error) {
        return (
            <div className='h-screen flex items-center justify-center bg-black text-red-400'>
                {error}
            </div>
        )
    }
    if (!website) {
        return (
            <div className='h-screen flex items-center justify-center bg-black text-white'>
                Loading...
            </div>
        )
    }



    return (
        <div className='h-screen w-screen flex bg-black text-white overflow-hidden'>
            <aside className='hidden lg:flex w-95 flex-col border-r border-white/10 bg-black/80'>
                <Header />
                <>
                    <div className='flex-1 overflow-y-auto px-4 py-4 space-y-4'>
                        {messages.map((m, i) => (
                            <div
                                key={i}
                                className={`max-w-[85%] ${m.role === "user" ? "ml-auto" : "mr-auto"
                                    }`}
                            >

                                <div
                                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${m.role === "user"
                                        ? "bg-white text-black"
                                        : "bg-white/5 border border-white/10 text-zinc-200"
                                        }`}
                                >

                                    {m.content}

                                </div>

                            </div>
                        ))}

                        {updateLoading &&

                            <div className='max-w-[85%] mr-auto'>
                                <div className='px-4 py-2.5 rounded-2xl text-xs bg-white/5 border border-white/10 text-zinc-400 italic'>{thinkingSteps[thinkingIndex]}</div>
                            </div>}




                    </div>
                    <div className='p-3 border-t border-white/10'>
                        <div className='flex gap-2'>
                            <input placeholder='Describe Changes...' className='flex-1 resize-none rounded-2xl px-4 py-3 bg-white/5 border border-white/10 text-sm outline-none' onChange={(e) => setPrompt(e.target.value)} value={prompt} />
                            <button className='px-4 py-3 rounded-2xl bg-white text-black' disabled={updateLoading} onClick={handleUpdate}><Send size={14} /></button>
                        </div>
                    </div>

                </>
            </aside>

            <div className='flex-1 flex flex-col'>
                <div className='h-14 px-4 flex justify-between items-center border-b border-white/10 bg-black/80'>
                    <span className='text-xs text-zinc-400'>Live Preview</span>
                    <div className='flex flex-wrap items-center justify-end gap-2'>
                        <select
                            value={stylePreset}
                            onChange={(e) => setStylePreset(e.target.value)}
                            className='rounded-lg border border-white/10 bg-black px-3 py-1.5 text-sm text-white outline-none'
                        >
                            <option value='minimal'>Minimal</option>
                            <option value='luxury'>Luxury</option>
                            <option value='playful'>Playful</option>
                            <option value='tech'>Tech</option>
                            <option value='bold'>Bold</option>
                        </select>
                        <button
                            onClick={handleApplyStyle}
                            disabled={updateLoading}
                            className='flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/10 disabled:opacity-60'
                        >
                            <Palette size={14} /> Apply Style
                        </button>
                        {website.deployed ?"": <button className='flex items-center gap-2 px-4 py-1.5 rounded-lg bg-linear-to-r from-indigo-500 to-purple-500 text-sm font-semibold hover:scale-105 transition'
                        onClick={handleDeploy}
                        ><Rocket size={14} /> Deploy</button>}
                       
                        <button className='p-2' onClick={() => setShowChat(true)}><MessageSquare size={18} /></button>
                        <button className='p-2' onClick={() => setShowCode(true)}><Code2 size={18} /></button>
                        <button className='p-2' onClick={() => setShowFullPreview(true)}><Monitor size={18} /></button>
                    </div>

                </div>

                <iframe ref={iframeRef} sandbox='allow-scripts allow-same-origin allow-forms' className='flex-1 w-full bg-white' />
            </div>

            <AnimatePresence>
                {showChat && (
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        className="fixed inset-0 z-[9999] bg-black flex flex-col"
                    >
                   <Header onclose={()=>setShowChat(false)}/>
                   <>
                    <div className='flex-1 overflow-y-auto px-4 py-4 space-y-4'>
                        {messages.map((m, i) => (
                            <div
                                key={i}
                                className={`max-w-[85%] ${m.role === "user" ? "ml-auto" : "mr-auto"
                                    }`}
                            >

                                <div
                                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${m.role === "user"
                                        ? "bg-white text-black"
                                        : "bg-white/5 border border-white/10 text-zinc-200"
                                        }`}
                                >

                                    {m.content}

                                </div>

                            </div>
                        ))}

                        {updateLoading &&

                            <div className='max-w-[85%] mr-auto'>
                                <div className='px-4 py-2.5 rounded-2xl text-xs bg-white/5 border border-white/10 text-zinc-400 italic'>{thinkingSteps[thinkingIndex]}</div>
                            </div>}




                    </div>
                    <div className='p-3 border-t border-white/10'>
                        <div className='flex gap-2'>
                            <input placeholder='Describe Changes...' className='flex-1 resize-none rounded-2xl px-4 py-3 bg-white/5 border border-white/10 text-sm outline-none' onChange={(e) => setPrompt(e.target.value)} value={prompt} />
                            <button className='px-4 py-3 rounded-2xl bg-white text-black' disabled={updateLoading} onClick={handleUpdate}><Send size={14} /></button>
                        </div>
                    </div>

                </>
                    </motion.div>
                )}
            </AnimatePresence>


            <AnimatePresence>
                {showCode && (
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        className="fixed inset-y-0 right-0 w-full lg:w-[45%] z-[9999] bg-[#1e1e1e] flex flex-col"
                    >
                        <div className='h-12 px-4 flex justify-between items-center border-b border-white/10 bg-[#1e1e1e]'>
                            <span className='text-sm font-medium'>index.html</span>
                            <div className='flex items-center gap-2'>
                                <button 
                                    onClick={handleFormatCode}
                                    className='px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded transition-colors'
                                    title='Format Code (Shift+Alt+F)'
                                >
                                    Format
                                </button>
                                <button onClick={() => setShowCode(false)}>
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                        <Editor
                            height="100%"
                            theme='custom-dark'
                            value={code}
                            language='html'
                            onChange={(v) => setCode(v)}
                            onMount={handleEditorDidMount}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                lineNumbers: 'on',
                                automaticLayout: true,
                                scrollBeyondLastLine: false,
                                wordWrap: 'on',
                                tabSize: 2,
                                insertSpaces: true
                            }}
                        />

                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showFullPreview && (
                    <motion.div
                        className="fixed inset-0 z-[9999] bg-black"
                    >
                        <iframe className='w-full h-full bg-white' srcDoc={code} sandbox='allow-scripts allow-same-origin allow-forms'/>
                        <button onClick={() => setShowFullPreview(false)} className='absolute top-4 right-4 p-2 bg-black/70 rounded-lg'><X /></button>
                    </motion.div>
                )}
            </AnimatePresence>


        </div>
    )

    function Header({onclose}) {
        return (
            <div className='h-14 px-4 flex items-center justify-between border-b border-white/10'>
                <span className='font-semibold truncate'>{website.title}</span>
                {onclose &&  <button onClick={onclose}><X size={18} color='white'/></button>}
           
            </div>
        )
    }



}





export default WebsiteEditor
