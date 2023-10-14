#pip install python-dotenv

import openai
import os
from dotenv import load_dotenv

# Load the environment variables from the .env file
load_dotenv("openAI_key.env")

openai.api_key = os.getenv("OPENAI_API_KEY") #pass openai key to the API
with open('chatGPT/prompts/promptV1.txt', 'r', encoding="utf8") as file:
    prompt = file.read().rstrip('\n') #store big character prompt in string

content = [ {"role": "system", "content": prompt} ] 
    
while True: 
    prompt = input("User : ") 
    if prompt: 
        content.append( 
            {"role": "user", "content": prompt}, 
        ) 
        chat = openai.ChatCompletion.create( 
            model="gpt-3.5-turbo", messages=content 
        ) 
    reply = chat.choices[0].message.content 
    print(f"ChatGPT: {reply}") 
    content.append({"role": "assistant", "content": reply}) 