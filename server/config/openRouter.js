const openRouterUrl = "https://openrouter.ai/api/v1/chat/completions"
const model = "deepseek/deepseek-chat"
const maxTokens = Number(process.env.OPENROUTER_MAX_TOKENS || 3000)

export const generateResponse = async (prompt) => {
    if (!process.env.OPENROUTER_API_KEY) {
        throw new Error("OpenRouter API key is not configured")
    }

    try {
        const res = await fetch(openRouterUrl, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: "system", content: "You must return ONLY valid raw JSON." }
                    ,
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.2,
                max_tokens: maxTokens
            }),
        })

        if (!res.ok) {
            const errText = await res.text()
            let message = `OpenRouter error ${res.status}`

            try {
                const payload = JSON.parse(errText)
                message = payload?.error?.message || message
            } catch {
                message = errText || message
            }

            if (res.status === 402 || /credits|max_tokens/i.test(message)) {
                throw new Error(`OpenRouter credits or token limit issue: ${message}`)
            }

            throw new Error(`${message}`)
        }

        const data = await res.json()
        return data?.choices?.[0]?.message?.content || ""
    } catch (error) {
        throw new Error(`OpenRouter request failed: ${error.message}`)
    }
}
