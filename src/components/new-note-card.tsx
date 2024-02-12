import * as Dialog from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { ChangeEvent, FormEvent, useState } from "react"
import { toast } from "sonner"

interface NewNoteCardProps {
  fnNoteCreated: (content: string) => void
}

let speechRecognition: SpeechRecognition | null = null

export function NewNoteCard({ fnNoteCreated }: NewNoteCardProps) {
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true)
  const [content, setContent] = useState("")
  const [isRecording, setIsRecording] = useState(false)

  function fnStartEditor() {
    setShouldShowOnboarding(false)
  }

  function fnStartRecording() {
    const isSpeechRecognitionApiAvailable = "SpeechRecognition" in window || "webkitSpeechRecognition" in window

    if (!isSpeechRecognitionApiAvailable) return toast.error("Infelizmente seu navegador não suporta a API de gravação")

    setIsRecording(true)
    setShouldShowOnboarding(false)

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition

    speechRecognition = new SpeechRecognitionAPI()

    speechRecognition.lang = "pt-BR"
    speechRecognition.continuous = true
    speechRecognition.maxAlternatives = 1
    speechRecognition.interimResults = true
    speechRecognition.onresult = (event) => {
      const transcription = Array.from(event.results).reduce((text, result) => {
        return text.concat(result[0].transcript)
      }, "")

      setContent(transcription)
    }
    speechRecognition.onerror = (event) => {
      console.error(event)
    }
    speechRecognition.start()
  }

  function fnStopRecording() {
    setIsRecording(false)

    speechRecognition?.stop()
  }

  function fnContentChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setContent(event.target.value)

    if (event.target.value === "") setShouldShowOnboarding(true)
  }

  function fnSaveNote(event: FormEvent) {
    event.preventDefault()

    if (content === "") return 

    fnNoteCreated(content)
    setContent("")
    setShouldShowOnboarding(true)
    toast.success("Nota criada com sucesso")
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger className="rounded-md flex flex-col bg-slate-700 p-5 gap-y-3 text-left hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-600 outline-none">
        <span className="text-sm font-medium text-slate-200">Adicionar nota</span>
        <p className="text-sm leading-6 text-slate-400">Grave uma nota em áudio que será convertido para texto automaticamente.</p>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="inset-0 fixed bg-black/50" />
          <Dialog.Content className="fixed inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] w-full md:h-[60vh] bg-slate-700 md:rounded-md flex flex-col outline-none overflow-hidden">
          <Dialog.Close className="absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100">
            <X className="size-5" />
          </Dialog.Close>
          <div className="flex flex-1 flex-col gap-3 p-5">
            <span className="text-sm font-medium text-slate-300">
              Adiciona nota
            </span>
            {shouldShowOnboarding ? (
              <p className="text-sm leading-6 text-slate-400">
                Comece <button type="button" onClick={fnStartRecording} className="font-medium text-lime-400 hover:underline">gravando a nota</button> em audio ou se prefirir <button onClick={fnStartEditor} className="font-medium text-lime-400 hover:underline">utilize apenas texto</button>.
              </p>
            ) : (
              <textarea
                autoFocus
                className="text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none"
                onChange={fnContentChange}
                value={content}
              />
            )}
          </div>
          {isRecording ? (
            <button onClick={fnStopRecording} type="button" className="w-full flex items-center justify-center gap-2 bg-slate-900 py-4 text-center text-sm text-slate-300 outline-none font-medium hover:text-slate-100">
              <div className="size-3 rounded-full bg-red-500 animate-pulse" />
              Gravando (clique p/ interromper)
            </button>
          ): (
            <button onClick={fnSaveNote} type="submit" className="w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none font-medium group cursor-pointer">
              Salvar nota
            </button>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}