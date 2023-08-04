`pip-compile pyproject.toml`
`pip install -r requirements.txt`
optionally on pip-tools error:
`python -m pip uninstall pip-tools`
`pip install pip-tools`
repeat


`stripe listen --forward-to localhost:8080/webhook`

# FastAPI on Vercel Example

This is a [FastAPI](https://fastapi.tiangolo.com/) example app deployed on [Vercel](https://vercel.com/).
Read more about using Python at Vercel [here](https://vercel.com/docs/concepts/functions/serverless-functions/runtimes/python#)

![imagen](https://github.com/marcorichetta/fastapi-vercel/assets/19599150/7a48c145-9aa5-4225-a068-4cececcb6dae)

### Requirements

-   Vercel account
-   Python 3.9 [Supported version at Vercel](https://vercel.com/docs/concepts/functions/serverless-functions/runtimes/python#python-version)
-   Vercel CLI (Optional)

### Setup

1. `git clone && cd fastapi-vercel`
1. _(Recommended)_ Create a virtual environment and activate it

```bash
python -m venv env

source env/bin/activate
```

1. Install dependencies

```bash
pip install -r requirements.txt
```

1. Run it!

```bash
uvicorn main:app --reload
```

1. Deploy to Vercel

```bash
vercel
# or
git push # on main
```
