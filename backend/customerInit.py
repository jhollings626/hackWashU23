# functions for creating sameple customer, still need to make on function to do all of this, I might put it all in a class. 
import requests
import os
import random
from dotenv import load_dotenv
load_dotenv("key.env")

API_KEY = os.getenv("API_KEY")
print(API_KEY)


url = 'https://api.finicity.com/aggregation/v2/partners/authentication'
partnerId = "2445584332755"
partnerSecret = "Hh4x0opoX0xfvN4oJ15y"

#generate token
def getToken(key, secret, id, url):

    headers = {
        'Content-Type': 'application/json',
        'Finicity-App-Key': key,
        'Accept': 'application/json',
    }

    data = {
        "partnerId": id,
        "partnerSecret": secret
    }

    response = requests.post(url, headers=headers, json=data)

    if response.status_code == 200:
        token = response.json()
        return token
    else:
        print(f'Error: Unable to fetch token. Status code: {response.status_code}')
        token = None
        return None

#create sample customer
def create_finicity_customer(app_key, app_token, username):
    url = 'https://api.finicity.com/aggregation/v2/customers/testing'

    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Finicity-App-Key': app_key,
        'Finicity-App-Token': app_token
    }

    data = {
        "username": username
    }

    response = requests.post(url, headers=headers, json=data)

    if response.status_code == 200 or response.status_code == 201:
        print("Request successful.")
        print("Response:", response.json())
        return response.json()
    else:
        print(f"Request failed with status code {response.status_code}.")
        print("Response:", response.text)
    return 0
    



#generate connect link
def generate_finicity_token(api_token, api_key, partner_id, customer_id):
    url = 'https://api.finicity.com/connect/v2/generate'

    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Finicity-App-Token': api_token,
        'Finicity-App-Key': api_key,
    }

    data = {
        "partnerId": partner_id,
        "customerId": customer_id
    }
    
    response = requests.post(url, headers=headers, json=data)
    
    if response.status_code == 200:
        token_info = response.json()
        return token_info
    else:
        print(f'Error: Unable to generate token. Status code: {response.status_code}')
        return None

#combine all into one step
#generate_finicity_token(api_token, api_key, partner_id, customer_id):

def generate_sample_customer(key, id, secret, url, username):
    token = getToken(key, secret, id, url)
    customer_data = create_finicity_customer(key, token['token'], username)

    link_json = generate_finicity_token(token['token'], key, id, customer_data['id'])
    link = link_json['link']

    return link

def get_account_ids(API_KEY,customer_id):
    url = f'https://api.finicity.com/aggregation/v1/customers/{customer_id}/accounts/simple'

    headers = {
        'Authorization': f'Bearer {API_KEY}',
        'Content-Type': f'application/json',
        'Accept': 'application/json'
    }

    response = requests.get(url,headers=headers,json={})

#refresh - necessary to start pulling customer data
def get_finicity_accounts(api_token, api_key, customer_id):
    url = f'https://api.finicity.com/aggregation/v1/customers/{customer_id}/accounts'

    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Finicity-App-Token': api_token,
        'Finicity-App-Key': api_key,
    }

    response = requests.post(url, headers=headers, json={})

    if response.status_code == 200:
        accounts_data = response.json()
        return accounts_data
    else:
        print(f'Error: Unable to fetch accounts data. Status code: {response.status_code}')
        return None




customerInt = (random.randint(50,100) * random.randint(25,100) + random.randint(0,500)) * random.randint(1,5) #randomize customer id generation b/c all have to be unique
customerID = 'customer' + str(customerInt) + "_2023-10-14"
print("customer ID: " + customerID)

link = generate_sample_customer(API_KEY, partnerId, partnerSecret, url, customerID) #generate unique customer link
print(link)
tempCheck = input('continue? ') #basic way to wait for user to login without performing check in pop-up yet

get_finicity_accounts(API_KEY,customerID)
