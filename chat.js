import openai from './openaiClient.js';
import readline from 'node:readline'



const rl = readline.createInterface({
    input:process.stdin,
    output:process.stdout,
})


const newMessage = async (history,message) => {
    const results = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages:[...history,message],
    })

    return results.choices[0].message
}

const formatMessage = (userInput) => ({ role: 'user', content: userInput })


const chat = () => {
    const history = [
      {
        role: 'system',
        content: `You are a helpful AI assistant. Answer the user's questions to the best of you ability.`,
      },
    ]
    const start = () => {
      rl.question('You: ', async (userInput) => {
        if (userInput.toLowerCase() === 'exit') {
          rl.close()
          return
        }
  
        const userMessage = formatMessage(userInput)
        const response = await newMessage(history, userMessage)
  
        history.push(userMessage, response)
        console.log(`\n\nAI: ${response.content}\n\n`)
        start()
      })
    }
  
    start()
    console.log('\n\nAI: How can I help you today?\n\n')
}
  
  console.log("Chatbot initialized. Type 'exit' to end the chat.")
  chat()