import React, { useState } from 'react'
import { AnimatePresence, motion } from "motion/react"
import axios from "axios"
import { serverUrl } from '../App'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'

function LoginModal({ open, onClose }) {
    const dispatch = useDispatch()
    const [isLogin, setIsLogin] = useState(true)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
            const payload = isLogin 
                ? { email: formData.email, password: formData.password }
                : formData

            const { data } = await axios.post(`${serverUrl}${endpoint}`, payload, { withCredentials: true })
            dispatch(setUserData(data))
            onClose()
        } catch (error) {
            setError(error.response?.data?.message || 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {open &&
                <motion.div
                    className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-xl px-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >

                    <motion.div
                        initial={{ scale: 0.88, opacity: 0, y: 60 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 40 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        className="relative w-full max-w-md p-[1px] rounded-3xl bg-gradient-to-br from-purple-500/40 via-blue-500/30 to-transparent"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className='relative rounded-3xl bg-[#0b0b0b] border border-white/10 shadow-[0_30px_120px_rgba(0,0,0,0.8)] overflow-hidden' >
                            <motion.div
                                animate={{ opacity: [0.25, 0.4, 0.25] }}
                                transition={{ duration: 6, repeat: Infinity }}
                                className="absolute -top-32 -left-32 w-80 h-80 bg-purple-500/30 blur-[140px]"
                            />
                            <motion.div
                                animate={{ opacity: [0.2, 0.35, 0.2] }}
                                transition={{ duration: 6, repeat: Infinity, delay: 2 }}
                                className="absolute -bottom-32 -right-32 w-80 h-80 bg-blue-500/25 blur-[140px]"
                            />

                            <button
                                className='absolute top-5 right-5 z-20 text-zinc-400 hover:text-white transition text-lg'
                                onClick={onClose}
                            >
                                X
                            </button>

                            <div className='relative px-8 pt-14 pb-10'>
                                <h1 className='inline-block mb-6 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-300'> AI-powered website builder </h1>
                                <h2 className='text-3xl font-semibold leading-tight mb-3 space-x-2 text-center'>
                                    <span >Welcome to</span>
                                    <span className='bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent'>GenWeb.ai</span>
                                </h2>

                                <div className='flex justify-center mb-6'>
                                    <button
                                        onClick={() => setIsLogin(true)}
                                        className={`px-4 py-2 rounded-l-lg ${isLogin ? 'bg-purple-500 text-white' : 'bg-white/10 text-zinc-400'}`}
                                    >
                                        Login
                                    </button>
                                    <button
                                        onClick={() => setIsLogin(false)}
                                        className={`px-4 py-2 rounded-r-lg ${!isLogin ? 'bg-purple-500 text-white' : 'bg-white/10 text-zinc-400'}`}
                                    >
                                        Register
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className='space-y-4'>
                                    {!isLogin && (
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="Name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full h-13 px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-zinc-400 focus:outline-none focus:border-purple-500"
                                            required
                                        />
                                    )}
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full h-13 px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-zinc-400 focus:outline-none focus:border-purple-500"
                                        required
                                    />
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full h-13 px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-zinc-400 focus:outline-none focus:border-purple-500"
                                        required
                                    />

                                    {error && <p className="text-red-500 text-sm">{error}</p>}

                                    <motion.button
                                        type="submit"
                                        whileHover={{ scale: 1.04 }}
                                        whileTap={{ scale: 0.96 }}
                                        disabled={loading}
                                        className="group relative w-full h-13 rounded-xl bg-white text-black font-semibold shadow-xl overflow-hidden disabled:opacity-50"
                                    >
                                        {loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
                                    </motion.button>
                                </form>

                                <div className='flex items-center gap-4 my-10'>
                                    <div className='h-px flex-1 bg-white/10' />
                                    <span className='text-xs text-zinc-500 tracking-wide'>Secure Login</span>
                                    <div className='h-px flex-1 bg-white/10' />
                                </div>

                                <p className='text-xs text-zinc-500 leading-relaxed text-center'>
                                    By continuing, you agree to our{" "}
                                    <span className="underline cursor-pointer hover:text-zinc-300">
                                        Terms of Service
                                    </span>{" "}
                                    and{" "}
                                    <span className="underline cursor-pointer hover:text-zinc-300">
                                        Privacy Policy
                                    </span>.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            }
        </AnimatePresence>
    )
}

export default LoginModal
