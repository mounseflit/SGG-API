import requests

url = "https://www.sgg.gov.ma/DesktopModules/MVC/TableListBO/BO/AjaxMethod"

headers = {
    "ModuleId": "2873",
    "TabId": "775",
    "RequestVerificationToken": "",  # Empty token as per your curl command
    "Cookie": ".ASPXANONYMOUS=7yujUKrb58vjlaZktvja5RzJnV-Svo0q_Dqdj4oC9WPvcdMHJ8NChSXyYGIDMcZeslYyFUi9mT_tG3VnjkKp0XcTDKVi7lXzH4hlii_Kw8lTr13U0"
}

response = requests.get(url, headers=headers)

# Print the response status code and content
print(f"Status Code: {response.status_code}")
print(f"Response Content: {response.text}")