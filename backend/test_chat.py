import httpx

def test_chat():
    url = "http://127.0.0.1:8000/api/chat"
    payload = {
        "question": "Show me startup news from Maharashtra",
        "state": None
    }
    try:
        r = httpx.post(url, json=payload, timeout=10.0)
        print("Status code:", r.status_code)
        print("Response JSON:")
        import json
        print(json.dumps(r.json(), indent=2))
    except Exception as e:
        print("Error connecting to chat API:", e)

if __name__ == "__main__":
    test_chat()
