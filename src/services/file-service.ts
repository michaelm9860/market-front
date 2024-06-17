import { filesUrl } from "./base-urls";

const baseUrl = filesUrl;

async function getFile(fileName: string) {
  const res = await fetch(`${baseUrl}/${fileName}`, {
    method: "GET"
  });

  if (!res.ok) {
    throw new Error(JSON.stringify(res.json()));
  }

  const blob = await res.blob();
  const fileUrl = URL.createObjectURL(blob);
  return fileUrl;
}

export const FileService = { getFile };
