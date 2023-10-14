# functions for creating sameple customer, still need to make on function to do all of this, I might put it all in a class. 
import requests

API_KEY = '344fcb27caa92be8e7b7c26b5d230022'
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
def create_finicity_customer(token, api_key, username, first_name, last_name):
    url = 'https://api.finicity.com/aggregation/v2/customers/testing'

    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Finicity-App-Key': api_key,
        'Finicity-App-Token': token,
    }

    data = {
        "username": username,
        "firstName": first_name,
        "lastName": last_name
    }

    response = requests.post(url, headers=headers, json=data)

    if response.status_code == 200:
        customer_info = response.json()
        return customer_info
    else:
        print(f'Error: Unable to create customer. Status code: {response.status_code}')
        return None


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