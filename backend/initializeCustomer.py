# functions for creating sameple customer, still need to make on function to do all of this, I might put it all in a class. 
import requests
import os
from dotenv import load_dotenv
import random
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


def generate_sample_customer(key, id,  secret, url, username):
    token = getToken(key, secret, id, url)
    customer_data = create_finicity_customer(key, token['token'], username)
    customer_id = customer_data['id']

    link_json = generate_finicity_token(token['token'], key, id, customer_id)
    link = link_json['link']

    
    results_dictionary = {
        'token': token['token'], #this is pretty complicated
        'link': link,
        'customer_id': customer_id
    }

    print(results_dictionary)
    return results_dictionary

customerInt = (random.randint(50,100) * random.randint(25,100) + random.randint(0,500)) * random.randint(1,20) #randomize customer id generation b/c all have to be unique
customer_user = 'customer' + str(customerInt) + "_2023-10-14"
print("customer ID: " + customer_user)

customer_info = generate_sample_customer(API_KEY, partnerId, partnerSecret, url, customer_user)

tempDelay = input('continue?')

token = customer_info['token']
link = customer_info['link']
customer_id = customer_info['customer_id']

accounts_data = get_finicity_accounts(token,API_KEY,customer_id) #return json containing raw data for user-selected accounts
#print(accounts_data) #print full account data json

account_ids = [account['id'] for account in accounts_data['accounts']] #retrieve account ids from da JSON
account_names = [account['name'] for account in accounts_data['accounts']]
balances = [account['balance'] for account in accounts_data['accounts']]
oldestTransactions = [account['oldestTransactionDate'] for account in accounts_data['accounts']]
lastTransactions = [account['lastTransactionDate'] for account in accounts_data['accounts']]

accounts_info = [ #craete accounts_info, list of dictionaries for each account's important data
    {
        'account_id': account['id'],
        'account_name': account['name'],
        'balance': account['balance'],
        'oldest_transaction': account['oldestTransactionDate'],
        'last_transaction': account['lastTransactionDate']
    }
    for account in accounts_data['accounts']
]

numAccounts = len(accounts_info) #set to the number of accounts imported
#-------------------------------------------------------------------------
#at this point all of the relevant data has been retrieved to begin querying data,
#so now it's time to begin extracting actual data from the user's account!
#-------------------------------------------------------------------------------

def getAllCustomerTransactions():
    url = 'https://api.finicity.com/aggregation/v3/customers/{{customerId}}/transactions'

    headers = {
        'Finicity-App-Key': '{{appKey}}',
        'Accept': 'application/json',
        'Finicity-App-Token': '{{appToken}}'
    }

    params = {
        'fromDate': '{{fromDate}}',
        'toDate': '{{toDate}}',
        'includePending': 'true',
        'sort': 'desc',
        'limit': '25'
    }
    
    response = requests.get(url, headers=headers, params=params)

    if response.status_code == 200:
        # Request was successful, and you can work with the response here
        data = response.json()
        print(data)
    else:
        print(f"Request failed with status code {response.status_code}")
        print(response.text)
