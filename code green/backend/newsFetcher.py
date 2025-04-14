import sys
import requests
import json

API_KEY = "0e3944f8227640b0a4c324e0f20faa94"  # Replace with your real key if needed
BASE_URL = "https://newsapi.org/v2/everything"

def get_env_news(query):
    params = {
        "q": query,
        "apiKey": API_KEY,
        "language": "en",
        "pageSize": 10,
        "sortBy": "publishedAt"
    }
    response = requests.get(BASE_URL, params=params)
    return response.json()

if __name__ == "__main__":
    query = sys.argv[1] if len(sys.argv) > 1 else "environment"
    news_data = get_env_news(query)

    # Print error output if the API call fails
    if "articles" not in news_data:
        print(json.dumps({"error": "API call failed", "details": news_data}))
    else:
        print(json.dumps(news_data))
