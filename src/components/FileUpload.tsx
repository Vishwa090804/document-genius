import { Upload, FileText, X } from "lucide-react";
import { useCallback, useState } from "react";

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  file: File | null;
  onClear: () => void;
}

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".txt"];

export default function FileUpload({ onFileSelected, file, onClear }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const isValidFile = (f: File) => {
    return ACCEPTED_TYPES.includes(f.type) || ACCEPTED_EXTENSIONS.some(ext => f.name.toLowerCase().endsWith(ext));
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped && isValidFile(dropped)) onFileSelected(dropped);
    },
    [onFileSelected]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && isValidFile(selected)) onFileSelected(selected);
  };

  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
        <FileText className="h-8 w-8 text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{file.name}</p>
          <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
        </div>
        <button onClick={onClear} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`relative flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-10 transition-all cursor-pointer ${
        isDragging
          ? "border-primary bg-primary/5 shadow-glow"
          : "border-border hover:border-primary/40 hover:bg-muted/50"
      }`}
    >
      <input
        type="file"
        accept=".pdf,.docx,.txt"
        onChange={handleChange}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
      <div className="rounded-full bg-primary/10 p-4">
        <Upload className="h-8 w-8 text-primary" />
      </div>
      <div className="text-center">
        <p className="font-display font-semibold text-foreground">Drop your document here</p>
        <p className="mt-1 text-sm text-muted-foreground">or click to browse · PDF, DOCX, TXT</p>
      </div>
    </div>
  );
}
