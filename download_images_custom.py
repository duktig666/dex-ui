import urllib.request
import os

images = [
    {
        "url": "https://based.one/_next/image?url=%2Fhome%2Fprediction-market%2Fpowell.png&w=1200&q=75",
        "path": "public/images/predictions/powell.png"
    },
    {
        "url": "https://based.one/_next/image?url=%2Fhome%2Fprediction-market%2Ftrump.png&w=1200&q=75",
        "path": "public/images/predictions/trump.png"
    },
    {
        "url": "https://based.one/_next/image?url=%2Fmulti-channel%2Ftrade-screen.png%3Fv%3D1&w=3840&q=75",
        "path": "public/images/trading/trading-app.png"
    },
    {
        "url": "https://based.one/_next/image?url=%2Fmulti-channel%2Ftrade-screen.png%3Fv%3D1&w=3840&q=75",
        "path": "public/images/features/trade-screen.png"
    }
]

headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

for img in images:
    try:
        print(f"Downloading {img['path']} form {img['url']}...")
        os.makedirs(os.path.dirname(img['path']), exist_ok=True)
        req = urllib.request.Request(img['url'], headers=headers)
        with urllib.request.urlopen(req) as response, open(img['path'], 'wb') as out_file:
            data = response.read()
            out_file.write(data)
        print("Success")
    except Exception as e:
        print(f"Failed: {e}")
