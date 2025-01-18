import base64
from pydub import AudioSegment
import audioop
import io

def convert_mulaw_to_b64(chunk_ulaw):
    b64 = base64.b64encode(chunk_ulaw).decode("utf-8")
    return b64

class AudioConverter:

    def __init__(self):
        self.buffer = b""
        self.state = None

    def convert_mp3_to_b64mulaw(self, chunk):
        # Add the chunk to the buffer
        self.buffer += chunk

        # Try to decode the buffer

        # ###print(len(chunk))

        # if len(chunk) < 10016:
        #     chunk = chunk + b''.join([b'\x00' for i in range(int((10016 - len(chunk))/4))])

        # ###print("NEW:" + str(len(chunk)))

        try:
            audio = AudioSegment.from_file(io.BytesIO(self.buffer), format="mp3")

        except:
            # print("EXCEPTION")
            return None

        # If decoding was successful,  the buffer
        self.buffer = b""

        # Ensure audio is mono
        if audio.channels != 1:
            audio = audio.set_channels(1)

        # Get audio data as bytes
        raw_audio = audio.raw_data

        # Sample rate conversion
        chunk_8khz, self.state = audioop.ratecv(
            raw_audio,
            audio.sample_width,
            audio.channels,
            audio.frame_rate,
            8000,
            self.state,
        )

        # μ-law conversion
        chunk_ulaw = audioop.lin2ulaw(chunk_8khz, audio.sample_width)

        b64 = base64.b64encode(chunk_ulaw).decode("utf-8")

        return b64
    
    def convert_mulaw_to_b64(chunk_ulaw):
        b64 = base64.b64encode(chunk_ulaw).decode("utf-8")
        return b64