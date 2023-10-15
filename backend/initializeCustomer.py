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

def getAllCustomerTransactions(API_key, customer_id, token, fromDate, toDate):
    url = f'https://api.finicity.com/aggregation/v3/customers/{customer_id}/transactions'

    headers = {
        'Finicity-App-Key': API_KEY,
        'Accept': 'application/json',
        'Finicity-App-Token': token
    }

    params = {
        'fromDate': fromDate,
        'toDate': toDate,
        'includePending': 'true',
        'sort': 'desc',
    }
    
    response = requests.get(url, headers=headers, params=params)

    if response.status_code == 200: #poll HTTP to verify successful request
        # Request was successful, and you can work with the response here
        data = response.json()
        print(data)
        return data
    else:
        print(f"Request failed with status code {response.status_code}")
        print(response.text)

customerInt = random.randint(10000,999999) #randomize customer id generation b/c all have to be unique
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
#print(accounts_info[1])
#print(accounts_info[1]['oldest_transaction'])
#-------------------------------------------------------------------------
#at this point all of the relevant data has been retrieved to begin querying data,
#so now it's time to begin extracting actual data from the user's account!
#-------------------------------------------------------------------------------

# Initialize a dictionary to store final data for all accounts
all_accounts_final = {}

# Iterate through all accounts in accounts_info
for i, account_info in enumerate(accounts_info):
    # Retrieve transactions data for the current account
    transactions_data = getAllCustomerTransactions(
        API_KEY,
        customer_id,
        token,
        account_info['oldest_transaction'],
        account_info['last_transaction']
    )
    
    # Extract relevant transaction details
    extracted_transactions = [
        {
            'id': transaction['id'],
            'amount': transaction['amount'],
            'account_id': transaction['accountId'],
            'customer_id': transaction['customerId'],
            'status': transaction['status'],
            'description': transaction['description'],
            'transaction_date': transaction['transactionDate'],
            'created_date': transaction['createdDate'],
            'categorization': transaction['categorization'],
            'investment_transaction_type': transaction.get('investmentTransactionType', None)  # Optional field
        }
        for transaction in transactions_data['transactions']
    ]
    
    # Format and store transactions data as a string
    formatted_transactions = ""
    for idx, extracted_transaction in enumerate(extracted_transactions, start=1):
        formatted_transactions += (
            f"\n  Transaction {idx}:\n"
            f"    Amount: {extracted_transaction['amount']}\n"
            f"    Description: {extracted_transaction['description']}\n"
            f"    Transaction Date: {extracted_transaction['transaction_date']}\n"
            f"    Categorization: {extracted_transaction['categorization']}\n"
            f"    Investment Transaction Type: {extracted_transaction['investment_transaction_type']}\n"
        )
    
    # Create a final dictionary for the current account
    account_final = {
        'account_id': account_info['account_id'],
        'account_name': account_info['account_name'],
        'balance': account_info['balance'],
        'formatted_transactions': formatted_transactions  # Add formatted transactions here
    }
    
    # Add the final account dictionary to all_accounts_final using a key like 'account1final', 'account2final', etc.
    all_accounts_final[f'account{i+1}final'] = account_final

# Example: Accessing stored data
with open('backend/fullAccount.txt','w') as f: #write formatted output to txt file for chatgpt interpretation
    f.truncate(0) #reset file from last use
    f.write("Data for " + str(len(all_accounts_final)) + " accounts collected and stored.")
    f.write('\n\n')
    f.write("Transaction History for " + all_accounts_final['account1final']['account_name'] + " account")
    f.write('\n\n')
    f.write("Acccount Balance: " + str(all_accounts_final['account1final']['balance']))
    f.write('\n\n')
    f.write("Account ID: " + all_accounts_final['account1final']['account_id'])
    f.write(all_accounts_final['account1final']['formatted_transactions'])
