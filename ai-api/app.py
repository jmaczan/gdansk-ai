import json
import uvicorn
from dotenv import load_dotenv
import os
import openai
from google.cloud import texttospeech
from typing import Union, Annotated
from fastapi.responses import FileResponse
from fastapi import FastAPI, Form, UploadFile, Header, Response, status
import tempfile
import logging
import httpx
from google.oauth2 import service_account
from pydantic import BaseModel
from typing import List

app = FastAPI()

limits = httpx.Limits(max_keepalive_connections=5, max_connections=10)
timeout = httpx.Timeout(timeout=5.0, read=15.0)
client = httpx.AsyncClient(limits=limits, timeout=timeout)


@app.on_event("shutdown")
async def shutdown_event():
    print("shutting down...")
    await client.aclose()

load_dotenv()
openai.api_key = os.environ['OPEN_AI_API_KEY']
private_chatbot_api_key = os.environ['CHATBOT_API_KEY']

app = FastAPI()


@app.on_event("startup")
async def startup_event():
    logger = logging.getLogger("uvicorn.access")
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter(
        "%(asctime)s - %(levelname)s - %(message)s"))
    logger.addHandler(handler)


@app.get("/")
def read_root(response: Response, chatbot_api_key: Annotated[Union[str, None], Header()] = None):
    if chatbot_api_key != private_chatbot_api_key:
        response.status_code = status.HTTP_401_UNAUTHORIZED
        return 'Unauthorized'
    print(chatbot_api_key)
    return '😺'


class Item(BaseModel):
    role: str
    content: str


class ItemList(BaseModel):
    items: List[Item]


@app.post("/question")
async def create_upload_file(response: Response, audio: UploadFile, messages: str = Form(...), chatbot_api_key: Annotated[Union[str, None], Header()] = None):
    print("/question")
    if chatbot_api_key != private_chatbot_api_key:
        response.status_code = status.HTTP_401_UNAUTHORIZED
        return 'Unauthorized'
    try:
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
            temp_file.write(await audio.read())
            temp_file_path = temp_file.name

        messages_list = json.loads(messages)
        parsed_messages = []
        for message in messages_list:
            role = message.get('role')
            content = message.get('content')
            parsed_messages.append({"role": role, "content": content})

        audio_file = open(temp_file_path, 'rb')

        transcript = openai.Audio.transcribe(
            "whisper-1", audio_file, language="en")  # You can change language here

        user_prompt = transcript['text']
        if user_prompt == '':
            return FileResponse('empty_question.mp3', media_type="audio/mpeg", filename="empty_question.mp3")

        messages_with_prompt = parsed_messages
        messages_with_prompt.append({"role": "user", "content": user_prompt})

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=messages_with_prompt
        )

        chatbot_response = response.choices[0].message['content']

        google_data = {
            "type": os.environ.get('type'),
            "project_id": os.environ.get('project_id'),
            "private_key_id": os.environ.get('private_key_id'),
            "private_key": os.environ.get('private_key').replace('\\n', '\n'),
            "client_email": os.environ.get('client_email'),
            "client_id": os.environ.get('client_id'),
            "auth_uri": os.environ.get('auth_uri'),
            "token_uri": os.environ.get('token_uri'),
            "auth_provider_x509_cert_url": os.environ.get('auth_provider_x509_cert_url'),
            "client_x509_cert_url": os.environ.get('client_x509_cert_url'),
            "universe_domain": os.environ.get('universe_domain')
        }

        google_credentials = service_account.Credentials.from_service_account_info(
            google_data)

        client = texttospeech.TextToSpeechClient(
            credentials=google_credentials)

        synthesis_input = texttospeech.SynthesisInput(
            text=chatbot_response)

        voice = texttospeech.VoiceSelectionParams(
            language_code="en-US", ssml_gender=texttospeech.SsmlVoiceGender.FEMALE
        )

        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3
        )

        response = client.synthesize_speech(
            input=synthesis_input, voice=voice, audio_config=audio_config
        )

        temp_file_path = "temp.mp3"  # Replace with your desired temporary file path
        with open(temp_file_path, "wb") as file:
            file.write(response.audio_content)

        return FileResponse(temp_file_path, media_type="audio/mpeg", filename="temp.mp3", headers={"chatbot_response": chatbot_response, "user_prompt": user_prompt})
    except Exception:
        return FileResponse('error.mp3', media_type="audio/mpeg", filename="error.mp3")


@app.get("/pregenerated/no_tokens")
def read_root(response: Response, chatbot_api_key: Annotated[Union[str, None], Header()] = None):
    if chatbot_api_key != private_chatbot_api_key:
        response.status_code = status.HTTP_401_UNAUTHORIZED
        return 'Unauthorized'
    return FileResponse('no_tokens.mp3', media_type="audio/mpeg", filename="no_tokens.mp3")


@app.get("/pregenerated/not_logged")
def read_root(response: Response, chatbot_api_key: Annotated[Union[str, None], Header()] = None):
    if chatbot_api_key != private_chatbot_api_key:
        response.status_code = status.HTTP_401_UNAUTHORIZED
        return 'Unauthorized'
    return FileResponse('not_logged.mp3', media_type="audio/mpeg", filename="not_logged.mp3", headers={})


@app.get("/pregenerated/empty_question")
def read_root(response: Response, chatbot_api_key: Annotated[Union[str, None], Header()] = None):
    if chatbot_api_key != private_chatbot_api_key:
        response.status_code = status.HTTP_401_UNAUTHORIZED
        return 'Unauthorized'
    return FileResponse('empty_question.mp3', media_type="audio/mpeg", filename="empty_question.mp3", headers={})


@app.get("/pregenerated/error")
def read_root(response: Response, chatbot_api_key: Annotated[Union[str, None], Header()] = None):
    if chatbot_api_key != private_chatbot_api_key:
        response.status_code = status.HTTP_401_UNAUTHORIZED
        return 'Unauthorized'
    return FileResponse('error.mp3', media_type="audio/mpeg", filename="error.mp3", headers={})


if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=(8080 if os.environ.get(
        'PORT') is None else int(os.environ.get('PORT'))), reload=True)
