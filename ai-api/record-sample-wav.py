from scipy.io.wavfile import write
import sounddevice as sd
from dotenv import load_dotenv
load_dotenv()

fs = 44100  # Sample rate
seconds = 3  # Duration of recording

myrecording = sd.rec(int(seconds * fs), samplerate=fs, channels=1)
sd.wait()  # Wait until recording is finished
write('prompt.wav', fs, myrecording)
