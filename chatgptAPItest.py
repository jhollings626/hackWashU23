import openai
import os

openai.api_key = os.environ.get('openAI_key')

content = [ {"role": "system", "content":  
              "You are a personal finance assistant. Your job is to condense raw banking data into a digestible, \
                understandable format."} ] 
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