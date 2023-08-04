"use client";
import React, { useState, useRef, useContext, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { motion } from "framer-motion";
import Link from 'next/link';
import { Inter } from 'next/font/google';
import { useUser } from '@auth0/nextjs-auth0/client';
import { isUserAuthenticated } from 'lib/auth';
import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';

const inter = Inter({ subsets: ['latin'] })
const AudioContext = React.createContext(undefined);

const AudioProvider = ({ children, bibsAmount, setBibsAmount, systemMessage, messages, setMessages, audioChunksRef, unwantedTopics, unwantedKeywords }: any) => {
  const uploadAudio = async (audioBlob: any) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');

    let systemMessageWithFilteringUnwantedKeywordsAndTopics = systemMessage;
    if (!!unwantedTopics) {
      systemMessageWithFilteringUnwantedKeywordsAndTopics.content += ` You are not allowed to talk about these topics: ${unwantedTopics}.`;
    }

    if (!!unwantedKeywords) {
      systemMessageWithFilteringUnwantedKeywordsAndTopics.content += ` You are not allowed to talk using these words: ${unwantedKeywords}. If you hear these words in a question, tell in response that you don't want to talk about them. `;
    }

    formData.append('messages', JSON.stringify([systemMessageWithFilteringUnwantedKeywordsAndTopics, ...messages]));
    await axios.post('/api/question', formData, { responseType: 'arraybuffer', headers: { "chatbot-api-key": process.env.CHATBOT_API_KEY } })
      // TODO maybe remove chatbot-api-key header from here - it should be passed to api in question.js and it is already done
      .then((response) => {
        audioChunksRef.current = [];

        setMessages([...messages,
        ...(response?.headers?.user_prompt ? [{ "role": "user", "content": response.headers.user_prompt }] : []),
        ...(response?.headers?.chatbot_response ? [{ "role": "assistant", "content": response.headers.chatbot_response }] : [])
        ]);

        const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);

        const audio = new Audio(audioUrl);
        audio.play();
        axios.get('/api/my-tokens')
          .then((response) => {
            setBibsAmount(response.data.tokens);
          })
          .catch((error) => {
            console.log(error);
          });
        // TODO - make api call to retrieve current amount of tokens
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <AudioContext.Provider value={uploadAudio}>
      {children}
    </AudioContext.Provider>
  );
};

export default function Home() {
  const audioChunksRef = useRef([]);

  const [bibsAmount, setBibsAmount] = useState(undefined);
  const [systemMessage, setSystemMessage] = useState({ "role": "system", "content": "You are a robot, which serves as a very friendly teacher to a kid. Explain your responses like the kid is five. Try to be cheerful and playful, but don't exaggerate." });
  const [unwantedTopics, setUnwantedTopics] = useState("violence");
  const [unwantedKeywords, setUnwantedKeywords] = useState("violent");
  const [messages, setMessages] = useState([
    { "role": "user", "content": "Why adults wear suits?" },
    {
      "role": "assistant",
      "content": "Well, maybe they want to look serious! But really I think that sometimes they just have to. Their boss at work tell them to do so."
    }
  ]);

  return (
    <AudioProvider bibsAmount={bibsAmount} setBibsAmount={setBibsAmount} setMessages={setMessages} messages={messages} audioChunksRef={audioChunksRef} systemMessage={systemMessage} unwantedTopics={unwantedTopics} unwantedKeywords={unwantedKeywords}>
      <Page bibsAmount={bibsAmount} setBibsAmount={setBibsAmount} audioChunksRef={audioChunksRef} setUnwantedTopics={setUnwantedTopics} setUnwantedKeywords={setUnwantedKeywords} unwantedTopics={unwantedTopics} unwantedKeywords={unwantedKeywords} />
    </AudioProvider>
  );
}

const Page = ({ bibsAmount, setBibsAmount, audioChunksRef, setUnwantedTopics, setUnwantedKeywords, unwantedKeywords, unwantedTopics }: any) => {
  const [showTip, setShowTip] = useState(true);
  const [recording, setRecording] = useState(false);
  const [playing, setPlaying] = useState(false);
  const mediaRecorderRef = useRef(null);
  const { user, isLoading } = useUser();
  const isAuthenticated = isUserAuthenticated(user);

  const uploadAudio = useContext(AudioContext);

  const startRecording = () => {
    setShowTip(false);
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.onstop = () => { };
        mediaRecorder.ondataavailable = () => { };
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.addEventListener('dataavailable', handleDataAvailable);
        mediaRecorder.start();
        setRecording(true);
      })
      .catch((error) => {
        console.error('Error accessing the microphone');
      });
  };

  const stopRecording = () => {
    const mediaRecorder = mediaRecorderRef.current;

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      setRecording(false);
      mediaRecorder.removeEventListener('dataavailable', handleDataAvailable);
      mediaRecorder.stop();
    }

    setTimeout(() => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      uploadAudio(audioBlob);
    }, 200)
  };

  const handleDataAvailable = (event: any) => {
    audioChunksRef.current.push(event.data);
  };

  const buyIntent = async () => {
    const res = await axios.post('/api/buy-tokens');
    if (res?.data?.redirectUrl) {
      document.location.assign(res.data.redirectUrl);
    }
  }

  useEffect(() => {
    axios.get('/api/my-tokens')
      .then((response) => {
        setBibsAmount(response.data.tokens);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [setBibsAmount]);

  const redirectToSignUp = () => {
    window.location.assign('/api/auth/signup');
  }

  const getNotAuthenticatedVoice = async () => {
    await axios.get('/api/not_logged', { responseType: 'arraybuffer', headers: { "chatbot-api-key": process.env.CHATBOT_API_KEY } })
      // TODO maybe remove chatbot-api-key header from here - it should be passed to api in question.js and it is already done
      .then((response) => {
        const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);

        const audio = new Audio(audioUrl);
        audio.play();
        setPlaying(true);
        setTimeout(() => {
          setPlaying(false);
        }, 9000); // TODO - adjust to response length
      })
      .catch((error) => {
        console.log(error);
      });
  }
  const getNoTokensVoice = async () => {
    await axios.get('/api/no_tokens', { responseType: 'arraybuffer', headers: { "chatbot-api-key": process.env.CHATBOT_API_KEY } })
      // TODO maybe remove chatbot-api-key header from here - it should be passed to api in question.js and it is already done
      .then((response) => {
        const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);

        const audio = new Audio(audioUrl);
        audio.play();
        setPlaying(true);
        setTimeout(() => {
          setPlaying(false);
        }, 9000); // TODO - adjust to response length
      })
      .catch((error) => {
        console.log(error);
      });
  }

  return (
    <main className={`main ${inter.className}`} >
      <div className={'description'}>
        <p>
          {isAuthenticated ? <>I&apos;m happy to chat with&nbsp;
            <code className={'code'}>{user.name === user.email ? 'you' : user.name}</code>!</> : <>Hello ^_^<span className='redirectToSignUp' onClick={redirectToSignUp}>&nbsp;Sign up&nbsp;</span>and have fun with Gdańsk AI!</>}
        </p>
        {(showTip || true) && <div className={'bibsAmount'}>
          <BibsAmount isAuthenticated={isAuthenticated} bibsAmount={bibsAmount} buyIntent={buyIntent} setUnwantedTopics={setUnwantedTopics} setUnwantedKeywords={setUnwantedKeywords} unwantedTopics={unwantedTopics} unwantedKeywords={unwantedKeywords} />
        </div>}
      </div>
      <div className={'center'}>
        <div>
          <motion.div
            animate={recording ? ({ rotate: 360 }) : undefined}
            transition={recording ? ({ repeat: Infinity, repeatDelay: 0.01, duration: 1, repeatType: 'mirror' }) : undefined}
          >
            <Image
              className={'logo'}
              src="/logo4.png"
              alt="Gdańsk AI"
              width={100}
              height={100}
              style={{ borderRadius: '20px', cursor: 'pointer' }}
              onClick={isAuthenticated ? (bibsAmount > 0 ? (!recording ? startRecording : stopRecording) : (!playing ? getNoTokensVoice : undefined)) : (!playing ? getNotAuthenticatedVoice : undefined)}
              priority
            />
          </motion.div>
        </div>
      </div>
      <div className={'bibsAmountMobile'}>
        <BibsAmount isAuthenticated={isAuthenticated} bibsAmount={bibsAmount} buyIntent={buyIntent} setUnwantedTopics={setUnwantedTopics} setUnwantedKeywords={setUnwantedKeywords} unwantedTopics={unwantedTopics} unwantedKeywords={unwantedKeywords} />
      </div>
      {isAuthenticated ? <div>
        <div className='buy-button' onClick={buyIntent}>
          Buy 🧠 bibs here
        </div>
        {/* <script async
          src="https://js.stripe.com/v3/buy-button.js">
        </script>

        {<stripe-buy-button
          buy-button-id="buy_btn_1NBOH7DFtpxMJw9JgHLLfGOq"
          publishable-key="pk_test_51NBNspDFtpxMJw9JPacLeAC9udEXHOYunyV6CpySi1nAtkcozCn0akmCyyH50pYIFhb9fGQ5xPqyKeZ6WftGHgw900X8db6ZUP"
        >
        </stripe-buy-button>} */}
      </div> : null}
      <div className='text-container'>
        <a className='chrome-container' href="https://www.google.com/chrome/" target={"_blank"} rel="noreferrer noopener">I&apos;m available only with Google Chrome yet <img width="20" alt="Google Chrome icon (February 2022)" src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Google_Chrome_icon_%28February_2022%29.svg/512px-Google_Chrome_icon_%28February_2022%29.svg.png" /></a>
      </div>
      <div className={'grid'}>
        <Link href="/terms" target="_blank"
          rel="noopener noreferrer" legacyBehavior={true}>
          <a
            className={'card'}
          >
            <h2>
              <span>-&gt;</span>
            </h2>
            <p className={'black'}>Terms of use, privacy policy and cookies policy</p>
          </a>
        </Link>
        <a
          href="mailto:your@email.com"
          className={'card'}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2>
            <span>-&gt;</span>
          </h2>
          <p className={'black'}>Contact</p>
        </a>
      </div>
      <span className='disclaimer'>I might respond with an incorrect data, since I&apos;m still in an experimental phase. By using Gdańsk AI you agree to terms of use, privacy policy and cookies policy.</span>
    </main>
  )
}

const BibsAmount = ({ isAuthenticated, bibsAmount, buyIntent, setUnwantedTopics, setUnwantedKeywords, unwantedKeywords, unwantedTopics }: any) => isAuthenticated ? <><span className='bigLink bibsAmountNumber' onClick={buyIntent}>🧠 {bibsAmount === undefined ? 'loading bibs...' : `${bibsAmount > 0 ? bibsAmount : 'you have no'} bibs`}</span> <span className={'brand'}>|</span> <ParentalControls setUnwantedTopics={setUnwantedTopics} setUnwantedKeywords={setUnwantedKeywords} unwantedTopics={unwantedTopics} unwantedKeywords={unwantedKeywords} />  <span className={'brand'}>|</span> <Link href='/api/auth/logout' className='bigLink'>Logout</Link></> : <><Link href='/api/auth/signup' className='bigLink'>Sign up</Link> <span className={'brand'}>|</span> <Link href='/api/auth/login' className='bigLink'>Log in</Link></>;

const ParentalControls = ({ setUnwantedTopics, setUnwantedKeywords, unwantedKeywords, unwantedTopics }: any) => (
  <Dialog.Root>
    <Dialog.Trigger asChild>
      <a className="bigLink parentalControlsButton">Parental controls</a>
    </Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay className="DialogOverlay" />
      <Dialog.Content className={`DialogContent ${inter.className}`}>
        <Dialog.Title className="DialogTitle">Parental controls</Dialog.Title>
        <Dialog.Description className="DialogDescription">
          Dear Parent, here you can  decide what content is unwanted in conversations. Separete values with commas, like this: politics, bureaucracy, beer. Click save when you&apos;re done
        </Dialog.Description>
        <fieldset className="Fieldset">
          <label className="Label" htmlFor="keywords">
            Unwanted keywords
          </label>
          <input className="Input" id="keywords" value={unwantedKeywords} onChange={(event) => setUnwantedKeywords(event.target.value)} />
        </fieldset>
        <fieldset className="Fieldset">
          <label className="Label" htmlFor="topics">
            Unwanted topics
          </label>
          <input className="Input" id="topics" value={unwantedTopics} onChange={(event) => setUnwantedTopics(event.target.value)} />
        </fieldset>
        <div style={{ display: 'flex', marginTop: 25, justifyContent: 'flex-end' }}>
          <Dialog.Close asChild>
            <button className="Button green">Save changes</button>
          </Dialog.Close>
        </div>
        <Dialog.Close asChild>
          <button className="IconButton" aria-label="Close">
            <Cross2Icon />
          </button>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);
