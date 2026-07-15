const extractJson = async (text) => {
    if (!text) {
        return null
    }

    try {
        const cleaned = text
            .replace(/```json/gi, "")
            .replace(/```/g, "")
            .trim()

        const firstBrace = cleaned.indexOf('{')
        const closeBrace = cleaned.lastIndexOf('}')

        if (firstBrace === -1 || closeBrace === -1) {
            return null
        }

        const jsonString = cleaned.slice(firstBrace, closeBrace + 1)
        return JSON.parse(jsonString)
    } catch (error) {
        console.error("Failed to parse AI JSON response:", error.message)
        return null
    }
}

export default extractJson