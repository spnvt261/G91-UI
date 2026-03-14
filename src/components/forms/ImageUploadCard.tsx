import { useEffect, useState } from "react";

interface ImageUploadCardProps {
  title?: string;
}

const ImageUploadCard = ({ title = "Product Image" }: ImageUploadCardProps) => {
  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setPreview(URL.createObjectURL(file));
  };

  return (
    <section className="rounded-lg bg-white p-4 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-slate-800">{title}</h3>
      <label className="mb-3 inline-flex cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
        Upload image
        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </label>
      <div className="flex h-48 items-center justify-center overflow-hidden rounded-lg border border-dashed border-gray-300 bg-slate-50">
        {preview ? <img src={preview} alt="Preview" className="h-full w-full object-cover" /> : <span className="text-sm text-slate-400">Preview image placeholder</span>}
      </div>
    </section>
  );
};

export default ImageUploadCard;