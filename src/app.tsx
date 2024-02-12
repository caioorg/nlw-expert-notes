import { ChangeEvent, useState } from "react";
import Logo from "./assets/logo-nlw-expert.svg";
import { NewNoteCard } from "./components/new-note-card";
import { NoteCard } from "./components/note-card";
import { toast } from "sonner"

interface Note {
  id: string;
  date: Date;
  content: string;
}

export function App() {
  const [search, setSearch] = useState("");
  const [notes, setNodes] = useState<Note[]>(() => {
    const notesOnStorage = localStorage.getItem("notes");

    if (notesOnStorage) return JSON.parse(notesOnStorage);
    return [];
  });

  function fnNoteCreated(content: string) {
    const newNote = { id: crypto.randomUUID(), date: new Date(), content };

    const notesArray = [newNote, ...notes];

    setNodes(notesArray);
    localStorage.setItem("notes", JSON.stringify(notesArray));
  }

  function fnNoteDeleted(id: string) {
    const notesArray = notes.filter(note => note.id !== id)

    setNodes(notesArray)
    localStorage.setItem("notes", JSON.stringify(notesArray))
    toast.success("Nota excluída com sucesso!")
  }

  function fnSearch(event: ChangeEvent<HTMLInputElement>) {
    const query = event.target.value;

    setSearch(query);
  }

  const filteredNotes =
    search !== ""
      ? notes.filter((note) =>
          note.content.toLocaleLowerCase().includes(search.toLocaleLowerCase())
        )
      : notes;

  return (
    <div className="mx-auto max-w-6xl my-12 space-y-6 px-5">
      <img src={Logo} alt="NLW Expert" />
      <form className="w-full">
        <input
          type="text"
          placeholder="Busque suas notas..."
          onChange={fnSearch}
          className="w-full bg-transparent text-2xl font-semibold tracking-tight placeholder:text-slate-500 outline-none"
        />
      </form>

      <div className="h-px bg-slate-700" />
      <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 auto-rows-[250px] gap-6 ">
        <NewNoteCard fnNoteCreated={fnNoteCreated} />
        {filteredNotes.length > 0 &&
          filteredNotes.map((note) => <NoteCard key={note.id} note={note} fnNoteDeleted={fnNoteDeleted} />)}
      </div>
    </div>
  );
}
